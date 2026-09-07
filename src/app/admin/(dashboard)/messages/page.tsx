import { MessagesInbox } from "@/components/admin/MessagesInbox";
import { MESSAGE_FOLDERS, type MessageFolder } from "@/lib/message-inbox";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ folder?: string; message?: string }> }) {
  const params = await searchParams;
  const folder = MESSAGE_FOLDERS.includes(params.folder as MessageFolder) ? params.folder as MessageFolder : "inbox";
  return <MessagesInbox initialFolder={folder} initialMessageId={params.message} />;
}
