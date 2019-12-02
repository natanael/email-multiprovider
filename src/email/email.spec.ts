import { Email, EEmailStatus } from "./email"
import * as TypeMoq from 'typemoq';
import * as redis from 'redis';
import { expect } from "chai";
import { isFunction } from "lodash";
import { EProvider } from "./model";

describe('email', () => {
  describe('email lifecycle and redis calls', async () => {
    const client: TypeMoq.IMock<redis.RedisClient> = TypeMoq.Mock.ofType(redis.RedisClient, TypeMoq.MockBehavior.Strict);
    const request = {
      from: 'test@example.com',
      to: ['nobody@example.com'],
      subject: 'None',
      text: 'This is an email',
    };
    let email: Email;

    process.env.EMAIL_TTL_SECONDS = '123';

    it('should create the email', async () => {
      client
      .setup(s => s.hset(
        'emails', 
        TypeMoq.It.is(likeUuid), 
        TypeMoq.It.is(justNowTimestamp), 
        TypeMoq.It.is(val => {val(null, 1); return isFunction(val)}),
      ))
      .returns(() => true)
      .verifiable(TypeMoq.Times.once());
      
      client
      .setup(s => s.set(
        TypeMoq.It.is(likeUuid),
        TypeMoq.It.is(val => {
          expect(JSON.parse(val).status).to.be.equal(EEmailStatus.ToDo, 'Email is not set to ToDo after it is created');
          const serialized = JSON.parse(val);
          expect(serialized.from).to.be.equal(request.from, 'Email creation - set - from');
          expect(serialized.to).to.be.eql(request.to, 'Email creation - set - to');
          expect(serialized.subject).to.be.equal(request.subject, 'Email creation - set - subject');
          expect(serialized.text).to.be.equal(request.text, 'Email creation - set - text');
          return true;
        }), 
        TypeMoq.It.is(val => {val(null, 'OK'); return isFunction(val)}),
      ))
      .returns(() => true)
      .verifiable(TypeMoq.Times.once());

      client
      .setup(s => s.expire(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .verifiable(TypeMoq.Times.never());
  
      email = await Email.createEmail(() => client.object, request);
      client.verifyAll();
      client.reset();
    });

    it('should update the email to processing with the provider while processing', async () => {
      client
      .setup(s => s.set(
        TypeMoq.It.is(likeUuid),
        TypeMoq.It.is(val => {
          expect(JSON.parse(val).status).to.be.equal(EEmailStatus.Processing, 'Email is not set to Processing when processing');
          expect(val).to.be.equal(JSON.stringify({
            ...email.email, 
            status: EEmailStatus.Processing,
            provider: EProvider.Mailgun,
          }), 'Processing Email does not match expectations');
          return true;
        }), 
        TypeMoq.It.is(val => {val(null, 'OK'); return isFunction(val)}),
      ))
      .returns(() => true)
      .verifiable(TypeMoq.Times.once());

      client
      .setup(s => s.expire(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .verifiable(TypeMoq.Times.never());
  
      await email.processing(EProvider.Mailgun);
      client.verifyAll();
      client.reset();
    });

    it('should update the email to sent after it is sent', async () => {
      client
      .setup(s => s.set(
        TypeMoq.It.is(likeUuid),
        TypeMoq.It.is(val => {
          expect(JSON.parse(val).status).to.be.equal(EEmailStatus.Sent, 'Email is not set to Sent after it is sent');
          expect(JSON.parse(val).provider).to.be.equal(EProvider.SendGrid, 'The provider is not updated as it should');
          expect(val).to.be.equal(JSON.stringify({
            ...email.email, 
            status: EEmailStatus.Sent, 
            provider: EProvider.SendGrid,
          }), 'Sent Email does not match expectations');
          return true;
        }), 
        TypeMoq.It.is(val => {val(null, 'OK'); return isFunction(val)}),
      ))
      .returns(() => true)
      .verifiable(TypeMoq.Times.once());

      client
      .setup(s => s.expire(
        TypeMoq.It.is(likeUuid),
        TypeMoq.It.is(val => val === Number(process.env.EMAIL_TTL_SECONDS)), 
        TypeMoq.It.is(val => {val(null, 1); return isFunction(val)}),
      ))
      .returns(() => true)
      .verifiable(TypeMoq.Times.once());
  
      await email.sent(EProvider.SendGrid);
      client.verifyAll();
      client.reset();
    });
    
    it('should update the email to failed after it fails', async () => {
      client
      .setup(s => s.set(
        TypeMoq.It.is(likeUuid),
        TypeMoq.It.is(val => {
          expect(JSON.parse(val).status).to.be.equal(EEmailStatus.Failed, 'Email is not set to Failed after it fails');
          expect(JSON.parse(val).provider).to.be.equal(EProvider.Mailgun, 'The provider is not updated as it should');
          expect(val).to.be.equal(JSON.stringify({
            ...email.email, 
            status: EEmailStatus.Failed, 
            provider: EProvider.Mailgun,
          }), 'Sent Email does not match expectations');
          return true;
        }), 
        TypeMoq.It.is(val => {val(null, 'OK'); return isFunction(val)}),
      ))
      .returns(() => true)
      .verifiable(TypeMoq.Times.once());

      client
      .setup(s => s.expire(
        TypeMoq.It.is(likeUuid),
        TypeMoq.It.is(val => val === Number(process.env.EMAIL_TTL_SECONDS)), 
        TypeMoq.It.is(val => {val(null, 1); return isFunction(val)}),
      ))
      .returns(() => true)
      .verifiable(TypeMoq.Times.once());
  
      await email.failed(EProvider.Mailgun);
      client.verifyAll();
      client.reset();
    });
  });
});

function likeUuid(val: string) {
  return !!val.match(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/);
}

function justNowTimestamp(val: string) {
  const diff = Math.abs(new Date().getTime() - Number(val));
  return diff < 100;
}