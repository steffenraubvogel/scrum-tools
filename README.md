# Scrum Tools

## Available Tools

### Planning Poker

Web tool for collaborative guessing of scrum story complexity. Roles:

- Moderator

  - Creates the session
  - Can reset votes when discussing the next story
  - Can reveal the current votes
  - Can nudge distracted guessers ;)

- Guesser

  - Votes or abstains from voting the current story

- Observer

  - Can do nothing but watching the process

All roles will see the result of voting and the votes of every guesser after they were revealed.

### Wheel of names

Simple wheel of fortune with configurable names. Can be used to pick a person for some task.

## Development

### Setup

Make sure NodeJS 18+ and npm 10+ is installed. Run the command

> npm i

in project root and folders scrum-tools-ui and scrum-tools-server.

### Code Formatting

Use prettier and format on save. Organize imports on save, too.

### Starting the application

1. Start the backend in folder scrum-tools-server: `npm run dev`
2. Start the frontend in folder scrum-tools-ui: `npm run start`
3. Open http://localhost:4200 in browser.

### Testing

After starting the application, you can run Playwright end-to-end tests with `npm run e2e`. To develop new tests,
call `npm run e2e:dev` instead which will open the Playwright UI.

## Deployment

In the project root, run the _build.sh_ which builds and assembles the whole application to _dist_ folder.
Once built, you can adapt _run.sh_ environment variables as you need it and run the file.
