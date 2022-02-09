# Opensea Nfts Batch Uploader

Batch create and sell NFTs on Opensea.

**Power By Node.js**

## Prerequisites

- Node.js
- npm
- Chrome
- Matemask: https://github.com/MetaMask/metamask-extension/releases

## Step

1. npm install
2. cr

# Run

Copy the source code to your machine and run `node nftuploader.js`, a chrome instance should open.
The script should stop because you're not yet signed in to Metamask in the opened chrome intsance. Sign in to metamask.
Your terminal should log a path-like string, replace "websocketDebuggerUrl" in the line below with this string.

```node
const browser = await puppeteer.connect({
  browserWSEndpoint: webSocketDebuggerUrl,
  defaultViewport: null,
});
```

Run `node nftuploader.js` again in a new terminal window, you should now be connected to the same chrome instance and the bot should be working.

Errors will be logged in an errors.log file.

Feel free to [Contact me](mailto:ishola.freelance@gmail.com) if you have any questions and be sure to leave a star.

## log file

`/errors.log`
