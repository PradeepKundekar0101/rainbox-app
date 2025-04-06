import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  itemType: 'folder' | 'sender' | 'markasread' | 'markasunread';
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!isOpen) return null;

  // Define modal content based on itemType
  const getModalContent = () => {
    switch (itemType) {
      case 'folder':
        return {
          title: "Delete Folder",
          description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
          confirmText: "Delete Folder",
          confirmClass: "bg-destructive text-destructive-foreground hover:bg-destructive/80"
        };
      case 'sender':
        return {
          title: "Unfollow Sender",
          description: `Are you sure you want to unfollow "${itemName}"? This action cannot be undone.`,
          confirmText: "Unfollow Sender",
          confirmClass: "bg-destructive text-destructive-foreground hover:bg-destructive/80"
        };
      case 'markasread':
        return {
          title: "Mark as Read",
          description: `Are you sure you want to mark all emails in "${itemName}" as read?`,
          confirmText: "Mark as Read",
          confirmClass: "bg-primary text-primary-foreground hover:bg-primary/80"
        };
      case 'markasunread':
        return {
          title: "Mark as Unread",
          description: `Are you sure you want to mark all emails in "${itemName}" as unread?`,
          confirmText: "Mark as Unread",
          confirmClass: "bg-primary text-primary-foreground hover:bg-primary/80"
        };
      default:
        return {
          title: "Confirm Action",
          description: `Are you sure you want to proceed with this action?`,
          confirmText: "Confirm",
          confirmClass: "bg-destructive text-destructive-foreground hover:bg-destructive/80"
        };
    }
  };

  const { title, description, confirmText, confirmClass } = getModalContent();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error confirming action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card dark:bg-card rounded-lg shadow-xl w-full max-w-sm mx-4 border border-gray-100/80"
        >
          <div className="p-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-secondary-foreground"
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm mb-4">{description}</p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-muted-foreground hover:bg-accent rounded-md transition-colors text-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 ${confirmClass} rounded-md transition-colors text-sm relative`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="opacity-0">{confirmText}</span>
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <ArrowPathIcon className="animate-spin h-4 w-4 text-sm" />
                    </span>
                  </>
                ) : confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};