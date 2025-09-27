import React, { useState, useEffect } from 'react';
import { useUserID } from './UserIDManager';
import api from '../api';

export default function UserSync({ onBack, isMobile = false }) {
  const { userID, isLoading: userIDLoading, importUserID, exportUserID } = useUserID();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [importID, setImportID] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    class: ''
  });
  const [nameEdited, setNameEdited] = useState(false);
  const [nameLocked, setNameLocked] = useState(false);

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
      const nameEditedFlag = localStorage.getItem('name_edited');
      
      if (savedUserInfo) {
        const parsedInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedInfo);
        setFormData({
          name: parsedInfo.name || '',
          class: parsedInfo.class || ''
        });
        
        // 检查姓名是否已经编辑过
        if (nameEditedFlag === 'true' || (parsedInfo.name && parsedInfo.name !== '用户')) {
          setNameEdited(true);
          setNameLocked(true);
        }
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

    // 强制检查姓名是否已锁定
    if (nameLocked) {
      setMessage('姓名已锁定，无法修改。如需修改请联系管理员。');
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
      const response = await api.user.sync(
        userID,
        formData.name.trim(),
        formData.class.trim()
      );

      if (response.success) {
        // 更新本地存储
        const updatedInfo = {
          userID: userID,
          name: formData.name.trim(),
          class: formData.class.trim(),
          role: response.user.role,
          isAdmin: response.user.isAdmin
        };

        localStorage.setItem('user_profile', JSON.stringify(updatedInfo));
        localStorage.setItem('name_edited', 'true'); // 标记姓名已编辑
        setUserInfo(updatedInfo);
        setNameEdited(true);
        setNameLocked(true);
        setMessage('数据同步成功！姓名已锁定，无法再次修改。');
      }
    } catch (error) {
      console.error('同步失败:', error);
      if (error.message.includes('该姓名已被注册')) {
        setMessage('该姓名已被其他用户注册，请使用其他姓名');
      } else if (error.message.includes('姓名已设置')) {
        setMessage('姓名已设置，无法修改。如需修改请联系管理员。');
        setNameLocked(true);
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
        class: response.class || ''
      });
      setMessage('已从服务器获取最新用户信息');
    } catch (error) {
      console.error('获取服务器用户信息失败:', error);
      setMessage('未找到服务器用户信息，请先同步');
    } finally {
      setLoading(false);
    }
  };

  // 导入用户ID
  const handleImport = async () => {
    if (!importID.trim()) {
      setMessage('请输入要导入的用户ID');
      return;
    }

    try {
      setMessage('正在验证用户ID并导入用户信息...');
      setLoading(true);
      
      // 先验证用户ID是否存在
      const userData = await api.user.get(importID.trim());
      
      if (!userData || !userData.name || !userData.class) {
        setMessage('该用户ID不存在或信息不完整，请检查ID是否正确');
        return;
      }
      
      // 验证通过后导入
      await importUserID(importID.trim());
      setMessage(`用户ID导入成功！已绑定到用户：${userData.name} (${userData.class})。页面将自动刷新以显示最新信息。`);
      setImportID('');
      
      // 延迟刷新页面，让用户看到成功消息
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (error.message.includes('404')) {
        setMessage('该用户ID不存在，请检查ID是否正确');
      } else {
        setMessage('导入失败：' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 导出用户ID
  const handleExport = () => {
    try {
      const exportedID = exportUserID();
      navigator.clipboard.writeText(exportedID).then(() => {
        setMessage('用户ID已复制到剪贴板！');
      }).catch(() => {
        setMessage('用户ID：' + exportedID);
      });
    } catch (error) {
      setMessage('导出失败：' + error.message);
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

      {/* ID导入导出功能 */}
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
          fontSize: isMobile ? '18px' : '20px',
          color: '#2c3e50',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          跨设备同步
        </h3>

        {/* 导出功能 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#2c3e50',
            fontSize: isMobile ? '16px' : '14px'
          }}>
            导出用户ID（用于其他设备）
          </label>
          <button
            onClick={handleExport}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#218838'}
            onMouseOut={(e) => e.target.style.background = '#28a745'}
          >
            复制用户ID
          </button>
        </div>

        {/* 导入功能 */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#2c3e50',
            fontSize: isMobile ? '16px' : '14px'
          }}>
            导入用户ID（从其他设备）
          </label>
          <input
            type="text"
            value={importID}
            onChange={(e) => setImportID(e.target.value)}
            placeholder="粘贴其他设备的用户ID"
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease',
              marginBottom: '10px'
            }}
          />
          <button
            onClick={handleImport}
            disabled={loading || !importID.trim()}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              background: loading || !importID.trim() ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
              fontWeight: '500',
              cursor: loading || !importID.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          >
            {loading ? '导入中...' : '导入用户ID'}
          </button>
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
              姓名 * {nameLocked && <span style={{ color: '#e74c3c', fontSize: '12px' }}>(已锁定)</span>}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => !nameLocked && setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={nameLocked ? "姓名已锁定，无法修改" : "请输入您的真实姓名"}
              disabled={nameLocked}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '12px',
                border: nameLocked ? '2px solid #e74c3c' : '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '14px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease',
                backgroundColor: nameLocked ? '#f8f9fa' : 'white',
                color: nameLocked ? '#6c757d' : '#2c3e50',
                cursor: nameLocked ? 'not-allowed' : 'text'
              }}
            />
            {nameLocked && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                color: '#856404',
                fontSize: isMobile ? '14px' : '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                <span>姓名已设置并锁定，无法再次修改。如需修改请联系管理员。</span>
              </div>
            )}
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
              disabled={loading || !userID || nameLocked}
              style={{
                ...mobileStyles.syncButton,
                opacity: (loading || !userID || nameLocked) ? 0.6 : 1,
                cursor: (loading || !userID || nameLocked) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '同步中...' : nameLocked ? '姓名已锁定' : '同步到服务器'}
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
          <li>本地数据会与服务器数据保持同步</li>
        </ul>
      </div>
    </div>
  );
}