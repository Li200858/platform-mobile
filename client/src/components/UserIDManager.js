import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建UserID上下文
const UserIDContext = createContext();

// 生成唯一用户ID的函数
const generateUserID = () => {
  // 使用时间戳和随机数生成唯一ID
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `user_${timestamp}_${random}`;
};

// 获取或创建用户ID的函数
const getOrCreateUserID = () => {
  try {
    // 尝试从localStorage获取用户ID
    let userID = localStorage.getItem('user_id');
    
    if (!userID) {
      // 如果没有用户ID，生成一个新的
      userID = generateUserID();
      localStorage.setItem('user_id', userID);
      console.log('生成新的用户ID:', userID);
    } else {
      console.log('使用现有用户ID:', userID);
    }
    
    return userID;
  } catch (error) {
    console.error('获取用户ID失败:', error);
    // 如果localStorage不可用，生成一个临时ID
    const tempID = generateUserID();
    console.log('生成临时用户ID:', tempID);
    return tempID;
  }
};

// UserID提供者组件
export const UserIDProvider = ({ children }) => {
  const [userID, setUserID] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // 获取或创建用户ID
      const id = getOrCreateUserID();
      setUserID(id);
      setIsLoading(false);
    } catch (error) {
      console.error('初始化用户ID失败:', error);
      // 生成一个临时ID作为备选
      const tempID = generateUserID();
      setUserID(tempID);
      setIsLoading(false);
    }
  }, []);

  // 更新用户ID的函数
  const updateUserID = (newUserID) => {
    try {
      localStorage.setItem('user_id', newUserID);
      setUserID(newUserID);
      console.log('用户ID已更新:', newUserID);
    } catch (error) {
      console.error('更新用户ID失败:', error);
    }
  };

  // 重置用户ID的函数
  const resetUserID = () => {
    try {
      const newUserID = generateUserID();
      localStorage.setItem('user_id', newUserID);
      setUserID(newUserID);
      console.log('用户ID已重置:', newUserID);
      return newUserID;
    } catch (error) {
      console.error('重置用户ID失败:', error);
      return userID;
    }
  };

  // 清除用户ID的函数
  const clearUserID = () => {
    try {
      localStorage.removeItem('user_id');
      setUserID(null);
      console.log('用户ID已清除');
    } catch (error) {
      console.error('清除用户ID失败:', error);
    }
  };

  const value = {
    userID,
    isLoading,
    updateUserID,
    resetUserID,
    clearUserID
  };

  return (
    <UserIDContext.Provider value={value}>
      {children}
    </UserIDContext.Provider>
  );
};

// 使用UserID的Hook
export const useUserID = () => {
  const context = useContext(UserIDContext);
  
  if (!context) {
    throw new Error('useUserID must be used within a UserIDProvider');
  }
  
  return context;
};

// 用户ID显示组件（用于调试）
export const UserIDDisplay = () => {
  const { userID, isLoading, resetUserID } = useUserID();

  if (isLoading) {
    return (
      <div style={{
        padding: '10px',
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d',
        textAlign: 'center'
      }}>
        加载用户ID中...
      </div>
    );
  }

  return (
    <div style={{
      padding: '10px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#6c757d'
    }}>
      <div style={{ marginBottom: '5px' }}>
        <strong>用户ID:</strong> {userID}
      </div>
      <button
        onClick={resetUserID}
        style={{
          padding: '4px 8px',
          fontSize: '10px',
          background: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          '-webkit-tap-highlight-color': 'transparent',
          'touch-action': 'manipulation'
        }}
      >
        重置ID
      </button>
    </div>
  );
};

// 用户ID工具组件
export const UserIDTools = () => {
  const { userID, resetUserID, clearUserID } = useUserID();

  return (
    <div style={{
      padding: '15px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      margin: '10px 0'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2c3e50' }}>
        用户ID管理工具
      </h4>
      <div style={{ marginBottom: '10px', fontSize: '12px', color: '#6c757d' }}>
        当前用户ID: {userID}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={resetUserID}
          className="btn btn-sm btn-secondary"
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            '-webkit-tap-highlight-color': 'transparent',
            'touch-action': 'manipulation'
          }}
        >
          重置ID
        </button>
        <button
          onClick={clearUserID}
          className="btn btn-sm btn-danger"
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            '-webkit-tap-highlight-color': 'transparent',
            'touch-action': 'manipulation'
          }}
        >
          清除ID
        </button>
      </div>
    </div>
  );
};

// 导出默认的UserIDProvider
export default UserIDProvider;