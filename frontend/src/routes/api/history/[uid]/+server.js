import { json } from "@sveltejs/kit";

export async function GET(locals, params, url) {
	let { uid } = params;
	let limit = url.searchParams.get('limit');cl
	const offset = url.searchParams.get('offset');

	//console.log({uid, limit,offset})

	limit = parseInt(limit) || 25

	var match = { $match : {uid: uid}}
	var sort = { $sort : {"saleDate" : -1.0}}
	var skip = { $skip: parseInt(offset) }
	var reclimit = { $limit: limit}
	let dataPipeline = []
	let countPipeline = [match]
	if (offset) {
		dataPipeline = [match, sort, skip, reclimit]
	}
	else dataPipeline = [match, sort, reclimit]
	let facet = { $facet: {data: dataPipeline, "count": countPipeline}}
	let collation = { locale : "en_US", numericOrdering : true }

	let things = await locals.db.models.SalesHistory
		.aggregate([facet])
		.collation(collation)

	//console.log({things})

	// res.setHeader('Content-Type', 'application/json');
	// res.end(JSON.stringify({data: things[0].data, count: things[0].count.length}));
	return json({data: things[0].data, count: things[0].count.length});
}