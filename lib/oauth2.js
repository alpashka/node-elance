var oauth = require('oauth')
  , qs = require('querystring')
  , request = require('superagent')
  , baseUrl = process.env.ELANCEAPI || 'https://api.elance.com/';


exports.OAuth2 = function(key, secret) {
  this.requestUrl = baseUrl + '/api/auth/v1/oauth/token/request';
  this.accessUrl = baseUrl + 'api2/oauth/token';
  this.key = key;
  this.secret = secret;
  this.version = '2.0';
  this.callback = null;
  this.customHeaders = {
    'Accept' : 'application/json',
    'Connection' : 'close',
    'User-Agent': 'Node-Elance'
  }    
  return new oauth.OAuth2(
    this.key, 
    this.secret, 
    baseUrl, 
    null, 
    'api2/oauth/token',        
    this.customHeaders)
}


oauth.OAuth2.prototype.getAuthorizeUrl = function(callbackUrl, callback) {
  var authorizeUrl = baseUrl + 'api2/oauth/authorize'
    , params = {};

  params.redirect_uri = callbackUrl;    
  params.client_id = this._clientId;    
  params.response_type = 'code'

  return callback(null, authorizeUrl + '?' + qs.stringify(params));
}


oauth.OAuth2.prototype.getAccessToken = function(code, callback) {
  var params = {}
    , self = this;
  params.client_id = this._clientId;
  params.client_secret = this._clientSecret;
  params.grant_type = 'authorization_code';
  this.getOAuthAccessToken(code, params, function (error, access_token, refresh_token, res) {    
    if(error) callback(error)
    else {
      self.accessToken = res.data.access_token;
      self.refreshToken = res.data.refresh_token;
      return callback(error, self.accessToken, self.refreshToken, res.data.expires_in);
    }
  });
}


oauth.OAuth2.prototype.getRefreshAccessToken = function(token, done) {
  
  var self = this;

  request
    .post(baseUrl + 'api2/oauth/token')
    .send({
      refresh_token: token,
      grant_type: 'refresh_token',
    })
    .auth(this._clientId, this._clientSecret)
    .type('application/x-www-form-urlencoded')
    .end(function(err, response){
      if (err) return done(err);
      var body = response.body.data;
      done(null, body.access_token, body.refresh_token, body.expires_in);
    });
 
}
