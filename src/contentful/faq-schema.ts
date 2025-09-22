// FAQ Component schema based on the provided JSON
// Note: FAQ uses array of Accordion Item components

export const CONTENTFUL_FAQ_SCHEMA = {
  contentTypeId: 'spFaQs',
  name: '[SP] FAQs',
  description: 'FAQ component for static pages',
  displayField: 'name',

  fields: {
    title: {
      id: 'title',
      name: 'Title',
      type: 'Symbol',
      localized: true,
      required: true,
      aiGenerated: true,
      description: 'FAQ section title',
    },

    image: {
      id: 'image',
      name: 'Image',
      type: 'Link',
      localized: false,
      required: true,
      linkType: 'Asset',
      validations: [
        {
          linkMimetypeGroup: ['image'],
        },
        {
          assetFileSize: {
            min: null,
            max: 20971520, // 20MB
          },
        },
      ],
      aiGenerated: false,
      description: 'FAQ section image',
    },

    questions: {
      id: 'questions',
      name: 'Questions',
      type: 'Array',
      localized: true,
      required: true,
      validations: [
        {
          size: {
            min: 3,
            max: 12,
          },
        },
      ],
      items: {
        type: 'Link',
        linkType: 'Entry',
        validations: [
          {
            linkContentType: ['spAccordionItem'],
          },
        ],
      },
      aiGenerated: false, // We populate this with Accordion Item IDs
      description: 'Array of FAQ question references',
    },

    name: {
      id: 'name',
      name: 'Name',
      type: 'Symbol',
      localized: false,
      required: true,
      aiGenerated: true,
      description: 'FAQ component name',
    },

    lilt_status: {
      id: 'lilt_status',
      name: 'Lilt Status',
      type: 'Symbol',
      localized: false,
      required: false,
      omitted: true,
      aiGenerated: false,
      description: 'Lilt translation status',
    },
  },

  // Fields that AI can generate
  aiGeneratedFields: ['title', 'name'],

  // Required fields for component creation
  requiredFields: ['title', 'image', 'questions', 'name'],

  // Default values
  defaultValues: {
    name: 'FAQ Section',
    title: 'Frequently Asked Questions',
  },

  // Localized fields
  localizedFields: ['title', 'questions'],
};

// Accordion Item schema (sub-component for FAQ)
export const CONTENTFUL_ACCORDION_SCHEMA = {
  contentTypeId: 'spAccordionItem',
  name: '[SP] Accordion Item',
  description: 'Individual FAQ question and answer',

  fields: {
    title: {
      id: 'title',
      name: 'Title',
      type: 'Symbol',
      localized: true,
      required: true,
      aiGenerated: true,
      description: 'FAQ question as title',
    },

    content: {
      id: 'content',
      name: 'Content',
      type: 'RichText',
      localized: true,
      required: true,
      aiGenerated: true,
      description: 'FAQ answer as rich text content',
    },

    lilt_status: {
      id: 'lilt_status',
      name: 'Lilt Status',
      type: 'Symbol',
      localized: false,
      required: false,
      omitted: true,
      aiGenerated: false,
      description: 'Lilt translation status',
    },
  },

  // Mapping AI FAQ items to Accordion fields
  aiFieldMapping: {
    question: 'title',
    answer: 'content',
  },

  // Fields that AI can generate
  aiGeneratedFields: ['title', 'content'],

  // Required fields
  requiredFields: ['title', 'content'],

  // Localized fields
  localizedFields: ['title', 'content'],
};

// AI Generated FAQ structure
export interface AIGeneratedFAQ {
  question: string;
  answer: string;
}

export interface AIGeneratedFAQSection {
  type: 'faqs';
  title?: string;
  items: AIGeneratedFAQ[];
}

export default CONTENTFUL_FAQ_SCHEMA;
