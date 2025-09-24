import {
  BLACKLANE_CONTENT_GENERATION_PROMPT,
  PromptTemplateParams,
} from './blacklane-content-generation-prompt';
import { getComponentSchemas, getFallbackSchemas } from './schemas';
import { ComponentSchema, GenerationParams } from './types';

const buildComponentExamples = (schemas: ComponentSchema[]): string => {
  return schemas
    .map((schema, index) => {
      const isLast = index === schemas.length - 1;
      const jsonString = JSON.stringify(schema, null, 6).replace(/^/gm, '    ');
      return jsonString + (isLast ? '' : ',');
    })
    .join('\n');
};

const buildContextInfo = (
  conversationContext?: Array<{ role: string; content: string }>,
): string => {
  if (!conversationContext || conversationContext.length === 0) {
    return '';
  }

  return '\n\nCONVERSATION CONTEXT:\nBased on our previous conversation, the user has provided additional details. Please use this context to create more targeted content.\n';
};

export const buildPrompt = async (
  params: GenerationParams,
): Promise<string> => {
  const {
    mainKeywords,
    secondaryKeywords,
    questions,
    contentTypes,
    language,
    conversationContext,
  } = params;

  const contextInfo = buildContextInfo(conversationContext);

  let componentExamples = '';
  try {
    const componentSchemas = await getComponentSchemas(contentTypes);
    componentExamples = buildComponentExamples(componentSchemas);
  } catch {
    console.warn('Could not load component schemas, using fallback examples');
    const fallbackSchemas = getFallbackSchemas(contentTypes);
    componentExamples = buildComponentExamples(fallbackSchemas);
  }

  const promptParams: PromptTemplateParams = {
    mainKeywords,
    secondaryKeywords: secondaryKeywords || '',
    questions: questions || '',
    language,
    contentTypes,
    contextInfo,
    componentExamples,
  };

  return BLACKLANE_CONTENT_GENERATION_PROMPT(promptParams);
};
