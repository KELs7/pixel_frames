import { decodeFrames } from '../$lib/js/utils.js'

export async function load({ fetch, params }) {
    const { uid } = params;
    let data = await Promise.all([
            fetch(`/api/frames/${uid}`).then(res => res.json()),
            fetch(`/api/history/${uid}`).then(res => res.json())
    ])

    let { thingInfo, auctionInfo } = data[0]

    try{
        thingInfo.frames = decodeFrames(thingInfo.thing)
    }catch(e){
        thingInfo = {
            name: "Not Found",
            owner: "",
            uid: params.uid,
            description: "",
            notFound: true
        }
    }

    return {
        thingInfo,
        auctionInfo,
        salesHistory: data[1]
    }
}