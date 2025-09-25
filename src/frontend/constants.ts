// Feature flags and constants for the frontend application
export interface FeatureFlags {
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

// FEATURE_FLAGS are set based on environment variables or default values.
export const FEATURE_FLAGS: FeatureFlags = {
  SHOW_AI_ASSISTANT: false,
  SHOW_PROGRESS_SIDEBAR: true,
};

export const VALIDATION_CONSTANTS: ValidationConstants = {
  MAX_TOPIC_LENGTH: 200,
  MIN_KEYWORDS_COUNT: 1,
  MAX_KEYWORDS_COUNT: 50,
};

export const ERROR_MESSAGES: ErrorMessages = {
  TOPIC_REQUIRED: 'Topic is required',
  TOPIC_TOO_LONG: `Topic must be less than ${VALIDATION_CONSTANTS.MAX_TOPIC_LENGTH} characters`,
  KEYWORDS_REQUIRED: 'Keywords are required',
  KEYWORDS_TOO_FEW: `At least ${VALIDATION_CONSTANTS.MIN_KEYWORDS_COUNT} keyword is required`,
  KEYWORDS_TOO_MANY: `Maximum ${VALIDATION_CONSTANTS.MAX_KEYWORDS_COUNT} keywords allowed`,
  GENERATION_FAILED: 'Content generation failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Make constants available globally for backwards compatibility during migration
declare global {
  interface Window {
    FEATURE_FLAGS: FeatureFlags;
    ERROR_MESSAGES: ErrorMessages;
  }
}

window.FEATURE_FLAGS = FEATURE_FLAGS;
window.ERROR_MESSAGES = ERROR_MESSAGES;
