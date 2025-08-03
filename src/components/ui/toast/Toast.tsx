import React from "react";
import { ToastType, useToastContext } from "./ToastContext";
import { Copy, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "./useToast";

const typeStyles: Record<ToastType, string> = {
  success: "bg-green-100 border-green-500 text-green-800",
  error: "bg-red-100 border-red-500 text-red-800",
  warning: "bg-orange-100 border-orange-500 text-orange-800",
  info: "bg-blue-100 border-blue-500 text-blue-800",
};

const typeIcons: Record<ToastType, React.ElementType> = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

export const ToastContainer = () => {
  const { toasts, removeToast, copyToastMessages } = useToastContext();
  const { toast } = useToast();

  const handleCopyClick = async (toastId: string) => {
    try {
      await copyToastMessages(toastId);
      toast({ title: "Messages copied to clipboard", variant: "info" });
    } catch {
      toast({ title: "Failed to copy", variant: "error" });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map((groupedToast) => {
        const Icon = typeIcons[groupedToast.variant];
        const latestMessage = groupedToast.messages[groupedToast.messages.length - 1];
        const hasMultiple = groupedToast.count > 1;
        
        return (
          <div
            key={groupedToast.id}
            className={`w-96 max-w-sm flex items-start shadow-lg border-l-4 rounded-md px-4 py-3 mb-2 animate-fade-in-up ${typeStyles[groupedToast.variant]}`}
            role="alert"
          >
            <div className="flex-shrink-0 pt-0.5">
                <Icon className="h-5 w-5" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{latestMessage.title}</p>
                {hasMultiple && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-50 text-current">
                    {groupedToast.count}
                  </span>
                )}
              </div>
              {latestMessage.description && (
                <p className="mt-1 text-sm opacity-80">{latestMessage.description}</p>
              )}
              {hasMultiple && (
                <p className="mt-1 text-xs opacity-60">
                  {groupedToast.count - 1} more similar message{groupedToast.count - 1 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                {hasMultiple && (
                    <button
                        className="mr-2 text-current hover:opacity-70 focus:outline-none"
                        onClick={() => handleCopyClick(groupedToast.id)}
                        aria-label="Copy all messages"
                        title="Copy all messages"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                )}
                <button
                    className="text-xl font-bold focus:outline-none opacity-60 hover:opacity-100"
                    onClick={() => removeToast(groupedToast.id)}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
