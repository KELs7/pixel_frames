import { json } from "@sveltejs/kit";

export async function GET({ locals, url }) {
	let limit = url.searchParams.get('limit');
	const offset = url.searchParams.get('offset');
	limit = parseInt(limit) || 25

	let auctionsRes = await locals.db.queries.getAllActiveAuctions(limit, offset)
	let auctions = auctionsRes[0]
	auctions.data = await locals.db.queries.populateThingInfo(auctions.data)

	//res.setHeader('Content-Type', 'application/json');
	//res.end(JSON.stringify({data: auctions.data, count: auctions.count.length}));
	return json({data: auctions.data, count: auctions.count.length});
}
