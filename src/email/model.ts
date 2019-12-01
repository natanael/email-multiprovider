export interface EmailRequest {
  from: string;
  to: Array<string>;
  cc?: Array<string>;
  bcc?: Array<string>;
  subject: string;
  text: string;
  html?: string;
}

export enum EProvider {
  SendGrid = "SENDGRID",
  Mailgun = "MAILGUN",
}

export interface SentConfirmation {
  provider: EProvider;
}
