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
      releaseMode = 'direct',
      releaseConfig,
      imageUrls = {},
    }: PublishingRequest = req.body;

    if (!generatedContent) {
      return res.status(400).json({
        error: 'Missing generated content',
        message: 'generatedContent field is required',
      });
    }

    let publishResult;

    if (releaseMode === 'release' && releaseConfig) {
      publishResult = await publisher.publishPageAsRelease(
        generatedContent,
        releaseConfig.title || 'AI Generated Page Release',
        {
          imageUrls,
        },
      );
    } else {
      publishResult = await publisher.publishStaticPage(generatedContent, {
        imageUrls,
      });
    }

    res.json({
      success: publishResult.success,
      message: publishResult.success
        ? releaseMode === 'release'
          ? 'Release created successfully'
          : 'Static page published to Contentful successfully'
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
