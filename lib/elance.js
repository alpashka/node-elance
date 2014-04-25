var OAuth2 = require('./oauth2').OAuth2,
    URL = require('url'),
    qs = require('qs'),
    baseUrl = process.env.ELANCEAPI || 'https://api.elance.com/';


exports.Elance = function(key, secret) {
    this.baseUrl = baseUrl;
    this.OAuth2 = new OAuth2(key, secret);
}

exports.Elance.prototype._secureRequest = function(method, path, data, callback) {
    if(typeof data == 'function') {
        callback = data;
        data = null;
    }
    
    if(!(this.OAuth2.accessToken && this.OAuth2.refreshToken)) {
        return callback(new Error("OAuth2.accessToken and OAuth2.refreshToken must be set."))
    } else {
        var extraParams = {};
        if(method != 'GET') {
            extraParams = data || {};
            data = null;
            if(method == 'PUT' || method == 'DELETE') {
                extraParams['http_method'] = method.toLowerCase();
                method = 'POST';
            }
        } else if(data) {
            // append data params to url for GET request
            path += (path.indexOf("?") == -1) ? '?' : '&';
            path += qs.stringify(data);
            data = null;
        }
        var url = URL.resolve(this.baseUrl, path);        
        this.OAuth2._request(method, url, extraParams, this.customHeaders, data, function(error, data, response) {
            if(error) return callback(error)
            else {
                if(response.headers['content-type'] == 'application/json') {
                    try {
                        var json = JSON.parse(data);
                    } catch(error) {
                        return callback(error)
                    }
                    return callback(null, json)
                } else return callback(null, data)
            }
        });
    }
}

exports.Elance.prototype.get = function(path, data, callback) {
    return this._secureRequest('GET', path, data, callback)
}
exports.Elance.prototype.post = function(path, data, callback) {
    return this._secureRequest('POST', path, data, callback)
}
exports.Elance.prototype.put = function(path, data, callback) {
    return this._secureRequest('PUT', path, data, callback)
}
exports.Elance.prototype.delete = function(path, data, callback) {
    return this._secureRequest('DELETE', path, data, callback)
}
