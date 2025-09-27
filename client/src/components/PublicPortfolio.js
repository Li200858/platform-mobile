import React, { useState, useEffect } from 'react';
import FilePreview from './FilePreview';
import api from '../api';

export default function PublicPortfolio({ userInfo, onBack, isMobile = false }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

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
    }
  };

  // 加载公开作品集
  const loadPublicPortfolios = async () => {
    setLoading(true);
    try {
      const data = await api.portfolio.getPublicPortfolios();
      setPortfolios(data);
    } catch (error) {
      console.error('加载公开作品集失败:', error);
      setMessage('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicPortfolios();
  }, []);

  // 查看作品集详情
  const handleViewPortfolio = async (portfolioId) => {
    setLoading(true);
    try {
      const data = await api.portfolio.getPortfolioDetail(portfolioId);
      setSelectedPortfolio(data);
    } catch (error) {
      console.error('加载作品集详情失败:', error);
      setMessage('加载详情失败，请重试');
    } finally {
      setLoading(false);
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
        公开作品集
      </h1>

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
      {!loading && portfolios.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>暂无公开作品集</div>
          <div style={{ fontSize: '14px' }}>期待更多精彩的作品集！</div>
        </div>
      )}

      {!loading && portfolios.map(portfolio => (
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
            background: '#e8f5e8'
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
              <button
                onClick={() => handleViewPortfolio(portfolio._id)}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 10px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '11px',
                  '-webkit-tap-highlight-color': 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                查看详情
              </button>
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

          {/* 作品集预览 */}
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
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

      {/* 作品集详情模态框 */}
      {selectedPortfolio && (
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
            maxWidth: '800px',
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
              <h3 style={{ margin: 0, color: '#2c3e50' }}>{selectedPortfolio.title}</h3>
              <button
                onClick={() => setSelectedPortfolio(null)}
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
              {/* 作品集信息 */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: isMobile ? '16px' : '14px',
                  color: '#2c3e50',
                  marginBottom: '10px',
                  fontWeight: '500'
                }}>
                  作品集信息
                </div>
                <div style={{
                  fontSize: isMobile ? '14px' : '13px',
                  color: '#6c757d',
                  lineHeight: '1.6'
                }}>
                  <div>作者: {selectedPortfolio.authorName}</div>
                  <div>班级: {selectedPortfolio.authorClass}</div>
                  <div>创建时间: {new Date(selectedPortfolio.createdAt).toLocaleString()}</div>
                  <div>作品数量: {selectedPortfolio.works ? selectedPortfolio.works.length : 0} 个</div>
                </div>
              </div>

              {/* 作品集描述 */}
              {selectedPortfolio.description && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontSize: isMobile ? '16px' : '14px',
                    color: '#2c3e50',
                    marginBottom: '10px',
                    fontWeight: '500'
                  }}>
                    作品集描述
                  </div>
                  <div style={{
                    fontSize: isMobile ? '15px' : '14px',
                    color: '#2c3e50',
                    lineHeight: '1.6'
                  }}>
                    {selectedPortfolio.description}
                  </div>
                </div>
              )}

              {/* 作品列表 */}
              {selectedPortfolio.works && selectedPortfolio.works.length > 0 && (
                <div>
                  <div style={{
                    fontSize: isMobile ? '16px' : '14px',
                    color: '#2c3e50',
                    marginBottom: '15px',
                    fontWeight: '500'
                  }}>
                    作品列表
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    {selectedPortfolio.works.map((work, index) => (
                      <div key={index} style={{
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '15px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{
                          fontSize: isMobile ? '16px' : '14px',
                          color: '#2c3e50',
                          marginBottom: '8px',
                          fontWeight: '500'
                        }}>
                          {work.title}
                        </div>
                        <div style={{
                          fontSize: isMobile ? '14px' : '13px',
                          color: '#6c757d',
                          marginBottom: '8px',
                          lineHeight: '1.4'
                        }}>
                          {work.content ? work.content.substring(0, 100) + '...' : ''}
                        </div>
                        <div style={{
                          fontSize: isMobile ? '12px' : '11px',
                          color: '#6c757d'
                        }}>
                          作者: {work.authorName} | 分类: {work.tab || '未分类'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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