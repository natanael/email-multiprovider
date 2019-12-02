# About
This is a NodeJS API the uses both `mailgun` and `sendgrid` API's to send emails
It is just a proof of concept with mere hours into it, so many edges are still rough
How it works:
- Validate the POST /email request
- Store the `emailRequest` on redis
- Return the link to check the status of the request `GET /email?id=uuid`
- A worker runs every second and will send the emails either by `mailgun` or `sendgrid`.
> It shuffles and tries all unless one works
> The sendgrid implementation is set to fail randomly 50% of the time
- After processing the your email is given a TTL of 60 seconds and after that it will be forgotten forever
>  (well, the logs still reference it, and the recipients will have it)

# Running locally
- Copy `.env.example` to `.env` and fill in with your details
- Run `yarn` or `npm install`, this application was tested with NodeJS `10.16`

## Running tests
- Run `yarn test`

## Running the server
- Run `yarn db:init` or `npm run db:init` 
> (`yarn` and `npm run` are equivalent, we will only mention `yarn` from this point on)
- Start a `redis` instance somewhere. (e.g `docker run -d --rm -p 6379:6379 --name redis redis` to start it locally using docker)
> Remember to update `.env` with the path to your redis instance
- Run `yarn start:server` to start the server at the port you configured in your `.env`
- Run `yarn start:worker` to start the worker

## Sending an email
- Start the server
- Assuming the HTTP_PORT you configured is `8080`
- Run:
```
# This will redirect you to GET http://localhost:8080/email?id=s0m3k1nd-ofuu-1dw1-llb3-pr0vid3dt0y4 <-- Your email status
curl http://localhost:8080/email -X POST -H 'Content-Type: application/json' --data '{"from":"me@example.com", "to":["myself@example.com"], "text":"Hello", "html":"<h1>Hello</h1>"}'
```

# Todo
- More programmatic error responses
> This was designed to help someone read the error output and infer what to fix, but it does not help someone who is trying to update an UI with those messages.
> A simple standard in terms of 'REQUIRED', 'MUST_BE_ARRAY', 'INVALID_EMAIL', 'EMPTY_STRING' (e.g [{field: 'subject', error: 'EMPTY_STRING'}])
- A proper concurrency control for multiple workers
> There is nothing there, no partitioning, no app lock, we can only have one worker per db or we risk sendind the same email twice
- Monitoring
> I can watch the logs, but it won't send me an email if it goes down, ironically
- Test coverage report
> No coverage report was implemented..
- 100% test coverage
> .. but I'm still sure we don't cover 100%
- CI / CD
> Would put something in CircleCI, but had no time
- Rolling update
> Could use `docker swarm` for that but also had no time
