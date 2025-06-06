// hooks/useSidebarDnd.ts

import { useState } from "react";
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useSidebarLayout, SidebarItem } from "@/context/sidebarLayoutContext";

export const useSidebarDnd = () => {
  const {
    moveItemInRoot,
    moveSenderWithinFolder,
    moveSenderToFolder,
    moveSenderToRoot,
  } = useSidebarLayout();

  const [activeItem, setActiveItem] = useState<SidebarItem | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveItem(active.data.current?.item ?? null);
  };

  /**
   * This function now has one simple job:
   * Detect if a sender is being dragged DIRECTLY over a folder component.
   * If so, set the targetFolderId to give visual feedback (e.g., a border).
   * If not, clear the target.
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeItem = active.data.current?.item;
    const overItem = over?.data.current?.item;

    // We only care about a sender being dragged.
    if (activeItem?.type !== 'sender') {
      setTargetFolderId(null);
      return;
    }

    // If we are directly over a folder component, it's a potential drop-in target.
    if (overItem?.type === 'folder') {
      // Prevent dropping a sender into the folder it's already in.
      // The containerId for a sender inside a folder is the folder's original ID.
      const isAlreadyInFolder = active.data.current?.containerId === overItem.id;
      if (!isAlreadyInFolder) {
        setTargetFolderId(over?.id as string);
      }
    } else {
      // If we are over anything else (another sender, the root space),
      // it's a reorder action, so we clear the drop-in target.
      setTargetFolderId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If the drop is invalid or nothing moved, reset and exit.
    if (!over) {
        resetState();
        return;
    }
    
    // Don't do anything if we drop on the same spot.
    // Check this *after* the targetFolderId logic.
    const isDroppingInFolder = !!targetFolderId;
    if (!isDroppingInFolder && active.id === over.id) {
        resetState();
        return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = active.data.current?.containerId;
    const overContainer = over.data.current?.containerId;
    const activeType = active.data.current?.item?.type;

    // --- Main Logic Branches ---

    // CASE 1: Dropping a sender INTO a folder (highest priority).
    // This is triggered if handleDragOver set a targetFolderId.
    if (isDroppingInFolder && activeType === 'sender') {
      const sourceContainer = activeContainer || 'root';
      const targetFolderOriginalId = targetFolderId.replace('folder-', '');
      moveSenderToFolder(activeId, sourceContainer, targetFolderOriginalId);
      resetState();
      return;
    }
    
    // If not dropping in, proceed with reordering logic.

    // CASE 2: Reordering items within the SAME container (root or a folder).
    if (activeContainer === overContainer) {
        if (activeContainer === 'root') {
            moveItemInRoot(activeId, overId);
        } else {
            // This handles reordering senders inside a folder.
            moveSenderWithinFolder(activeContainer, activeId, overId);
        }
    } else { 
        // CASE 3: Moving a sender BETWEEN containers.
        if(activeType === 'sender') {
            const sourceContainer = activeContainer;
            const senderId = activeId;
            
            // From a folder TO the root list.
            if (overContainer === 'root') {
                const overIndex = over.data.current?.sortable.index ?? 0;
                moveSenderToRoot(senderId, sourceContainer, overIndex);
            }
            // From one folder TO another folder.
            // This happens when you drop a sender from Folder A onto a sender in Folder B.
            else if (overContainer !== 'root' && sourceContainer !== overContainer) {
                 moveSenderToFolder(senderId, sourceContainer, overContainer);
            }
        }
    }
    
    resetState();
  };
  
  const resetState = () => {
      setActiveItem(null);
      setTargetFolderId(null);
  };

  return {
    sensors,
    activeItem,
    targetFolderId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};