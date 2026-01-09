import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <div className="error-content">
                        <AlertTriangle size={64} className="error-icon" />
                        <h1 className="error-title">量子デコヒーレンス発生</h1>
                        <p className="error-message">
                            予期せぬエラーが発生し、ゲームを継続できません。<br />
                            状態をリセットするために再読み込みしてください。
                        </p>

                        <div className="error-details">
                            <summary>詳細エラー情報</summary>
                            <pre>
                                {this.state.error && this.state.error.toString()}
                            </pre>
                        </div>

                        <button onClick={this.handleReload} className="btn btn-primary retry-btn">
                            <RefreshCcw size={18} />
                            <span>システム再起動</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
