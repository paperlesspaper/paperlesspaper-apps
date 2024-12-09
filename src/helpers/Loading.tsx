// LoadingContext.js
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
} from "react";

// Create the context
interface LoadingContextProps {
  registerLoading: (key: string) => void;
  setLoadingStatus: (key: string, loading: boolean) => void;
  allFinishedLoading: boolean;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined
);

interface LoadingProviderProps {
  children: ReactNode;
}

interface LoadingStatus {
  id: string;
  loading: boolean;
}

// Provider component
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [loadingStatuses, setLoadingStatuses] = useState<LoadingStatus[]>([]);

  // Function to register loading status
  const registerLoading = useCallback((id: string) => {
    setLoadingStatuses((prevStatuses) => {
      if (prevStatuses.some((status) => status.id === id)) {
        return prevStatuses;
      }
      return [...prevStatuses, { id, loading: true }];
    });
  }, []);

  // Function to update loading status
  const setLoadingStatus = useCallback((id: string, loading: boolean) => {
    setLoadingStatuses((prevStatuses) =>
      prevStatuses.map((status) =>
        status.id === id ? { ...status, loading } : status
      )
    );
  }, []);

  // Function to check if all hooks are finished loading
  const allFinishedLoading =
    loadingStatuses.length > 0 &&
    loadingStatuses.every((status) => !status.loading);

  console.log("loadingStatuses", loadingStatuses);

  return (
    <LoadingContext.Provider
      value={{ registerLoading, setLoadingStatus, allFinishedLoading }}
    >
      {children}
      {/* Optional: You can display a loading indicator or any component based on allFinishedLoading */}
      {allFinishedLoading ? (
        <div id="website-has-loaded" />
      ) : (
        <div id="website-is-loading" />
      )}
      <div id="website-has-loading-element" />
    </LoadingContext.Provider>
  );
};

// Custom hook to use loading functionality
interface UseLoadingProps {
  id: string;
}

export const useLoading = ({ id }: UseLoadingProps) => {
  const { registerLoading, setLoadingStatus } = useContext(
    LoadingContext
  ) as LoadingContextProps;

  // Register a unique key for each hook instance
  const uniqueKey = id
    ? id
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useMemo(
        () => `loading_${Math.random().toString(36).substr(2, 9)}`,
        []
      );

  React.useEffect(() => {
    registerLoading(uniqueKey);
    // Cleanup function to remove the loading state when the component unmounts
    return () => {
      //  setLoadingStatus(uniqueKey, false);
    };
  }, [registerLoading, uniqueKey, setLoadingStatus]);

  const setLoading = useCallback(
    (loading: boolean) => {
      setLoadingStatus(uniqueKey, loading);
    },
    [uniqueKey, setLoadingStatus]
  );

  return setLoading;
};
