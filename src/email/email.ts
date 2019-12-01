import { EmailRequest as IEmailRequest, EProvider } from "./model";
import * as uuid from 'uuid';
import * as redis from 'redis';
import { defaults } from 'lodash';
import { promisify } from "../utils";

export enum EEmailStatus {
  ToDo = "TODO",
  Processing = "PROCESSING",
  Sent = "SENT",
  Failed = "FAILED",
}

export interface IEmailLifecycle {
  status: EEmailStatus;
  createTimestamp: number;
  updateTimestamp: number;
  provider?: EProvider;
}

export type ISerializedEmail = IEmailRequest & IEmailLifecycle;

export class Email {
  email: ISerializedEmail;
  public static async getSerializedEmailById(client: () => redis.RedisClient, id: string): Promise<ISerializedEmail | null> {
    const emailStr = await promisify<string | null>(callback => client().get(id, callback));
    if (!emailStr) {
      return null;
    }
    try {
      return JSON.parse(emailStr) as ISerializedEmail;
    } catch (e) {
      console.error('Email - could not parse the stringified email', emailStr);
      return null
    }
  }
  public static async getStatusById(client: () => redis.RedisClient, id: string): Promise<EEmailStatus | 'NotFound'> {
    const email = await this.getSerializedEmailById(client, id);
    if (email == null) {
      return 'NotFound';
    }
    return email.status;
  }
  public static async createEmail(client: () => redis.RedisClient, request: IEmailRequest & Partial<IEmailLifecycle>, id: string = uuid()): Promise<Email> {
    const email = new Email(client, request, id);
    await email.store();
    await email.register();
    return email;
  }
  public static restoreEmail(client: () => redis.RedisClient, request: IEmailRequest & Partial<IEmailLifecycle>, id: string): Email {
    const email = new Email(client, request, id);
    return email;
  }
  private constructor(private client: () => redis.RedisClient, request: IEmailRequest & Partial<IEmailLifecycle>, public id: string = uuid()) {
    const nowTimestamp = new Date().getTime();
    this.email = defaults(request, {
      status: EEmailStatus.ToDo,
      createTimestamp: nowTimestamp,
      updateTimestamp: nowTimestamp,
    });
  }
  private register(): Promise<number | null> {
    return promisify<number | null>(callback => this.client().hset("emails", this.id, this.email.createTimestamp.toString(), callback));
  }
  public store(): Promise<string | null> {
    return promisify<string | null>(callback => this.client().setex(this.id, Number(process.env.EMAIL_TTL_SECONDS), JSON.stringify(this.email), callback));
  }
  public sent(provider: EProvider) {
    this.email.status = EEmailStatus.Sent;
    this.email.provider = provider;
    this.store();
  }
  public failed(provider: EProvider) {
    this.email.status = EEmailStatus.Failed;
    this.email.provider = provider;
    this.store();
  }
  public processing(provider: EProvider) {
    this.email.status = EEmailStatus.Processing;
    this.email.provider = provider;
    this.store();
  }
}