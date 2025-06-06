// context/foldersContext.tsx

"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactNode
} from "react";
import { FolderType } from "@/types/data";
import { createClient } from "@/utils/supabase/client";
import { useAxios } from "@/hooks/useAxios";

interface FoldersContextType {
  folders: FolderType[];
  isFoldersLoading: boolean;
  foldersListError: string | null;
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  toggleReadFolder: (folderId: string, isRead: boolean) => Promise<void>;
  updateFolderBackend: (folderId: string, data: Partial<FolderType>) => Promise<void>;
}

const FoldersContext = createContext<FoldersContextType | null>(null);

export const FoldersProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(true);
  const [foldersListError, setFoldersListError] = useState<string | null>(null);
  const [reRender, setReRender] = useState(false);
  const api = useAxios();

  const fetchFolders = useCallback(async () => {
    setIsFoldersLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        setIsFoldersLoading(false);
        return;
      };

      const { data } = await api.get(`/folders/user/${user.id}`);
      setFolders(data.map((f: FolderType) => ({ ...f, type: 'folder' })));
    } catch (error) {
      setFoldersListError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsFoldersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = useCallback(async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await api.post(`/folders`, { name, user_id: user.id });
      await fetchFolders(); // Refetch to get the new folder with its ID
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  }, [api, supabase, fetchFolders]);

  const deleteFolder = useCallback(async (id: string) => {
    try {
      await api.delete(`/folders/${id}`);
      setFolders((prev) => prev.filter((folder) => folder.id !== id));
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  }, [api]);

  const renameFolder = useCallback(async (folderId: string, name: string) => {
    await updateFolderBackend(folderId, { name });
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f));
  }, [reRender]);

  const toggleReadFolder = useCallback(async (folderId: string, isRead: boolean) => {
    await updateFolderBackend(folderId, { isRead });
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isRead } : f));
  }, [reRender]);

  const updateFolderBackend = useCallback(async (folderId: string, data: Partial<FolderType>) => {
    try {
      await api.patch(`/folders/${folderId}`, data);
      setReRender(prev => !prev);
    } catch (error) {
      console.error(`Failed to update folder ${folderId}:`, error);
    }
  }, [api]);

  return (
    <FoldersContext.Provider
      value={{
        folders,
        isFoldersLoading,
        foldersListError,
        createFolder,
        deleteFolder,
        renameFolder,
        toggleReadFolder,
        updateFolderBackend,
      }}
    >
      {children}
    </FoldersContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FoldersContext);
  if (!context) {
    throw new Error("useFolders must be used within a FoldersProvider");
  }
  return context;
};