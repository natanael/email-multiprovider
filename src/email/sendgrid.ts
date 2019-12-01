import * as https from 'https';
import { EmailRequest } from './model';

export function getHttpRequestFromEmailRequest(request: EmailRequest): [https.RequestOptions, string] {
  const requestData = JSON.stringify({
    "personalizations": [
      {
        "to": request.to.map(email => ({email})),
        ...(request.cc ? {
          cc: request.cc.map(email => ({email}))
        }: {}),
        ...(request.bcc ? {
          bcc: request.bcc.map(email => ({email}))
        }: {}),
      }
    ],
    "from": {
      "email": request.from,
    },
    "subject": request.subject,
    "content": [
      {
        "type": "text/plain",
        "value": request.text
      },
      ...(request.html ? [{
        "type": "text/html",
        "value": request.html
      }] : [])
    ]
  });

  return [{
    hostname: 'api.sendgrid.com',
    port: 443,
    path: '/v3/mail/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SENDGRID_API}`,
      'Content-Length': requestData.length
    }
  }, requestData];
}

export async function send(request: EmailRequest): Promise<string> {
  const [options, requestData] = getHttpRequestFromEmailRequest(request);

  console.log('TRYING SENDGRID');
  return new Promise((resolve, reject) => {
    if(Math.random() > 0.5) {
      return reject(new Error('Random error'));
    }
    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.pipe(process.stdout);
      
      res.on('end', () => {
        console.log('COMPLETED USING SENDGRID');
        resolve('SENDGRID');
      });
    });
  
    req.on('error', error => {
      console.log('FAILED USING SENDGRID', error);
      reject(error);
    });
    
    req.write(requestData);
  
    req.end();
  });
}

// function resolveOnce<T>(resolver: (arg: T) => void) {
//   let resolved = false;
//   return (arg: T) => {
//     if (resolved) { return; }
//     resolved = true;
//     resolver(arg);
//   }
// }