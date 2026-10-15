/**
 * @file src/components/ErrorBoundary.tsx
 * Production-ready React Error Boundary for MarketNest.
 * Gracefully isolates runtime failures, prevents blank screens, and offers retry/recovery CTAs.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { monitoringService } from '../services/monitoringService';
import { AlertTriangle, RotateCcw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const event = monitoringService.reportError(error, errorInfo.componentStack || undefined);
    this.setState({
      error,
      errorInfo,
      eventId: event.id
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, eventId: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-[#E4E7E5] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-[#101413]">Something went unexpectedly</h1>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                MarketNest encountered an unexpected rendering error. Your account data, cart, and payment records remain secure and protected.
              </p>
            </div>

            {this.state.eventId && (
              <div className="p-3 bg-[#F7F5F0] rounded-lg text-[11px] text-[#6B726E] font-mono flex items-center justify-center gap-2">
                <span>Incident Ref:</span>
                <strong className="text-[#101413]">{this.state.eventId}</strong>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#101413] hover:bg-[#1B211F] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#E4E7E5] hover:bg-[#F7F5F0] text-[#101413] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
