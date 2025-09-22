const logIcons = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  success: '✅',
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${logIcons.info} ${message}`, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`${logIcons.warn} ${message}`, ...args);
  },

  error: (message: string, ...args: any[]) => {
    console.error(`${logIcons.error} ${message}`, ...args);
  },

  success: (message: string, ...args: any[]) => {
    console.log(`${logIcons.success} ${message}`, ...args);
  },

  request: (endpoint: string, method: string = 'GET') => {
    console.log(`🔄 ${method} ${endpoint}`);
  },

  response: (status: number, message?: string) => {
    const icon = status >= 200 && status < 300 ? '✅' : '❌';
    console.log(`${icon} Response ${status}${message ? `: ${message}` : ''}`);
  },
};
