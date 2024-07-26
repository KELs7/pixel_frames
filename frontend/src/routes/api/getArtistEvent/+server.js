import { json } from "@sveltejs/kit";

import fs from 'fs'
import path from 'path';

export async function GET({ url, locals }) {
    const event = url.searchParams.get('event');
    console.log("event: ", event);
    let eventData = {endDate: new Date(0)}

    try {
        const eventFilePath = path.join(process.cwd(), 'events', `${event}.json`);
        console.log("Attempting to read file:", eventFilePath);
        
        const fileContent = fs.readFileSync(eventFilePath, 'utf8');
        console.log("File content:", fileContent);
        
        if (!fileContent.trim()) {
            throw new Error("File is empty");
        }
        
        eventData = JSON.parse(fileContent);
        eventData.artThingList = await Promise.all(eventData.artList.map(uid => locals.db.models.PixelFrame.findOne({uid})))
    } catch (err) {
        console.error("Error reading or parsing file:", err.message);
        return json({ error: "Failed to read event data" }, { status: 500 });
    }

    return json(eventData);
}