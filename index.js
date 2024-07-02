import { plugin } from "puppeteer-with-fingerprints";
import dotenv from "dotenv";

dotenv.config();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fingerprints = await plugin.fetch("", {
  tags: ["Microsoft Windows", "Chrome"],
});
plugin.useFingerprint(fingerprints);
const browser = await plugin.launch({
  headless: false,
  minBrowserVersion: 112,
  minWidth: 1366,
  minHeight: 768,
  maxWidth: 1920,
  maxHeight: 1088,
});
const page = await browser.newPage();

try {
  // Navigate to the page
  await page.goto("https://www.browserscan.net/", {
    waitUntil: "load",
  });
  console.log("Page loaded");
  await sleep(15 * 1000);
  await page.screenshot({ path: "shot.jpeg", fullPage: true });
  console.log("Screenshot taken");

  // Inject script to intercept the click and load content in the same page
  await page.evaluate(() => {
    const button = document.querySelector("a._1rbf5rt");
    if (button) {
      button.addEventListener("click", async (event) => {
        event.preventDefault();

        // Fetch the content from the feedback page
        const response = await fetch("/feedback");
        const newContent = await response.text();

        // Update the DOM with the new content
        document.body.innerHTML = newContent;
        console.log("Content updated with feedback page");

        // Wait for a specific element from the new content to be present
        const checkExist = setInterval(() => {
          const inputField = document.querySelector("._fspq3n");
          if (inputField) {
            clearInterval(checkExist);
            console.log("Input field found after content update");
          }
        }, 120);
      });
    } else {
      console.error("Button not found");
    }
  });

  // Simulate the button click
  await page.click("a._1rbf5rt");
  console.log("Button clicked");

  // Wait for the new content to load and for the input field to become visible
  await page.waitForSelector("._fspq3n", { visible: true });
  console.log("Input field found");

  await page.type("._fspq3n", `hello microworlds do something good`, {
    delay: 120,
  });
  console.log("Text typed into input field");

  await page.waitForSelector(`input[type="number"]`, { visible: true });
  await page.type(`input[type="number"]`, `${process.env.PHONE}`, {
    delay: 120,
  });

  await page.waitForSelector(`input[type="mail"]`, { visible: true });
  await page.type(`input[type="mail"]`, `${process.env.EMAIL}`, {
    delay: 100,
  });

  await page.waitForSelector(`button[type="submit"]`, { visible: true });
  await page.click(`button[type="submit"]`);
  await sleep(20 * 1000);

  await page.screenshot({ path: "shot2.jpeg", fullPage: true });
  // await sleep(999999);
} catch (error) {
  console.error("Error occurred:", error);
} finally {
  await browser.close();
}
