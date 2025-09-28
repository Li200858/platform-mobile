import React, { useState, useEffect } from 'react';
import FilePreview from './FilePreview';
import api from '../api';

export default function ResourceLibrary({ userInfo, isAdmin, onBack }) {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    category: 'template',
    tags: [],
    files: [],
    isPublic: true
  });
  const [selectedFiles, setSelectedFiles] = useState([]); // 保存选择的文件

  // 保存草稿到localStorage
  const saveDraft = () => {
    const draft = {
      newResource,
      selectedFiles
    };
    localStorage.setItem('resource_draft', JSON.stringify(draft));
  };

  // 从localStorage恢复草稿
  const loadDraft = () => {
    const savedDraft = localStorage.getItem('resource_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const validCategories = ['template', 'tutorial', 'document', 'image', 'video', 'audio'];
        const savedResource = draft.newResource || {};
        
        // 验证并修正category
        if (!validCategories.includes(savedResource.category)) {
          savedResource.category = 'template';
        }
        
        setNewResource({
          title: savedResource.title || '',
          description: savedResource.description || '',
          category: savedResource.category || 'template',
          tags: savedResource.tags || [],
          files: savedResource.files || [],
          isPublic: savedResource.isPublic !== false
        });
        setSelectedFiles(draft.selectedFiles || []);
      } catch (error) {
        console.error('恢复草稿失败:', error);
      }
    }
  };

  // 清除草稿
  const clearDraft = () => {
    localStorage.removeItem('resource_draft');
    setNewResource({
      title: '',
      description: '',
      category: 'template',
      tags: [],
      files: [],
      isPublic: true
    });
    setSelectedFiles([]);
  };

  // 组件加载时恢复草稿
  useEffect(() => {
    loadDraft();
  }, []);

  // 当表单数据变化时自动保存草稿
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 1000); // 1秒后保存，避免频繁保存

    return () => clearTimeout(timer);
  }, [newResource, selectedFiles]);

  useEffect(() => {
    loadResources();
    loadCategories();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await api.resources.getAll();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载资料失败:', error);
      setResources([]);
      setMessage('加载资料失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.resources.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载分类失败:', error);
      setCategories([]);
      setMessage('加载分类失败，请重试');
    }
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files.length) return;

    // 保存选择的文件
    setSelectedFiles(Array.from(files));

    setMessage('');
    // 只显示文件选择状态，不立即上传
    setNewResource(prev => ({ 
      ...prev, 
      files: Array.from(files).map(file => file.name) // 只保存文件名用于显示
    }));
    setMessage(`已选择 ${files.length} 个文件，点击"上传"按钮开始上传`);
  };

  const handleUploadResource = async () => {
    if (!newResource.title.trim()) {
      setMessage('请输入资料标题');
      return;
    }

    // 检查是否有文件需要上传
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setMessage('请选择要上传的文件');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', newResource.title);
      formData.append('description', newResource.description);
      formData.append('category', newResource.category);
      formData.append('tags', JSON.stringify(newResource.tags));
      formData.append('isPublic', newResource.isPublic);
      formData.append('uploader', userInfo.name);
      
      // 直接添加原始文件到FormData
      Array.from(fileInput.files).forEach(file => {
        formData.append('files', file);
      });

      await api.resources.upload(formData);
      setMessage('资料上传成功！');
      // 上传成功后清除草稿
      clearDraft();
      setShowUpload(false);
      loadResources();
    } catch (error) {
      console.error('上传资料失败:', error);
      setMessage('上传资料失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    if (!window.confirm('确定要删除这个资料吗？')) {
      return;
    }

    try {
      await api.resources.delete(resourceId, userInfo.name, isAdmin || false);
      setMessage('资料删除成功！');
      loadResources();
    } catch (error) {
      console.error('删除资料失败:', error);
      setMessage('删除资料失败，请重试');
    }
  };

  const handleOpenFile = async (file) => {
    try {
      const apiBaseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://platform-mobile-backend.onrender.com' 
        : 'http://localhost:5000';
      
      // 使用API路由而不是静态文件服务，确保正确访问磁盘文件
      const fileUrl = `${apiBaseUrl}/api/resources/file/${file.filename}`;
      
      // 在新窗口中打开文件
      window.open(fileUrl, '_blank');
      
      setMessage(`正在打开 ${file.originalName || file.filename}`);
    } catch (error) {
      console.error('打开文件失败:', error);
      setMessage('打开文件失败，请重试');
    }
  };

  // 过滤资源
  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '40px auto', background: '#fff', borderRadius: 15, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#7f8c8d' }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', background: '#fff', borderRadius: 15, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>学习资料库</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              padding: '10px 20px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            + 上传资料
          </button>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            返回
          </button>
        </div>
      </div>

      {/* 消息显示 */}
      {message && (
        <div style={{ 
          marginBottom: 20, 
          padding: '15px', 
          background: message.includes('成功') || message.includes('正在') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') || message.includes('正在') ? '#155724' : '#721c24',
          borderRadius: 8,
          border: `1px solid ${message.includes('成功') || message.includes('正在') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* 搜索和筛选 */}
      <div style={{ display: 'flex', gap: 15, marginBottom: 30, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="搜索资料..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              borderRadius: 8,
              border: '2px solid #ecf0f1',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 15px',
              borderRadius: 8,
              border: '2px solid #ecf0f1',
              fontSize: '14px',
              minWidth: 120
            }}
          >
            <option value="all">所有分类</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 资料列表 */}
      {filteredResources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#7f8c8d' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>[资料]</div>
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>
            {searchQuery || selectedCategory !== 'all' ? '没有找到相关资料' : '还没有学习资料'}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '30px' }}>
            {searchQuery || selectedCategory !== 'all' ? '请尝试其他搜索词或分类' : '快来上传第一个学习资料吧'}
          </div>
          {(!searchQuery && selectedCategory === 'all') && (
            <button
              onClick={() => setShowUpload(true)}
              style={{
                padding: '12px 24px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              上传资料
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          {filteredResources.map(resource => (
            <div key={resource._id} style={{
              border: '1px solid #ecf0f1',
              borderRadius: 12,
              padding: 20,
              background: '#f8f9fa',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ marginBottom: 15 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '16px' }}>
                  {resource.title}
                </h3>
                <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '14px', lineHeight: 1.4 }}>
                  {resource.description || '暂无描述'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' }}>
                <span style={{
                  background: '#e8f4fd',
                  color: '#2980b9',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: '12px'
                }}>
                  {resource.category}
                </span>
                {resource.isPublic ? (
                  <span style={{
                    background: '#d4edda',
                    color: '#155724',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '12px'
                  }}>
                    公开
                  </span>
                ) : (
                  <span style={{
                    background: '#f8d7da',
                    color: '#721c24',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '12px'
                  }}>
                    私密
                  </span>
                )}
              </div>

              {resource.tags && resource.tags.length > 0 && (
                <div style={{ marginBottom: 15 }}>
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} style={{
                      background: '#ecf0f1',
                      color: '#2c3e50',
                      padding: '2px 6px',
                      borderRadius: 8,
                      fontSize: '11px',
                      marginRight: 6,
                      display: 'inline-block'
                    }}>
                      #{tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span style={{ fontSize: '11px', color: '#7f8c8d' }}>
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {resource.files && resource.files.length > 0 && (
                <div style={{ marginBottom: 15 }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                    文件列表 ({resource.files.length} 个文件):
                  </div>
                  {resource.files.slice(0, 3).map((file, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#fff',
                      borderRadius: 6,
                      marginBottom: 5,
                      border: '1px solid #ecf0f1'
                    }}>
                      <span style={{ fontSize: '12px', color: '#2c3e50', flex: 1, marginRight: 10 }}>
                        {file.originalName || file.filename}
                      </span>
                      <button
                        onClick={() => handleOpenFile(file)}
                        style={{
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        打开
                      </button>
                    </div>
                  ))}
                  {resource.files.length > 3 && (
                    <div style={{ fontSize: '11px', color: '#7f8c8d', textAlign: 'center' }}>
                      ... 还有 {resource.files.length - 3} 个文件
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#7f8c8d' }}>
                <span>上传者: {resource.uploader}</span>
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>

              {/* 删除按钮 - 只有上传者本人或管理员可以删除 */}
              {(userInfo && (resource.uploader === userInfo.name || isAdmin)) && (
                <div style={{ marginTop: 15, textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteResource(resource._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    删除
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 上传资料弹窗 */}
      {showUpload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 15,
            padding: 30,
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: 20, color: '#2c3e50' }}>上传学习资料</h3>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>资料标题 *</label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="请输入资料标题"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>分类</label>
              <select
                value={newResource.category}
                onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #ddd'
                }}
              >
                <option value="template">模板</option>
                <option value="tutorial">教程</option>
                <option value="document">文档</option>
                <option value="image">图片</option>
                <option value="video">视频</option>
                <option value="audio">音频</option>
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>描述</label>
              <textarea
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                placeholder="请描述这个资料..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>标签</label>
              <input
                type="text"
                placeholder="用逗号分隔多个标签，如：学习,资料,模板"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                  setNewResource({ ...newResource, tags });
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>上传文件 *</label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #ddd'
                }}
              />
              <div style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                支持多种格式，可同时选择多个文件
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={newResource.isPublic}
                  onChange={(e) => setNewResource({ ...newResource, isPublic: e.target.checked })}
                />
                <span>公开资料（其他人可以查看）</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUpload(false)}
                style={{
                  padding: '10px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={handleUploadResource}
                disabled={uploading}
                style={{
                  padding: '10px 20px',
                  background: uploading ? '#bdc3c7' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? '上传中...' : '上传'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}