const puppeteer = require("puppeteer-extra")
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
require("dotenv").config();

let page;
let ready = false;

async function init() {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({ headless: false })
    try {
        page = await browser.newPage()
        page.setDefaultTimeout(0);
        await page.goto('https://accounts.google.com/')

        await page.waitForSelector('input[type="email"]')
        await page.click('input[type="email"]')

        await page.type('input[type="email"]', process.env.EMAIL_ID, { delay: 100 })

        await page.waitForSelector('#identifierNext')
        await page.click('#identifierNext')

        await page.waitForSelector('#passwordNext')
        while (true) {
            try {
                await page.click('input[type="password"]')
                break;
            } catch (err) {
                await page.waitForTimeout(2000);
            }
        }

        await page.type('input[type="password"]', process.env.PASSWORD, { delay: 100 })

        await page.waitForSelector('#passwordNext')
        await page.waitForTimeout(2000);
        await page.click('#passwordNext')
        await page.set
        ready = true;
    } catch (err) {
        ready = false;
        await browser.close();
    }
}

init();

exports.get = async (req, res) => {
    res.json("Server is alive!")
}

exports.search = async (req, res) => {
    try {
        if (ready) {
            let { query, limit } = req.query;
            if (!limit) {
                limit = 5;
            }
            if (isNaN(parseInt(limit))) {
                throw Error("Limit should a number from 1 to 10!")
            }

            limit = parseInt(limit);
            if (limit < 1 || limit > 10) {
                throw Error("Limit should be from 1 to 10!");
            }
            await page.goto("https://www.google.com/")
            await page.type('textarea[name="q"]', query, { delay: 50 })
            await page.keyboard.press('Enter');
            await page.waitForSelector('div[class="ULSxyf"]')
            await page.waitForTimeout(2000);
            let links = await page.evaluate(() => {
                let a_s = [];
                let divs = document.querySelectorAll('div[class="ULSxyf"]');
                for (let div of divs) {
                    let a = div.querySelector('a');
                    a_s.push(a?.href);
                }
                return a_s;
            });
            let result = links.filter(x => x != null)
            result = result.slice(0, limit);
            res.status(200).json({ result });
        } else {
            res.status(200).json("Initializing in progress...");
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}