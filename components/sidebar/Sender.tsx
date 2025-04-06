import { SenderType } from "@/types/data";
import { useSortable } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { CSS } from "@dnd-kit/utilities";
import { SenderIcon } from "./SenderIcon";
import { useState, useRef, useEffect } from "react";
import {
  BellSlashIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { DeleteConfirmationModal } from "./DeleteModal";
import { Modal } from "./Modal";
import { useSenders } from "@/context/sendersContext";

interface SenderProps {
  sender: SenderType;
  onRenameSender?: (senderId: string, newName: string) => void;
}

export default function Sender({ sender, onRenameSender }: SenderProps) {
  const { renameSender, unsubcribeSender, toggleReadSender } = useSenders();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isMarkAsReadModalOpen, setIsMarkAsReadModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setSelectedSender } = useSenders();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `sender-${sender.id}`,
    data: {
      type: "sender",
      sender,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsRenaming(true);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsMarkAsReadModalOpen(true);
  };

  const handleMoveToFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    // Add your move to folder logic here
    console.log(`Move ${sender.name} to folder`);
  };

  const handleMuteNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    // Add your mute notifications logic here
    console.log(`Muted notifications for ${sender.name}`);
  };

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsUnfollowModalOpen(true);
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group p-xs px-md flex items-center justify-between rounded-md cursor-grab 
    ${isDragging
            ? "bg-secondary/30 dark:bg-secondary/50 text-foreground dark:text-foreground shadow-sm z-10"
            : "hover:bg-accent"
          }`}
      >
        <div
          className="flex items-center space-x-md overflow-hidden flex-1"
          onClick={() => {
            setSelectedSender(sender);
            console.log(sender);
          }}
        >
          <SenderIcon sender={sender} />
          <span className="text-sm text-foreground truncate overflow-hidden mr-2">
            {sender.name}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleMenuClick}
              className="p-xs text-muted-foreground hover:cursor-pointer rounded-full transition-all duration-350 ease-in-out opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground"
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
                    <span className="text-sm">
                      {sender.isRead ? "Mark as unread" : "Mark as read"}
                    </span>
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
                    onClick={handleMoveToFolder}
                  >
                    <FolderIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Move to folder</span>
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
                    onClick={handleUnfollow}
                  >
                    <TrashIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Unfollow</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-xs text-muted-foreground font-medium">
            {sender.count >= 1000
              ? `${Math.floor(sender.count / 1000)}K+`
              : sender.count}
          </span>
        </div>
      </motion.div>

      {/* Unfollow Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isUnfollowModalOpen}
        onClose={() => setIsUnfollowModalOpen(false)}
        onConfirm={async () => {
          await unsubcribeSender(sender.id);
          setIsUnfollowModalOpen(false);
        }}
        itemName={sender.name}
        itemType="sender"
      />

      {/* Mark as Read Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isMarkAsReadModalOpen}
        onClose={() => setIsMarkAsReadModalOpen(false)}
        onConfirm={async () => {
          await toggleReadSender(sender.id, !sender.isRead);
          setIsMarkAsReadModalOpen(false);
        }}
        itemName={sender.name}
        itemType={sender.isRead ? "markasunread" : "markasread"}
      />

      {/* Rename Modal */}
      <Modal
        isOpen={isRenaming}
        onClose={() => setIsRenaming(false)}
        onSave={async (newName) => {
          await renameSender(sender.id, newName);
        }}
        initialValue={sender.name}
        title="Rename Sender"
      />
    </>
  );
}
