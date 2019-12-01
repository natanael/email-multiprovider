# About
This is a NodeJS API the uses both `mailgun` and `sendgrid` API's to send emails
It is just a proof of concept with mere hours into it, so many edges are still rough
How it works:
1. Validate the POST /email request
1. Store the `emailRequest` on redis with a TTL of 60 sec
1. Return the link to check the status of the request `GET /email?id=uuid`
1. A worker runs every second and will send the emails either by `mailgun` or `sendgrid`.
> It shuffles and tries all unless one works
> The sendgrid implementation is set to fail randomly 50% of the time
1. After the TTL your email will be forgotten forever
>  (well, the logs still reference it, and the recipients will have it)

# Running locally
1. Copy `.env.example` to `.env` and fill in with your details
1. Run `yarn` or `npm install`, this application was tested with NodeJS `10.16`

## Running tests
1. Run `yarn test`

## Running the server
1. Run `yarn db:init` or `npm run db:init` 
> (`yarn` and `npm run` are equivalent, we will only mention `yarn` from this point on)
1. Start a `redis` instance somewhere. (e.g `docker run -d --rm -p 6379:6379 --name redis redis` to start it locally using docker)
> Remember to update `.env` with the path to your redis instance
1. Run `yarn start:server` to start the server at the port you configured in your `.env`
1. Run `yarn start:worker` to start the worker

## Sending an email
1. Start the server
1. Assuming the HTTP_PORT you configured is `8080`
1. Run:
```
# This will redirect you to GET http://localhost:8080/email?id=s0m3k1nd-ofuu-1dw1-llb3-pr0vid3dt0y4 <-- Your email status
curl http://localhost:8080/email -X POST -H 'Content-Type: application/json' --data '{"from":"me@example.com", "to":["myself@example.com"], "text":"Hello", "html":"<h1>Hello</h1>"}'
```

# Todo
1. More programmatic error responses
> This was designed to help someone read the error output and infer what to fix, but it does not help someone who is trying to update an UI with those messages.
> A simple standard in terms of 'REQUIRED', 'MUST_BE_ARRAY', 'INVALID_EMAIL', 'EMPTY_STRING' (e.g [{field: 'subject', error: 'EMPTY_STRING'}])
1. Monitoring
> I can watch the logs, but it won't send me an email if it goes down, ironically
1. Test coverage report
> No coverage report was implemented..
1. 100% test coverage
> .. but I'm still sure we don't cover 100%
1. CI / CD
> Would put something in CircleCI, but had no time
1. Rolling update
> Could use `docker swarm` for that but also had no time
