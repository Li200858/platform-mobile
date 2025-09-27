import React, { useState, useEffect } from 'react';
import FilePreview from './FilePreview';
import api from '../api';

export default function Portfolio({ userInfo, isAdmin, onBack, isMobile = false }) {
  const [portfolios, setPortfolios] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    isPublic: true,
    works: []
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

  // 加载我的作品集
  const loadPortfolios = async () => {
    if (!userInfo?.name) return;

    setLoading(true);
    try {
      const data = await api.portfolio.getUserPortfolios(userInfo.name);
      setPortfolios(data);
    } catch (error) {
      console.error('加载作品集失败:', error);
      setMessage('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, [userInfo]);

  // 创建作品集
  const handleCreatePortfolio = async () => {
    if (!portfolioForm.title.trim()) {
      setMessage('请输入作品集标题');
      return;
    }

    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    setLoading(true);
    try {
      await api.portfolio.create({
        title: portfolioForm.title.trim(),
        description: portfolioForm.description.trim(),
        authorName: userInfo.name,
        authorClass: userInfo.class,
        isPublic: portfolioForm.isPublic,
        works: portfolioForm.works
      });
      
      setMessage('作品集创建成功');
      setShowCreate(false);
      setPortfolioForm({
        title: '',
        description: '',
        isPublic: true,
        works: []
      });
      await loadPortfolios();
    } catch (error) {
      console.error('创建作品集失败:', error);
      setMessage('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除作品集
  const handleDeletePortfolio = async (portfolioId) => {
    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    if (!window.confirm('确定要删除这个作品集吗？')) {
      return;
    }

    try {
      await api.portfolio.delete(portfolioId, userInfo.name, isAdmin);
      setMessage('删除成功');
      await loadPortfolios();
    } catch (error) {
      console.error('删除失败:', error);
      setMessage('删除失败，请重试');
    }
  };

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
        我的作品集
      </h1>

      {/* 创建作品集按钮 */}
      {userInfo && (
        <button onClick={() => setShowCreate(true)} style={mobileStyles.createButton}>
          创建作品集
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
          <div style={{ fontSize: '14px' }}>登录后可以创建和管理作品集</div>
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

      {/* 作品集列表 */}
      {!loading && userInfo && portfolios.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>暂无作品集</div>
          <div style={{ fontSize: '14px' }}>快来创建第一个作品集吧！</div>
        </div>
      )}

      {!loading && userInfo && portfolios.map(portfolio => (
        <div key={portfolio._id} style={{
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
          {/* 作品集头部 */}
          <div style={{
            padding: isMobile ? '15px' : '20px',
            borderBottom: '1px solid #f1f3f4',
            background: portfolio.isPublic ? '#e8f5e8' : '#fff3cd'
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
                {portfolio.title}
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: isMobile ? '12px' : '11px',
                  background: portfolio.isPublic ? '#d4edda' : '#fff3cd',
                  color: portfolio.isPublic ? '#155724' : '#856404',
                  border: `1px solid ${portfolio.isPublic ? '#c3e6cb' : '#ffeaa7'}`
                }}>
                  {portfolio.isPublic ? '公开' : '私有'}
                </span>
                <button
                  onClick={() => handleDeletePortfolio(portfolio._id)}
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
              </div>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: isMobile ? '14px' : '13px',
              color: '#7f8c8d'
            }}>
              <span>作者: {portfolio.authorName}</span>
              <span>班级: {portfolio.authorClass}</span>
              <span>时间: {new Date(portfolio.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* 作品集描述 */}
          {portfolio.description && (
            <div style={{
              padding: isMobile ? '15px' : '20px',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <div style={{
                fontSize: isMobile ? '16px' : '14px',
                color: '#2c3e50',
                lineHeight: '1.6'
              }}>
                {portfolio.description}
              </div>
            </div>
          )}

          {/* 作品集内容 */}
          <div style={{
            padding: isMobile ? '15px' : '20px'
          }}>
            <div style={{
              fontSize: isMobile ? '16px' : '14px',
              color: '#2c3e50',
              marginBottom: '15px',
              fontWeight: '500'
            }}>
              包含作品: {portfolio.works ? portfolio.works.length : 0} 个
            </div>

            {/* 作品预览 */}
            {portfolio.works && portfolio.works.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px'
              }}>
                {portfolio.works.slice(0, 6).map((work, index) => (
                  <div key={index} style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '10px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '14px' : '13px',
                      color: '#2c3e50',
                      marginBottom: '5px',
                      fontWeight: '500'
                    }}>
                      {work.title || `作品 ${index + 1}`}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '12px' : '11px',
                      color: '#6c757d'
                    }}>
                      {work.authorName}
                    </div>
                  </div>
                ))}
                
                {portfolio.works.length > 6 && (
                  <div style={{
                    background: '#e9ecef',
                    borderRadius: '8px',
                    padding: '10px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '14px' : '13px',
                      color: '#6c757d'
                    }}>
                      +{portfolio.works.length - 6} 更多
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 创建作品集模态框 */}
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
              <h3 style={{ margin: 0, color: '#2c3e50' }}>创建作品集</h3>
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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>作品集标题</label>
                <input
                  type="text"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="请输入作品集标题"
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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>作品集描述</label>
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请描述您的作品集..."
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
                    checked={portfolioForm.isPublic}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: isMobile ? '16px' : '14px' }}>公开作品集</span>
                </label>
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
                  onClick={handleCreatePortfolio}
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
                  {loading ? '创建中...' : '创建'}
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