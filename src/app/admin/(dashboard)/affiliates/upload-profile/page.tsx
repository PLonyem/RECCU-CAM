"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileUp,
  Loader2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ChapterCombobox, type ChapterOption } from "@/components/admin/ChapterCombobox";
import { ManualEntryForm } from "./ManualEntryForm";
import type { ExtractedChapterFields } from "@/lib/chapter-profile-extraction";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

export default function UploadCreditUnionProfilePage() {
  const [chapters, setChapters] = useState<ChapterOption[]>([]);
  const [chaptersError, setChaptersError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterOption | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const [extractedFields, setExtractedFields] = useState<ExtractedChapterFields | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  const [successChapter, setSuccessChapter] = useState<ChapterOption | null>(null);

  useEffect(() => {
    fetch("/api/admin/affiliates?limit=1000")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load chapters");
        return res.json();
      })
      .then((data) => setChapters(data.affiliates ?? []))
      .catch(() => setChaptersError("Could not load the list of credit unions. Please refresh the page."));
  }, []);

  function selectChapter(chapter: ChapterOption) {
    setSelectedChapter(chapter);
    setFile(null);
    setFileError(null);
    setUploadNotice(null);
    setExtractedFields(null);
    setIsManualEntryOpen(false);
    setSuccessChapter(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFileError(null);
    setUploadNotice(null);

    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("File is too large. Maximum size is 10MB.");
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleUpload() {
    if (!selectedChapter || !file) return;

    setIsUploading(true);
    setFileError(null);
    setUploadNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chapterCode", selectedChapter.code);

      const res = await fetch("/api/admin/affiliates/upload-profile", {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setFileError(body?.error ?? "Upload failed. Please try again.");
        return;
      }

      if (body.extractedFields && Object.keys(body.extractedFields).length > 0) {
        setExtractedFields(body.extractedFields);
        setUploadNotice(
          "File uploaded and some fields were pre-filled below. Please review and correct them before submitting."
        );
      } else {
        setExtractedFields(null);
        setUploadNotice(
          "File uploaded successfully. We couldn't automatically read its contents, so please fill in the form below manually."
        );
      }
      setFormVersion((v) => v + 1);
      setIsManualEntryOpen(true);
    } finally {
      setIsUploading(false);
    }
  }

  if (successChapter) {
    return (
      <div className="max-w-2xl">
        <Card className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <p className="text-lg font-semibold text-gray-900 mt-4">
            Profile for {successChapter.name} has been updated.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link
              href={`/affiliates/${successChapter.code}`}
              target="_blank"
              className={buttonVariants({ variant: "default" })}
            >
              View Profile
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSuccessChapter(null);
                setSelectedChapter(null);
              }}
            >
              Upload Another Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Credit Union Profiles</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload completed credit union profile forms to update information on the website.
          Visitors will see this information when they click a credit union in the Affiliates
          directory.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Select Credit Union</label>
          <ChapterCombobox
            chapters={chapters}
            value={selectedChapter}
            onChange={selectChapter}
          />
          {chaptersError && <p className="text-xs text-red-500">{chaptersError}</p>}
        </div>

        {selectedChapter && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label htmlFor="profile-file" className="text-sm font-medium text-gray-700">
              Upload Completed Form
            </label>
            <p className="text-xs text-gray-500">
              PDF, DOCX, JPG, or PNG — maximum 10MB.
            </p>
            <input
              id="profile-file"
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
            />
            {fileError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-xs">{fileError}</p>
              </div>
            )}
            {uploadNotice && (
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 flex gap-2">
                <FileUp className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-primary-800 text-xs">{uploadNotice}</p>
              </div>
            )}
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload & Extract"
              )}
            </Button>
          </div>
        )}
      </Card>

      {selectedChapter && (
        <Card className="p-6">
          <button
            type="button"
            onClick={() => setIsManualEntryOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">Manual Entry</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter or review the credit union&rsquo;s profile details directly.
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-gray-400 transition-transform shrink-0",
                isManualEntryOpen && "rotate-180"
              )}
            />
          </button>

          {isManualEntryOpen && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <ManualEntryForm
                key={`${selectedChapter.id}-${formVersion}`}
                chapter={selectedChapter}
                extractedFields={extractedFields}
                onSuccess={() => setSuccessChapter(selectedChapter)}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
