import { cronAuthorized, runEmailWorker } from '../../server/email-worker.js'
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 if(!cronAuthorized(req.headers.authorization))return res.status(401).json({error:'Unauthorized'});
 try {return res.status(200).json(await runEmailWorker())}
 catch {return res.status(503).json({error:'Email worker failed. Check server configuration and migrations.'})}
}
