export async function load({ fetch, params }) {
    let things = await fetch(`/api/owned/${params.account}?limit=25`).then(res => res.json())

    return {
        account: params.account,
        owned: things
    }
}