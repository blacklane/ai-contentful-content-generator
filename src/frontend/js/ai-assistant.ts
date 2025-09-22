import { elements } from './dom-elements.js';
import type { AIMessage } from './state.js';
import { AppState } from './state.js';

// AI Assistant Functions with TypeScript types

export const initAIAssistant = (): void => {
  if (
    elements.aiConversation &&
    elements.aiConversation.children.length === 0
  ) {
    addAIMessage(
      "Hello! I'm here to help you plan your content. What specific goals do you have for this page?",
    );
  }
};

export const addAIMessage = (
  message: string,
  isUser: boolean = false,
): void => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `p-4 rounded-lg ai-message ${isUser ? 'ai-message-user' : 'ai-message-assistant'}`;

  const formattedMessage = formatAIMessage(message);
  messageDiv.innerHTML = formattedMessage;

  if (elements.aiConversation) {
    elements.aiConversation.appendChild(messageDiv);
    elements.aiConversation.scrollTop = elements.aiConversation.scrollHeight;
  }

  const aiMessage: AIMessage = {
    role: isUser ? 'user' : 'assistant',
    content: message,
    timestamp: Date.now(),
  };

  AppState.projectData.aiConversation.push(aiMessage);
};

const formatAIMessage = (message: string): string => {
  let formatted = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const lines = formatted.split('\n');
  let inOrderedList = false;
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const numberedListMatch = line.match(/^(\d+)\.\s+(.+)$/);

    if (numberedListMatch) {
      if (!inOrderedList) {
        formattedLines.push('<ol>');
        inOrderedList = true;
      }
      formattedLines.push(`<li>${numberedListMatch[2]}</li>`);
    } else {
      if (inOrderedList) {
        formattedLines.push('</ol>');
        inOrderedList = false;
      }
      if (line) {
        formattedLines.push(`<p>${line}</p>`);
      }
    }
  }

  if (inOrderedList) {
    formattedLines.push('</ol>');
  }

  formatted = formattedLines.join('').replace(/<p><\/p>/g, '');
  return formatted;
};

const showAILoading = (): void => {
  const loadingIndicator = document.getElementById('aiLoadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
  }
};

const hideAILoading = (): void => {
  const loadingIndicator = document.getElementById('aiLoadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.classList.add('hidden');
  }
};

interface AIResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
}

export const sendAIMessage = async (): Promise<void> => {
  if (!elements.aiInput || !elements.aiSendBtn) {
    return;
  }

  const message = elements.aiInput.value.trim();
  if (!message) {
    return;
  }

  addAIMessage(message, true);
  elements.aiInput.value = '';
  elements.aiSendBtn.disabled = true;

  showAILoading();

  try {
    const response = await fetch(
      'https://ai-chat.blacklane.net/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sk-449154ce78824204b0fbd3ac94abe55f',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'seo-landing-page-generator',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert content strategist and SEO specialist helping plan a webpage. Provide specific, actionable recommendations about content structure, target audience, and SEO optimization. Use numbered lists and bold text to make your advice clear and actionable. Keep responses helpful but concise.',
            },
            ...AppState.projectData.aiConversation.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: 'user',
              content: `Current project: "${AppState.projectData.topic}" with keywords: "${AppState.projectData.keywords}". ${message}`,
            },
          ],
          temperature: 0.7,
        }),
      },
    );

    const data: AIResponse = await response.json();
    if (data.choices && data.choices[0]) {
      addAIMessage(data.choices[0].message.content);
    }
  } catch (error) {
    addAIMessage('Sorry, I had trouble connecting. Please try again.');
  } finally {
    hideAILoading();
    elements.aiSendBtn.disabled = false;
  }
};
