'use strict';

/**
 * Loops through the given checks and returns the first truthy value.
 * @param  {Array}  checks  The list of ip checks.
 * @return {String}
 */
function getFirstIp(checks) {
  for(var i in checks) {
    if(checks[i]) {
      return checks[i];
    }
  }

  return null;
}

/**
 * Tries to get the remote client IP address.
 * @module
 * @param  {Object}    request   The request object.
 * @param  {Object}    response  The response object.
 * @param  {Function}  next      The next callback.
 */
module.exports = function(request, response, next) {
  var checks = [
    request.headers['x-client-ip'],

    // defacto header
    request.headers['x-forwarded-for'],

    // nginx
    request.headers['x-real-ip'],

    // Cloudflare
    // https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
    request.headers['cf-connecting-ip'],

    // Rackspace (old, uses x-forwarded-for now), Riverbed
    // https://serverfault.com/questions/409155/x-real-ip-header-empty-with-nginx-behind-a-load-balancer#answer-409159
    request.headers['x-cluster-client-ip'],

    // fastly (old, seem to use x-forwarded-for now)
    request.headers['fastly-ssl'],

    // AKAMAI
    // https://community.akamai.com/thread/4612-can-i-get-client-ip-from-this-header-httpcontextcurrentrequestheaderstrue-client-ip
    request.headers['true-client-ip'],

    // Zscaler
    request.headers['z-forwarded-for'],

    // alt's x-forwarded-for
    request.headers['x-forwarded'],
    request.headers['forwarded-for'],
    request.headers['forwarded'],

    // Connection object checks
    request.connection ? request.connection.remoteAddress : null,
    request.socket ? request.socket.remoteAddress : null,
    request.connection && request.connection.socket ? request.connection.socket.remoteAddress : null,
    request.info ? request.info.remoteAddress : null,
  ];

  var remoteIPs = getFirstIp(checks);

  if(!remoteIPs) {
    request.remoteIP = null;
    return next();
  }

  var ip = remoteIPs.split(',')[0];

  // Apparently Azure Gateway (thanks MS) tacks on port number to the forwarded IP [address:port]
  // https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-faq
  // Q: Does Application Gateway support x-forwarded-for headers?
  if(~ip.indexOf(':')) {
    ip = ip.split(':')[0];
  }

  request.remoteIP = ip.trim();

  return next();
};
