const {executor} = require("./lib/executor.js");
(async function execRollbarRQL() {
    const query_types = [
        {name: 'timestamp', t: 'timestamp'},
        // {name: 'first_occurrence_timestamp', t: 'item.first_occurrence_timestamp'},
        // {name: 'last_resolved_timestamp', t: 'item.last_resolved_timestamp'},
    ]

    await executor(query_types
        , (_project_id, qt, days) => `
            SELECT item.counter, item.title, count(item.counter)
            FROM item_occurrence
            WHERE ${qt.t} > unix_timestamp() - 60 * 60 * 24 * ${days}
            and item.environment = "production"
            and item.level >= 40
            group by item.counter
            order by count(item.counter) desc`
        , results => {
            buffers = [];
            buffers.push('project,timestamp_type,counter,num,title')
            results.forEach(r => {
                let i = 1
                rows = r.result.rows
                buffers.push(r.result.title)
                while (rows[i]) {
                    buffers.push(`${rows[i]},${rows[i + 2]},${rows[i + 1]}`)
                    i = i + 3
               }
               buffers.push('')
               buffers.push('')
            })
            return buffers.join("\n")
        })
})();
