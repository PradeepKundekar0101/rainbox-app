"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { FolderType, SenderType } from "@/types/data";
import { createClient } from "@/utils/supabase/client";
import { useAxios } from "@/hooks/useAxios";
import { AxiosResponse } from "axios";
import { useSenders } from "./sendersContext";

interface FoldersContextType {
  folders: FolderType[];
  isFoldersLoading: boolean;
  foldersListError: string | null;
  createFolderError: string | null;
  createFolder: (name: string) => Promise<void>;
  deleteFolderError: string | null;
  deleteFolder: (id: string) => Promise<void>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  addSenderToFolder: (folderId: string, senderId: string) => Promise<void>;
  getSenders: (folderId: string) => Promise<SenderType[]>;
  isLoadingSenders: boolean;
  reorderFolders: (activeId: string, overId: string) => void;
  toggleReadFolder: (folderId: string, isRead: boolean) => Promise<void>;
}

const FoldersContext = createContext<FoldersContextType | null>(null);

// Add this function at the top level before the context definition
const FOLDER_ORDER_KEY = "folder_order";

const getFolderOrderFromLocalStorage = (
  userId: string
): Record<string, number> => {
  if (typeof window === "undefined") return {};
  const key = `${FOLDER_ORDER_KEY}_${userId}`;
  const savedOrder = localStorage.getItem(key);
  return savedOrder ? JSON.parse(savedOrder) : {};
};

const saveFolderOrderToLocalStorage = (
  userId: string,
  orderMap: Record<string, number>
) => {
  if (typeof window === "undefined") return;
  const key = `${FOLDER_ORDER_KEY}_${userId}`;
  localStorage.setItem(key, JSON.stringify(orderMap));
};

export const FoldersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const supabase = createClient();
  const { fetchSenders } = useSenders();
  const { removeSender } = useSenders();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [foldersListError, setFoldersListError] = useState<string | null>(null);
  const [isLoadingSenders, setIsLoadingSenders] = useState<boolean>(false);
  const [createFolderError, setCreateFolderError] = useState<string | null>(
    null
  );
  const [deleteFolderError, setDeleteFolderError] = useState<string | null>(
    null
  );

  const api = useAxios();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        setUserId(user.user.id);
      }
    };
    getUserId();
  }, [supabase]);

  const fetchFolders = useCallback(async () => {
    try {
      setIsFoldersLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const data = await api.get(`/folders/user/${user.user.id}`);
      let foldersData = data.data;

      for (let folder of foldersData) {
        const sendersResponse = await api.get(
          `/folders/getSenders/${folder.id}`
        );
        folder.senders = sendersResponse.data || [];
      }

      // Apply folder order from localStorage if available
      const savedOrder = getFolderOrderFromLocalStorage(user.user.id);

      if (Object.keys(savedOrder).length > 0) {
        // Add order property to folders based on localStorage
        foldersData = foldersData.map((folder: FolderType) => ({
          ...folder,
          order: savedOrder[folder.id] || Number.MAX_SAFE_INTEGER,
        }));

        // Sort folders based on the order property
        foldersData.sort(
          (a: FolderType, b: FolderType) =>
            (a.order || Number.MAX_SAFE_INTEGER) -
            (b.order || Number.MAX_SAFE_INTEGER)
        );
      } else {
        // If no saved order, assign default order
        foldersData = foldersData.map((folder: FolderType, index: number) => ({
          ...folder,
          order: index,
        }));
      }

      setFolders(foldersData);
    } catch (error) {
      setFoldersListError(
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(error);
    } finally {
      setIsFoldersLoading(false);
    }
  }, [api, supabase]);

  const reorderFolders = useCallback(
    (activeId: string, overId: string) => {
      if (!userId || activeId === overId) return;

      // Extract folder IDs from activeId and overId (remove "folder-" prefix)
      const activeFolderId = activeId.replace("folder-", "");
      const overFolderId = overId.replace("folder-", "");

      setFolders((prevFolders) => {
        // Find indices of the folders
        const oldIndex = prevFolders.findIndex(
          (folder) => folder.id === activeFolderId
        );
        const newIndex = prevFolders.findIndex(
          (folder) => folder.id === overFolderId
        );

        if (oldIndex === -1 || newIndex === -1) return prevFolders;

        // Create a copy of the folders array
        const newFolders = [...prevFolders];

        // Remove the active folder from its position
        const [movedFolder] = newFolders.splice(oldIndex, 1);

        // Insert it at the new position
        newFolders.splice(newIndex, 0, movedFolder);

        // Update order properties
        const updatedFolders = newFolders.map((folder, index) => ({
          ...folder,
          order: index,
        }));

        // Save the new order to localStorage
        const orderMap: Record<string, number> = {};
        updatedFolders.forEach((folder, index) => {
          orderMap[folder.id] = index;
        });

        saveFolderOrderToLocalStorage(userId, orderMap);

        return updatedFolders;
      });
    },
    [userId]
  );

  const createFolder = useCallback(
    async (name: string) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        console.log("User ID:", user.user.id);
        console.log("folder name:", name);
        const data = await api.post(`/folders`, {
          name,
          user_id: user.user.id,
        });
        console.log("New folder created:", data.data);

        // Add order to the new folder (highest order + 1)
        const newFolder = {
          ...data.data,
          order:
            folders.length > 0
              ? Math.max(...folders.map((f) => f.order || 0)) + 1
              : 0,
        };

        // Update local storage with the new order
        if (user.user.id) {
          const savedOrder = getFolderOrderFromLocalStorage(user.user.id);
          savedOrder[newFolder.id] = newFolder.order;
          saveFolderOrderToLocalStorage(user.user.id, savedOrder);
        }

        setFolders([...folders, newFolder]);
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
        setFolders(folders.filter((folder) => folder.id !== id));

        if (user.user.id) {
          const savedOrder = getFolderOrderFromLocalStorage(user.user.id);
          delete savedOrder[id];
          saveFolderOrderToLocalStorage(user.user.id, savedOrder);
        }
      } catch (error) {
        setDeleteFolderError(
          error instanceof Error ? error.message : "Unknown error"
        );
        console.error(error);
      }
    },
    [api, supabase, folders]
  );
  const addSenderToFolder = useCallback(
    async (senderId: string, folderId: string) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const response = await api.post(`/folders/sender/${senderId}`, {
          folder_id: folderId,
        });

        if (!response?.data?.sender) {
          console.error("No sender returned from API");
          return;
        }

        removeSender(senderId);

        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === folderId
              ? {
                ...folder,
                senders: [...(folder.senders || []), response.data.sender],
              }
              : folder
          )
        );
      } catch (error) {
        console.error(error);
      }
    },
    [api, supabase]
  );

  const getSenders = useCallback(
    async (folderId: string): Promise<SenderType[]> => {
      setIsLoadingSenders(true);

      console.log(" folderId from getSenders", folderId);
      try {
        const response: AxiosResponse<SenderType[]> = await api.get(
          `/folders/getSenders/${folderId}`
        );
        setIsLoadingSenders(false);
        return response.data;
      } catch (error) {
        console.error(error);
        setIsLoadingSenders(false);
        return [];
      }
    },
    [api]
  );
  const renameFolder = useCallback(
    async (folderId: string, name: string) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        console.log("Renaming folder:", folderId, "to:", name);
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

  const toggleReadFolder = useCallback(
    async (folderId: string, isRead: boolean) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        console.log("toggleFolder:", folderId, "to:", isRead);
        await api.patch(`/folders/read`, {
          folder_id: folderId,
          isRead: isRead,
        });
        const updatedFolders = folders.map((folder) =>
          folder.id === folderId ? { ...folder, isRead } : folder
        );
        setFolders(updatedFolders);
      } catch (error) {
        console.error(error);
      }
    },
    [api, supabase]
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
        renameFolder,
        addSenderToFolder,
        getSenders,
        isLoadingSenders,
        reorderFolders,
        toggleReadFolder,
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
