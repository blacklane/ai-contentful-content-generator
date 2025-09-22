import { elements } from './dom-elements.js';
import { httpClient } from './http-client.js';
import { showResultModal } from './modals.js';
import { type AIMessage, AppState, updateProjectData } from './state.js';
import { goToStep3 } from './step-management.js';

// Content Generation Functions with TypeScript types

interface GenerationRequest {
  topic: string;
  keywords: string;
  language: string;
  components: string[];
  conversationContext: AIMessage[];
}

export const generateContent = async (): Promise<void> => {
  const generateBtn = elements.nextToGenerate;
  if (!generateBtn) {
    return;
  }

  const originalText = generateBtn.innerHTML;

  generateBtn.disabled = true;
  generateBtn.innerHTML = `
    <div class="animate-spin w-4 h-4 mr-2">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    Generating...
  `;

  try {
    updateProjectData(elements);

    const requestBody: GenerationRequest = {
      topic: AppState.projectData.topic,
      keywords: AppState.projectData.keywords,
      language: AppState.projectData.language,
      components: AppState.projectData.components,
      conversationContext: AppState.projectData.aiConversation,
    };

    const result = await httpClient.generateContent(requestBody);

    if (result.success && result.data) {
      AppState.generatedContent = result.data;
      displayGeneratedContent(result.data.generated);
      goToStep3();
    } else {
      throw new Error(result.message || 'Generation failed');
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    showResultModal(
      'error',
      'Generation Failed',
      `Generation failed: ${errorMessage}`,
    );
  }

  generateBtn.disabled = false;
  generateBtn.innerHTML = originalText;
};

const displayGeneratedContent = (content: any): void => {
  if (!elements.generatedContent) {
    return;
  }

  elements.generatedContent.innerHTML = '';
  const jsonContent = createJSONContent(content);
  elements.generatedContent.appendChild(jsonContent);
};

const createJSONContent = (content: string): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'cursor-card p-6';

  const jsonPre = document.createElement('pre');
  jsonPre.className =
    'text-sm text-cursor-text whitespace-pre-wrap break-words overflow-auto scrollbar-hide max-h-96';
  jsonPre.textContent = JSON.stringify(content, null, 2);

  container.appendChild(jsonPre);
  return container;
};
