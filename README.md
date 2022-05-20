# @sqds/squads
## A Library to Interact with the Squads Platform

### Development

There are two packages in this repo: `squads` and `tests`.

`squads` contains all of the source code for the library which is built and pushed to NPM.

`tests` uses the `squads` package as a dependency and contains tests which use the package and verify its behavior.

#### Building the Package

Building the main package means taking the Typescript files in the `squads` package and generating the transpiled JS along with type declarations in the `lib/` folder.

You'll want to make sure you have the latest dependencies by running `yarn`.

Then the build is done by running `yarn build` in the `squads/` directory.

This is *required* in order to test the package or to publish the package to NPM.

#### Running Tests

Before running tests, make sure that you have built the version of the main package which you'd like to test.

Also make sure you are in the `tests/` directory (`cd tests/`).

You may need to install dependencies for this package (run `yarn`) if you haven't already done so in this package.

Then, (*even if you have installed dependencies before*) pull the newest built version of the main package into your testing dependencies by running:
```
yarn upgrade --force @sqds/squads-local
```

And finally, run the tests with `yarn test`.
