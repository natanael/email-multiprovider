# Running locally
1. Copy `.env.example` to `.env` and fill in with your details
1. Run `yarn` or `npm install`, this application was tested with NodeJS `10.16`

## Running tests
1. Run `yarn test`

## Running the server
1. Run `yarn db:init` or `npm run db:init` 
> (`yarn` and `npm run` are equivalent, we will only mention `yarn` from this point on)
1. Run `yarn start` to start the server at the port you configured in your `.env`

## Sending an email
1. Start the server
1. Assuming the HTTP_PORT you configured is `8080`
1. Run:
```
# This will redirect you to GET http://localhost:8080/email?id=999 <-- Your email status
curl -L http://localhost:8080/email -X POST --data '{"from":"me@example.com", "to":["myself@example.com"], "text":"Hello", "html":"<h1>Hello</h1>"}'
```

# Todo
1. More programmatic error responses
  This was designed to help someone read the error output and infer what to fix, but it does not help someone who is trying to update an UI with those messages.
  A simple standard in terms of 'REQUIRED', 'MUST_BE_ARRAY', 'INVALID_EMAIL', 'EMPTY_STRING' (e.g [{field: 'subject', error: 'EMPTY_STRING'}])
1. Monitoring
1. Test coverage report
  1. 100% test coverage
1. CI / CD
  1. Rolling update
