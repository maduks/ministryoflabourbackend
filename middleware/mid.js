const ACCOUNT_LOCK_THRESHOLD = 3; // CAPS Because it's a global variable
const ACCOUNT_LOCK_DURATION_MS = 2 * 60 * 1000; //MS=MILISECS
const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, //3minutes
  max: 5, //maximum trial supposed to be 20 trials kinda for 15 mins
  headers: true, //so info will be passed to headers saying something happened
  message: {
    message: "Too many login attemps, please try again later",
  }, //written in object because we will be accessing it in handler-handler when the max i.e rate limit threshhold has beeen
  //after the user has hit 6, i want to know who this user is using their email.
  //Not email because someone may be trying to log in illegally without an email (user email exist, hacker not using email,
  //hacker using someones email but doesnt know the password. ip address ban can also be implemented)#
  //options is folllow come with handler and allows us access only the message but the object in the mesage
  handler: async (req, res, next, options) => {
    const { email } = req.body; //used to get user trying to log since users must provide username &pass
    if (!email) return res.status(429).send(options.message); //options from line 15
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        if (user.isLocked) {
          let lockedFor = Math.ceil(ACCOUNT_LOCK_DURATION_MS / (1000 * 60)); //ceil rounding up and covert to minute
          return;
          //res.status(429).json({message:`Too many login attemps, your account has been locked for ${lockedFor}`}) //(only line t)
        } else {
          return res.status(429).send(options.message);
        } //if account isnt locked
        //if user with the email exists, lock the persons account after incrementing failed login attempt by 1
        //if user is found, assign the column in the users table =
        //in Js, the || is used for fall backs, if there's no value for failedlattempt, fall back to 0 then add 1 to it.
        //thr first time, it'll fall back to 0 because there wont be any value. but tries to log in again it activates the threshold
        //and adds 1 per login attempt. once it's greater than 3 the user is locked out. make sure it doesn't enter for loop by getting to 4 and checking
        user.failedLoginAttempt = (user.failedLoginAttempt || 0) + 1; //if fla isn't having a value then assign
        //if the user
        if (user.failedLoginAttempt >= ACCOUNT_LOCK_THRESHOLD) {
          user.isLocked = true;
          user.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MS); //adding to time
        }
        await user.save();
      } else {
        return res.status(429).send(options.message); //don't say user not found because of malicious attempt
      }
    } catch (err) {
      console.log("You are logged out from this system");
    }
  },
  //we are just sending out, so no json needed, since middleware
  //if the max is hit and the user doesn't provide email then too mnany login attemps
  //if the user attempts to call the endpoint above the max.the handler function(just like callback) will be triggered
});
