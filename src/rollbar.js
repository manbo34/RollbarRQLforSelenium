require('dotenv').config()
const {Builder, Capabilities, By} = require("selenium-webdriver");

const capabilities = Capabilities.chrome();
const documentInitialised = (waitMsec) => {
    const startMsec = new Date();

    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec) ;
    return true
}
// ログイン処理
(async function helloSelenium() {
    let driver = new Builder()
        .usingServer("http://localhost:4444/wd/hub")
        .withCapabilities(capabilities)
        .build();
    try {
        await driver.get('https://rollbar.com/login/');
        (await driver.findElement(By.name('username_or_email'))).sendKeys(process.env.ROLLBAR_NAME);
        (await driver.findElement(By.name('password'))).sendKeys(process.env.ROLLBAR_PASSWORD);
        await driver.findElement(By.css('button')).click();
        await driver.wait(() => documentInitialised(2000), 10000);

        console.log(`project,num,unique_num`);
        project_ids = process.env.PROJECT_IDS.split(",")
        const query_types = [
            {name: 'timestamp', t: 'timestamp'},
            {name: 'first_occurrence_timestamp', t: 'item.first_occurrence_timestamp'},
            {name: 'last_resolved_timestamp', t: 'item.last_resolved_timestamp'},
        ]
        for(project_id of project_ids){
            for(qt of query_types) {
                const rql = `SELECT count(item.counter), count_distinct(item.counter) FROM item_occurrence WHERE ${qt.t} > unix_timestamp() - 60 * 60 * 24 * 7 and item.environment = "production" and item.level >= 40`
                const url = `https://rollbar.com/forstartups/all/rql/?projects=${project_id}&graph_type=line`
                await driver.get(url);
                await driver.wait(() => documentInitialised(2000), 10000);
                (await driver.findElement(By.css('textarea'))).sendKeys(rql);
                await driver.wait(() => documentInitialised(1000), 20000);
                (await driver.findElement(By.xpath('//*[@id="AccountRQLConsole"]/div/div[2]/div[2]/div[2]/div/form/input'))).click();

                while(url === await driver.getCurrentUrl()) {
                    await driver.wait(() => documentInitialised(1000), 20000);
                }
                let tableRows = undefined
                while(tableRows === undefined) {
                    let status = undefined;
                    try {
                        status = await (await driver.findElement(By.xpath('//*[@id="AccountRQLConsole"]/div/div[2]/div[2]/div[3]/div/strong'))).getText();
                        tableRows = await (await driver.findElement(By.tagName('table'))).getText()
                    } catch(error) {
                        try {
                            if (status === 'Completed'){
                                tableRows = "rows\n0\n0"
                            }
                            else{
                                await driver.wait(() => documentInitialised(1000), 20000);
                            }
                        } catch (suberror) {
                            // NOP
                        }
                    }
                }
                title = await (await driver.findElement(By.id('intercom-tour-projects'))).getText()
                rows = tableRows.split("\n")
                console.log(`${title.split("\n")[1]},${qt.name},${rows[1]},${rows[2]}`);
            }
        }
    } finally {
        setTimeout(() => {
            driver.quit();
        }, 100);
    }
})();
