# tic-tac-toe-handler
aws lambda handler for tic-tac-toe implementation

# build and run

1. clone this repo
2. `npm i`
3. `npm run build`
4. `npm run watch:dev`

number 4 assumes you've started docker compose from the root `reacting` folder.

# smoke test the api

## in dev

`npm run test:curl` 👈 only works if docker compose is up

## prod API

You can curl the prod API by copying the `test:curl` command, but you have to include the `x-api-key` header, along w/ a valid API key.