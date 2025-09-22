import { GenerationParams, ComponentSchema } from './types';
import { getComponentSchemas, getFallbackSchemas } from './schemas';

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
  const { topic, keywords, contentTypes, language, conversationContext } =
    params;

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

  return `Write a landing page for Blacklane with these parameters:

Main keyword: ${keywords}
Topic: ${topic}
Language: ${language}
Content types needed: ${contentTypes.join(', ')}${contextInfo}

Links: Include related Blacklane minimum 3 unique links within the text by naturally placing them as anchor text, here is an example of the formatting of links:

Singapore is one of the most economically powerful countries in Asia and one of the world's busiest ports, making it a major destination for international business travelers. It's no surprise, then, that it's also [one of the best airports in the world](https://blog.blacklane.com/travel/airports/singapore-airport-the-best-in-the-world/). Getting into such a bustling city from the Changi Airport (SIN) can quickly become stressful, especially when working you're under the pressure of time constraints, but there's no need for your Singapore airport transfers to be difficult - consider an [alternative to a Singapore taxi](/en/cities-singapore/) trip.

RETURN ONLY VALID JSON (no markdown, no prose):
{
  "topic": "${topic}",
  "language": "${language}",
  "generatedSections": [
${componentExamples}
  ],
  "metadata": {
    "keywordsUsed": ["keyword1", "keyword2"],
    "internalLinksUsed": ["link1", "link2", "link3"],
    "generatedAt": "${new Date().toISOString()}"
  }
}

Requirements:
- Meta title: Ideally 580 pixels AP Title Case
- Meta description: Ideally 920 pixels
- H1: max 30 characters AP Title Case
- H2: Sentence case
- Body copy: minimum 700 characters, maximum 1050 characters per seoText section
- FAQ: minimum of 3 questions, maximum of 12, decide number of questions based on keywords
- Include related Blacklane minimum 3 unique links within the text by naturally placing them as anchor text
- Use markdown-style links in text: [anchor text](url)
- Also include local, relevant information to tourists and locals about the area - tourist hotspots, cultural info, etc
- Make content relevant to the topic: "${topic}"
- Use provided keywords: "${keywords}"
- Return only valid JSON object
- Use ${language} language for all content`;
};
