import { MessagesInbox } from "@/components/admin/MessagesInbox";
import { PRIMARY_MESSAGE_FOLDERS, type MessageFolder } from "@/lib/message-inbox";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ folder?: string; message?: string }> }) {
  const params = await searchParams;
  const folder = PRIMARY_MESSAGE_FOLDERS.includes(params.folder as (typeof PRIMARY_MESSAGE_FOLDERS)[number])
    ? params.folder as MessageFolder
    : "inbox";
  return <MessagesInbox initialFolder={folder} initialMessageId={params.message} />;
}
