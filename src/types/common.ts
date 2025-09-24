export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export interface ComponentConfig {
  name: string;
  description: string;
  icon: string;
  recommended?: boolean;
  fields: string[];
}

export interface ProjectData {
  topic: string;
  mainKeywords: string;
  secondaryKeywords: string;
  questions: string;
  language: string;
  components: string[];
}

export interface ReleaseConfig {
  mode: 'direct' | 'release';
  title: string;
  description: string;
  publishTiming: 'draft' | 'published';
}
