// Client-side validation helpers
// These mirror the server-side Zod validations but are implemented in TypeScript

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormData {
  mainKeywords: string;
  secondaryKeywords: string;
  questions?: string;
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

  // Must have at least 1 keyword
  if (keywords.length < 1) {
    return false;
  }

  // Total word count across all keywords should be at least 1
  const totalWords = keywords
    .join(' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  return totalWords.length >= 1;
}

// Validation functions
// Topic validation removed - using mainKeywords as primary field

export function validateMainKeywords(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return 'Keywords are required';
  }

  if (!validateKeywords(value)) {
    return 'Keywords must be comma-separated with at least 1 keyword total';
  }

  return null;
}

export function validateSecondaryKeywords(value: string): string | null {
  if (!value || value.trim() === '') {
    return 'Secondary keywords are required';
  }

  // Split by comma and trim each keyword
  const keywords = value
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  if (keywords.length === 0) {
    return 'Secondary keywords are required';
  }

  return null;
}

export function validateQuestions(value: string): string | null {
  if (!value || value.trim() === '') {
    return null; // Optional field
  }

  return null;
}

// Form validation helper
export function validateForm(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  const mainKeywordsError = validateMainKeywords(formData.mainKeywords);
  if (mainKeywordsError) {
    errors.mainKeywords = mainKeywordsError;
  }

  const secondaryKeywordsError = validateSecondaryKeywords(
    formData.secondaryKeywords || '',
  );
  if (secondaryKeywordsError) {
    errors.secondaryKeywords = secondaryKeywordsError;
  }

  if (formData.questions) {
    const questionsError = validateQuestions(formData.questions);
    if (questionsError) {
      errors.questions = questionsError;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
