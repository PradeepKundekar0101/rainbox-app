import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMails } from "@/context/mailsContext";
import { XIcon, RefreshCcw, CheckIcon, MoreHorizontal, Menu, X } from "lucide-react"; // Import Menu and X
import { useSenders } from "@/context/sendersContext";
import { SenderDropdownMenu } from "../sidebar/sender-dropdown-menu";
import { DeleteConfirmationModal } from "../modals/delete-modal";
import { EditSenderModal } from "../modals/edit-sender-modal";
import { useSidebar } from "@/context/sidebarContext";

export const SenderHeader = ({
  filter,
  setFilter,
  unreadCount,
}: {
  filter: string;
  setFilter: (filter: string) => void;
  unreadCount: number;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isMarkAsReadModalOpen, setIsMarkAsReadModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);

  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { refreshMails, markAsReadAllBySenderId } = useMails();



  const {
    selectedSender,
    renameSender,
    unsubcribeSender,
    toggleReadSender
  } = useSenders();

  // Handler functions for dropdown menu actions
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsMarkAsReadModalOpen(true);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsRenaming(true);
  };

  const handleMoveToFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsRenaming(true);
  };

  const handleMuteNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    console.log(`Muted notifications for ${selectedSender?.name}`);
  };

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsUnfollowModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-row items-center justify-between p-sm h-header border-b border-border sticky top-0 bg-content/95 backdrop-blur-sm z-10">
        <div className="flex items-center flex-1 min-w-0">
          <button
            // 4. THE ONCLICK AND STATE NOW COME DIRECTLY FROM THE CONTEXT
            onClick={toggleSidebar}
            className="p-1 rounded-full mr-2 md:hidden"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          <h1
            className={`font-semibold ml-1 text-md truncate ${selectedSender?.isRead ? "text-primary" : "text-muted-foreground"}`}
          >
            {selectedSender ? selectedSender.name : "All Mails"}
          </h1>
        </div>

        <div className="flex flex-row items-center gap-1 flex-shrink-0">
          <Select onValueChange={setFilter} value={filter}>
            <SelectTrigger className="h-6 w-[110px] md:w-[140px] border-none bg-muted text-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="text-muted-foreground" value="all">All</SelectItem>
              <SelectItem className="text-muted-foreground" value="unread">Unread ({unreadCount})</SelectItem>
              <SelectItem className="text-muted-foreground" value="bookmarked">Bookmarked</SelectItem>
            </SelectContent>
          </Select>
          <button
            className="p-xs rounded-full hover:bg-muted transition-colors"
            onClick={() => {
              refreshMails();
            }}
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground" />
          </button>

          {selectedSender && (
            <>
              <button
                onClick={() => markAsReadAllBySenderId(selectedSender.id)}
                className="p-xs rounded-full hover:bg-muted transition-colors"
                title="Mark all as read"
              >
                <CheckIcon className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground" />
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="p-xs rounded-full hover:bg-muted transition-colors"
                  title="More actions"
                >
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground" />
                </button>

                <SenderDropdownMenu
                  sender={selectedSender}
                  isOpen={menuOpen}
                  onClose={() => setMenuOpen(false)}
                  onMarkAsRead={handleMarkAsRead}
                  onRename={handleRename}
                  onMoveToFolder={handleMoveToFolder}
                  onMuteNotifications={handleMuteNotifications}
                  onUnfollow={handleUnfollow}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {selectedSender && (
        <>
          {/* Unfollow Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isUnfollowModalOpen}
            onClose={() => setIsUnfollowModalOpen(false)}
            onConfirm={async () => {
              if (selectedSender) {
                await unsubcribeSender(selectedSender.id);
                setIsUnfollowModalOpen(false);
              }
            }}
            itemName={selectedSender.name}
            itemType="sender"
          />

          {/* Mark as Read Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isMarkAsReadModalOpen}
            onClose={() => setIsMarkAsReadModalOpen(false)}
            onConfirm={async () => {
              if (selectedSender) {
                await toggleReadSender(selectedSender.id, !selectedSender.isRead);
                setIsMarkAsReadModalOpen(false);
              }
            }}
            itemName={selectedSender.name}
            itemType={selectedSender.isRead ? "markasunread" : "markasread"}
          />

          {/* Edit Sender Modal */}
          <EditSenderModal
            isOpen={isRenaming}
            onClose={() => setIsRenaming(false)}
            onSave={async (newName: string) => {
              if (selectedSender) {
                await renameSender(selectedSender.id, newName);
                setIsRenaming(false);
              }
            }}
            initialValues={{
              source: selectedSender.domain || "",
              title: selectedSender.name,
              folder: "No Folder"
            }}
          />
        </>
      )}
    </>
  );
};