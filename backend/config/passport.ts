import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import {
  Strategy as GithubStrategy,
  Profile as GithubProfile,
} from "passport-github2";
import User from "../models/userModel";

async function findOrCreateUser(
  name: string | undefined | null,
  email: string | undefined,
  provider: string,
  avatarPic: string | undefined,
  cb: VerifyCallback
) {
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (provider === existingUser.provider) {
        return cb(null, {
          name: existingUser.name,
          email: existingUser.email,
          isOnline: existingUser.isOnline,
          avatar: existingUser.avatar,
        });
      } else {
        throw new Error(
          "Your email is already registered with another provider."
        );
      }
    } else {
      // first check if username is taken
      const nameExists = await User.findOne({ name });

      if (nameExists) {
        name = null;
      }

      // make a new user
      const user = await User.create({
        name,
        email,
        avatar: avatarPic,
        provider: provider,
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
    return cb(null, false);
  }
}

async function verify(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  cb: VerifyCallback
) {
  console.log(profile);
}

function setupPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "/api/auth/google/callback",
      },
      (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        cb: VerifyCallback
      ) => {
        const { email, picture, name } = profile._json;
        findOrCreateUser(name, email, profile.provider, picture, cb);
      }
    )
  );

  passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        callbackURL: "/api/auth/github/callback",
        scope: ["user:email"],
      },
      (
        accessToken: string,
        refreshToken: string,
        profile: GithubProfile,
        cb: VerifyCallback
      ) => {
        const emails = profile.emails as { value: string; type: string }[];
        const pictures = profile.photos as any;
        findOrCreateUser(
          profile.username,
          emails[0]?.value,
          profile.provider,
          pictures[0].value,
          cb
        );
      }
    )
  );
}

export default setupPassport;
