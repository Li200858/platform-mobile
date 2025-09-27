import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import FilePreview from './FilePreview';
import api from '../api';

export default function Art({ userInfo, isAdmin, maintenanceStatus, isMobile = false }) {
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [likedIds, setLikedIds] = useState(() => {
    const saved = localStorage.getItem('liked_art_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const saved = localStorage.getItem('favorite_art_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [showComments, setShowComments] = useState({});
  const [commentForm, setCommentForm] = useState({ author: '', authorClass: '', content: '' });
  const [message, setMessage] = useState('');
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaboratorResults, setCollaboratorResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // 移动端样式
  const mobileStyles = {
    container: {
      padding: isMobile ? '10px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    tabButton: {
      padding: isMobile ? '8px 12px' : '10px 20px',
      margin: isMobile ? '2px' : '5px',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '36px' : '40px'
    },
    publishButton: {
      padding: isMobile ? '12px 20px' : '15px 30px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      transition: 'all 0.3s ease',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '48px' : '52px'
    },
    artCard: {
      background: 'white',
      borderRadius: '15px',
      padding: isMobile ? '15px' : '20px',
      marginBottom: isMobile ? '15px' : '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: '1px solid #f0f0f0',
      transition: 'all 0.3s ease'
    },
    artTitle: {
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: isMobile ? '8px' : '10px',
      lineHeight: '1.4'
    },
    artContent: {
      fontSize: isMobile ? '14px' : '16px',
      color: '#555',
      lineHeight: '1.6',
      marginBottom: isMobile ? '10px' : '15px'
    },
    artMeta: {
      fontSize: isMobile ? '12px' : '14px',
      color: '#7f8c8d',
      marginBottom: isMobile ? '10px' : '15px'
    },
    actionButton: {
      padding: isMobile ? '6px 12px' : '8px 16px',
      margin: isMobile ? '2px' : '5px',
      border: 'none',
      borderRadius: '15px',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '32px' : '36px'
    },
    input: {
      width: '100%',
      padding: isMobile ? '12px' : '15px',
      border: '2px solid #e9ecef',
      borderRadius: '10px',
      fontSize: isMobile ? '16px' : '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      marginBottom: isMobile ? '10px' : '15px'
    },
    textarea: {
      width: '100%',
      padding: isMobile ? '12px' : '15px',
      border: '2px solid #e9ecef',
      borderRadius: '10px',
      fontSize: isMobile ? '16px' : '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      marginBottom: isMobile ? '10px' : '15px',
      minHeight: isMobile ? '100px' : '120px',
      resize: 'vertical'
    },
    select: {
      width: '100%',
      padding: isMobile ? '12px' : '15px',
      border: '2px solid #e9ecef',
      borderRadius: '10px',
      fontSize: isMobile ? '16px' : '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      marginBottom: isMobile ? '10px' : '15px',
      backgroundColor: 'white'
    },
    button: {
      padding: isMobile ? '12px 20px' : '15px 30px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '44px' : '48px'
    }
  };

  // 加载艺术作品列表
  const loadArts = async () => {
    setLoading(true);
    try {
      const currentTab = tabs.find(t => t.key === tab);
      const dbTab = currentTab ? currentTab.dbValue : '';
      const sortParam = sort === 'hot' ? 'hot' : 'time';
      
      console.log('加载艺术作品:', { tab, dbTab, sort, sortParam });
      const data = await api.art.getAll(dbTab, sortParam);
      console.log('获取到的艺术作品数据:', data);
      
      if (Array.isArray(data)) {
        setList(data);
      } else {
        console.error('API返回的数据不是数组:', data);
        setList([]);
      }
    } catch (error) {
      console.error('加载艺术作品失败:', error);
      setMessage('加载失败，请重试');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArts();
  }, [tab, sort]);

  const handleLike = async (id) => {
    if (!userInfo || !userInfo.name) {
      setMessage('请先完善个人信息');
      return;
    }
    
    try {
      const data = await api.art.like(id, userInfo.name);
      setList(prev => Array.isArray(prev) ? prev.map(item => item._id === id ? data : item) : []);
      
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
      setList(prev => Array.isArray(prev) ? prev.map(item => item._id === id ? data : item) : []);
      
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

  // 删除评论
  const handleDeleteComment = async (artId, commentId) => {
    if (!userInfo || !userInfo.name) {
      setMessage('请先登录');
      return;
    }

    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://platform-mobile-backend.onrender.com' : 'http://localhost:5000')}/api/art/${artId}/comment/${commentId}?authorName=${encodeURIComponent(userInfo.name)}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setList(prev => prev.map(item => {
          if (item._id === artId) {
            return {
              ...item,
              comments: item.comments.filter(comment => comment.id !== commentId)
            };
          }
          return item;
        }));
        setMessage('评论已删除');
      } else {
        const data = await res.json();
        setMessage(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除评论失败:', error);
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
      setCommentForm({ author: '', authorClass: '', content: '' });
      setMessage('评论成功');
    } catch (error) {
      console.error('评论失败:', error);
      setMessage('评论失败，请重试');
    }
  };

  // 发布作品表单
  const [publishForm, setPublishForm] = useState({
    title: '',
    content: '',
    tab: 'all',
    allowDownload: true,
    media: []
  });

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
      
      console.log('发布作品数据:', artData);
      const result = await api.art.publish(artData);
      console.log('发布结果:', result);
      
      if (result.success) {
        setMessage('发布成功');
        setShowPublish(false);
        clearDraft();
        
        // 立即重新加载列表
        console.log('重新加载艺术作品列表...');
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

  // 协作功能
  const handleInviteCollaborator = async (artId) => {
    if (!collaboratorSearch.trim()) {
      setMessage('请输入要邀请的用户名');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://platform-mobile-backend.onrender.com' : 'http://localhost:5000')}/api/user/search?name=${encodeURIComponent(collaboratorSearch)}`);
      const users = await response.json();
      
      if (Array.isArray(users)) {
        setCollaboratorResults(users);
      } else {
        setMessage('搜索失败');
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
      setMessage('搜索失败，请重试');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddCollaborator = async (artId, collaborator) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://platform-mobile-backend.onrender.com' : 'http://localhost:5000')}/api/art/${artId}/collaborator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: collaborator.name,
          name: collaborator.name,
          class: collaborator.class
        })
      });

      if (response.ok) {
        const data = await response.json();
        setList(prev => prev.map(item => item._id === artId ? data : item));
        setMessage('协作邀请已发送');
        setShowCollaboratorModal(false);
        setCollaboratorSearch('');
        setCollaboratorResults([]);
      } else {
        const error = await response.json();
        setMessage(error.error || '邀请失败');
      }
    } catch (error) {
      console.error('邀请协作失败:', error);
      setMessage('邀请失败，请重试');
    }
  };

  const handleRemoveCollaborator = async (artId, collaboratorName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://platform-mobile-backend.onrender.com' : 'http://localhost:5000')}/api/art/${artId}/collaborator`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: collaboratorName
        })
      });

      if (response.ok) {
        const data = await response.json();
        setList(prev => prev.map(item => item._id === artId ? data : item));
        setMessage('协作者已移除');
      } else {
        const error = await response.json();
        setMessage(error.error || '移除失败');
      }
    } catch (error) {
      console.error('移除协作失败:', error);
      setMessage('移除失败，请重试');
    }
  };

  if (maintenanceStatus && maintenanceStatus.isMaintenance) {
    return (
      <div style={mobileStyles.container}>
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '40px 20px' : '60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginBottom: '20px' }}>系统维护中</h2>
          <p style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '0' }}>
            {maintenanceStatus.message || '系统正在维护中，请稍后再试'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={mobileStyles.container}>
      {/* 消息提示 */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: message.includes('成功') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') ? '#155724' : '#721c24',
          padding: isMobile ? '12px 20px' : '15px 30px',
          borderRadius: '25px',
          border: `1px solid ${message.includes('成功') ? '#c3e6cb' : '#f5c6cb'}`,
          zIndex: 1000,
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '500',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          maxWidth: '90%',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {/* 标题和发布按钮 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '20px' : '30px',
        flexWrap: 'wrap',
        gap: isMobile ? '10px' : '15px'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          艺术作品
        </h1>
        <button
          onClick={() => setShowPublish(true)}
          style={mobileStyles.publishButton}
        >
          {isMobile ? '发布' : '发布作品'}
        </button>
      </div>

      {/* 分类标签 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: isMobile ? '20px' : '30px',
        gap: isMobile ? '5px' : '10px'
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...mobileStyles.tabButton,
              background: tab === t.key ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
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
        marginBottom: isMobile ? '20px' : '30px',
        gap: isMobile ? '10px' : '20px'
      }}>
        <button
          onClick={() => setSort('time')}
          style={{
            ...mobileStyles.tabButton,
            background: sort === 'time' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
            color: sort === 'time' ? 'white' : '#6c757d',
            border: sort === 'time' ? 'none' : '1px solid #dee2e6'
          }}
        >
          最新
        </button>
        <button
          onClick={() => setSort('hot')}
          style={{
            ...mobileStyles.tabButton,
            background: sort === 'hot' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
            color: sort === 'hot' ? 'white' : '#6c757d',
            border: sort === 'hot' ? 'none' : '1px solid #dee2e6'
          }}
        >
          热门
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '40px 20px' : '60px',
          color: '#6c757d',
          fontSize: isMobile ? '16px' : '18px'
        }}>
          加载中...
        </div>
      )}

      {/* 作品列表 */}
      {!loading && list.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '40px 20px' : '60px',
          color: '#6c757d',
          fontSize: isMobile ? '16px' : '18px'
        }}>
          暂无作品
        </div>
      )}

      {!loading && list.map(art => (
        <div key={art._id} style={mobileStyles.artCard}>
          {/* 作品标题 */}
          <h3 style={mobileStyles.artTitle}>{art.title}</h3>
          
          {/* 作品内容 */}
          <div style={mobileStyles.artContent}>{art.content}</div>
          
          {/* 媒体文件 */}
          {art.media && art.media.length > 0 && (
            <div style={{ marginBottom: isMobile ? '15px' : '20px' }}>
              {art.media.map((file, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <FilePreview 
                    file={file} 
                    isMobile={isMobile}
                    onPreview={() => setSelectedImage(file)}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* 作品信息 */}
          <div style={mobileStyles.artMeta}>
            <div style={{ marginBottom: '5px' }}>
              <strong>作者：</strong>{art.authorName} ({art.authorClass})
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>分类：</strong>{art.tab}
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>发布时间：</strong>{new Date(art.createdAt).toLocaleString()}
            </div>
            {art.collaborators && art.collaborators.length > 0 && (
              <div style={{ marginBottom: '5px' }}>
                <strong>协作者：</strong>
                {art.collaborators.map((collab, index) => (
                  <span key={index}>
                    {collab.name}
                    {index < art.collaborators.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? '5px' : '10px',
            marginBottom: isMobile ? '15px' : '20px'
          }}>
            <button
              onClick={() => handleLike(art._id)}
              style={{
                ...mobileStyles.actionButton,
                background: likedIds.includes(art._id) ? '#e74c3c' : '#f8f9fa',
                color: likedIds.includes(art._id) ? 'white' : '#6c757d',
                border: likedIds.includes(art._id) ? 'none' : '1px solid #dee2e6'
              }}
            >
              ❤️ {art.likes || 0}
            </button>
            <button
              onClick={() => handleFavorite(art._id)}
              style={{
                ...mobileStyles.actionButton,
                background: favoriteIds.includes(art._id) ? '#f39c12' : '#f8f9fa',
                color: favoriteIds.includes(art._id) ? 'white' : '#6c757d',
                border: favoriteIds.includes(art._id) ? 'none' : '1px solid #dee2e6'
              }}
            >
              ⭐ 收藏
            </button>
            <button
              onClick={() => setShowComments(prev => ({ ...prev, [art._id]: !prev[art._id] }))}
              style={{
                ...mobileStyles.actionButton,
                background: '#3498db',
                color: 'white',
                border: 'none'
              }}
            >
              💬 评论 ({art.comments ? art.comments.length : 0})
            </button>
            {userInfo && (art.authorName === userInfo.name || isAdmin) && (
              <button
                onClick={() => handleDeleteArt(art._id)}
                style={{
                  ...mobileStyles.actionButton,
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none'
                }}
              >
                🗑️ 删除
              </button>
            )}
            {userInfo && art.authorName === userInfo.name && (
              <button
                onClick={() => {
                  setSelectedArt(art);
                  setShowCollaboratorModal(true);
                }}
                style={{
                  ...mobileStyles.actionButton,
                  background: '#9b59b6',
                  color: 'white',
                  border: 'none'
                }}
              >
                👥 协作
              </button>
            )}
          </div>
          
          {/* 评论区域 */}
          {showComments[art._id] && (
            <div style={{
              borderTop: '1px solid #e9ecef',
              paddingTop: isMobile ? '15px' : '20px',
              marginTop: isMobile ? '15px' : '20px'
            }}>
              {/* 评论列表 */}
              {art.comments && art.comments.length > 0 && (
                <div style={{ marginBottom: isMobile ? '15px' : '20px' }}>
                  {art.comments.map(comment => (
                    <div key={comment.id} style={{
                      background: '#f8f9fa',
                      padding: isMobile ? '10px' : '15px',
                      borderRadius: '10px',
                      marginBottom: isMobile ? '8px' : '10px'
                    }}>
                      <div style={{
                        fontSize: isMobile ? '12px' : '14px',
                        color: '#6c757d',
                        marginBottom: '5px'
                      }}>
                        <strong>{comment.author}</strong> ({comment.authorClass}) - {new Date(comment.createdAt).toLocaleString()}
                      </div>
                      <div style={{
                        fontSize: isMobile ? '14px' : '16px',
                        color: '#2c3e50'
                      }}>
                        {comment.content}
                      </div>
                      {userInfo && (comment.author === userInfo.name || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(art._id, comment.id)}
                          style={{
                            ...mobileStyles.actionButton,
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            fontSize: isMobile ? '10px' : '12px',
                            padding: isMobile ? '4px 8px' : '6px 12px',
                            marginTop: '5px'
                          }}
                        >
                          删除评论
                        </button>
                      )}
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
                  style={mobileStyles.textarea}
                />
                <button
                  onClick={() => handleComment(art._id)}
                  style={{
                    ...mobileStyles.button,
                    background: '#27ae60',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  发表评论
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 发布作品模态框 */}
      {showPublish && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: isMobile ? '20px' : '30px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? '20px' : '30px'
            }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px' }}>发布作品</h2>
              <button
                onClick={() => setShowPublish(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: isMobile ? '24px' : '28px',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handlePublish(); }}>
              <input
                type="text"
                value={publishForm.title}
                onChange={(e) => setPublishForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="作品标题"
                style={mobileStyles.input}
                required
              />
              
              <textarea
                value={publishForm.content}
                onChange={(e) => setPublishForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="作品描述"
                style={mobileStyles.textarea}
                required
              />
              
              <select
                value={publishForm.tab}
                onChange={(e) => setPublishForm(prev => ({ ...prev, tab: e.target.value }))}
                style={mobileStyles.select}
              >
                {tabs.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: isMobile ? '15px' : '20px'
              }}>
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={publishForm.allowDownload}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, allowDownload: e.target.checked }))}
                  style={{ marginRight: '10px' }}
                />
                <label htmlFor="allowDownload" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  允许下载
                </label>
              </div>
              
              <div style={{
                display: 'flex',
                gap: isMobile ? '10px' : '15px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowPublish(false)}
                  style={{
                    ...mobileStyles.button,
                    background: '#6c757d',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    ...mobileStyles.button,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 协作模态框 */}
      {showCollaboratorModal && selectedArt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: isMobile ? '20px' : '30px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? '20px' : '30px'
            }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px' }}>协作管理</h3>
              <button
                onClick={() => {
                  setShowCollaboratorModal(false);
                  setSelectedArt(null);
                  setCollaboratorSearch('');
                  setCollaboratorResults([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: isMobile ? '24px' : '28px',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: isMobile ? '20px' : '30px' }}>
              <h4 style={{ marginBottom: isMobile ? '10px' : '15px', fontSize: isMobile ? '16px' : '18px' }}>
                当前协作者
              </h4>
              {selectedArt.collaborators && selectedArt.collaborators.length > 0 ? (
                <div>
                  {selectedArt.collaborators.map((collab, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: isMobile ? '8px 12px' : '10px 15px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: isMobile ? '8px' : '10px'
                    }}>
                      <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                        {collab.name} ({collab.class})
                      </span>
                      <button
                        onClick={() => handleRemoveCollaborator(selectedArt._id, collab.name)}
                        style={{
                          ...mobileStyles.actionButton,
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          fontSize: isMobile ? '10px' : '12px',
                          padding: isMobile ? '4px 8px' : '6px 12px'
                        }}
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6c757d', fontSize: isMobile ? '14px' : '16px' }}>
                  暂无协作者
                </div>
              )}
            </div>
            
            <div>
              <h4 style={{ marginBottom: isMobile ? '10px' : '15px', fontSize: isMobile ? '16px' : '18px' }}>
                邀请协作者
              </h4>
              <div style={{ display: 'flex', gap: isMobile ? '8px' : '10px', marginBottom: isMobile ? '15px' : '20px' }}>
                <input
                  type="text"
                  value={collaboratorSearch}
                  onChange={(e) => setCollaboratorSearch(e.target.value)}
                  placeholder="搜索用户名"
                  style={{
                    ...mobileStyles.input,
                    marginBottom: 0,
                    flex: 1
                  }}
                />
                <button
                  onClick={() => handleInviteCollaborator(selectedArt._id)}
                  disabled={searchLoading}
                  style={{
                    ...mobileStyles.button,
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    marginBottom: 0,
                    opacity: searchLoading ? 0.6 : 1
                  }}
                >
                  {searchLoading ? '搜索中...' : '搜索'}
                </button>
              </div>
              
              {collaboratorResults.length > 0 && (
                <div>
                  <h5 style={{ marginBottom: isMobile ? '8px' : '10px', fontSize: isMobile ? '14px' : '16px' }}>
                    搜索结果
                  </h5>
                  {collaboratorResults.map((user, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: isMobile ? '8px 12px' : '10px 15px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: isMobile ? '8px' : '10px'
                    }}>
                      <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                        {user.name} ({user.class})
                      </span>
                      <button
                        onClick={() => handleAddCollaborator(selectedArt._id, user)}
                        style={{
                          ...mobileStyles.actionButton,
                          background: '#27ae60',
                          color: 'white',
                          border: 'none',
                          fontSize: isMobile ? '10px' : '12px',
                          padding: isMobile ? '4px 8px' : '6px 12px'
                        }}
                      >
                        邀请
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#333'
              }}
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="预览"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '10px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}