import { Resend } from 'resend';

type SendVerificationEmailInput = {
  email: string;
  name?: string | null;
  verifyUrl: string;
};

type SendForgotPasswordEmailInput = {
  email: string;
  name?: string | null;
  resetUrl: string;
};

type SendChangeEmailConfirmationEmailInput = {
  email: string;
  name?: string | null;
  newEmail: string;
  url: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function buildVerificationEmailHtml(name: string, verifyUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Verify your email</h2>
      <p style="margin: 0 0 12px;">Hi ${name},</p>
      <p style="margin: 0 0 12px;">
        Please verify this email address to complete your account action securely.
      </p>
      <p style="margin: 20px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 14px; border-radius: 8px;">
          Verify Email
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
        If the button does not work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0; font-size: 12px; color: #6b7280; word-break: break-all;">
        ${verifyUrl}
      </p>
    </div>
  `;
}

function buildForgotPasswordEmailHtml(name: string, resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Reset your password</h2>
      <p style="margin: 0 0 12px;">Hi ${name},</p>
      <p style="margin: 0 0 12px;">
        You requested to reset your password. Click the button below to proceed.
      </p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 14px; border-radius: 8px;">
          Reset Password
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
        If the button does not work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0; font-size: 12px; color: #6b7280; word-break: break-all;">
        ${resetUrl}
      </p>
    </div>
  `;
}

function buildChangeEmailConfirmationEmailHtml(
  name: string,
  newEmail: string,
  url: string,
) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Approve email change</h2>
      <p style="margin: 0 0 12px;">Hi ${name},</p>
      <p style="margin: 0 0 12px;">
        You requested to change your email to ${newEmail}. Please click the button below to approve this change.
      </p>
      <p style="margin: 20px 0;">
        <a href="${url}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 14px; border-radius: 8px;">
          Approve Email Change
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
        If the button does not work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0; font-size: 12px; color: #6b7280; word-break: break-all;">
        ${url}
      </p>
    </div>
  `;
}

export async function sendVerificationEmailWithResend(input: SendVerificationEmailInput) {
  if (!resend || !fromEmail) {
    throw new Error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable.');
  }

  const name = input.name?.trim() || 'there';

  await resend.emails.send({
    from: fromEmail,
    to: input.email,
    subject: 'Verify your email',
    html: buildVerificationEmailHtml(name, input.verifyUrl),
  });
}

export function sendForgotPasswordEmailWithResend(input: SendForgotPasswordEmailInput) {
  if (!resend || !fromEmail) {
    throw new Error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable.');
  }

  const name = input.name?.trim() || 'there';

  return resend.emails.send({
    from: fromEmail,
    to: input.email,
    subject: 'Reset your password',
    html: buildForgotPasswordEmailHtml(name, input.resetUrl),
  });
}

export function sendChangeEmailConfirmationEmail(
  input: SendChangeEmailConfirmationEmailInput,
) {
  if (!resend || !fromEmail) {
    throw new Error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable.');
  }

  const name = input.name?.trim() || 'there';

  return resend.emails.send({
    from: fromEmail,
    to: input.email,
    subject: 'Approve email change',
    html: buildChangeEmailConfirmationEmailHtml(name, input.newEmail, input.url),
  });
}
