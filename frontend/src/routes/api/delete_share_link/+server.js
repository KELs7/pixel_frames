import { json } from "@sveltejs/kit";

import fs from 'fs'
import path from 'path';

export async function GET({ locals, url }) {
    // res.setHeader('Content-Type', 'application/json');
    //console.log({query_deleteLink: await request.json()})
	const uid = url.searchParams.get('uid');
    const challenge = url.searchParams.get('challenge');

    let authCodeInfo = await locals.db.models.AuthCodes.findOne({uid})
    //console.log({authCodeInfo_deleteLink: authCodeInfo, uid, challenge, date: new Date()})
    if (!authCodeInfo || !authCodeInfo.validated) {
        // res.end(JSON.stringify({error: "Auth Code not valid."}));
        return json({error: "Auth Code not valid."})
    }

    if (authCodeInfo.challenge === challenge){
        let shareLinkInfo = await locals.db.models.ShareLinks.findOne({uid})
        const shareLink = shareLinkInfo.link

        if (!shareLinkInfo) res.end(JSON.stringify({deleted: true, shareLink: null}));

        await shareLinkInfo.remove()
        await authCodeInfo.remove()

        shareLinkInfo = await locals.db.models.ShareLinks.findOne({uid})

        if (shareLinkInfo) {
            // res.end(JSON.stringify({error: "Code was not deleted!"}));
            return json({error: "Code was not deleted!"});
        }else{
            if(fs.existsSync(`./GIFS/${shareLink}.gif`)) fs.unlinkSync(`./GIFS/${shareLink}.gif`)
            // res.end(JSON.stringify({deleted: true, shareLink: null}));
            return json({deleted: true, shareLink: null});
        }
    }else{
        // res.end(JSON.stringify({error: "Challenge not accepted."}));
        return json({error: "Challenge not accepted."});
    }
}