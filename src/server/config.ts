export const validateEnvironment = (): string[] => {
  const requiredEnvVars = ['AI_API_KEY'];
  return requiredEnvVars.filter(varName => !process.env[varName]);
};

export const getServerConfig = () => ({
  port: parseInt(process.env.BACKEND_PORT || process.env.PORT || '8001', 10),
  host: process.env.HOST || '0.0.0.0', // Default to network access
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8000',
  nodeEnv: process.env.NODE_ENV || 'development',
});

export const logEnvironmentStatus = () => {
  const missingEnvVars = validateEnvironment();

  if (missingEnvVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`,
    );
    console.warn('📝 Copy env.example to .env and fill in your credentials');
  }
};
