"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { Folder } from "@/types/data";
import { createClient } from "@/utils/supabase/client";
import { useAxios } from "@/hooks/useAxios";
import { AxiosResponse } from "axios";

interface FoldersContextType {
  folders: Folder[];
  isFoldersLoading: boolean;
  foldersListError: string | null;
  createFolderError: string | null;
  createFolder: (name: string) => Promise<void>;
  deleteFolderError: string | null;
  deleteFolder: (id: string) => Promise<void>;
  getSenders: (
    folderId: string
  ) => Promise<AxiosResponse<any, any> | undefined>;
}

const FoldersContext = createContext<FoldersContextType | null>(null);

export const FoldersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const supabase = createClient();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [foldersListError, setFoldersListError] = useState<string | null>(null);
  const [createFolderError, setCreateFolderError] = useState<string | null>(
    null
  );
  const [deleteFolderError, setDeleteFolderError] = useState<string | null>(
    null
  );

  const api = useAxios();

  const fetchFolders = useCallback(async () => {
    try {
      setIsFoldersLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const data = await api.get(`/folders/user/${user.user.id}`);
      setFolders(data.data);
    } catch (error) {
      setFoldersListError(
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(error);
    } finally {
      setIsFoldersLoading(false);
    }
  }, [api, supabase]);

  const createFolder = useCallback(
    async (name: string) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;
        const data = await api.post(`/folders/user/${user.user.id}`, { name });
        setFolders([...folders, data.data]);
      } catch (error) {
        setCreateFolderError(
          error instanceof Error ? error.message : "Unknown error"
        );
        console.error(error);
      }
    },
    [api, supabase, folders]
  );
  const deleteFolder = useCallback(
    async (id: string) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;
        await api.delete(`/folders/${id}`);
      } catch (error) {
        setDeleteFolderError(
          error instanceof Error ? error.message : "Unknown error"
        );
        console.error(error);
      }
    },
    [api, supabase]
  );
  const addSenderToFolder = useCallback(
    async (folderId: string, senderId: string) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;
        await api.post(`/folders/sender/${senderId}`, { folder_id: folderId });
      } catch (error) {
        console.error(error);
      }
    },
    [api, supabase]
  );
  const renameFolder = useCallback(
    async (folderId: string, name: string) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;
        await api.patch(`/folders/${folderId}`, { name });
        const updatedFolders = folders.map((folder) =>
          folder.id === folderId ? { ...folder, name } : folder
        );
        setFolders(updatedFolders);
      } catch (error) {
        console.error(error);
      }
    },
    [api, supabase]
  );
  const getSenders = useCallback(
    async (folderId: string) => {
      try {
        const data = await api.get(`/folders/getSenders/${folderId}`);
        return data;
      } catch (error) {
        console.error(error);
      }
    },
    [api]
  );
  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <FoldersContext.Provider
      value={{
        folders,
        isFoldersLoading,
        foldersListError,
        createFolderError,
        createFolder,
        deleteFolderError,
        deleteFolder,
        getSenders,
      }}
    >
      {children}
    </FoldersContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FoldersContext);
  if (!context) {
    throw new Error("useFolders must be used within an FoldersProvider");
  }
  return context;
};
