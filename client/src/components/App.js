import React, { useState, useEffect } from 'react';

// 添加通知动画样式
const notificationStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

// 将样式添加到页面
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = notificationStyles;
  document.head.appendChild(styleSheet);
}
import Art from './Art';
import Activity from './Activity';
import Feedback from './Feedback';
import UserProfile from './UserProfile';
import MyCollection from './MyCollection';
import MyWorks from './MyWorks';
import AdminPanel from './AdminPanel';
import UserSync from './UserSync';
import Search from './Search';
import Notifications from './Notifications';
import Portfolio from './Portfolio';
import PublicPortfolio from './PublicPortfolio';
import ResourceLibrary from './ResourceLibrary';
import ErrorBoundary from './ErrorBoundary';
import { UserIDProvider, useUserID } from './UserIDManager';
import api from './api';
import './App.css';

function MainApp() {
  const [section, setSection] = useState('art');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState({ isEnabled: false, message: '' });
  const [notificationCount, setNotificationCount] = useState(0);
  const { userID } = useUserID();

  // 加载用户信息 - 优化版本
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadUserInfo = async () => {
      try {
        const savedUserInfo = localStorage.getItem('user_profile');
        if (savedUserInfo) {
          const parsedInfo = JSON.parse(savedUserInfo);
          if (isMounted) {
            setUserInfo(prevInfo => {
              // 只有当用户信息真正改变时才更新
              if (!prevInfo || prevInfo.name !== parsedInfo.name || prevInfo.class !== parsedInfo.class) {
                return parsedInfo;
              }
              return prevInfo;
            });
          }
        } else {
          if (isMounted) {
            setUserInfo(null);
          }
        }
        retryCount = 0; // 重置重试计数
      } catch (error) {
        console.error('加载用户信息失败:', error);
        retryCount++;
        if (retryCount < maxRetries && isMounted) {
          setTimeout(loadUserInfo, 2000 * retryCount);
        }
      }
    };
    
    loadUserInfo();
    
    // 监听localStorage变化，当用户信息被更新时自动刷新
    const handleStorageChange = (e) => {
      if (e.key === 'user_profile' && isMounted) {
        loadUserInfo();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 实时通知提醒 - 智能轮询版本
  useEffect(() => {
    let interval;
    let isMounted = true;
    let lastNotificationCount = 0;
    
    const loadNotificationCount = async () => {
      if (!isMounted || !userInfo || !userInfo.name) {
        return;
      }
      
      try {
        const notifications = await api.notifications.getNotifications(userInfo.name);
        if (isMounted) {
          const unreadCount = notifications.filter(n => !n.isRead).length;
          
          // 如果有新通知，显示实时提醒
          if (unreadCount > lastNotificationCount && lastNotificationCount > 0) {
            showNotificationAlert(unreadCount - lastNotificationCount);
          }
          
          setNotificationCount(unreadCount);
          lastNotificationCount = unreadCount;
        }
      } catch (error) {
        console.error('加载通知失败:', error);
      }
    };

    // 显示通知提醒
    const showNotificationAlert = (newCount) => {
      if (newCount > 0) {
        // 使用浏览器原生通知API
        if (Notification.permission === 'granted') {
          new Notification('新通知', {
            body: `您有 ${newCount} 条新通知`,
            icon: '/favicon.ico',
            tag: 'notification'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('新通知', {
                body: `您有 ${newCount} 条新通知`,
                icon: '/favicon.ico',
                tag: 'notification'
              });
            }
          });
        }
        
        // 页面内提醒
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          font-size: 14px;
          max-width: 300px;
          animation: slideIn 0.3s ease-out;
        `;
        alertDiv.innerHTML = `您有 ${newCount} 条新通知`;
        document.body.appendChild(alertDiv);
        
        // 3秒后自动消失
        setTimeout(() => {
          if (alertDiv.parentNode) {
            alertDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
              if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
              }
            }, 300);
          }
        }, 3000);
      }
    };

    // 智能轮询：根据用户活动调整频率
    let pollInterval = 30000; // 默认30秒
    let lastActivity = Date.now();
    
    const startSmartPolling = () => {
      const poll = () => {
        if (!isMounted) return;
        
        const now = Date.now();
        const timeSinceActivity = now - lastActivity;
        
        // 如果用户活跃（最近5分钟内有活动），增加轮询频率
        if (timeSinceActivity < 300000) { // 5分钟
          pollInterval = 15000; // 15秒
        } else {
          pollInterval = 60000; // 1分钟
        }
        
        loadNotificationCount();
        interval = setTimeout(poll, pollInterval);
      };
      
      poll();
    };

    // 监听用户活动
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // 页面可见性变化处理
    const handleVisibilityChange = () => {
      if (!document.hidden && isMounted) {
        // 页面重新可见时，立即检查通知
        loadNotificationCount();
        lastActivity = Date.now();
      }
    };

    // 请求通知权限
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 添加用户活动监听
    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('scroll', updateActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 延迟启动智能轮询
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        loadNotificationCount();
        startSmartPolling();
      }
    }, 5000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (interval) {
        clearTimeout(interval);
      }
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('keypress', updateActivity);
      document.removeEventListener('scroll', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userInfo?.name]);

  // 暴露setSection函数给全局使用
  useEffect(() => {
    window.setSection = setSection;
    return () => {
      delete window.setSection;
    };
  }, []);

  // 移动端Safari兼容性修复 - 增强版
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isIPad = /ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIPadOS = /ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && /safari/i.test(navigator.userAgent));

    if (isIOS || isIPad || isIPadOS || (isSafari && isMobile)) {
      console.log('检测到iOS设备、iPad或移动端Safari，应用特殊修复');
      
      // 强制重绘，确保内容在Safari中可见
      const forceRepaint = () => {
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.style.webkitTransform = 'translateZ(0)';
          rootElement.style.transform = 'translateZ(0)';
          rootElement.style.webkitBackfaceVisibility = 'hidden';
          rootElement.style.backfaceVisibility = 'hidden';
          rootElement.style.position = 'relative';
          rootElement.style.zIndex = '1';
          rootElement.style.minHeight = '100vh';
          rootElement.style.display = 'block';
          rootElement.style.visibility = 'visible';
          rootElement.style.opacity = '1';
        }
      };

      // iPad Safari特殊修复 - 增强版
      const forceIPadRepaint = () => {
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.style.webkitTransform = 'translate3d(0, 0, 0)';
          rootElement.style.transform = 'translate3d(0, 0, 0)';
          rootElement.style.webkitBackfaceVisibility = 'hidden';
          rootElement.style.backfaceVisibility = 'hidden';
          rootElement.style.webkitPerspective = '1000px';
          rootElement.style.perspective = '1000px';
          rootElement.style.willChange = 'transform';
          rootElement.style.position = 'relative';
          rootElement.style.zIndex = '2';
          rootElement.style.minHeight = '100vh';
          rootElement.style.width = '100%';
          rootElement.style.display = 'block';
          rootElement.style.visibility = 'visible';
          rootElement.style.opacity = '1';
          rootElement.style.overflow = 'visible';
          rootElement.style.overflowX = 'hidden';
          rootElement.style.overflowY = 'auto';
          
          // 强制重排
          rootElement.offsetHeight;
        }
      };

      // 立即执行一次
      forceRepaint();

      // iPad Safari特殊处理 - 增强版
      if (isIPad || isIPadOS) {
        console.log('应用iPad Safari特殊修复');
        setTimeout(forceIPadRepaint, 100);
        setTimeout(forceIPadRepaint, 300);
        setTimeout(forceIPadRepaint, 500);
        setTimeout(forceIPadRepaint, 1000);
        setTimeout(forceIPadRepaint, 2000);
        setTimeout(forceIPadRepaint, 3000);
      } else {
        // 延迟执行，确保React组件渲染完成
        setTimeout(forceRepaint, 100);
        setTimeout(forceRepaint, 500);
        setTimeout(forceRepaint, 1000);
      }

      // 监听页面可见性变化 - 增强版
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          if (isIPad || isIPadOS) {
            forceIPadRepaint();
          } else {
            forceRepaint();
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 监听窗口大小变化 - 增强版
      const handleResize = () => {
        if (isIPad || isIPadOS) {
          forceIPadRepaint();
        } else {
          forceRepaint();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);


  // 加载维护模式状态
  useEffect(() => {
    const loadMaintenanceStatus = async () => {
      try {
        const status = await api.maintenance.getStatus();
        setMaintenanceStatus(status);
      } catch (error) {
        console.error('加载维护状态失败:', error);
      }
    };
    loadMaintenanceStatus();
  }, []);

  const checkAdminStatus = React.useCallback(async () => {
    try {
      if (userInfo && userInfo.name) {
        const data = await api.admin.check(userInfo.name);
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      console.error('检查管理员状态失败:', error);
    }
  }, [userInfo]);

  // 检查管理员权限
  useEffect(() => {
    if (userInfo && userInfo.name) {
      checkAdminStatus();
    }
  }, [userInfo, checkAdminStatus]);

  // 搜索功能
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowSearch(false);
      return;
    }
    try {
      const data = await api.search.global(searchQuery.trim(), searchType);
      setSearchResults(data);
      setShowSearch(true);
    } catch (error) {
      setShowSearch(false);
    }
  };

  // 主内容区
  let content = null;
  try {
    if (section === 'art') {
      content = <Art userInfo={userInfo} isAdmin={isAdmin} maintenanceStatus={maintenanceStatus} />;
    } else if (section === 'activity') {
      content = <Activity userInfo={userInfo} isAdmin={isAdmin} onBack={() => setSection('art')} maintenanceStatus={maintenanceStatus} />;
    } else if (section === 'feedback') {
      content = <Feedback userInfo={userInfo} maintenanceStatus={maintenanceStatus} />;
    } else if (section === 'profile') {
      content = <UserProfile onBack={() => setSection('art')} onUserInfoUpdate={setUserInfo} />;
    } else if (section === 'sync') {
      content = <UserSync onBack={() => setSection('art')} />;
    } else if (section === 'collection') {
      content = <MyCollection userInfo={userInfo} onBack={() => setSection('art')} />;
    } else if (section === 'myworks') {
      content = <MyWorks userInfo={userInfo} onBack={() => setSection('art')} />;
    } else if (section === 'admin') {
      content = <AdminPanel userInfo={userInfo} isAdmin={isAdmin} onBack={() => setSection('art')} />;
    } else if (section === 'search') {
      content = <Search userInfo={userInfo} onBack={() => setSection('art')} />;
        } else if (section === 'portfolio') {
          content = <Portfolio userInfo={userInfo} isAdmin={isAdmin} onBack={() => setSection('art')} />;
        } else if (section === 'public-portfolio') {
          content = <PublicPortfolio userInfo={userInfo} onBack={() => setSection('art')} />;
        } else if (section === 'resources') {
          content = <ResourceLibrary userInfo={userInfo} isAdmin={isAdmin} onBack={() => setSection('art')} />;
    } else if (section === 'notifications') {
      content = <Notifications userInfo={userInfo} onBack={() => setSection('art')} />;
    }
  } catch (error) {
    console.error('Error rendering content:', error);
    content = (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>页面加载出错</h2>
        <p>错误信息: {error.message}</p>
        <button onClick={() => window.location.reload()}>刷新页面</button>
      </div>
    );
  }

  return (
    <div className="app-root">
      {/* 维护模式提示 */}
      {maintenanceStatus.isEnabled && !isAdmin && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          padding: '15px',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          [警告] {maintenanceStatus.message}
        </div>
      )}

      {/* 顶部导航栏 */}
      <header className="main-header">
        <div className="header-top">
          <div className="logo-area">
            <div className="site-title">海淀外国语国际部艺术平台</div>
            <div className="site-title-en">HFLS International Art Platform</div>
          </div>
          <div className="header-right">
            <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="all">全部</option>
                <option value="art">艺术作品</option>
                <option value="activity">活动设计</option>
                <option value="user">用户</option>
              </select>
              <input
                type="text"
                placeholder="搜索内容..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1 }}
              />
              <button onClick={handleSearch}>搜索</button>
            </div>
          </div>
        </div>
        <nav className="main-nav">
          <button className={section === 'art' ? 'active' : ''} onClick={() => setSection('art')}>
            艺术作品
          </button>
          <button className={section === 'activity' ? 'active' : ''} onClick={() => setSection('activity')}>
            活动展示
          </button>
          <button className={section === 'public-portfolio' ? 'active' : ''} onClick={() => setSection('public-portfolio')}>
            公开作品集
          </button>
          <button className={section === 'portfolio' ? 'active' : ''} onClick={() => setSection('portfolio')}>
            我的作品集
          </button>
          <button className={section === 'myworks' ? 'active' : ''} onClick={() => setSection('myworks')}>
            我的作品
          </button>
          <button className={section === 'collection' ? 'active' : ''} onClick={() => setSection('collection')}>
            我的收藏
          </button>
          <button className={section === 'resources' ? 'active' : ''} onClick={() => setSection('resources')}>
            资料库
          </button>
          <button className={section === 'feedback' ? 'active' : ''} onClick={() => setSection('feedback')}>
            意见反馈
          </button>
          <button className={section === 'profile' ? 'active' : ''} onClick={() => setSection('profile')}>
            个人信息
          </button>
          <button className={section === 'sync' ? 'active' : ''} onClick={() => setSection('sync')}>
            数据同步
          </button>
          {isAdmin && (
            <button className={section === 'admin' ? 'active' : ''} onClick={() => setSection('admin')}>
              管理面板
            </button>
          )}
          <button className={section === 'notifications' ? 'active' : ''} onClick={() => setSection('notifications')} style={{ position: 'relative' }}>
            通知
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </nav>
      </header>

      {/* 搜索结果展示 */}
      {showSearch && searchResults && (
        <div className="search-result-panel">
          <div className="search-result-header">
            <h3>搜索结果："{searchQuery}"</h3>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults(null);
              }}
            >
              关闭
            </button>
          </div>
          {(searchResults.arts && searchResults.arts.length > 0) || (searchResults.activities && searchResults.activities.length > 0) || (searchResults.users && searchResults.users.length > 0) ? (
            <div>
              {searchResults.arts && searchResults.arts.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h4>艺术作品 ({searchResults.arts.length}条结果)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {searchResults.arts.map(item => (
                  <div 
                    key={item._id} 
                    className="search-result-item"
                    onClick={() => {
                      // 关闭搜索面板
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults(null);
                      // 切换到艺术作品页面
                      setSection('art');
                      // 滚动到页面顶部
                      window.scrollTo(0, 0);
                      // 高亮显示搜索结果
                      setTimeout(() => {
                        const element = document.querySelector(`[data-art-id="${item._id}"]`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          element.style.background = '#fff3cd';
                          element.style.border = '2px solid #ffc107';
                          setTimeout(() => {
                            element.style.background = '';
                            element.style.border = '';
                          }, 3000);
                        }
                      }, 100);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: 5, color: '#2c3e50' }}>{item.title}</div>
                    <div style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '8px' }}>
                      {item.content.substring(0, 100)}...
                    </div>
                    <div className="search-result-meta">
                      <span>作者: {item.authorName || item.author}</span>
                      <span>班级: {item.authorClass}</span>
                      <span>发布时间: {new Date(item.createdAt).toLocaleString()}</span>
                      {item.tab && <span>分类: {item.tab}</span>}
                    </div>
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '12px', 
                      color: '#3498db',
                      fontWeight: 'bold'
                    }}>
                      点击查看完整内容
                    </div>
                  </div>
                ))}
              </div>
            </div>
              )}
              {searchResults.activities && searchResults.activities.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h4>活动展示 ({searchResults.activities.length}条结果)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {searchResults.activities.map(item => (
                  <div 
                    key={item._id} 
                    className="search-result-item"
                    onClick={() => {
                      // 关闭搜索面板
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults(null);
                      // 切换到活动页面
                      setSection('activity');
                      // 滚动到页面顶部
                      window.scrollTo(0, 0);
                      // 高亮显示搜索结果
                      setTimeout(() => {
                        const element = document.querySelector(`[data-activity-id="${item._id}"]`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          element.style.background = '#fff3cd';
                          element.style.border = '2px solid #ffc107';
                          setTimeout(() => {
                            element.style.background = '';
                            element.style.border = '';
                          }, 3000);
                        }
                      }, 100);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: 5, color: '#2c3e50' }}>{item.title}</div>
                    <div style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '8px' }}>
                      {(item.description || item.content || '').substring(0, 100)}...
                    </div>
                    <div className="search-result-meta">
                      <span>组织者: {item.authorName || item.author}</span>
                      <span>班级: {item.authorClass}</span>
                      <span>发布时间: {new Date(item.createdAt).toLocaleString()}</span>
                      {item.tab && <span>分类: {item.tab}</span>}
                    </div>
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '12px', 
                      color: '#3498db',
                      fontWeight: 'bold'
                    }}>
                      点击查看完整内容
                    </div>
                  </div>
                ))}
              </div>
            </div>
              )}
              {searchResults.users && searchResults.users.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h4>用户 ({searchResults.users.length}条结果)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {searchResults.users.map(user => (
                  <div 
                    key={user._id || user.name} 
                    className="search-result-item"
                    style={{ cursor: 'default' }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: 5, color: '#2c3e50' }}>{user.name}</div>
                    <div style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '8px' }}>
                      班级: {user.class}
                    </div>
                    <div className="search-result-meta">
                      <span>用户ID: {user.userID || '未知'}</span>
                      <span>角色: {user.role || '用户'}</span>
                      {user.isAdmin && <span>管理员</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#7f8c8d', padding: 40 }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>未找到相关内容</div>
              <div style={{ fontSize: '14px' }}>请尝试其他关键词或检查拼写</div>
            </div>
          )}
        </div>
      )}

      {/* 主内容区 */}
      <main className="main-content">
        <ErrorBoundary>
          {content}
        </ErrorBoundary>
      </main>
      
      <footer className="main-footer">
        &copy; {new Date().getFullYear()} HFLS International Art Platform - 让艺术点亮校园
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <UserIDProvider>
      <MainApp />
    </UserIDProvider>
  );
}