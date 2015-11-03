$(document).ready(function(){

  $signin = $('#signin');
  $signinContainer = $('#signin-container');
  $signinInputs = $signin.find(':input').not(':button');


  var login = function() {
    if ( $signin.form('is valid') ) {
      $.post('/login',
        $signin.form('get values')
      ).done(function(data) {
        setTimeout(function() {
          $signinContainer.transition({
            animation : 'fly down',
            duration : '1000ms',
            onComplete : function() {
              $('body').transition({
                animation : 'fade',
                onComplete : function() {
                  window.location = data.redirect;
                }
              });
            }
          });
        }, 250);
      }).fail(function(data) {
        $signinContainer.transition({
          animation : 'shake',
          duration : '500ms',
          onStart : function() {
            $('.ui.input').parent().addClass('error');
          }
        });
      });
    }
  };

  // Semantic UI form validation
  $signin.form({
    fields : {
      username : {
        identifier : 'signin-username',
        rules : [
          {
            type : 'empty'
          }
        ]
      },
      password : {
        identifier : 'signin-password',
        rules : [
          {
            type : 'empty'
          }
        ]
      }
    }
  });
  //signin button
  $('#signin-submit').on('click', login);
  //Key Press
  
  $signinInputs.on('keyup', function(e) {
    if (e.keyCode === 13) {
      login();
    }
  });

  $('#signin-username').focus();
});
