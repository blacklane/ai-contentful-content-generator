import {
  AIGeneratedSEOTextSection,
  CONTENTFUL_SEO_TEXT_SCHEMA,
} from './seo-text-schema';

// Transform AI generated SEO text to Contentful SEO Text Component
export function mapAISEOTextToContentful(
  aiSEOTextSection: AIGeneratedSEOTextSection,
  defaultImageAssetId: string,
  locale: string = 'en-US',
): any {
  const seoTextEntry: any = {
    fields: {},
  };

  const content = aiSEOTextSection.content;

  // Set title (required, localized)
  seoTextEntry.fields.title = {
    [locale]: content.title,
  };

  // Set description (optional, localized)
  if (content.description) {
    seoTextEntry.fields.description = {
      [locale]: content.description,
    };
  }

  // Set image position (required, not localized)
  seoTextEntry.fields.imageOn = {
    [locale]:
      content.imagePosition || CONTENTFUL_SEO_TEXT_SCHEMA.defaultValues.imageOn,
  };

  // Set image alt text (optional, localized)
  if (content.imageAltText) {
    seoTextEntry.fields.imageAltText = {
      [locale]: content.imageAltText,
    };
  }

  // Set small photo text (optional, localized)
  if (content.shortDescription) {
    seoTextEntry.fields.smallPhotoText = {
      [locale]: content.shortDescription.substring(0, 400), // Respect validation limit
    };
  }

  // Set default image (optional)
  seoTextEntry.fields.imageUrl = {
    [locale]: {
      sys: {
        type: 'Link',
        linkType: 'Asset',
        id: defaultImageAssetId,
      },
    },
  };

  // Set required boolean fields with defaults
  seoTextEntry.fields.isFrame = {
    [locale]: CONTENTFUL_SEO_TEXT_SCHEMA.defaultValues.isFrame,
  };

  seoTextEntry.fields.isThicker = {
    [locale]: CONTENTFUL_SEO_TEXT_SCHEMA.defaultValues.isThicker,
  };

  // Set optional fields with defaults
  seoTextEntry.fields.smallPhotoTextBlock = {
    [locale]: CONTENTFUL_SEO_TEXT_SCHEMA.defaultValues.smallPhotoTextBlock,
  };

  seoTextEntry.fields.anchorElementId = {
    [locale]: CONTENTFUL_SEO_TEXT_SCHEMA.defaultValues.anchorElementId,
  };

  seoTextEntry.fields.isVideo = {
    [locale]: CONTENTFUL_SEO_TEXT_SCHEMA.defaultValues.isVideo,
  };

  console.log(
    '📝 SEO Text component entry:',
    JSON.stringify(seoTextEntry, null, 2),
  );

  return seoTextEntry;
}

// Validate SEO Text entry
export function validateSEOTextEntry(
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
  CONTENTFUL_SEO_TEXT_SCHEMA.requiredFields.forEach(field => {
    if (
      !entry.fields[field] ||
      entry.fields[field][locale] === undefined ||
      entry.fields[field][locale] === null
    ) {
      missingFields.push(field);
    }
  });

  // Validate imageOn field values
  if (entry.fields.imageOn?.[locale]) {
    const imageOn = entry.fields.imageOn[locale];
    if (!['left', 'right'].includes(imageOn)) {
      errors.push(`imageOn must be 'left' or 'right', got: ${imageOn}`);
    }
  }

  // Validate smallPhotoText length
  if (entry.fields.smallPhotoText?.[locale]) {
    const textLength = entry.fields.smallPhotoText[locale].length;
    if (textLength > 400) {
      errors.push(`smallPhotoText exceeds 400 characters: ${textLength}`);
    }
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

// Helper to get SEO Text metadata
export function getSEOTextEntryMetadata(
  aiSEOTextSection: AIGeneratedSEOTextSection,
  locale: string = 'en-US',
) {
  return {
    contentTypeId: CONTENTFUL_SEO_TEXT_SCHEMA.contentTypeId,
    locale,
    generatedFrom: 'AI',
    originalAIData: aiSEOTextSection,
    mappingVersion: '1.0.0',
    timestamp: new Date().toISOString(),
  };
}
