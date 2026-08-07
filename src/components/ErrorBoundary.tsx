import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-bg-primary text-center">
          <div className="bg-bg-tertiary border border-border-primary rounded-xl p-8 flex flex-col items-center max-w-md w-full shadow-lg border-t-4 border-t-error">
            <div className="w-12 h-12 rounded-full bg-error/15 flex items-center justify-center text-error mb-4 shadow-sm border border-error/35">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-text-primary font-bold tracking-wide mb-2">
              Visualizer Crashed
            </h3>
            
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              The visualization panel encountered an unexpected rendering error. This could be due to a malformed AST or an issue inside the graph layout engine.
            </p>

            {this.state.error && (
              <pre className="w-full text-left font-mono text-[10px] bg-bg-secondary p-3 rounded border border-border-primary text-error overflow-auto max-h-32 mb-6 select-all">
                {this.state.error.name}: {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2 bg-info hover:bg-info/95 text-text-primary font-mono text-sm rounded border border-info/35 font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Reset Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
