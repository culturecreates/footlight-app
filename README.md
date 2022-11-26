# Footlight App

This is the frontend for the footlight application.

This is a create react app project.

## Available Scripts

In the project directory, you can run:

### `npm run start:staging`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build:production`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Project structure

```
├── build                   # Production build folder
├── commitlint.config.js    # Commit linter configuration file (https://github.com/conventional-changelog/commitlint)
├── eslintrc.json           # Eslint and prettier configurations for formatting code
├── branch-name-lint.json   # Branch naming conventions configuration
├── package.json            # project dependencies
├── public                  # More info about public folder here(https://create-react-app.dev/docs/using-the-public-folder/)
├── src                     # Source Code
	├── App.jsx             # Main App component
	├── assets              # images, icons and etc...
	├── components          # components folter
	├── config              # configurations
    ├── constants           # constants used in the project
	├── hooks               # custom hooks
	├── index.css           # main css file
	├── index.jsx           # Root app script file
	├── layouts             # custom layout wrappers
	├── locales             # translations file
	├── pages               # pages
	├── router              # routes & file related to routing
	├── services            # API slices (https://redux-toolkit.js.org/tutorials/rtk-query#create-an-api-service)
	├── redux               # Redux reducers
	├── theme               # Configuration for styles
	└── utils               # Reuseable helper methods
└── package-lock.json       # dependencies

```

## Component Structure

```
    MyComponent.jsx             #Component file
    myComponent.css            #File for styles
    index.js                    #File for default export
```

## Commit Format

```
  Real world examples can look like this:

chore: run tests on travis ci
fix(server): send cors headers
feat(blog): add comment section

Common types according to commitlint-config-conventional can be:

build
chore
docs
feat
fix
refactor
revert
style
test
```
