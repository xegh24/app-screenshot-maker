/**
 * Environment configuration and validation
 * This file centralizes all environment variable access and provides type safety
 */

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

// Validate required environment variables
function validateEnv() {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }
}

// Only validate in non-test environments
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

// App configuration
export const config = {
  // App metadata
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'App Screenshot Maker',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Create beautiful app screenshots with custom backgrounds and frames',
  },

  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Authentication configuration
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!,
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    maxFilesPerUser: parseInt(process.env.MAX_FILES_PER_USER || '100'),
  },

  // Feature flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    premiumFeatures: process.env.NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES === 'true',
  },

  // External services (optional)
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    enabled: Boolean(
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    enabled: Boolean(
      process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ),
  },

  // Email configuration (optional)
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    enabled: Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ),
  },

  // Environment info
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

// Export individual configurations for convenience
export const {
  app,
  supabase,
  database,
  auth,
  upload,
  features,
  cloudinary,
  stripe,
  email,
  isDevelopment,
  isProduction,
  isTest,
} = config;

// Type-safe environment variable getter
export function getEnvVar(key: keyof NodeJS.ProcessEnv, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue!;
}

// Utility to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof features): boolean {
  return features[feature];
}

// Utility to get service availability
export function getServiceStatus() {
  return {
    cloudinary: cloudinary.enabled,
    stripe: stripe.enabled,
    email: email.enabled,
  };
}