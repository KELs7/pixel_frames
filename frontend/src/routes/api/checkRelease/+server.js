import { json } from "@sveltejs/kit";

export async function GET() {
    let releaseDate = Date.UTC(2021, 3, 19, 22)
    let serverDate = new Date()

    // res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify(serverDate > releaseDate));
    return json(serverDate > releaseDate);
}