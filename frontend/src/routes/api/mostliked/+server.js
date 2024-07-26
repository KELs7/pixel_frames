import { json } from "@sveltejs/kit";

export async function GET({ locals, url }) {
	let limit = url.searchParams.get('limit');
	limit = parseInt(limit) || 25

	let things = await locals.db.models.PixelFrame.find({blacklist: false})
		.sort({likes: -1})
		.limit(limit)

	//console.log({liked: things})
	// res.setHeader('Content-Type', 'application/json');
	// res.end(JSON.stringify(things));
	return json(things);

}