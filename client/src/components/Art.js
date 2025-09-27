import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import FilePreview from './FilePreview';
import FileUploader from './FileUploader';
import api from '../api';

export default function Art({ userInfo, isAdmin, maintenanceStatus, onBack }) {
  const tabs = [
    { key: 'all', label: '全部', dbValue: '' },
    { key: 'music', label: '音乐', dbValue: '音乐' },
    { key: 'painting', label: '绘画', dbValue: '绘画' },
    { key: 'dance', label: '舞蹈', dbValue: '舞蹈' },
    { key: 'writing', label: '写作', dbValue: '写作' },
    { key: 'photography', label: '摄影', dbValue: '摄影' },
    { key: 'sculpture', label: '雕塑', dbValue: '雕塑' },
    { key: 'calligraphy', label: '书法', dbValue: '书法' },
    { key: 'design', label: '设计', dbValue: '设计' },
    { key: 'theater', label: '戏剧', dbValue: '戏剧' },
    { key: 'film', label: '影视', dbValue: '影视' },
    { key: 'craft', label: '手工艺', dbValue: '手工艺' },
    { key: 'digital', label: '数字艺术', dbValue: '数字艺术' }
  ];
  
  const [tab, setTab] = useState('all');
  const [list, setList] = useState([]);
  const [sort, setSort] = useState('time');
  const [showPublish, setShowPublish] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [likedIds, setLikedIds] = useState(() => {
    const saved = localStorage.getItem('liked_art_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const saved = localStorage.getItem('favorite_art_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [showComments, setShowComments] = useState({});
  const [commentForm, setCommentForm] = useState({ content: '' });

  // 发布作品表单
  const [publishForm, setPublishForm] = useState({
    title: '',
    content: '',
    tab: 'all',
    allowDownload: true,
    media: []
  });

  // 检测是否为移动设备
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    loadArts();
  }, [tab, sort]);

  // 加载艺术作品列表
  const loadArts = async () => {
    setLoading(true);
    try {
      const currentTab = tabs.find(t => t.key === tab);
      const dbTab = currentTab ? currentTab.dbValue : '';
      const sortParam = sort === 'hot' ? 'hot' : 'time';
      
      const data = await api.art.getAll(dbTab, sortParam);
      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载艺术作品失败:', error);
      setMessage('加载失败，请重试');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (!userInfo || !userInfo.name) {
      setMessage('请先完善个人信息');
      return;
    }
    
    try {
      const data = await api.art.like(id, userInfo.name);
      setList(prev => prev.map(item => item._id === id ? data : item));
      
      const isLiked = data.likedUsers && data.likedUsers.includes(userInfo.name);
      let newLiked;
      if (isLiked) {
        newLiked = likedIds.includes(id) ? likedIds : [...likedIds, id];
      } else {
        newLiked = likedIds.filter(_id => _id !== id);
      }
      setLikedIds(newLiked);
      localStorage.setItem('liked_art_ids', JSON.stringify(newLiked));
    } catch (error) {
      console.error('点赞失败:', error);
      setMessage('操作失败，请重试');
    }
  };

  const handleFavorite = async (id) => {
    if (!userInfo || !userInfo.name) {
      setMessage('请先完善个人信息');
      return;
    }
    
    try {
      const data = await api.art.favorite(id, userInfo.name);
      setList(prev => prev.map(item => item._id === id ? data : item));
      
      const isFavorited = data.favorites && data.favorites.includes(userInfo.name);
      let newFavorites;
      if (isFavorited) {
        newFavorites = favoriteIds.includes(id) ? favoriteIds : [...favoriteIds, id];
      } else {
        newFavorites = favoriteIds.filter(_id => _id !== id);
      }
      setFavoriteIds(newFavorites);
      localStorage.setItem('favorite_art_ids', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('收藏失败:', error);
      setMessage('操作失败，请重试');
    }
  };

  // 删除作品
  const handleDeleteArt = async (id) => {
    if (!userInfo || !userInfo.name) {
      setMessage('请先登录');
      return;
    }

    if (!window.confirm('确定要删除这个作品吗？此操作不可恢复。')) {
      return;
    }

    try {
      await api.art.delete(id, userInfo.name, isAdmin || false);
      setList(prev => prev.filter(item => item._id !== id));
      setMessage('作品已删除');
    } catch (error) {
      console.error('删除作品失败:', error);
      setMessage('删除失败，请重试');
    }
  };

  const handleComment = async (id) => {
    if (!commentForm.content.trim()) {
      setMessage('请输入评论内容');
      return;
    }

    if (!userInfo || !userInfo.name || !userInfo.class) {
      setMessage('请先在个人信息页面填写姓名和班级信息');
      return;
    }

    const commentData = {
      author: userInfo.name,
      authorClass: userInfo.class,
      content: commentForm.content.trim()
    };

    try {
      const data = await api.art.comment(id, commentData);
      setList(prev => prev.map(item => item._id === id ? data : item));
      setCommentForm({ content: '' });
      setMessage('评论成功');
    } catch (error) {
      console.error('评论失败:', error);
      setMessage('评论失败，请重试');
    }
  };

  const handlePublish = async () => {
    if (!publishForm.title || !publishForm.content) {
      setMessage('请填写完整信息');
      return;
    }

    if (!userInfo || !userInfo.name || !userInfo.class) {
      setMessage('请先在个人信息页面填写姓名和班级信息');
      return;
    }

    try {
      const artData = {
        title: publishForm.title,
        content: publishForm.content,
        tab: tabs.find(t => t.key === publishForm.tab)?.dbValue || '',
        authorName: userInfo.name,
        authorClass: userInfo.class,
        allowDownload: publishForm.allowDownload,
        media: publishForm.media || []
      };
      
      const result = await api.art.publish(artData);
      
      if (result.success) {
        setMessage('发布成功');
        setShowPublish(false);
        clearDraft();
        await loadArts();
      } else {
        setMessage('发布失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('发布失败:', error);
      setMessage('发布失败，请重试');
    }
  };

  const clearDraft = () => {
    setPublishForm({
      title: '',
      content: '',
      tab: 'all',
      allowDownload: true,
      media: []
    });
  };

  const handleFileUpload = (fileUrl) => {
    setPublishForm(prev => ({
      ...prev,
      media: [...prev.media, { url: fileUrl, filename: fileUrl.split('/').pop() }]
    }));
  };

  const removeFile = (index) => {
    setPublishForm(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  if (showPublish) {
    return <CreateArtForm onBack={() => setShowPublish(false)} userInfo={userInfo} onSuccess={loadArts} maintenanceStatus={maintenanceStatus} />;
  }

  if (loading) {
    return (
      <div style={{ 
        maxWidth: isMobile ? '100%' : 800, 
        margin: isMobile ? '20px auto' : '40px auto', 
        background: '#fff', 
        borderRadius: 15, 
        padding: isMobile ? 15 : 30, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#7f8c8d' }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: isMobile ? '100%' : 800, 
      margin: isMobile ? '20px auto' : '40px auto', 
      background: '#fff', 
      borderRadius: 15, 
      padding: isMobile ? 15 : 30, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            marginRight: '15px',
            color: '#7f8c8d'
          }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, color: '#2c3e50', flex: 1 }}>艺术作品</h2>
        <button 
          onClick={() => {
            if (maintenanceStatus.isEnabled && !userInfo?.isAdmin) {
              alert(maintenanceStatus.message || '网站正在维护中，暂时无法发布作品');
              return;
            }
            setShowPublish(true);
          }}
          disabled={maintenanceStatus.isEnabled && !userInfo?.isAdmin}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: (maintenanceStatus.isEnabled && !userInfo?.isAdmin) ? '#95a5a6' : '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: 8,
            cursor: (maintenanceStatus.isEnabled && !userInfo?.isAdmin) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: (maintenanceStatus.isEnabled && !userInfo?.isAdmin) ? 0.6 : 1
          }}
        >
          {maintenanceStatus.isEnabled && !userInfo?.isAdmin ? '+ 维护中' : '+ 发布作品'}
        </button>
      </div>

      {/* 消息显示 */}
      {message && (
        <div style={{ 
          marginBottom: 20, 
          padding: '15px', 
          background: message.includes('成功') || message.includes('已') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') || message.includes('已') ? '#155724' : '#721c24',
          borderRadius: 8,
          border: `1px solid ${message.includes('成功') || message.includes('已') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* 分类标签 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 8
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              background: tab === t.key ? '#3498db' : '#f8f9fa',
              color: tab === t.key ? 'white' : '#6c757d',
              border: tab === t.key ? 'none' : '1px solid #dee2e6'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 排序选项 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 10
      }}>
        <button
          onClick={() => setSort('time')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            background: sort === 'time' ? '#3498db' : '#f8f9fa',
            color: sort === 'time' ? 'white' : '#6c757d',
            border: sort === 'time' ? 'none' : '1px solid #dee2e6'
          }}
        >
          最新
        </button>
        <button
          onClick={() => setSort('hot')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            background: sort === 'hot' ? '#3498db' : '#f8f9fa',
            color: sort === 'hot' ? 'white' : '#6c757d',
            border: sort === 'hot' ? 'none' : '1px solid #dee2e6'
          }}
        >
          热门
        </button>
      </div>

      {/* 作品列表 */}
      {list.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6c757d',
          fontSize: '16px'
        }}>
          暂无作品
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {list.map(art => (
          <div key={art._id} style={{ 
            border: '1px solid #ecf0f1', 
            borderRadius: 12,
            padding: 20,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
              <Avatar 
                name={art.authorName || art.author || '用户'} 
                size={45}
                style={{ marginRight: 15 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: 4, color: '#2c3e50' }}>
                  {art.authorName || art.author}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{art.authorClass} • {new Date(art.createdAt).toLocaleString()}</span>
                </div>
              </div>
              {/* 删除按钮 - 只有作者本人或管理员可以删除 */}
              {(userInfo && (art.authorName === userInfo.name || isAdmin)) && (
                <button
                  onClick={() => handleDeleteArt(art._id)}
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
              )}
            </div>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#2c3e50' }}>
              {art.title}
            </h3>
            
            <p style={{ margin: '0 0 15px 0', lineHeight: 1.6, color: '#34495e' }}>
              {art.content}
            </p>

            {/* 媒体文件 */}
            {art.media && art.media.length > 0 && (
              <div style={{ marginBottom: 15 }}>
                {art.media.map((file, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <FilePreview 
                      file={file} 
                      isMobile={isMobile}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              padding: '10px 0',
              borderTop: '1px solid #ecf0f1'
            }}>
              <button
                onClick={() => handleLike(art._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: likedIds.includes(art._id) ? '2px solid #e74c3c' : '2px solid #bdc3c7',
                  background: likedIds.includes(art._id) ? '#fff5f5' : '#fff',
                  color: likedIds.includes(art._id) ? '#e74c3c' : '#7f8c8d',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                点赞 {art.likes || 0}
              </button>
              <button
                onClick={() => handleFavorite(art._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: favoriteIds.includes(art._id) ? '2px solid #f39c12' : '2px solid #bdc3c7',
                  background: favoriteIds.includes(art._id) ? '#fff8e1' : '#fff',
                  color: favoriteIds.includes(art._id) ? '#f39c12' : '#7f8c8d',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                收藏
              </button>
              <button
                onClick={() => setShowComments(prev => ({ ...prev, [art._id]: !prev[art._id] }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '2px solid #bdc3c7',
                  background: '#fff',
                  color: '#7f8c8d',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                评论 ({art.comments ? art.comments.length : 0})
              </button>
            </div>

            {/* 评论区域 */}
            {showComments[art._id] && (
              <div style={{
                borderTop: '1px solid #e9ecef',
                paddingTop: 20,
                marginTop: 20
              }}>
                {/* 评论列表 */}
                {art.comments && art.comments.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    {art.comments.map(comment => (
                      <div key={comment.id} style={{
                        background: '#f8f9fa',
                        padding: 15,
                        borderRadius: 10,
                        marginBottom: 10
                      }}>
                        <div style={{
                          fontSize: '14px',
                          color: '#6c757d',
                          marginBottom: 5
                        }}>
                          <strong>{comment.author}</strong> ({comment.authorClass}) - {new Date(comment.createdAt).toLocaleString()}
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#2c3e50'
                        }}>
                          {comment.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 发表评论 */}
                <div>
                  <textarea
                    value={commentForm.content}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="写下你的评论..."
                    style={{
                      width: '100%',
                      padding: 15,
                      border: '2px solid #e9ecef',
                      borderRadius: 10,
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      marginBottom: 15,
                      minHeight: 100,
                      resize: 'vertical'
                    }}
                  />
                  <button
                    onClick={() => handleComment(art._id)}
                    style={{
                      padding: '12px 24px',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    发表评论
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 发布作品表单组件
function CreateArtForm({ onBack, userInfo, onSuccess, maintenanceStatus }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tab: 'all',
    allowDownload: true,
    media: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tabs = [
    { key: 'all', label: '全部', dbValue: '' },
    { key: 'music', label: '音乐', dbValue: '音乐' },
    { key: 'painting', label: '绘画', dbValue: '绘画' },
    { key: 'dance', label: '舞蹈', dbValue: '舞蹈' },
    { key: 'writing', label: '写作', dbValue: '写作' },
    { key: 'photography', label: '摄影', dbValue: '摄影' },
    { key: 'sculpture', label: '雕塑', dbValue: '雕塑' },
    { key: 'calligraphy', label: '书法', dbValue: '书法' },
    { key: 'design', label: '设计', dbValue: '设计' },
    { key: 'theater', label: '戏剧', dbValue: '戏剧' },
    { key: 'film', label: '影视', dbValue: '影视' },
    { key: 'craft', label: '手工艺', dbValue: '手工艺' },
    { key: 'digital', label: '数字艺术', dbValue: '数字艺术' }
  ];

  const isMobile = window.innerWidth <= 768;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setMessage('请填写完整信息');
      return;
    }

    if (!userInfo || !userInfo.name || !userInfo.class) {
      setMessage('请先在个人信息页面填写姓名和班级信息');
      return;
    }

    setLoading(true);
    try {
      const artData = {
        title: formData.title,
        content: formData.content,
        tab: tabs.find(t => t.key === formData.tab)?.dbValue || '',
        authorName: userInfo.name,
        authorClass: userInfo.class,
        allowDownload: formData.allowDownload,
        media: formData.media || []
      };
      
      const result = await api.art.publish(artData);
      
      if (result.success) {
        setMessage('发布成功');
        setTimeout(() => {
          onSuccess();
          onBack();
        }, 1000);
      } else {
        setMessage('发布失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('发布失败:', error);
      setMessage('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, { url: fileUrl, filename: fileUrl.split('/').pop() }]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  return (
    <div style={{ 
      maxWidth: isMobile ? '100%' : 800, 
      margin: isMobile ? '20px auto' : '40px auto', 
      background: '#fff', 
      borderRadius: 15, 
      padding: isMobile ? 15 : 30, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            marginRight: '15px',
            color: '#7f8c8d'
          }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>发布作品</h2>
      </div>

      {/* 消息显示 */}
      {message && (
        <div style={{ 
          marginBottom: 20, 
          padding: '15px', 
          background: message.includes('成功') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') ? '#155724' : '#721c24',
          borderRadius: 8,
          border: `1px solid ${message.includes('成功') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: '500', color: '#2c3e50' }}>
            作品标题 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="请输入作品标题"
            style={{
              width: '100%',
              padding: 15,
              border: '2px solid #e9ecef',
              borderRadius: 8,
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: '500', color: '#2c3e50' }}>
            作品描述 *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="请描述您的作品..."
            style={{
              width: '100%',
              padding: 15,
              border: '2px solid #e9ecef',
              borderRadius: 8,
              fontSize: '14px',
              boxSizing: 'border-box',
              minHeight: 120,
              resize: 'vertical'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: '500', color: '#2c3e50' }}>
            作品分类
          </label>
          <select
            value={formData.tab}
            onChange={(e) => setFormData(prev => ({ ...prev, tab: e.target.value }))}
            style={{
              width: '100%',
              padding: 15,
              border: '2px solid #e9ecef',
              borderRadius: 8,
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: 'white'
            }}
          >
            {tabs.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: '500', color: '#2c3e50' }}>
            上传文件
          </label>
          <FileUploader onUpload={handleFileUpload} />
          
          {/* 已上传的文件列表 */}
          {formData.media.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <h4 style={{ marginBottom: 10, fontSize: '14px', color: '#2c3e50' }}>已上传文件：</h4>
              {formData.media.map((file, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 10,
                  background: '#f8f9fa',
                  borderRadius: 8,
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                    {file.filename || file.url.split('/').pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    style={{
                      padding: '4px 8px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowDownload}
              onChange={(e) => setFormData(prev => ({ ...prev, allowDownload: e.target.checked }))}
              style={{ marginRight: 8 }}
            />
            <span style={{ fontSize: '14px', color: '#2c3e50' }}>允许下载</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 15, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '12px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '发布中...' : '发布'}
          </button>
        </div>
      </form>
    </div>
  );
}