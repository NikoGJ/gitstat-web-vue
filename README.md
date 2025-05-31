# gitstat-web-vue

Unofficial port in Vuejs of [gitstat-web](https://github.com/nielskrijger/gitstat-web).

## Features

- Not all features have been ported yet (especially on the Graphs sections)
- Added a "Accumulated" option on Graphs to display running values (useful when combined with the "Lines added - deleted" aggregate option to keep track of LOC of the project)
- Optimizations are not effective. (especially usage of `useMemoize`)

## How to build and run

1. `npm install`
2. `npm run dev`
