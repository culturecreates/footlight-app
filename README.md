# Footlight App

This is the frontend for footlight CMS application.

## Tech Stack

- React 18
- Vite 7
- React Router
- Redux Toolkit + RTK Query
- Ant Design

## Prerequisites

- Node.js 22.15.0 or newer
- npm

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the Vite development server:

```bash
npm run dev
```

The app is served by Vite (default: http://localhost:5173).

Alternative start scripts for environment modes:

```bash
npm run start:staging
npm run start:production
```

Note: `npm start` is mapped to Vite and is equivalent to running `vite`.

## Build

Create a production-ready build:

```bash
npm run build
```

This outputs static files to the `build/` directory.

Mode-specific builds:

```bash
npm run build:staging
npm run build:production
```

## Preview Built App

Preview the most recent build locally:

```bash
npm run preview
```

Mode-specific preview scripts:

```bash
npm run preview:staging
npm run preview:production
```

## Linting and Formatting

```bash
npm run lint
npm run lint:fix
npm run format
```

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
└── vite.config.js          # Vite Configuration
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
