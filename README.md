# Unity Text to Speech React Project with Node Express Backend

> App to update Cisco Unity Call Handler's using Google's Cloud Text to Speech

## Usage

Install [nodemon](https://github.com/remy/nodemon) globally

```
npm i nodemon -g
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

Running the production build on localhost. This will create a production build, then Node will serve the app on http://localhost:5000

```
NODE_ENV=production yarn dev:server
```

## How this works

The key to using an Express backend with a project created with `create-react-app` is on using a **proxy**. We have a _proxy_ entry in `client/package.json`. You may need to update this depending on your enviroment.

```
"proxy": "http://localhost:5000/"
```

This tells Webpack development server to proxy our API requests to our API server, given that our Express server is running on **localhost:5000**

## Blog

Visit my [blog post](https://medium.com/@jeremyworden/using-apis-to-automate-cisco-s-unity-connection-call-handlers-9ad71b1d973f) entry for write up on application.

## Openconnect

I'm using a droplet on [DigitalOcean](https://www.digitalocean.com/) to connect to Cisco's DevNet sandbox. I wrote a script that uses openconnect to create a vpn tunnel to the sandbox. You'll need to edit the text file vpnmaker.txt with your creds.

```
To run:
./openconnect -c 20160

To disconnect:
./openconnect -d

Permissions:
chmod +x openconnect.sh
```

## Giving Back

If you would like to support my work and the time I put in creating the code, you can click the image below to get me a coffee. I would really appreciate it (but is not required).

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/automatebldrs)

-Jeremy Worden
