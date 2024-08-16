import {config} from 'dotenv'
config({
    path: '../../frontend/.env'
})

import { getDatabase} from "../database.mjs"
import { getBlockService } from "../../blockserviceAPI/blockservice.mjs"
import { auctionContractProcessor } from "../processors/AuctionContract.mjs"
import util from "util";

const AUCTION_CONTRACT = process.env.AUCTION_CONTRACT || null
if (!AUCTION_CONTRACT ) throw Error("Must pass AUCTION_CONTRACT via .env file")

const BLOCKSERVICE_PORT = process.env.BLOCKSERVICE_PORT || 3535
const BLOCKSERVICE_URL = process.env.BLOCKSERVICE_URL || `http://localhost:${BLOCKSERVICE_PORT}`

export async function drop_collections(){
    let db = await getDatabase()
    await db.queries.drop_collection('AuctionHistory')
    await db.queries.delete_processed('AuctionHistoryContract')
}

export const loadCollection = () => {
    const blockService = getBlockService(BLOCKSERVICE_URL)
    const processor = auctionContractProcessor()

    let db
    let done

    async function getUpdates(){
        return await blockService.getVariableChanges(AUCTION_CONTRACT, "S", 1)
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
