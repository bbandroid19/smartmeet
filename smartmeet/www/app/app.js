angular.module('smartmeetApp.filters', []);
angular.module('smartmeetApp.services', []);
angular.module('smartmeetApp.directives', []);

angular.module('smartmeetApp', [
        'ui.router',
        'config',
        'smartmeetApp.filters',
        'smartmeetApp.services',
        'smartmeetApp.directives',
        'ngIOS9UIWebViewPatch',
        'ngTouch',
        'ngProgress',
        'angularMoment',
        'angular-svg-round-progressbar',
        'ui.rCalendar'
    ])
    .run(function ($rootScope, $window, dbService, $interval, $rootScope, Service) {

        window.onclick = function (event) {
            if (!event.target.matches('.notification')) {

                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
            if (!event.target.matches('.download_data')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }

        $interval(function () {


            $rootScope.notificationdata = [];
            Service.notificatonData = [];
            //            angular.element(document.getElementById('myDropdown')).empty();
            var arr_length = 0;
            Service.getNotifications().then(function (data) {
                console.log(data);
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].SMNotificationStatus === "UnRead") {
                            Service.notificatonData.push(data[i]);
                            $rootScope.notificationdata.push(data[i]);
                            arr_length++;
                        }
                    }
                    if (arr_length > 0) {
                        var el = document.querySelector('.notification');
                        var count = Number(el.getAttribute('data-count')) || $rootScope.notificationCount;
                        console.log(count);
                        count = 0;

                        if (arr_length > $rootScope.notificationCount || !$rootScope.notificationCount) {
                            var count1 = arr_length;
                            $rootScope.notificationCount = arr_length;
                            el.setAttribute('data-count', count + count1);
                            el.classList.remove('notify');
                            el.offsetWidth = el.offsetWidth;
                            el.classList.add('notify');
                            if (count === 0) {
                                el.classList.add('show-count');
                            }
                        }
                    }
                }



            });
        }, 30000);
        document.addEventListener("deviceready", function () {
            authDialog.authenticate("https://share.ey.net/sites/SMARTMeet");
        });
        dbService.init().then(function () {
            console.log("DB Initialised");
        });
        FastClick.attach(document.body);
        document.addEventListener("keyup", function (e) {
            if (e.keyCode === 27)
                $rootScope.$broadcast("escapePressed", e.target);
        });

        document.addEventListener("click", function (e) {
            $rootScope.$broadcast("documentClicked", e.target);
        });
        document.addEventListener("DOMContentLoaded", function () {
            // dbService.openDB();
        });

        $rootScope.online = navigator.onLine;
        $window.addEventListener("offline", function () {
            $rootScope.$apply(function () {
                console.log("offline");
                $rootScope.online = false;
            });

        }, false);
        $window.addEventListener("online", function () {
            $rootScope.$apply(function () {
                console.log("online");
                $rootScope.online = true;
            });
            $rootScope.$broadcast('DeviceOnline', {
                message: "online"
            });
        }, false);


        // This code will use the native IndexedDB, if it exists, or the shim otherwis


    })
    .controller('mainController', ['$scope', '$rootScope', '$interval', 'Service', function ($scope, $rootScope, $interval, Service) {

    }]);
