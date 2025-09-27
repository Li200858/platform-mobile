import React, { useState, useEffect } from 'react';
import FilePreview from './FilePreview';
import api from '../api';

export default function MyWorks({ userInfo, onBack, isMobile = false }) {
  const [works, setWorks] = useState([]);
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
    }
  };

  // 加载我的作品
  const loadWorks = async () => {
    if (!userInfo?.name) return;

    setLoading(true);
    try {
      const data = await api.art.getMyWorks(userInfo.name);
      setWorks(data);
    } catch (error) {
      console.error('加载作品失败:', error);
      setMessage('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorks();
  }, [userInfo]);

  // 删除作品
  const handleDelete = async (artId) => {
    if (!userInfo?.name) {
      setMessage('请先登录');
      return;
    }

    if (!confirm('确定要删除这个作品吗？删除后无法恢复。')) {
      return;
    }

    try {
      await api.art.delete(artId, userInfo.name, false);
      setMessage('删除成功');
      await loadWorks(); // 重新加载列表
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
        我的作品
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
          <div style={{ fontSize: '14px' }}>登录后可以查看您的作品</div>
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

      {/* 作品列表 */}
      {!loading && userInfo && works.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>暂无作品</div>
          <div style={{ fontSize: '14px' }}>快去发布第一个作品吧！</div>
        </div>
      )}

      {!loading && userInfo && works.map(art => (
        <div key={art._id} style={{
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
          {/* 作品头部 */}
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
                {art.title}
              </h3>
              <button
                onClick={() => handleDelete(art._id)}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 10px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '11px',
                  '-webkit-tap-highlight-color': 'transparent',
                  touchAction: 'manipulation',
                  minHeight: isMobile ? '36px' : '32px'
                }}
              >
                删除
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: isMobile ? '14px' : '13px',
              color: '#7f8c8d'
            }}>
              <span>作者: {art.authorName || art.author}</span>
              <span>班级: {art.authorClass}</span>
              <span>时间: {new Date(art.createdAt).toLocaleString()}</span>
              {art.tab && <span>分类: {art.tab}</span>}
            </div>
          </div>

          {/* 作品内容 */}
          <div style={{
            padding: isMobile ? '15px' : '20px'
          }}>
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

          {/* 作品统计 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '12px 15px' : '15px 20px',
            borderTop: '1px solid #f1f3f4',
            background: '#f8f9fa'
          }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{
                fontSize: isMobile ? '14px' : '13px',
                color: '#6c757d'
              }}>
                <span style={{ fontWeight: '500' }}>赞</span> {art.likes || 0} 点赞
              </div>
              <div style={{
                fontSize: isMobile ? '14px' : '13px',
                color: '#6c757d'
              }}>
                <span style={{ fontWeight: '500' }}>收藏</span> {art.favorites ? art.favorites.length : 0} 收藏
              </div>
              <div style={{
                fontSize: isMobile ? '14px' : '13px',
                color: '#6c757d'
              }}>
                <span style={{ fontWeight: '500' }}>评论</span> {art.comments ? art.comments.length : 0} 评论
              </div>
            </div>

            <div style={{
              fontSize: isMobile ? '12px' : '11px',
              color: '#6c757d'
            }}>
              发布时间: {new Date(art.createdAt).toLocaleDateString()}
            </div>
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