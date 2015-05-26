var key = process.env.KEY
  , secret = process.env.SECRET
  , callbackUrl = ''
  , Elance = require('../')
  , rl = require('readline')
  , elance = new Elance(key, secret)
  , qs = require('querystring')
  , util = require('util');

elance.OAuth2.getAuthorizeUrl(callbackUrl, function(err, url) {
  console.log('Follow the url to get code: \n' + url)
});
var i = rl.createInterface(process.stdin, process.stdout);

i.question("Enter oauth_verifier: ", function(code) {
  i.close();
  
  process.stdin.destroy();
  
  elance.OAuth2.getAccessToken(code, function(err, accessToken, accessTokenSecret, expiresIn) {
    
    if (err) throw err;
    
    console.log('credentials', accessToken, accessTokenSecret);

    var params = {};
    params.access_token = accessToken;

    elance.OAuth2.accessToken = accessToken;
    elance.OAuth2.accessTokenSecret = accessTokenSecret;
    
    elance.OAuth2.refreshAccessToken(accessTokenSecret, function(err, accessToken, accessTokenSecret, expiresIn){

      if (err) throw err;
      
      var params = {};
      params.access_token = accessToken;

      elance.OAuth2.accessToken = accessToken;
      elance.OAuth2.accessTokenSecret = accessTokenSecret;
      
      elance.get('api2/categories?' + qs.stringify(params), function (err, data) {
        if (err) console.log(err);
        console.log(data);
      });

      params.catFilter = '10183'
      params.rpp = '25'

      elance.get('api2/jobs?' + qs.stringify(params), function (err, data) {
        if (err) console.log(err);
        console.log(util.inspect(data.data.pageResults));
      });

    });

  });
  
});