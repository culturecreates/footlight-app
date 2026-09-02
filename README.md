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

## Deployment

Deployments are automatic. Merging a branch triggers the build and deploy for that environment — there is no manual build or upload step.

| Environment | Branch    | Build script               | Hosted at                  | Workflow                                           |
| ----------- | --------- | -------------------------- | -------------------------- | -------------------------------------------------- |
| Staging     | `develop` | `npm run build:staging`    | `staging-cms.footlight.io` | `.github/workflows/build-staging-deploy-s3.yml`    |
| Production  | `main`    | `npm run build:production` | `cms.footlight.io`         | `.github/workflows/build-production-deploy-s3.yml` |

Each workflow builds the app, syncs `build/` to the S3 bucket, and invalidates the CloudFront distribution. The production workflow also runs the Cypress regression suite (`@essential`) and sends a release notification email on success.

Note: plain `npm run build` builds in **staging** mode. Use `npm run build:production` for a production build.

### Environment variables

`.env.staging` and `.env.production` are committed and selected by the Vite `--mode` flag.

The Google Maps credentials are not committed — CI appends `VITE_APP_GOOGLE_MAPS_API_KEY` and `VITE_APP_GOOGLE_MAPS_ID` from GitHub secrets at build time. Add them to your local env file when developing, or map features will not load.

If you add a new secret environment variable, add it to the GitHub repository secrets and to the "Add extra env variables" step of both deploy workflows.

## Release Workflow

### 1. Create a branch

Branch from the appropriate base branch. Branch names are linted (`branch-name-lint.json`), so use one of the allowed prefixes:

- `feature/issue-<number>` — new features
- `bugfix/issue-<number>` — bug fixes
- `task/issue-<number>` — tasks
- `hotfix/issue-<number>` — urgent production fixes

### 2. Raise a pull request to `develop`

Push the branch and open a PR against `develop`. These checks run automatically:

- Cypress regression tests (`.github/workflows/trigger-cypress-tests-on-pull-request.yml`)
- GitGuardian secrets scanning
- Amplify PR preview deployment

Make sure all required checks pass before moving on.

### 3. Code review

Assign the PR for review. It needs at least one human approval. Address any comments and re-verify the checks afterwards.Also,good to have a github copilot review.

### 4. Client testing on the PR preview

Once review is complete, assign the issue to the Client and ask them to test on the Amplify PR preview environment. Wait for their confirmation before merging.

### 5. Merge to `develop` and test on staging

Merge the PR. This deploys to staging automatically — confirm the workflow succeeds, then do one round of testing on `staging-cms.footlight.io`.

### 6. Create the production release PR

Once staging is verified, open a PR from `develop` to `main` and assign a reviewer. The reviewer may merge it themselves once approved.

### 7. Monitor the production deployment

After the merge, watch GitHub Actions until the production deploy completes. The regression suite runs alongside it — if any test fails, create a GitHub issue for the failure and assign it to the right person.

To verify the deploy: check that the workflow is green and the change is visible on `cms.footlight.io`.

To roll back, revert the merge commit on `main`; the pipeline redeploys the previous state.

### 8. Production smoke test and client verification

Smoke test production, confirm the primary functionality works, then assign the issue to the Client for final verification. The issue is complete once they confirm.

### 9. Tag the release

Once the release is complete, create a tag on `main` in the repository's Releases section with the release notes describing what shipped.

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
