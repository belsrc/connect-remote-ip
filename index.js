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
    request.headers['cf-connecting-ip'],

    // Rackspace, Riverbed
    request.headers['x-cluster-client-ip'],

    // fastly
    request.headers['fastly-ssl'],

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

  remoteIPs = remoteIPs.split(',');

  request.remoteIP = remoteIPs[0].trim();

  return next();
};
