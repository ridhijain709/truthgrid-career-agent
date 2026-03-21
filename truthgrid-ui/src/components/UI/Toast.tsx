'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification } from '@/types';
import clsx from 'clsx';

interface ToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

export function Toast({ notification, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-remove if duration is set
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsRemoving(true);
        setTimeout(() => onRemove(notification.id), 300);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onRemove]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'border-l-4';
    switch (notification.type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50 dark:bg-green-900/20`;
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50 dark:bg-red-900/20`;
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20`;
      case 'info':
      default:
        return `${baseStyles} border-blue-500 bg-blue-50 dark:bg-blue-900/20`;
    }
  };

  return (
    <div
      className={clsx(
        'max-w-sm w-full rounded-lg shadow-lg p-4 mb-4 transition-all duration-300 transform',
        getStyles(),
        {
          'translate-x-0 opacity-100': isVisible && !isRemoving,
          'translate-x-full opacity-0': !isVisible || isRemoving,
        }
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {notification.title}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ notifications, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}