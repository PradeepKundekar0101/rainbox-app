// components/inbox/Folder.tsx

import React, { useState, useRef, useEffect } from "react";
import { FolderType, SenderType } from "@/types/data";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { CSS } from "@dnd-kit/utilities";
import {
  BellSlashIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon,
  EllipsisHorizontalIcon, PencilIcon, TrashIcon,
} from "@heroicons/react/24/outline";
import Sender from "./sender";
import { BasicModal } from "../modals/basic-modal";
import { DeleteConfirmationModal } from "../modals/delete-modal";
import { useFolders } from "@/context/foldersContext";
import { useSidebarLayout } from "@/context/sidebarLayoutContext";
import { SenderDropdownMenu } from "./sender-dropdown-menu";
import { useSenders } from "@/context/sendersContext";

interface FolderProps {
  folder: FolderType;
  isTargetForDrop: boolean;
}

export default function FolderComponent({ folder, isTargetForDrop }: FolderProps) {
  const { deleteFolder, renameFolder, toggleReadFolder } = useFolders();
  const { getOrderedSendersForFolder, toggleFolderExpansion, expandedFolders } = useSidebarLayout();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMarkAsReadModalOpen, setIsMarkAsReadModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const expanded = !!expandedFolders[folder.id];
  const folderSenders = getOrderedSendersForFolder(folder.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `folder-${folder.id}`,
    data: {
      type: "folder",
      item: folder,
      containerId: "root",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: `transform 0.2s ease, opacity 0.2s ease`,
    opacity: isDragging ? 0.5 : 1,
    border: isTargetForDrop ? "2px dashed var(--primary)" : "2px dashed transparent",
    borderRadius: '0.375rem',
    margin: isTargetForDrop ? '2px' : '4px' // Adjust margin to compensate for border
  };

  const senderIds = folderSenders.map((sender) => `sender-${sender.id}`);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={setNodeRef} style={style} className={`transition-all duration-150`}>
        <div
          onClick={() => toggleFolderExpansion(folder.id)}
          className={`group p-xs flex items-center justify-between rounded-md transition-colors cursor-pointer hover:bg-accent`}
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center space-x-md flex-grow min-w-0">
            {expanded ? <ChevronDownIcon className="w-4 h-4 text-muted-foreground" /> : <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-medium truncate">{folder.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground font-medium">{folderSenders.length}</span>
            <div className="relative">
              <button
                className="p-xs text-muted-foreground hover:cursor-pointer rounded-full transition-all duration-350 ease-in-out opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground"
              >
                <EllipsisHorizontalIcon className="w-4 h-4" />
              </button>

            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="pl-6 pt-1 space-y-1"
            >
              <SortableContext items={senderIds} strategy={verticalListSortingStrategy}>
                {folderSenders.map((sender) => (
                  <Sender key={sender.id} sender={sender} containerId={folder.id} />
                ))}
              </SortableContext>
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      {/* Rename Modal */}
      <BasicModal
        isOpen={isRenaming}
        onClose={() => setIsRenaming(false)}
        onSave={async (newName) => {
          await renameFolder(folder.id, newName);
        }}
        initialValue={folder.name}
        title="Rename Folder"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={async () => {
          await deleteFolder(folder.id);
          setMenuOpen(false);
        }}
        showUnfollowOption={true}
        itemName={folder.name}
        itemType="folder"
      />

      {/* Mark as Read Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isMarkAsReadModalOpen}
        onClose={() => setIsMarkAsReadModalOpen(false)}
        onConfirm={async () => {
          await toggleReadFolder(folder.id, !folder.isRead);
        }}
        itemName={folder.name}
        itemType={folder.isRead ? "markasunread" : "markasread"}
      />
    </>
  );
}
