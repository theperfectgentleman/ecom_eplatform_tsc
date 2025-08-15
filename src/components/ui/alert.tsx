import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert = ({ 
  variant = 'info', 
  title, 
  description, 
  dismissible = false, 
  onDismiss,
  className = '' 
}: AlertProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          containerClass: 'border-green-200 bg-green-50',
          iconClass: 'text-green-600',
          textClass: 'text-green-800',
          Icon: CheckCircle
        };
      case 'error':
        return {
          containerClass: 'border-red-200 bg-red-50',
          iconClass: 'text-red-600',
          textClass: 'text-red-800',
          Icon: AlertCircle
        };
      case 'warning':
        return {
          containerClass: 'border-yellow-200 bg-yellow-50',
          iconClass: 'text-yellow-600',
          textClass: 'text-yellow-800',
          Icon: AlertCircle
        };
      default:
        return {
          containerClass: 'border-blue-200 bg-blue-50',
          iconClass: 'text-blue-600',
          textClass: 'text-blue-800',
          Icon: Info
        };
    }
  };

  const { containerClass, iconClass, textClass, Icon } = getVariantStyles();

  return (
    <Card className={`${containerClass} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${iconClass} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            {title && (
              <h4 className={`font-medium ${textClass} mb-1`}>
                {title}
              </h4>
            )}
            {description && (
              <p className={`text-sm ${textClass}`}>
                {description}
              </p>
            )}
          </div>
          {dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="p-1 h-auto hover:bg-transparent"
            >
              <X className={`h-4 w-4 ${iconClass}`} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Alert;
