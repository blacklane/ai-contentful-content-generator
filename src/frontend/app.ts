// Force dark theme
document.documentElement.setAttribute('data-theme', 'dark');

// Import modules
import {
  type ComponentConfig,
  CONTENTFUL_COMPONENTS,
  getComponentExample,
  getComponentSchema,
  validateComponentData,
} from './components.js';
import { FEATURE_FLAGS } from './constants.js';
import { authManager } from './js/auth.js';
import { generateContent } from './js/content-generation.js';
import { elements } from './js/dom-elements.js';
import { httpClient } from './js/http-client.js';
import {
  hideResultModal,
  showResetModal,
  showResultModal,
} from './js/modals.js';
import {
  AppState,
  loadFormDataFromStorage,
  resetAppState,
  saveFormDataToStorage,
  updateProjectData,
  updateStorageIfChanged,
} from './js/state.js';
import {
  closeMobileMenu,
  goToStep1,
  goToStep2,
  goToStep3,
  goToStep4,
  goToStep5,
} from './js/step-management.js';
import {
  hideFieldError,
  initValidation,
  validateComponentSelection,
  validateStep1,
} from './js/validation.js';

// Global window extensions for backward compatibility
declare global {
  interface Window {
    getComponentSchema: typeof getComponentSchema;
    getComponentExample: typeof getComponentExample;
    validateComponentData: typeof validateComponentData;
  }
}

// Initialize Application
const initApp = async (): Promise<void> => {
  try {
    // Make component functions available globally for backward compatibility
    window.getComponentSchema = getComponentSchema;
    window.getComponentExample = getComponentExample;
    window.validateComponentData = validateComponentData;
  } catch (error) {
    console.error('Failed to load components module:', error);
  }

  // Check authentication status
  await checkAuthenticationStatus();

  await initValidation();

  setupEventListeners();
  renderComponents();
  setupComponentEventListeners();
  setupReleaseEventListeners();
  checkServerStatus();
  updateButtonState();
  applyFeatureFlags();

  // Restore form data from localStorage if available
  const hasRestoredData = loadFormDataFromStorage();
  if (hasRestoredData) {
    // Update form fields with restored data
    restoreFormFields();
    validateStep1(); // Re-validate after restoration
  }
};

// Function to restore form fields from AppState
const restoreFormFields = (): void => {
  if (elements.projectMainKeywords) {
    elements.projectMainKeywords.value = AppState.projectData.mainKeywords;
  }
  if (elements.projectSecondaryKeywords) {
    elements.projectSecondaryKeywords.value =
      AppState.projectData.secondaryKeywords;
  }
  if (elements.projectQuestions) {
    elements.projectQuestions.value = AppState.projectData.questions;
  }
  if (elements.projectLanguage) {
    elements.projectLanguage.value = AppState.projectData.language;
  }
};

// Component Rendering
const renderComponents = (): void => {
  const componentsContainer = document.querySelector(
    '.grid.grid-cols-1.sm\\:grid-cols-2.gap-4.mb-6',
  ) as HTMLElement;
  if (!componentsContainer || !CONTENTFUL_COMPONENTS) {
    return;
  }

  componentsContainer.innerHTML = '';

  Object.entries(CONTENTFUL_COMPONENTS).forEach(
    ([key, component]: [string, ComponentConfig]) => {
      const isRecommended = component.recommended;
      const isSelected = AppState.projectData.components.includes(key);
      const isMandatory = key === 'hero' || key === 'seoText';

      const componentCard = document.createElement('div');
      componentCard.className = `component-card p-4 rounded-lg border border-cursor-border ${isSelected ? 'component-selected' : ''}`;
      componentCard.setAttribute('data-component', key);

      const gridSpan = key === 'seoText' ? 'col-span-full' : '';
      if (gridSpan) {
        componentCard.classList.add(gridSpan);
      }

      if (isMandatory) {
        componentCard.classList.add('component-mandatory');
      }

      // Fallback icon if component.icon is undefined
      const iconPath =
        component.icon ||
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      const componentName = component.name || 'Unknown Component';
      const componentDescription =
        component.description || 'Component description not available';

      componentCard.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-cursor-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path>
          </svg>
          <span class="font-medium text-cursor-text">${componentName}</span>
          ${isRecommended ? '<span class="px-2 py-1 bg-cursor-accent/20 text-cursor-accent text-xs rounded-full">recommended</span>' : ''}
          ${isMandatory ? '<span class="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">mandatory</span>' : ''}
        </div>
        <input type="checkbox" ${isSelected || isMandatory ? 'checked' : ''} ${isMandatory ? 'disabled' : ''} class="checkbox checkbox-primary ${isMandatory ? 'opacity-50 cursor-not-allowed' : ''}" />
      </div>
      <p class="text-sm text-cursor-muted">${componentDescription}${isMandatory ? ' (Always included)' : ''}</p>
    `;

      componentsContainer.appendChild(componentCard);
    },
  );
};

// Event Listeners Setup
const setupEventListeners = (): void => {
  if (!elements.projectMainKeywords || !elements.projectLanguage) {
    return;
  }

  // Form inputs
  elements.projectMainKeywords.addEventListener('input', () => {
    updateProjectData(elements);
    updateStorageIfChanged(); // Update storage if data changed
    validateStep1();
  });
  elements.projectSecondaryKeywords?.addEventListener('input', () => {
    updateProjectData(elements);
    updateStorageIfChanged(); // Update storage if data changed
    validateStep1();
  });
  elements.projectQuestions?.addEventListener('input', () => {
    updateProjectData(elements);
    updateStorageIfChanged(); // Update storage if data changed
    validateStep1();
  });
  elements.projectLanguage.addEventListener('change', () => {
    updateProjectData(elements);
    updateStorageIfChanged(); // Update storage if data changed
  });

  // Navigation
  elements.nextToComponents?.addEventListener('click', () => {
    updateProjectData(elements);
    saveFormDataToStorage(); // Save form data when moving to step 2
    goToStep2();
    validateComponentSelection();
  });
  elements.nextToGenerate?.addEventListener('click', generateContent);
  elements.nextToRelease?.addEventListener('click', () => {
    goToStep4();
    selectReleaseMode(); // Always use release mode
    updateReleaseSummary();
  });
  elements.backToTopic?.addEventListener('click', goToStep1);
  elements.backToComponents?.addEventListener('click', goToStep2);
  elements.backToPreview?.addEventListener('click', goToStep3);
  elements.backToRelease?.addEventListener('click', goToStep4);
  elements.proceedToPublish?.addEventListener('click', () => {
    goToStep5();
    updatePublishingSummary();
  });

  // Actions
  elements.resetBtn?.addEventListener('click', showResetModal);
  elements.publishBtn?.addEventListener('click', publishContent);

  // Mobile menu
  elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
  elements.mobileOverlay?.addEventListener('click', closeMobileMenu);

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeMobileMenu();
    }
  });
};

// Component Event Listeners
const setupComponentEventListeners = (): void => {
  document.querySelectorAll('.component-card').forEach(card => {
    card.addEventListener('click', function (this: HTMLElement, e: Event) {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'input' &&
        (target as HTMLInputElement).type === 'checkbox'
      ) {
        return;
      }

      const checkbox = this.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
      const component = this.getAttribute('data-component');

      if (component === 'hero' || !checkbox || !component) {
        return;
      }

      checkbox.checked = !checkbox.checked;
      updateComponentSelection(component, checkbox.checked);
      updateComponentCardVisual(this, checkbox.checked);
      validateComponentSelection();
    });

    const checkbox = card.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener('change', function (this: HTMLInputElement) {
        const component = card.getAttribute('data-component');
        if (component) {
          updateComponentSelection(component, this.checked);
          updateComponentCardVisual(card as HTMLElement, this.checked);
          validateComponentSelection();
        }
      });
    }
  });
};

// Release Event Listeners
const setupReleaseEventListeners = (): void => {
  // Release mode is now always selected automatically

  elements.releaseTitle?.addEventListener(
    'input',
    function (this: HTMLInputElement) {
      AppState.releaseConfig.title = this.value;
      updateReleaseSummary();
    },
  );
};

// Mobile Menu Functions
const toggleMobileMenu = (): void => {
  if (!elements.sidebar) {
    return;
  }

  const isOpen = !elements.sidebar.classList.contains('-translate-x-full');
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
};

const openMobileMenu = (): void => {
  elements.sidebar?.classList.remove('-translate-x-full');
  elements.mobileOverlay?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

// Component Management
const updateComponentSelection = (
  component: string,
  selected: boolean,
): void => {
  if (component === 'hero' && !selected) {
    return;
  }

  if (selected) {
    if (!AppState.projectData.components.includes(component)) {
      AppState.projectData.components.push(component);
    }
  } else {
    AppState.projectData.components = AppState.projectData.components.filter(
      c => c !== component,
    );
  }
};

const updateComponentCardVisual = (
  card: HTMLElement,
  selected: boolean,
): void => {
  if (selected) {
    card.classList.add('component-selected');
  } else {
    card.classList.remove('component-selected');
  }
};

// Release Management
const selectReleaseMode = (): void => {
  AppState.releaseConfig.mode = 'release';

  document.querySelectorAll('.release-mode-card').forEach(card => {
    card.classList.add('release-mode-selected');
  });

  elements.releaseConfigForm?.classList.remove('hidden');
  if (!AppState.releaseConfig.title && elements.releaseTitle) {
    // Use page title (metaTitle) if available, otherwise fallback to main keywords
    const pageTitle =
      AppState.generatedContent?.metaTitle || AppState.projectData.mainKeywords;
    if (pageTitle) {
      AppState.releaseConfig.title = pageTitle;
      elements.releaseTitle.value = AppState.releaseConfig.title;
    }
  }
  updateReleaseSummary();
};

const updateReleaseSummary = (): void => {
  const componentCount = AppState.projectData.components.length;
  if (elements.releaseSummaryComponents) {
    elements.releaseSummaryComponents.textContent = `${componentCount} page`;
  }
  if (elements.releaseSummaryTiming) {
    elements.releaseSummaryTiming.innerHTML =
      '• Publishing: <span class="text-cursor-text">Draft only</span>';
  }
};

const updatePublishingSummary = (): void => {
  if (!elements.publishingSummary) {
    return;
  }

  const componentCount = AppState.projectData.components.length;
  const title = AppState.releaseConfig.title || 'Untitled Release';

  const summary = `
    <div class="text-cursor-muted">Release Title: "${title}" </div>
    <div class="text-cursor-muted">• ${componentCount} components will be grouped in a Contentful release</div>
    <div class="text-cursor-muted">• Release will be managed in Contentful</div>
    <div class="text-cursor-muted">• Will be saved as draft</div>
  `;

  elements.publishingSummary.innerHTML = summary;
};

// Utility Functions
const updateButtonState = (): void => {
  updateProjectData(elements);
  const hasContent =
    AppState.projectData.mainKeywords.trim() &&
    AppState.projectData.secondaryKeywords.trim();

  if (elements.nextToComponents) {
    elements.nextToComponents.disabled = !hasContent;

    if (hasContent) {
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

// Publishing Functions
interface PublishPayload {
  generatedContent: any;
  releaseMode: 'release';
  imageUrls: Record<string, string>;
  releaseConfig: {
    title: string;
    publishImmediately: boolean;
    draftOnly: boolean;
  };
}

const publishContent = async (): Promise<void> => {
  if (!elements.publishBtn) {
    return;
  }

  const publishBtn = elements.publishBtn;
  const originalText = publishBtn.textContent || '';

  publishBtn.disabled = true;
  publishBtn.textContent = '📤 Uploading to Contentful...';

  try {
    if (!AppState.generatedContent) {
      throw new Error('No generated content to publish');
    }

    const releaseConfig = AppState.releaseConfig;
    const publishPayload: PublishPayload = {
      generatedContent: AppState.generatedContent,
      releaseMode: 'release',
      imageUrls: {},
      releaseConfig: {
        title: releaseConfig.title,
        publishImmediately: false,
        draftOnly: true,
      },
    };

    const result = await httpClient.publishContent(publishPayload);

    if (result.success) {
      publishBtn.textContent = '✅ Uploaded to Contentful!';
      publishBtn.classList.remove('cursor-gradient');
      publishBtn.classList.add('bg-green-500');

      let successMessage = '';
      successMessage =
        'Successfully created Custom Static Page in Contentful!\n\n<strong>⚠️ Important: Please review and verify all generated content before publishing. The AI-generated text may contain errors or inaccuracies that require correction.</strong>';

      let contentfulSpaceId: string | null = null;
      if (result.data?.metadata?.contentfulUrl) {
        const urlMatch =
          result.data.metadata.contentfulUrl.match(/spaces\/([^/]+)/);
        if (urlMatch) {
          contentfulSpaceId = urlMatch[1];
        }
      }

      showResultModal('success', 'Upload Successful!', successMessage, {
        showLinks: true,
        contentfulSpaceId: contentfulSpaceId || undefined,
        pageUrl: result.data?.metadata?.contentfulUrl || null,
      });

      disableNavigationAfterPublish();
    } else {
      throw new Error(result.message || 'Publishing failed');
    }
  } catch (error) {
    console.error('❌ Publishing failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    let displayMessage = `Publishing failed: ${errorMessage}`;

    if (errorMessage.includes('Contentful not configured')) {
      displayMessage =
        'Contentful is not configured. Please add CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN to your .env file.';
    }

    showResultModal('error', 'Publication Failed', displayMessage);
    publishBtn.disabled = false;
    publishBtn.textContent = originalText;
  }
};

// Reset Functions
const performReset = (): void => {
  resetAppState();

  if (elements.projectMainKeywords) {
    elements.projectMainKeywords.value = '';
  }
  if (elements.projectSecondaryKeywords) {
    elements.projectSecondaryKeywords.value = '';
  }
  if (elements.projectQuestions) {
    elements.projectQuestions.value = '';
  }
  if (elements.projectLanguage) {
    elements.projectLanguage.value = 'en';
  }
  if (elements.releaseTitle) {
    elements.releaseTitle.value = '';
  }

  hideFieldError('mainKeywords');
  hideFieldError('secondaryKeywords');
  hideFieldError('questions');

  document
    .querySelectorAll('.component-card input[type="checkbox"]')
    .forEach(checkbox => {
      const checkboxInput = checkbox as HTMLInputElement;
      const card = checkboxInput.closest('.component-card') as HTMLElement;
      const component = card?.getAttribute('data-component');

      if (component && ['hero', 'seoText'].includes(component)) {
        checkboxInput.checked = true;
        card.classList.add('component-selected');
      } else {
        checkboxInput.checked = false;
        card?.classList.remove('component-selected');
      }
    });

  enableNavigationAfterReset();
  goToStep1();
  validateStep1();
};

// Authentication Status Check
const checkAuthenticationStatus = async (): Promise<void> => {
  try {
    // Check if authentication is required
    const authStatus = await authManager.getAuthStatus();

    if (authStatus.success && authStatus.data?.requiresAuth) {
      // Authentication is required
      if (!authManager.isAuthenticated()) {
        // User is not authenticated, show login form
        authManager.showLoginForm();
        return;
      } else {
        // User has token, verify it's still valid
        const verifyResult = await authManager.verifyToken();
        if (!verifyResult.success) {
          // Token is invalid, show login form
          authManager.showLoginForm();
          return;
        }
        // Token is valid, hide login form if visible
        authManager.hideLoginForm();
      }
    } else {
      // Authentication not required or not configured
      authManager.hideLoginForm();
    }
  } catch (error) {
    console.error('Error checking authentication status:', error);
    // On error, assume auth is not required to prevent blocking the app
  }
};

// Server Status Check
interface HealthResponse {
  ok: boolean;
  missingCredentials?: string[];
}

const checkServerStatus = async (): Promise<void> => {
  if (!elements.statusDot || !elements.statusText) {
    return;
  }

  try {
    const result = await httpClient.checkHealth();

    if (result.success && result.data) {
      const data = result.data as HealthResponse;

      if (data.ok) {
        elements.statusDot.className = 'w-2 h-2 rounded-full bg-green-500';
        const missingCount = data.missingCredentials?.length || 0;
        if (missingCount > 0) {
          elements.statusText.textContent = `Connected • ${missingCount} missing credentials`;
          elements.statusDot.className = 'w-2 h-2 rounded-full bg-yellow-500';
        } else {
          elements.statusText.textContent = 'Connected • Ready to generate';
        }
      } else {
        elements.statusDot.className = 'w-2 h-2 rounded-full bg-red-500';
        elements.statusText.textContent = 'Error connecting to server';
      }
    } else {
      elements.statusDot.className = 'w-2 h-2 rounded-full bg-red-500';
      elements.statusText.textContent = result.message || 'Server error';
    }
  } catch {
    elements.statusDot.className = 'w-2 h-2 rounded-full bg-red-500';
    elements.statusText.textContent = 'Server offline';
  }
};

// Feature Flags
const applyFeatureFlags = (): void => {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    if (!FEATURE_FLAGS.SHOW_PROGRESS_SIDEBAR) {
      sidebar.style.display = 'none';
    } else {
      sidebar.style.display = 'block';
    }
  }
};

// Navigation Control Functions
const disableNavigationAfterPublish = (): void => {
  const backButtons = [
    'backToTopic',
    'backToComponents',
    'backToPreview',
    'backToRelease',
  ];

  backButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId) as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.classList.add('opacity-50', 'cursor-not-allowed');
      button.classList.remove(
        'hover:text-cursor-text',
        'hover:border-cursor-accent',
      );
    }
  });
};

const enableNavigationAfterReset = (): void => {
  const backButtons = [
    'backToTopic',
    'backToComponents',
    'backToPreview',
    'backToRelease',
  ];

  backButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId) as HTMLButtonElement;
    if (button) {
      button.disabled = false;
      button.classList.remove('opacity-50', 'cursor-not-allowed');
      button.classList.add(
        'hover:text-cursor-text',
        'hover:border-cursor-accent',
      );
      button.title = '';
    }
  });
};

// Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const modalOk = document.getElementById('modalOk') as HTMLButtonElement;
  const confirmReset = document.getElementById(
    'confirmReset',
  ) as HTMLButtonElement;
  const cancelReset = document.getElementById(
    'cancelReset',
  ) as HTMLButtonElement;
  const resetModal = document.getElementById('resetModal') as HTMLDialogElement;

  modalOk?.addEventListener('click', hideResultModal);

  confirmReset?.addEventListener('click', () => {
    resetModal?.close();
    performReset();
  });

  cancelReset?.addEventListener('click', () => {
    resetModal?.close();
  });

  // Initialize app
  initApp();

  // Check status periodically
  setInterval(checkServerStatus, 30000);
});
