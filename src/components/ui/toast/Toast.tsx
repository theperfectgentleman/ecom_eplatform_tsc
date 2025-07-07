import React from "react";
import { ToastType, useToastContext } from "./ToastContext";
import { Scissors, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
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

function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textArea);
    }
    return Promise.resolve();
  }
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext();
  const { toast } = useToast();

  const handleCopyClick = async (description?: string) => {
    if (description) {
      try {
        await copyToClipboard(description);
        toast({ title: "Copied to clipboard", variant: "info" });
      } catch {
        toast({ title: "Failed to copy", variant: "error" });
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toastObj) => {
        const Icon = typeIcons[toastObj.variant];
        return (
          <div
            key={toastObj.id}
            className={`w-96 max-w-sm flex items-start shadow-lg border-l-4 rounded-md px-4 py-3 mb-2 animate-fade-in-up ${typeStyles[toastObj.variant]}`}
            role="alert"
          >
            <div className="flex-shrink-0 pt-0.5">
                <Icon className="h-5 w-5" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{toastObj.title}</p>
              {toastObj.description && (
                <p className="mt-1 text-sm opacity-80">{toastObj.description}</p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                {toastObj.description && (
                    <button
                        className="mr-2 text-current hover:opacity-70 focus:outline-none"
                        onClick={() => handleCopyClick(toastObj.description)}
                        aria-label="Copy details"
                    >
                        <Scissors className="h-5 w-5" />
                    </button>
                )}
                <button
                    className="text-xl font-bold focus:outline-none opacity-60 hover:opacity-100"
                    onClick={() => removeToast(toastObj.id)}
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
