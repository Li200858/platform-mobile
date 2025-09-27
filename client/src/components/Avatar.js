import React from 'react';

export default function Avatar({ src, alt = 'Avatar', size = 40, isMobile = false }) {
  const avatarStyle = {
    width: isMobile ? Math.max(size, 44) : size,
    height: isMobile ? Math.max(size, 44) : size,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #e9ecef',
    background: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isMobile ? '18px' : '16px',
    color: '#6c757d',
    fontWeight: 'bold',
    /* iPad Safari兼容性修复 */
    '-webkit-transform': 'translateZ(0)',
    transform: 'translateZ(0)',
    '-webkit-backface-visibility': 'hidden',
    backfaceVisibility: 'hidden'
  };

  // 如果没有图片源，显示默认头像
  if (!src) {
    const initials = alt ? alt.charAt(0).toUpperCase() : '?';
    return (
      <div style={avatarStyle}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={avatarStyle}
      onError={(e) => {
        // 图片加载失败时显示默认头像
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
}