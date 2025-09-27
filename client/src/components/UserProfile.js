import React, { useState, useEffect } from 'react';
import api from '../api';

export default function UserProfile({ onBack, onUserInfoUpdate, isMobile = false }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: ''
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
    saveButton: {
      padding: isMobile ? '14px 20px' : '12px 24px',
      background: '#27ae60',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      fontWeight: '500',
      marginRight: '10px',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '48px' : '44px'
    },
    cancelButton: {
      padding: isMobile ? '14px 20px' : '12px 24px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '48px' : '44px'
    }
  };

  // 加载用户信息
  const loadUserInfo = async () => {
    try {
      const savedUserInfo = localStorage.getItem('user_profile');
      if (savedUserInfo) {
        const parsedInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedInfo);
        setFormData({
          name: parsedInfo.name || '',
          class: parsedInfo.class || ''
        });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  // 保存用户信息
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage('请输入姓名');
      return;
    }

    setLoading(true);
    try {
      const updatedInfo = {
        ...userInfo,
        name: formData.name.trim(),
        class: formData.class.trim()
      };

      // 保存到localStorage
      localStorage.setItem('user_profile', JSON.stringify(updatedInfo));
      
      // 同步到服务器
      try {
        await api.user.sync(
          userInfo?.userID || Date.now().toString(),
          formData.name.trim(),
          formData.class.trim()
        );
      } catch (syncError) {
        console.warn('同步到服务器失败，但本地保存成功:', syncError);
      }

      setUserInfo(updatedInfo);
      setEditMode(false);
      setMessage('保存成功');
      
      // 通知父组件更新
      if (onUserInfoUpdate) {
        onUserInfoUpdate(updatedInfo);
      }
    } catch (error) {
      console.error('保存失败:', error);
      setMessage('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setFormData({
      name: userInfo?.name || '',
      class: userInfo?.class || ''
    });
    setEditMode(false);
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
        个人信息
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

      {/* 用户信息卡片 */}
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
        {/* 头像区域 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: isMobile ? '100px' : '120px',
            height: isMobile ? '100px' : '120px',
            borderRadius: '50%',
            background: '#f8f9fa',
            border: '4px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            fontSize: isMobile ? '36px' : '48px',
            color: '#6c757d',
            fontWeight: 'bold',
            '-webkit-transform': 'translateZ(0)',
            transform: 'translateZ(0)',
            '-webkit-backface-visibility': 'hidden',
            backfaceVisibility: 'hidden'
          }}>
            {(userInfo?.name || '用户').charAt(0).toUpperCase()}
          </div>
          
        </div>

        {/* 用户信息表单 */}
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#2c3e50',
              fontSize: isMobile ? '16px' : '14px'
            }}>
              姓名
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入您的姓名"
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
            ) : (
              <div style={{
                padding: isMobile ? '14px' : '12px',
                background: '#f8f9fa',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '14px',
                color: '#2c3e50'
              }}>
                {userInfo?.name || '未设置'}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#2c3e50',
              fontSize: isMobile ? '16px' : '14px'
            }}>
              班级
            </label>
            {editMode ? (
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
            ) : (
              <div style={{
                padding: isMobile ? '14px' : '12px',
                background: '#f8f9fa',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '14px',
                color: '#2c3e50'
              }}>
                {userInfo?.class || '未设置'}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    ...mobileStyles.saveButton,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancel}
                  style={mobileStyles.cancelButton}
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={mobileStyles.saveButton}
              >
                编辑信息
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{
          fontSize: isMobile ? '18px' : '16px',
          color: '#2c3e50',
          marginBottom: '15px'
        }}>
          使用说明
        </h3>
        <ul style={{
          fontSize: isMobile ? '14px' : '13px',
          color: '#6c757d',
          lineHeight: '1.6',
          paddingLeft: '20px'
        }}>
          <li>请填写真实的姓名和班级信息</li>
          <li>信息修改后会自动保存到本地</li>
          <li>建议使用真实姓名以便其他用户识别</li>
        </ul>
      </div>
    </div>
  );
}