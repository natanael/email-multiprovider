import { EProvider } from "./model";
import * as sendgrid from "./sendgrid";
import * as mailgun from "./mailgun";
import { Email } from "./email";
import { shuffle } from "lodash";

const providers = [
  { name: EProvider.Mailgun,  implementation: mailgun}, 
  { name: EProvider.SendGrid, implementation: sendgrid }
];

export async function sendEmail(email: Email, rotationMethod: <T>(val: Array<T>) => Array<T> = shuffle): Promise<void> {
  const options = rotationMethod(providers);
  let lastProvider: EProvider;
  while(options) {
    const {name, implementation: provider} = options.pop();
    lastProvider = name;
    try {
      await email.processing(name);
      await provider.send(email.email);
      return email.sent(name);
    } catch (e) {
      console.log(`Failed to use provider`, name, e);
    }
  }
  return email.failed(lastProvider);
}