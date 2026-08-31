import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_NOTIFICATION_SETTINGS,
  type EmailTemplate,
  type EmailTemplates,
} from "@/lib/notification-settings";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Overridable for testing before camccul.cm is verified as a sending domain
// in Resend — sends from an unverified domain are rejected outright, and
// Resend's sandbox mode only ever delivers to the account owner's own
// verified email. Both fall back to the real CamCCUL addresses when unset,
// so removing these two env vars once the domain is verified is the whole
// migration back to production — no code change needed.
const FROM_NOTIFICATIONS = process.env.RESEND_FROM || "CamCCUL Portal <notifications@camccul.cm>";
const FROM_HEADQUARTERS = process.env.RESEND_FROM || "CamCCUL Headquarters <info@camccul.cm>";
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || "info@camccul.cm";

async function getNotificationPreferences() {
  try {
    const settings = await prisma.notificationSettings.findUnique({ where: { id: "default" } });
    if (!settings) return DEFAULT_NOTIFICATION_SETTINGS;
    const savedTemplates =
      settings.emailTemplates && typeof settings.emailTemplates === "object" && !Array.isArray(settings.emailTemplates)
        ? (settings.emailTemplates as unknown as EmailTemplates)
        : {};
    return {
      adminNotificationEmail: settings.adminNotificationEmail,
      newCreditUnionCreated: settings.newCreditUnionCreated,
      profileSubmittedForReview: settings.profileSubmittedForReview,
      profileUpdated: settings.profileUpdated,
      contactFormMessage: settings.contactFormMessage,
      accountCredentialsEmail: true,
      profileSubmissionConfirmation: settings.profileSubmissionConfirmation,
      profileApprovedEmail: settings.profileApprovedEmail,
      profileRejectedEmail: settings.profileRejectedEmail,
      emailTemplates: { ...DEFAULT_EMAIL_TEMPLATES, ...savedTemplates },
    };
  } catch (error) {
    console.error("Could not read notification preferences; using defaults:", error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

function renderTemplate(template: EmailTemplate, variables: Record<string, string>) {
  const replace = (value: string) =>
    Object.entries(variables).reduce(
      (result, [key, replacement]) => result.replaceAll(`{${key}}`, replacement),
      value
    );
  return {
    subject: replace(template.subject),
    html: replace(template.body)
      .split("\n")
      .map((line) => (line ? `<p>${line}</p>` : "<br />"))
      .join(""),
  };
}

// The Resend SDK returns { data, error } rather than throwing on a
// rejected send (bad domain, rate limit, invalid recipient, etc.) — every
// call site below already wraps its email sends in Promise.allSettled and
// logs anything that lands in the "rejected" bucket, but that only ever
// sees actual JS exceptions. Without this, a rejected send would silently
// look identical to a successful one everywhere in the app.
async function sendOrThrow(params: Parameters<NonNullable<typeof resend>["emails"]["send"]>[0]) {
  const { error } = await resend!.emails.send(params);
  if (error) {
    throw new Error(`Resend rejected the send: ${error.message}`);
  }
}

interface ProfileSubmissionToCamCCULParams {
  creditUnionName: string;
  creditUnionCode: string;
  chapter: string;
  submittedAt: string;
}

// Notifies League HQ that a chapter submitted (or resubmitted) its profile
// and is waiting in the review queue. Falls back to a console log — not a
// thrown error — when RESEND_API_KEY isn't set, so profile submission
// keeps working in every environment that doesn't have email configured
// yet (local dev, CI, a fresh deploy before the key is added).
export async function sendProfileSubmissionToCamCCUL({
  creditUnionName,
  creditUnionCode,
  chapter,
  submittedAt,
}: ProfileSubmissionToCamCCULParams) {
  const preferences = await getNotificationPreferences();
  if (!preferences.profileSubmittedForReview) return;
  if (!resend) {
    console.log("MOCK EMAIL TO CAMCCUL:", {
      creditUnionName,
      creditUnionCode,
      chapter,
      submittedAt,
    });
    return;
  }

  const rendered = renderTemplate(preferences.emailTemplates.profileSubmittedForReview, {
    creditUnionName,
    chapter,
  });
  await sendOrThrow({
    from: FROM_NOTIFICATIONS,
    to: preferences.adminNotificationEmail || ADMIN_EMAIL,
    subject: rendered.subject,
    html: `${rendered.html}<p><strong>Code:</strong> ${creditUnionCode}</p><p><strong>Submitted:</strong> ${submittedAt}</p>`,
  });
}

export async function sendProfileUpdatedToCamCCUL(params: ProfileSubmissionToCamCCULParams) {
  const preferences = await getNotificationPreferences();
  if (!preferences.profileUpdated) return;
  if (!resend) {
    console.log("MOCK PROFILE UPDATED EMAIL:", params);
    return;
  }
  const rendered = renderTemplate(preferences.emailTemplates.profileUpdated, {
    creditUnionName: params.creditUnionName,
    chapter: params.chapter,
  });
  await sendOrThrow({
    from: FROM_NOTIFICATIONS,
    to: preferences.adminNotificationEmail || ADMIN_EMAIL,
    subject: rendered.subject,
    html: `${rendered.html}<p><strong>Code:</strong> ${params.creditUnionCode}</p><p><strong>Updated:</strong> ${params.submittedAt}</p>`,
  });
}

interface ProfileConfirmationToCreditUnionParams {
  creditUnionName: string;
  creditUnionEmail: string;
}

// Confirms receipt to the chapter itself. Same console-log fallback as
// above when no API key is configured.
export async function sendProfileConfirmationToCreditUnion({
  creditUnionName,
  creditUnionEmail,
}: ProfileConfirmationToCreditUnionParams) {
  const preferences = await getNotificationPreferences();
  if (!preferences.profileSubmissionConfirmation) return;
  if (!resend) {
    console.log("MOCK EMAIL TO CREDIT UNION:", { creditUnionName, creditUnionEmail });
    return;
  }

  const rendered = renderTemplate(preferences.emailTemplates.profileSubmissionConfirmation, { creditUnionName });
  await sendOrThrow({
    from: FROM_HEADQUARTERS,
    to: creditUnionEmail,
    subject: rendered.subject,
    html: rendered.html,
  });
}

interface ProfileApprovalEmailParams {
  creditUnionName: string;
  creditUnionEmail: string;
}

// Sent when an admin approves a profile from the review dashboard — the
// email the confirmation above promises ("You will receive another email
// when your profile has been approved."). Same console-log fallback.
export async function sendProfileApprovalEmail({
  creditUnionName,
  creditUnionEmail,
}: ProfileApprovalEmailParams) {
  const preferences = await getNotificationPreferences();
  if (!preferences.profileApprovedEmail) return;
  if (!resend) {
    console.log("MOCK APPROVAL EMAIL:", { creditUnionName, creditUnionEmail });
    return;
  }

  const rendered = renderTemplate(preferences.emailTemplates.profileApprovedEmail, { creditUnionName });
  await sendOrThrow({
    from: FROM_HEADQUARTERS,
    to: creditUnionEmail,
    subject: rendered.subject,
    html: rendered.html,
  });
}

export async function sendProfileRejectedEmail({ creditUnionName, creditUnionEmail, rejectionReason }: ProfileApprovalEmailParams & { rejectionReason: string }) {
  const preferences = await getNotificationPreferences();
  if (!preferences.profileRejectedEmail) return;
  if (!resend) {
    console.log("MOCK PROFILE REJECTED EMAIL:", { creditUnionName, creditUnionEmail, rejectionReason });
    return;
  }
  const rendered = renderTemplate(preferences.emailTemplates.profileRejectedEmail, { creditUnionName, rejectionReason });
  await sendOrThrow({ from: FROM_HEADQUARTERS, to: creditUnionEmail, subject: rendered.subject, html: rendered.html });
}

interface CreditUnionCredentialsParams {
  creditUnionName: string;
  email: string;
  password: string;
  chapter: string;
}

export async function sendCreditUnionCredentials({
  creditUnionName,
  email,
  password,
  chapter,
}: CreditUnionCredentialsParams) {
  const preferences = await getNotificationPreferences();
  const website = process.env.NEXT_PUBLIC_SITE_URL || "https://camccul.cm";
  const loginUrl = `${website.replace(/\/$/, "")}/login`;

  if (!resend) {
    console.log("MOCK CREDIT UNION CREDENTIALS EMAIL:", {
      creditUnionName,
      email,
      chapter,
      loginUrl,
    });
    return;
  }

  const rendered = renderTemplate(preferences.emailTemplates.accountCredentialsEmail, {
    creditUnionName,
    email,
    password,
    chapter,
  });
  await sendOrThrow({
    from: FROM_HEADQUARTERS,
    to: email,
    subject: rendered.subject,
    html: `${rendered.html}<p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>`,
  });
}

export async function sendNewCreditUnionCreatedToCamCCUL(
  params: Omit<CreditUnionCredentialsParams, "password">
) {
  const preferences = await getNotificationPreferences();
  if (!preferences.newCreditUnionCreated) return;
  if (!resend) {
    console.log("MOCK NEW CREDIT UNION ADMIN EMAIL:", params);
    return;
  }
  const rendered = renderTemplate(preferences.emailTemplates.newCreditUnionCreated, params);
  await sendOrThrow({
    from: FROM_NOTIFICATIONS,
    to: preferences.adminNotificationEmail || ADMIN_EMAIL,
    subject: rendered.subject,
    html: rendered.html,
  });
}

export async function sendContactFormNotification(email: string) {
  const preferences = await getNotificationPreferences();
  if (!preferences.contactFormMessage) return;
  if (!resend) {
    console.log("MOCK CONTACT FORM ADMIN EMAIL:", { email });
    return;
  }
  const rendered = renderTemplate(preferences.emailTemplates.contactFormMessage, { email });
  await sendOrThrow({
    from: FROM_NOTIFICATIONS,
    to: preferences.adminNotificationEmail || ADMIN_EMAIL,
    subject: rendered.subject,
    html: rendered.html,
  });
}
