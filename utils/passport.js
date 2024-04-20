// passport-config.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
},
    function (accessToken, refreshToken, profile, done) {
        const user = {
            accessToken: accessToken,
            profile: profile // You can store additional user information from the profile
        };
        return done(null, user);
    }
));

passport.serializeUser(function (user, done) {
    console.log('Serializing user:', user);
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    console.log('Deserializing user:', user);
    done(null, user);
});
