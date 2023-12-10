const express = require('express');
const router = express.Router();
const passport = require('passport');
const fetch = require('node-fetch');
const querystring = require('querystring');
const DiscordStrategy = require('passport-discord').Strategy;

const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const redirectUri = 'https://fn-lego-map-j3svens-projects.vercel.app/auth/discord/callback';

// Passport and Discord strategy setup
passport.use(new DiscordStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: redirectUri,
    scope: ['identify']
}, function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

router.get('/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query;

    // Exchange code for an access token
    const tokenData = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
        scope: 'identify',
    };

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: querystring.stringify(tokenData),
    });

    const tokenJSON = await tokenResponse.json();
    const accessToken = tokenJSON.access_token;

    // Fetch user information
    const userInfoResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const userInfo = await userInfoResponse.json();

    // Here, you can add logic to handle the user info, such as storing it in session
    req.session.userInfo = userInfo;

    res.redirect('/');
});

module.exports = router;
