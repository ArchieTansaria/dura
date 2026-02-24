import { Request, Response } from 'express'
import githubApp from '../config/github.js'

/*
1. Verify signature
2. Read event type -> handled by webhooks/index.ts
3. Pass payload to service layer (add to queue) -> handled by pr handler in /webhooks
4. Respond 200
*/
export const webhookHandler = async (req: Request, res: Response) => {  
  try {
    const id = req.headers['x-github-delivery'] as string
    const name = req.headers['x-github-event'] as string
    const payload = req.body
    const signature = req.headers['x-hub-signature-256'] as string
    await githubApp.webhooks.verifyAndReceive({
      id,
      name, 
      payload,
      signature
    })

    return res.status(200).send("ok");
    
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Webhook failed");
  }
}
