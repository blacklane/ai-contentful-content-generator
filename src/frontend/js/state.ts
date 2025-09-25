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
};
