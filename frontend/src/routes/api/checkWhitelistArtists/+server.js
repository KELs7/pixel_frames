import { json } from "@sveltejs/kit";

import fs from 'fs'
export async function GET({ url }) {
    let { artist } = url.searchParams;

    var whitelist = JSON.parse(fs.readFileSync('./src/js/whitelist.json', 'utf8'));

    // res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify(whitelist.artists.includes(artist)));
    return json(whitelist.artists.includes(artist));
}