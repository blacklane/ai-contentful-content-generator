// Application State Management with TypeScript interfaces

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ProjectData {
  topic: string;
  keywords: string;
  language: string;
  components: string[];
  aiConversation: AIMessage[];
}

export interface ReleaseConfig {
  mode: 'direct' | 'release';
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
    topic: '',
    keywords: '',
    language: 'en',
    components: ['hero', 'seoText'],
    aiConversation: [],
  },
  generatedContent: null,
  releaseConfig: {
    mode: 'direct',
    title: '',
    description: '',
    publishTiming: 'draft',
  },
};

export const updateProjectData = (elements: DOMElements): void => {
  if (elements.projectTopic) {
    AppState.projectData.topic = elements.projectTopic.value;
  }
  if (elements.projectKeywords) {
    AppState.projectData.keywords = elements.projectKeywords.value;
  }
  if (elements.projectLanguage) {
    AppState.projectData.language = elements.projectLanguage.value;
  }
};

export const resetAppState = (): void => {
  AppState.currentStep = 1;
  AppState.projectData = {
    topic: '',
    keywords: '',
    language: 'en',
    components: ['hero', 'seoText'],
    aiConversation: [],
  };
  AppState.generatedContent = null;
  AppState.releaseConfig = {
    mode: 'direct',
    title: '',
    description: '',
    publishTiming: 'draft',
  };
};
