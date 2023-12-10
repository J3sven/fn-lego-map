require('dotenv').config()
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const session = require('express-session');
const passport = require('passport');
const fetch = require('node-fetch');
const querystring = require('querystring');
const path = require('path');
const DiscordStrategy = require('passport-discord').Strategy;
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const userLocationsFilePath = 'userLocations.json';
const redirectUri = 'http://map.j3.gg/auth/discord/callback'
const clientId = process.env.DISCORD_CLIENT_ID
const clientSecret = process.env.DISCORD_CLIENT_SECRET



// Passport and Discord strategy setup
passport.use(new DiscordStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: redirectUri,
    scope: ['identify']
}, function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
}));

app.use(session({ secret: 'some secret', resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Routes for Discord OAuth
app.get('/auth/discord', passport.authenticate('discord'));
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

app.get('/api/user', (req, res) => {
    if (req.session.userInfo) {
      res.json({ authenticated: true, userInfo: req.session.userInfo })
    } else {
      res.json({ authenticated: false })
    }
  })

// Serve static files (like your frontend)
app.use(express.static('public'));

function readUserLocations() {
    if (!fs.existsSync(userLocationsFilePath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(userLocationsFilePath, 'utf8'));
}

app.get('/api/user-locations', (req, res) => {
    const userLocations = readUserLocations();
    res.json(userLocations);
});

function writeUserLocations(userLocations) {
    try {
        fs.writeFileSync(userLocationsFilePath, JSON.stringify(userLocations, null, 2), 'utf8');
    } catch (error) {
        console.error("Failed to write user locations:", error);
    }
}

// WebSocket connection handling
wss.on('connection', function(ws) {
    const userLocations = readUserLocations();
    ws.send(JSON.stringify({ type: 'initialLocations', userLocations }));

    ws.on('message', function(message) {
        const data = JSON.parse(message);
        if (data.type === 'locationUpdate') {
            // Ensure that updateUserLocation function call includes the Discord name
            updateUserLocation(data.userId, data.location, data.profileImageUrl, data.discordName);
            // Broadcast the updated location to all connected clients
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message); // The message should now include the discordName
                }
            });
        }
    });
    
});

function updateUserLocation(userId, location, profileImageUrl, discordName) { 
    const userLocations = readUserLocations();
    userLocations[userId] = {
        location: location,
        timestamp: new Date().toISOString(),
        profileImageUrl: profileImageUrl,
        discordName: discordName
    };
    writeUserLocations(userLocations);
}


server.listen(3000, function() {
    console.log('Server started on port 3000');
});