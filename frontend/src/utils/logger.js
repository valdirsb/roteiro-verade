// Sistema de logging configurável
const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (message, data = {}) => {
    if (isDevelopment) {
      console.log(`🔍 ${message}`, data);
    }
  },
  
  info: (message, data = {}) => {
    if (isDevelopment) {
      console.info(`ℹ️ ${message}`, data);
    }
  },
  
  warn: (message, data = {}) => {
    console.warn(`⚠️ ${message}`, data);
  },
  
  error: (message, data = {}) => {
    console.error(`❌ ${message}`, data);
  }
};

export default logger; 