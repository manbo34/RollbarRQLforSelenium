const {Builder, Capabilities, By} = require("selenium-webdriver");
const {waitTimeMilliseconds} = require('./utils.js');

const capabilities = Capabilities.chrome();

exports.createDriver = (serverUrl) => new Builder()
    .usingServer(serverUrl)
    .withCapabilities(capabilities)
    .build();

exports.login = async (driver, user, password) => {
    await driver.get('https://rollbar.com/login/');
    (await driver.findElement(By.name('username_or_email'))).sendKeys(user);
    (await driver.findElement(By.name('password'))).sendKeys(password);
    await driver.findElement(By.css('button')).click();
    await driver.wait(() => waitTimeMilliseconds(2000), 10000);
};

exports.execRQL = async (driver, project_id, rql) => {
    // Note: Execute RQL Script
    const url = `https://rollbar.com/forstartups/all/rql/?projects=${project_id}&graph_type=line`
    await driver.get(url);
    await driver.wait(() => waitTimeMilliseconds(2000), 10000);
    (await driver.findElement(By.css('textarea'))).sendKeys(rql);
    await driver.wait(() => waitTimeMilliseconds(1000), 20000);
    (await driver.findElement(By.xpath('//*[@id="AccountRQLConsole"]/div/div[2]/div[2]/div[2]/div/form/input'))).click();

    // Note: Get RQL result
    while(url === await driver.getCurrentUrl()) {
        await driver.wait(() => waitTimeMilliseconds(1000), 20000);
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
                    await driver.wait(() => waitTimeMilliseconds(1000), 20000);
                }
            } catch (suberror) {
                // NOP
            }
        }
    }
    title = await (await driver.findElement(By.id('intercom-tour-projects'))).getText()
    return {
        title,
        rows: tableRows.split("\n"),
    }
};
