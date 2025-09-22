// DOM Elements Cache with proper TypeScript typing

export interface DOMElements {
  // Steps
  topicStep: HTMLElement | null;
  componentsStep: HTMLElement | null;
  resultsStep: HTMLElement | null;
  releaseStep: HTMLElement | null;
  publishStep: HTMLElement | null;

  // Step indicators
  step1: HTMLElement | null;
  step2: HTMLElement | null;
  step3: HTMLElement | null;
  step4: HTMLElement | null;
  step5: HTMLElement | null;

  // Form inputs
  projectTopic: HTMLInputElement | null;
  projectKeywords: HTMLTextAreaElement | null;
  projectLanguage: HTMLSelectElement | null;

  // Error elements
  topicError: HTMLElement | null;
  keywordsError: HTMLElement | null;

  // Mobile elements
  mobileMenuBtn: HTMLElement | null;
  mobileOverlay: HTMLElement | null;
  sidebar: HTMLElement | null;

  // AI Assistant
  aiAssistantPanel: HTMLElement | null;
  aiConversation: HTMLElement | null;
  aiInput: HTMLInputElement | null;
  aiSendBtn: HTMLButtonElement | null;

  // Navigation buttons
  nextToComponents: HTMLButtonElement | null;
  nextToGenerate: HTMLButtonElement | null;
  nextToRelease: HTMLButtonElement | null;
  backToTopic: HTMLButtonElement | null;
  backToComponents: HTMLButtonElement | null;
  backToResults: HTMLButtonElement | null;
  backToRelease: HTMLButtonElement | null;
  proceedToPublish: HTMLButtonElement | null;

  // Action buttons
  resetBtn: HTMLButtonElement | null;
  publishBtn: HTMLButtonElement | null;

  // Release configuration elements
  releaseConfigForm: HTMLElement | null;
  releaseTitle: HTMLInputElement | null;
  releaseSummaryComponents: HTMLElement | null;
  releaseSummaryTiming: HTMLElement | null;
  publishingSummary: HTMLElement | null;

  // Results
  generatedContent: HTMLElement | null;

  // Status
  statusDot: HTMLElement | null;
  statusText: HTMLElement | null;
}

export const elements: DOMElements = {
  // Steps
  topicStep: document.getElementById('topicStep'),
  componentsStep: document.getElementById('componentsStep'),
  resultsStep: document.getElementById('resultsStep'),
  releaseStep: document.getElementById('releaseStep'),
  publishStep: document.getElementById('publishStep'),

  // Step indicators
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  step3: document.getElementById('step3'),
  step4: document.getElementById('step4'),
  step5: document.getElementById('step5'),

  // Form inputs
  projectTopic: document.getElementById('projectTopic') as HTMLInputElement,
  projectKeywords: document.getElementById(
    'projectKeywords',
  ) as HTMLTextAreaElement,
  projectLanguage: document.getElementById(
    'projectLanguage',
  ) as HTMLSelectElement,

  // Error elements
  topicError: document.getElementById('topicError'),
  keywordsError: document.getElementById('keywordsError'),

  // Mobile elements
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  mobileOverlay: document.getElementById('mobileOverlay'),
  sidebar: document.getElementById('sidebar'),

  // AI Assistant
  aiAssistantPanel: document.getElementById('aiAssistantPanel'),
  aiConversation: document.getElementById('aiConversation'),
  aiInput: document.getElementById('aiInput') as HTMLInputElement,
  aiSendBtn: document.getElementById('aiSendBtn') as HTMLButtonElement,

  // Navigation buttons
  nextToComponents: document.getElementById(
    'nextToComponents',
  ) as HTMLButtonElement,
  nextToGenerate: document.getElementById(
    'nextToGenerate',
  ) as HTMLButtonElement,
  nextToRelease: document.getElementById('nextToRelease') as HTMLButtonElement,
  backToTopic: document.getElementById('backToTopic') as HTMLButtonElement,
  backToComponents: document.getElementById(
    'backToComponents',
  ) as HTMLButtonElement,
  backToResults: document.getElementById('backToResults') as HTMLButtonElement,
  backToRelease: document.getElementById('backToRelease') as HTMLButtonElement,
  proceedToPublish: document.getElementById(
    'proceedToPublish',
  ) as HTMLButtonElement,

  // Action buttons
  resetBtn: document.getElementById('resetBtn') as HTMLButtonElement,
  publishBtn: document.getElementById('publishBtn') as HTMLButtonElement,

  // Release configuration elements
  releaseConfigForm: document.getElementById('releaseConfigForm'),
  releaseTitle: document.getElementById('releaseTitle') as HTMLInputElement,
  releaseSummaryComponents: document.getElementById('releaseSummaryComponents'),
  releaseSummaryTiming: document.getElementById('releaseSummaryTiming'),
  publishingSummary: document.getElementById('publishingSummary'),

  // Results
  generatedContent: document.getElementById('generatedContent'),

  // Status
  statusDot: document.getElementById('status-dot'),
  statusText: document.getElementById('status-text'),
};
