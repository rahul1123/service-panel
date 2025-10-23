// API Configuration
export const API_CONFIG = {
  BASE_URL: " http://localhost:3000",
  TIMEOUT: 30000, // 30 seconds
} as const;

// For backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
