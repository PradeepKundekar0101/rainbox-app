import React, { useState, useRef, useEffect } from "react";
import {
  ChevronRightIcon,
  FolderIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderType, SenderType } from "@/types/data";
import { SenderIcon } from "./SenderIcon";
import FolderComponent from "./Folder";
import Sender from "./Sender";
import { ConfirmModal } from "./ConfirmationModal";
import { Modal } from "./Modal";
import { useFolders } from "@/context/foldersContext";
import { useSenders } from "@/context/sendersContext";

// New interface to represent mixed items
interface OrderedItem {
  id: string;
  type: "folder" | "sender";
  originalId: string;
  order: number;
}

export default function Inbox() {
  const {
    folders,
    isFoldersLoading,
    createFolder,
    deleteFolder,
    addSenderToFolder,
  } = useFolders();
  console.log(folders);
  const { senders, isSendersLoading } = useSenders();

  // New state for tracking the order of all items
  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([]);

  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSender, setActiveSender] = useState<SenderType | null>(null);
  const [activeFolder, setActiveFolder] = useState<FolderType | null>(null);
  const [focusedFolder, setFocusedFolder] = useState<string | null>("");

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [currentAction, setCurrentAction] = useState<
    "delete" | "unfollow" | null
  >(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  // Initialize ordered items when folders and senders load
  useEffect(() => {
    if (!isFoldersLoading && !isSendersLoading) {
      // Get root senders (not in any folder)
      const rootSenders = senders.filter(
        (sender) => !sender.folder || sender.folder === ""
      );

      // Create initial ordered items
      const initialOrderedItems: OrderedItem[] = [
        // First add all folders
        ...folders.map((folder, index) => ({
          id: `folder-${folder.id}`,
          type: "folder" as const,
          originalId: folder.id,
          order: index,
        })),
        // Then add all root senders
        ...rootSenders.map((sender, index) => ({
          id: `sender-${sender.id}`,
          type: "sender" as const,
          originalId: sender.id,
          order: folders.length + index,
        })),
      ];

      setOrderedItems(initialOrderedItems);

      // Also initialize expanded folders state
      setExpandedFolders(
        folders.reduce(
          (acc, folder) => ({
            ...acc,
            [folder.id]: folder.isExpanded || false,
          }),
          {}
        )
      );
    }
  }, [folders, senders, isFoldersLoading, isSendersLoading]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
    setFocusedFolder(folderId);
  };

  const openFolderCreationModal = () => {
    setIsFolderModalOpen(true);
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    // This would need to be implemented in the folder context
    console.log(`Rename folder ${folderId} to ${newName}`);
  };

  const handleDeleteFolder = () => {
    if (targetId) {
      deleteFolder(targetId);

      // Remove the folder from ordered items
      setOrderedItems((prev) =>
        prev.filter(
          (item) => !(item.type === "folder" && item.originalId === targetId)
        )
      );

      // Clean up expanded state
      setExpandedFolders((prev) => {
        const newState = { ...prev };
        delete newState[targetId];
        return newState;
      });

      // Reset focus if needed
      if (focusedFolder === targetId) {
        setFocusedFolder(null);
      }

      setIsConfirmModalOpen(false);
      setCurrentAction(null);
      setTargetId(null);
    }
  };

  const handleUnfollowSender = () => {
    if (targetId) {
      console.log(`Unfollowing sender with ID: ${targetId}`);

      // Remove the sender from ordered items
      setOrderedItems((prev) =>
        prev.filter(
          (item) => !(item.type === "sender" && item.originalId === targetId)
        )
      );

      setIsConfirmModalOpen(false);
      setCurrentAction(null);
      setTargetId(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    if (active.id.toString().startsWith("sender-")) {
      const senderId = active.id.toString().replace("sender-", "");
      const sender = senders.find((s) => s.id === senderId);
      if (sender) {
        setActiveSender(sender);
      }
    } else if (active.id.toString().startsWith("folder-")) {
      const folderId = active.id.toString().replace("folder-", "");
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        setActiveFolder(folder);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveSender(null);
      setActiveFolder(null);
      return;
    }

    const activeItemId = active.id.toString();
    const overItemId = over.id.toString();

    // If item is being moved to a new position in the ordered list
    if (activeItemId !== overItemId) {
      setOrderedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === activeItemId);
        const newIndex = items.findIndex((item) => item.id === overItemId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = [...items];
          const [removed] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, removed);

          // Update order property
          return newItems.map((item, index) => ({
            ...item,
            order: index,
          }));
        }

        return items;
      });
    }

    // Special case: Moving a sender to a folder
    if (
      activeItemId.startsWith("sender-") &&
      overItemId.startsWith("folder-")
    ) {
      const senderId = activeItemId.replace("sender-", "");
      const folderId = overItemId.replace("folder-", "");
      const sender = senders.find((s) => s.id === senderId);

      if (sender) {
        console.log(`Moved ${sender.name} to folder ${folderId}`);
        addSenderToFolder(sender.id, folderId);

        // Remove sender from root items in ordered list
        setOrderedItems((prev) =>
          prev.filter((item) => item.id !== activeItemId)
        );

        // Force expand the folder
        setExpandedFolders((prev) => ({
          ...prev,
          [folderId]: true,
        }));

        // Focus the folder
        setFocusedFolder(folderId);
      }
    }

    // Clear drag state
    setTimeout(() => {
      setActiveId(null);
      setActiveSender(null);
      setActiveFolder(null);
    }, 50);
  };

  // Get senders for a specific folder
  const getSendersForFolder = (folderId: string) => {
    return senders.filter((sender) => sender.folder === folderId);
  };

  // Calculate total count for display
  const totalCount = senders.reduce(
    (total, sender) => total + (sender.count || 0),
    0
  );

  if (isFoldersLoading || isSendersLoading) {
    return (
      <div className="flex-1 bg-background text-foreground rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <div key={index} className="mb-3">
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Create sortable item IDs in the correct order
  const sortableIds = orderedItems.map((item) => item.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 bg-background text-foreground rounded-lg">
        <div className="px-4 w-[99%] p-xs pr-2 flex items-center justify-between sticky top-0 bg-background z-10">
          <h3 className="font-medium text-sm text-muted-foreground">Inbox</h3>
          <button
            className="p-xs text-muted-foreground hover:cursor-pointer hover:text-foreground rounded-full hover:bg-accent transition-colors"
            onClick={openFolderCreationModal}
          >
            <FolderPlusIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-md py-sm flex items-center justify-between bg-background hover:bg-accent rounded-md cursor-pointer">
          <div className="flex items-center space-x-md">
            <FolderIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">All</span>
          </div>
          <span className="text-xs text-muted-foreground">{totalCount}</span>
        </div>

        <div className="px-0 py-0">
          {/* Mixed Ordered Items (Folders and Senders) */}
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            {orderedItems.map((item) => {
              if (item.type === "folder") {
                const folder = folders.find((f) => f.id === item.originalId);
                if (!folder) return null;

                return (
                  <FolderComponent
                    key={folder.id}
                    folder={{
                      ...folder,
                      count: folder.senders ? folder.senders.length : 0, // Sum of senders
                    }}
                    expanded={expandedFolders[folder.id] || false}
                    toggleExpanded={toggleFolder}
                    senders={getSendersForFolder(folder.id)}
                    activeFolder={focusedFolder}
                    onRenameFolder={handleRenameFolder}
                    onDeleteFolder={(folderId) => {
                      setTargetId(folderId);
                      setCurrentAction("delete");
                      setIsConfirmModalOpen(true);
                    }}
                  />
                );
              } else if (item.type === "sender") {
                const sender = senders.find((s) => s.id === item.originalId);
                if (!sender) return null;

                return <Sender key={sender.id} sender={sender} />;
              }
              return null;
            })}
          </SortableContext>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 text-center text-xs text-muted-foreground">
          <p>Drag items to rearrange or move between folders</p>
          <p className="mt-1">All changes are automatically saved</p>
        </div>
      </div>

      {/* Folder Creation Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={async (folderName) => {
          await createFolder(folderName);

          // Add new folder to ordered items when created
          setOrderedItems((prev) => [
            ...prev,
            {
              id: `folder-${folders.length + 1}`, // Placeholder ID until actual ID is known
              type: "folder",
              originalId: (folders.length + 1).toString(), // Placeholder ID until actual ID is known
              order: prev.length,
            },
          ]);
        }}
        title="Create New Folder"
      />


      <DragOverlay>
        {activeId && activeSender && (
          <div className="px-md py-1.5 flex items-center justify-between rounded-md bg-secondary dark:bg-secondary text-foreground shadow-md">
            <div className="flex items-center space-x-3">
              <SenderIcon sender={activeSender} />
              <span className="text-sm">{activeSender.name}</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {activeSender.count >= 1000
                ? `${Math.floor(activeSender.count / 1000)}K+`
                : activeSender.count}
            </span>
          </div>
        )}

        {activeId && activeFolder && (
          <div className="px-md py-2 flex items-center justify-between rounded-md bg-secondary dark:bg-secondary text-foreground shadow-md">
            <div className="flex items-center space-x-3">
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{activeFolder.name}</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {activeFolder.count}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
