import {
  Bookmark,
  CheckIcon,
  ChevronLeft,
  Share2,
  Volume2,
} from "lucide-react";
import { useMails } from "@/context/mailsContext";
import { useSenders } from "@/context/sendersContext";
import React from "react";
import {
  EnvelopeOpenIcon,
  EnvelopeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const MailReaderHeader = ({
  setSummaryDialogOpen,
  setTextToAudioOpen,
  onBack
}: {
  setSummaryDialogOpen: (open: boolean) => void;
  setTextToAudioOpen: (open: boolean) => void;
  onBack: () => void;
}) => {
  const { selectedMail, setSelectedMail, markAsRead, bookmark } = useMails();
  const { selectedSender } = useSenders();

  const handleBack = () => {
    if (window.innerWidth < 768 && onBack) {
      onBack();
    } else {
      // On desktop, close the mail
      setSelectedMail(null);
    }
  };

  return (
    selectedMail &&
    selectedSender && (
      <div className="sticky top-0 z-10 bg-content/95 h-header backdrop-blur-sm border-b border-border p-sm flex items-center justify-between gap-2">
        <button
          className="p-xs rounded-full hover:bg-muted transition-colors relative left-10 md:left-0"
          onClick={handleBack}
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            className="p-xs rounded-full hover:bg-muted transition-colors"
            onClick={() => setSummaryDialogOpen(true)}
            title="Summarize"
          >
            <SparklesIcon className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground" />
          </button>

          <button
            className="p-xs rounded-full hover:bg-muted transition-colors"
            onClick={() => setTextToAudioOpen(true)}
            title="Text to Audio"
          >
            <Volume2 className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground" />
          </button>

          <button
            className="p-xs rounded-full hover:bg-content/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(selectedMail.id, !selectedMail.read);
            }}
            title={selectedMail.read ? "Mark as unread" : "Mark as read"}
          >
            {!selectedMail.read ? (
              <CheckIcon className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground" />
            ) : (
              <CheckIcon className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground" />
            )}
          </button>

          <button
            className="p-xs rounded-full hover:bg-content/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              bookmark(selectedMail.id, !selectedMail.bookmarked);
              setSelectedMail({
                ...selectedMail,
                bookmarked: !selectedMail.bookmarked,
              });
            }}
            title={
              selectedMail.bookmarked ? "Remove Bookmark" : "Add Bookmark"
            }
          >
            <Bookmark
              fill={selectedMail?.bookmarked ? "currentColor" : "none"}
              className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground"
            />
          </button>



          <button
            className="p-xs rounded-full hover:bg-muted transition-colors"
            onClick={() => setSelectedMail(null)}
            title="Close"
          >
            <Share2 className="w-4 h-4 text-muted-foreground hover:bg-accent hover:text-foreground" />
          </button>
        </div>
      </div>
    )
  );
};

export default MailReaderHeader;
