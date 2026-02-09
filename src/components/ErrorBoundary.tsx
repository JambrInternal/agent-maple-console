import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearSession = () => {
    localStorage.removeItem('am_auth_token');
    localStorage.removeItem('am_user');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="am-error-boundary" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Something went wrong</h2>
          <div style={{ margin: '1rem 0' }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button className="am-btn-secondary" onClick={this.handleReload} style={{ marginRight: '1rem' }}>
            Reload
          </button>
          <button className="am-btn-secondary" onClick={this.handleClearSession}>
            Clear session
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
