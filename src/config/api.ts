// API Configuration
export const API_CONFIG = {
  // BASE_URL: " http://localhost:3000",
BASE_URL:"https://gwsapi.amyntas.in/api/v1/panel",
  TIMEOUT: 30000, // 30 seconds
} as const;

// For backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
