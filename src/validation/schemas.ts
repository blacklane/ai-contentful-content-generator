import { z } from 'zod';

// Helper functions for custom validations
const minWordsValidator = (minWords: number) => (value: string) => {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  return words.length >= minWords;
};

const keywordsValidator = (value: string) => {
  // Split by comma and trim each keyword
  const keywords = value
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  // Must have at least 1 keyword
  if (keywords.length < 1) {
    return false;
  }

  // Total word count across all keywords should be at least 1
  const totalWords = keywords
    .join(' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  return totalWords.length >= 1;
};

// Validation schemas - topic removed, mainKeywords is now the primary identifier

export const mainKeywordsSchema = z
  .string()
  .min(1, 'Main keywords are required')
  .refine(
    keywordsValidator,
    'Main keywords must be comma-separated with at least 1 keyword total',
  );

export const secondaryKeywordsSchema = z
  .string()
  .min(1, 'Secondary keywords are required')
  .refine(
    value => keywordsValidator(value),
    'Secondary keywords must be comma-separated',
  );

export const questionsSchema = z.string().optional();

export const languageSchema = z.enum(['en', 'de', 'es', 'fr']).default('en');

export const contentTypesSchema = z
  .array(z.enum(['hero', 'faqs', 'seoText']))
  .min(1, 'At least one content type must be selected')
  .transform(components => {
    // Always ensure hero is included as the first component
    const uniqueComponents = Array.from(
      new Set(['hero', ...components.filter(c => c !== 'hero')]),
    );
    return uniqueComponents;
  });

// Main form validation schema
export const generationRequestSchema = z.object({
  mainKeywords: mainKeywordsSchema,
  secondaryKeywords: secondaryKeywordsSchema,
  questions: questionsSchema,
  language: languageSchema,
  components: contentTypesSchema, // Accept 'components' field from frontend
  conversationContext: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
});

// Type inference
export type GenerationRequest = z.infer<typeof generationRequestSchema>;
export type ValidationError = {
  field: string;
  message: string;
};

// Validation helper function
export function validateGenerationRequest(data: unknown): {
  success: boolean;
  data?: GenerationRequest;
  errors?: ValidationError[];
} {
  try {
    const validatedData = generationRequestSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed' }],
    };
  }
}

// Client-side validation helpers
// Topic validation removed - using mainKeywords as primary identifier

export function validateMainKeywords(value: string): string | null {
  try {
    mainKeywordsSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid main keywords';
    }
    return 'Invalid main keywords';
  }
}

export function validateSecondaryKeywords(value: string): string | null {
  try {
    secondaryKeywordsSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid secondary keywords';
    }
    return 'Invalid secondary keywords';
  }
}

export function validateQuestions(value: string): string | null {
  try {
    questionsSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid questions';
    }
    return 'Invalid questions';
  }
}
