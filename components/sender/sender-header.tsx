import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMails } from "@/context/mailsContext";
import { XIcon, RefreshCcw, CheckIcon, MoreHorizontal } from "lucide-react";
import { useSenders } from "@/context/sendersContext";
export const SenderHeader = ({
  filter,
  setFilter,
  unreadCount,
}: {
  filter: string;
  setFilter: (filter: string) => void;
  unreadCount: number;
}) => {
  const {
    refreshMails,
    markAsReadAllBySenderId,
    selectedMail,
    setSelectedMail,
  } = useMails();
  const { selectedSender } = useSenders();
  return (
    <div className="flex flex-row items-center justify-between p-sm  h-header border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <h1 className="text-lg font-semibold pl-3">{selectedSender?.name}</h1>
      <div className="flex flex-row items-center gap-1">
        <Select onValueChange={setFilter} value={filter}>
          <SelectTrigger className="h-7 w-[140px] border-none bg-muted/50 text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="text-muted-foreground" value="all">All</SelectItem>
            <SelectItem className="text-muted-foreground" value="unread">Unread ({unreadCount})</SelectItem>
            <SelectItem className="text-muted-foreground" value="read">Read</SelectItem>
          </SelectContent>
        </Select>
        <button
          className="p-xs rounded-full hover:bg-muted transition-colors"
          onClick={() => {
            refreshMails();
          }}
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => markAsReadAllBySenderId(selectedSender?.id!)}
          className="p-xs rounded-full hover:bg-muted transition-colors"
        >
          <CheckIcon className="w-4 h-4" />
        </button>

        {selectedMail && (
          <button
            className="p-xs rounded-full hover:bg-muted transition-colors"
          // onClick={() => setSelectedMail(null)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
