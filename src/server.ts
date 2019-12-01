import * as express from 'express';
import * as bodyParser from 'body-parser';
import { sendEmails } from './email/controller';
const app = express();
const port = process.env.HTTP_PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/email', sendEmails());

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`curl http://address/email -X POST --data '{
    "from": "me@example.com", 
    "to": ["you@example.com"], 
    "cc": ["them@example.com"], 
    "bcc": ["theone@example.com"], 
    "subject": "Extra urgent",
    "text": "This is an extra urgent email",
    "html": "<h1>Urgent!</h1><p>This is an extra urgent email</p>",
  }'`);
});

app.listen(port, () => console.log(`Listening on port ${port}!`))