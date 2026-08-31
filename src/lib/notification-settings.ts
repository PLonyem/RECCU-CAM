export interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export type EmailTemplates = Record<string, EmailTemplate>;

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplates = {
  newCreditUnionCreated: {
    name: "New Credit Union Created",
    subject: "New credit union created — {creditUnionName}",
    body: "A new credit union account has been created.\n\nCredit union: {creditUnionName}\nChapter: {chapter}\nLogin email: {email}",
    variables: ["{creditUnionName}", "{chapter}", "{email}"],
  },
  profileSubmittedForReview: {
    name: "Profile Submitted for Review",
    subject: "New profile submission — {creditUnionName}",
    body: "{creditUnionName} has submitted its profile for review.",
    variables: ["{creditUnionName}", "{chapter}"],
  },
  profileUpdated: {
    name: "Approved Profile Updated",
    subject: "Approved profile updated — {creditUnionName}",
    body: "{creditUnionName} updated an approved profile. Please review the changes.",
    variables: ["{creditUnionName}", "{chapter}"],
  },
  contactFormMessage: {
    name: "Contact Form Submission",
    subject: "New website contact message",
    body: "A new contact form message was submitted by {email}.",
    variables: ["{email}"],
  },
  accountCredentialsEmail: {
    name: "Account Credentials",
    subject: "Your CamCCUL Portal Access",
    body: "Dear {creditUnionName},\n\nYour CamCCUL portal account is ready.\nLogin Email: {email}\nTemporary Password: {password}\nChapter: {chapter}",
    variables: ["{creditUnionName}", "{email}", "{password}", "{chapter}"],
  },
  profileSubmissionConfirmation: {
    name: "Submission Confirmation",
    subject: "Profile Submission Received — CamCCUL",
    body: "Dear {creditUnionName},\n\nYour profile has been received and is now under review.",
    variables: ["{creditUnionName}"],
  },
  profileApprovedEmail: {
    name: "Profile Approved",
    subject: "Profile Approved — CamCCUL",
    body: "Dear {creditUnionName},\n\nYour profile has been approved and is now live.",
    variables: ["{creditUnionName}"],
  },
  profileRejectedEmail: {
    name: "Profile Rejected",
    subject: "Profile Review Update — CamCCUL",
    body: "Dear {creditUnionName},\n\nYour profile requires changes.\nReason: {rejectionReason}",
    variables: ["{creditUnionName}", "{rejectionReason}"],
  },
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  adminNotificationEmail: "info@camccul.cm",
  newCreditUnionCreated: true,
  profileSubmittedForReview: true,
  profileUpdated: false,
  contactFormMessage: true,
  accountCredentialsEmail: true,
  profileSubmissionConfirmation: true,
  profileApprovedEmail: true,
  profileRejectedEmail: true,
  emailTemplates: DEFAULT_EMAIL_TEMPLATES,
};
