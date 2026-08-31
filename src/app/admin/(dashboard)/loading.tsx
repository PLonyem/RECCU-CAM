import { Loader2 } from "lucide-react";

// Shown instantly while a page segment's own server work (data fetching,
// the client bundle's first paint) resolves — without this, clicking a
// sidebar link showed nothing at all until the whole round trip finished,
// which read as the app being slow to respond.
export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-24 text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
