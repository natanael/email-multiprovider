import * as redis from 'redis';
import { promisify } from '../utils';
import { ISerializedEmail, EEmailStatus, Email } from '../email/email';
import { sendEmail } from '../email/sendEmail';

export class Worker {
  constructor(private client: () => redis.RedisClient) {}
  public async checkForWork() {
    // All emails have a TTL, so they will naturally disappear from the redis db 
    const emails = await promisify<string[] | null>(callback => this.client().hkeys("emails", callback));
    if (emails == null) {
      console.log('Got nothing to check');
      return;
    }

    // Purge the ones that do not exist anymore
    for(const id of emails) {
      const emailStr = await promisify<string | null>(callback => this.client().get(id, callback));
      if (emailStr == null) {
        console.log('Removing email', id);
        await promisify(callback => this.client().hdel('emails', id, callback));
        continue;
      }
      try {
        const email: ISerializedEmail = JSON.parse(emailStr);
        if (email.status === EEmailStatus.ToDo) {
          console.log('Sending email', id);
          await sendEmail(Email.restoreEmail(this.client, email, id));
        }
      } catch (e) {
        console.log('could not parse the stringified email', emailStr);
        await promisify(callback => this.client().del(id, callback));
      }
    }
  }
}