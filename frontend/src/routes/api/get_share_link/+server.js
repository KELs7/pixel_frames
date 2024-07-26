import { json } from "@sveltejs/kit";

export async function GET({ locals, url }) {
    // res.setHeader('Content-Type', 'application/json');
    //console.log({query_getShareLink: await request.json()})
	const uid = url.searchParams.get('uid');
    const challenge = url.searchParams.get('challenge');

    let authCodeInfo = await locals.db.models.AuthCodes.findOne({uid})
    //console.log({authCodeInfo_getShareLink: authCodeInfo, uid, challenge, date: new Date()})
    if (!authCodeInfo || !authCodeInfo.validated) {
        // res.end(JSON.stringify({error: "Auth Code not valid."}));
        return json({error: "Auth Code not valid."});
    }

    if (authCodeInfo.challenge === challenge){
        let thingInfo = await locals.db.models.PixelFrame.findOne({uid})
        // if (!thingInfo) res.end(JSON.stringify({error: "Thing doesn't exists."}));
        if (!thingInfo){
            return json({error: "Thing doesn't exists."})
        }
        let shareLinkInfo = await locals.db.models.ShareLinks.findOne({uid})
        if (!shareLinkInfo) {
            shareLinkInfo = await new locals.db.models.ShareLinks({
                uid,
                owner: thingInfo.owner
            }).save()
        }
        shareLinkInfo.link = `share_${thingInfo.uid}_${global.randomHash().substring(0,10)}`
        shareLinkInfo.dateCreated = new Date()
        //console.log({shareLinkInfo})
        await shareLinkInfo.save()
        await authCodeInfo.remove()
        authCodeInfo = await locals.db.models.AuthCodes.findOne({uid})
        if (authCodeInfo) throw new Error("authcodeinfo NOT deleted!")


        // res.end(JSON.stringify({shareLink: shareLinkInfo.link}));
        return json({shareLink: shareLinkInfo.link})
    }else{
        // res.end(JSON.stringify({error: "Challenge not accepted."}));
        return json({error: "Challenge not accepted."})
    }
}