import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const showLoader = () => {
    setRequestCount(prev => {
      if (prev === 0) setIsLoading(true);
      return prev + 1;
    });
  };

  const hideLoader = () => {
    setRequestCount(prev => {
      const newCount = prev - 1;
      if (newCount === 0) setIsLoading(false);
      return newCount > 0 ? newCount : 0;
    });
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  );
};
