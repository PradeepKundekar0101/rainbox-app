import { cn } from "@/lib/utils";
import { Mail } from "@/types/data";
import { useMails } from "@/context/mailsContext";
import { useSenders } from "@/context/sendersContext";
import React from "react";
import { EnvelopeIcon, EnvelopeOpenIcon } from "@heroicons/react/24/outline";

import { Bookmark, CheckIcon, MoreHorizontal } from "lucide-react";
import moment from "moment";
export const MailItem = ({ mail }: { mail: Mail }) => {
  const { selectedMail, setSelectedMail, markAsRead, bookmark } = useMails();
  const { selectedSender } = useSenders();
  return (
    <div
      key={mail.id}
      onClick={async () => {
        setSelectedMail(mail);
        if (!mail.read) {
          await markAsRead(mail.id, true);
        }
      }}
      className={cn(
        "flex flex-col border-b right-[-3px]  border-border p-sm px-md cursor-pointer hover:bg-muted/30 transition-all duration-200 relative group",
        selectedMail?.id === mail.id && "bg-muted/50"
      )}
    >
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-4 flex  z-10">
        <button
          className="p-xs rounded-full hover:bg-background/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            markAsRead(mail.id, !mail.read);
          }}
          title={mail.read ? "Mark as unread" : "Mark as read"}
        >
          {!mail.read ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <CheckIcon className="w-4 h-4" />
          )}
        </button>

        <button
          className="p-xs rounded-full hover:bg-background/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            bookmark(mail.id, !mail.bookmarked);
          }}
        >
          <Bookmark
            fill={mail.bookmarked ? "currentColor" : "none"}
            className="w-4 h-4"
          />
        </button>
        <button
          className="p-xs rounded-full hover:bg-background/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="pr-12">
        <h2
          className={cn(
            "line-clamp-2 mb-1 text-md min-h-[2.5rem]",
            mail.read ? "text-muted-foreground" : "font-medium"
          )}
        >
          {mail.subject}
        </h2>
        <div
          className={cn(
            "flex flex-row items-center text-sm",
            mail.read && "text-muted-foreground"
          )}
        >
          <img
            src={
              selectedSender?.domain === "gmail.com"
                ? "/logos/gmail.webp"
                : `https://www.google.com/s2/favicons?domain=${selectedSender?.domain}&sz=128`
            }
            alt={mail.subject}
            className="w-4 h-4 object-cover mr-2"
          />
          <span className="mr-2">{selectedSender?.name}</span>
          <span className="text-xs text-muted-foreground">
            {moment(mail.created_at).fromNow()}
          </span>
        </div>
      </div>
    </div>
  );
};
