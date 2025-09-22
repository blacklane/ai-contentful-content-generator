import { Request, Response } from 'express';
import { generateContent, testConnection } from '../../ai/client';
import { GenerationRequest } from '../types';

export const generateContentRoute = async (req: Request, res: Response) => {
  try {
    const { validateGenerationRequest } = await import(
      '../../validation/schemas'
    );

    const validation = validateGenerationRequest(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
        received: req.body,
      });
    }

    const { topic, keywords, components, language, conversationContext } =
      validation.data! as GenerationRequest;

    const isConnected = await testConnection();
    if (!isConnected) {
      return res.status(500).json({
        error: 'AI service unavailable',
        message: 'Could not connect to Blacklane AI endpoint',
      });
    }

    const baseComponents = components || ['hero'];
    const contentTypesWithHero = [
      'hero',
      ...baseComponents.filter(c => c !== 'hero'),
    ];

    const aiResponse = await generateContent({
      topic,
      keywords,
      contentTypes: contentTypesWithHero,
      language: language || 'en',
      conversationContext,
    });

    let parsedContent;
    try {
      parsedContent = JSON.parse(aiResponse.content);
    } catch (parseError) {
      console.error('❌ Failed to parse AI JSON response');
      parsedContent = { raw: aiResponse.content };
    }

    res.json({
      success: true,
      message: 'Content generated successfully',
      data: {
        generated: parsedContent,
        usage: aiResponse.usage,
        timestamp: new Date().toISOString(),
        params: { topic, keywords, contentTypes: components, language },
      },
    });
  } catch (error: any) {
    console.error('❌ Generation endpoint error:', error);
    res.status(500).json({
      error: 'Content generation failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
