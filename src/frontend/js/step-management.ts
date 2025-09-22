import { elements } from './dom-elements.js';
import { AppState } from './state.js';

// Step Management Functions with TypeScript types

export const goToStep = (step: number): void => {
  AppState.currentStep = step;

  // Hide all steps
  elements.topicStep?.classList.add('hidden');
  elements.componentsStep?.classList.add('hidden');
  elements.resultsStep?.classList.add('hidden');
  elements.releaseStep?.classList.add('hidden');
  elements.publishStep?.classList.add('hidden');

  // Show current step
  const stepElements: Record<number, HTMLElement | null> = {
    1: elements.topicStep,
    2: elements.componentsStep,
    3: elements.resultsStep,
    4: elements.releaseStep,
    5: elements.publishStep,
  };

  const currentStepElement = stepElements[step];
  if (currentStepElement) {
    currentStepElement.classList.remove('hidden');
  }

  updateStepIndicators();
};

export const updateStepIndicators = (): void => {
  const steps = [
    elements.step1,
    elements.step2,
    elements.step3,
    elements.step4,
    elements.step5,
  ];

  steps.forEach((step, index) => {
    if (!step) return;

    const stepNumber = index + 1;
    step.classList.remove('step-active', 'step-completed');

    if (stepNumber < AppState.currentStep) {
      step.classList.add('step-completed');
      step.style.backgroundColor = '#10b981';
      step.style.color = 'white';
    } else if (stepNumber === AppState.currentStep) {
      step.classList.add('step-active');
      step.style.backgroundColor = '#3b82f6';
      step.style.color = 'white';
    } else {
      step.style.backgroundColor = '#2a2a2a';
      step.style.color = '#a1a1aa';
    }
  });

  // Update step text colors
  const stepTexts = [
    document.querySelector('#step1')?.parentElement?.querySelector('span'),
    document.querySelector('#step2')?.parentElement?.querySelector('span'),
    document.querySelector('#step3')?.parentElement?.querySelector('span'),
    document.querySelector('#step4')?.parentElement?.querySelector('span'),
    document.querySelector('#step5')?.parentElement?.querySelector('span'),
  ];

  stepTexts.forEach((text, index) => {
    if (!text) return;

    const stepNumber = index + 1;
    if (stepNumber <= AppState.currentStep) {
      text.className = 'text-sm text-cursor-text';
    } else {
      text.className = 'text-sm text-cursor-muted';
    }
  });
};

export const closeMobileMenu = (): void => {
  elements.sidebar?.classList.add('-translate-x-full');
  elements.mobileOverlay?.classList.add('hidden');
  document.body.style.overflow = '';
};

// Navigation functions
export const goToStep1 = (): void => {
  closeMobileMenu();
  goToStep(1);
};

export const goToStep2 = (): void => {
  closeMobileMenu();
  goToStep(2);
};

export const goToStep3 = (): void => {
  closeMobileMenu();
  goToStep(3);
};

export const goToStep4 = (): void => {
  closeMobileMenu();
  goToStep(4);
};

export const goToStep5 = (): void => {
  closeMobileMenu();
  goToStep(5);
};
