require('dotenv').config()
const { IncomingWebhook } = require('@slack/webhook');

let webhook = undefined;
let webhookUrl = process.env.SLACK_WEB_HOOK
if (webhookUrl) {
    webhook = new IncomingWebhook(webhookUrl);
}

const {createDriver, login, execRQL} = require('./lib/Rollbar.js');

(async function execRollbarRQL() {
    const driver = createDriver('http://localhost:4444/wd/hub');
    try {
        await login(driver, process.env.ROLLBAR_NAME, process.env.ROLLBAR_PASSWORD)

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
                result = await execRQL(driver, project_id, rql)
                title = result.title
                rows = result.rows
                text = `${title.split("\n")[1]},${qt.name},${rows[1]},${rows[2]}`
                console.log(text);
                if (webhook) {
                    await webhook.send({
                        text: text,
                    });
                }
            }
        }
    } finally {
        setTimeout(() => {
            driver.quit();
        }, 100);
    }
})();
