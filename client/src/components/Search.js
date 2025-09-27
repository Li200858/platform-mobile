import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Search({ userInfo, onBack, isMobile = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

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
    searchButton: {
      padding: isMobile ? '14px 20px' : '12px 24px',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      fontWeight: '500',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '48px' : '44px'
    }
  };

  // 加载搜索历史
  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem('search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  // 保存搜索历史
  const saveSearchHistory = (query) => {
    if (!query.trim()) return;
    
    try {
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  // 执行搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMessage('请输入搜索关键词');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const results = await api.search.global(searchQuery.trim(), searchType);
      setSearchResults(results);
      saveSearchHistory(searchQuery.trim());
    } catch (error) {
      console.error('搜索失败:', error);
      setMessage('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 快速搜索
  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    setTimeout(() => {
      handleSearch();
    }, 100);
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
        搜索
      </h1>

      {/* 搜索表单 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        padding: isMobile ? '20px' : '30px',
        marginBottom: '20px',
        '-webkit-transform': 'translateZ(0)',
        transform: 'translateZ(0)',
        '-webkit-backface-visibility': 'hidden',
        backfaceVisibility: 'hidden'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#2c3e50',
            fontSize: isMobile ? '16px' : '14px'
          }}>
            搜索类型
          </label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
              boxSizing: 'border-box'
            }}
          >
            <option value="all">全部</option>
            <option value="art">艺术作品</option>
            <option value="activity">活动展示</option>
            <option value="user">用户</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#2c3e50',
            fontSize: isMobile ? '16px' : '14px'
          }}>
            搜索关键词
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="请输入搜索关键词..."
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            ...mobileStyles.searchButton,
            width: '100%',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>

      {/* 搜索历史 */}
      {searchHistory.length > 0 && !searchResults && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '20px' : '30px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: isMobile ? '18px' : '16px',
            color: '#2c3e50',
            marginBottom: '15px'
          }}>
            搜索历史
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(item)}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 10px',
                  background: '#f8f9fa',
                  color: '#6c757d',
                  border: '1px solid #e9ecef',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '14px' : '13px',
                  '-webkit-tap-highlight-color': 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                {item}
              </button>
            ))}
          </div>
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

      {/* 搜索结果 */}
      {searchResults && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '20px' : '30px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '20px' : '18px',
            color: '#2c3e50',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            搜索结果: "{searchQuery}"
          </h2>

          {/* 艺术作品结果 */}
          {searchResults.arts && searchResults.arts.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: isMobile ? '18px' : '16px',
                color: '#2c3e50',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid #3498db'
              }}>
                艺术作品 ({searchResults.arts.length}条结果)
              </h3>
              {searchResults.arts.map(art => (
                <div key={art._id} style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: isMobile ? '16px' : '14px',
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    {art.title}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '14px' : '13px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {art.content.substring(0, 100)}...
                  </div>
                  <div style={{
                    fontSize: isMobile ? '12px' : '11px',
                    color: '#6c757d'
                  }}>
                    作者: {art.authorName} | 班级: {art.authorClass} | 时间: {new Date(art.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 活动结果 */}
          {searchResults.activities && searchResults.activities.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: isMobile ? '18px' : '16px',
                color: '#2c3e50',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid #27ae60'
              }}>
                活动展示 ({searchResults.activities.length}条结果)
              </h3>
              {searchResults.activities.map(activity => (
                <div key={activity._id} style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: isMobile ? '16px' : '14px',
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    {activity.title}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '14px' : '13px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {(activity.description || activity.content || '').substring(0, 100)}...
                  </div>
                  <div style={{
                    fontSize: isMobile ? '12px' : '11px',
                    color: '#6c757d'
                  }}>
                    组织者: {activity.authorName} | 班级: {activity.authorClass} | 时间: {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 用户结果 */}
          {searchResults.users && searchResults.users.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: isMobile ? '18px' : '16px',
                color: '#2c3e50',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid #f39c12'
              }}>
                用户 ({searchResults.users.length}条结果)
              </h3>
              {searchResults.users.map(user => (
                <div key={user._id || user.name} style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: isMobile ? '16px' : '14px',
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    {user.name}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '14px' : '13px',
                    color: '#6c757d'
                  }}>
                    班级: {user.class} | 角色: {user.role} {user.isAdmin && '| 管理员'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 无结果 */}
          {(!searchResults.arts || searchResults.arts.length === 0) && 
           (!searchResults.activities || searchResults.activities.length === 0) && 
           (!searchResults.users || searchResults.users.length === 0) && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#7f8c8d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>未找到相关内容</div>
              <div style={{ fontSize: '14px' }}>请尝试其他关键词或检查拼写</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}