
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  loading = false,
  loadingText,
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  
  const sizeClasses = {
    sm: 'text-[10px] py-2 px-3 rounded-xl min-h-[36px]',
    md: 'text-xs py-3 px-4 rounded-2xl min-h-[44px]',
    lg: 'text-sm py-4 px-6 rounded-2xl min-h-[52px]'
  };
  
  const variantClasses = {
    primary: 'bg-electric-600 text-white shadow-lg hover:bg-electric-700 active:bg-electric-800',
    secondary: 'neu-button text-gray-700 hover:text-electric-600',
    danger: 'bg-red-500 text-white shadow-lg hover:bg-red-600',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" color="currentColor" />
          {loadingText || 'Loading...'}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};

export default ActionButton;
