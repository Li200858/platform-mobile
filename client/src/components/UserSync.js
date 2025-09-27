import React, { useState, useEffect } from 'react';
import { useUserID } from './UserIDManager';
import api from '../api';

export default function UserSync({ onBack, isMobile = false }) {
  const { userID, isLoading: userIDLoading, importUserID, exportUserID, resetUserID } = useUserID();
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
  const [currentUserInfo, setCurrentUserInfo] = useState(null);

  // 移动端样式
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
    },
    input: {
      width: '100%',
      padding: isMobile ? '14px' : '12px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: isMobile ? '16px' : '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      marginBottom: isMobile ? '10px' : '15px'
    },
    button: {
      padding: isMobile ? '12px 20px' : '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '16px' : '14px',
      fontWeight: '500',
      marginBottom: isMobile ? '10px' : '15px',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '44px' : '40px'
    },
    card: {
      background: 'white',
      borderRadius: '15px',
      padding: isMobile ? '20px' : '30px',
      marginBottom: isMobile ? '20px' : '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid #f0f0f0'
    },
    title: {
      fontSize: isMobile ? '24px' : '28px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: isMobile ? '20px' : '30px',
      textAlign: 'center'
    },
    sectionTitle: {
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: isMobile ? '15px' : '20px'
    },
    label: {
      display: 'block',
      marginBottom: isMobile ? '8px' : '10px',
      fontWeight: '500',
      color: '#2c3e50',
      fontSize: isMobile ? '16px' : '14px'
    },
    message: {
      padding: isMobile ? '12px 16px' : '15px 20px',
      borderRadius: '8px',
      marginBottom: isMobile ? '15px' : '20px',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '500'
    },
    successMessage: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    errorMessage: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    warningMessage: {
      background: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7'
    },
    infoMessage: {
      background: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb'
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

  // 加载当前用户信息
  useEffect(() => {
    loadLocalUserInfo();
    
    const loadCurrentUserInfo = async () => {
      if (userID) {
        try {
          const userData = await api.user.getByID(userID);
          if (userData && userData.name && userData.class) {
            setCurrentUserInfo(userData);
          }
        } catch (error) {
          console.log('无法获取当前用户信息:', error.message);
        }
      }
    };
    
    loadCurrentUserInfo();
  }, [userID]);

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

  // 重置用户ID
  const handleReset = () => {
    if (window.confirm('确定要重置用户ID吗？这将清除所有本地数据，需要重新导入。')) {
      try {
        resetUserID();
        setMessage('用户ID已重置！');
        setUserInfo(null);
        setFormData({ name: '', class: '' });
        setNameEdited(false);
        setNameLocked(false);
      } catch (error) {
        setMessage('重置失败：' + error.message);
      }
    }
  };

  if (userIDLoading) {
    return (
      <div style={mobileStyles.container}>
        <div style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '60px' }}>
          <div style={{ fontSize: isMobile ? '18px' : '20px', color: '#6c757d' }}>
            加载中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={mobileStyles.container}>
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        style={mobileStyles.backButton}
      >
        ← 返回
      </button>

      {/* 标题 */}
      <h1 style={mobileStyles.title}>用户数据同步</h1>

      {/* 当前用户ID显示 */}
      <div style={mobileStyles.card}>
        <h3 style={mobileStyles.sectionTitle}>当前用户ID</h3>
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: isMobile ? '16px' : '14px', 
          color: '#2c3e50',
          wordBreak: 'break-all',
          background: '#f8f9fa',
          padding: isMobile ? '12px' : '15px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          marginBottom: isMobile ? '15px' : '20px'
        }}>
          {userID}
        </div>
        <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#7f8c8d', marginBottom: isMobile ? '15px' : '20px' }}>
          此ID用于跨设备同步您的数据
        </div>
        
        {/* 显示当前绑定的用户信息 */}
        {currentUserInfo ? (
          <div style={{ 
            padding: isMobile ? '15px' : '20px', 
            background: '#e8f5e8', 
            borderRadius: '8px',
            border: '1px solid #c3e6c3'
          }}>
            <div style={{ fontSize: isMobile ? '14px' : '16px', color: '#27ae60', fontWeight: 'bold', marginBottom: '8px' }}>
              [已绑定] 已绑定用户信息
            </div>
            <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#2c3e50', marginBottom: '5px' }}>
              <strong>姓名：</strong>{currentUserInfo.name}
            </div>
            <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#2c3e50', marginBottom: '5px' }}>
              <strong>班级：</strong>{currentUserInfo.class}
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#7f8c8d' }}>
              此ID已与上述用户信息绑定，导入此ID将自动获取该用户信息
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: isMobile ? '15px' : '20px', 
            background: '#fff3cd', 
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <div style={{ fontSize: isMobile ? '14px' : '16px', color: '#856404', fontWeight: 'bold', marginBottom: '8px' }}>
              [警告] 未绑定用户信息
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#856404' }}>
              此ID尚未绑定任何用户信息，需要先在个人信息页面填写姓名和班级
            </div>
          </div>
        )}
      </div>

      {/* 消息显示 */}
      {message && (
        <div style={{
          ...mobileStyles.message,
          ...(message.includes('成功') ? mobileStyles.successMessage : 
              message.includes('警告') ? mobileStyles.warningMessage :
              message.includes('错误') || message.includes('失败') ? mobileStyles.errorMessage :
              mobileStyles.infoMessage)
        }}>
          {message}
        </div>
      )}

      {/* 个人信息填写 */}
      <div style={mobileStyles.card}>
        <h3 style={mobileStyles.sectionTitle}>个人信息</h3>
        
        <div>
          <label style={mobileStyles.label}>
            姓名 * {nameLocked && <span style={{ color: '#e74c3c', fontSize: isMobile ? '12px' : '10px' }}>(已锁定)</span>}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => !nameLocked && setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={nameLocked ? "姓名已锁定，无法修改" : "请输入您的真实姓名"}
            disabled={nameLocked}
            style={{
              ...mobileStyles.input,
              border: nameLocked ? '2px solid #e74c3c' : '2px solid #e9ecef',
              backgroundColor: nameLocked ? '#f8f9fa' : 'white',
              color: nameLocked ? '#6c757d' : '#2c3e50',
              cursor: nameLocked ? 'not-allowed' : 'text'
            }}
          />
          {nameLocked && (
            <div style={{
              marginTop: '8px',
              padding: isMobile ? '8px 12px' : '10px 15px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              color: '#856404',
              fontSize: isMobile ? '12px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>姓名已设置并锁定，无法再次修改。如需修改请联系管理员。</span>
            </div>
          )}
        </div>

        <div>
          <label style={mobileStyles.label}>班级</label>
          <input
            type="text"
            value={formData.class}
            onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
            placeholder="请输入您的班级"
            style={mobileStyles.input}
          />
        </div>

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
            ...mobileStyles.button,
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            opacity: (loading || !userID) ? 0.6 : 1,
            cursor: (loading || !userID) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '获取中...' : '从服务器获取'}
        </button>
      </div>

      {/* 导入用户ID */}
      <div style={mobileStyles.card}>
        <h3 style={mobileStyles.sectionTitle}>导入用户ID</h3>
        <div style={{ display: 'flex', gap: isMobile ? '8px' : '10px', marginBottom: isMobile ? '15px' : '20px' }}>
          <input
            type="text"
            value={importID}
            onChange={(e) => setImportID(e.target.value)}
            placeholder="请输入要导入的用户ID"
            style={{
              ...mobileStyles.input,
              marginBottom: 0,
              flex: 1
            }}
          />
          <button
            onClick={handleImport}
            disabled={loading}
            style={{
              ...mobileStyles.button,
              background: '#27ae60',
              color: 'white',
              border: 'none',
              marginBottom: 0,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '导入中...' : '导入'}
          </button>
        </div>
        <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#7f8c8d' }}>
          在其他设备上复制用户ID，然后在此处导入以同步数据
        </div>
      </div>

      {/* 导出用户ID */}
      <div style={mobileStyles.card}>
        <h3 style={mobileStyles.sectionTitle}>导出用户ID</h3>
        <button
          onClick={handleExport}
          style={{
            ...mobileStyles.button,
            background: '#3498db',
            color: 'white',
            border: 'none'
          }}
        >
          复制用户ID
        </button>
        <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#7f8c8d' }}>
          复制用户ID到其他设备进行数据同步
        </div>
      </div>

      {/* 重置用户ID */}
      <div style={mobileStyles.card}>
        <h3 style={mobileStyles.sectionTitle}>重置用户ID</h3>
        <button
          onClick={handleReset}
          style={{
            ...mobileStyles.button,
            background: '#e74c3c',
            color: 'white',
            border: 'none'
          }}
        >
          重置用户ID
        </button>
        <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#7f8c8d' }}>
          重置后将清除所有本地数据，需要重新导入
        </div>
      </div>

      {/* 使用说明 */}
      <div style={mobileStyles.card}>
        <h4 style={{ margin: '0 0 15px 0', color: '#0c5460', fontSize: isMobile ? '16px' : '18px' }}>使用说明</h4>
        <div style={{ fontSize: isMobile ? '14px' : '16px', color: '#0c5460', lineHeight: '1.6' }}>
          <p><strong>1. 同步数据：</strong>在手机或其他设备上复制用户ID，然后在此处导入</p>
          <p><strong>2. 导出ID：</strong>点击"复制用户ID"按钮，将ID分享给其他设备</p>
          <p><strong>3. 重置ID：</strong>如果需要重新开始，可以重置用户ID</p>
          <p><strong>4. 姓名锁定：</strong>姓名一旦设置并同步成功后将无法修改，确保数据一致性</p>
          <p><strong>注意：</strong>用户ID是纯数字格式，用于唯一标识您的账户</p>
        </div>
      </div>
    </div>
  );
}