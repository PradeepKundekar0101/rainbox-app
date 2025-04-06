import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => Promise<void> | void;
  initialValue?: string;
  title: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValue = '',
  title
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialValue]);

  const handleSave = async () => {
    if (value.trim()) {
      setIsLoading(true);
      try {
        await onSave(value.trim());
        onClose();
      } catch (error) {
        console.error("Error saving:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

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

            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Folder Name"
              className="w-full p-sm border border-border dark:border-border rounded-md 
                         bg-background dark:bg-background 
                         focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) handleSave();
                if (e.key === 'Escape' && !isLoading) onClose();
              }}
              disabled={isLoading}
            />

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-muted-foreground hover:bg-accent rounded-md transition-colors text-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-md transition-colors text-sm relative"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="opacity-0">Done</span>
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <ArrowPathIcon className="animate-spin h-4 w-4 text-sm" />
                    </span>
                  </>
                ) : "Done"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};