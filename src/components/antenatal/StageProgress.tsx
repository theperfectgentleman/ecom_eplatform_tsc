import { ANCStage } from '@/types';
import { CheckCircle, Circle, User, FileText, Calendar } from 'lucide-react';

interface StageProgressProps {
  currentStage: ANCStage;
  completedStages: ANCStage[];
  onStageClick?: (stage: ANCStage) => void;
  isStageAccessible?: (stage: ANCStage) => boolean;
}

const StageProgress = ({ currentStage, completedStages, onStageClick, isStageAccessible }: StageProgressProps) => {
  const stages = [
    {
      stage: ANCStage.PERSON_DETAILS,
      title: 'Person Details',
      description: 'Basic information and contact details',
      icon: User
    },
    {
      stage: ANCStage.ANC_REGISTRATION,
      title: 'ANC Registration',
      description: 'Pregnancy details and initial assessment',
      icon: FileText
    },
    {
      stage: ANCStage.ANC_VISITS,
      title: 'ANC Visits',
      description: 'Visit tracking and management',
      icon: Calendar
    }
  ];

  const getStageStatus = (stage: ANCStage) => {
    if (completedStages.includes(stage)) return 'completed';
    if (stage === currentStage) return 'current';
    return 'pending';
  };

  const getStageStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          containerClass: 'bg-green-50 border-green-200',
          iconClass: 'text-green-600',
          textClass: 'text-green-800',
          StageIcon: CheckCircle
        };
      case 'current':
        return {
          containerClass: 'bg-blue-50 border-blue-200 ring-2 ring-blue-300',
          iconClass: 'text-blue-600',
          textClass: 'text-blue-800',
          StageIcon: null
        };
      default:
        return {
          containerClass: 'bg-gray-50 border-gray-200',
          iconClass: 'text-gray-400',
          textClass: 'text-gray-600',
          StageIcon: Circle
        };
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center bg-gray-50 rounded-lg p-3 w-fit">
        {stages.map((stageInfo, index) => {
          const status = getStageStatus(stageInfo.stage);
          const { iconClass, textClass, StageIcon } = getStageStyles(status);
          const Icon = stageInfo.icon;
          
          // Use isStageAccessible if provided, otherwise use default logic
          const isAccessible = isStageAccessible 
            ? isStageAccessible(stageInfo.stage)
            : (status === 'completed' || status === 'current');
          const isClickable = onStageClick && isAccessible;

          return (
            <div key={stageInfo.stage} className="flex items-center">
              <div
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
                  ${status === 'current' ? 'bg-blue-100 border border-blue-200' : ''}
                  ${status === 'completed' ? 'bg-green-100' : ''}
                  ${isClickable ? 'cursor-pointer hover:bg-opacity-80 hover:shadow-sm active:scale-95 select-none' : 'cursor-default'}
                `}
                onClick={() => {
                  if (isClickable && onStageClick) {
                    onStageClick(stageInfo.stage);
                  }
                }}
                role={isClickable ? "button" : "presentation"}
                tabIndex={isClickable ? 0 : -1}
                onKeyDown={(e) => {
                  if (isClickable && onStageClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStageClick(stageInfo.stage);
                  }
                }}
              >
                <div className="flex-shrink-0">
                  {StageIcon ? (
                    <StageIcon className={`h-4 w-4 ${iconClass}`} />
                  ) : (
                    <Icon className={`h-4 w-4 ${iconClass}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${textClass}`}>
                  {stageInfo.title}
                </span>
              </div>
              
              {/* Connector arrow */}
              {index < stages.length - 1 && (
                <div className="mx-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageProgress;
