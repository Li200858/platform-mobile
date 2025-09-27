import React, { useState, useEffect } from 'react';
import FilePreview from './FilePreview';
import api from '../api';

export default function Activity({ userInfo, isAdmin, onBack, maintenanceStatus, isMobile = false }) {
  const [activities, setActivities] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [likedIds, setLikedIds] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [commentForm, setCommentForm] = useState({ author: '', authorClass: '', content: '' });

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
    createButton: {
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

  // 加载活动列表
  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await api.activity.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('加载活动失败:', error);
      setMessage('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

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
        活动展示
      </h1>

      {/* 创建活动按钮 */}
      {userInfo && !maintenanceStatus.isEnabled && (
        <button onClick={() => setShowCreate(true)} style={mobileStyles.createButton}>
          创建活动
        </button>
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

      {/* 活动列表 */}
      {!loading && activities.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>暂无活动</div>
          <div style={{ fontSize: '14px' }}>快来创建第一个活动吧！</div>
        </div>
      )}

      {!loading && activities.map(activity => (
        <div key={activity._id} style={{
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
          {/* 活动头部 */}
          <div style={{
            padding: isMobile ? '15px' : '20px',
            borderBottom: '1px solid #f1f3f4'
          }}>
            <h3 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              {activity.title}
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: isMobile ? '14px' : '13px',
              color: '#7f8c8d'
            }}>
              <span>组织者: {activity.authorName || activity.author}</span>
              <span>班级: {activity.authorClass}</span>
              <span>时间: {new Date(activity.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* 活动内容 */}
          <div style={{
            padding: isMobile ? '15px' : '20px'
          }}>
            <div style={{
              fontSize: isMobile ? '16px' : '14px',
              lineHeight: '1.6',
              color: '#2c3e50',
              marginBottom: activity.media && activity.media.length > 0 ? '15px' : '0'
            }}>
              {activity.description || activity.content}
            </div>

            {/* 媒体文件 */}
            {activity.media && activity.media.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: activity.media.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px',
                marginTop: '15px'
              }}>
                {activity.media.map((media, index) => (
                  <FilePreview
                    key={index}
                    file={media}
                    allowDownload={true}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 活动操作 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '12px 15px' : '15px 20px',
            borderTop: '1px solid #f1f3f4',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  padding: isMobile ? '10px 16px' : '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#6c757d',
                  cursor: 'pointer',
                  fontSize: isMobile ? '14px' : '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  '-webkit-tap-highlight-color': 'transparent',
                  touchAction: 'manipulation',
                  minHeight: isMobile ? '44px' : '36px'
                }}
              >
                <span>赞</span>
                <span>{activity.likes || 0}</span>
              </button>
              
              <button
                style={{
                  padding: isMobile ? '10px 16px' : '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#6c757d',
                  cursor: 'pointer',
                  fontSize: isMobile ? '14px' : '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  '-webkit-tap-highlight-color': 'transparent',
                  touchAction: 'manipulation',
                  minHeight: isMobile ? '44px' : '36px'
                }}
              >
                <span>收藏</span>
                <span>收藏</span>
              </button>
            </div>

            {/* 删除按钮（仅作者或管理员可见） */}
            {(activity.authorName === userInfo?.name || isAdmin) && (
              <button
                onClick={async () => {
                  if (!confirm('确定要删除这个活动吗？')) return;
                  try {
                    await api.activity.delete(activity._id, userInfo?.name, isAdmin);
                    setMessage('删除成功');
                    await loadActivities();
                  } catch (error) {
                    console.error('删除失败:', error);
                    setMessage('删除失败，请重试');
                  }
                }}
                style={{
                  padding: isMobile ? '10px 16px' : '8px 16px',
                  background: '#f8d7da',
                  color: '#721c24',
                  border: '1px solid #f5c6cb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '14px' : '13px',
                  '-webkit-tap-highlight-color': 'transparent',
                  touchAction: 'manipulation',
                  minHeight: isMobile ? '44px' : '36px'
                }}
              >
                删除
              </button>
            )}
          </div>
        </div>
      ))}

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