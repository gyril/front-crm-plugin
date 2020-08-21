## What is this?
This project demonstrates how to build a simple companion app for Front, that will display data based on the recipient of the message that is currently in view in Front.

![Image of the plugin](/screenshot.png)

## Getting Started (using the hosted version)
We're making available a hosted version of this repository. You won't be able to edit its code, which will remain the same as this repository's master branch, but you can use it to test your backend server. To use the hosted version, add the following URL as a plugin in Front:
https://companion-plugin.web.front.app/endpoint=ENDPOINT_URL.

Replace `ENDPOINT_URL` with the **URI-encoded** endpoint of your server (you can use the handy Javascript `encodeURIComponent` to encode it). For example, to use the hosted version with our sample Airtable server, you would add: `https://companion-plugin.web.front.app/?endpoint=https%3A%2F%2Fairtable-companion-server.front.solutions` as a plugin in Front.

## Getting Started (locally)

### Serving the plugin files locally
- Clone this repository.
- From within the repository, run `yarn install`.
- Edit `src/Config.js` and have it point to a server of your choice. See below for further explanation, and see [front-companion-server](https://github.com/gyril/front-companion-server) for a sample server implementation.
- Run `yarn start` to run the app in the development mode.

### Adding the plugin to Front
Note: because plugins must be served over HTTPS, when developing locally it's easier to do everything in the web app. Once your plugin is ready for production, it will work in the exact same way in the desktop app as it does in the web app.

- Open a browser and visit [https://localhost:3000](https://localhost:3000) to accept the unsafe HTTPS connection.
- Open Front in the same browser as the above step, and add https://localhost:3000 as a plugin in your Front account, in dev mode.

The plugin will reload if you make edits.<br />
You will also see any lint errors in the console.

## How to use this project
This plugin creates a bridge between a conversation displayed in Front, and a contact record that you keep in a separate system. Every time the selected conversation changes in Front, a `GET` call will be made to the following URL: `https://your.api.domain/your_uri?auth_secret=APP_SECRET&contact_key=CONTACT_KEY`

- `https://your.api.domain/your_uri` is the endpoint you will provide that will return the contact data. You can set it in the `src/Config.js` file.
- `APP_SECRET` is the randomly-generated secret for your app. You will find it in the plugin's settings in Front. Use it to authenticate the call, and only reply when the secret sent matches the secret you should expect.
- `CONTACT_KEY` is the key that identifies the contact displayed. For an email conversation, it will be an email address; for a Twitter conversation, a Twitter handle; for a text conversation, a phone number; etc.

The expected response to this call should be valid JSON blob of the following structure:
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

## Building and deploying

### `yarn build`

Once you're ready to deploy your app, use `yarn build` to build the app for production. Production files will appear in the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed! Serve it over HTTPS and add its URL as a plugin in your Front account, and you should be all set.

**Do not forget to edit `src/Config.js` with your production API endpoint.**