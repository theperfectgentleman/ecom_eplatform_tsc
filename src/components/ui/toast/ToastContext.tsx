import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastType;
}

export interface GroupedToast {
  id: string;
  variant: ToastType;
  messages: Array<{
    title: string;
    description?: string;
    timestamp: number;
  }>;
  count: number;
  latestTimestamp: number;
}

export interface ToastContextType {
  toasts: GroupedToast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  copyToastMessages: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<GroupedToast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }, []);

  const copyToastMessages = useCallback((id: string) => {
    const toast = toasts.find(t => t.id === id);
    if (toast) {
      const messages = toast.messages
        .map(msg => `${msg.title}${msg.description ? ': ' + msg.description : ''}`)
        .join('\n');
      
      navigator.clipboard.writeText(messages).catch(err => {
        console.error('Failed to copy to clipboard:', err);
      });
    }
  }, [toasts]);

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const timestamp = Date.now();
    
    setToasts((currentToasts) => {
      // Find existing toast with same variant
      const existingToastIndex = currentToasts.findIndex(t => t.variant === props.variant);
      
      if (existingToastIndex !== -1) {
        // Update existing grouped toast
        const updatedToasts = [...currentToasts];
        const existingToast = updatedToasts[existingToastIndex];
        
        updatedToasts[existingToastIndex] = {
          ...existingToast,
          messages: [...existingToast.messages, {
            title: props.title,
            description: props.description,
            timestamp
          }],
          count: existingToast.count + 1,
          latestTimestamp: timestamp
        };
        
        // Move updated toast to end (most recent)
        const [updatedToast] = updatedToasts.splice(existingToastIndex, 1);
        updatedToasts.push(updatedToast);
        
        return updatedToasts;
      } else {
        // Create new grouped toast
        const id = Math.random().toString(36).substr(2, 9);
        const newGroupedToast: GroupedToast = {
          id,
          variant: props.variant,
          messages: [{
            title: props.title,
            description: props.description,
            timestamp
          }],
          count: 1,
          latestTimestamp: timestamp
        };
        
        // Auto-remove after 8 seconds (longer for grouped toasts)
        setTimeout(() => removeToast(id), 8000);
        
        return [...currentToasts, newGroupedToast];
      }
    });
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast, copyToastMessages }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};
