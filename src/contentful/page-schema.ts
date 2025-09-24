// Custom Static Page schema based on the provided JSON
// This represents the main page that will contain all the AI-generated components

export const CONTENTFUL_PAGE_SCHEMA = {
  contentTypeId: 'customStaticPage',
  name: '[SP] Custom Static Page',
  description: 'Static page with customizable sections',
  displayField: 'title',

  fields: {
    parentPage: {
      id: 'parentPage',
      name: 'Parent Page',
      type: 'Link',
      localized: false,
      required: false,
      linkType: 'Entry',
      aiGenerated: false,
      description: 'Parent page reference',
    },

    urlPath: {
      id: 'urlPath',
      name: 'URL Path',
      type: 'Symbol',
      localized: true,
      required: true,
      validations: [
        { unique: true },
        {
          regexp: {
            pattern: '^(\\/.*\\/|\\/)$',
          },
          message: 'URL must begin and end with a /',
        },
      ],
      aiGenerated: true,
      description: 'URL path for the page',
    },

    title: {
      id: 'title',
      name: 'Meta: Title',
      type: 'Symbol',
      localized: true,
      required: true,
      validations: [
        {
          size: { max: 80 },
        },
      ],
      aiGenerated: true,
      description: 'SEO title for the page',
    },

    description: {
      id: 'description',
      name: 'Meta: Description',
      type: 'Symbol',
      localized: true,
      required: true,
      aiGenerated: true,
      description: 'SEO meta description',
    },

    canonical: {
      id: 'canonical',
      name: 'Meta: Canonical',
      type: 'Symbol',
      localized: true,
      required: false,
      aiGenerated: false,
      description: 'Canonical URL',
    },

    noIndex: {
      id: 'noIndex',
      name: 'Meta: No Index',
      type: 'Boolean',
      localized: true,
      required: false,
      aiGenerated: false,
      description: 'Prevent search engine indexing',
    },

    noFollow: {
      id: 'noFollow',
      name: 'Meta: No Follow',
      type: 'Boolean',
      localized: true,
      required: false,
      aiGenerated: false,
      description: 'Prevent search engines from following links',
    },

    keywords: {
      id: 'keywords',
      name: 'Meta: Keywords',
      type: 'Symbol',
      localized: false,
      required: false,
      aiGenerated: true,
      description: 'SEO keywords (from AI input)',
    },

    sections: {
      id: 'sections',
      name: 'Sections',
      type: 'Array',
      localized: false,
      required: false,
      items: {
        type: 'Link',
        linkType: 'Entry',
        validations: [
          {
            linkContentType: [
              'spHero',
              'spFaQs',
              'spTwoColumnComponent',
              // ... other component types
            ],
          },
        ],
      },
      aiGenerated: false, // We populate this with component IDs
      description: 'Array of component references',
    },

    localizedSections: {
      id: 'localizedSections',
      name: 'Localized Sections',
      type: 'Array',
      localized: true,
      required: false,
      items: {
        type: 'Link',
        linkType: 'Entry',
        validations: [
          {
            linkContentType: [
              'spHero',
              'spFaQs',
              'spTwoColumnComponent',
              // ... other component types
            ],
          },
        ],
      },
      aiGenerated: false,
      description: 'Localized component references',
    },

    showModalsFromAncestorPages: {
      id: 'showModalsFromAncestorPages',
      name: 'Show Modals from ancestor pages',
      type: 'Boolean',
      localized: false,
      required: true,
      defaultValue: false,
      aiGenerated: false,
      description: 'Inherit modals from parent pages',
    },

    publishedAt: {
      id: 'publishedAt',
      name: 'publishedAt',
      type: 'Symbol',
      localized: false,
      required: false,
      aiGenerated: false,
      description: 'Publication timestamp',
    },
  },

  // Mapping AI topic/content to page fields
  aiFieldMapping: {
    topic: 'title', // AI topic -> page title
    // URL will be generated from topic
    // Description will be generated from topic
  },

  // Fields that AI can generate
  aiGeneratedFields: ['title', 'description', 'urlPath'],

  // Required fields for page creation
  requiredFields: [
    'title',
    'description',
    'urlPath',
    'showModalsFromAncestorPages',
  ],

  // Default values for non-AI fields
  defaultValues: {
    showModalsFromAncestorPages: false,
    noIndex: false,
    noFollow: false,
  },

  // Localized fields
  localizedFields: [
    'urlPath',
    'title',
    'description',
    'canonical',
    'noIndex',
    'noFollow',
    'localizedSections',
  ],

  // Field validation rules
  validation: {
    title: {
      minLength: 10,
      maxLength: 80,
      required: true,
    },
    description: {
      minLength: 50,
      maxLength: 160,
      required: true,
    },
    urlPath: {
      required: true,
      pattern: '^(\\/.*\\/|\\/)$',
    },
  },
};

// Helper to generate URL path from main keywords
export function generateUrlPath(mainKeywords: string): string {
  // Fallback if mainKeywords is undefined or empty
  const safeKeywords = mainKeywords || 'page';

  return `/${
    safeKeywords
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }/`;
}

// Helper to generate meta description from main keywords and secondary keywords
export function generateMetaDescription(
  mainKeywords: string,
  secondaryKeywords?: string,
): string {
  // Fallback if mainKeywords is undefined or empty
  const safeMainKeywords = mainKeywords || 'our services';

  if (!secondaryKeywords || secondaryKeywords.trim() === '') {
    return `Discover ${safeMainKeywords.toLowerCase()}. Professional services designed to meet your needs.`;
  }

  const secondaryKeywordArray = secondaryKeywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0)
    .slice(0, 3);

  if (secondaryKeywordArray.length === 0) {
    return `Discover ${safeMainKeywords.toLowerCase()}. Professional services designed to meet your needs.`;
  }

  return `Discover ${safeMainKeywords.toLowerCase()} with ${secondaryKeywordArray.join(', ')}. Professional services designed to meet your needs.`;
}

export default CONTENTFUL_PAGE_SCHEMA;
