import { ComponentSchema } from './types';

export const getComponentSchemas = async (
  contentTypes: string[],
): Promise<ComponentSchema[]> => {
  const schemas: Record<string, ComponentSchema> = {
    hero: {
      type: 'hero',
      heading: 'Transform Your Business with Premium Transportation',
      imageUrl: null,
      showTrustpilotWidget: false,
      showBookingWidget: true,
      isHourly: false,
      cta: true,
      ctaText: 'Book Your Ride',
      ctaTargetLink: '/booking',
      imageAltText:
        'Professional chauffeur opening luxury car door for business client',
      onlyVideo: false,
      videoSources: [],
      temporaryUrl: '',
      hideImageOnMobile: false,
      imageFocus: 'center',
      liftStatus: '',
    },
    faqs: {
      type: 'faqs',
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'How quickly can I get started with your platform?',
          answer:
            'You can be up and running in less than 5 minutes. Simply sign up, verify your email, and follow our guided onboarding process.',
        },
        {
          question: 'What kind of customer support do you provide?',
          answer:
            'We offer 24/7 customer support via chat, email, and phone. Our expert team is always ready to help you succeed.',
        },
        {
          question: 'Is there a free trial available?',
          answer:
            'Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.',
        },
      ],
    },
    seoText: {
      type: 'seoText',
      content: {
        title: 'Revolutionize Your Business Operations Today',
        description:
          'Discover how our cutting-edge platform transforms the way modern businesses operate. With advanced automation, intelligent analytics, and seamless integrations, you can streamline workflows, reduce operational costs, and accelerate growth. Join thousands of satisfied customers who have already experienced the power of our comprehensive business solution.',
        imageAltText:
          'Modern office environment showing digital transformation in action',
        imagePosition: 'right',
        shortDescription:
          'Transform your business with cutting-edge platform solutions.',
      },
    },
  };

  return contentTypes
    .map(type => schemas[type as keyof typeof schemas])
    .filter(Boolean);
};

export const getFallbackSchemas = (
  contentTypes: string[],
): ComponentSchema[] => {
  const fallbackSchemas: ComponentSchema[] = [];

  contentTypes.forEach(type => {
    switch (type) {
      case 'hero':
        fallbackSchemas.push({
          type: 'hero',
          heading: 'string (10-80 chars)',
          imageUrl: null,
          showTrustpilotWidget: false,
          showBookingWidget: true,
          isHourly: false,
          cta: true,
          ctaText: 'string (5-30 chars)',
          ctaTargetLink: 'string (URL)',
          imageAltText: 'string (10-125 chars)',
          onlyVideo: false,
          videoSources: [],
          temporaryUrl: '',
          hideImageOnMobile: false,
          imageFocus: 'center',
          liftStatus: '',
        });
        break;
      case 'faqs':
        fallbackSchemas.push({
          type: 'faqs',
          title: 'string (optional, max 50 chars)',
          items: [
            {
              question: 'string (10-150 chars)',
              answer: 'string (20-500 chars)',
            },
          ],
        });
        break;
      case 'seoText':
        fallbackSchemas.push({
          type: 'seoText',
          content: {
            title: 'string (10-80 chars)',
            description: 'string (100-1000 chars)',
            imageAltText: 'string (optional, 10-125 chars)',
            imagePosition: 'string (left or right, optional)',
            shortDescription: 'string (optional, max 400 chars)',
          },
        });
        break;
      default:
        fallbackSchemas.push({
          type,
          content: 'Component structure not defined',
        });
    }
  });

  return fallbackSchemas;
};
