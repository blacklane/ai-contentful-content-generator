import type { DOMElements } from './dom-elements.js';
import { elements } from './dom-elements.js';
import { AppState } from './state.js';

// Validation functions type definitions
type ValidationFunction = (value: string) => string | null;

// Validation functions
let validateTopic: ValidationFunction | undefined;
let validateKeywordsField: ValidationFunction | undefined;

// Import validation functions
export const initValidation = async (): Promise<void> => {
  try {
    const validationModule = await import('../validation.js');
    validateTopic = validationModule.validateTopic;
    validateKeywordsField = validationModule.validateKeywordsField;
  } catch (error) {
    console.warn('Failed to load validation module, using fallback validation');
    // Fallback to basic validation
  }
};

export const showFieldError = (fieldName: string, message: string): void => {
  const errorElement = elements[
    `${fieldName}Error` as keyof DOMElements
  ] as HTMLElement;
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }

  const inputElementKey =
    `project${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}` as keyof DOMElements;
  const inputElement = elements[inputElementKey] as HTMLElement;
  if (inputElement) {
    if (inputElement.tagName.toLowerCase() === 'textarea') {
      inputElement.classList.add('textarea-error');
    } else {
      inputElement.classList.add('input-error');
    }
  }
};

export const hideFieldError = (fieldName: string): void => {
  const errorElement = elements[
    `${fieldName}Error` as keyof DOMElements
  ] as HTMLElement;
  if (errorElement) {
    errorElement.classList.add('hidden');
  }

  const inputElementKey =
    `project${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}` as keyof DOMElements;
  const inputElement = elements[inputElementKey] as HTMLElement;
  if (inputElement) {
    if (inputElement.tagName.toLowerCase() === 'textarea') {
      inputElement.classList.remove('textarea-error');
    } else {
      inputElement.classList.remove('input-error');
    }
  }
};

export const validateStep1 = (): void => {
  let isValid = true;

  // Basic validation if advanced validation is not loaded
  if (!validateTopic || !validateKeywordsField) {
    const basicValid =
      AppState.projectData.topic.trim() && AppState.projectData.keywords.trim();

    if (elements.nextToComponents) {
      elements.nextToComponents.disabled = !basicValid;

      if (basicValid) {
        elements.nextToComponents.classList.remove(
          'opacity-50',
          'cursor-not-allowed',
        );
      } else {
        elements.nextToComponents.classList.add(
          'opacity-50',
          'cursor-not-allowed',
        );
      }
    }
    return;
  }

  // Advanced validation
  const topicError = validateTopic(AppState.projectData.topic);
  const keywordsError = validateKeywordsField(AppState.projectData.keywords);

  if (topicError && AppState.projectData.topic.trim()) {
    showFieldError('topic', topicError);
    isValid = false;
  } else {
    hideFieldError('topic');
  }

  if (keywordsError && AppState.projectData.keywords.trim()) {
    showFieldError('keywords', keywordsError);
    isValid = false;
  } else {
    hideFieldError('keywords');
  }

  const formComplete =
    AppState.projectData.topic.trim() &&
    AppState.projectData.keywords.trim() &&
    !topicError &&
    !keywordsError;

  if (elements.nextToComponents) {
    elements.nextToComponents.disabled = !formComplete;

    if (formComplete) {
      elements.nextToComponents.classList.remove(
        'opacity-50',
        'cursor-not-allowed',
      );
    } else {
      elements.nextToComponents.classList.add(
        'opacity-50',
        'cursor-not-allowed',
      );
    }
  }
};

export const validateComponentSelection = (): void => {
  const selectedComponents = AppState.projectData.components || [];
  const generateBtn = elements.nextToGenerate;

  if (!generateBtn) return;

  if (selectedComponents.length === 0) {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Select at least 1 component';
    generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
  } else {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Content';
    generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
};
