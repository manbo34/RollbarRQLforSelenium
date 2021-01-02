const {executor} = require("./lib/executor.js");
(async function execRollbarRQL() {
    const query_types = [
        {name: 'timestamp', t: 'timestamp'},
        {name: 'first_occurrence_timestamp', t: 'item.first_occurrence_timestamp'},
        {name: 'last_resolved_timestamp', t: 'item.last_resolved_timestamp'},
    ]

    await executor(query_types
        , (_project_id, qt) => `
            SELECT count(item.counter), count_distinct(item.counter) 
            FROM item_occurrence 
            WHERE ${qt.t} > unix_timestamp() - 60 * 60 * 24 * 7 
                and item.environment = "production" 
                and item.level >= 40`
        , results => {
            buffers = [];
            buffers.push('project,num,unique_num')
            results.forEach(r => {
                title = r.result.title
                rows = r.result.rows
                qt = r.query_type
                buffers.push(`${title},${qt.name},${rows[1]},${rows[2]}`)
            })
            return buffers.join("\n")
        })
})();
