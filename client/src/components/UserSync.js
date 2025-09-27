import React, { useState, useEffect } from 'react';
import { useUserID } from './UserIDManager';
import api from '../api';

export default function UserSync({ onBack, isMobile = false }) {
  const { userID, isLoading: userIDLoading } = useUserID();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    avatar: ''
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
    syncButton: {
      padding: isMobile ? '14px 20px' : '12px 24px',
      background: '#3498db',
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

  // 加载本地用户信息
  const loadLocalUserInfo = () => {
    try {
      const savedUserInfo = localStorage.getItem('user_profile');
      if (savedUserInfo) {
        const parsedInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedInfo);
        setFormData({
          name: parsedInfo.name || '',
          class: parsedInfo.class || '',
          avatar: parsedInfo.avatar || ''
        });
      }
    } catch (error) {
      console.error('加载本地用户信息失败:', error);
    }
  };

  useEffect(() => {
    loadLocalUserInfo();
  }, []);

  // 同步用户信息到服务器
  const handleSync = async () => {
    if (!userID) {
      setMessage('用户ID未生成，请稍后重试');
      return;
    }

    if (!formData.name.trim()) {
      setMessage('请输入姓名');
      return;
    }

    setLoading(true);
    try {
      // 检查姓名是否可用
      const nameCheck = await api.user.checkName(formData.name.trim(), userID);
      if (!nameCheck.available) {
        setMessage(nameCheck.error || '该姓名已被使用');
        return;
      }

      // 同步到服务器
      const response = await api.user.sync({
        userID: userID,
        name: formData.name.trim(),
        class: formData.class.trim(),
        avatar: formData.avatar.trim()
      });

      if (response.success) {
        // 更新本地存储
        const updatedInfo = {
          userID: userID,
          name: formData.name.trim(),
          class: formData.class.trim(),
          avatar: formData.avatar.trim(),
          role: response.user.role,
          isAdmin: response.user.isAdmin
        };

        localStorage.setItem('user_profile', JSON.stringify(updatedInfo));
        setUserInfo(updatedInfo);
        setMessage('数据同步成功！');
      }
    } catch (error) {
      console.error('同步失败:', error);
      if (error.message.includes('该姓名已被注册')) {
        setMessage('该姓名已被其他用户注册，请使用其他姓名');
      } else {
        setMessage('同步失败，请检查网络连接后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 检查服务器用户信息
  const checkServerUserInfo = async () => {
    if (!userID) return;

    setLoading(true);
    try {
      const response = await api.user.getInfo(userID);
      setUserInfo(response);
      setFormData({
        name: response.name || '',
        class: response.class || '',
        avatar: response.avatar || ''
      });
      setMessage('已从服务器获取最新用户信息');
    } catch (error) {
      console.error('获取服务器用户信息失败:', error);
      setMessage('未找到服务器用户信息，请先同步');
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
        数据同步
      </h1>

      {/* 消息提示 */}
      {message && (
        <div style={{
          background: message.includes('成功') ? '#d4edda' : message.includes('失败') ? '#f8d7da' : '#d1ecf1',
          color: message.includes('成功') ? '#155724' : message.includes('失败') ? '#721c24' : '#0c5460',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `1px solid ${message.includes('成功') ? '#c3e6cb' : message.includes('失败') ? '#f5c6cb' : '#bee5eb'}`
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
              color: 'inherit'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 用户ID显示 */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{
          fontSize: isMobile ? '16px' : '14px',
          fontWeight: '500',
          color: '#2c3e50',
          marginBottom: '8px'
        }}>
          您的用户ID
        </div>
        <div style={{
          fontSize: isMobile ? '14px' : '12px',
          color: '#6c757d',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          background: 'white',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          {userIDLoading ? '生成中...' : userID || '未生成'}
        </div>
      </div>

      {/* 用户信息表单 */}
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
        <h3 style={{
          fontSize: isMobile ? '18px' : '16px',
          color: '#2c3e50',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          用户信息设置
        </h3>

        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#2c3e50',
              fontSize: isMobile ? '16px' : '14px'
            }}>
              姓名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入您的真实姓名"
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '14px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#2c3e50',
              fontSize: isMobile ? '16px' : '14px'
            }}>
              班级
            </label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
              placeholder="请输入您的班级"
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '14px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#2c3e50',
              fontSize: isMobile ? '16px' : '14px'
            }}>
              头像链接
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              placeholder="头像图片链接（可选）"
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '14px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          {/* 同步按钮 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleSync}
              disabled={loading || !userID}
              style={{
                ...mobileStyles.syncButton,
                opacity: (loading || !userID) ? 0.6 : 1,
                cursor: (loading || !userID) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '同步中...' : '同步到服务器'}
            </button>
            
            <button
              onClick={checkServerUserInfo}
              disabled={loading || !userID}
              style={{
                ...mobileStyles.syncButton,
                background: '#17a2b8',
                opacity: (loading || !userID) ? 0.6 : 1,
                cursor: (loading || !userID) ? 'not-allowed' : 'pointer'
              }}
            >
              从服务器获取
            </button>
          </div>
        </div>
      </div>

      {/* 当前用户信息显示 */}
      {userInfo && (
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{
            fontSize: isMobile ? '16px' : '14px',
            color: '#2c3e50',
            marginBottom: '15px'
          }}>
            当前用户信息
          </h4>
          <div style={{
            fontSize: isMobile ? '14px' : '13px',
            color: '#6c757d',
            lineHeight: '1.6'
          }}>
            <div><strong>用户ID:</strong> {userInfo.userID}</div>
            <div><strong>姓名:</strong> {userInfo.name}</div>
            <div><strong>班级:</strong> {userInfo.class}</div>
            {userInfo.role && <div><strong>角色:</strong> {userInfo.role}</div>}
            {userInfo.isAdmin && <div><strong>管理员:</strong> 是</div>}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div style={{
        background: '#fff3cd',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #ffeaa7',
        marginTop: '20px'
      }}>
        <h4 style={{
          fontSize: isMobile ? '16px' : '14px',
          color: '#856404',
          marginBottom: '15px'
        }}>
          使用说明
        </h4>
        <ul style={{
          fontSize: isMobile ? '14px' : '13px',
          color: '#856404',
          lineHeight: '1.6',
          paddingLeft: '20px',
          margin: 0
        }}>
          <li>数据同步会将您的信息保存到服务器</li>
          <li>姓名一旦设置，通常不能修改（除非未被其他用户使用）</li>
          <li>建议使用真实姓名以便其他用户识别</li>
          <li>头像链接是可选的，可以留空</li>
          <li>本地数据会与服务器数据保持同步</li>
        </ul>
      </div>
    </div>
  );
}