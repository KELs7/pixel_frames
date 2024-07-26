import { json } from "@sveltejs/kit";

export async function GET({ locals, params }) {
	const { contractName, variableName, key } = params;
	let result = await locals.blockservice.getCurrentKeyValue(contractName, variableName, key)
    // res.end(JSON.stringify(result));
	return json(result);
}