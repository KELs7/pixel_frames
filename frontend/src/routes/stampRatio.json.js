export async function get(req, res) {

    let stampRatio = await global.db.models.StampRatio.findOne({symbol: 'XIAN'})
    if (!stampRatio) stampRatio = { currentRatio: 0}

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(stampRatio));
}