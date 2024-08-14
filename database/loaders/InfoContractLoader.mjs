import {config} from 'dotenv'
config({
    path: '../../frontend/.env'
})

const INFO_CONTRACT = process.env.INFO_CONTRACT || null
if (!INFO_CONTRACT ) throw Error("Must pass INFO_CONTRACT via .env file")
const BLOCKSERVICE_URL = process.env.BLOCKSERVICE_URL || 'http://localhost'
const BLOCKSERVICE_PORT = process.env.BLOCKSERVICE_PORT || 3535

import { getDatabase} from "../database.mjs"
import { getBlockService } from "../../blockserviceAPI/blockservice.mjs"
import { infoContractProcessor } from "../processors/InfoContract.mjs"
import {color_to_letter} from "../pixelwhale_utils.mjs";

export async function drop_collections(){
    let db = await getDatabase()
    await db.queries.drop_collection('PixelFrame')
    await db.queries.drop_collection('Likes')
    await db.queries.drop_collection('LikedByUser')
    await db.queries.drop_collection('SalesHistory')
    await db.queries.delete_processed('InfoContractUpdates')
}

export const loadCollection = () => {
    const blockService = getBlockService(BLOCKSERVICE_URL, BLOCKSERVICE_PORT)
    const processor = infoContractProcessor()

    let db
    let done

    async function getUpdates(){
        return await blockService.getVariableChanges(INFO_CONTRACT, "S", 1)
    }

    async function processUpdates(updates){
        for (const update of updates){
            await processor.processUpdate(update, true)
        }
        load()
    }

    async function load(){
        let updates = await getUpdates()
        if (updates.history.length > 0) await processUpdates(updates.history)
        else done()
    }

    async function startLoading(resolver) {
        db = await getDatabase()
        processor.setDb(db)

        done = resolver
        load()
    }

    const finished = new Promise(startLoading)

    return {
        finished
    }
}
