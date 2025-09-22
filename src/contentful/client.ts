import { createClient } from 'contentful-management';
import { COMPONENT_PRIORITY_ORDER } from '../constants';
import {
  getFAQEntryMetadata,
  mapAIFAQToAccordion,
  mapAIFAQsToContentful,
  validateAccordionEntry,
  validateFAQEntry,
} from './faq-mappings';
import {
  getHeroEntryMetadata,
  mapAIHeroToContentful,
  validateContentfulHeroEntry,
} from './mappings';
import {
  getPageEntryMetadata,
  mapAIDataToContentfulPage,
  validateContentfulPageEntry,
} from './page-mappings';
import {
  getSEOTextEntryMetadata,
  mapAISEOTextToContentful,
  validateSEOTextEntry,
} from './seo-text-mappings';

export interface ContentfulConfig {
  spaceId: string;
  accessToken: string;
  environment: string;
  locale: string;
}

export interface PublishResult {
  success: boolean;
  entryId?: string;
  errors?: string[];
  metadata?: any;
}

export interface ReleaseResult {
  success: boolean;
  releaseId?: string;
  errors?: string[];
  metadata?: any;
}

export class ContentfulPublisher {
  private client: any;
  private config: ContentfulConfig;

  constructor(config: ContentfulConfig) {
    this.config = config;
    this.client = createClient({
      accessToken: config.accessToken,
    });
  }

  // Sort component IDs by priority order
  private sortComponentIdsByPriority(componentTypeIdMap: {
    [type: string]: string[];
  }): string[] {
    const priorityOrder = COMPONENT_PRIORITY_ORDER;
    const sortedIds: string[] = [];

    // Add components in priority order
    for (const componentType of priorityOrder) {
      if (componentTypeIdMap[componentType]) {
        sortedIds.push(...componentTypeIdMap[componentType]);
      }
    }

    // Add any remaining components not in priority list
    for (const [componentType, ids] of Object.entries(componentTypeIdMap)) {
      if (!priorityOrder.includes(componentType as any)) {
        sortedIds.push(...ids);
      }
    }

    return sortedIds;
  }

  async testConnection(): Promise<boolean> {
    try {
      const space = await this.client.getSpace(this.config.spaceId);
      await space.getEnvironment(this.config.environment);
      return true;
    } catch (error) {
      console.error('❌ Contentful connection test failed:', error);
      return false;
    }
  }

  // Release management methods
  async createRelease(
    title: string,
    entryIds: string[] = [],
  ): Promise<ReleaseResult> {
    try {
      console.log('🚀 Creating Contentful release...');

      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      // Prepare release data
      const releaseData: any = {
        title,
        entities: {
          sys: {
            type: 'Array',
          },
          items: entryIds.map(entryId => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: entryId,
            },
          })),
        },
      };

      // Create the release
      const release = await environment.createRelease(releaseData);
      console.log(`✅ Release created with ID: ${release.sys.id}`);

      return {
        success: true,
        releaseId: release.sys.id,
        metadata: {
          title: release.title,
          entryCount: entryIds.length,
          contentfulUrl: `https://app.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment}/releases/${release.sys.id}`,
        },
      };
    } catch (error: any) {
      console.error('❌ Release creation failed:', error);
      return {
        success: false,
        errors: ['Release creation failed', error.message || 'Unknown error'],
      };
    }
  }

  async addEntriesToRelease(
    releaseId: string,
    entryIds: string[],
  ): Promise<ReleaseResult> {
    try {
      console.log(
        `📦 Adding ${entryIds.length} entries to release ${releaseId}...`,
      );

      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      // Get the existing release
      const release = await environment.getRelease(releaseId);

      // Add new entries to existing ones
      const existingEntryIds = release.entities.items.map(
        (item: any) => item.sys.id,
      );
      const allEntryIds = [...new Set([...existingEntryIds, ...entryIds])]; // Remove duplicates

      // Update release with all entries
      release.entities.items = allEntryIds.map(entryId => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: entryId,
        },
      }));

      const updatedRelease = await release.update();
      console.log(
        `✅ Added entries to release. Total entries: ${allEntryIds.length}`,
      );

      return {
        success: true,
        releaseId: updatedRelease.sys.id,
        metadata: {
          title: updatedRelease.title,
          entryCount: allEntryIds.length,
          addedEntries: entryIds.length,
        },
      };
    } catch (error: any) {
      console.error('❌ Adding entries to release failed:', error);
      return {
        success: false,
        errors: [
          'Adding entries to release failed',
          error.message || 'Unknown error',
        ],
      };
    }
  }

  async publishRelease(releaseId: string): Promise<ReleaseResult> {
    try {
      console.log(`📤 Publishing release ${releaseId}...`);

      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      const release = await environment.getRelease(releaseId);
      const publishedRelease = await release.publish();

      console.log('🎉 Release published successfully!');

      return {
        success: true,
        releaseId: publishedRelease.sys.id,
        metadata: {
          title: publishedRelease.title,
          publishedAt: publishedRelease.sys.publishedAt,
          entryCount: publishedRelease.entities.items.length,
        },
      };
    } catch (error: any) {
      console.error('❌ Release publishing failed:', error);
      return {
        success: false,
        errors: ['Release publishing failed', error.message || 'Unknown error'],
      };
    }
  }

  async getReleases(): Promise<{
    success: boolean;
    releases?: any[];
    errors?: string[];
  }> {
    try {
      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      const releases = await environment.getReleases();

      return {
        success: true,
        releases: releases.items,
      };
    } catch (error: any) {
      console.error('❌ Getting releases failed:', error);
      return {
        success: false,
        errors: ['Getting releases failed', error.message || 'Unknown error'],
      };
    }
  }

  async publishHeroComponent(
    aiHeroData: any,
    options: {
      imageAssetId?: string;
    } = {},
  ): Promise<PublishResult> {
    try {
      console.log('🚀 Starting Contentful Hero publishing...');

      // Get space and environment
      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      // Transform AI data to Contentful format
      const contentfulEntry = mapAIHeroToContentful(
        aiHeroData,
        this.config.locale,
        options.imageAssetId,
      );

      // Validate entry before publishing
      const validation = validateContentfulHeroEntry(
        contentfulEntry,
        this.config.locale,
      );
      if (!validation.isValid) {
        return {
          success: false,
          errors: [
            'Validation failed',
            ...validation.missingFields.map(
              f => `Missing required field: ${f}`,
            ),
            ...validation.errors,
          ],
        };
      }

      // Create entry
      console.log('📝 Creating Contentful entry...');
      const entry = await environment.createEntry('spHero', contentfulEntry);
      console.log(`✅ Entry created with ID: ${entry.sys.id}`);

      // Entry created as draft for manual review and publishing

      // Get metadata
      const metadata = getHeroEntryMetadata(aiHeroData, this.config.locale);

      return {
        success: true,
        entryId: entry.sys.id,
        metadata: {
          ...metadata,
          contentfulUrl: `https://app.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment}/entries/${entry.sys.id}`,
          published: false,
          draft: true,
        },
      };
    } catch (error: any) {
      console.error('❌ Contentful publishing failed:', error);

      let errorMessage = 'Unknown error';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        errors: ['Publishing failed', errorMessage],
      };
    }
  }

  async createImageAsset(
    imageUrl: string,
    title: string,
    description?: string,
  ): Promise<string | null> {
    try {
      console.log('🖼️ Creating image asset in Contentful...');

      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      // Create asset
      const asset = await environment.createAsset({
        fields: {
          title: {
            [this.config.locale]: title,
          },
          description: description
            ? {
                [this.config.locale]: description,
              }
            : undefined,
          file: {
            [this.config.locale]: {
              contentType: 'image/jpeg', // Assume JPEG, could be improved
              fileName: `${title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
              upload: imageUrl,
            },
          },
        },
      });

      // Process asset
      await asset.processForAllLocales();

      console.log(`✅ Asset created with ID: ${asset.sys.id}`);
      return asset.sys.id;
    } catch (error: any) {
      console.error('❌ Asset creation failed:', error);
      return null;
    }
  }

  async publishFAQComponent(
    aiFAQData: any,
    defaultImageAssetId: string,
    _options: Record<string, unknown> = {},
  ): Promise<PublishResult> {
    try {
      console.log('❓ Starting FAQ component publishing...');
      console.log('📋 FAQ data received:', JSON.stringify(aiFAQData, null, 2));

      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      const accordionItemIds: string[] = [];

      // Step 1: Create Accordion Items for each FAQ
      console.log('📋 Creating Accordion Items...');
      for (const faqItem of aiFAQData.items || []) {
        const accordionEntry = mapAIFAQToAccordion(faqItem, this.config.locale);

        // Validate Accordion entry
        const validation = validateAccordionEntry(
          accordionEntry,
          this.config.locale,
        );
        if (!validation.isValid) {
          console.log('❌ Accordion validation failed:', validation.errors);
          continue;
        }

        // Create Accordion entry
        const accordionEntryResult = await environment.createEntry(
          'spAccordionItem',
          accordionEntry,
        );
        console.log(
          `✅ Accordion item created: ${accordionEntryResult.sys.id}`,
        );

        // Accordion entry created as draft

        accordionItemIds.push(accordionEntryResult.sys.id);
      }

      // Step 2: Create FAQ component with Accordion references
      console.log('❓ Creating FAQ component...');
      const faqEntry = mapAIFAQsToContentful(
        aiFAQData,
        accordionItemIds,
        defaultImageAssetId,
        this.config.locale,
      );

      // Validate FAQ entry
      const validation = validateFAQEntry(faqEntry, this.config.locale);
      if (!validation.isValid) {
        return {
          success: false,
          errors: [
            'FAQ validation failed',
            ...validation.missingFields.map(
              f => `Missing required field: ${f}`,
            ),
            ...validation.errors,
          ],
        };
      }

      // Create FAQ entry
      const faqEntryResult = await environment.createEntry('spFaQs', faqEntry);
      console.log(`✅ FAQ component created: ${faqEntryResult.sys.id}`);

      // FAQ entry created as draft

      const metadata = getFAQEntryMetadata(
        aiFAQData,
        accordionItemIds,
        this.config.locale,
      );

      return {
        success: true,
        entryId: faqEntryResult.sys.id,
        metadata: {
          ...metadata,
          contentfulUrl: `https://app.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment}/entries/${faqEntryResult.sys.id}`,
          published: false,
          draft: true,
        },
      };
    } catch (error: any) {
      console.error('❌ FAQ publishing failed:', error);
      return {
        success: false,
        errors: ['FAQ publishing failed', error.message || 'Unknown error'],
      };
    }
  }

  async publishSEOTextComponent(
    aiSEOTextData: any,
    defaultImageAssetId: string,
    _options: Record<string, unknown> = {},
  ): Promise<PublishResult> {
    try {
      console.log('📝 Starting SEO Text component publishing...');

      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      // Create SEO Text component
      console.log('📝 Creating SEO Text component...');
      const seoTextEntry = mapAISEOTextToContentful(
        aiSEOTextData,
        defaultImageAssetId,
        this.config.locale,
      );

      // Validate SEO Text entry
      const validation = validateSEOTextEntry(seoTextEntry, this.config.locale);
      if (!validation.isValid) {
        return {
          success: false,
          errors: [
            'SEO Text validation failed',
            ...validation.missingFields.map(
              f => `Missing required field: ${f}`,
            ),
            ...validation.errors,
          ],
        };
      }

      // Create SEO Text entry
      const seoTextEntryResult = await environment.createEntry(
        'spTwoColumnComponent',
        seoTextEntry,
      );
      console.log(
        `✅ SEO Text component created: ${seoTextEntryResult.sys.id}`,
      );

      // SEO Text entry created as draft

      const metadata = getSEOTextEntryMetadata(
        aiSEOTextData,
        this.config.locale,
      );

      return {
        success: true,
        entryId: seoTextEntryResult.sys.id,
        metadata: {
          ...metadata,
          contentfulUrl: `https://app.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment}/entries/${seoTextEntryResult.sys.id}`,
          published: false,
          draft: true,
        },
      };
    } catch (error: any) {
      console.error('❌ SEO Text publishing failed:', error);
      return {
        success: false,
        errors: [
          'SEO Text publishing failed',
          error.message || 'Unknown error',
        ],
      };
    }
  }

  async publishStaticPage(
    aiGeneratedData: any,
    options: {
      imageUrls?: { [componentType: string]: string };
    } = {},
  ): Promise<PublishResult> {
    try {
      console.log('📄 Starting Custom Static Page publishing...');

      // Get space and environment
      const space = await this.client.getSpace(this.config.spaceId);
      const environment = await space.getEnvironment(this.config.environment);

      // Extract page data
      const pageData = aiGeneratedData.generated || aiGeneratedData;

      // Ensure required fields exist with fallbacks
      if (!pageData.topic) {
        pageData.topic = 'AI Generated Page';
      }
      if (!pageData.language) {
        pageData.language = 'en';
      }

      console.log('🔍 Page data extracted:', {
        topic: pageData.topic,
        keywords: pageData.keywords,
        language: pageData.language,
        hasMetadata: !!pageData.metadata,
        metadataKeys: pageData.metadata ? Object.keys(pageData.metadata) : [],
        sectionsCount: pageData.generatedSections?.length || 0,
      });

      // Check if keywords are in metadata
      if (!pageData.keywords && pageData.metadata?.keywordsUsed) {
        pageData.keywords = pageData.metadata.keywordsUsed.join(', ');
        console.log('📝 Keywords extracted from metadata:', pageData.keywords);
      }

      // Fallback for keywords if still missing
      if (!pageData.keywords) {
        pageData.keywords = 'premium, professional, quality';
        console.log('📝 Using fallback keywords:', pageData.keywords);
      }

      const componentIds: string[] = [];
      const componentTypeIdMap: { [type: string]: string[] } = {};

      // Step 1: Create all components first
      console.log('🧩 Creating components...');
      console.log(
        '📋 Sections to process:',
        pageData.generatedSections?.map((s: any) => s.type) || [],
      );

      // Ensure hero component is always present - if not found, create a default one
      const sections = pageData.generatedSections || [];
      const hasHero = sections.some((section: any) => section.type === 'hero');

      if (!hasHero) {
        console.log(
          '⚠️ No hero component found in generated sections, adding default hero...',
        );
        sections.unshift({
          type: 'hero',
          title: pageData.topic || 'Premium Service',
          subtitle: `Discover our ${pageData.topic?.toLowerCase() || 'premium service'}`,
          ctaText: 'Get Started',
          ctaLink: '/contact',
          imageAltText: `${pageData.topic || 'Premium service'} hero image`,
        });
      }

      for (const section of sections) {
        console.log(`🔍 Processing section type: ${section.type}`);
        if (section.type === 'hero') {
          console.log('🎯 Creating Hero component...');

          // Create hero component
          const heroResult = await this.publishHeroComponent(section, {
            imageAssetId: options.imageUrls?.hero
              ? (await this.createImageAsset(
                  options.imageUrls.hero,
                  section.title || 'Hero Image',
                  section.imageAltText,
                )) || undefined
              : undefined,
          });

          if (heroResult.success && heroResult.entryId) {
            componentIds.push(heroResult.entryId);
            if (!componentTypeIdMap['hero']) {
              componentTypeIdMap['hero'] = [];
            }
            componentTypeIdMap['hero'].push(heroResult.entryId);
            console.log(`✅ Hero component created: ${heroResult.entryId}`);
          } else {
            console.log('❌ Hero component failed:', heroResult.errors);
          }
        } else if (section.type === 'faqs') {
          console.log('❓ Creating FAQ component...');

          // Use the same default image as Hero component
          const defaultImageAssetId = '4yVKNgR5TO4py6zdvKRqik';

          const faqResult = await this.publishFAQComponent(
            section,
            defaultImageAssetId,
            {},
          );

          if (faqResult.success && faqResult.entryId) {
            componentIds.push(faqResult.entryId);
            if (!componentTypeIdMap['faqs']) {
              componentTypeIdMap['faqs'] = [];
            }
            componentTypeIdMap['faqs'].push(faqResult.entryId);
            console.log(`✅ FAQ component created: ${faqResult.entryId}`);
          } else {
            console.log('❌ FAQ component failed:', faqResult.errors);
          }
        } else if (section.type === 'seoText') {
          console.log('📝 Creating SEO Text component...');

          // Use the same default image as Hero component
          const defaultImageAssetId = '4yVKNgR5TO4py6zdvKRqik';

          const seoTextResult = await this.publishSEOTextComponent(
            section,
            defaultImageAssetId,
            {},
          );

          if (seoTextResult.success && seoTextResult.entryId) {
            componentIds.push(seoTextResult.entryId);
            if (!componentTypeIdMap['seoText']) {
              componentTypeIdMap['seoText'] = [];
            }
            componentTypeIdMap['seoText'].push(seoTextResult.entryId);
            console.log(
              `✅ SEO Text component created: ${seoTextResult.entryId}`,
            );
          } else {
            console.log('❌ SEO Text component failed:', seoTextResult.errors);
          }
        } else {
          console.log(`⚠️ Unknown component type: ${section.type}`);
        }
      }

      // Step 2: Sort component IDs by priority order
      const sortedComponentIds =
        this.sortComponentIdsByPriority(componentTypeIdMap);
      console.log('🔄 Sorted component IDs by priority:', sortedComponentIds);

      // Step 3: Create the page with component references
      console.log('📄 Creating Custom Static Page...');
      const pageEntry = mapAIDataToContentfulPage(
        pageData,
        sortedComponentIds,
        this.config.locale,
      );

      // Validate page entry
      const validation = validateContentfulPageEntry(
        pageEntry,
        this.config.locale,
      );
      if (!validation.isValid) {
        return {
          success: false,
          errors: [
            'Page validation failed',
            ...validation.missingFields.map(
              f => `Missing required field: ${f}`,
            ),
            ...validation.errors,
          ],
        };
      }

      // Create page entry
      console.log('📝 Creating page entry...');
      const pageEntryResult = await environment.createEntry(
        'customStaticPage',
        pageEntry,
      );
      console.log(`✅ Page created with ID: ${pageEntryResult.sys.id}`);

      // Page entry created as draft for manual review and publishing

      // Get metadata
      const metadata = getPageEntryMetadata(
        pageData,
        sortedComponentIds,
        this.config.locale,
      );

      return {
        success: true,
        entryId: pageEntryResult.sys.id,
        metadata: {
          ...metadata,
          contentfulUrl: `https://app.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment}/entries/${pageEntryResult.sys.id}`,
          published: false,
          draft: true,
          componentsCreated: sortedComponentIds.length,
          componentIds: sortedComponentIds,
        },
      };
    } catch (error: any) {
      console.error('❌ Static page publishing failed:', error);

      let errorMessage = 'Unknown error';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        errors: ['Page publishing failed', errorMessage],
      };
    }
  }

  async publishPageAsRelease(
    aiGeneratedData: any,
    releaseName: string,
    options: {
      imageUrls?: { [componentType: string]: string };
    } = {},
  ): Promise<{
    success: boolean;
    pageResult?: PublishResult;
    releaseResult?: ReleaseResult;
    summary: {
      totalComponents: number;
      releaseId?: string;
    };
  }> {
    try {
      console.log('🚀 Publishing page as release...');

      // Step 1: Create all page content as drafts
      const pageResult = await this.publishStaticPage(aiGeneratedData, {
        imageUrls: options.imageUrls,
      });

      if (!pageResult.success || !pageResult.entryId) {
        return {
          success: false,
          pageResult,
          summary: { totalComponents: 0 },
        };
      }

      // Step 2: Collect all created entry IDs
      const allEntryIds = [pageResult.entryId];
      if (pageResult.metadata?.componentIds) {
        allEntryIds.push(...pageResult.metadata.componentIds);
      }

      console.log(`📦 Collected ${allEntryIds.length} entries for release`);

      // Step 3: Create release with all entries
      const releaseResult = await this.createRelease(releaseName, allEntryIds);

      if (!releaseResult.success) {
        return {
          success: false,
          pageResult,
          releaseResult,
          summary: { totalComponents: allEntryIds.length },
        };
      }

      // Release will remain as draft for manual review and publishing

      console.log('🎉 Page published as release successfully!');

      return {
        success: true,
        pageResult,
        releaseResult,
        summary: {
          totalComponents: allEntryIds.length,
          releaseId: releaseResult.releaseId,
        },
      };
    } catch (error: any) {
      console.error('❌ Publishing page as release failed:', error);
      return {
        success: false,
        summary: { totalComponents: 0 },
      };
    }
  }

  async publishGeneratedContent(
    aiGeneratedData: any,
    options: {
      imageUrls?: { [componentType: string]: string };
    } = {},
  ): Promise<{
    success: boolean;
    results: { [componentType: string]: PublishResult };
    summary: {
      totalComponents: number;
      successCount: number;
      failureCount: number;
    };
  }> {
    const results: { [componentType: string]: PublishResult } = {};
    let successCount = 0;
    let failureCount = 0;

    console.log('🚀 Publishing multiple AI generated components...');
    console.log(
      '📝 Full AI Generated Data:',
      JSON.stringify(aiGeneratedData, null, 2),
    );
    console.log('⚙️ Options:', JSON.stringify(options, null, 2));

    // Handle both direct format and nested format (from UI)
    let sectionsToProcess = aiGeneratedData.generatedSections;

    if (!sectionsToProcess && aiGeneratedData.generated?.generatedSections) {
      console.log('📝 Found generatedSections in nested format (from UI)');
      sectionsToProcess = aiGeneratedData.generated.generatedSections;
    }

    if (!sectionsToProcess) {
      console.log('❌ No generatedSections found in aiGeneratedData');
      console.log('🔍 Available keys:', Object.keys(aiGeneratedData));
      if (aiGeneratedData.generated) {
        console.log(
          '🔍 Available keys in generated:',
          Object.keys(aiGeneratedData.generated),
        );
      }
      return {
        success: false,
        results: {},
        summary: { totalComponents: 0, successCount: 0, failureCount: 1 },
      };
    }

    console.log(`📋 Found ${sectionsToProcess.length} sections to process`);

    // Process each generated section
    for (const section of sectionsToProcess) {
      if (section.type === 'hero') {
        let imageAssetId: string | undefined;

        // Create image asset if URL provided
        if (options.imageUrls?.hero) {
          imageAssetId =
            (await this.createImageAsset(
              options.imageUrls.hero,
              section.title || 'Hero Image',
              section.imageAltText,
            )) || undefined;
        }

        // Publish hero component
        console.log(
          '🎯 Publishing Hero section:',
          JSON.stringify(section, null, 2),
        );
        const result = await this.publishHeroComponent(section, {
          imageAssetId,
        });

        console.log(
          '📊 Hero publishing result:',
          JSON.stringify(result, null, 2),
        );
        results[section.type] = result;
        if (result.success) {
          console.log('✅ Hero component published successfully!');
          successCount++;
        } else {
          console.log('❌ Hero component publishing failed:', result.errors);
          failureCount++;
        }
      }
      // TODO: Add other component types (faqs, etc.)
    }

    return {
      success: successCount > 0,
      results,
      summary: {
        totalComponents: Object.keys(results).length,
        successCount,
        failureCount,
      },
    };
  }
}

// Factory function to create Contentful publisher from environment
export function createContentfulPublisher(): ContentfulPublisher | null {
  const config = {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    environment: process.env.CONTENTFUL_ENVIRONMENT_ID || 'master',
    locale: 'en-US',
  };

  // Validate required config
  if (!config.spaceId || !config.accessToken) {
    console.warn('⚠️ Contentful credentials not configured');
    return null;
  }

  return new ContentfulPublisher(config as ContentfulConfig);
}
