export async function load({ fetch }) {
    let things = await fetch(`/api/recent_things?limit=25`).then(res => res.json())

    return {
        recent: things
    }
}