import { CONTENTFUL_HERO_SCHEMA } from './hero-schema';

// Real Contentful Hero Component schema from the provided JSON
export interface ContentfulHeroSchema {
  name: string; // Heading - localized, required
  imageUrl?: {
    sys: {
      type: 'Link';
      linkType: 'Asset';
      id: string;
    };
  }; // Link to Asset, required but can be null for AI
  showTrustpilotWidget: boolean; // Boolean, required, default true
  showBookingWidget?: boolean; // Boolean, optional
  isHourly?: boolean; // Boolean, optional
  cta?: boolean; // Boolean, localized, optional
  ctaText?: string; // Symbol, localized, optional
  ctaTargetLink?: string; // Text, localized, optional
  imageAltText?: string; // Symbol, not localized, optional
  onlyVideo?: boolean; // Boolean, default false
  videoSources?: Array<{
    sys: {
      type: 'Link';
      linkType: 'Asset';
      id: string;
    };
  }>; // Array of video assets
  foo?: string; // Temporary url field
  hideImageOnMobile: boolean; // Boolean, required, default false
  imageFocus?: 'face' | 'faces' | 'left' | 'right' | 'center'; // Symbol with validation
  lilt_status?: string; // Symbol, omitted
}

// AI Generated Hero structure (current format)
export interface AIGeneratedHero {
  type: 'hero';
  title: string;
  subtitle?: string;
  description?: string;
  cta?: string;
  ctaText?: string;
  ctaLink?: string;
  imageAltText?: string;
}

// Use the schema configuration
export const HERO_MAPPING_CONFIG = {
  contentTypeId: CONTENTFUL_HERO_SCHEMA.contentTypeId,
  requiredFields: CONTENTFUL_HERO_SCHEMA.requiredFields,
  localizableFields: CONTENTFUL_HERO_SCHEMA.localizedFields,
  defaultValues: CONTENTFUL_HERO_SCHEMA.defaultValues,
  fieldMappings: CONTENTFUL_HERO_SCHEMA.aiFieldMapping,
  derivedFields: {
    // Fields we derive from AI content or set defaults
    cta: () => false, // Always false - we don't use CTA for Hero
    showTrustpilotWidget: () =>
      CONTENTFUL_HERO_SCHEMA.defaultValues.showTrustpilotWidget,
    hideImageOnMobile: () =>
      CONTENTFUL_HERO_SCHEMA.defaultValues.hideImageOnMobile,
    onlyVideo: () => CONTENTFUL_HERO_SCHEMA.defaultValues.onlyVideo,
  },
};

// Transform AI generated hero to Contentful format
export function mapAIHeroToContentful(
  aiHero: AIGeneratedHero,
  locale: string = 'en-US',
  imageAssetId?: string,
): any {
  const contentfulEntry: any = {
    fields: {},
  };

  // Map AI fields to Contentful fields with localization
  Object.entries(HERO_MAPPING_CONFIG.fieldMappings).forEach(
    ([aiField, cfField]) => {
      if (aiHero[aiField as keyof AIGeneratedHero]) {
        // Check if this Contentful field should be localized
        const isLocalized =
          HERO_MAPPING_CONFIG.localizableFields.includes(cfField);

        if (isLocalized) {
          contentfulEntry.fields[cfField] = {
            [locale]: aiHero[aiField as keyof AIGeneratedHero],
          };
        } else {
          // Non-localized fields still need locale structure
          contentfulEntry.fields[cfField] = {
            [locale]: aiHero[aiField as keyof AIGeneratedHero],
          };
        }

        // Successfully mapped field
      } else {
        // AI field not found - this is normal for optional fields
      }
    },
  );

  // Handle derived fields
  Object.entries(HERO_MAPPING_CONFIG.derivedFields).forEach(
    ([cfField, deriveFn]) => {
      const value = deriveFn();
      if (value !== undefined) {
        // Check if field is localized
        const isLocalized =
          HERO_MAPPING_CONFIG.localizableFields.includes(cfField);
        if (isLocalized) {
          contentfulEntry.fields[cfField] = {
            [locale]: value,
          };
        } else {
          // Non-localized fields (like boolean fields)
          contentfulEntry.fields[cfField] = {
            [locale]: value, // Still need locale structure in Contentful
          };
        }
      }
    },
  );

  // Handle image asset - use provided or fallback to existing default asset
  const defaultAssetId = '4yVKNgR5TO4py6zdvKRqik'; // Existing asset from Contentful
  const assetId = imageAssetId || defaultAssetId;

  contentfulEntry.fields.imageUrl = {
    [locale]: {
      sys: {
        type: 'Link',
        linkType: 'Asset',
        id: assetId,
      },
    },
  };

  // Force set required defaults - these fields are always required and must be present
  contentfulEntry.fields.showTrustpilotWidget = {
    [locale]: HERO_MAPPING_CONFIG.defaultValues.showTrustpilotWidget,
  };

  contentfulEntry.fields.hideImageOnMobile = {
    [locale]: HERO_MAPPING_CONFIG.defaultValues.hideImageOnMobile,
  };

  // Force CTA to false - we don't use CTA for Hero components
  contentfulEntry.fields.cta = {
    [locale]: false,
  };

  // Debug log the complete entry (uncomment for debugging)
  // console.log('🔍 Complete Contentful entry:', JSON.stringify(contentfulEntry, null, 2));

  return contentfulEntry;
}

// Validation function to ensure all required fields are present
export function validateContentfulHeroEntry(
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
  HERO_MAPPING_CONFIG.requiredFields.forEach(field => {
    if (
      !entry.fields[field] ||
      entry.fields[field][locale] === undefined ||
      entry.fields[field][locale] === null
    ) {
      missingFields.push(field);
    }
  });

  // Special validation for name field (must be non-empty)
  if (entry.fields.name?.[locale]?.trim?.() === '') {
    errors.push('Name field cannot be empty');
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

// Helper to get entry metadata
export function getHeroEntryMetadata(
  aiHero: AIGeneratedHero,
  locale: string = 'en-US',
) {
  return {
    contentTypeId: HERO_MAPPING_CONFIG.contentTypeId,
    locale,
    generatedFrom: 'AI',
    originalAIData: aiHero,
    mappingVersion: '1.0.0',
    timestamp: new Date().toISOString(),
  };
}
