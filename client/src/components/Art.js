import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import FilePreview from './FilePreview';
import api from '../api';
import { MOBILE_CONFIG } from '../config';

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
    try {
      const saved = localStorage.getItem('liked_art_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem('favorite_art_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showComments, setShowComments] = useState({});
  const [commentForm, setCommentForm] = useState({ author: '', authorClass: '', content: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaboratorResults, setCollaboratorResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [publishForm, setPublishForm] = useState({
    title: '',
    content: '',
    tab: 'all',
    allowDownload: true,
    files: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]); // 保存选择的文件

  // 移动端优化的样式
  const mobileStyles = {
    container: {
      padding: isMobile ? '15px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    tabContainer: {
      display: 'flex',
      overflowX: 'auto',
      gap: isMobile ? '8px' : '12px',
      padding: isMobile ? '10px 0' : '15px 0',
      marginBottom: isMobile ? '15px' : '20px',
      '-webkit-overflow-scrolling': 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    },
    tabButton: {
      flexShrink: 0,
      padding: isMobile ? '12px 16px' : '10px 20px',
      border: 'none',
      borderRadius: isMobile ? '20px' : '25px',
      background: '#f8f9fa',
      color: '#6c757d',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '44px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    activeTab: {
      background: '#3498db',
      color: 'white',
      boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)'
    },
    sortContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? '15px' : '20px',
      flexWrap: 'wrap',
      gap: '10px'
    },
    publishButton: {
      padding: isMobile ? '14px 20px' : '12px 24px',
      background: '#27ae60',
      color: 'white',
      border: 'none',
      borderRadius: isMobile ? '8px' : '6px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      fontWeight: '500',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '48px' : '44px'
    },
    artCard: {
      background: 'white',
      borderRadius: isMobile ? '12px' : '8px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      marginBottom: isMobile ? '15px' : '20px',
      overflow: 'hidden',
      '-webkit-transform': 'translateZ(0)',
      transform: 'translateZ(0)',
      '-webkit-backface-visibility': 'hidden',
      backfaceVisibility: 'hidden'
    },
    artHeader: {
      padding: isMobile ? '15px' : '20px',
      borderBottom: '1px solid #f1f3f4'
    },
    artTitle: {
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '8px',
      lineHeight: '1.4'
    },
    artMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: isMobile ? '12px' : '15px',
      fontSize: isMobile ? '14px' : '13px',
      color: '#7f8c8d'
    },
    artContent: {
      padding: isMobile ? '15px' : '20px'
    },
    artActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '12px 15px' : '15px 20px',
      borderTop: '1px solid #f1f3f4',
      gap: '10px'
    },
    actionButton: {
      padding: isMobile ? '10px 16px' : '8px 16px',
      border: '1px solid #ddd',
      borderRadius: isMobile ? '8px' : '6px',
      background: 'white',
      color: '#6c757d',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '44px' : '36px',
      transition: 'all 0.3s ease'
    },
    actionButtonActive: {
      background: '#e3f2fd',
      color: '#1976d2',
      borderColor: '#1976d2'
    }
  };

  // 加载艺术作品列表
  const loadArts = async () => {
    setLoading(true);
    try {
      const currentTab = tabs.find(t => t.key === tab);
      const dbTab = currentTab ? currentTab.dbValue : '';
      const sortParam = sort === 'hot' ? 'hot' : 'time';
      
      const data = await api.art.getAll(dbTab, sortParam);
      setList(data);
    } catch (error) {
      console.error('加载艺术作品失败:', error);
      setMessage('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 切换标签页
  const handleTabChange = (tabKey) => {
    setTab(tabKey);
    setShowComments({});
  };

  // 切换排序方式
  const handleSortChange = (sortType) => {
    setSort(sortType);
  };

  // 点赞功能
  const handleLike = async (id, currentLikes) => {
    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    try {
      const isLiked = likedIds.includes(id);
      const newLikedIds = isLiked 
        ? likedIds.filter(likedId => likedId !== id)
        : [...likedIds, id];
      
      setLikedIds(newLikedIds);
      localStorage.setItem('liked_art_ids', JSON.stringify(newLikedIds));
      
      await api.art.like(id, userInfo.name);
      await loadArts(); // 重新加载以获取最新数据
    } catch (error) {
      console.error('点赞失败:', error);
      setMessage('操作失败，请重试');
    }
  };

  // 收藏功能
  const handleFavorite = async (id) => {
    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    try {
      const isFavorited = favoriteIds.includes(id);
      const newFavoriteIds = isFavorited 
        ? favoriteIds.filter(favId => favId !== id)
        : [...favoriteIds, id];
      
      setFavoriteIds(newFavoriteIds);
      localStorage.setItem('favorite_art_ids', JSON.stringify(newFavoriteIds));
      
      await api.art.favorite(id, userInfo.name);
      await loadArts(); // 重新加载以获取最新数据
    } catch (error) {
      console.error('收藏失败:', error);
      setMessage('操作失败，请重试');
    }
  };

  // 显示/隐藏评论
  const toggleComments = (id) => {
    setShowComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 提交评论
  const handleComment = async (artId, commentData) => {
    if (!commentData.author || !commentData.authorClass || !commentData.content) {
      setMessage('请填写完整信息');
      return;
    }

    try {
      await api.art.comment(artId, commentData);
      setMessage('评论成功');
      setCommentForm({ author: '', authorClass: '', content: '' });
      await loadArts(); // 重新加载以获取最新数据
    } catch (error) {
      console.error('评论失败:', error);
      setMessage('评论失败，请重试');
    }
  };

  // 删除作品
  const handleDelete = async (id) => {
    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    if (!confirm('确定要删除这个作品吗？')) {
      return;
    }

    try {
      await api.art.delete(id, userInfo.name, isAdmin);
      setMessage('删除成功');
      await loadArts(); // 重新加载列表
    } catch (error) {
      console.error('删除失败:', error);
      setMessage('删除失败，请重试');
    }
  };

  // 删除作品（别名，保持与原版一致）
  const handleDeleteArt = handleDelete;

  // 删除评论
  const handleDeleteComment = async (artId, commentId) => {
    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      await api.art.deleteComment(artId, commentId, userInfo.name);
      setMessage('评论已删除');
      await loadArts(); // 重新加载列表
    } catch (error) {
      console.error('删除评论失败:', error);
      setMessage('删除失败，请重试');
    }
  };

  // 搜索用户（协作邀请用）
  const handleSearchUsers = async () => {
    if (!collaboratorSearch.trim()) {
      setMessage('请输入搜索关键词');
      return;
    }

    setSearchLoading(true);
    try {
      const data = await api.search.global(collaboratorSearch.trim(), 'user');
      setCollaboratorResults(data.users || []);
      if (data.users && data.users.length === 0) {
        setMessage('未找到相关用户');
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
      setMessage('搜索失败，请重试');
    } finally {
      setSearchLoading(false);
    }
  };

  // 邀请协作者
  const handleInviteCollaborator = async (user) => {
    if (!selectedArt) return;

    try {
      await api.art.inviteCollaborator(selectedArt._id, {
        username: user.name,
        name: user.name,
        class: user.class,
        invitedBy: userInfo.name
      });
      setMessage('邀请已发送');
      await loadArts(); // 重新加载列表
    } catch (error) {
      console.error('邀请失败:', error);
      setMessage('邀请失败：' + (error.message || '请重试'));
    }
  };

  // 移除协作者
  const handleRemoveCollaborator = async (username) => {
    if (!selectedArt) return;

    try {
      await api.art.removeCollaborator(selectedArt._id, username, userInfo.name);
      setMessage('合作用户已移除');
      await loadArts(); // 重新加载列表
    } catch (error) {
      console.error('移除失败:', error);
      setMessage('移除失败：' + (error.message || '请重试'));
    }
  };

  // 查看用户资料
  const handleViewUserProfile = (username, name, userClass) => {
    // 这里可以实现查看用户资料的功能
    setMessage(`查看用户: ${name} (${userClass})`);
  };

  // 保存草稿到localStorage
  const saveDraft = () => {
    const draft = {
      tab: publishForm.tab,
      title: publishForm.title,
      content: publishForm.content,
      files: publishForm.files,
      allowDownload: publishForm.allowDownload,
      selectedFiles: selectedFiles
    };
    localStorage.setItem('art_draft', JSON.stringify(draft));
  };

  // 从localStorage恢复草稿
  const loadDraft = () => {
    const savedDraft = localStorage.getItem('art_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setPublishForm(prev => ({
          ...prev,
          tab: draft.tab || 'all',
          title: draft.title || '',
          content: draft.content || '',
          files: draft.files || [],
          allowDownload: draft.allowDownload !== undefined ? draft.allowDownload : true
        }));
        setSelectedFiles(draft.selectedFiles || []);
      } catch (error) {
        console.error('恢复草稿失败:', error);
      }
    }
  };

  // 清除草稿
  const clearDraft = () => {
    localStorage.removeItem('art_draft');
    setPublishForm({
      title: '',
      content: '',
      tab: 'all',
      allowDownload: true,
      files: []
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
  }, [publishForm, selectedFiles]);

  // 初始化加载
  useEffect(() => {
    loadArts();
  }, [tab, sort]);

  // 标签页滚动样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .art-tabs::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={mobileStyles.container}>
      {/* 维护模式提示 */}
      {maintenanceStatus.isEnabled && !isAdmin && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          [警告] {maintenanceStatus.message}
        </div>
      )}

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

      {/* 标签页 */}
      <div className="art-tabs" style={mobileStyles.tabContainer}>
        {tabs.map(tabItem => (
          <button
            key={tabItem.key}
            onClick={() => handleTabChange(tabItem.key)}
            style={{
              ...mobileStyles.tabButton,
              ...(tab === tabItem.key ? mobileStyles.activeTab : {})
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* 排序和发布按钮 */}
      <div style={mobileStyles.sortContainer}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => handleSortChange('time')}
            style={{
              ...mobileStyles.actionButton,
              ...(sort === 'time' ? mobileStyles.actionButtonActive : {})
            }}
          >
            最新
          </button>
          <button
            onClick={() => handleSortChange('hot')}
            style={{
              ...mobileStyles.actionButton,
              ...(sort === 'hot' ? mobileStyles.actionButtonActive : {})
            }}
          >
            热门
          </button>
        </div>
        
        {userInfo && !maintenanceStatus.isEnabled && (
          <button
            onClick={() => setShowPublish(true)}
            style={mobileStyles.publishButton}
          >
            发布作品
          </button>
        )}
      </div>

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

      {/* 作品列表 */}
      {!loading && list.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>暂无作品</div>
          <div style={{ fontSize: '14px' }}>快来发布第一个作品吧！</div>
        </div>
      )}

      {!loading && list.map(art => (
        <div key={art._id} style={mobileStyles.artCard} data-art-id={art._id}>
          {/* 作品头部 */}
          <div style={mobileStyles.artHeader}>
            <div style={mobileStyles.artTitle}>{art.title}</div>
            <div style={mobileStyles.artMeta}>
              <span>作者: {art.authorName || art.author}</span>
              <span>班级: {art.authorClass}</span>
              <span>时间: {new Date(art.createdAt).toLocaleString()}</span>
              {art.tab && <span>分类: {art.tab}</span>}
            </div>
            
            {/* 合作用户信息 */}
            {art.collaborators && art.collaborators.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: isMobile ? '12px' : '11px', color: '#7f8c8d' }}>
                <span style={{ fontWeight: 'bold' }}>合作用户: </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {art.collaborators.map((collab, index) => (
                    <div
                      key={index}
                      onClick={() => handleViewUserProfile(collab.username, collab.name, collab.class)}
                      style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '11px' : '10px',
                        border: '1px solid #bbdefb',
                        '-webkit-tap-highlight-color': 'transparent',
                        touchAction: 'manipulation'
                      }}
                    >
                      {collab.name} ({collab.class})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 作品内容 */}
          <div style={mobileStyles.artContent}>
            <div style={{
              fontSize: isMobile ? '16px' : '14px',
              lineHeight: '1.6',
              color: '#2c3e50',
              marginBottom: art.media && art.media.length > 0 ? '15px' : '0'
            }}>
              {art.content}
            </div>

            {/* 媒体文件 */}
            {art.media && art.media.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: art.media.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px',
                marginTop: '15px'
              }}>
                {art.media.map((media, index) => (
                  <FilePreview
                    key={index}
                    file={media}
                    allowDownload={art.allowDownload}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 作品操作 */}
          <div style={mobileStyles.artActions}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleLike(art._id, art.likes)}
                style={{
                  ...mobileStyles.actionButton,
                  ...(likedIds.includes(art._id) ? mobileStyles.actionButtonActive : {})
                }}
              >
                <span>赞</span>
                <span>{art.likes || 0}</span>
              </button>
              
              <button
                onClick={() => handleFavorite(art._id)}
                style={{
                  ...mobileStyles.actionButton,
                  ...(favoriteIds.includes(art._id) ? mobileStyles.actionButtonActive : {})
                }}
              >
                <span>收藏</span>
              </button>
              
              <button
                onClick={() => toggleComments(art._id)}
                style={{
                  ...mobileStyles.actionButton,
                  ...(showComments[art._id] ? mobileStyles.actionButtonActive : {})
                }}
              >
                <span>评论 ({art.comments ? art.comments.length : 0})</span>
              </button>

              {/* 协作邀请按钮（仅作者可见） */}
              {art.authorName === userInfo?.name && (
                <button
                  onClick={() => {
                    setSelectedArt(art);
                    setShowCollaboratorModal(true);
                  }}
                  style={{
                    ...mobileStyles.actionButton,
                    background: '#f39c12',
                    color: 'white',
                    borderColor: '#f39c12'
                  }}
                >
                  <span>协作</span>
                </button>
              )}
            </div>

            {/* 删除按钮（仅作者或管理员可见） */}
            {(art.authorName === userInfo?.name || isAdmin) && (
              <button
                onClick={() => handleDelete(art._id)}
                style={{
                  ...mobileStyles.actionButton,
                  background: '#f8d7da',
                  color: '#721c24',
                  borderColor: '#f5c6cb'
                }}
              >
                删除
              </button>
            )}
          </div>

          {/* 评论区域 */}
          {showComments[art._id] && (
            <div style={{
              padding: isMobile ? '15px' : '20px',
              borderTop: '1px solid #f1f3f4',
              background: '#f8f9fa'
            }}>
              {/* 现有评论 */}
              {art.comments && art.comments.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  {art.comments.map((comment, index) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid #e9ecef',
                      position: 'relative'
                    }}>
                      <div style={{
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        marginBottom: '4px'
                      }}>
                        {comment.author} ({comment.authorClass})
                      </div>
                      <div style={{
                        color: '#6c757d',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {comment.content}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#adb5bd',
                        marginTop: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                        {/* 删除评论按钮（仅评论作者或管理员可见） */}
                        {(comment.author === userInfo?.name || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(art._id, comment.id || comment._id)}
                            style={{
                              padding: '2px 6px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              '-webkit-tap-highlight-color': 'transparent',
                              touchAction: 'manipulation'
                            }}
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 评论表单 */}
              {userInfo && (
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: '#2c3e50'
                  }}>
                    发表评论
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="您的姓名"
                      value={commentForm.author}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, author: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: isMobile ? '16px' : '14px',
                        marginBottom: '8px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="您的班级"
                      value={commentForm.authorClass}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, authorClass: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: isMobile ? '16px' : '14px',
                        marginBottom: '8px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <textarea
                    placeholder="写下您的评论..."
                    value={commentForm.content}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: isMobile ? '16px' : '14px',
                      marginBottom: '10px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => handleComment(art._id, commentForm)}
                    style={{
                      padding: '12px 20px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '16px' : '14px',
                      '-webkit-tap-highlight-color': 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    发表评论
                  </button>
                </div>
              )}
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
              <h3 style={{ margin: 0, color: '#2c3e50' }}>发布作品</h3>
              <button
                onClick={() => setShowPublish(false)}
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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>作品标题</label>
                <input
                  type="text"
                  value={publishForm.title}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="请输入作品标题"
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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>作品分类</label>
                <select
                  value={publishForm.tab}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, tab: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  {tabs.filter(t => t.key !== 'all').map(tabItem => (
                    <option key={tabItem.key} value={tabItem.key}>{tabItem.label}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>作品描述</label>
                <textarea
                  value={publishForm.content}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="请描述您的作品..."
                  rows={4}
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={publishForm.allowDownload}
                    onChange={(e) => setPublishForm(prev => ({ ...prev, allowDownload: e.target.checked }))}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: isMobile ? '16px' : '14px' }}>允许下载</span>
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowPublish(false)}
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
                  onClick={async () => {
                    if (!publishForm.title || !publishForm.content) {
                      setMessage('请填写完整信息');
                      return;
                    }
                    
                    try {
                      const artData = {
                        title: publishForm.title,
                        content: publishForm.content,
                        tab: tabs.find(t => t.key === publishForm.tab)?.dbValue || '',
                        authorName: userInfo.name,
                        authorClass: userInfo.class,
                        allowDownload: publishForm.allowDownload
                      };
                      
                      await api.art.publish(artData);
                      setMessage('发布成功');
                      setShowPublish(false);
                      clearDraft(); // 清除草稿
                      await loadArts();
                    } catch (error) {
                      console.error('发布失败:', error);
                      setMessage('发布失败，请重试');
                    }
                  }}
                  style={{
                    padding: '12px 20px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '16px' : '14px'
                  }}
                >
                  发布
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 协作邀请模态框 */}
      {showCollaboratorModal && selectedArt && (
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
              <h3 style={{ margin: 0, color: '#2c3e50' }}>协作邀请</h3>
              <button
                onClick={() => setShowCollaboratorModal(false)}
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
              {/* 作品信息 */}
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: isMobile ? '16px' : '14px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: '5px'
                }}>
                  {selectedArt.title}
                </div>
                <div style={{
                  fontSize: isMobile ? '14px' : '13px',
                  color: '#6c757d'
                }}>
                  作者: {selectedArt.authorName} | 分类: {selectedArt.tab}
                </div>
              </div>

              {/* 当前合作用户 */}
              {selectedArt.collaborators && selectedArt.collaborators.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    fontSize: isMobile ? '16px' : '14px',
                    color: '#2c3e50',
                    marginBottom: '10px'
                  }}>
                    当前合作用户
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedArt.collaborators.map((collab, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        background: '#e3f2fd',
                        borderRadius: '6px',
                        border: '1px solid #bbdefb'
                      }}>
                        <div>
                          <div style={{
                            fontSize: isMobile ? '14px' : '13px',
                            fontWeight: 'bold',
                            color: '#1976d2'
                          }}>
                            {collab.name}
                          </div>
                          <div style={{
                            fontSize: isMobile ? '12px' : '11px',
                            color: '#6c757d'
                          }}>
                            {collab.class}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCollaborator(collab.username)}
                          style={{
                            padding: '4px 8px',
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
                          移除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 搜索新用户 */}
              <div>
                <h4 style={{
                  fontSize: isMobile ? '16px' : '14px',
                  color: '#2c3e50',
                  marginBottom: '10px'
                }}>
                  邀请新用户
                </h4>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input
                    type="text"
                    placeholder="搜索用户姓名..."
                    value={collaboratorSearch}
                    onChange={(e) => setCollaboratorSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: isMobile ? '16px' : '14px'
                    }}
                  />
                  <button
                    onClick={handleSearchUsers}
                    disabled={searchLoading}
                    style={{
                      padding: '10px 15px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '14px' : '13px',
                      '-webkit-tap-highlight-color': 'transparent',
                      touchAction: 'manipulation',
                      opacity: searchLoading ? 0.6 : 1
                    }}
                  >
                    {searchLoading ? '搜索中...' : '搜索'}
                  </button>
                </div>

                {/* 搜索结果 */}
                {collaboratorResults.length > 0 && (
                  <div>
                    <h5 style={{
                      fontSize: isMobile ? '14px' : '13px',
                      color: '#2c3e50',
                      marginBottom: '10px'
                    }}>
                      搜索结果
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {collaboratorResults.map((user, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px',
                          background: '#f8f9fa',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef'
                        }}>
                          <div>
                            <div style={{
                              fontSize: isMobile ? '14px' : '13px',
                              fontWeight: 'bold',
                              color: '#2c3e50'
                            }}>
                              {user.name}
                            </div>
                            <div style={{
                              fontSize: isMobile ? '12px' : '11px',
                              color: '#6c757d'
                            }}>
                              {user.class}
                            </div>
                          </div>
                          <button
                            onClick={() => handleInviteCollaborator(user)}
                            style={{
                              padding: '4px 8px',
                              background: '#27ae60',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: isMobile ? '12px' : '11px',
                              '-webkit-tap-highlight-color': 'transparent',
                              touchAction: 'manipulation'
                            }}
                          >
                            邀请
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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