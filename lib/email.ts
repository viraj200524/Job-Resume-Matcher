// Email service for sending notifications to candidates

import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Create a transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASSWORD || "password",
  },
})

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "TalentMatch <noreply@talentmatch.com>",
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send email")
  }
}

export function generateApplicationConfirmationEmail(candidateName: string, jobTitle: string, company: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Application Confirmation</h2>
      <p>Hello ${candidateName},</p>
      <p>Your application for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> has been successfully submitted.</p>
      <p>The recruiter will review your application and get back to you soon.</p>
      <p>You can track the status of your application in your TalentMatch dashboard.</p>
      <p>Best regards,<br>The TalentMatch Team</p>
    </div>
  `
}

export function generateInterviewInvitationEmail(
  candidateName: string,
  jobTitle: string,
  company: string,
  interviewDate: string,
  interviewTime: string,
  videoLink: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Interview Invitation</h2>
      <p>Hello ${candidateName},</p>
      <p>We're pleased to invite you to an interview for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
      <p><strong>Date:</strong> ${interviewDate}</p>
      <p><strong>Time:</strong> ${interviewTime}</p>
      <p>The interview will be conducted via video conference. Please click the link below at the scheduled time:</p>
      <p><a href="${videoLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Join Interview</a></p>
      <p>If you have any questions or need to reschedule, please contact us.</p>
      <p>Best regards,<br>The TalentMatch Team</p>
    </div>
  `
}
