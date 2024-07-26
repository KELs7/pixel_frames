import { json } from "@sveltejs/kit";

export async function GET({ locals }) {
	console.log("HERE")
	let auctions = await locals.db.queries.getAllAuctions()
	console.log({auctions})

	// res.setHeader('Content-Type', 'application/json');
	// res.end(JSON.stringify({auctions}));
	return json({auctions})
}
