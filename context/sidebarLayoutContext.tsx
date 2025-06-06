// context/SidebarLayoutContext.tsx

"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { useFolders } from "./foldersContext";
import { useSenders } from "./sendersContext";
import { FolderType, SenderType } from "@/types/data";
import { createClient } from "@/utils/supabase/client";
import { arrayMove } from "@dnd-kit/sortable";

export type SidebarItem = (FolderType | SenderType) & { id: string };

export interface SidebarLayout {
  rootOrder: string[];
  folderContents: {
    [folderId: string]: string[];
  };
}

interface SidebarLayoutContextType {
  isLayoutLoading: boolean;
  rootItems: SidebarItem[];
  getOrderedSendersForFolder: (folderId: string) => SenderType[];
  // Actions
  moveItemInRoot: (activeId: string, overId: string) => void;
  moveSenderToRoot: (
    senderId: string,
    sourceContainerId: string,
    destinationIndex: number
  ) => void;
  moveSenderToFolder: (
    senderId: string,
    sourceContainerId: string,
    targetFolderId: string
  ) => void;
  moveSenderWithinFolder: (
    folderId: string,
    activeId: string,
    overId: string
  ) => void;
  toggleFolderExpansion: (folderId: string) => void;
  expandedFolders: Record<string, boolean>;
}

const SidebarLayoutContext = createContext<SidebarLayoutContextType | null>(
  null
);

export const SidebarLayoutProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const supabase = createClient();
  const { folders, isFoldersLoading, updateFolderBackend } = useFolders();
  const { senders, isSendersLoading, updateSenderBackend } = useSenders();

  const [userId, setUserId] = useState<string | null>(null);
  const [layout, setLayout] = useState<SidebarLayout>({
    rootOrder: [],
    folderContents: {},
  });
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUserId();
  }, [supabase]);

  const LAYOUT_STORAGE_KEY = useMemo(
    () => (userId ? `sidebar_layout_${userId}` : null),
    [userId]
  );

  // Initialize layout from localStorage or default
  useEffect(() => {
    if (isFoldersLoading || isSendersLoading || !LAYOUT_STORAGE_KEY) return;

    const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (savedLayout) {
      const parsed = JSON.parse(savedLayout);
      setLayout(parsed.layout);
      setExpandedFolders(parsed.expanded || {});
    } else {
      const rootSenders = senders.filter((s) => !s.folder_id);
      const initialRootOrder = [
        ...folders.map((f) => `folder-${f.id}`),
        ...rootSenders.map((s) => `sender-${s.id}`),
      ];
      const initialFolderContents = folders.reduce((acc, folder) => {
        acc[folder.id] = senders
          .filter((s) => s.folder_id === folder.id)
          .map((s) => `sender-${s.id}`);
        return acc;
      }, {} as Record<string, string[]>);

      setLayout({
        rootOrder: initialRootOrder,
        folderContents: initialFolderContents,
      });
    }
  }, [isFoldersLoading, isSendersLoading, folders, senders, LAYOUT_STORAGE_KEY]);

  // Persist layout to localStorage on change
  useEffect(() => {
    if (LAYOUT_STORAGE_KEY && !isFoldersLoading && !isSendersLoading) {
      const dataToSave = {
        layout,
        expanded: expandedFolders
      };
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [layout, expandedFolders, LAYOUT_STORAGE_KEY, isFoldersLoading, isSendersLoading]);

  const allItemsMap = useMemo(() => {
    const map = new Map<string, SidebarItem>();
    folders.forEach((f) => map.set(`folder-${f.id}`, { ...f, type: 'folder' }));
    senders.forEach((s) => map.set(`sender-${s.id}`, { ...s, type: 'sender' }));
    return map;
  }, [folders, senders]);

  const rootItems = useMemo(
    () => layout.rootOrder.map((id) => allItemsMap.get(id)).filter(Boolean) as SidebarItem[],
    [layout.rootOrder, allItemsMap]
  );

  const getOrderedSendersForFolder = useCallback(
    (folderId: string) => {
      const senderIds = layout.folderContents[folderId] || [];
      return senderIds
        .map((id) => allItemsMap.get(id))
        .filter(Boolean) as SenderType[];
    },
    [layout.folderContents, allItemsMap]
  );

  const moveItemInRoot = useCallback((activeId: string, overId: string) => {
    setLayout((prev) => {
      const oldIndex = prev.rootOrder.indexOf(activeId);
      const newIndex = prev.rootOrder.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return {
        ...prev,
        rootOrder: arrayMove(prev.rootOrder, oldIndex, newIndex),
      };
    });
  }, []);

  const moveSenderWithinFolder = useCallback(
    (folderId: string, activeId: string, overId: string) => {
      setLayout((prev) => {
        const folderContent = prev.folderContents[folderId] || [];
        const oldIndex = folderContent.indexOf(activeId);
        const newIndex = folderContent.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) return prev;

        return {
          ...prev,
          folderContents: {
            ...prev.folderContents,
            [folderId]: arrayMove(folderContent, oldIndex, newIndex),
          },
        };
      });
    },
    []
  );

  const moveSenderToFolder = useCallback(
    (senderId: string, sourceContainerId: string, targetFolderId: string) => {
      const senderOriginalId = senderId.replace('sender-', '');
      updateSenderBackend(senderOriginalId, { folder_id: targetFolderId });

      setLayout((prev) => {
        const newLayout = { ...prev, folderContents: { ...prev.folderContents } };

        // Remove from source
        if (sourceContainerId === 'root') {
          newLayout.rootOrder = prev.rootOrder.filter((id) => id !== senderId);
        } else {
          const sourceFolder = prev.folderContents[sourceContainerId] || [];
          newLayout.folderContents[sourceContainerId] = sourceFolder.filter(id => id !== senderId);
        }

        // Add to destination
        const targetFolder = prev.folderContents[targetFolderId] || [];
        newLayout.folderContents[targetFolderId] = [...targetFolder, senderId];

        return newLayout;
      });
      // Force expand folder
      setExpandedFolders(prev => ({ ...prev, [targetFolderId]: true }));
    },
    [updateSenderBackend]
  );

  const moveSenderToRoot = useCallback(
    (senderId: string, sourceContainerId: string, destinationIndex: number) => {
      const senderOriginalId = senderId.replace('sender-', '');
      updateSenderBackend(senderOriginalId, { folder_id: null });

      setLayout((prev) => {
        const newLayout = { ...prev, folderContents: { ...prev.folderContents } };

        // Remove from source folder
        const sourceFolder = prev.folderContents[sourceContainerId] || [];
        newLayout.folderContents[sourceContainerId] = sourceFolder.filter(id => id !== senderId);

        // Add to root
        const newRootOrder = [...prev.rootOrder];
        newRootOrder.splice(destinationIndex, 0, senderId);
        newLayout.rootOrder = newRootOrder;

        return newLayout;
      });
    }, [updateSenderBackend]);

  const toggleFolderExpansion = useCallback((folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  }, []);

  const value = {
    isLayoutLoading: isFoldersLoading || isSendersLoading || !userId,
    rootItems,
    getOrderedSendersForFolder,
    moveItemInRoot,
    moveSenderWithinFolder,
    moveSenderToFolder,
    moveSenderToRoot,
    toggleFolderExpansion,
    expandedFolders
  };

  return (
    <SidebarLayoutContext.Provider value={value}>
      {children}
    </SidebarLayoutContext.Provider>
  );
};

export const useSidebarLayout = () => {
  const context = useContext(SidebarLayoutContext);
  if (!context) {
    throw new Error(
      "useSidebarLayout must be used within a SidebarLayoutProvider"
    );
  }
  return context;
};