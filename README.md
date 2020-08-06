# BackbasePeachtreeBankDemo

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

But I haven't actually written any tests.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

Ditto above.

## Heroku Demo

This demo can be viewed at https://backbase-peachtree-bank-demo.herokuapp.com/.

## Application Structure

Fairly basic Angular application, I think, with the possible exception of `/shared`

* `/src/shared`

  This folder handles types and utility functions. It’s outside `/src/app` because in theory, this app would not be using the fake in-memory-web-api, but instead have an actual API to contact. And that might live in a Node server that also uses these shared files. This allows syncing between server and client code on things like what an API’s URL is, or what its response is. I have leveraged that functionality with the in-memory-web-api, though of course that *is* within `/src/app`.

  * `/src/shared/brands.d.ts`—defines some “branded primitives,” which are a way to kind of “opt in” to some nominal typing in Typescript. In particular, it allows defining types of numbers and strings, that behave just like numbers and strings, but can be indicated by data structures and required by functions. Brands live purely in the type domain—the declaration of `Branded` makes it literally impossible to actually create one in the runtime. We create them via casting our source data, and in dedicated functions for creating these values, but otherwise treat them largely as opaque.

  * `/src/shared/message.ts`—defines the `Message` type used by the modal dialog component and service.
  
  * `/src/shared/sorting.ts`—defines the `Sorting` structure used by the recent transactions component and the transactions service. Also defines `sortingColumns`, a runtime value used to create the sorting buttons in the recent transactions component. This re-use ensures that there is handling for each button and no handling for other types.

  * `src/shared/transactions.ts`—defines the `Transaction` structure, and related structures, used in the transactions service and the recent transactions component, as well as several utility functions. Of note is the `transactionsApiUrlExt` used to guarantee that APIs are served in the same places that requests are being made. Also, the `formatDollars` function gets a lot of workout, and is a simple example of branded primitives in action.

  * `src/shared/user-account.ts`—defines the `UserAccount` structure, used in the user-account service and in the main app component. The `userAccountApiUrlExt` serves a purpose similar to `transactionsApiUrlExt` for transactions.

* Assets in `/src/assets`. Static files (images) used in the app.

* Base

  * `/src/app/app.module.ts`—handles the necessary imports of Angular modules.
  * `/src/app/app.component.*`—defines the root of the application. Most importantly in charge of using the UserAccountService and populating other components with the user’s data.
  * `/src/styles.css`—defines some basic styling, mostly for fonts. Some common styling should probably migrate here, like buttons, inputs, and headers.

* Components:

  * `/src/app/make-a-transfer`—the box by that name in the app: handles taking user input and submitting a new transaction.
  * `/src/app/modal`—for pop-up dialogs that block the screen and force user input. Used to confirm transactions and indicate errors.
  * `/src/app/recent-transactions`—the by this name in the app: handles displaying, sorting, and filtering past transactions. Has no real notion of “recent.”

  Each component has the expected .css, .html, .ts, and .spec.ts files. Haven’t done anything with the .spec.ts files.

* Services:

  * `/src/app/in-memory-data.*.ts`—handles faking a database. Doesn’t actually work for PUT, though, so it’s used as an initial data source that is stored and modified by other services.
  * `/src/app/modal.service.*.ts`—handles showing and hiding modal dialogs.
  * `/src/app/transactions.service.*.ts`—provides functionality for getting and adding transactions. Handles sorting and filtering as well, which might be a strong contender for breaking out into their own services as this project (hypothetically) develops.
  * `/src/app/user-account.service.*.ts`—provides functionality for getting and updating the user.
