// Contentful Components Configuration
// This file defines all available components and their detailed structure

export interface FieldSchema {
  type: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  description?: string;
  aiGenerated?: boolean;
  default?: any;
  enum?: string[];
  properties?: Record<string, FieldSchema>;
  itemSchema?: Record<string, FieldSchema>;
}

export interface ComponentConfig {
  name: string;
  description: string;
  icon: string;
  recommended: boolean;
  category: string;
  schema: Record<string, FieldSchema>;
  example: Record<string, any>;
}

export interface ContentfulComponents {
  [key: string]: ComponentConfig;
}

export const CONTENTFUL_COMPONENTS: ContentfulComponents = {
  hero: {
    name: 'Hero Component',
    description: 'Main hero section with headline, image, and call-to-action',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    recommended: false,
    category: 'header',
    // Schema based on real Contentful Hero structure
    schema: {
      heading: {
        type: 'string',
        required: true,
        minLength: 10,
        maxLength: 80,
        description: 'Main hero headline',
        aiGenerated: true,
      },
      imageUrl: {
        type: 'media',
        required: false,
        description: 'Hero background image or video',
        aiGenerated: false,
        default: null,
      },
      showTrustpilotWidget: {
        type: 'boolean',
        required: false,
        description: 'Display Trustpilot widget',
        aiGenerated: false,
        default: false,
      },
      showBookingWidget: {
        type: 'boolean',
        required: false,
        description: 'Display booking widget',
        aiGenerated: false,
        default: false,
      },
      isHourly: {
        type: 'boolean',
        required: false,
        description: 'Hourly service flag',
        aiGenerated: false,
        default: false,
      },
      cta: {
        type: 'boolean',
        required: false,
        description: 'Show CTA button',
        aiGenerated: false,
        default: true,
      },
      ctaText: {
        type: 'string',
        required: false,
        minLength: 5,
        maxLength: 30,
        description: 'Call-to-action button text',
        aiGenerated: true,
      },
      ctaTargetLink: {
        type: 'string',
        required: false,
        maxLength: 500,
        description: 'CTA button target URL',
        aiGenerated: true,
      },
      imageAltText: {
        type: 'string',
        required: false,
        minLength: 10,
        maxLength: 125,
        description: 'Alt text for hero image',
        aiGenerated: true,
      },
      onlyVideo: {
        type: 'boolean',
        required: false,
        description: 'Use only video content',
        aiGenerated: false,
        default: false,
      },
      videoSources: {
        type: 'media-array',
        required: false,
        description: 'Video source files',
        aiGenerated: false,
        default: [],
      },
      temporaryUrl: {
        type: 'string',
        required: false,
        description: 'Temporary URL for testing',
        aiGenerated: false,
        default: '',
      },
      hideImageOnMobile: {
        type: 'boolean',
        required: false,
        description: 'Hide image on mobile devices',
        aiGenerated: false,
        default: false,
      },
      imageFocus: {
        type: 'string',
        required: false,
        maxLength: 50,
        description: 'Image focus point',
        aiGenerated: false,
        default: 'center',
      },
      liftStatus: {
        type: 'string',
        required: false,
        maxLength: 50,
        description: 'Lift service status',
        aiGenerated: false,
        default: '',
      },
    },
    // Example for AI generation - only generates what it can
    example: {
      type: 'hero',
      heading: 'Transform Your Business with Premium Transportation',
      imageUrl: null,
      showTrustpilotWidget: false,
      showBookingWidget: true,
      isHourly: false,
      cta: true,
      ctaText: 'Book Your Ride',
      ctaTargetLink: '/booking',
      imageAltText:
        'Professional chauffeur opening luxury car door for business client',
      onlyVideo: false,
      videoSources: [],
      temporaryUrl: '',
      hideImageOnMobile: false,
      imageFocus: 'center',
      liftStatus: '',
    },
  },

  faqs: {
    name: 'FAQs',
    description: 'Frequently asked questions section',
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    recommended: false,
    category: 'support',
    schema: {
      title: {
        type: 'string',
        required: false,
        maxLength: 50,
        default: 'Frequently Asked Questions',
        description: 'Section title',
      },
      items: {
        type: 'array',
        required: true,
        minItems: 1,
        maxItems: 12,
        description: 'List of questions and answers',
        itemSchema: {
          question: {
            type: 'string',
            required: true,
            minLength: 10,
            maxLength: 150,
            description: 'The frequently asked question',
          },
          answer: {
            type: 'string',
            required: true,
            minLength: 20,
            maxLength: 500,
            description: 'Comprehensive answer to the question',
          },
        },
      },
    },
    example: {
      type: 'faqs',
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'How quickly can I get started with your platform?',
          answer:
            'You can be up and running in less than 5 minutes. Simply sign up, verify your email, and follow our guided onboarding process.',
        },
        {
          question: 'What kind of customer support do you provide?',
          answer:
            'We offer 24/7 customer support via chat, email, and phone. Our expert team is always ready to help you succeed.',
        },
        {
          question: 'Is there a free trial available?',
          answer:
            'Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.',
        },
      ],
    },
  },

  seoText: {
    name: 'SEO Text + Image',
    description: 'SEO-optimized content blocks with images',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    recommended: false,
    category: 'content',
    schema: {
      content: {
        type: 'object',
        required: true,
        description: 'SEO text content object',
        properties: {
          title: {
            type: 'string',
            required: true,
            minLength: 10,
            maxLength: 80,
            description: 'SEO-optimized section title',
          },
          description: {
            type: 'string',
            required: true,
            minLength: 100,
            maxLength: 1000,
            description: 'Rich content text with keyword optimization',
          },
          imageAltText: {
            type: 'string',
            required: false,
            minLength: 10,
            maxLength: 125,
            description: 'SEO-optimized image alt text',
          },
          imagePosition: {
            type: 'string',
            required: false,
            enum: ['left', 'right'],
            default: 'right',
            description: 'Image placement relative to text',
          },
          shortDescription: {
            type: 'string',
            required: false,
            maxLength: 400,
            description: 'Short description for small photo text',
          },
        },
      },
    },
    example: {
      type: 'seoText',
      content: {
        title: 'Revolutionize Your Business Operations Today',
        description:
          'Discover how our cutting-edge platform transforms the way modern businesses operate. With advanced automation, intelligent analytics, and seamless integrations, you can streamline workflows, reduce operational costs, and accelerate growth. Join thousands of satisfied customers who have already experienced the power of our comprehensive business solution.',
        imageAltText:
          'Modern office environment showing digital transformation in action',
        imagePosition: 'right',
        shortDescription:
          'Transform your business with our cutting-edge platform and advanced automation tools.',
      },
    },
  },
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Helper function to get component schema
export function getComponentSchema(
  componentType: string,
): Record<string, FieldSchema> | null {
  return CONTENTFUL_COMPONENTS[componentType]?.schema || null;
}

// Helper function to get component example
export function getComponentExample(
  componentType: string,
): Record<string, any> | null {
  return CONTENTFUL_COMPONENTS[componentType]?.example || null;
}

// Helper function to validate component data against schema
export function validateComponentData(
  componentType: string,
  data: Record<string, any>,
): ValidationResult {
  const schema = getComponentSchema(componentType);
  if (!schema) {
    return { valid: false, errors: ['Unknown component type'] };
  }

  const errors: string[] = [];

  // Basic validation logic (can be extended)
  Object.entries(schema).forEach(([fieldName, fieldSchema]) => {
    const value = data[fieldName];

    if (
      fieldSchema.required &&
      (!value || (typeof value === 'string' && value.trim() === ''))
    ) {
      errors.push(`${fieldName} is required`);
    }

    if (value && fieldSchema.type === 'string') {
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        errors.push(
          `${fieldName} must be at least ${fieldSchema.minLength} characters`,
        );
      }
      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        errors.push(
          `${fieldName} must not exceed ${fieldSchema.maxLength} characters`,
        );
      }
    }

    if (value && fieldSchema.type === 'array') {
      if (fieldSchema.minItems && value.length < fieldSchema.minItems) {
        errors.push(
          `${fieldName} must have at least ${fieldSchema.minItems} items`,
        );
      }
      if (fieldSchema.maxItems && value.length > fieldSchema.maxItems) {
        errors.push(
          `${fieldName} must not exceed ${fieldSchema.maxItems} items`,
        );
      }
    }
  });

  return { valid: errors.length === 0, errors };
}
