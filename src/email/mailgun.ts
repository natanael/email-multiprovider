import * as https from 'https';
import * as querystring from 'querystring';
import { EmailRequest } from './model';

export function getHttpRequestFromEmailRequest(request: EmailRequest): [https.RequestOptions, string] {
  const requestData = querystring.stringify({
    "from": request.from,
    "to": request.to,
    ...(request.cc ? { cc: request.cc }: {}),
    ...(request.bcc ? { bcc: request.bcc }: {}),
    "subject": request.subject,
    "text": request.text,
    ...(request.html ? { html: request.html } : {}),
  });
  
  return [{
    hostname: 'api.mailgun.net',
    port: 443,
    path: `/v3/${process.env.MAILGUN_DOMAIN_NAME}/messages`,
    method: 'POST',
    auth: `api:${process.env.MAILGUN_API}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': requestData.length
    }
  }, requestData];
}

export async function send(request: EmailRequest): Promise<string> {
  const [options, requestData] = getHttpRequestFromEmailRequest(request);

  console.log('USING MAILGUN');
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`)
      res.on('data', response => {
        if (res.statusCode >= 400) {
          console.log('REJECTED BY MAILGUN');
          return reject(response.toString());
        }
        console.log('FINISHED MAILGUN');
        resolve(response.toString())
      });
    });
  
    req.on('error', error => {
      console.log('FAILED TO REACH MAILGUN');
      reject(error);
    });
    
    req.write(requestData);
  
    req.end();
  });
}