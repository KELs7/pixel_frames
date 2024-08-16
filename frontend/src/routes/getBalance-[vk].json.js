export async function get(req, res, next) {
	const { vk } = req.params;

    let rpcResult = await global.blockservice.getCurrentKeyValue('currency', 'balances', vk)

    let value = rpcResult?.result?.response?.value

    if (!value) {
        value = "0"
    } else{
        value = atob(value);
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({value}));
}