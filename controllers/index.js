var CHARTYPE = 'text/html; charset=UTF-8';
var PAGE401 = '/401';

var getPageHTML = function(template, params) {
    return '<!DOCTYPE html><html><script src="/static/lib/jquery/dist/jquery.min.js"></script><script src="/static/jade/'+template+'.js"></script><script>window.onload=function(){var body=document.getElementsByTagName("body");if(body.length==1){body[0].parentNode.removeChild(body[0])};jade.render(document.getElementsByTagName("html")[0],"'+template+'",'+JSON.stringify(params)+');$.ajaxSetup({cache:true});var scripts=[];$("script").each(function(index){scripts.push($(this).attr("src"));});function getScripts(scripts){var xhrs=scripts.map(function(url){return $.ajax({url:url,dataType:"text",cache:true});});return $.when.apply($,xhrs).done(function(){Array.prototype.forEach.call(arguments,function(res){eval.call(this,res[0]);});});}getScripts(scripts);};</script></html>';
};

var generateMeta = function(req) {
  var session =  {};
  if(req.user) {
    session.username = req.user.username;
    session.user = req.user._id;
    session.role = req.user.role;
    session.fullname = req.user.fullname;
  } 
  return session;
};

var generatePage = function(res, req, page) {
  res.writeHead(200, {
    'Content-Type' : CHARTYPE
  });
  var meta = generateMeta(req);
  res.end(getPageHTML(page,meta));
}

var isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect(PAGE401);
  }
};


/*
 * Controller - routes
 */
module.exports = function(app, passport) {
  
  // Index Page
  app.get('/', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/redirect');
    } else {
      generatePage(res, req, 'index');
    }
  });

  // Signup function
  app.post('/signup', passport.authenticate('local-signup'), function(req, res) {
    res.send({
      redirect : '/redirect'
    });
  });

  app.post('/login', passport.authenticate('local-login'), function(req, res) {
    res.send({
      user : req.user,
      redirect : '/redirect'
    }); 
  });
  
  app.get('/vulnerability', function(req, res) {
    generatePage(res, req, 'vuln');
  });

  app.get('/vulnerability/live', function(req, res) {
    generatePage(res, req, 'live');
  });

  // Logout feature
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

};


