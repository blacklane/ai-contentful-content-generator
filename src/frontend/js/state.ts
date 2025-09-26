// Application State Management with TypeScript interfaces

export interface ProjectData {
  mainKeywords: string;
  secondaryKeywords: string;
  questions: string;
  language: string;
  components: string[];
}

export interface ReleaseConfig {
  mode: 'release';
  title: string;
  description: string;
  publishTiming: 'draft' | 'published';
}

export interface AppStateType {
  currentStep: number;
  projectData: ProjectData;
  generatedContent: any | null;
  releaseConfig: ReleaseConfig;
}

import type { DOMElements } from './dom-elements.js';

// Constants for localStorage
const FORM_DATA_KEY = 'contentful_ai_form_data';

export const AppState: AppStateType = {
  currentStep: 1,
  projectData: {
    mainKeywords: '',
    secondaryKeywords: '',
    questions: '',
    language: 'en',
    components: ['hero', 'seoText'],
  },
  generatedContent: null,
  releaseConfig: {
    mode: 'release',
    title: '',
    description: '',
    publishTiming: 'draft',
  },
};

export const updateProjectData = (elements: DOMElements): void => {
  if (elements.projectMainKeywords) {
    AppState.projectData.mainKeywords = elements.projectMainKeywords.value;
  }
  if (elements.projectSecondaryKeywords) {
    AppState.projectData.secondaryKeywords =
      elements.projectSecondaryKeywords.value;
  }
  if (elements.projectQuestions) {
    AppState.projectData.questions = elements.projectQuestions.value;
  }
  if (elements.projectLanguage) {
    AppState.projectData.language = elements.projectLanguage.value;
  }
};

// Function to save form data to localStorage when moving to step 2
export const saveFormDataToStorage = (): void => {
  const formData = {
    mainKeywords: AppState.projectData.mainKeywords,
    secondaryKeywords: AppState.projectData.secondaryKeywords,
    questions: AppState.projectData.questions,
    language: AppState.projectData.language,
  };

  localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
};

// Function to check for changes and update storage
export const updateStorageIfChanged = (): void => {
  try {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    const currentData = {
      mainKeywords: AppState.projectData.mainKeywords,
      secondaryKeywords: AppState.projectData.secondaryKeywords,
      questions: AppState.projectData.questions,
      language: AppState.projectData.language,
    };

    // If no data exists or data has changed - update it
    if (
      !savedData ||
      JSON.stringify(JSON.parse(savedData)) !== JSON.stringify(currentData)
    ) {
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(currentData));
    }
  } catch (error) {
    console.warn('Failed to update storage:', error);
  }
};

// Function to restore form data from localStorage
export const loadFormDataFromStorage = (): boolean => {
  try {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    if (!savedData) return false;

    const formData = JSON.parse(savedData);

    // Restore data to AppState
    AppState.projectData.mainKeywords = formData.mainKeywords || '';
    AppState.projectData.secondaryKeywords = formData.secondaryKeywords || '';
    AppState.projectData.questions = formData.questions || '';
    AppState.projectData.language = formData.language || 'en';

    return true;
  } catch (error) {
    console.warn('Failed to load form data from storage:', error);
    return false;
  }
};

// Clear saved data (on session reset)
export const clearFormDataFromStorage = (): void => {
  localStorage.removeItem(FORM_DATA_KEY);
};

export const resetAppState = (): void => {
  AppState.currentStep = 1;
  AppState.projectData = {
    mainKeywords: '',
    secondaryKeywords: '',
    questions: '',
    language: 'en',
    components: ['hero', 'seoText'],
  };
  AppState.generatedContent = null;
  AppState.releaseConfig = {
    mode: 'release',
    title: '',
    description: '',
    publishTiming: 'draft',
  };

  // Clear saved data on reset
  clearFormDataFromStorage();
};
