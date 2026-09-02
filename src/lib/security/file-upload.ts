export const UPLOAD_MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

const extensions: Record<string, string> = {
  [UPLOAD_MIME_TYPES.pdf]: "pdf",
  [UPLOAD_MIME_TYPES.docx]: "docx",
  [UPLOAD_MIME_TYPES.jpeg]: "jpg",
  [UPLOAD_MIME_TYPES.png]: "png",
  [UPLOAD_MIME_TYPES.webp]: "webp",
};

function startsWith(buffer: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => buffer[index] === byte);
}

export function contentMatchesMime(buffer: Uint8Array, mimeType: string) {
  if (mimeType === UPLOAD_MIME_TYPES.pdf) {
    return startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }
  if (mimeType === UPLOAD_MIME_TYPES.jpeg) {
    return startsWith(buffer, [0xff, 0xd8, 0xff]);
  }
  if (mimeType === UPLOAD_MIME_TYPES.png) {
    return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (mimeType === UPLOAD_MIME_TYPES.webp) {
    return (
      startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
      String.fromCharCode(...buffer.slice(8, 12)) === "WEBP"
    );
  }
  if (mimeType === UPLOAD_MIME_TYPES.docx) {
    // DOCX is an Open Packaging Convention ZIP. Parsing still happens in
    // mammoth after this signature check; legacy binary DOC is not accepted.
    return startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]);
  }
  return false;
}

export function storageFileName(mimeType: string) {
  const extension = extensions[mimeType];
  if (!extension) throw new Error("Unsupported upload MIME type.");
  return `${crypto.randomUUID()}.${extension}`;
}

export function isSafeCsvFile(file: File) {
  const extensionOk = file.name.toLowerCase().endsWith(".csv");
  const typeOk = ["", "text/csv", "text/plain", "application/vnd.ms-excel"].includes(
    file.type.toLowerCase(),
  );
  return extensionOk && typeOk;
}
