import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 可以在这里添加错误报告服务
    // 例如：reportErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">错误</div>
            <h2 className="error-title">页面出现错误</h2>
            <p className="error-message">
              很抱歉，页面遇到了一个错误。请尝试刷新页面或联系管理员。
            </p>
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  marginRight: '10px',
                  '-webkit-tap-highlight-color': 'transparent',
                  'touch-action': 'manipulation'
                }}
              >
                刷新页面
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  '-webkit-tap-highlight-color': 'transparent',
                  'touch-action': 'manipulation'
                }}
              >
                重试
              </button>
            </div>
            
            {/* 开发模式下显示详细错误信息 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary style={{ 
                  cursor: 'pointer', 
                  padding: '10px',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  marginTop: '20px'
                }}>
                  查看错误详情
                </summary>
                <div style={{ 
                  padding: '15px',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  <strong>错误信息:</strong><br />
                  {this.state.error && this.state.error.toString()}
                  <br /><br />
                  <strong>错误堆栈:</strong><br />
                  {this.state.errorInfo.componentStack}
                </div>
              </details>
            )}
          </div>
          
          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .error-container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              max-width: 500px;
              width: 100%;
              /* iPad Safari兼容性修复 */
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
              -webkit-backface-visibility: hidden;
              backface-visibility: hidden;
            }
            
            .error-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            
            .error-title {
              color: #2c3e50;
              margin-bottom: 15px;
              font-size: 24px;
            }
            
            .error-message {
              color: #7f8c8d;
              margin-bottom: 30px;
              line-height: 1.5;
              font-size: 16px;
            }
            
            .error-actions {
              display: flex;
              justify-content: center;
              gap: 10px;
              flex-wrap: wrap;
            }
            
            .error-details {
              margin-top: 20px;
              text-align: left;
            }
            
            @media (max-width: 768px) {
              .error-boundary {
                padding: 15px;
              }
              
              .error-container {
                padding: 30px 20px;
              }
              
              .error-title {
                font-size: 20px;
              }
              
              .error-message {
                font-size: 14px;
              }
              
              .error-actions {
                flex-direction: column;
                align-items: center;
              }
              
              .error-actions button {
                width: 100%;
                max-width: 200px;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;