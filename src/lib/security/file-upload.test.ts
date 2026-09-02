import assert from "node:assert/strict";
import test from "node:test";
import { contentMatchesMime, storageFileName, UPLOAD_MIME_TYPES } from "./file-upload";

test("upload signatures are checked independently of the reported MIME type", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(contentMatchesMime(png, UPLOAD_MIME_TYPES.png), true);
  assert.equal(contentMatchesMime(png, UPLOAD_MIME_TYPES.jpeg), false);
});

test("storage names are generated and use a canonical extension", () => {
  const name = storageFileName(UPLOAD_MIME_TYPES.pdf);
  assert.match(name, /^[0-9a-f-]+\.pdf$/);
});
