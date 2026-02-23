// this file is redundant because we are now using octokit webhook processing including signature verification

import crypto from 'crypto'

export function verifyGithubSignature(
  signature: string | undefined, 
  rawBody: Buffer, 
  secret: string): boolean {
    if (!signature) return false

    //hmac verification with sha256 hash function (what github uses)
    const hmac = crypto.createHmac('sha256', secret)

    hmac.update(rawBody)  //update data

    const expected = "sha256=" + hmac.digest("hex"); //encoding to be used

    //compare expected with received signature in req header
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }