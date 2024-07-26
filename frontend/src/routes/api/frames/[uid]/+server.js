import { json } from "@sveltejs/kit";

export async function GET({ locals, params }) {
	const { uid } = params;

	let auctionInfo = null
	let thingInfo = await locals.db.models.PixelFrame.findOne({uid})

	if (!thingInfo) thingInfo = null
	else {
		if (thingInfo.blacklist) thingInfo = null
		auctionInfo = await locals.db.queries.getActiveAuction(uid)
	}

	// res.setHeader('Content-Type', 'application/json');
	// res.end(JSON.stringify({thingInfo, auctionInfo}));
	return json({thingInfo, auctionInfo});

}