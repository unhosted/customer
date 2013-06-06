# draft

## to install and run:

    sudo apt-get install mysql-server memcached libcairo2-dev
    npm install
    # create a mysql database
    # import its tables from unht.sql
    # create a mysql user that can only read/write to its tables
    # put a tls.key, tls.cert and ca.pem file into server/tls/
    cd server/
    cp config.sample.js config.js # and edit appropriately
    node backtofront.js 1234 my_secret
    # run a webserver and visit client/index.html with your browser

## logged-out actions:

* requestCaptcha(cb)
* requestAccount(email, hash, captcha, cb) -> if successful, obtain uid+sessionToken
* getSession(email, hash, cb) -> if successful, obtain uid+sessionToken
* resetPassword(email, captcha, cb)

## logged-in actions that require retyping your password (can rely on uid instead of email, but require hash):

* changeEmail(uid, hash, newEmail, cb)
* changePwd(uid, hash, newHash, cb)
* deleteAccount(uid, hash, cb)
* addThing(uid, hash, type, params, cb) -> thingId
* updateThing(uid, hash, thingId, newParams, cb)
* deleteThing(uid, hash, thingId, cb)

## logged-in actions that don't require retyping your password (can rely on uid + sessionToken):

* listThings(uid, sessionToken, cb) -> {type => {thingId => params} }
* listUsage(uid, sessionToken, cb) -> [details]
* listDonations(uid, sessionToken, cb) -> [details]
* customerDetails(uid, sessionToken, cb) -> {email: ""}
