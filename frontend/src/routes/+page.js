export async function load({ fetch }) {
    let data = await Promise.all([
        fetch(`/api/mostliked?limit=54`).then(res => res.json()),
        fetch(`/api/recent_things?limit=10`).then(res => res.json()),
        fetch(`/api/forsale?limit=10`).then(res => res.json()),
        fetch(`/api/getArtistEvent?event=artist`).then(res => res.json())
    ])
    let eventInfo = data[3]
    try{
        console.log("WE DOIN IT")
        let endDate = new Date(eventInfo.endDate)
        let shouldShowEvent = new Date() <= endDate.setDate(endDate.getDate() + 3) && new Date() >= new Date(eventInfo.announceDate)
        if (!shouldShowEvent) eventInfo = false
        console.log({shouldShowEvent})
    }catch (e) {
        eventInfo = null
    }

    console.log("up: ",  eventInfo)

    return {
        mostLiked: data[0],
        recent: data[1],
        forsale: data[2],
        eventInfo
    }
}