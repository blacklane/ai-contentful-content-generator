import { Request, Response } from 'express';
import { PublishingRequest } from '../types';

export const publishContentRoute = async (req: Request, res: Response) => {
  try {
    const { createContentfulPublisher } = await import(
      '../../contentful/client'
    );

    const publisher = createContentfulPublisher();
    if (!publisher) {
      return res.status(500).json({
        error: 'Contentful not configured',
        message:
          'Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN environment variables',
        requiredEnvVars: ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_MANAGEMENT_TOKEN'],
      });
    }

    const isConnected = await publisher.testConnection();
    if (!isConnected) {
      return res.status(500).json({
        error: 'Contentful connection failed',
        message: 'Could not connect to Contentful Management API',
      });
    }

    const {
      generatedContent,
      releaseConfig,
      imageUrls = {},
    }: PublishingRequest = req.body;

    if (!generatedContent) {
      return res.status(400).json({
        error: 'Missing generated content',
        message: 'generatedContent field is required',
      });
    }

    if (!releaseConfig) {
      return res.status(400).json({
        error: 'Missing release configuration',
        message: 'releaseConfig field is required',
      });
    }

    // Use provided release title, or fallback to page metaTitle, or final fallback
    const releaseTitle: string =
      releaseConfig.title ||
      (generatedContent.metaTitle as string) ||
      'AI Generated Page Release';

    const publishResult = await publisher.publishPageAsRelease(
      generatedContent,
      releaseTitle,
      {
        imageUrls,
      },
    );

    res.json({
      success: publishResult.success,
      message: publishResult.success
        ? 'Release created successfully'
        : 'Publishing failed',
      data: {
        pageId:
          'pageResult' in publishResult
            ? publishResult.pageResult?.entryId
            : (publishResult as any).entryId,
        releaseId:
          'releaseResult' in publishResult
            ? publishResult.releaseResult?.releaseId
            : undefined,
        metadata:
          'pageResult' in publishResult
            ? publishResult.pageResult?.metadata
            : (publishResult as any).metadata,
        errors:
          'pageResult' in publishResult
            ? publishResult.pageResult?.errors
            : (publishResult as any).errors,
        contentfulSpace: process.env.CONTENTFUL_SPACE_ID,
        environment: process.env.CONTENTFUL_ENVIRONMENT_ID || 'master',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Publishing endpoint error:', error);
    res.status(500).json({
      error: 'Publishing failed',
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    });
  }
};
