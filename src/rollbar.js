require('dotenv').config()
const {Builder, Capabilities, By} = require("selenium-webdriver");

var capabilities = Capabilities.chrome();
(async function helloSelenium() {
    let driver = new Builder()
        .usingServer("http://localhost:4444/wd/hub")
        .withCapabilities(capabilities)
        .build();
    try {
        let timer = false;
        const documentInitialised = (waitMsec) => {
            const startMsec = new Date();

            // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
            while (new Date() - startMsec < waitMsec) ;
            return true
        }

        // await driver.get('https://rollbar.com/login/');
        await driver.get('https://rollbar.com/login/');
        (await driver.findElement(By.name('username_or_email'))).sendKeys(process.env.ROLLBAR_NAME);
        (await driver.findElement(By.name('password'))).sendKeys(process.env.ROLLBAR_PASSWORD);
        await driver.findElement(By.css('button')).click();
        // console.log(a);
        await driver.wait(() => documentInitialised(2000), 10000);

        // await driver.get(`https://rollbar.com/forstartups/all/rql/?projects=205073`);
        // a = await (await driver.findElement(By.tagName('body'))).getText();

        console.log(`プロジェクト,総数,ユニーク数`);
        project_ids = process.env.PROJECT_IDS.split(",")
        for(project_id of project_ids){
            await driver.get(`https://rollbar.com/forstartups/all/rql/?projects=${project_id}`);
            await driver.wait(() => documentInitialised(5000), 10000);
            const rql = 'SELECT count(item.counter), count_distinct(item.counter) FROM item_occurrence WHERE timestamp > unix_timestamp() - 60 * 60 * 24 * 7 and item.environment = "production" and item.level >= 40';
            (await driver.findElement(By.css('textarea'))).sendKeys(rql);
            (await driver.findElement(By.xpath('//*[@id="AccountRQLConsole"]/div/div[2]/div[2]/div[2]/div/form/input'))).click();

            await driver.wait(() => documentInitialised(10000), 20000);
            a = await (await driver.findElement(By.tagName('html'))).getText()
            await driver.get(await driver.getCurrentUrl());
            await driver.wait(() => documentInitialised(3000), 20000);
            a = await (await driver.findElement(By.tagName('table'))).getText()
            title = await (await driver.findElement(By.id('intercom-tour-projects'))).getText()
            rows = a.split("\n")
            console.log(`${title.split("\n")[1]},${rows[1]},${rows[2]}`);
        }
        // const rql = 'SELECT count(item.counter), count_distinct(item.counter) FROM item_occurrence WHERE timestamp > unix_timestamp() - 60 * 60 * 24 * 7 and item.environment = "production" and item.level >= 40';
        // (await driver.findElement(By.css('textarea'))).sendKeys(rql);
        // (await driver.findElement(By.xpath('//*[@id="AccountRQLConsole"]/div/div[2]/div[2]/div[2]/div/form/input'))).click();
        //
        // // a = await (await driver.findElement(By.name('username_or_email'))).getText()
        // await driver.wait(() => documentInitialised(10000), 20000);
        // a = await (await driver.findElement(By.tagName('html'))).getText()
        // await driver.get(await driver.getCurrentUrl());
        // await driver.wait(() => documentInitialised(1000), 20000);
        // a = await (await driver.findElement(By.tagName('table'))).getText()
        // console.log(a.split("\n"));
    } finally {
        setTimeout(() => {
            driver.quit();
        }, 100);
    }
})();
