import { json } from "@sveltejs/kit";

export async function GET({ locals }) {

    let priceData = await locals.db.models.Prices.findOne({symbol: 'TAU'})
    if (!priceData) priceData = { currentPrice: 0}

    // res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify(priceData));
    return json(priceData);
}