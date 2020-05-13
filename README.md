# Unity Text to Speech React Project with Node Express Backend

> NodeJS project to update Cisco Unity Call Handler's using Google's Cloud Text to Speech via Ngrok, Twilio and Weather.gov

![](https://github.com/sieteunoseis/cisco-unity-tts-app/blob/master/client/src/assets/cover-1.png)

## Usage

Install [nodemon](https://github.com/remy/nodemon) globally

```
npm i nodemon -g
```

Install [pm2](https://www.npmjs.com/package/pm2) globally

```
sudo npm install pm2@latest -g
```

Install server and client dependencies

```
yarn
cd client
yarn
```

### Development Mode

To start the server and client at the same time (from the root of the project).
```
yarn dev
```

In development mode a Ngrok tunnel will also be created to aid in development. Status of the tunnel can be view at:

http://localhost:4040/status

### Production Mode

Running the production build on localhost. This will create a production build, then Node will serve the app on http://localhost:5000. Note: PM2 needs to be installed.

```
NODE_ENV=production yarn dev:server
```

## How this works

The key to using an Express backend with a project created with `create-react-app` is on using a **proxy**. We have a _proxy_ entry in `client/package.json`. You may need to update this depending on your enviroment.

```
"proxy": "http://localhost:5000/"
```

[Sample NGINX config](https://github.com/sieteunoseis/cisco-unity-tts-app/blob/master/nginx-sample.txt)

This tells Webpack development server to proxy our API requests to our API server, given that our Express server is running on **localhost:5000**

## Google Cloud Text to Speech

1. Create a project (or use an existing one) in the [Cloud Console](https://console.cloud.google.com/).
2. Make sure that [billing](https://console.cloud.google.com/billing?project=_) is enabled for your project.
3. Enable the [Text-to-Speech API](https://console.cloud.google.com/flows/enableapi?apiid=texttospeech.googleapis.com).
4. Create a [Service Account](https://console.cloud.google.com/apis/credentials?project=_).
5. Download [key](https://console.cloud.google.com/iam-admin/serviceaccounts). Select Project created in step 1, then Actions > Create Key. 
6. Using service account key, create enviromental variable. export GOOGLE_APPLICATION_CREDENTIALS="[PATH]/[FILE_NAME].json"

## Ngrok

Optional ngrok settings

export NGROK_SUBDOMAIN='insert subdomain'
export NGROK_AUTH_TOKEN='insert authtoken from ngrok.com'

View status at: http://localhost:4040/status

## Openconnect

I'm using a droplet on [DigitalOcean](https://www.digitalocean.com/) to connect to Cisco's DevNet sandbox. I wrote a script that uses openconnect to create a vpn tunnel to the sandbox. You'll need to edit the text file vpnmaker.txt with your creds.

```
Permissions:
chmod +x openconnect.sh

To run:
./openconnect -c 20160

To disconnect:
./openconnect -d
```

## Blog

Visit my [blog post](https://medium.com/@jeremyworden/using-apis-to-automate-cisco-s-unity-connection-call-handlers-9ad71b1d973f) entry for write up on application.

## Giving Back

If you would like to support my work and the time I put in creating the code, you can click the image below to get me a coffee. I would really appreciate it (but is not required).

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/automatebldrs)

-Jeremy Worden
