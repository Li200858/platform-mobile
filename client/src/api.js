const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://platform-mobile-backend.onrender.com/api'
  : 'http://localhost:5000/api';

const api = {
  // User related APIs
  user: {
    sync: async (userID, name, userClass) => {
      const response = await fetch(`${API_BASE_URL}/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, name, class: userClass })
      });
      return response.json();
    },
    checkName: async (name, userID) => {
      const response = await fetch(`${API_BASE_URL}/user/check-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userID })
      });
      return response.json();
    },
    get: async (userID) => {
      const response = await fetch(`${API_BASE_URL}/user/${userID}`);
      return response.json();
    },
    getInfo: async (userID) => {
      const response = await fetch(`${API_BASE_URL}/user/${userID}`);
      return response.json();
    },
    searchUsers: async (query) => {
      const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
      return response.json();
    }
  },

  // File upload API
  upload: async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // Art related APIs
  art: {
    create: async (postData) => {
      const response = await fetch(`${API_BASE_URL}/art`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      return response.json();
    },
    getAll: async (tab = '', sort = 'latest') => {
      const response = await fetch(`${API_BASE_URL}/art?tab=${tab}&sort=${sort}`);
      return response.json();
    },
    getArts: async (tab = '', sort = 'latest') => {
      const response = await fetch(`${API_BASE_URL}/art?tab=${tab}&sort=${sort}`);
      return response.json();
    },
    publish: async (postData) => {
      const response = await fetch(`${API_BASE_URL}/art`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      return response.json();
    },
    like: async (id, userId) => {
      const response = await fetch(`${API_BASE_URL}/art/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.json();
    },
    favorite: async (id, userId) => {
      const response = await fetch(`${API_BASE_URL}/art/${id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.json();
    },
    comment: async (id, commentData) => {
      const response = await fetch(`${API_BASE_URL}/art/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });
      return response.json();
    },
    deleteComment: async (artId, commentId, authorName) => {
      const response = await fetch(`${API_BASE_URL}/art/${artId}/comment/${commentId}?authorName=${encodeURIComponent(authorName)}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    collaborate: async (id, collaboratorData) => {
      const response = await fetch(`${API_BASE_URL}/art/${id}/collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collaboratorData)
      });
      return response.json();
    },
    inviteCollaborator: async (id, collaboratorData) => {
      const response = await fetch(`${API_BASE_URL}/art/${id}/collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collaboratorData)
      });
      return response.json();
    },
    removeCollaborator: async (id, username, removedBy) => {
      const response = await fetch(`${API_BASE_URL}/art/${id}/collaborate/${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removedBy })
      });
      return response.json();
    },
    getMyWorks: async (authorName) => {
      try {
        const response = await fetch(`${API_BASE_URL}/art/my-works?authorName=${encodeURIComponent(authorName)}`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载我的作品失败:', error);
        throw error;
      }
    },
    getFavorites: async (authorName) => {
      try {
        const response = await fetch(`${API_BASE_URL}/art/favorites?authorName=${encodeURIComponent(authorName)}`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载收藏失败:', error);
        throw error;
      }
    },
    getMyFavorites: async (authorName) => {
      try {
        const response = await fetch(`${API_BASE_URL}/art/favorites?authorName=${encodeURIComponent(authorName)}`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载收藏失败:', error);
        throw error;
      }
    },
    getLikes: async (authorName) => {
      const response = await fetch(`${API_BASE_URL}/art/likes?authorName=${encodeURIComponent(authorName)}`);
      return response.json();
    },
    delete: async (id, authorName, isAdmin) => {
      const response = await fetch(`${API_BASE_URL}/art/${id}?authorName=${encodeURIComponent(authorName)}&isAdmin=${isAdmin}`, {
        method: 'DELETE'
      });
      return response.json();
    }
  },

  // Activity related APIs
  activities: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/activities`);
      return response.json();
    },
    getActivities: async () => {
      const response = await fetch(`${API_BASE_URL}/activities`);
      return response.json();
    },
    create: async (activityData) => {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });
      return response.json();
    },
    like: async (id, userId) => {
      const response = await fetch(`${API_BASE_URL}/activities/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.json();
    },
    favorite: async (id, userId) => {
      const response = await fetch(`${API_BASE_URL}/activities/${id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.json();
    },
    comment: async (id, commentData) => {
      const response = await fetch(`${API_BASE_URL}/activities/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });
      return response.json();
    },
    delete: async (id, authorName, isAdmin) => {
      const response = await fetch(`${API_BASE_URL}/activities/${id}?authorName=${encodeURIComponent(authorName)}&isAdmin=${isAdmin}`, {
        method: 'DELETE'
      });
      return response.json();
    }
  },

  // Feedback related APIs
  feedback: {
    submit: async (feedbackData) => {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      return response.json();
    },
    getMine: async (authorName) => {
      const response = await fetch(`${API_BASE_URL}/feedback/my?authorName=${encodeURIComponent(authorName)}`);
      return response.json();
    },
    getMyFeedbacks: async (authorName) => {
      const response = await fetch(`${API_BASE_URL}/feedback/my?authorName=${encodeURIComponent(authorName)}`);
      return response.json();
    },
    reply: async (id, replyData) => {
      const response = await fetch(`${API_BASE_URL}/feedback/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData)
      });
      return response.json();
    }
  },

  // Admin related APIs
  admin: {
    check: async (userName) => {
      const response = await fetch(`${API_BASE_URL}/admin/check?userName=${encodeURIComponent(userName)}`);
      return response.json();
    },
    getFeedback: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback`);
      return response.json();
    },
    getFeedbacks: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback`);
      return response.json();
    },
    getFeedbackDetail: async (id) => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback/${id}`);
      return response.json();
    },
    replyFeedback: async (id, replyData) => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData)
      });
      return response.json();
    },
    markFeedbackReceived: async (id) => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback/${id}/received`, {
        method: 'POST'
      });
      return response.json();
    },
    getUsers: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      return response.json();
    },
    getAdmins: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      return response.json();
    },
    searchUsers: async (query) => {
      const response = await fetch(`${API_BASE_URL}/admin/search-users?q=${encodeURIComponent(query)}`);
      return response.json();
    },
    addAdmin: async (userName, addedBy) => {
      const response = await fetch(`${API_BASE_URL}/admin/add-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, addedBy })
      });
      return response.json();
    },
    removeAdmin: async (userName, removedBy) => {
      const response = await fetch(`${API_BASE_URL}/admin/remove-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, removedBy })
      });
      return response.json();
    },
    setSuperAdmin: async (targetUserName, setByUserName) => {
      const response = await fetch(`${API_BASE_URL}/admin/set-super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserName, setByUserName })
      });
      return response.json();
    },
    removeSuperAdmin: async (targetUserName, setByUserName) => {
      const response = await fetch(`${API_BASE_URL}/admin/remove-super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserName, setByUserName })
      });
      return response.json();
    },
    cleanupFiles: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/cleanup-files`, {
        method: 'POST'
      });
      return response.json();
    },
    testFileDelete: async (filePath) => {
      const response = await fetch(`${API_BASE_URL}/admin/test-file-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      return response.json();
    }
  },

  // Maintenance mode APIs
  maintenance: {
    getStatus: async () => {
      const response = await fetch(`${API_BASE_URL}/maintenance/status`);
      return response.json();
    },
    enable: async (message, adminName) => {
      const response = await fetch(`${API_BASE_URL}/admin/maintenance/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, adminName })
      });
      return response.json();
    },
    disable: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/maintenance/disable`, {
        method: 'POST'
      });
      return response.json();
    }
  },

  // Notifications APIs
  notifications: {
    create: async (notificationData) => {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });
      return response.json();
    },
    getNotifications: async (username) => {
      const response = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(username)}`);
      return response.json();
    },
    markAsRead: async (id) => {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT'
      });
      return response.json();
    },
    markAllAsRead: async (username) => {
      const response = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(username)}/read-all`, {
        method: 'PUT'
      });
      return response.json();
    }
  },

  // Search APIs
  search: {
    global: async (query, type = 'all') => {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}`);
      return response.json();
    }
  },

  // Portfolio APIs
  portfolio: {
    create: async (portfolioData) => {
      const response = await fetch(`${API_BASE_URL}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolioData)
      });
      return response.json();
    },
    getUserPortfolios: async (username) => {
      try {
        const response = await fetch(`${API_BASE_URL}/portfolio/user/${encodeURIComponent(username)}`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载用户作品集失败:', error);
        throw error;
      }
    },
    getPublicPortfolios: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/portfolio/public`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载公开作品集失败:', error);
        throw error;
      }
    },
    getPortfolio: async (id) => {
      try {
        const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载作品集详情失败:', error);
        throw error;
      }
    },
    getPortfolioDetail: async (id) => {
      try {
        const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载作品集详情失败:', error);
        throw error;
      }
    },
    update: async (id, updateData) => {
      const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      return response.json();
    },
    delete: async (id, authorName, isAdmin) => {
      const response = await fetch(`${API_BASE_URL}/portfolio/${id}?authorName=${encodeURIComponent(authorName)}&isAdmin=${isAdmin}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    addWork: async (id, workId) => {
      const response = await fetch(`${API_BASE_URL}/portfolio/${id}/works`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId })
      });
      return response.json();
    },
    removeWork: async (id, workId) => {
      const response = await fetch(`${API_BASE_URL}/portfolio/${id}/works/${workId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    uploadContent: async (formData) => {
      const response = await fetch(`${API_BASE_URL}/portfolio/upload-content`, {
        method: 'POST',
        body: formData
      });
      return response.json();
    }
  },

  // Resource Library APIs
  resources: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/resources`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载资料失败:', error);
        throw error;
      }
    },
    getCategories: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/resources/categories`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载分类失败:', error);
        throw error;
      }
    },
    upload: async (formData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/resources/upload`, {
          method: 'POST',
          body: formData,
          timeout: 30000 // 30秒超时
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: '上传失败' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('上传资料失败:', error);
        throw error;
      }
    },
    delete: async (id, authorName, isAdmin) => {
      const response = await fetch(`${API_BASE_URL}/resources/${id}?authorName=${encodeURIComponent(authorName)}&isAdmin=${isAdmin}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    open: async (id) => {
      const response = await fetch(`${API_BASE_URL}/resources/${id}/download`);
      return response.json();
    },
    openFile: (filename) => {
      return `${API_BASE_URL.replace('/api', '')}/uploads/${encodeURIComponent(filename)}`;
    }
  },

  // Disk Usage API
  diskUsage: {
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/disk-usage`);
      return response.json();
    }
  },

  // Activity related APIs
  activity: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/activities`, {
          timeout: 10000 // 10秒超时
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('加载活动失败:', error);
        throw error;
      }
    },
    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    like: async (id, userId) => {
      const response = await fetch(`${API_BASE_URL}/activities/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.json();
    },
    favorite: async (id, userId) => {
      const response = await fetch(`${API_BASE_URL}/activities/${id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.json();
    },
    comment: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/activities/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    delete: async (id, authorName, isAdmin) => {
      const response = await fetch(`${API_BASE_URL}/activities/${id}?authorName=${encodeURIComponent(authorName)}&isAdmin=${isAdmin}`, {
        method: 'DELETE'
      });
      return response.json();
    }
  },

  // Search functionality
  search: {
    global: async (query, type = 'all', limit = 20) => {
      const params = new URLSearchParams({
        q: query,
        type: type,
        limit: limit.toString()
      });
      const response = await fetch(`${API_BASE_URL}/search?${params}`);
      return response.json();
    }
  },

  // File upload (general)
  upload: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Admin related APIs
  admin: {
    check: async (username) => {
      const response = await fetch(`${API_BASE_URL}/admin/check?username=${encodeURIComponent(username)}`);
      return response.json();
    },
    getFeedbacks: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback`);
      return response.json();
    },
    getUsers: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      return response.json();
    },
    searchUsers: async (query) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/search?q=${encodeURIComponent(query)}`);
      return response.json();
    },
    addAdmin: async (username, operatorName) => {
      const response = await fetch(`${API_BASE_URL}/admin/add-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserName: username, setByUserName: operatorName })
      });
      return response.json();
    },
    removeAdmin: async (username, operatorName) => {
      const response = await fetch(`${API_BASE_URL}/admin/remove-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserName: username, setByUserName: operatorName })
      });
      return response.json();
    },
    setSuperAdmin: async (username, operatorName) => {
      const response = await fetch(`${API_BASE_URL}/admin/set-super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserName: username, setByUserName: operatorName })
      });
      return response.json();
    },
    removeSuperAdmin: async (username, operatorName) => {
      const response = await fetch(`${API_BASE_URL}/admin/remove-super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserName: username, setByUserName: operatorName })
      });
      return response.json();
    },
    getFeedbackDetail: async (feedbackId) => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback/${feedbackId}`);
      return response.json();
    },
    replyFeedback: async (feedbackId, replyData) => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData)
      });
      return response.json();
    },
    markFeedbackReceived: async (feedbackId) => {
      const response = await fetch(`${API_BASE_URL}/admin/feedback/${feedbackId}/received`, {
        method: 'POST'
      });
      return response.json();
    },
    cleanupFiles: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/cleanup-files`, {
        method: 'POST'
      });
      return response.json();
    }
  },

  // Notifications related APIs
  notifications: {
    getNotifications: async (username) => {
      const response = await fetch(`${API_BASE_URL}/notifications?username=${encodeURIComponent(username)}`);
      return response.json();
    },
    markAsRead: async (notificationId) => {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      return response.json();
    },
    markAllAsRead: async (username) => {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      return response.json();
    }
  }
};

export default api;