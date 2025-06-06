import { SenderType } from "@/types/data";
import { useSortable } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { CSS } from "@dnd-kit/utilities";
import { SenderIcon } from "./sender-icon";
import { useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { DeleteConfirmationModal } from "../modals/delete-modal";
import { useSenders } from "@/context/sendersContext";
import { EditSenderModal } from "../modals/edit-sender-modal";
import { SenderDropdownMenu } from "./sender-dropdown-menu";

interface SenderProps {
  sender: SenderType;
  containerId: string;
}

export default function Sender({ sender, containerId }: SenderProps) {
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
      item: sender,
      containerId: containerId,
    },
  });

  const { renameSender, unsubcribeSender, toggleReadSender } = useSenders();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isMarkAsReadModalOpen, setIsMarkAsReadModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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
    setIsRenaming(true);
    console.log('move to folder')
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
        className={`group p-xs px-md flex items-center justify-between rounded-md cursor-grab hover:bg-accent`}
        whileTap={{ scale: 0.98, cursor: 'grabbing' }}
      >
        <div
          className="flex items-center space-x-md overflow-hidden flex-1"
          onClick={() => setSelectedSender(sender)}
        >
          <SenderIcon sender={sender} />
          <span className="text-sm font-medium truncate">{sender.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-xs text-muted-foreground hover:cursor-pointer rounded-full transition-all duration-350 ease-in-out opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground"
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>

            <SenderDropdownMenu
              sender={sender}
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onMarkAsRead={handleMarkAsRead}
              onRename={handleRename}
              onMoveToFolder={handleMoveToFolder}
              onMuteNotifications={handleMuteNotifications}
              onUnfollow={handleUnfollow}
            />
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

      {/* Edit Sender Modal */}
      <EditSenderModal
        isOpen={isRenaming}
        onClose={() => setIsRenaming(false)}
        onSave={async (newName: string) => {
          await renameSender(sender.id, newName);
          setIsRenaming(false);
        }}
        initialValues={{
          source: sender.domain || "",
          title: sender.name,
          folder: "No Folder"
        }}
      />



    </>
  );
}