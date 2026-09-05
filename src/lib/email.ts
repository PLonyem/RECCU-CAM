import "server-only";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_NOTIFICATION_SETTINGS,
  type EmailTemplate,
  type EmailTemplates,
} from "@/lib/notification-settings";
import { reportServerError, reportServerEvent } from "@/lib/security/logging";

const resend =
  process.env.RESEND_API_KEY && process.env.RESEND_FROM
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// Sending is disabled until both a Resend key and an explicitly verified
// sender are configured. No institution email address is inferred in code.
const FROM_NOTIFICATIONS = process.env.RESEND_FROM || "";
const FROM_HEADQUARTERS = process.env.RESEND_FROM || "";
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || "";

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
    reportServerError("email.preferences_read_failed", error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTemplate(template: EmailTemplate, variables: Record<string, string>) {
  const replace = (value: string, escapeValues: boolean) =>
    Object.entries(variables).reduce(
      (result, [key, replacement]) =>
        result.replaceAll(`{${key}}`, escapeValues ? escapeHtml(replacement) : replacement),
      value,
    );
  return {
    subject: replace(template.subject, false).replace(/[\r\n]+/g, " ").slice(0, 240),
    html: replace(escapeHtml(template.body), true)
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

interface ProfileSubmissionToReccucamParams {
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
export async function sendProfileSubmissionToReccucam({
  creditUnionName,
  creditUnionCode,
  chapter,
  submittedAt,
}: ProfileSubmissionToReccucamParams) {
  const preferences = await getNotificationPreferences();
  if (!preferences.profileSubmittedForReview) return;
  if (!resend) {
    reportServerEvent("email.profile_submission.skipped_not_configured");
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
    html: `${rendered.html}<p><strong>Code:</strong> ${escapeHtml(creditUnionCode)}</p><p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>`,
  });
}

export async function sendProfileUpdatedToReccucam(params: ProfileSubmissionToReccucamParams) {
  const preferences = await getNotificationPreferences();
  if (!preferences.profileUpdated) return;
  if (!resend) {
    reportServerEvent("email.profile_updated.skipped_not_configured");
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
    html: `${rendered.html}<p><strong>Code:</strong> ${escapeHtml(params.creditUnionCode)}</p><p><strong>Updated:</strong> ${escapeHtml(params.submittedAt)}</p>`,
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
    reportServerEvent("email.profile_confirmation.skipped_not_configured");
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
    reportServerEvent("email.profile_approval.skipped_not_configured");
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
    reportServerEvent("email.profile_rejection.skipped_not_configured");
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
  const website = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const loginUrl = `${website.replace(/\/$/, "")}/login`;

  if (!resend) {
    reportServerEvent("email.credentials.skipped_not_configured");
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
    html: `${rendered.html}<p><strong>Login URL:</strong> <a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></p>`,
  });
}

export async function sendNewCreditUnionCreatedToReccucam(
  params: Omit<CreditUnionCredentialsParams, "password">
) {
  const preferences = await getNotificationPreferences();
  if (!preferences.newCreditUnionCreated) return;
  if (!resend) {
    reportServerEvent("email.new_credit_union.skipped_not_configured");
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

interface ContactFormNotificationParams {
  name: string;
  contact: string;
  email: string;
  purpose: string;
  department: string;
  subject: string;
}

export async function sendContactFormNotification(input: ContactFormNotificationParams | string) {
  const preferences = await getNotificationPreferences();
  if (!preferences.contactFormMessage) return;
  if (!resend) {
    reportServerEvent("email.contact_form.skipped_not_configured");
    return;
  }
  const params: ContactFormNotificationParams = typeof input === "string"
    ? {
        name: "Website visitor",
        contact: input,
        email: input,
        purpose: "Website inquiry",
        department: "Administration / Front Office",
        subject: "Submitted through a website form",
      }
    : input;
  const rendered = renderTemplate(preferences.emailTemplates.contactFormMessage, {
    name: params.name,
    contact: params.contact,
    email: params.email,
    purpose: params.purpose,
    department: params.department,
    subject: params.subject,
  });
  await sendOrThrow({
    from: FROM_NOTIFICATIONS,
    to: preferences.adminNotificationEmail || ADMIN_EMAIL,
    subject: rendered.subject,
    html: rendered.html,
  });
}
