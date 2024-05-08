import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel";

function setupPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        console.log(profile);
        const { email, picture, name } = profile._json;

        try {
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            if (profile.provider === existingUser.provider) {
              return cb(null, {
                name: existingUser.name,
                email: existingUser.email,
                isOnline: existingUser.isOnline,
                avatar: existingUser.avatar,
              });
            } else {
              throw new Error(
                "Your email is registered with another provider."
              );
            }
          } else {
            // make a new user
            const user = await User.create({
              name,
              email,
              avatar: picture,
              provider: profile.provider,
            });

            if (user) {
              return cb(null, {
                name: user.name,
                email: user.email,
                isOnline: user.isOnline,
                avatar: user.avatar,
              });
            } else {
              throw new Error();
            }
          }
        } catch (error) {
          console.log(error);
          return cb(error, false);
        }
      }
    )
  );
}

export default setupPassport;
