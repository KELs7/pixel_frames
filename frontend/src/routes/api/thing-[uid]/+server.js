import { json } from "@sveltejs/kit";

export async function GET({ locals, params }) {
	const { uid } = params;
	let thing = await locals.db.models.PixelFrame.findOne({uid})

	if (!thing) thing = null
	else {
		if (thing.blacklist) thing = null
	}

	// res.setHeader('Content-Type', 'application/json');
	// res.end(JSON.stringify(thing));
	return json(thing);
}