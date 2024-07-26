import { json } from "@sveltejs/kit";

export async function GET({ locals, params }) {
	const { creator } = params;
	let things = await locals.db.models.PixelFrame.find({creator})

	//res.setHeader('Content-Type', 'application/json');
	//res.end(JSON.stringify(things));
	return json(things);

}