import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy } from './Icons';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to console for debugging
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Store error in localStorage for debugging
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      const existingLogs = JSON.parse(localStorage.getItem('goldhunt:errorLogs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 10 errors
      if (existingLogs.length > 10) existingLogs.shift();
      localStorage.setItem('goldhunt:errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      // Ignore storage errors
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleClearAndReload = () => {
    // Clear session and reload
    localStorage.removeItem('goldhunt:session');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      
      // Error Detection Logic
      const isDraftError = error?.message?.includes('waveSize') || 
                           error?.message?.includes('cannot determine picker') ||
                           error?.message?.includes('participants');
                           
      const isFirebaseDocError = error?.message?.includes('No document to update') ||
                                 error?.message?.includes('document does not exist') ||
                                 error?.message?.includes('Missing or insufficient permissions');

      // Retrieve Session Context
      const sessionData = (() => {
        try {
          return JSON.parse(localStorage.getItem('goldhunt:session') || '{}');
        } catch { return {}; }
      })();

      return (
        <div className="min-h-screen bg-neu-base flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="neu-card p-8 text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-red-500" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-black uppercase italic text-gray-900 mb-2">
                System Failure
              </h1>
              
              {/* League Context */}
              {sessionData.leagueId && (
                <div className="mb-4 inline-block px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-mono text-gray-500">
                  League: {sessionData.leagueId}
                </div>
              )}

              {/* Specific Error Messages */}
              {isDraftError && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                  <p className="text-xs font-bold text-yellow-800 mb-1 flex items-center gap-2">
                    <AlertTriangle size={12}/> Draft State Sync Error
                  </p>
                  <p className="text-[10px] text-yellow-700 leading-relaxed">
                    The draft logic lost track of the current state (participants list empty or wave desync). Attempting a repair usually fixes this.
                  </p>
                </div>
              )}

              {isFirebaseDocError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                  <p className="text-xs font-bold text-red-800 mb-1 flex items-center gap-2">
                    <AlertTriangle size={12}/> Database Connection Error
                  </p>
                  <p className="text-[10px] text-red-700 leading-relaxed">
                    A required document is missing or inaccessible. This often happens if a league was deleted or during network instability.
                  </p>
                </div>
              )}

              {!isDraftError && !isFirebaseDocError && (
                <p className="text-sm text-gray-500 mb-6 font-medium">
                  {error?.message || "An unexpected error occurred."}
                </p>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Repair Button - Dynamic Import */}
                {(isDraftError || isFirebaseDocError) && sessionData.leagueId && (
                  <button
                    onClick={async () => {
                      try {
                        const { quickFixLeagueDraft } = await import('../services/databaseService');
                        await quickFixLeagueDraft(sessionData.leagueId);
                        alert('Repair attempted! Reloading system...');
                        window.location.reload();
                      } catch (e: any) {
                        alert('Repair failed: ' + e.message);
                      }
                    }}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                  >
                    <RefreshCw size={18} /> Repair Draft State
                  </button>
                )}

                <button
                  onClick={this.handleReset}
                  className="w-full py-4 bg-electric-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                >
                  <RefreshCw size={18} /> Try Again
                </button>
                
                <div className="flex gap-3">
                    <button
                        onClick={this.handleReload}
                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all"
                    >
                        <RefreshCw size={14} /> Reload
                    </button>
                    
                    <button
                        onClick={this.handleClearAndReload}
                        className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all"
                    >
                        <Home size={14} /> Lobby
                    </button>
                </div>

                <button
                  onClick={() => {
                    const errorText = `Error: ${error?.message}\nStack: ${error?.stack}\nLeague: ${sessionData.leagueId || 'unknown'}\nURL: ${window.location.href}`;
                    navigator.clipboard.writeText(errorText);
                    alert('Error details copied to clipboard.');
                  }}
                  className="w-full py-3 text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:text-gray-600"
                >
                  <Copy size={12} /> Copy Error Details
                </button>
              </div>

              {/* Debug Info */}
              {this.state.error && (
                <details className="mt-6 text-left border-t border-gray-100 pt-4">
                  <summary className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer flex items-center gap-2 hover:text-gray-600">
                    <Bug size={12} /> Technical Details
                  </summary>
                  <div className="mt-3 p-3 bg-gray-900 rounded-xl overflow-auto max-h-48 shadow-inner">
                    <code className="text-[10px] text-green-400 whitespace-pre-wrap break-all font-mono">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </code>
                  </div>
                </details>
              )}
            </div>

            {/* Help Text */}
            <p className="text-center text-[10px] text-gray-400 mt-4">
              If this keeps happening, try clearing your browser cache or contact the commissioner.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}