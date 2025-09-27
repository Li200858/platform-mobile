import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// iPad Safari兼容性修复 - 启动时立即执行
const userAgent = navigator.userAgent.toLowerCase();
const isIOS = /iphone|ipad|ipod/i.test(userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
const isIPad = /ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isIPadOS = /ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && /safari/i.test(navigator.userAgent));

if (isIOS || isIPad || isIPadOS || (isSafari && isMobile)) {
  console.log('检测到iOS设备、iPad或移动端Safari，应用启动时修复');
  
  // 立即应用修复
  document.documentElement.style.webkitTransform = 'translateZ(0)';
  document.documentElement.style.transform = 'translateZ(0)';
  document.documentElement.style.webkitBackfaceVisibility = 'hidden';
  document.documentElement.style.backfaceVisibility = 'hidden';
  
  // 设置视口元标签
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
