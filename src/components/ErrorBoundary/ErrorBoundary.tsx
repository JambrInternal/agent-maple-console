import { Component, ReactNode } from 'react';
import { Button } from '../ui';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
        return {
            hasError: true,
            error: error instanceof Error ? error : new Error('Unknown error')
        };
    }

    handleReload = (): void => {
        window.location.reload();
    };

    handleClearSession = (): void => {
        localStorage.removeItem('am_auth_token');
        localStorage.removeItem('am_user');
        window.location.href = '/login';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            const message = this.state.error?.message ?? 'Unknown error';
            return (
                <div className="am-error-boundary" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#ef4444' }}>Something went wrong</h2>
                    <div style={{ margin: '1rem 0' }}>{message}</div>
                    <Button
                        type="button"
                        onClick={this.handleReload}
                        style={{ marginRight: '1rem' }}
                        variant="secondary"
                    >
                        Reload
                    </Button>
                    <Button type="button" onClick={this.handleClearSession} variant="secondary">
                        Clear session
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
