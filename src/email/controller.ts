import * as express from 'express';
import { isEmail, emailArray, optionalEmailArray, isNonEmptyString, optional, getErrors, requiredUuid } from '../validators/validators';
import { Email, EEmailStatus } from './email';
import { getRedisClient } from '../redis';

export const sendEmails = (): express.Router => {
  const app = express();

  app.get('/', (req, res) => {
    const idParam = req.query['id'];

    const errorMessage = requiredUuid('id')(idParam);

    if (errorMessage) {
      res.status(400);
      res.json({error: 'BadRequest', message: errorMessage});
      return;
    }

    Email.getStatusById(getRedisClient, idParam)
    .then(status => {
      if (status === 'NotFound') {
        res.status(404);
        res.json({error: 'NotFound', message: `Could not find email ${idParam}. Emails have a retention period of ${process.env.EMAIL_TTL_SECONDS} seconds`});
        return;
      }
      res.status(202);
      res.json({ id: idParam, status });
    });
  });
  
  app.post('/', (req, res) => {
    if (!req.body) {
      res.status(400);
      res.json({error: 'BadRequest', message: `The request must include a body like `
      +`{"from": "example@example.com", "to": ["example@example.com"], "cc": ["example@example.com"], "bcc": ["example@example.com"], `
      +`"subject": "Email subject", text": "Email body", "html": "<p>Email body</p>"}`});
      return;
    }
    const params = {
      from: req.body['from'],
      to: req.body['to'],
      cc: req.body['cc'],
      bcc: req.body['bcc'],
      subject: req.body['subject'],
      text: req.body['text'],
      html: req.body['html'],
    };

    const errorMessage = getErrors([
      isEmail(`The argument 'from' must be a valid email`)(params.from),
      emailArray('to')(params.to),
      optionalEmailArray('cc')(params.cc),
      optionalEmailArray('bcc')(params.bcc),
      isNonEmptyString(`The argument 'text' must not be empty`)(params.text),
      optional(isNonEmptyString(`The argument 'html' must not be empty when provided`))(params.text),
    ]);

    if (errorMessage) {
      res.status(400);
      res.json({error: 'BadRequest', message: errorMessage});
      return;
    }

    // Create email
    console.log('Queueing new email', params);
    Email.createEmail(getRedisClient, {
      from: params.from,
      to: params.to,
      ...(params.cc ? { cc: params.cc }: {}),
      ...(params.bcc ? { bcc: params.bcc }: {}),
      subject: params.subject,
      text: params.text,
      ...(params.html ? { html: params.html } : {}),
    })
    .then(email => {
      console.log('Queued email', email.id);
      res.status(303);
      res.set('location', '/email?id=' + email.id);
      res.json({status: EEmailStatus.ToDo, id: email.id, message: `Use GET /email?id=${email.id} to get the status of the email request (Location header)`});
    })
    .catch(err => {
      console.error('Failed to register email', err);
      res.status(500);
      res.end('Internal server error');
    });
  });

  return app;
}