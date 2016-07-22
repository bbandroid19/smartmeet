angular.module('smartmeetApp')
.service("cordovaService",['$rootScope',function($rootScope){


 this.showCordovaAlert = function(message) {
   navigator.notification.confirm(
    message, // message
    onConfirm,// callback to invoke with index of button pressed
    'SMARTMeet',
    'OK' // buttonLabels
                                                          );
 };


 function onConfirm(buttonIndex) {
   console.log('You selected button ' + buttonIndex);
 }

 this.sessionExpired =function(){
   return("Session Expired");
 }

 this.serverError =function(){
   return("Server Error");
 }

 this.noNetwork =function(){
   return("No Network Connection");
 }


}]);