# Hublo Front Plugin

## Quick start
- Clone this repository.
- From within the repository, run `yarn install`.
- Make a copy of the `.env.sample` file and rename it `.env`. Fill it with the values of your Postgres database.
- Run `yarn dev` to run the app in development mode.
- Open a browser and visit [https://localhost:3000](https://localhost:3000) to accept the unsafe HTTPS connection.
- Open Front in the same browser as the above step, and add https://localhost:3000 as a plugin in your Front account, in dev mode.

Note: because plugins must be served over HTTPS, when developing locally it's easier to do everything in the web app. Once your plugin is ready for production, it will work in the exact same way in the desktop app as it does in the web app.

The plugin will reload if you make edits.<br />
You will also see any lint errors in the console.

## Dev commands
The project is split into two pieces: a client serving the plugin files, and a minimalist server fetching data from a Postgres database.
- `yarn start` will run the client code only.
- `yarn server` will run the server code only.
- `yarn dev` is a combination of both.

If you change the front-end code (a.k.a. the React app), you should build the app with `yarn build` before deploying.