/**
 * Blacklane Content Generation Prompt Template
 *
 * This file contains the main AI prompt template used for generating
 * Blacklane landing page content including SEO text, hero sections, and FAQs.
 *
 * The template includes strict requirements for:
 * - Unique link generation (no duplicates)
 * - SEO optimization
 * - Content structure and formatting
 * - Link validation against Blacklane sitemap
 */

export interface PromptTemplateParams {
  mainKeywords: string;
  secondaryKeywords: string;
  questions: string;
  language: string;
  contentTypes: string[];
  contextInfo: string;
  componentExamples: string;
}

export const BLACKLANE_CONTENT_GENERATION_PROMPT = (
  params: PromptTemplateParams,
): string => {
  const {
    mainKeywords,
    secondaryKeywords,
    questions,
    language,
    contentTypes,
    contextInfo,
    componentExamples,
  } = params;

  return `Write a landing page for Blacklane with these parameters:

Main keywords: ${mainKeywords}
Secondary keyword: ${secondaryKeywords || 'Not provided'}
Questions: ${questions || 'Not provided'}
Language: ${language}
Content types needed: ${contentTypes.join(', ')}${contextInfo}

Links: Include related Blacklane minimum 3 unique links within the text by naturally placing them as anchor text.

CRITICAL LINK REQUIREMENTS:
- You MUST only use URLs that exist in the Blacklane sitemap. Before including any link, verify it exists at: https://www.blacklane.com/sitemap.xml
- ABSOLUTELY NO DUPLICATE LINKS - each URL can only be used ONCE across all content
- If you need to reference the same service/location again, use different anchor text but DO NOT repeat the same URL

Focus on URLs that match the language (${language}) and are relevant to the main keyword "${mainKeywords}". Look for:
- City pages: /${language}/cities-[city-name]/ 
- Airport transfer pages: /${language}/airport-transfer-[city]/

Example of proper link formatting:

Singapore is one of the most economically powerful countries in Asia and one of the world's busiest ports, making it a major destination for international business travelers. It's no surprise, then, that it's also [one of the best airports in the world](https://blog.blacklane.com/travel/airports/singapore-airport-the-best-in-the-world/). Getting into such a bustling city from the Changi Airport (SIN) can quickly become stressful, especially when working you're under the pressure of time constraints, but there's no need for your Singapore airport transfers to be difficult - consider an [alternative to a Singapore taxi](/

RETURN ONLY VALID JSON (no markdown, no prose):
{
  "mainKeywords": "${mainKeywords}",
  "secondaryKeywords": "${secondaryKeywords}",
  "language": "${language}",
  "metaTitle": "SEO optimized title based on primary keywords (max 60 chars)",
  "metaDescription": "SEO optimized description based on main and secondary keywords (max 150 chars)",
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
- Meta title: Maximum 60 characters, based on primary keywords, Title Case (e.g. Hello World)
- Meta description: Maximum 150 characters, based on main and secondary keywords
- H1: max 30 characters Title Case (e.g. Hello World) - ONLY for H1 titles
- H2: Normal sentence case (e.g. Hello world) - NOT Title Case
- Body copy: minimum 700 characters, maximum 1050 characters per seoText section
- CRITICAL: If seoText is requested, generate EXACTLY 3 seoText sections with unique content
- CRITICAL: For seoText components, do NOT generate imageAltText or assign images - leave these fields empty
- Hero components: Do NOT generate CTA text, CTA links, or CTA buttons - leave these empty
- FAQ: minimum of 3 questions, maximum of 8, decide number of questions based on keywords
- CRITICAL: Include minimum 3 unique Blacklane links within the text by naturally placing them as anchor text
- CRITICAL: Each URL must be used only ONCE - NO DUPLICATE LINKS allowed anywhere in the content
- CRITICAL: Before adding any link, verify it exists in https://www.blacklane.com/sitemap.xml - DO NOT create or invent URLs
- Use markdown-style links in text: [anchor text](url)
- Prioritize links that match the language "${language}" and main keyword "${mainKeywords}"
- Ensure all 3+ links point to different, unique URLs - never repeat the same URL
- Also include local, relevant information to tourists and locals about the area - tourist hotspots, cultural info, etc
- Make content relevant to the main keywords: "${mainKeywords}"
- Use provided main keywords: "${mainKeywords}"
- Use provided secondary keywords: "${secondaryKeywords || 'None provided'}"
- Address provided questions: "${questions || 'None provided'}"
- Return only valid JSON object
- Use ${language} language for all content
- In metadata.internalLinksUsed, list all internal links you included`;
};
