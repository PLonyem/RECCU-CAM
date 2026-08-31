"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";

interface RejectDialogProps {
  open: boolean;
  creditUnionName: string | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: string) => void;
}

export function RejectDialog({
  open,
  creditUnionName,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: RejectDialogProps) {
  const [note, setNote] = useState("");

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote("");
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Reject profile?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-500">
            {creditUnionName ? `"${creditUnionName}" ` : "This credit union's "}
            profile will stay hidden from the public site. You can optionally
            leave a note explaining why, for whoever follows up with the credit union.
          </Dialog.Description>

          <label htmlFor="reject-note" className="sr-only">
            Rejection note
          </label>
          <textarea
            id="reject-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (e.g. missing address, unclear scan)…"
            disabled={isSubmitting}
            className="mt-4 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
          />

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
              onClick={() => onConfirm(note)}
            >
              {isSubmitting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
