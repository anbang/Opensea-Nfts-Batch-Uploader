// Works with only MateMask wallets
const chromeLauncher = require("chrome-launcher");
const axios = require("axios");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Config
// [
//   {
//     name: "Hello #0305",
//     type: "Hello",
//     link: "https://www.123.com/",
//     des: "xxxx.",
//   },
// ];
const arr = require("./config/nfts/index.json");
const extension_path = "./config/extension/metamask-chrome";
const collection_name = "block123";

// Set to true to check if NFT has already been uploaded
const searchBeforeUpload = false;

(async () => {
  try {
    // Load metamask extension, replace path with your own
    const pathToExtension = require("path").join(__dirname, extension_path);
    const newFlags = chromeLauncher.Launcher.defaultFlags().filter(
      (flag) => flag !== "--disable-extensions" && flag !== "--mute-audio"
    );

    newFlags.push(`--start-maximized`, `--load-extension=${pathToExtension}`);

    // Launch chrome
    const chrome = await chromeLauncher.launch({
      ignoreDefaultFlags: true,
      chromeFlags: newFlags,
    });
    const response = await axios.get(
      `http://localhost:${chrome.port}/json/version`
    );
    const { webSocketDebuggerUrl } = response.data;

    // Copy this log somewhere after initial script run
    console.log(webSocketDebuggerUrl);

    // Connecting the instance using `browserWSEndpoint`
    // Replace "webSocketDebuggerUrl" with what you copied before second run to connect
    // to same chrome instance where you've already logged into opensea with metamask
    const target =
      "ws://localhost:60707/devtools/browser/7adffc22-b9e3-4c2d-9b72-37597305b209";
    const browser = await puppeteer.connect({
      //   browserWSEndpoint: target,
      browserWSEndpoint: webSocketDebuggerUrl,
      defaultViewport: null,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(1000 * 200);

    // create errors stream
    const stream = fs.createWriteStream(path.join(__dirname, "errors.log"), {
      flags: "a",
    });

    // Begin upload
    for (let i = 0; i < arr.length; i++) {
      let uploaded = false;
      try {
        if (searchBeforeUpload) {
          await page.goto(`https://opensea.io/collection/${collection_name}`);

          await page.waitForSelector("input[placeholder=Search]");
          await page.type("input[placeholder=Search]", arr[i].name, {
            delay: 10,
          });
          await page.keyboard.press("Enter");

          try {
            // select listing
            await page.waitForSelector(
              "#main > div > div > div:nth-child(4) > div > div > div > div.AssetSearchView--results.collection--results > div.Blockreact__Block-sc-1xf18x6-0.dBFmez.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div > article > a > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.SpaceBetweenreact__SpaceBetween-sc-jjxyhg-0.AssetCardFooterreact__StyledContainer-sc-nedjig-0.bFcjdD.jYqxGr.gJwgfT.cBTfDg"
            );
            await page.click(
              "#main > div > div > div:nth-child(4) > div > div > div > div.AssetSearchView--results.collection--results > div.Blockreact__Block-sc-1xf18x6-0.dBFmez.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div > article > a > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.SpaceBetweenreact__SpaceBetween-sc-jjxyhg-0.AssetCardFooterreact__StyledContainer-sc-nedjig-0.bFcjdD.jYqxGr.gJwgfT.cBTfDg"
            );
            uploaded = true;
          } catch (error) {
            if (
              error ==
              "TimeoutError: waiting for selector `#main > div > div > div:nth-child(4) > div > div > div > div.AssetSearchView--results.collection--results > div.Blockreact__Block-sc-1xf18x6-0.dBFmez.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div > article > a > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.SpaceBetweenreact__SpaceBetween-sc-jjxyhg-0.AssetCardFooterreact__StyledContainer-sc-nedjig-0.bFcjdD.jYqxGr.gJwgfT.cBTfDg` failed: timeout 10000ms exceeded"
            ) {
              uploaded = false;
            }
          }
        }

        if (uploaded) {
          continue;
        }

        await page.goto(
          `https://opensea.io/collection/${collection_name}/assets/create`
        );

        // select nft for upload
        await page.waitForSelector("input[type=file]");
        const inputUploadHandle = await page.$("input[type=file]");

        // Replace with your path
        let fileToUpload = require("path").join(
          __dirname,
          `/config/nfts/imgs/${arr[i].name}.jpg`
        );
        console.log("fileToUpload:", fileToUpload);

        inputUploadHandle.uploadFile(fileToUpload);

        // Enter data about the NFT
        await page.waitForSelector("#name");
        await page.type("#name", arr[i].name, { delay: 10 });

        await page.waitForSelector("#external_link");
        await page.type("#external_link", arr[i].link, { delay: 20 }); // TODO:

        await page.waitForSelector("#description");
        await page.type("#description", arr[i].des, { delay: 10 }); // TODO:

        // Properties
        // td[aria-label="yes"]
        await page.waitForSelector(
          '#main section.Blockreact__Block-sc-1xf18x6-0.chQkbM button[aria-label="Add properties"]'
        );
        await page.click(
          '#main section.Blockreact__Block-sc-1xf18x6-0.chQkbM button[aria-label="Add properties"]'
        );
        await page.waitForSelector(".AssetPropertiesForm--name-input");
        await page.type(
          'input[aria-label="Provide the property name"]',
          "Animal",
          { delay: 10 }
        );
        await page.type(
          'input[aria-label="Provide the property value"]',
          arr[i].type,
          { delay: 10 }
        );
        await page.click(
          "div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.jYqxGr footer button"
        );

        // 选择Blockchain
        // console.log("Blockchain");
        // await page.waitForSelector("#main  form  #chain");
        // await page.click("#main  form  #chain");

        // console.log("选择Blockchain");
        // await page.waitForSelector(".tippy-box .tippy-content", {
        //   visible: true,
        // });
        // await page.click(".tippy-box .tippy-content");

        // create button
        console.log("create button");
        await page.waitForSelector(
          "#main  form  div.AssetForm--submit  button"
        );
        await page.click("#main  form  div.AssetForm--submit  button");

        // cancel dialog
        await page.waitForSelector(
          "div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.gWXeYL.jYqxGr > button"
        );
        await page.click(
          "div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.gWXeYL.jYqxGr > button"
        );

        // sell button
        await page.waitForSelector(
          "#main > div > div > div.OrderManagerreact__DivContainer-sc-rw3i3h-0.gpKFGZ > div > span:nth-child(2) > a"
        );
        await page.click(
          "#main > div > div > div.OrderManagerreact__DivContainer-sc-rw3i3h-0.gpKFGZ > div > span:nth-child(2) > a"
        );

        // Change 0.001 to your desired listing price
        await page.waitForSelector("input[name=price]");
        await page.type("input[name=price]", "1");

        await page.waitForSelector("button[type=submit]");
        await page.click("button[type=submit]");

        // Sign sell transaction on opensea
        await page.waitForXPath(
          "/html/body/div[4]/div/div/div/section/div/div/section/div/div/div/div/div/div/div/button"
        );
        const [signbtn] = await page.$x(
          "/html/body/div[4]/div/div/div/section/div/div/section/div/div/div/div/div/div/div/button"
        );
        await signbtn.click();

        // Open metamask and sign sell transaction
        browser.on("targetcreated", async (target) => {
          //
          const newpage = await target.page();
          await newpage.waitForSelector(
            "#app-content > div > div.main-container-wrapper > div > div.request-signature__footer > button.button.btn-secondary.btn--large.request-signature__footer__sign-button"
          );
          await newpage.click(
            "#app-content > div > div.main-container-wrapper > div > div.request-signature__footer > button.button.btn-secondary.btn--large.request-signature__footer__sign-button"
          );
        });

        // wait for confirmation
        await page.waitForFunction(
          () =>
            !!document.querySelector(
              "div.AssetSuccessModalContentreact__DivContainer-sc-1vt1rp8-1.gtISVn"
            )
        );
      } catch (error) {
        // write any errors to error log
        stream.write(arr[i].name + " " + "(" + error + ")" + "\n");
        console.log(error);
        continue;
      }
    }
    await browser.close();
    await chrome.kill();
  } catch (error) {
    console.log(error);
  }
})();
