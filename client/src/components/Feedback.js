import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Feedback({ userInfo, maintenanceStatus, isMobile = false }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({
    content: '',
    files: []
  });

  const mobileStyles = {
    container: {
      padding: isMobile ? '15px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
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

  // 加载反馈列表
  const loadFeedbacks = async () => {
    if (!userInfo?.name) return;
    
    setLoading(true);
    try {
      const data = await api.feedback.getMyFeedbacks(userInfo.name);
      setFeedbacks(data);
    } catch (error) {
      console.error('加载反馈失败:', error);
      setMessage('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [userInfo]);

  return (
    <div style={mobileStyles.container}>
      {/* 标题 */}
      <h1 style={{
        fontSize: isMobile ? '24px' : '28px',
        color: '#2c3e50',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        意见反馈
      </h1>

      {/* 创建反馈按钮 */}
      {userInfo && !maintenanceStatus.isEnabled && (
        <button onClick={() => setShowCreate(true)} style={mobileStyles.createButton}>
          提交反馈
        </button>
      )}

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
          <div style={{ fontSize: '14px' }}>登录后可以查看和提交反馈</div>
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

      {/* 反馈列表 */}
      {!loading && userInfo && feedbacks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>暂无反馈</div>
          <div style={{ fontSize: '14px' }}>快来提交第一个反馈吧！</div>
        </div>
      )}

      {!loading && userInfo && feedbacks.map(feedback => (
        <div key={feedback._id} style={{
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
          {/* 反馈头部 */}
          <div style={{
            padding: isMobile ? '15px' : '20px',
            borderBottom: '1px solid #f1f3f4',
            background: feedback.status === 'received' ? '#d4edda' : '#fff3cd'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: 0
              }}>
                反馈 #{feedback._id.slice(-8)}
              </h3>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: isMobile ? '12px' : '11px',
                background: feedback.status === 'received' ? '#d4edda' : '#fff3cd',
                color: feedback.status === 'received' ? '#155724' : '#856404',
                border: `1px solid ${feedback.status === 'received' ? '#c3e6cb' : '#ffeaa7'}`
              }}>
                {feedback.status === 'received' ? '已收到' : '待处理'}
              </span>
            </div>
            <div style={{
              fontSize: isMobile ? '14px' : '13px',
              color: '#7f8c8d'
            }}>
              提交时间: {new Date(feedback.createdAt).toLocaleString()}
            </div>
          </div>

          {/* 反馈内容 */}
          <div style={{
            padding: isMobile ? '15px' : '20px'
          }}>
            <div style={{
              fontSize: isMobile ? '16px' : '14px',
              lineHeight: '1.6',
              color: '#2c3e50',
              marginBottom: feedback.media && feedback.media.length > 0 ? '15px' : '0'
            }}>
              {feedback.content}
            </div>

            {/* 媒体文件 */}
            {feedback.media && feedback.media.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: feedback.media.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px',
                marginTop: '15px'
              }}>
                {feedback.media.map((media, index) => (
                  <div key={index} style={{
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '14px' : '13px',
                      color: '#2c3e50',
                      marginBottom: '5px'
                    }}>
                      {media.originalName || media.filename || '文件'}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '12px' : '11px',
                      color: '#6c757d'
                    }}>
                      {media.size ? `${(media.size / 1024).toFixed(1)} KB` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 管理员回复 */}
          {feedback.conversations && feedback.conversations.length > 0 && (
            <div style={{
              padding: isMobile ? '15px' : '20px',
              borderTop: '1px solid #f1f3f4',
              background: '#f8f9fa'
            }}>
              <h4 style={{
                fontSize: isMobile ? '16px' : '14px',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                管理员回复
              </h4>
              {feedback.conversations.map((conversation, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontSize: isMobile ? '14px' : '13px',
                    lineHeight: '1.5',
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    {conversation.content}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '12px' : '11px',
                    color: '#6c757d'
                  }}>
                    {conversation.authorName} • {new Date(conversation.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 创建反馈模态框 */}
      {showCreate && (
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
              <h3 style={{ margin: 0, color: '#2c3e50' }}>提交反馈</h3>
              <button
                onClick={() => setShowCreate(false)}
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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>反馈内容</label>
                <textarea
                  value={feedbackForm.content}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="请描述您遇到的问题或建议..."
                  rows={6}
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
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCreate(false)}
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
                    if (!feedbackForm.content.trim()) {
                      setMessage('请输入反馈内容');
                      return;
                    }
                    
                    try {
                      await api.feedback.submit({
                        content: feedbackForm.content,
                        authorName: userInfo.name,
                        authorClass: userInfo.class,
                        media: feedbackForm.files
                      });
                      
                      setMessage('反馈提交成功');
                      setShowCreate(false);
                      setFeedbackForm({ content: '', files: [] });
                      await loadFeedbacks();
                    } catch (error) {
                      console.error('提交反馈失败:', error);
                      setMessage('提交失败，请重试');
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
                  提交
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