import { Request, Response } from 'express'
import crypto from 'crypto'
import { User } from '../models/User.model.js';
import { Installation } from '../models/Installation.model.js';
import { getEnv } from '../utils/envValidator.js';
import githubApp from '../config/github.js'

export const login = (req: Request, res: Response) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }

  req.session.oauthIntent = "login";
  res.redirect("/auth/github");
}

export const connectToGithub = (req: Request, res: Response) => {
  if (!req.session.userId){
    req.session.oauthIntent = 'install'
    return res.redirect('/auth/github')
  }
  
  res.redirect(`https://github.com/apps/${getEnv('APP_NAME')}/installations/new`)
}

export const githubAuth = (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;

  // //checking intent = install or login
  // const intent = req.query.intent
  // if (intent == 'login' || intent == 'install'){
  //   req.session.oauthIntent = intent
  // } else {
  //   req.session.oauthIntent = 'login' //default is login for now //TODO check if this is good practice
  // }

  //force session save before redirect so state persists
  req.session.save((err) => {
    if (err){
      return res.status(500).send("Session save failed");
    }
    const queryParams = new URLSearchParams({
      client_id: getEnv('GITHUB_CLIENT_ID'),
      redirect_uri: `${process.env.APP_URL}/auth/callback`,
      scope: 'read:user user:email',
      state
    })
  
    res.redirect(`https://github.com/login/oauth/authorize?${queryParams}`)
  })
}

/*
1.Read code from query params
2.Verify state matches session
3.Exchange authorisation code for access token
4.Use access token to fetch user info
5.Log user in (create session / JWT / etc.) 
*/
export const callback = async (req: Request, res: Response) => {
  try {
    //1
    const { code, state } = req.query

    console.log("Session:", req.session);
  
    //2 
    if (typeof state !== 'string' || state != req.session.oauthState){
      return res.status(400).send('Invalid state parameter')
    }
    delete req.session.oauthState; 
  
    //3 
    const authCode = typeof code === 'string' ? code : undefined
    if (!authCode){
      return res.status(400).send('Authorization code missing')
    }
  
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: getEnv("GITHUB_CLIENT_ID"),
          client_secret: getEnv("GITHUB_CLIENT_SECRET"),
          code,
          redirect_uri: `${process.env.APP_URL}/auth/callback`
        }),
      }
    ) 
  
    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      return res.status(400).send("Token exchange failed");
    }
    const accessToken = tokenData.access_token
    if (!accessToken){
      return res.status(400).send('Failed to obtain access token')
    }
  
    //4
    const userResponse = await fetch('https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
  
    const user = await userResponse.json()
  
    //5
    let dbUser = await User.findOne({ githubId: user.id })
    if (dbUser){
      dbUser.accessToken = accessToken;
      await dbUser.save();
    } else {
      dbUser = await User.create({
        githubId: user.id,
        githubLogin: user.login,
        accessToken: accessToken,
      });
    }

    //additional steps - storing to db + redirecting to install/dashboard

    //session regeneration - good practice
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).send("Session error");
      }

      req.session.userId = dbUser._id;

      // Save session before redirect (important!)
      req.session.save((err) => {
        if (err) {
          return res.status(500).send("Session save error");
        }

        if (intent === "install") {
          return res.redirect(
            `https://github.com/apps/${getEnv('APP_NAME')}/installations/new`
          );
        }

        res.redirect("/dashboard");
      });
    });
  
    const intent = req.session.oauthIntent;
    delete req.session.oauthIntent;
  
    //user wanted to install
    if (intent === "install") {
      return res.redirect(
        `https://github.com/apps/${getEnv('APP_NAME')}/installations/new`
      );
    }
  
    //user only wanted to login, send to dashboard
    res.redirect("/dashboard");  
  
  } catch (error) {
    console.error(error)
    res.status(500).send("OAuth failed")
  }
}

export const installApp = async (req: Request, res: Response) => {
  const { installation_id, setup_action } = req.query

  if (typeof installation_id !== "string") {
    return res.status(400).send("Invalid installation id");
  }

  if (!req.session.userId) {
    return res.status(401).send('Not authenticated, please login'); //TODO check if we want to redirect to /auth/github here
  }

  try {
    const INSTALLATION_ID = Number(installation_id)
    // const octokit = await githubApp.getInstallationOctokit(INSTALLATION_ID);
    const { data: installation } = await githubApp.octokit.request('GET /app/installations/{installation_id}', {
      installation_id: INSTALLATION_ID,
    });
    
    //save to db

    const account = installation.account
    if (!account) {
      throw new Error("Installation account missing");
    }

    await Installation.findOneAndUpdate(
      { installationId: INSTALLATION_ID },
      {
        installationId: INSTALLATION_ID,
        accountLogin: 'login' in account ? account.login : account.name,
        accountType: 'type' in account ? account.type : 'Enterprise',
        installedBy: req.session.userId,
        suspended: false
      },
      { upsert: true }
    );

    //redirect to dashboard
    res.redirect("/dashboard");
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Installation setup failed");
  }
}

