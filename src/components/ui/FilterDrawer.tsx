"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface FilterDrawerProps {
  activeCount: number;
  children: ReactNode;
  description: string;
  onClear: () => void;
  resultLabel: string;
  title: string;
}
export function FilterDrawer({
  activeCount,
  children,
  description,
  onClear,
  resultLabel,
  title,
}: FilterDrawerProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button type="button" variant="secondary" className="mt-4 w-full lg:hidden">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-institutional/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[80] max-h-[90dvh] overflow-y-auto rounded-t-panel bg-surface p-6 shadow-raised focus:outline-none sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[28rem] sm:rounded-none data-[state=open]:animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-h3 text-institutional">{title}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Close filters">
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="mt-8 space-y-4">{children}</div>
          <div className="sticky bottom-0 mt-8 flex gap-3 border-t border-border bg-surface pt-5">
            <Dialog.Close asChild>
              <Button type="button" className="flex-1">{resultLabel}</Button>
            </Dialog.Close>
            {activeCount > 0 && (
              <Button type="button" variant="secondary" onClick={onClear}>Clear all</Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
