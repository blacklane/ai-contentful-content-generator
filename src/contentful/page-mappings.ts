import {
  CONTENTFUL_PAGE_SCHEMA,
  generateMetaDescription,
  generateUrlPath,
} from './page-schema';

// AI Generated data structure for page
export interface AIGeneratedPageData {
  mainKeywords: string;
  secondaryKeywords: string;
  language: string;
  metaTitle?: string;
  metaDescription?: string;
  generatedSections: Array<{
    type: string;
    [key: string]: any;
  }>;
}

// Transform AI generated data to Contentful page format
export function mapAIDataToContentfulPage(
  aiData: AIGeneratedPageData,
  componentIds: string[], // IDs of created components
  locale: string = 'en-US',
): any {
  console.log('🔍 Mapping AI data to page:', {
    mainKeywords: aiData.mainKeywords,
    secondaryKeywords: aiData.secondaryKeywords,
    language: aiData.language,
    sectionsCount: aiData.generatedSections?.length || 0,
    componentIds: componentIds.length,
  });

  const contentfulEntry: any = {
    fields: {},
  };

  // Use AI-generated meta title or fallback to main keywords
  contentfulEntry.fields.title = {
    [locale]: aiData.metaTitle || aiData.mainKeywords,
  };

  // Use AI-generated meta description or fallback to generated one
  contentfulEntry.fields.description = {
    [locale]:
      aiData.metaDescription ||
      generateMetaDescription(aiData.mainKeywords, aiData.secondaryKeywords),
  };

  // Generate URL path
  contentfulEntry.fields.urlPath = {
    [locale]: generateUrlPath(aiData.mainKeywords),
  };

  // Add component references to sections
  if (componentIds.length > 0) {
    contentfulEntry.fields.sections = {
      [locale]: componentIds.map(id => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id,
        },
      })),
    };
  }

  // Set required defaults
  contentfulEntry.fields.showModalsFromAncestorPages = {
    [locale]: CONTENTFUL_PAGE_SCHEMA.defaultValues.showModalsFromAncestorPages,
  };

  // Set optional defaults
  contentfulEntry.fields.noIndex = {
    [locale]: CONTENTFUL_PAGE_SCHEMA.defaultValues.noIndex,
  };

  contentfulEntry.fields.noFollow = {
    [locale]: CONTENTFUL_PAGE_SCHEMA.defaultValues.noFollow,
  };

  // Add publication timestamp
  contentfulEntry.fields.publishedAt = {
    [locale]: new Date().toISOString(),
  };

  console.log(
    '📄 Generated page entry:',
    JSON.stringify(contentfulEntry, null, 2),
  );

  return contentfulEntry;
}

// Validation function for page entry
export function validateContentfulPageEntry(
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
  CONTENTFUL_PAGE_SCHEMA.requiredFields.forEach(field => {
    if (
      !entry.fields[field] ||
      entry.fields[field][locale] === undefined ||
      entry.fields[field][locale] === null
    ) {
      missingFields.push(field);
    }
  });

  // Validate title length
  const title = entry.fields.title?.[locale];
  if (title && title.length > 80) {
    errors.push('Title exceeds 80 characters');
  }

  // Validate URL path format
  const urlPath = entry.fields.urlPath?.[locale];
  if (urlPath && !urlPath.match(/^(\/.*\/|\/)$/)) {
    errors.push('URL path must begin and end with /');
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

// Helper to get page entry metadata
export function getPageEntryMetadata(
  aiData: AIGeneratedPageData,
  componentIds: string[],
  locale: string = 'en-US',
) {
  return {
    contentTypeId: CONTENTFUL_PAGE_SCHEMA.contentTypeId,
    locale,
    generatedFrom: 'AI',
    originalAIData: aiData,
    componentIds,
    mappingVersion: '1.0.0',
    timestamp: new Date().toISOString(),
  };
}
