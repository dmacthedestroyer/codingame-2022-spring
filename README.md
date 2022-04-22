# Codingame Spring 2022 Challenge Bot Submission

Typescript bot for the [Codingame Spring 2022 Challenge](https://www.codingame.com/contests/spring-challenge-2022). 

It's actually submitted as a Javascript bot, as the source code is transpiled and bundled into a single JS file and submitted via the [CodinGame sync feature](https://www.codingame.com/forum/t/codingame-sync-beta/614).

This repo was bootstrapped using the excellent [codingame-ts-starter](https://github.com/sinedied/codingame-ts-starter) project.

## Usage

Run either `npm start` or `npm run build` to generate the output file, then start the CodinGame Sync tool and choose to sync the `dist/index.js` file.

### Commands

- `npm start`: build your code in watch mode (it will automatically recompile on change).
  Note that in this mode code size optimizations are NOT performed, use `npm run build` for that.
- `npm run build`: build your code once, with tree-shaking and minification
- `npm run test`: run unit tests once
- `npm run test:watch`: run unit tests in watch mode
