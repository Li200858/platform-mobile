// 移动端优化的配置文件

// API配置
export const API_CONFIG = {
  // 基础URL
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://platform-program.onrender.com' 
    : 'http://localhost:5001',
  
  // 请求超时时间（毫秒）
  TIMEOUT: 30000,
  
  // 文件上传超时时间（毫秒）
  UPLOAD_TIMEOUT: 60000,
  
  // 重试次数
  MAX_RETRIES: 3,
  
  // 重试延迟（毫秒）
  RETRY_DELAY: 1000
};

// 文件上传配置
export const UPLOAD_CONFIG = {
  // 最大文件大小（字节）
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  
  // 最大文件数量
  MAX_FILES: 10,
  
  // 允许的文件类型
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ],
  
  // 图片压缩配置
  IMAGE_COMPRESSION: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg'
  }
};

// 移动端优化配置
export const MOBILE_CONFIG = {
  // 触摸目标最小尺寸（像素）
  MIN_TOUCH_SIZE: 44,
  
  // 移动端字体大小
  MOBILE_FONT_SIZE: 16,
  
  // 移动端间距
  MOBILE_SPACING: 15,
  
  // 移动端圆角
  MOBILE_BORDER_RADIUS: 12,
  
  // 移动端阴影
  MOBILE_SHADOW: '0 2px 12px rgba(0, 0, 0, 0.1)'
};

// 分页配置
export const PAGINATION_CONFIG = {
  // 每页默认数量
  DEFAULT_PAGE_SIZE: 20,
  
  // 移动端每页数量
  MOBILE_PAGE_SIZE: 10,
  
  // 最大每页数量
  MAX_PAGE_SIZE: 100
};

// 缓存配置
export const CACHE_CONFIG = {
  // 本地存储键名
  KEYS: {
    USER_PROFILE: 'user_profile',
    USER_ID: 'user_id',
    THEME: 'theme',
    LANGUAGE: 'language',
    SETTINGS: 'settings'
  },
  
  // 缓存过期时间（毫秒）
  EXPIRY: {
    USER_PROFILE: 24 * 60 * 60 * 1000, // 24小时
    SETTINGS: 7 * 24 * 60 * 60 * 1000, // 7天
    CACHE: 5 * 60 * 1000 // 5分钟
  }
};

// 通知配置
export const NOTIFICATION_CONFIG = {
  // 轮询间隔（毫秒）
  POLL_INTERVAL: 30000,
  
  // 活跃用户轮询间隔（毫秒）
  ACTIVE_POLL_INTERVAL: 15000,
  
  // 非活跃用户轮询间隔（毫秒）
  INACTIVE_POLL_INTERVAL: 60000,
  
  // 用户活跃时间阈值（毫秒）
  ACTIVITY_THRESHOLD: 300000, // 5分钟
  
  // 最大通知数量
  MAX_NOTIFICATIONS: 50
};

// 搜索配置
export const SEARCH_CONFIG = {
  // 搜索延迟（毫秒）
  DEBOUNCE_DELAY: 300,
  
  // 最小搜索长度
  MIN_SEARCH_LENGTH: 2,
  
  // 最大搜索结果数量
  MAX_RESULTS: 20,
  
  // 搜索历史最大数量
  MAX_HISTORY: 10
};

// 主题配置
export const THEME_CONFIG = {
  // 默认主题
  DEFAULT: 'light',
  
  // 可用主题
  AVAILABLE: ['light', 'dark', 'auto'],
  
  // 主题颜色
  COLORS: {
    light: {
      primary: '#3498db',
      secondary: '#95a5a6',
      success: '#27ae60',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#17a2b8',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#2c3e50',
      textSecondary: '#7f8c8d'
    },
    dark: {
      primary: '#3498db',
      secondary: '#95a5a6',
      success: '#27ae60',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#17a2b8',
      background: '#2c3e50',
      surface: '#34495e',
      text: '#ffffff',
      textSecondary: '#bdc3c7'
    }
  }
};

// 语言配置
export const LANGUAGE_CONFIG = {
  // 默认语言
  DEFAULT: 'zh-CN',
  
  // 可用语言
  AVAILABLE: ['zh-CN', 'en-US'],
  
  // 语言名称
  NAMES: {
    'zh-CN': '中文',
    'en-US': 'English'
  }
};

// 设备检测配置
export const DEVICE_CONFIG = {
  // 断点
  BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  
  // 设备类型
  TYPES: {
    mobile: 'mobile',
    tablet: 'tablet',
    desktop: 'desktop'
  },
  
  // 触摸设备检测
  TOUCH_DEVICE: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  
  // iOS设备检测
  IS_IOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
  
  // iPad检测
  IS_IPAD: /iPad/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  
  // Safari检测
  IS_SAFARI: /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
};

// 性能配置
export const PERFORMANCE_CONFIG = {
  // 懒加载延迟（毫秒）
  LAZY_LOAD_DELAY: 100,
  
  // 图片懒加载偏移（像素）
  LAZY_LOAD_OFFSET: 50,
  
  // 虚拟滚动项高度（像素）
  VIRTUAL_ITEM_HEIGHT: 100,
  
  // 防抖延迟（毫秒）
  DEBOUNCE_DELAY: 300,
  
  // 节流延迟（毫秒）
  THROTTLE_DELAY: 100
};

// 安全配置
export const SECURITY_CONFIG = {
  // XSS防护
  XSS_PROTECTION: true,
  
  // CSRF防护
  CSRF_PROTECTION: true,
  
  // 内容安全策略
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "https:", "wss:"]
  }
};

// 调试配置
export const DEBUG_CONFIG = {
  // 是否启用调试模式
  ENABLED: process.env.NODE_ENV === 'development',
  
  // 日志级别
  LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  
  // 性能监控
  PERFORMANCE_MONITORING: true,
  
  // 错误报告
  ERROR_REPORTING: true
};

// 导出所有配置
export default {
  API_CONFIG,
  UPLOAD_CONFIG,
  MOBILE_CONFIG,
  PAGINATION_CONFIG,
  CACHE_CONFIG,
  NOTIFICATION_CONFIG,
  SEARCH_CONFIG,
  THEME_CONFIG,
  LANGUAGE_CONFIG,
  DEVICE_CONFIG,
  PERFORMANCE_CONFIG,
  SECURITY_CONFIG,
  DEBUG_CONFIG
};
