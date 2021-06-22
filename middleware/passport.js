const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const config = require('config')
const log = require('log4js').getLogger('queris');


const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt_key
}

module.exports = passport => {
  passport.use(
    new JwtStrategy( options, async (payload, done) => {
      try{
        let user = {
          email: payload.email,
          id: payload.user_id
        } 
        if(user) {
          done(null, user)
        } else{
          done(null, false) 
        }
      } catch(e){
        log.error( "passport: " + e.stack)
      }
      
    })
  )

}