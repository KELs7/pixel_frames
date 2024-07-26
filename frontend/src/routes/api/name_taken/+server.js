import { json } from "@sveltejs/kit";

export async function GET({ locals, url }) {
	const name_uid = url.searchParams.get('name_uid');
	let thing = await locals.db.models.PixelFrame.findOne({name_uid})

    // res.setHeader('Content-Type', 'application/json');
	if (!thing) {
		// res.end(JSON.stringify(false));
		return json(false);
	}else{
		// res.end(JSON.stringify(true));
		return json(true);
	}
}