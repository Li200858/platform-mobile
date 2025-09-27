import React, { useState, useEffect } from 'react';
import FilePreview from './FilePreview';
import api from '../api';

export default function ResourceLibrary({ userInfo, isAdmin, onBack, isMobile = false }) {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    files: []
  });

  const mobileStyles = {
    container: {
      padding: isMobile ? '15px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    backButton: {
      padding: isMobile ? '12px 20px' : '10px 20px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      marginBottom: '20px',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '44px' : '40px'
    },
    uploadButton: {
      padding: isMobile ? '14px 20px' : '12px 24px',
      background: '#27ae60',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      fontWeight: '500',
      marginBottom: '20px',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '48px' : '44px'
    }
  };

  // 加载资源列表
  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await api.resources.getAll();
      setResources(data);
    } catch (error) {
      console.error('加载资源失败:', error);
      setMessage('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const data = await api.resources.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  useEffect(() => {
    loadResources();
    loadCategories();
  }, []);

  // 上传资源
  const handleUpload = async () => {
    if (!uploadForm.title.trim()) {
      setMessage('请输入资源标题');
      return;
    }

    if (!uploadForm.category.trim()) {
      setMessage('请选择资源分类');
      return;
    }

    if (uploadForm.files.length === 0) {
      setMessage('请选择要上传的文件');
      return;
    }

    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title.trim());
      formData.append('description', uploadForm.description.trim());
      formData.append('category', uploadForm.category.trim());
      formData.append('authorName', userInfo.name);
      formData.append('authorClass', userInfo.class);
      
      uploadForm.files.forEach((file, index) => {
        formData.append('files', file);
      });

      await api.resources.upload(formData);
      
      setMessage('资源上传成功');
      setShowUpload(false);
      setUploadForm({
        title: '',
        description: '',
        category: '',
        files: []
      });
      await loadResources();
    } catch (error) {
      console.error('上传资源失败:', error);
      setMessage('上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除资源
  const handleDelete = async (resourceId) => {
    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    if (!window.confirm('确定要删除这个资源吗？')) {
      return;
    }

    try {
      await api.resources.delete(resourceId, userInfo.name, isAdmin);
      setMessage('删除成功');
      await loadResources();
    } catch (error) {
      console.error('删除失败:', error);
      setMessage('删除失败，请重试');
    }
  };

  // 下载资源
  const handleDownload = (filename) => {
    const downloadUrl = api.resources.downloadFile(filename);
    window.open(downloadUrl, '_blank');
  };

  // 过滤资源
  const filteredResources = selectedCategory 
    ? resources.filter(resource => resource.category === selectedCategory)
    : resources;

  return (
    <div style={mobileStyles.container}>
      {/* 返回按钮 */}
      <button onClick={onBack} style={mobileStyles.backButton}>
        ← 返回
      </button>

      {/* 标题 */}
      <h1 style={{
        fontSize: isMobile ? '24px' : '28px',
        color: '#2c3e50',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        资料库
      </h1>

      {/* 上传按钮 */}
      {userInfo && (
        <button onClick={() => setShowUpload(true)} style={mobileStyles.uploadButton}>
          上传资源
        </button>
      )}

      {/* 分类筛选 */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: isMobile ? '16px' : '14px',
          fontWeight: '500',
          color: '#2c3e50',
          marginBottom: '10px'
        }}>
          资源分类
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              padding: isMobile ? '8px 12px' : '6px 10px',
              border: '1px solid #ddd',
              borderRadius: '16px',
              background: selectedCategory === '' ? '#3498db' : 'white',
              color: selectedCategory === '' ? 'white' : '#6c757d',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '13px',
              '-webkit-tap-highlight-color': 'transparent',
              touchAction: 'manipulation'
            }}
          >
            全部
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: isMobile ? '8px 12px' : '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '16px',
                background: selectedCategory === category ? '#3498db' : 'white',
                color: selectedCategory === category ? 'white' : '#6c757d',
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '13px',
                '-webkit-tap-highlight-color': 'transparent',
                touchAction: 'manipulation'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          {message}
          <button
            onClick={() => setMessage('')}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#155724'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#7f8c8d'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          加载中...
        </div>
      )}

      {/* 资源列表 */}
      {!loading && filteredResources.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>暂无资源</div>
          <div style={{ fontSize: '14px' }}>快来上传第一个资源吧！</div>
        </div>
      )}

      {!loading && filteredResources.map(resource => (
        <div key={resource._id} style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
          overflow: 'hidden',
          '-webkit-transform': 'translateZ(0)',
          transform: 'translateZ(0)',
          '-webkit-backface-visibility': 'hidden',
          backfaceVisibility: 'hidden'
        }}>
          {/* 资源头部 */}
          <div style={{
            padding: isMobile ? '15px' : '20px',
            borderBottom: '1px solid #f1f3f4'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <h3 style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: 0,
                flex: 1,
                marginRight: '10px'
              }}>
                {resource.title}
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => handleDownload(resource.files[0]?.filename)}
                  style={{
                    padding: isMobile ? '6px 10px' : '4px 8px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '11px',
                    '-webkit-tap-highlight-color': 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  下载
                </button>
                {(resource.authorName === userInfo?.name || isAdmin) && (
                  <button
                    onClick={() => handleDelete(resource._id)}
                    style={{
                      padding: isMobile ? '6px 10px' : '4px 8px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '12px' : '11px',
                      '-webkit-tap-highlight-color': 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: isMobile ? '14px' : '13px',
              color: '#7f8c8d'
            }}>
              <span>分类: {resource.category}</span>
              <span>作者: {resource.authorName}</span>
              <span>班级: {resource.authorClass}</span>
              <span>时间: {new Date(resource.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* 资源描述 */}
          {resource.description && (
            <div style={{
              padding: isMobile ? '15px' : '20px',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <div style={{
                fontSize: isMobile ? '16px' : '14px',
                color: '#2c3e50',
                lineHeight: '1.6'
              }}>
                {resource.description}
              </div>
            </div>
          )}

          {/* 资源文件 */}
          {resource.files && resource.files.length > 0 && (
            <div style={{
              padding: isMobile ? '15px' : '20px'
            }}>
              <div style={{
                fontSize: isMobile ? '16px' : '14px',
                color: '#2c3e50',
                marginBottom: '15px',
                fontWeight: '500'
              }}>
                文件列表
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: resource.files.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {resource.files.map((file, index) => (
                  <FilePreview
                    key={index}
                    file={file}
                    allowDownload={true}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 上传资源模态框 */}
      {showUpload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>上传资源</h3>
              <button
                onClick={() => setShowUpload(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#7f8c8d',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>资源标题 *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="请输入资源标题"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>资源分类 *</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">请选择分类</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>资源描述</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请描述资源内容..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: isMobile ? '16px' : '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>选择文件 *</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setUploadForm(prev => ({ ...prev, files: Array.from(e.target.files) }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box'
                  }}
                />
                {uploadForm.files.length > 0 && (
                  <div style={{
                    marginTop: '10px',
                    fontSize: isMobile ? '14px' : '13px',
                    color: '#6c757d'
                  }}>
                    已选择 {uploadForm.files.length} 个文件
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowUpload(false)}
                  style={{
                    padding: '12px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '16px' : '14px'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  style={{
                    padding: '12px 20px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '16px' : '14px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? '上传中...' : '上传'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 旋转动画样式 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}