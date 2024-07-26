import { json } from "@sveltejs/kit";

export async function GET({ locals, params }) {
	const { vk } = params;

    let results = await locals.blockservice.getCurrentKeyValue('currency', 'balances', vk)

    results = results?.result?.response

    let { value } = results

    if (!value) {
        value = "0"
    } else{
        value = atob(value);
    }

    // res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify({value}));
    return json({value});
}