import { json } from "@sveltejs/kit";

export async function GET({ locals, url }) {
	const uid = url.searchParams.get('uid');

    let authCodeInfo = await locals.db.models.AuthCodes.findOne({uid})
    if (!authCodeInfo) {
        authCodeInfo = await new locals.db.models.AuthCodes({
            uid,
            code: global.randomHash(),
            challenge: global.randomHash(),
            validated: false,
            dateCreated: new Date()
        }).save()
    }

    //console.log({authCodeInfo_getCode: authCodeInfo, date: new Date()})

    // res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify(authCodeInfo));
    return json(authCodeInfo);
}