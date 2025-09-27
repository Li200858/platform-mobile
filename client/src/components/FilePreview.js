import React, { useState } from 'react';

export default function FilePreview({ file, allowDownload = true, isMobile = false }) {
  const [showFullImage, setShowFullImage] = useState(false);

  // 获取文件类型
  const getFileType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
    const audioTypes = ['mp3', 'wav', 'm4a', 'aac'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt'];
    
    if (imageTypes.includes(ext)) return 'image';
    if (videoTypes.includes(ext)) return 'video';
    if (audioTypes.includes(ext)) return 'audio';
    if (documentTypes.includes(ext)) return 'document';
    return 'other';
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件图标
  const getFileIcon = (fileType) => {
    const icons = {
      image: '图片',
      video: '视频',
      audio: '音频',
      document: '文档',
      other: '文件'
    };
    return icons[fileType] || '文件';
  };

  // 移动端优化的样式
  const mobileStyles = {
    container: {
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#f8f9fa',
      border: '1px solid #e9ecef',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '-webkit-transform': 'translateZ(0)',
      transform: 'translateZ(0)',
      '-webkit-backface-visibility': 'hidden',
      backfaceVisibility: 'hidden'
    },
    imagePreview: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      display: 'block',
      '-webkit-transform': 'translateZ(0)',
      transform: 'translateZ(0)',
      '-webkit-backface-visibility': 'hidden',
      backfaceVisibility: 'hidden'
    },
    videoPreview: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      display: 'block',
      '-webkit-transform': 'translateZ(0)',
      transform: 'translateZ(0)',
      '-webkit-backface-visibility': 'hidden',
      backfaceVisibility: 'hidden'
    },
    fileInfo: {
      padding: isMobile ? '12px' : '10px',
      background: 'white',
      borderTop: '1px solid #e9ecef'
    },
    fileName: {
      fontSize: isMobile ? '14px' : '13px',
      fontWeight: '500',
      color: '#2c3e50',
      marginBottom: '4px',
      wordBreak: 'break-word',
      lineHeight: '1.4'
    },
    fileMeta: {
      fontSize: isMobile ? '12px' : '11px',
      color: '#6c757d',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    openButton: {
      background: '#17a2b8',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: isMobile ? '8px 12px' : '6px 10px',
      fontSize: isMobile ? '12px' : '11px',
      cursor: 'pointer',
      marginTop: '8px',
      width: '100%',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '36px' : '32px'
    },
    fullImageOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    fullImage: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      borderRadius: '8px',
      '-webkit-transform': 'translateZ(0)',
      transform: 'translateZ(0)',
      '-webkit-backface-visibility': 'hidden',
      backfaceVisibility: 'hidden'
    },
    closeButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: isMobile ? '44px' : '40px',
      height: isMobile ? '44px' : '40px',
      fontSize: '24px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation'
    }
  };

  if (!file) return null;

  const fileType = getFileType(file.filename || file.name || '');
  const fileSize = file.size ? formatFileSize(file.size) : '';
  const fileName = file.originalName || file.filename || file.name || '未知文件';

  // 图片预览
  if (fileType === 'image') {
    const imageUrl = file.url || file.path || '';
    
    return (
      <>
        <div 
          style={mobileStyles.container}
          onClick={() => setShowFullImage(true)}
        >
          <img
            src={imageUrl}
            alt={fileName}
            style={mobileStyles.imagePreview}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{
            ...mobileStyles.imagePreview,
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: '#6c757d'
          }}>
            图片
          </div>
          
          <div style={mobileStyles.fileInfo}>
            <div style={mobileStyles.fileName}>
              {fileName}
            </div>
            <div style={mobileStyles.fileMeta}>
              <span>{getFileIcon(fileType)} 图片</span>
              {fileSize && <span>{fileSize}</span>}
            </div>
            {allowDownload && (
              <button
                style={mobileStyles.openButton}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(imageUrl, '_blank');
                }}
              >
                预览
              </button>
            )}
            {allowDownload && (
              <button
                style={{
                  ...mobileStyles.openButton,
                  background: '#007bff',
                  marginTop: '8px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                下载
              </button>
            )}
          </div>
        </div>

        {/* 全屏图片预览 */}
        {showFullImage && (
          <div 
            style={mobileStyles.fullImageOverlay}
            onClick={() => setShowFullImage(false)}
          >
            <img
              src={imageUrl}
              alt={fileName}
              style={mobileStyles.fullImage}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              style={mobileStyles.closeButton}
              onClick={() => setShowFullImage(false)}
            >
              ×
            </button>
          </div>
        )}
      </>
    );
  }

  // 视频预览
  if (fileType === 'video') {
    const videoUrl = file.url || file.path || '';
    
    return (
      <div style={mobileStyles.container}>
        <video
          style={mobileStyles.videoPreview}
          controls
          preload="metadata"
          poster=""
        >
          <source src={videoUrl} type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
        
        <div style={mobileStyles.fileInfo}>
          <div style={mobileStyles.fileName}>
            {fileName}
          </div>
          <div style={mobileStyles.fileMeta}>
            <span>{getFileIcon(fileType)} 视频</span>
            {fileSize && <span>{fileSize}</span>}
          </div>
          {allowDownload && (
            <button
              style={mobileStyles.openButton}
              onClick={() => window.open(videoUrl, '_blank')}
            >
              预览
            </button>
          )}
          {allowDownload && (
            <button
              style={{
                ...mobileStyles.openButton,
                background: '#007bff',
                marginTop: '8px'
              }}
              onClick={() => {
                const link = document.createElement('a');
                link.href = videoUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              下载
            </button>
          )}
        </div>
      </div>
    );
  }

  // 音频预览
  if (fileType === 'audio') {
    const audioUrl = file.url || file.path || '';
    
    return (
      <div style={mobileStyles.container}>
        <div style={{
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          fontSize: '48px'
        }}>
          音频
        </div>
        
        <div style={mobileStyles.fileInfo}>
          <div style={mobileStyles.fileName}>
            {fileName}
          </div>
          <div style={mobileStyles.fileMeta}>
            <span>{getFileIcon(fileType)} 音频</span>
            {fileSize && <span>{fileSize}</span>}
          </div>
          
          <audio
            style={{
              width: '100%',
              marginTop: '8px',
              height: isMobile ? '40px' : '32px'
            }}
            controls
            preload="metadata"
          >
            <source src={audioUrl} type="audio/mpeg" />
            您的浏览器不支持音频播放
          </audio>
          
          {allowDownload && (
            <button
              style={mobileStyles.openButton}
              onClick={() => window.open(audioUrl, '_blank')}
            >
              预览
            </button>
          )}
          {allowDownload && (
            <button
              style={{
                ...mobileStyles.openButton,
                background: '#007bff',
                marginTop: '8px'
              }}
              onClick={() => {
                const link = document.createElement('a');
                link.href = audioUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              下载
            </button>
          )}
        </div>
      </div>
    );
  }

  // 文档和其他文件
  return (
    <div style={mobileStyles.container}>
      <div style={{
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        fontSize: '48px'
      }}>
        {getFileIcon(fileType)}
      </div>
      
      <div style={mobileStyles.fileInfo}>
        <div style={mobileStyles.fileName}>
          {fileName}
        </div>
        <div style={mobileStyles.fileMeta}>
          <span>{getFileIcon(fileType)} {fileType === 'document' ? '文档' : '文件'}</span>
          {fileSize && <span>{fileSize}</span>}
        </div>
        {allowDownload && (
          <button
            style={mobileStyles.openButton}
            onClick={() => {
              const fileUrl = file.url || file.path || '';
              // 所有文件都在新窗口中打开预览
              window.open(fileUrl, '_blank');
            }}
          >
            预览
          </button>
        )}
        {allowDownload && (
          <button
            style={{
              ...mobileStyles.openButton,
              background: '#007bff',
              marginTop: '8px'
            }}
            onClick={() => {
              const fileUrl = file.url || file.path || '';
              const link = document.createElement('a');
              link.href = fileUrl;
              link.download = file.filename || file.name || fileUrl.split('/').pop();
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            下载
          </button>
        )}
      </div>
    </div>
  );
}