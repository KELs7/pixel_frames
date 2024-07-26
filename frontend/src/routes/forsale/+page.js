export async function load({ fetch }) {
    const res = await fetch(`/api/forsale?limit=25`)
    let data = await res.json()
    if (!data) data = []
    return {forsale: data}
}