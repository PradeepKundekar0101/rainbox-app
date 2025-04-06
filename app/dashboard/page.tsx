"use client";
import { Onboardingmodal } from "@/components/onboardingmodal";
import { useOnboarding } from "@/context/onboardingContext";
import { useMails } from "@/context/mailsContext";
import { useSenders } from "@/context/sendersContext";
import React, { useEffect, useState, useRef } from "react";
import { Mail } from "@/types/data";
import SelectSender from "@/components/select-sender";
import { MailItemSkeleton } from "@/components/mails-loader";
import { SenderHeader } from "@/components/sender/sender-header";
import { MailItem } from "@/components/mails/mail-item";
import MailReader from "@/components/mails/mail-reader";
import { useMode } from "@/context/modeContext";
import { InboxIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const { isOnboardingComplete } = useOnboarding();
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const { mails, selectedMail, isMailsLoading } = useMails();
  const { mode } = useMode();
  const { selectedSender } = useSenders();
  const [filteredMails, setFilteredMails] = useState<Mail[]>(mails);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [mailReaderWidth, setMailReaderWidth] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const isOnboardingCompletes = await isOnboardingComplete();
      if (!isOnboardingCompletes) {
        setShowOnboardingModal(true);
      }
    };
    checkOnboarding();
  }, [isOnboardingComplete]);

  useEffect(() => {
    setUnreadCount(mails.filter((mail) => !mail.read).length);
    const filteredMails = mails.filter((mail) => {
      if (filter === "all") return true;
      if (filter === "unread") return !mail.read;
      if (filter === "read") return mail.read;
    });
    setFilteredMails(filteredMails);
  }, [filter, mails]);

  return (
    <div
      className="w-full min-h-screen h-full flex bg-background"
      ref={containerRef}
    >
      {showOnboardingModal && <Onboardingmodal />}

      {selectedSender ? (
        <div
          className="flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden"
          style={{ width: selectedMail ? `${mailReaderWidth}%` : "100%" }}
        >
          <SenderHeader
            filter={filter}
            setFilter={setFilter}
            unreadCount={unreadCount}
          />

          <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ height: "calc(100vh - 64px)" }}>
            {isMailsLoading ? (
              <div className="flex flex-col">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <MailItemSkeleton key={i} />
                  ))}
              </div>
            ) : filteredMails.length > 0 ? (
              filteredMails.map((mail) => (
                <MailItem key={mail.id} mail={mail} />
              ))
            ) : (
              <div className="mt-50 flex flex-col items-center justify-center h-full py-12 space-y-4 text-muted-foreground">
                <div className="rounded-full bg-muted p-sm w-16 h-16 flex items-center justify-center">
                  <InboxIcon className="w-8 h-8" />
                </div>
                <p className="text-sm">No emails found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SelectSender />
      )}

      {selectedMail && (
        <MailReader
          containerRef={containerRef}
          mailReaderWidth={mailReaderWidth}
          setMailReaderWidth={setMailReaderWidth}
        />
      )}
    </div>
  );
};

export default Page;
