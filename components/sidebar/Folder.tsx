import { FolderType, SenderType } from "@/types/data";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from 'framer-motion';
import { CSS } from '@dnd-kit/utilities';
import { BellSlashIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, EllipsisHorizontalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Sender from "./Sender";
import { Modal } from "./Modal";
import { useState, useRef, useEffect } from 'react';
import { DeleteConfirmationModal } from "./DeleteModal";
import { useFolders } from "@/context/foldersContext";
import { useSenders } from "@/context/sendersContext";

interface FolderProps {
  folder: FolderType;
  expanded: boolean;
  toggleExpanded: (id: string) => void;
  activeFolder: string | null;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMarkFolderAsRead?: (folderId: string) => void;
  senders: SenderType[]
}

export default function Folder({
  folder,
  expanded,
  toggleExpanded,
  activeFolder,
  onRenameFolder,
  onDeleteFolder,
  onMarkFolderAsRead,
  senders
}: FolderProps) {
  const { deleteFolder, renameFolder, getSenders, toggleReadFolder } = useFolders();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenamingModalOpen, setIsRenamingModalOpen] = useState(false);
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [isMarkAsReadModalOpen, setIsMarkAsReadModalOpen] = useState(false);
  const [folderSenders, setFolderSenders] = useState<SenderType[]>([]);
  const [isLoadingSenders, setIsLoadingSenders] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      type: 'folder',
      folder
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Fetch senders when folder is expanded
  useEffect(() => {
    if (expanded) {
      const fetchFolderSenders = async () => {
        setIsLoadingSenders(true);
        try {
          const data = await getSenders(folder.id);
          if (data) {
            setFolderSenders(data);
          }
        } catch (error) {
          console.error("Error fetching senders for folder:", error);
        } finally {
          setIsLoadingSenders(false);
        }
      };

      fetchFolderSenders();
    }
  }, [expanded]);

  const senderIds = folderSenders.map(sender => `sender-${sender.id}`);
  const isFolderActive = activeFolder === folder.id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsRenamingModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsDeletingModalOpen(true);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsMarkAsReadModalOpen(true);
  };

  const handleMuteNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    // Add your mute notifications logic here
    console.log(`Muted notifications for ${folder.name}`);
  };

  const confirmMarkAsRead = () => {
    // Toggle the current isRead status
    toggleReadFolder(folder.id, !folder.isRead);
    setIsMarkAsReadModalOpen(false);
  };

  // Skeleton loader component for senders
  const SkeletonLoader = () => (
    <div className="space-y-2 ml-10 mt-2">
      {[1, 2].map((index) => (
        <div key={index} className="flex items-center animate-pulse">
          <div className="w-6 h-6 rounded-md bg-secondary mr-2"></div>
          <div className="h-6 bg-secondary rounded-md w-full"></div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div ref={setNodeRef} style={style} className={`mb-0 ${isDragging ? 'z-10' : ''}`}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleExpanded(folder.id)}
          className={`group px-md p-xs flex items-center justify-between rounded-md transition-colors cursor-pointer
    ${isFolderActive
              ? 'bg-primary/10 text-primary'
              : isDragging
                ? 'bg-secondary'
                : 'hover:bg-accent'}`}
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center space-x-md flex-grow">
            <div className="flex-shrink-0">
              {expanded ? (
                <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            <span className="text-sm font-medium truncate overflow-hidden overflow-ellipsis w-0 flex-1 mr-2 text-foreground">
              {folder.name}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative group" ref={menuRef}>
              <button
                onClick={handleMenuClick}
                className="p-xs hover:cursor-pointer text-muted-foreground rounded-full transition-all duration-350 ease-in-out opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground"
              >
                <EllipsisHorizontalIcon className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-8 w-48 bg-popover text-popover-foreground rounded-md shadow-lg py-1 z-20 border border-border"
                  >
                    <button
                      className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-secondary transition-all duration-300 ease-in-out hover:cursor-pointer"
                      onClick={handleMarkAsRead}
                    >
                      <CheckIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{folder.isRead ? "Mark as unread" : "Mark as read"}</span>
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-secondary transition-all duration-300 ease-in-out hover:cursor-pointer"
                      onClick={handleMuteNotifications}
                    >
                      <BellSlashIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Mute notifications</span>
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-secondary transition-all duration-300 ease-in-out hover:cursor-pointer"
                      onClick={handleRename}
                    >
                      <PencilIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Rename</span>
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-secondary transition-all duration-300 ease-in-out hover:cursor-pointer"
                      onClick={handleDelete}
                    >
                      <TrashIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {folder.senders?.length
                ? folder.senders.length >= 1000
                  ? `${Math.floor(folder.senders.length / 1000)}K+`
                  : folder.senders.length
                : 0}
            </span>
          </div>
        </motion.div>

        {/* Show skeleton loader or senders for this folder with animation */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {isLoadingSenders ? (
                <SkeletonLoader />
              ) : folderSenders.length > 0 ? (
                <div className="ml-6 mt-1.25 space-y-md-1.25">
                  <SortableContext items={senderIds} strategy={verticalListSortingStrategy}>
                    {folderSenders.map((sender) => (
                      <Sender key={sender.id} sender={sender} />
                    ))}
                  </SortableContext>
                </div>
              ) : (
                <div className="ml-10 m-md text-sm text-muted-foreground">
                  No senders in this folder
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={isRenamingModalOpen}
        onClose={() => setIsRenamingModalOpen(false)}
        onSave={async (newName) => {
          await renameFolder(folder.id, newName);
        }}
        initialValue={folder.name}
        title="Rename Folder"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeletingModalOpen}
        onClose={() => setIsDeletingModalOpen(false)}
        onConfirm={async () => {
          await deleteFolder(folder.id);
          setIsDeletingModalOpen(false);
        }}
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