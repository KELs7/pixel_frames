export async function load({ fetch, params }) {
    const { creator } = params
    const res = await fetch(`/api/creator/${creator}`)
    let data = await res.json()
    if (!data) data = []
    return {created: data, creator: params.creator}
}