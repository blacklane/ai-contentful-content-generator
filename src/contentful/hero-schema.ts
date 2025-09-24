// Updated Hero Component schema that matches real Contentful spHero content type
// Based on the JSON schema provided by the user

export const CONTENTFUL_HERO_SCHEMA = {
  contentTypeId: 'spHero',
  name: '[SP] Hero Component',
  description: 'Hero component for the new static pages',
  displayField: 'name',

  fields: {
    name: {
      id: 'name',
      name: 'Heading',
      type: 'Symbol',
      localized: true,
      required: true,
      validations: [],
      defaultValue: ' ', // Space as default for all locales
      aiGenerated: true,
      description: 'Main hero headline',
    },

    imageUrl: {
      id: 'imageUrl',
      name: 'ImageUrl',
      type: 'Link',
      localized: false,
      required: true,
      linkType: 'Asset',
      validations: [
        {
          assetFileSize: {
            min: null,
            max: 20971520, // 20MB
          },
        },
      ],
      aiGenerated: false,
      description: 'Hero image asset',
    },

    showTrustpilotWidget: {
      id: 'showTrustpilotWidget',
      name: 'Show Trustpilot Widget',
      type: 'Boolean',
      localized: false,
      required: true,
      defaultValue: true,
      aiGenerated: false,
      description: 'Display Trustpilot widget',
    },

    showBookingWidget: {
      id: 'showBookingWidget',
      name: 'Show Booking Widget',
      type: 'Boolean',
      localized: false,
      required: false,
      aiGenerated: false,
      description: 'Display booking widget',
    },

    isHourly: {
      id: 'isHourly',
      name: 'isHourly',
      type: 'Boolean',
      localized: false,
      required: false,
      aiGenerated: false,
      description: 'Hourly service flag',
    },

    cta: {
      id: 'cta',
      name: 'CTA',
      type: 'Boolean',
      localized: true,
      required: false,
      aiGenerated: false,
      description: 'Show CTA button',
    },

    ctaText: {
      id: 'ctaText',
      name: 'ctaText',
      type: 'Symbol',
      localized: true,
      required: false,
      aiGenerated: true,
      description: 'CTA button text',
    },

    ctaTargetLink: {
      id: 'ctaTargetLink',
      name: 'ctaTargetLink',
      type: 'Text',
      localized: true,
      required: false,
      aiGenerated: true,
      description: 'CTA target link URL',
    },

    imageAltText: {
      id: 'imageAltText',
      name: 'imageAltText',
      type: 'Symbol',
      localized: false,
      required: false,
      aiGenerated: true,
      description: 'Image alt text',
    },

    onlyVideo: {
      id: 'onlyVideo',
      name: 'Only Video',
      type: 'Boolean',
      localized: false,
      required: false,
      defaultValue: false,
      aiGenerated: false,
      description: 'Only Video flag',
    },

    videoSources: {
      id: 'videoSources',
      name: 'Video Sources',
      type: 'Array',
      localized: false,
      required: false,
      items: {
        type: 'Link',
        linkType: 'Asset',
        validations: [
          {
            linkMimetypeGroup: ['video'],
          },
        ],
      },
      aiGenerated: false,
      description: 'Video source assets',
    },

    foo: {
      id: 'foo',
      name: 'Temporary url',
      type: 'Text',
      localized: false,
      required: false,
      aiGenerated: false,
      description: 'Temporary URL field',
    },

    hideImageOnMobile: {
      id: 'hideImageOnMobile',
      name: 'hideImageOnMobile',
      type: 'Boolean',
      localized: false,
      required: true,
      defaultValue: false,
      aiGenerated: false,
      description: 'Hide image on mobile',
    },

    imageFocus: {
      id: 'imageFocus',
      name: 'Image Focus',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [
        {
          in: ['face', 'faces', 'left', 'right', 'center'],
        },
      ],
      aiGenerated: false,
      description: 'Image focus point',
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

  // Mapping AI fields to Contentful fields
  aiFieldMapping: {
    title: 'name', // AI title -> Contentful name
    heading: 'name', // AI heading -> Contentful name
    imageAltText: 'imageAltText', // Direct mapping
  },

  // Fields that AI can generate (removed CTA fields)
  aiGeneratedFields: ['name', 'imageAltText'],

  // Required fields for entry creation (imageUrl uses fallback to existing asset)
  requiredFields: [
    'name',
    'imageUrl',
    'showTrustpilotWidget',
    'hideImageOnMobile',
  ],

  // Default values for non-AI fields
  defaultValues: {
    showTrustpilotWidget: true,
    hideImageOnMobile: false,
    onlyVideo: false,
    cta: true, // Enable CTA if we have ctaText
  },

  // Localized fields
  localizedFields: ['name', 'cta', 'ctaText', 'ctaTargetLink'],

  // Field validation rules
  validation: {
    name: {
      minLength: 1,
      maxLength: 200,
      required: true,
    },
    ctaText: {
      minLength: 3,
      maxLength: 50,
    },
    imageAltText: {
      minLength: 10,
      maxLength: 150,
    },
  },
};

// Example AI generated content structure for Hero
export const AI_HERO_EXAMPLE = {
  type: 'hero',
  title: 'Premium Airport Transfer Service', // Maps to 'name'
  subtitle: 'Experience luxury travel with professional chauffeurs',
  description: 'Book your premium transfer service today',
  cta: 'Book Your Ride', // Maps to 'ctaText'
  ctaLink: '/booking', // Maps to 'ctaTargetLink'
  imageAltText: 'Luxury car with professional chauffeur at airport', // Direct mapping
};

export default CONTENTFUL_HERO_SCHEMA;
