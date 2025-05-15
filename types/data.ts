export interface User {
  id: string;
  email: string;
  avatar_url?: string;
  user_name?: string;
  plan: "free" | "pro" | "enterprise";
  usedFeeds: number;
  totalFeeds: number;
}
export interface SenderType {
  id: string;
  name: string;
  email: string;
  domain?: string;
  user_id: string;
  created_at: string;
  folder_id?: string;
  icon?: string;
  count: number;
  folder?: string;
  order?: number;
  isRead?: boolean;
}
export interface FolderType {
  id: string;
  name: string;
  user_id?: string;
  created_at?: string;
  count: number;
  isExpanded?: boolean;
  senders?: SenderType[];
  order?: number;
  isRead?: boolean;
}
export interface Mail {
  id: string;
  user_id: string;
  sender_id: string;
  created_at: string;
  subject: string;
  body: string;
  read: boolean;
  bookmarked: boolean;
}
export interface Feed {
  id: string;
  name: string;
  icon?: string;
  count: number;
  category?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  isExpanded: boolean;
}

export interface User {
  email: string;
  plan: "free" | "pro" | "enterprise";
  usedFeeds: number;
  totalFeeds: number;
}

export interface EmailData {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  body: string;
}

export interface AddSenderRequest {
  name: string;
  email: string;
  domain?: string;
  folder_id?: string;
  order?: number;
  subscribed?: boolean;
  count?: number;
}
