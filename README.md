# Scrum Poker

Web tool for collaborative guessing of scrum story complexity. Roles:

* Leader
  * Creates the session
  * Can reset votes when discussing the next story
  * Can reveal the current votes

* Guesser
  * Votes or abstains from voting the current story

* Observer
  * Can do nothing but watch the process

All roles will see the result of voting and the votes of every guesser after they were revealed by the leader.

## Development

### Goal

Test frameworks like WebSockets, Socket.IO and Bootstrap with Angular. Have fun with creating different themes.

### Setup

Make sure NodeJS 18 and npm 8+ is installed. Run the command

> npm i

in project root and folders scrum-poker and scrum-poker-server.

### Starting the application

1. Start the backend in folder scrum-poker-server: `npm run dev`
2. Start the frontend in folder scrum-poker: `npm run start`
3. Open http://localhost:4200 in browser.
