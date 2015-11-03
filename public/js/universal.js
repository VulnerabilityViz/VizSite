

/*
 * showMessage will popup a small basic modal to display a quick message
 * to the user. 
 * title param = Type String - title of the message
 * body param = Type String - body of the message
 * positive = Type Boolean - if this is a positive message, then true.
 *                           false if it's a negative message.
 *                           This will only affect the display icon. 
 */
var showMessage = function(title, body, positive) {
  var $messageIcon = $('#message-icon'),
      $messageModal = $('#message');
  if (positive) {
    $messageIcon.removeClass();
    $messageIcon.addClass('info circle icon');
  } else {
    $messageIcon.removeClass();
    $messageIcon.addClass('warning sign icon');
  }
  $('#message-title').text(title);
  $('#message-content').text(body);
  $messageModal.modal('show');
};

/* toastr options */
toastr.options = {
  closeButton : true,
  debug : false,
  extendedTimeOut : "1000",
  hideDuration : "1000",
  hideEasing : "linear",
  hideMethod : "fadeOut",
  onclick : null,
  positionClass : "toast-bottom-left",
  progressBar : true,
  showDuration : "300",
  showEasing : "swing",
  showMethod : "fadeIn",
  timeOut : "5000"
};

Date.prototype.toMMDDYYY = function() {
  var month = (1 + this.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  return month + '-' + this.getDate().toString() + '-' + this.getFullYear().toString();
}
