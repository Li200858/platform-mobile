import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminPanel({ userInfo, isAdmin, onBack, isMobile = false }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('feedbacks');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState({ isEnabled: false, message: '' });
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [superAdminTarget, setSuperAdminTarget] = useState('');
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);

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
    tabContainer: {
      display: 'flex',
      overflowX: 'auto',
      gap: '8px',
      marginBottom: '20px',
      '-webkit-overflow-scrolling': 'touch'
    },
    tabButton: {
      flexShrink: 0,
      padding: isMobile ? '12px 16px' : '10px 20px',
      border: 'none',
      borderRadius: '8px',
      background: '#f8f9fa',
      color: '#6c757d',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '44px' : '40px'
    },
    tabButtonActive: {
      background: '#007bff',
      color: 'white'
    },
    contentArea: {
      background: 'white',
      borderRadius: '12px',
      padding: isMobile ? '20px' : '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      minHeight: '400px'
    },
    button: {
      padding: isMobile ? '12px 20px' : '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      '-webkit-tap-highlight-color': 'transparent',
      touchAction: 'manipulation',
      minHeight: isMobile ? '44px' : '40px'
    },
    primaryButton: {
      background: '#007bff',
      color: 'white'
    },
    dangerButton: {
      background: '#dc3545',
      color: 'white'
    },
    successButton: {
      background: '#28a745',
      color: 'white'
    },
    input: {
      width: '100%',
      padding: isMobile ? '12px' : '10px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: isMobile ? '16px' : '14px',
      marginBottom: '15px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: isMobile ? '12px' : '10px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: isMobile ? '16px' : '14px',
      marginBottom: '15px',
      minHeight: isMobile ? '120px' : '100px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    card: {
      background: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: isMobile ? '15px' : '20px',
      marginBottom: '15px'
    },
    modal: {
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
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: isMobile ? '20px' : '30px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto'
    }
  };

  // 检查超级管理员权限
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (userInfo && userInfo.name) {
        try {
          const data = await api.admin.check(userInfo.name);
          setIsSuperAdmin(data.isInitial || false);
        } catch (error) {
          console.error('检查超级管理员权限失败:', error);
          setIsSuperAdmin(false);
        }
      }
    };
    checkSuperAdmin();
  }, [userInfo]);

  // 根据标签页加载数据
  useEffect(() => {
    if (activeTab === 'feedbacks') {
      loadFeedbacks();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'maintenance') {
      loadMaintenanceStatus();
    }
  }, [activeTab]);

  // 加载反馈列表
  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getFeedbacks();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载反馈失败:', error);
      setFeedbacks([]);
      setMessage('加载反馈失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载用户失败:', error);
      setUsers([]);
      setMessage('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载维护模式状态
  const loadMaintenanceStatus = async () => {
    try {
      const status = await api.maintenance.getStatus();
      setMaintenanceStatus(status);
      setMaintenanceMessage(status.message || '');
    } catch (error) {
      console.error('加载维护状态失败:', error);
      setMessage('加载维护状态失败');
    }
  };

  // 搜索用户
  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setMessage('请输入搜索关键词');
      return;
    }

    setSearchLoading(true);
    try {
      const data = await api.admin.searchUsers(searchQuery.trim());
      setSearchResults(data || []);
      if (data.length === 0) {
        setMessage('未找到相关用户');
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
      setMessage('搜索失败，请重试');
    } finally {
      setSearchLoading(false);
    }
  };

  // 添加管理员
  const handleAddAdmin = async (userName) => {
    if (!window.confirm(`确定要将 ${userName} 设置为管理员吗？`)) {
      return;
    }

    try {
      setLoading(true);
      await api.admin.addAdmin(userName, userInfo.name);
      setMessage('管理员添加成功');
      loadUsers();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('添加管理员失败:', error);
      setMessage('添加失败：' + (error.message || '请重试'));
    } finally {
      setLoading(false);
    }
  };

  // 移除管理员
  const handleRemoveAdmin = async (userName) => {
    if (!window.confirm(`确定要移除 ${userName} 的管理员权限吗？`)) {
      return;
    }

    try {
      setLoading(true);
      await api.admin.removeAdmin(userName, userInfo.name);
      setMessage('管理员移除成功');
      loadUsers();
    } catch (error) {
      console.error('移除管理员失败:', error);
      setMessage('移除失败：' + (error.message || '请重试'));
    } finally {
      setLoading(false);
    }
  };

  // 设置超级管理员
  const handleSetSuperAdmin = async () => {
    if (!superAdminTarget.trim()) {
      setMessage('请输入目标用户名');
      return;
    }

    if (!window.confirm(`确定要将 ${superAdminTarget} 设置为超级管理员吗？\n\n注意：设置后您将失去超级管理员权限，变为普通管理员。`)) {
      return;
    }

    try {
      setLoading(true);
      await api.admin.setSuperAdmin(superAdminTarget.trim(), userInfo.name);
      setMessage('超级管理员设置成功！');
      setSuperAdminTarget('');
      setShowSuperAdminModal(false);
      loadUsers();
    } catch (error) {
      console.error('设置超级管理员失败:', error);
      setMessage('设置失败：' + (error.message || '请重试'));
    } finally {
      setLoading(false);
    }
  };

  // 移除超级管理员权限
  const handleRemoveSuperAdmin = async (targetUserName) => {
    if (!window.confirm(`确定要移除 ${targetUserName} 的超级管理员权限吗？`)) {
      return;
    }

    try {
      setLoading(true);
      await api.admin.removeSuperAdmin(targetUserName, userInfo.name);
      setMessage('超级管理员权限移除成功');
      loadUsers();
    } catch (error) {
      console.error('移除超级管理员失败:', error);
      setMessage('移除失败：' + (error.message || '请重试'));
    } finally {
      setLoading(false);
    }
  };

  // 查看反馈详情
  const handleFeedbackClick = async (feedbackId) => {
    try {
      const feedback = await api.admin.getFeedbackDetail(feedbackId);
      setSelectedFeedback(feedback);
    } catch (error) {
      console.error('获取反馈详情失败:', error);
      setMessage('获取反馈详情失败');
    }
  };

  // 回复反馈
  const handleReply = async () => {
    if (!replyContent.trim() || !selectedFeedback) return;

    try {
      setLoading(true);
      await api.admin.replyFeedback(selectedFeedback._id, {
        content: replyContent,
        adminName: userInfo.name
      });
      setMessage('回复成功');
      setReplyContent('');
      setSelectedFeedback(null);
      loadFeedbacks();
    } catch (error) {
      console.error('回复失败:', error);
      setMessage('回复失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 标记反馈已收到
  const handleMarkReceived = async (feedbackId) => {
    try {
      setLoading(true);
      await api.admin.markFeedbackReceived(feedbackId);
      setMessage('标记成功');
      loadFeedbacks();
    } catch (error) {
      console.error('标记失败:', error);
      setMessage('标记失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 启用维护模式
  const handleEnableMaintenance = async () => {
    if (!maintenanceMessage.trim()) {
      setMessage('请输入维护提示信息');
      return;
    }

    try {
      setLoading(true);
      await api.maintenance.enable(maintenanceMessage, userInfo.name);
      setMessage('维护模式已启用');
      loadMaintenanceStatus();
    } catch (error) {
      console.error('启用维护模式失败:', error);
      setMessage('启用失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 禁用维护模式
  const handleDisableMaintenance = async () => {
    try {
      setLoading(true);
      await api.maintenance.disable();
      setMessage('维护模式已禁用');
      loadMaintenanceStatus();
    } catch (error) {
      console.error('禁用维护模式失败:', error);
      setMessage('禁用失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 清理孤立文件
  const handleCleanupFiles = async () => {
    if (!window.confirm('确定要清理孤立文件吗？此操作将删除未被引用的文件。')) {
      return;
    }

    try {
      setLoading(true);
      await api.admin.cleanupFiles();
      setMessage('孤立文件清理完成');
    } catch (error) {
      console.error('清理文件失败:', error);
      setMessage('清理失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染反馈标签页
  const renderFeedbacksTab = () => (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>意见反馈管理</h2>
      
      {loading && <div style={{ textAlign: 'center', margin: '20px 0' }}>加载中...</div>}
      
      {feedbacks.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', color: '#6c757d', padding: '40px 0' }}>
          暂无反馈
        </div>
      ) : (
        <div>
          {feedbacks.map(feedback => (
            <div key={feedback._id} style={mobileStyles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                    {feedback.title || '无标题'}
                  </h4>
                  <p style={{ margin: '0 0 5px 0', color: '#6c757d', fontSize: '14px' }}>
                    来自: {feedback.authorName} ({feedback.authorClass})
                  </p>
                  <p style={{ margin: '0', color: '#6c757d', fontSize: '12px' }}>
                    {new Date(feedback.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!feedback.isReceived && (
                    <button
                      onClick={() => handleMarkReceived(feedback._id)}
                      style={{
                        ...mobileStyles.button,
                        ...mobileStyles.successButton,
                        padding: '6px 12px',
                        fontSize: '12px'
                      }}
                    >
                      标记已收到
                    </button>
                  )}
                  <button
                    onClick={() => handleFeedbackClick(feedback._id)}
                    style={{
                      ...mobileStyles.button,
                      ...mobileStyles.primaryButton,
                      padding: '6px 12px',
                      fontSize: '12px'
                    }}
                  >
                    查看详情
                  </button>
                </div>
              </div>
              <div style={{ color: '#495057', lineHeight: '1.5' }}>
                {feedback.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 反馈详情模态框 */}
      {selectedFeedback && (
        <div style={mobileStyles.modal}>
          <div style={mobileStyles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>反馈详情</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#7f8c8d'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={mobileStyles.card}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                {selectedFeedback.title || '无标题'}
              </h4>
              <p style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>
                来自: {selectedFeedback.authorName} ({selectedFeedback.authorClass})
              </p>
              <p style={{ margin: '0 0 15px 0', color: '#6c757d', fontSize: '12px' }}>
                {new Date(selectedFeedback.createdAt).toLocaleString()}
              </p>
              <div style={{ color: '#495057', lineHeight: '1.5', marginBottom: '20px' }}>
                {selectedFeedback.content}
              </div>
              
              {/* 回复区域 */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  管理员回复
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="请输入回复内容..."
                  style={mobileStyles.textarea}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || loading}
                  style={{
                    ...mobileStyles.button,
                    ...mobileStyles.primaryButton,
                    opacity: (!replyContent.trim() || loading) ? 0.6 : 1
                  }}
                >
                  {loading ? '回复中...' : '发送回复'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染用户管理标签页
  const renderUsersTab = () => (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>用户管理</h2>
      
      {/* 搜索用户 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="搜索用户姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
            style={mobileStyles.input}
          />
          <button
            onClick={handleSearchUsers}
            disabled={searchLoading}
            style={{
              ...mobileStyles.button,
              ...mobileStyles.primaryButton,
              opacity: searchLoading ? 0.6 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            {searchLoading ? '搜索中...' : '搜索'}
          </button>
        </div>

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>搜索结果</h4>
            {searchResults.map((user, index) => (
              <div key={index} style={mobileStyles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{user.name}</div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>{user.class}</div>
                  </div>
                  <button
                    onClick={() => handleAddAdmin(user.name)}
                    style={{
                      ...mobileStyles.button,
                      ...mobileStyles.successButton,
                      padding: '6px 12px',
                      fontSize: '12px'
                    }}
                  >
                    设为管理员
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 超级管理员功能 */}
      {isSuperAdmin && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>超级管理员功能</h4>
          <button
            onClick={() => setShowSuperAdminModal(true)}
            style={{
              ...mobileStyles.button,
              background: '#e74c3c',
              color: 'white'
            }}
          >
            设置超级管理员
          </button>
        </div>
      )}

      {/* 当前管理员列表 */}
      <div>
        <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>当前管理员</h4>
        {loading && <div style={{ textAlign: 'center', margin: '20px 0' }}>加载中...</div>}
        
        {users.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px 0' }}>
            暂无管理员
          </div>
        ) : (
          <div>
            {users.map(user => (
              <div key={user._id} style={mobileStyles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{user.name}</div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>{user.class}</div>
                    <div style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>
                      {user.role === 'super_admin' ? '超级管理员' : '管理员'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {user.name !== userInfo.name && isSuperAdmin && (
                      <>
                        {user.role === 'super_admin' ? (
                          <button
                            onClick={() => handleRemoveSuperAdmin(user.name)}
                            style={{
                              ...mobileStyles.button,
                              ...mobileStyles.dangerButton,
                              padding: '6px 12px',
                              fontSize: '12px'
                            }}
                          >
                            移除超级管理员
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveAdmin(user.name)}
                            style={{
                              ...mobileStyles.button,
                              ...mobileStyles.dangerButton,
                              padding: '6px 12px',
                              fontSize: '12px'
                            }}
                          >
                            移除管理员
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 设置超级管理员模态框 */}
      {showSuperAdminModal && (
        <div style={mobileStyles.modal}>
          <div style={mobileStyles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>设置超级管理员</h3>
              <button
                onClick={() => setShowSuperAdminModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#7f8c8d'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                目标用户名
              </label>
              <input
                type="text"
                placeholder="请输入要设置为超级管理员的用户名"
                value={superAdminTarget}
                onChange={(e) => setSuperAdminTarget(e.target.value)}
                style={mobileStyles.input}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSuperAdminModal(false)}
                style={{
                  ...mobileStyles.button,
                  background: '#6c757d',
                  color: 'white'
                }}
              >
                取消
              </button>
              <button
                onClick={handleSetSuperAdmin}
                disabled={!superAdminTarget.trim() || loading}
                style={{
                  ...mobileStyles.button,
                  ...mobileStyles.dangerButton,
                  opacity: (!superAdminTarget.trim() || loading) ? 0.6 : 1
                }}
              >
                {loading ? '设置中...' : '确认设置'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染维护模式标签页
  const renderMaintenanceTab = () => (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>维护模式</h2>
      
      {/* 当前状态 */}
      <div style={mobileStyles.card}>
        <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>当前状态</h4>
        <div style={{ 
          padding: '10px', 
          borderRadius: '6px', 
          background: maintenanceStatus.isEnabled ? '#f8d7da' : '#d4edda',
          color: maintenanceStatus.isEnabled ? '#721c24' : '#155724',
          marginBottom: '15px'
        }}>
          {maintenanceStatus.isEnabled ? '维护模式已启用' : '维护模式已禁用'}
        </div>
        {maintenanceStatus.isEnabled && maintenanceStatus.message && (
          <div style={{ color: '#6c757d', fontSize: '14px' }}>
            维护提示: {maintenanceStatus.message}
          </div>
        )}
      </div>

      {/* 维护模式控制 */}
      <div style={mobileStyles.card}>
        <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>维护模式控制</h4>
        
        {!maintenanceStatus.isEnabled ? (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              维护提示信息
            </label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="请输入维护期间的提示信息..."
              style={mobileStyles.textarea}
            />
            <button
              onClick={handleEnableMaintenance}
              disabled={!maintenanceMessage.trim() || loading}
              style={{
                ...mobileStyles.button,
                ...mobileStyles.dangerButton,
                opacity: (!maintenanceMessage.trim() || loading) ? 0.6 : 1
              }}
            >
              {loading ? '启用中...' : '启用维护模式'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleDisableMaintenance}
            disabled={loading}
            style={{
              ...mobileStyles.button,
              ...mobileStyles.successButton,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '禁用中...' : '禁用维护模式'}
          </button>
        )}
      </div>

      {/* 系统工具 */}
      <div style={mobileStyles.card}>
        <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>系统工具</h4>
        <button
          onClick={handleCleanupFiles}
          disabled={loading}
          style={{
            ...mobileStyles.button,
            background: '#ffc107',
            color: '#212529',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '清理中...' : '清理孤立文件'}
        </button>
        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
          清理未被引用的上传文件，释放存储空间
        </div>
      </div>
    </div>
  );

  // 根据权限决定显示哪些标签页
  const getAvailableTabs = () => {
    const tabs = [
      { key: 'feedbacks', label: '意见反馈' },
      { key: 'maintenance', label: '维护模式' }
    ];

    // 只有超级管理员可以看到用户管理
    if (isSuperAdmin) {
      tabs.unshift({ key: 'users', label: '用户管理' });
    }

    return tabs;
  };

  return (
    <div style={mobileStyles.container}>
      <button onClick={onBack} style={mobileStyles.backButton}>
        ← 返回
      </button>

      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>管理员面板</h1>

      {/* 标签页 */}
      <div style={mobileStyles.tabContainer}>
        {getAvailableTabs().map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...mobileStyles.tabButton,
              ...(activeTab === tab.key ? mobileStyles.tabButtonActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={mobileStyles.contentArea}>
        {activeTab === 'feedbacks' && renderFeedbacksTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'maintenance' && renderMaintenanceTab()}
      </div>

      {/* 消息提示 */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#28a745',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1001
        }}>
          {message}
          <button
            onClick={() => setMessage('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              marginLeft: '10px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}