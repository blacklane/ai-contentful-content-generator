// Client-side validation helpers
// These mirror the server-side Zod validations but are implemented in TypeScript

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormData {
  topic: string;
  keywords: string;
  language?: string;
}

function validateMinWords(value: string, minWords: number): boolean {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  return words.length >= minWords;
}

function validateKeywords(value: string): boolean {
  // Split by comma and trim each keyword
  const keywords = value
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  // Must have at least 3 keywords
  if (keywords.length < 3) {
    return false;
  }

  // Total word count across all keywords should be at least 3
  const totalWords = keywords
    .join(' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  return totalWords.length >= 3;
}

// Validation functions
export function validateTopic(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return 'Topic is required';
  }

  if (!validateMinWords(value, 3)) {
    return 'Topic must contain at least 3 words';
  }

  return null;
}

export function validateKeywordsField(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return 'Keywords are required';
  }

  if (!validateKeywords(value)) {
    return 'Keywords must be comma-separated with at least 3 keywords total';
  }

  return null;
}

// Form validation helper
export function validateForm(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  const topicError = validateTopic(formData.topic);
  if (topicError) {
    errors.topic = topicError;
  }

  const keywordsError = validateKeywordsField(formData.keywords);
  if (keywordsError) {
    errors.keywords = keywordsError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
