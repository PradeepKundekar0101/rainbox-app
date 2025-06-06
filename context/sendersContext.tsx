// context/sendersContext.tsx

"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactNode
} from "react";
import { SenderType } from "@/types/data";
import { createClient } from "@/utils/supabase/client";
import { useAxios } from "@/hooks/useAxios";

interface SendersContextType {
  senders: SenderType[];
  isSendersLoading: boolean;
  sendersListError: string | null;
  unsubcribeSender: (id: string) => Promise<void>;
  renameSender: (id: string, name: string) => Promise<void>;
  toggleReadSender: (senderId: string, isRead: boolean) => Promise<void>;
  updateSenderBackend: (senderId: string, data: Partial<SenderType>) => Promise<void>;
  fetchSenders: () => Promise<void>;
  selectedSender: SenderType | null;
  setSelectedSender: (sender: SenderType | null) => void;
}

const SendersContext = createContext<SendersContextType | null>(null);

export const SendersProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [selectedSender, setSelectedSender] = useState<SenderType | null>(null);
  const [senders, setSenders] = useState<SenderType[]>([]);
  const [isSendersLoading, setIsSendersLoading] = useState(true);
  const [sendersListError, setSendersListError] = useState<string | null>(null);
  const api = useAxios();

  const fetchSenders = useCallback(async () => {
    setIsSendersLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSendersLoading(false);
        return;
      };
      const { data } = await api.get(`/senders/user/${user.id}`);
      setSenders(data.map((s: SenderType) => ({ ...s, type: 'sender' })));
    } catch (error) {
      setSendersListError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSendersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSenders();
  }, [fetchSenders]);

  const updateSenderBackend = useCallback(async (senderId: string, data: Partial<SenderType>) => {
    try {
      await api.patch(`/senders/${senderId}`, data);
    } catch (error) {
      console.error(`Failed to update sender ${senderId}:`, error);
    }
  }, [api]);

  const unsubcribeSender = useCallback(async (id: string) => {
    await updateSenderBackend(id, { subscribed: false });
    setSenders((prev) => prev.filter((sender) => sender.id !== id));
  }, [updateSenderBackend]);

  const renameSender = useCallback(async (id: string, name: string) => {
    await updateSenderBackend(id, { name });
    setSenders((prev) => prev.map(s => s.id === id ? { ...s, name } : s));
  }, [updateSenderBackend]);

  const toggleReadSender = useCallback(async (senderId: string, isRead: boolean) => {
    await updateSenderBackend(senderId, { isRead });
    setSenders((prev) => prev.map(s => s.id === senderId ? { ...s, isRead } : s));
  }, [updateSenderBackend]);

  return (
    <SendersContext.Provider
      value={{
        senders,
        isSendersLoading,
        sendersListError,
        unsubcribeSender,
        renameSender,
        toggleReadSender,
        updateSenderBackend,
        fetchSenders,
        selectedSender,
        setSelectedSender,
      }}
    >
      {children}
    </SendersContext.Provider>
  );
};

export const useSenders = () => {
  const context = useContext(SendersContext);
  if (!context) {
    throw new Error("useSenders must be used within an SendersProvider");
  }
  return context;
};