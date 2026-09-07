import type { HomepageContentInput, HomepageDraftInput } from "@/lib/validation/homepage-content";
import { validateHomepageContent } from "@/lib/validation/homepage-content";

export type HomepageSaveIntent = "draft" | "publish";
type ValidatedHomepageContent = HomepageContentInput | HomepageDraftInput;

type HomepageSaveDependencies<T> = {
  persist: (intent: HomepageSaveIntent, data: ValidatedHomepageContent) => Promise<T>;
  audit: (intent: HomepageSaveIntent, saved: T) => Promise<void>;
  revalidatePublishedHomepage: () => void;
};

export type HomepageSaveResult<T> =
  | { success: true; data: ValidatedHomepageContent; saved: T }
  | { success: false; kind: "validation"; errors: Record<string, string[]> }
  | { success: false; kind: "server"; cause: unknown };

export async function processHomepageSave<T>(
  input: unknown,
  intent: HomepageSaveIntent,
  dependencies: HomepageSaveDependencies<T>,
): Promise<HomepageSaveResult<T>> {
  const parsed = validateHomepageContent(input, intent);
  if (!parsed.success) {
    return { success: false, kind: "validation", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const saved = await dependencies.persist(intent, parsed.data);
    await dependencies.audit(intent, saved);
    if (intent === "publish") dependencies.revalidatePublishedHomepage();
    return { success: true, data: parsed.data, saved };
  } catch (cause) {
    return { success: false, kind: "server", cause };
  }
}
