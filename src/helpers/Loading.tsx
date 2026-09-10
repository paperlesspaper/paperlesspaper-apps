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
  unregisterLoading: (key: string) => void;
  setLoadingStatus: (key: string, loading: boolean) => void;
  allFinishedLoading: boolean;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined
);

interface LoadingProviderProps {
  children: ReactNode;
  finishedLoading?: boolean;
}

interface LoadingStatus {
  id: string;
  loading: boolean;
}

// Provider component
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  finishedLoading = false,
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

  const unregisterLoading = useCallback((id: string) => {
    setLoadingStatuses((statuses) => statuses.filter((status) => status.id !== id));
  }, []);

  // Function to update loading status
  const setLoadingStatus = useCallback((id: string, loading: boolean) => {
    setLoadingStatuses((prevStatuses) => {
      let hasChanges = false;
      const nextStatuses = prevStatuses.map((status) => {
        if (status.id !== id) {
          return status;
        }
        if (status.loading === loading) {
          return status;
        }
        hasChanges = true;
        return { ...status, loading };
      });

      return hasChanges ? nextStatuses : prevStatuses;
    });
  }, []);

  // Function to check if all hooks are finished loading
  const allFinishedLoading =
    finishedLoading ||
    (loadingStatuses.length > 0 &&
      loadingStatuses.every((status) => !status.loading));

  return (
    <LoadingContext.Provider
      value={{ registerLoading, unregisterLoading, setLoadingStatus, allFinishedLoading }}
    >
      {children}
      {allFinishedLoading ? (
        <div id="website-has-loaded" />
      ) : (
        <div id="website-is-loading" />
      )}
      <div id="website-has-loading-element" />
    </LoadingContext.Provider>
  );
};

interface UseLoadingProps {
  id: string;
}

export const useLoading = ({ id }: UseLoadingProps) => {
  const { registerLoading, unregisterLoading, setLoadingStatus } = useContext(
    LoadingContext
  ) as LoadingContextProps;

  // Register a unique key for each hook instance
  const instanceId = React.useId();
  const uniqueKey = `${id}:${instanceId}`;

  React.useEffect(() => {
    registerLoading(uniqueKey);
    return () => unregisterLoading(uniqueKey);
  }, [registerLoading, unregisterLoading, uniqueKey]);

  const setLoading = useCallback(
    (loading: boolean) => {
      setLoadingStatus(uniqueKey, loading);
    },
    [uniqueKey, setLoadingStatus]
  );

  return setLoading;
};
