angular.module('smartmeetApp.filters')
    .filter('encodeURIComponent', function() {
        return window.decodeURIComponent;
    })
    .filter('to_trusted', ['$sce', function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }])
    .filter('split', function() {
        return function(input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
            return input.split(splitChar)[splitIndex];
        };
    })
    .filter('personList', function() {
        return function(input, splitChar) {
            // do some bounds checking here to ensure it has that index
            return input.split(splitChar).length;
        };
    })
    .filter('monthName', [function() {
        return function(monthNumber) { //1 = January
            var monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
            ];
            return monthNames[monthNumber - 1];
        }
    }])
    .filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1) : '';
        }
    });