angular.module('smartmeetApp.directives')
    .directive("loader", function () {
        return {
            restrict: "E",
            template: '<div class="loading"><i class="fa fa-spinner fa-spin"></i></div>',
            link: function (scope, elem, attrs) {

            }
        };
    })
    .directive("header", function () {
        return {
            restrict: "E",
            scope: true,
            template: '<div class="header" ng-cloak><a class="navbar-brand brand header-content" ng-cloak>' +
                '</a>' +
                '<span class="title header-content" ng-cloak>SMARTMeet</span>' +
                '<div class="container"> <div ng-click="myFunction()" class="notification dropdown"> </div> <div id="myDropdown" class="animated slideInDown dropdown-content"> <div class="notification_header">Notifications</div> <div class="notify_wrap" ng-if="notificationdata.length"> <div class="not_clear" ng-click="deleteAll()">Clear All</div> <div  id={{\'not_\'+$index}} ng-repeat="notifydat in notificationdata"> <div ng-click="gotoNotiication($index)" class="col-xs-10  notification_data " ng-class="{\'notify_active\':notifydat.SMNotificationStatus ==\'UnRead\'}" ng-if="notifydat.SMNotificationType ==\'Meeting\' ">You\'re invited to \'{{notifydat.Title}} \' </div> <div ng-click="gotoNotiication($index)" class="notification_data col-xs-10" ng-class="{\'notify_active\':notifydat.SMNotificationStatus==\'UnRead\'}" ng-if="notifydat.SMNotificationType !=\'Meeting\' "> A Comment on \'{{notifydat.Title}}\' has been shared by {{notifydat.SMNotificationUserTitle}}</div> <div ng-click="deleteNotification($index)" class="col-xs-2 notify_delete"><i class="fa fa-trash-o"></i></div> </div> </div> <div class="notify_wrap " style="padding-top:12%" ng-if="!notificationdata.length"> No Notifications </div> </div> </div>',
            controller: function ($scope, $element, Service, dataService, $state, $q, $rootScope) {
                $scope.mainNotification = Service.notificatonData;
                console.log($scope.mainNotification);
                $scope.clicked = 0;
                $scope.myFunction = function () {
                    // $scope.mainNotification=Service.notificatonData;
                    $('#downloadDropdown').removeClass("show");
                    var el = document.querySelector('.notification');
                    el.setAttribute('data-count', 0);
                    el.classList.remove('notify');
                    $scope.showNotification = true;

                    document.getElementById("myDropdown").classList.toggle("show");
                };
                $scope.gotoNotiication = function (index) {
                    if ($scope.deleted) {
                        index = index - 1;
                        $scope.deleted = false;
                    }
                    document.getElementById("myDropdown").classList.toggle("show");
                    //                     var el = document.querySelector('.notification');
                    //                var count = Number(el.getAttribute('data-count')) || $rootScope.notificationCount;
                    //                console.log(count);
                    //                 el.setAttribute('data-count', count -1 );
                    var meeting_arr = [];
                    var dayIndex = 0;
                    var found = false;
                    var state = "";
                    var agenda = 0;

                    console.log(Service.meeting_obj);
                    var meetingIndex = 0;
                    for (var i = 0; i < Service.meeting_obj.length; i++) {
                        if (Service.meeting_obj[i].SMLocatorOWSTEXT === $rootScope.notificationdata[index].SMLocator) {
                            found = true;
                            state = Service.meeting_obj[i].ArrayStatus;
                            console.log("found");
                            if (Service.meeting_obj[i].ArrayStatus == "current") {

                                meetingIndex = dataService.current_meeting_data.map(function (e) {
                                    return e.SMLocatorOWSTEXT;
                                }).indexOf(Service.meeting_obj[i].SMLocatorOWSTEXT);
                                meeting_arr = dataService.current_meeting_data[meetingIndex];
                            } else if (Service.meeting_obj[i].ArrayStatus == "future") {

                                meetingIndex = dataService.future_meeting_data.map(function (e) {
                                    return e.SMLocatorOWSTEXT;
                                }).indexOf(Service.meeting_obj[i].SMLocatorOWSTEXT);
                                meeting_arr = dataService.future_meeting_data[meetingIndex];
                            } else {
                                //                                 meeting_arr=dataService.past_meeting_data;
                                meetingIndex = dataService.past_meeting_data.map(function (e) {
                                    return e.SMLocatorOWSTEXT;
                                }).indexOf(Service.meeting_obj[i].SMLocatorOWSTEXT);
                                meeting_arr = dataService.past_meeting_data[meetingIndex];
                            }
                            console.log(meetingIndex);

                        }

                    }
                    if (found && !$rootScope.showProgress) {
                        for (var j = 0; j < meeting_arr.Days.length; j++) {
                            for (var k = 0; k < meeting_arr.Days[j].agenda.length; k++) {
                                if (meeting_arr.Days[j].agenda[k].ID === parseInt($rootScope.notificationdata[index].SMNotificationParentID)) {
                                    dayIndex = j;
                                    agenda = k;
                                }
                            }

                        }
                        $rootScope.selectedNotification = $rootScope.notificationdata[index];
                        $state.go('home', {
                            state: state,
                            meetIndex: meetingIndex,
                            dayIndex: dayIndex,
                            agendaIndex: agenda

                        });
                    }

                };
                $scope.deleteNotification = function (index) {
                    if ($scope.deleted) {
                        index = index - 1;
                        $scope.deleted = false;
                    }
                    var id = $rootScope.notificationdata[index].ID;
                    Service.notificatonData.splice(index, 1);
                    $rootScope.notificationdata.splice(index, 1);
                    Service.deleteNotification(id).then(function (data) {
                        console.log(data);

                    });

                    // angular.element(document.getElementById("not_" + index)).empty();
                    $scope.deleted = true;
                    console.log(index);
                    console.log(angular.element(document.getElementById("not_" + index)));
                };
                $scope.deleteAll = function () {
                    var id;
                    var dummyarr = $rootScope.notificationdata;
                    $rootScope.notificationdata = [];
                    for (var i = 0; i < dummyarr.length; i++) {
                        var defer = $q.defer();
                        var promises = [];
                        Service.notificatonData.splice(i, 1);


                        Service.deleteNotification(dummyarr[i].ID).then(function (data) {
                            console.log(data);

                        });
                    }
                    // for (var i = 0; i < $rootScope.notificationdata.length; i++) {
                    //     var defer = $q.defer();
                    //     var promises = [];
                    //      Service.notificatonData.splice(i, 1);
                    //      id=$rootScope.notificationdata[i].ID;

                    //     Service.deleteNotification(id).then(function(data) {
                    //         console.log(data);
                    //         promises.push(Service.notificatonData);
                    //     });
                    // }
                    // $q.all(promises).then(Service.notificatonData = []);
                    // document.getElementById("myDropdown").classList.toggle("show");
                };
            },
            link: function (scope, elem, attrs) {

            }
        };
    }).directive('sideMenu', [function () {
        return {
            link: function (scope, element, attrs) {
                // $timeout(function(){
                setTimeout(function () {
                    $(element).metisMenu({
                        toggle: true
                    });
                }, 10);

                scope.$watch('menus', function () {
                    setTimeout(function () {
                        $(element).metisMenu({
                            toggle: true
                        });
                    }, 10);
                });
            }
        };
    }])
    .directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        };
    }).directive("mymenu", function ($state, $location, dataService, cordovaService) {

        return {
            restrict: "E",
            template: "<div id='submenu' ng-class='{ show: visible, left: alignment === \"left\", right: alignment === \"right\" }' ng-transclude></div>",
            transclude: true,
            scope: {
                visible: "=",
                alignment: "@",
                docnotes: '='
            },
            link: function (scope, element, attributes) {
                element.find('.dash_go').on('click', function () {
                    $state.go("dashBoard");
                });
                element.find('.current_go').on('click', function () {
                    if (dataService.current_meeting_data.length) {
                        $state.go('home', {
                            state: "current",
                            meetIndex: 0,
                            dayIndex: 0,
                            agendaIndex: 0

                        });
                    } else {
                        if (typeof (cordova) != "undefined" && window.plugins) {
                            cordovaService.showCordovaAlert("You have no current meetings. ");
                        } else {
                            console.log("You have no current meetings. ");
                            $state.go('dashBoard');
                            //                				$(".loading").show();
                        }
                    }

                });
                element.find('.future_go').on('click', function () {
                    if (dataService.future_meeting_data.length) {
                        $state.go('home', {
                            state: "future",
                            meetIndex: 0,
                            dayIndex: 0,
                            agendaIndex: 0

                        });
                    } else {
                        if (typeof (cordova) != "undefined" && window.plugins) {
                            cordovaService.showCordovaAlert("You have no upcoming meetings. ");
                        } else {
                            console.log("You have no upcoming meetings. ");
                            $state.go('dashBoard');
                        }
                    }

                });
                element.find('.past_go').on('click', function () {
                    if (dataService.past_meeting_data.length) {
                        $state.go('home', {
                            state: "past",
                            meetIndex: 0,
                            dayIndex: 0,
                            agendaIndex: 0

                        });
                    } else {
                        if (typeof (cordova) != "undefined" && window.plugins) {
                            cordovaService.showCordovaAlert("You have no past meetings. ");
                        } else {
                            console.log("You have no past meetings. ");
                            $state.go('dashBoard');
                        }
                    }

                });
            },

        };
    })
    .directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
                '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<h4 class="modal-title">{{ title }}</h4>' +
                '</div>' +
                '<div class="modal-body" ng-transclude></div>' +
                '</div>' +
                '</div>' +
                '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;

                scope.$watch(attrs.visible, function (value) {
                    if (value == true)
                        $(element).modal('show');
                    else
                        $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    })
    .directive('viewer', function () {
        return {
            restrict: 'E',
            templateUrl: './app/modules/templates/viewer.html'
        }
    });
