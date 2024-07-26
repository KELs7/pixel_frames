import { json } from "@sveltejs/kit";

export async function GET({ locals }) {

    let stampRatio = await locals.db.models.StampRatio.findOne({symbol: 'TAU'})
    if (!stampRatio) stampRatio = { currentRatio: 0}

    // res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify(stampRatio));
    return json(stampRatio);
}