declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase Configuration
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      // Database Configuration
      DATABASE_URL: string;

      // Authentication
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;

      // Image Storage & Processing
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;

      // File Upload Limits
      MAX_FILE_SIZE: string;
      MAX_FILES_PER_USER: string;

      // App Configuration
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_APP_DESCRIPTION: string;

      // Feature Flags
      NEXT_PUBLIC_ENABLE_ANALYTICS: string;
      NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES: string;

      // External Services
      STRIPE_SECRET_KEY?: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;

      // Email Configuration
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;

      // Development
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};