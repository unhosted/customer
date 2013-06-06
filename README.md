# draft

## logged-out actions:

* requestCaptcha(cb)
* requestAccount(email, hash, captcha, cb) -> if successful, obtain uid+sessionToken
* getSession(email, hash, cb) -> if successful, obtain uid+sessionToken
* resetPassword(email, captcha, cb)

## logged-in actions that require retyping your password (can rely on uid instead of email, but require hash):

* changeEmail(uid, hash, newEmail, cb)
* changePwd(uid, hash, newHash, cb)
* deleteUser(uid, hash, cb)
* addThing(uid, hash, type, params, cb) -> thingId
* updateThing(uid, hash, thingId, newParams, cb)
* deleteThing(uid, hash, thingId, cb)

## logged-in actions that don't require retyping your password (can rely on uid + sessionToken):

* listThings(uid, sessionToken, cb) -> {type => {thingId => params} }
* listUsage(uid, sessionToken, cb) -> [details]
* listDonations(uid, sessionToken, cb) -> [details]
* customerDetails(uid, sessionToken, cb) -> {email: ""}
