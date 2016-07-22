angular.module('smartmeetApp').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    'use strict';
    
    $stateProvider
    .state('dashBoard', {
        url: '/',
        templateUrl: './app/modules/dashBoard/dashBoard.html',
        controller: 'dashBoardController'
    })
    .state('home', {
        url: '/home/:state/:meetIndex/:dayIndex/:agendaIndex',
        
        templateUrl: './app/modules/home/home.html',
        controller: 'homeController',

        params: {
             state:null,
            meetIndex: null,
            dayIndex:null
          
          }
       
    });

    $urlRouterProvider.otherwise('/');

}]);