## What is this?
This project demonstrates how to build a simple companion app for Front, that will display data based on the recipient of the message that is currently in view in Front.

![Image of the plugin](/screenshot.png)

## Pre-requisite
This project uses an Airtable database (or "base") to demonstrate the possibilities of creating a plugin between Front and an external system. Follow these steps to create a base that is compatible with this project:
- Create an Airtable account.
- Open [this base](https://airtable.com/shrsvAFoN10mASCl0/tbldRw3cOpvbSRwhg/viwUjDGw3BTVUeJNi?blocks=bipzrtMrMP3Pbr7vF).
- In the top-right corner, click "Copy base".

![Excerpt of the Airtable base](/airtable.png)

## Super quick start
A hosted version of this plugin is made available for testing purposes.<br />
To test the plugin with your own Airtable data, add the following URL as a plugin in your Front account:<br />
`https://front-companion.herokuapp.com/?airtable_key=YOUR_AIRTABLE_KEY&airtable_base=YOUR_AIRTABLE_BASE_ID`

Once you've confirmed that the plugin code works with your Airtable base, you can download the source code and edit it to suit your needs.

## Quick start
- Clone this repository.
- From within the repository, run `yarn install`.
- Make a copy of the `.env.sample` file and rename it `.env`. 
- Find your Airtable key and Airtable base ID [here](https://airtable.com/api) and update the `AIRTABLE_KEY` and `AIRTABLE_BASE` values in the `.env` file.
- Run `yarn dev` to run the app in development mode.
- Open a browser and visit [https://localhost:3000](https://localhost:3000) to accept the unsafe HTTPS connection.
- Open Front in the same browser as the above step, and add https://localhost:3000 as a plugin in your Front account, in dev mode.

Note: because plugins must be served over HTTPS, when developing locally it's easier to do everything in the web app. Once your plugin is ready for production, it will work in the exact same way in the desktop app as it does in the web app.

The plugin will reload if you make edits.<br />
You will also see any lint errors in the console.

## Dev commands
The project is split into two pieces: a client serving the plugin files, and a minimalist server fetching data from an external system (in this case, the external system is Airtable).
- `yarn start` will run the client code only.
- `yarn server` will run the server code only.
- `yarn dev` is a combination of both.

## How to use this project
This plugin creates a bridge between a conversation displayed in Front, and a contact record that you keep in a separate system. Every time the selected conversation changes in Front, a `GET` call will be issued by the client to the server. The client expects a response that should be valid JSON blob of the following structure:

```
{
  "data":
    "contact" {
      "name": String,
      "email": String (a valid email address),
      "data": [
        {"type": Type, "label": String, "value": TypeValue},
        etc.
      ]
    },
    "account" {
      "name": String,
      "url": String (a valid, full URL),
      "data": [
        {"type": Type, "label": String, "value": TypeValue},
        etc.
      ]
    }
}
```

The `data` Arrays of `contact` and `account` are optional. Their available `Type`s are:
- `phone`: `TypeValue` must be a `Number` that is E.164-compliant.
- `date`: `TypeValue` must be an ISO-formatted date string.
- `currency`: `TypeValue` can be any `Number`.
- `badge`: `TypeValue` can be any object that can be cast to a string. It will displayed in a badge format.
- `string`: `TypeValue` can be any object that can be cast to a string.
- `list`: `TypeValue` must be an Array of Strings.

## Building and deploying

### `yarn build`
Once you're ready to deploy your plugin, use `yarn build` to build the client code for production. Production files will appear in the `build` folder and copied to the `server/build`.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The client build is minified and the filenames include the hashes.<br />
The server is set to serve files from the `server/build` folder.

**To secure communication between Front and your plugin, do not forget to add your plugin's authentication secret as the `AUTH_SECRET` environment variable.**