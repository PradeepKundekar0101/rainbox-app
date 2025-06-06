// components/inbox/Inbox.tsx

import React, { useState } from "react";
import {
  ChevronRightIcon,
  FolderIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderType, SenderType } from "@/types/data";
import { SenderIcon } from "./sender-icon";
import FolderComponent from "./folder";
import Sender from "./sender";
import { BasicModal } from "../modals/basic-modal";
import { useFolders } from "@/context/foldersContext";
import { useSenders } from "@/context/sendersContext";
import { useSidebarLayout } from "@/context/sidebarLayoutContext";
import { useSidebarDnd } from "@/hooks/useSidebarDnd";

export default function Inbox() {
  const { createFolder } = useFolders();
  const { senders } = useSenders();
  const { isLayoutLoading, rootItems } = useSidebarLayout();
  const {
    sensors,
    activeItem,
    targetFolderId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useSidebarDnd();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const totalCount = senders.reduce(
    (total, sender) => total + (sender.count || 0),
    0
  );

  if (isLayoutLoading) {
    return (
      <div className="flex-1 text-foreground rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="mb-3">
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const sortableIds = rootItems.map((item) => item.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 text-foreground rounded-lg">
        <div className="px-4 w-[99%] p-xs pr-2 flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <h3 className="font-medium text-sm text-muted-foreground">Inbox</h3>
          <button
            className="p-xs text-muted-foreground hover:cursor-pointer hover:text-foreground rounded-full hover:bg-accent transition-colors"
            onClick={() => setIsFolderModalOpen(true)}
            title="Create a new folder"
          >
            <FolderPlusIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-md py-sm flex items-center justify-between hover:bg-accent rounded-md cursor-pointer m-2">
          <div className="flex items-center space-x-md">
            <FolderIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">All</span>
          </div>
          <span className="text-xs text-muted-foreground">{totalCount}</span>
        </div>

        <div className="px-2 py-0">
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            {rootItems.map((item) => {
              if (item.type === "folder") {
                return (
                  <FolderComponent
                    key={item.id}
                    folder={item as FolderType}
                    isTargetForDrop={targetFolderId === item.id}
                  />
                );
              }
              if (item.type === "sender") {
                return (
                  <Sender
                    key={item.id}
                    sender={item as SenderType}
                    containerId="root"
                  />
                );
              }
              return null;
            })}
          </SortableContext>
        </div>
      </div>

      <BasicModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={async (folderName) => {
          await createFolder(folderName);
          setIsFolderModalOpen(false);
        }}
        title="Create New Folder"
      />

      <DragOverlay>
        {activeItem?.type === 'sender' && (
          <div className="px-md py-1.5 flex items-center justify-between rounded-md bg-secondary dark:bg-secondary text-foreground shadow-lg">
            <div className="flex items-center space-x-3">
              <SenderIcon sender={activeItem as SenderType} />
              <span className="text-sm">{activeItem.name}</span>
            </div>
          </div>
        )}
        {activeItem?.type === 'folder' && (
          <div className="px-md py-2 flex items-center justify-between rounded-md bg-secondary dark:bg-secondary text-foreground shadow-lg">
            <div className="flex items-center space-x-3">
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{activeItem.name}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}