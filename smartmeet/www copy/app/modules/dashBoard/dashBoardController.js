    angular.module('smartmeetApp')
        .controller('dashBoardController', ['$scope', '$state', 'Service', '$location', 'ENV', '$rootScope', '$timeout', 'dataService', 'cordovaService', 'dbService', 'ngProgressFactory', function ($scope, $state, Service, $location, ENV, $rootScope, $timeout, dataService, cordovaService, dbService, ngProgressFactory) {
            'use strict';
            var mySwiper;
            $scope.init = function () {
                $scope.currentSelection = new Date();
                //                Service.showLoader(true);
                $scope.pageclass = "dash";
                $scope.mainArr = [];
                $scope.showModal = false;
                $scope.notification = [];
                $scope.tab1 = true;
                $scope.tab2 = false;
                $scope.dash = true;
                $scope.toggleDateObject = {
                    item: 0
                };
                $scope.accountName = localStorage.getItem('accountname');
                Service.accountname = $scope.accountName;
                Service.username = localStorage.getItem('username');
                if (!$scope.accountName) {
                    Service.getUserDetails().then(function (data) {
                        $scope.accountName = data.AccountName;
                        $scope.username = data.DisplayName;
                        Service.username = data.DisplayName;
                        localStorage.setItem('username', data.DisplayName);
                        console.log(data);

                        Service.accountname = $scope.accountName;
                        localStorage.setItem('accountname', $scope.accountName.toLowerCase());
                        $scope.initData();

                    });
                } else {
                    $scope.initData();
                }

            };

            $scope.myFunction = function () {
                document.getElementById("myDropdown").classList.toggle("show");
            };
            $scope.changeMode = function (mode) {
                $scope.mode = mode;
            };

            $scope.today = function () {
                $scope.currentDate = new Date();
                $scope.currentSelection = $scope.currentDate;
                $scope.initData();
                // console.log($scope.currentSelection);
            };

            $scope.isToday = function () {
                var today = new Date(),
                    currentCalendarDate = new Date($scope.currentDate);

                today.setHours(0, 0, 0, 0);
                currentCalendarDate.setHours(0, 0, 0, 0);
                return today.getTime() === currentCalendarDate.getTime();
            };

            $scope.loadEvents = function () {
                $scope.eventSource = createRandomEvents();
            };

            $scope.onEventSelected = function (event) {
                $scope.event = event;
                var meetingIndex;
                console.log($scope.event);
                if ($scope.event.type === "current") {

                    meetingIndex = dataService.current_meeting_data.map(function (e) {
                        return e.SMLocatorOWSTEXT;
                    }).indexOf($scope.event.meetingId);

                } else if ($scope.event.type === "future") {

                    meetingIndex = dataService.future_meeting_data.map(function (e) {
                        return e.SMLocatorOWSTEXT;
                    }).indexOf($scope.event.meetingId);
                } else {
                    meetingIndex = dataService.past_meeting_data.map(function (e) {
                        return e.SMLocatorOWSTEXT;
                    }).indexOf($scope.event.meetingId);
                }
                $state.go('home', {
                    state: $scope.event.type,
                    meetIndex: meetingIndex,
                    dayIndex: $scope.event.day,
                    agendaIndex: 0

                });
            };

            $scope.onTimeSelected = function (selectedTime) {
                $scope.currentSelection = selectedTime;
                console.log('Selected time: ' + selectedTime);
            };

            function createRandomEvents() {
                console.log($scope.mainArr);
                var events = [];
                for (var i = 0; i < $scope.mainArr.length; i++) {
                    var date = new Date();
                    console.log($scope.mainArr[i]);
                    for (var j = 0; j < $scope.mainArr[i].Days.length; j++) {
                        events.push({
                            title: $scope.mainArr[i].SMNameOWSTEXT,
                            startTime: $scope.mainArr[i].Days[j].startTime,
                            endTime: $scope.mainArr[i].Days[j].endTime,
                            allDay: false,
                            index: i,
                            day: j,
                            type: $scope.mainArr[i].ArrayStatus,
                            meetingId: $scope.mainArr[i].SMLocatorOWSTEXT,
                            description: $scope.mainArr[i].SMDescriptionOWSMTXT

                        });
                    }
                }
                return events;

            }

            $scope.initData = function () {
                $scope.mainArr = Service.meeting_obj
                if ($scope.mainArr.length === 0 || $rootScope.refresh === true) {
                    $scope.getData();
                    $rootScope.refresh = false;
                } else {
                    Service.showLoader(false)
                        //console.log($scope.mainArr);
                    $scope.loadEvents();
                    $scope.showSection = true;
                    $scope.future_meeting = dataService.future_meeting_data;
                    $scope.past_meeting = dataService.past_meeting_data;
                    if (dataService.current_meeting_data.length > 0) {
                        $scope.curr_meeting = dataService.current_meeting_data;
                        $scope.Daysdescription = $scope.curr_meeting.SMDescriptionOWSMTXT;
                    } else {
                        $scope.Daysdescription = "No Current Meetings"
                    }
                    // $scope.setSwiper();
                }
            };
            $scope.toggleModal = function (item) {
                console.log(item);
                $scope.participants = item.split(';');
                $scope.showModal = !$scope.showModal;
            };
            // $scope.setSwiper = function() {
            //     $timeout(function() {
            //         mySwiper = new Swiper('.swiper-container', {
            //             pagination: '.pagination',
            //             paginationClickable: true,
            //             slidesPerView: 1,
            //             resizeEvent: 'auto',
            //             grabCursor: true,

            //         });
            //     }, 10);
            // };
            $scope.getData = function () {
                $("#ngProgress-container").remove();
                $scope.showSection = false;
                Service.showLoader(true);
                if ($rootScope.online) {
                    Service.getMeetingData().then(function (res) {
                        if (res && res.length) {
                            dataService.pushMeetingData(res).then(function (response) {
                                dataService.pushDateArray(response).then(function (data) {
                                    //console.log(data);
                                    $rootScope.progressbar = ngProgressFactory.createInstance();
                                    Service.showLoader(false);
                                    $rootScope.progressbar.start();
                                    $rootScope.progressText = "Fetching Meeting Information";
                                    $rootScope.showProgress = true;
                                    dataService.pushAgenda(data).then(function (resultDat) {
                                        dataService.getDashMeetingData(resultDat).then(function () {
                                            dataService.arrCount = 0;
                                            $scope.mainArr = resultDat;
                                            Service.meeting_obj = $scope.mainArr;
                                            $scope.future_meeting = dataService.future_meeting_data;
                                            $scope.past_meeting = dataService.past_meeting_data;
                                            if (dataService.current_meeting_data.length > 0) {
                                                $scope.curr_meeting = dataService.current_meeting_data;
                                                //console.log($scope.curr_meeting);
                                                $scope.Daysdescription = $scope.curr_meeting[0].SMDescriptionOWSMTXT;
                                            } else {
                                                $scope.Daysdescription = "No Current Meetings"
                                            }
                                            Service.showLoader(false);

                                            $rootScope.progressbar.complete();

                                            $rootScope.progressText = "Fetching Meeting Information";
                                            dbService.addMeeting(Service.meeting_obj).then(function () {
                                                //console.log("Data Added");

                                            });

                                            dataService.refresh();
                                            $scope.loadEvents();

                                            $scope.showSection = true;
                                            $rootScope.showProgress = false;


                                        })

                                    });

                                });
                            });

                        } else {
                            $scope.showSection = true;
                            $scope.future_meeting = null;
                            $scope.past_meeting = null;
                            $scope.curr_meeting = null;
                            if (typeof (cordova) != "undefined" && window.plugins) {
                                cordovaService.showCordovaAlert("No Meeting data Available");
                            } else {
                                console.log("No Meeting data Available");

                            }
                            Service.showLoader(false);
                        }


                    });
                } else {
                    dbService.getMeetingData().then(function (retObj) {
                        if (typeof (cordova) != "undefined" && window.plugins) {
                            cordovaService.showCordovaAlert("No Network Avaialble. Please enable your internet connection");
                        } else {
                            console.log("No Network Avaialble. Please enable your internet connection");

                        }

                        $scope.mainArr = retObj;
                        //console.log(retObj);
                        Service.meeting_obj = retObj;
                        dataService.getDashMeetingData(retObj).then(function () {
                            if ($scope.mainArr.length) {
                                $scope.future_meeting = dataService.future_meeting_data;
                                $scope.past_meeting = dataService.past_meeting_data;
                                if (dataService.current_meeting_data.length > 0) {
                                    $scope.curr_meeting = dataService.current_meeting_data;
                                    //console.log($scope.curr_meeting);
                                    $scope.Daysdescription = $scope.curr_meeting[0].SMDescriptionOWSMTXT;
                                    //                                    $scope.getCount();
                                } else {
                                    $scope.Daysdescription = "No Current Meetings"
                                }
                            } else {
                                $scope.future_meeting = null;
                                $scope.past_meeting = null;
                                $scope.curr_meeting = null;
                                $scope.Daysdescription = "No Current Meetings"
                            }
                            $scope.showSection = true;
                            Service.showLoader(false);
                        });
                        $scope.loadEvents();
                        // $scope.setSwiper();
                    });

                }

            };
            $scope.$watch('online', function (newValue, oldValue) {
                if (newValue !== oldValue) {

                    $scope.online = $rootScope.online;
                    console.log($scope.online);
                }
            });
            $scope.gotoHome = function (meetindex, dayindex, state) {
                var flag = 0;
                if ($scope.mainArr.length) {
                    if (state === "current") {
                        if (dataService.current_meeting_data.length) {
                            flag = 1;
                        } else {
                            flag = 0;
                        }
                    } else if (state === "future") {
                        if (dataService.future_meeting_data.length) {
                            flag = 1;
                        } else {
                            flag = 0;
                        }
                    } else {
                        if (dataService.past_meeting_data.length) {
                            flag = 1;
                        } else {
                            flag = 0;
                        }
                    }
                    if (flag === 1) {
                        $state.go('home', {
                            state: state,
                            meetIndex: meetindex,
                            dayIndex: dayindex,
                            agendaIndex: 0

                        });
                    } else {
                        if (typeof (cordova) != "undefined" && window.plugins) {
                            cordovaService.showCordovaAlert("No " + state + " meetings ");
                        } else {
                            console.log("No " + state + " meetings ");
                            $state.go('dashBoard');
                        }
                    }

                } else {
                    if (typeof (cordova) != "undefined" && window.plugins) {
                        cordovaService.showCordovaAlert("No Offline Data ");
                    } else {
                        console.log("No Offline data");
                        $state.go('dashBoard');
                    }
                }

            };
            $scope.getCount = function () {
                $scope.peopleLen = $scope.curr_meeting[0].SMAttendeesOWSUSER.split(';').length;
                $scope.attachLen = 0;
            };
            $scope.changeTab = function (tab) {
                if (tab == 'tab1') {
                    $scope.tab1 = true;
                    $scope.tab2 = false;
                } else {
                    $scope.tab1 = false;
                    $scope.tab2 = true;
                }
            };
            $scope.close = function () {
                $scope.leftVisible = false;
                $scope.rightVisible = false;
                $("#submenu").removeClass("submenu_active");
            };
            $scope.showLeft = function (e) {
                //$scope.visible=true;
                if ($scope.leftVisible === true) {
                    $scope.leftVisible = false;
                }
                $scope.leftVisible = true;
                $timeout(function () {
                    $("#submenu").addClass("submenu_active");
                }, 300);
                e.stopPropagation();
            };
            $rootScope.$on("documentClicked", _close);
            $rootScope.$on("escapePressed", _close);

            $scope.isNull = function (str) {
                var ret = true;
                if (!str || str === "" || str === "null") {
                    ret = false;
                }
                return ret;
            };

            function _close() {
                $scope.$apply(function () {
                    $scope.close();
                });
            }
            $scope.init();
        }]);
