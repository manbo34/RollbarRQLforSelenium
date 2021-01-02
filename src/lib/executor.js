require('dotenv').config()
const {IncomingWebhook} = require('@slack/webhook');

let webhook = undefined;
let webhookUrl = process.env.SLACK_WEB_HOOK
if (webhookUrl) {
    webhook = new IncomingWebhook(webhookUrl);
}

const {createDriver, login, execRQL} = require('./Rollbar.js');

exports.executor = async (query_types, createRQL, createText) => {
    const driver = createDriver('http://localhost:4444/wd/hub');
    try {
        await login(driver, process.env.ROLLBAR_NAME, process.env.ROLLBAR_PASSWORD)

        project_ids = process.env.PROJECT_IDS.split(",")
        results = []
        for (project_id of project_ids) {
            for (qt of query_types) {
                const rql = createRQL(project_id, qt)
                results.push({
                    result: await execRQL(driver, project_id, rql),
                    query_type: qt
                })
            }
        }
        text = createText(results)
        console.log(text);
        if (webhook) {
            await webhook.send({text});
        }
    } finally {
        setTimeout(() => {
            driver.quit();
        }, 100);
    }
}
