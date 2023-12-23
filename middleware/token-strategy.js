/*
 * Passport strategy to protect all routes
 */
const passport = require("passport");
const passportJWT = require("passport-jwt");

// JSON Web Token Setup
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// Configure its options
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken("jwt")   //fromAuthHeaderWithScheme("jwt");
jwtOptions.secretOrKey =  '08F1D51A6FAF8236DEB77C24ECA0AE656HGB02486B290E2E0';

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log("payload received", jwt_payload);
  if (jwt_payload) {
    // The following will ensure that all routes using
    // passport.authenticate have a req.user._id and req.user.userId values
    // that matches the request payload data
    next(null, {
      _id: jwt_payload._id,
      userId: jwt_payload.userId,
    });
  } else {
    next(null, false);
  }
});

passport.use(strategy);
