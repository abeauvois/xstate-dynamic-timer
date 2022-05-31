# TODO.md

## Features

- [x] As a User I see my username on top of my timer
- [x] As a User I see the task name in my Activity (above my username)
- [x] As a User, I don't see Slider, Reset and any other buttons, as an Admin I do
- [x] As a User, I see my new Activity in a Paused state
- [ ] As a User I must ask an Admin to start my timer
  - [x] create persistence (firebase)
  - [x] create user,task, effect models and events
  - [x] add askStartTask and acceptStartTask
  - [x] sync Firebase Activity state with Activity internal state
    - [x] User sees his activities and ASK for starting an activity => firebase **asking**
    - [x] Admin sees all activities **of his family** requesting ACCEPT => firebase **accepted**
    - [x] User sees his activity **running** requesting ACCEPT => firebase **running**
    - [x] User sees his activity **paused** when elapsed = duration => firebase **paused**
    - [x] Admin sees user activity **paused** when elapsed = duration => firebase **paused**
    - [x] User sees begin of the day his activity **initialized** when new day => firebase **initialized**
- [ ] As a User, I see my Activity duration as the one of the Task & elapse=0
- [ ] As an Admin I can send a penalty, it should reduce the duration
- [ ] As a Backend I can send a penalty, it should reduce the duration
- [ ] As a User I have to sign up then sign in

## Tests

- [x] timerMachine
- [ ] risk: mock firebase DB access (or check location url = localhost)

## Refactor

- [ ] move timerMachines to the backend
- [ ] use Server Source Events to update clients with timers states

## IT Stack

- [x] use Node LTS 14.19.0
- [x] use pnpm
- [x] use CRA2 latest
- [x] use React latest
- [x] use Typescript latest
- [x] use Firebase
- [x] migrate to vitejs
- [x] add jest jest-environment-jsdom vite-jest -D => issue with --watch
- [x] add some tests
- [x] add vitest

## troubleshouting
