exports.db = {
  'url' : 'mongodb://localhost/dataviz',
  'options' : {}
};

exports.session = {
  name : 'connect.sid',
  secret : 'myNodePOSSecret',
  cookie : {
    path : '/',
    httpOnly : true,
    // if secure is set to true, then cookie will only be set on HTTPS connections
    secure : false,
    // never expire
    maxAge : null
  },
  collection : 'sessions'
};
