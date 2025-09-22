// Feature flags and constants for the frontend application
export interface FeatureFlags {
  SHOW_QUICK_START_TEMPLATES: boolean;
  SHOW_AI_ASSISTANT: boolean;
  SHOW_PROGRESS_SIDEBAR: boolean;
}

export interface ValidationConstants {
  MAX_TOPIC_LENGTH: number;
  MIN_KEYWORDS_COUNT: number;
  MAX_KEYWORDS_COUNT: number;
}

export interface ErrorMessages {
  TOPIC_REQUIRED: string;
  TOPIC_TOO_LONG: string;
  KEYWORDS_REQUIRED: string;
  KEYWORDS_TOO_FEW: string;
  KEYWORDS_TOO_MANY: string;
  GENERATION_FAILED: string;
  NETWORK_ERROR: string;
  SERVER_ERROR: string;
}

export interface QuickStartTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  topic: string;
  keywords: string;
  color: string;
  tags: string[];
}

export interface QuickStartTemplates {
  ENABLED: boolean;
  TEMPLATES: QuickStartTemplate[];
}

// FEATURE_FLAGS are set based on environment variables or default values.
export const FEATURE_FLAGS: FeatureFlags = {
  SHOW_QUICK_START_TEMPLATES:
    typeof process !== 'undefined' && process.env && process.env.NODE_ENV
      ? process.env.NODE_ENV === 'development'
      : true, // Default to true if environment is unknown
  SHOW_AI_ASSISTANT: true,
  SHOW_PROGRESS_SIDEBAR: true,
};

export const VALIDATION_CONSTANTS: ValidationConstants = {
  MAX_TOPIC_LENGTH: 200,
  MIN_KEYWORDS_COUNT: 3,
  MAX_KEYWORDS_COUNT: 50,
};

export const ERROR_MESSAGES: ErrorMessages = {
  TOPIC_REQUIRED: 'Topic is required',
  TOPIC_TOO_LONG: `Topic must be less than ${VALIDATION_CONSTANTS.MAX_TOPIC_LENGTH} characters`,
  KEYWORDS_REQUIRED: 'Keywords are required',
  KEYWORDS_TOO_FEW: `At least ${VALIDATION_CONSTANTS.MIN_KEYWORDS_COUNT} keywords are required`,
  KEYWORDS_TOO_MANY: `Maximum ${VALIDATION_CONSTANTS.MAX_KEYWORDS_COUNT} keywords allowed`,
  GENERATION_FAILED: 'Content generation failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

export const QUICK_START_TEMPLATES: QuickStartTemplates = {
  ENABLED: FEATURE_FLAGS.SHOW_QUICK_START_TEMPLATES,
  TEMPLATES: [
    {
      id: 'luxury-transport',
      name: 'Luxury Transport',
      description: 'Premium chauffeur services',
      emoji: '🚗',
      topic: 'Luxury Chauffeur Service in Berlin',
      keywords:
        'luxury chauffeur, premium car service, Berlin airport transfer, professional driver, VIP transport',
      color: 'blue',
      tags: ['VIP', 'luxury'],
    },
    {
      id: 'business-travel',
      name: 'Business Travel',
      description: 'Corporate solutions',
      emoji: '💼',
      topic: 'Corporate Business Travel Solutions',
      keywords:
        'corporate travel, business transportation, executive services, meeting transfers, company transport',
      color: 'green',
      tags: ['corporate', 'executive'],
    },
    {
      id: 'airport-transfer',
      name: 'Airport Transfer',
      description: 'Flight connections',
      emoji: '✈️',
      topic: 'Professional Airport Transfer Services',
      keywords:
        'airport transfer, flight pickup, baggage assistance, reliable transport, travel logistics',
      color: 'orange',
      tags: ['airport', 'reliable'],
    },
    {
      id: 'event-transport',
      name: 'Event Transport',
      description: 'Special occasions',
      emoji: '🎉',
      topic: 'Premium Event Transportation Services',
      keywords:
        'event transport, wedding cars, special occasions, group travel, celebration transport',
      color: 'purple',
      tags: ['events', 'wedding'],
    },
    {
      id: 'tourism',
      name: 'Tourism',
      description: 'City sightseeing',
      emoji: '🏛️',
      topic: 'City Tourism and Sightseeing Transport',
      keywords:
        'city tours, sightseeing transport, tourist services, guided tours, cultural experiences',
      color: 'cyan',
      tags: ['tours', 'culture'],
    },
  ],
};

// Make constants available globally for backwards compatibility during migration
declare global {
  interface Window {
    FEATURE_FLAGS: FeatureFlags;
    ERROR_MESSAGES: ErrorMessages;
    QUICK_START_TEMPLATES: QuickStartTemplates;
  }
}

window.FEATURE_FLAGS = FEATURE_FLAGS;
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.QUICK_START_TEMPLATES = QUICK_START_TEMPLATES;
