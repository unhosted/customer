define(['./client'], function(client) {
    for(var key in client) {
        window[key] = client[key];
    }
});