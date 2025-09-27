import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Notifications({ userInfo, onBack, isMobile = false }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    markAllButton: {
      padding: isMobile ? '12px 20px' : '10px 20px',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      marginBottom: '20px',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '44px' : '40px'
    }
  };

  // 加载通知列表
  const loadNotifications = async () => {
    if (!userInfo?.name) return;

    setLoading(true);
    try {
      const data = await api.notifications.getNotifications(userInfo.name);
      setNotifications(data);
    } catch (error) {
      console.error('加载通知失败:', error);
      setMessage('加载通知失败');
    } finally {
      setLoading(false);
    }
  };

  // 标记通知为已读
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.notifications.markAsRead(notificationId);
      await loadNotifications(); // 重新加载通知列表
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      setMessage('操作失败，请重试');
    }
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    if (!userInfo?.name) return;

    try {
      await api.notifications.markAllAsRead(userInfo.name);
      await loadNotifications(); // 重新加载通知列表
      setMessage('已标记所有通知为已读');
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      setMessage('操作失败，请重试');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userInfo]);

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
        通知中心
      </h1>

      {/* 未登录提示 */}
      {!userInfo && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#7f8c8d',
          background: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>请先登录</div>
          <div style={{ fontSize: '14px' }}>登录后可以查看通知</div>
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

      {/* 操作按钮 */}
      {userInfo && notifications.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{
            fontSize: isMobile ? '16px' : '14px',
            color: '#6c757d'
          }}>
            共 {notifications.length} 条通知
          </div>
          
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              style={mobileStyles.markAllButton}
            >
              全部标记为已读
            </button>
          )}
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

      {/* 通知列表 */}
      {!loading && userInfo && notifications.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>暂无通知</div>
          <div style={{ fontSize: '14px' }}>当有新通知时会在这里显示</div>
        </div>
      )}

      {!loading && userInfo && notifications.map(notification => (
        <div key={notification._id} style={{
          background: notification.isRead ? 'white' : '#f8f9fa',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '15px',
          overflow: 'hidden',
          border: notification.isRead ? '1px solid #e9ecef' : '2px solid #3498db',
          '-webkit-transform': 'translateZ(0)',
          transform: 'translateZ(0)',
          '-webkit-backface-visibility': 'hidden',
          backfaceVisibility: 'hidden'
        }}>
          {/* 通知头部 */}
          <div style={{
            padding: isMobile ? '15px' : '20px',
            borderBottom: '1px solid #f1f3f4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: isMobile ? '16px' : '14px',
                fontWeight: notification.isRead ? 'normal' : 'bold',
                color: '#2c3e50',
                marginBottom: '5px',
                lineHeight: '1.4'
              }}>
                {notification.title}
              </div>
              <div style={{
                fontSize: isMobile ? '12px' : '11px',
                color: '#6c757d'
              }}>
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </div>
            
            {!notification.isRead && (
              <button
                onClick={() => handleMarkAsRead(notification._id)}
                style={{
                  padding: isMobile ? '6px 12px' : '4px 8px',
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
                标记已读
              </button>
            )}
          </div>

          {/* 通知内容 */}
          <div style={{
            padding: isMobile ? '15px' : '20px'
          }}>
            <div style={{
              fontSize: isMobile ? '15px' : '14px',
              color: '#2c3e50',
              lineHeight: '1.6',
              marginBottom: notification.actions && notification.actions.length > 0 ? '15px' : '0'
            }}>
              {notification.content}
            </div>

            {/* 通知操作 */}
            {notification.actions && notification.actions.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (action.url) {
                        window.open(action.url, '_blank');
                      }
                      if (action.action === 'mark_read') {
                        handleMarkAsRead(notification._id);
                      }
                    }}
                    style={{
                      padding: isMobile ? '8px 16px' : '6px 12px',
                      background: action.type === 'primary' ? '#3498db' : '#f8f9fa',
                      color: action.type === 'primary' ? 'white' : '#6c757d',
                      border: action.type === 'primary' ? 'none' : '1px solid #e9ecef',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '14px' : '13px',
                      '-webkit-tap-highlight-color': 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 未读标识 */}
          {!notification.isRead && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '8px',
              height: '8px',
              background: '#e74c3c',
              borderRadius: '50%'
            }}></div>
          )}
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