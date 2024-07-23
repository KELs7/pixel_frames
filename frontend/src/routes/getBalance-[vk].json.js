export async function get(req, res, next) {
	const { vk } = req.params;

    let results = await global.blockservice.getCurrentKeyValue('currency', 'balances', vk)

    results = results?.result?.response

    let { value } = results

    if (!value) {
        value = "0"
    } else{
        value = atob(value);
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({value}));
}