import {
  AIGeneratedFAQ,
  AIGeneratedFAQSection,
  CONTENTFUL_ACCORDION_SCHEMA,
  CONTENTFUL_FAQ_SCHEMA,
} from './faq-schema';

// Transform AI generated FAQ to Accordion Item
export function mapAIFAQToAccordion(
  aiFAQ: AIGeneratedFAQ,
  locale: string = 'en-US',
): any {
  const accordionEntry: any = {
    fields: {},
  };

  // Map question to title (required, localized)
  accordionEntry.fields.title = {
    [locale]: aiFAQ.question,
  };

  // Map answer to content as RichText (required, localized)
  accordionEntry.fields.content = {
    [locale]: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: aiFAQ.answer,
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
  };

  return accordionEntry;
}

// Transform AI generated FAQ section to FAQ component
export function mapAIFAQsToContentful(
  aiFAQSection: AIGeneratedFAQSection,
  accordionItemIds: string[],
  defaultImageAssetId: string,
  locale: string = 'en-US',
): any {
  const faqEntry: any = {
    fields: {},
  };

  // Set title (required, localized)
  faqEntry.fields.title = {
    [locale]: aiFAQSection.title || CONTENTFUL_FAQ_SCHEMA.defaultValues.title,
  };

  // Set name (required, not localized)
  faqEntry.fields.name = {
    [locale]: CONTENTFUL_FAQ_SCHEMA.defaultValues.name,
  };

  // Set default image (required)
  faqEntry.fields.image = {
    [locale]: {
      sys: {
        type: 'Link',
        linkType: 'Asset',
        id: defaultImageAssetId,
      },
    },
  };

  // Set accordion item references (required, localized)
  if (accordionItemIds.length > 0) {
    faqEntry.fields.questions = {
      [locale]: accordionItemIds.map(id => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id,
        },
      })),
    };
  } else {
    // Fallback if no accordion items created
    faqEntry.fields.questions = {
      [locale]: [],
    };
  }

  console.log(
    '❓ FAQ component entry (simplified):',
    JSON.stringify(faqEntry, null, 2),
  );

  return faqEntry;
}

// Validate Accordion Item entry
export function validateAccordionEntry(
  entry: any,
  locale: string = 'en-US',
): {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
} {
  const missingFields: string[] = [];
  const errors: string[] = [];

  // Check required fields
  CONTENTFUL_ACCORDION_SCHEMA.requiredFields.forEach(field => {
    if (
      !entry.fields[field] ||
      entry.fields[field][locale] === undefined ||
      entry.fields[field][locale] === null
    ) {
      missingFields.push(field);
      return;
    }

    // Special validation for title (string)
    if (field === 'title' && typeof entry.fields[field][locale] === 'string') {
      if (entry.fields[field][locale].trim() === '') {
        missingFields.push(field);
      }
    }

    // Special validation for content (RichText object)
    if (
      field === 'content' &&
      typeof entry.fields[field][locale] === 'object'
    ) {
      if (!entry.fields[field][locale].nodeType) {
        missingFields.push(field);
      }
    }
  });

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

// Validate FAQ entry
export function validateFAQEntry(
  entry: any,
  locale: string = 'en-US',
): {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
} {
  const missingFields: string[] = [];
  const errors: string[] = [];

  // Check required fields
  CONTENTFUL_FAQ_SCHEMA.requiredFields.forEach(field => {
    if (
      !entry.fields[field] ||
      entry.fields[field][locale] === undefined ||
      entry.fields[field][locale] === null
    ) {
      missingFields.push(field);
    }
  });

  // Validate questions array
  if (entry.fields.questions?.[locale]) {
    const questionsCount = entry.fields.questions[locale].length;
    if (questionsCount < 3) {
      errors.push('FAQ must have at least 3 questions');
    }
    if (questionsCount > 12) {
      errors.push('FAQ cannot have more than 12 questions');
    }
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

// Helper to get FAQ metadata
export function getFAQEntryMetadata(
  aiFAQSection: AIGeneratedFAQSection,
  accordionItemIds: string[],
  locale: string = 'en-US',
) {
  return {
    contentTypeId: CONTENTFUL_FAQ_SCHEMA.contentTypeId,
    accordionContentTypeId: CONTENTFUL_ACCORDION_SCHEMA.contentTypeId,
    locale,
    generatedFrom: 'AI',
    originalAIData: aiFAQSection,
    accordionItemIds,
    questionCount: accordionItemIds.length,
    mappingVersion: '1.0.0',
    timestamp: new Date().toISOString(),
  };
}
