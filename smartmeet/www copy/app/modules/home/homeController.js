    angular.module('smartmeetApp')
        .controller('homeController', ['$scope', '$state', 'Service', 'ENV', '$rootScope', '$stateParams', '$timeout', '$sce', 'cordovaService', '$window', 'dataService', 'dbService', '$compile', '$q', '$interval', 'ngProgressFactory', function ($scope, $state, Service, ENV, $rootScope, $stateParams, $timeout, $sce, cordovaService, $window, dataService, dbService, $compile, $q, $interval, ngProgressFactory) {
            $scope.init = function () {
                $scope.showModal = false;

                $scope.selected = {};
                $scope.selectedAll = false;
                $scope.show_details = true;
                $scope.search = false;
                $scope.showDoc = false;
                $scope.leftVisible = false;
                $scope.rightVisible = false;
                $rootScope.docnotes = "";
                $scope.meetingIndex = $stateParams.meetIndex;
                $scope.dayIndex = $stateParams.dayIndex;
                $scope.agendaIndex = $stateParams.agendaIndex;
                console.log($scope.agendaIndex);
                $scope.meetingStatus = $stateParams.state;
                $scope.subheaderTitle = $scope.meetingStatus + " Meetings";
                if ($scope.meetingStatus == "current") {
                    $scope.current = true;
                    $scope.meeting = dataService.current_meeting_data;
                } else if ($scope.meetingStatus == "future") {
                    $scope.future = true;
                    $scope.subheaderTitle = "Upcoming Meetings";
                    $scope.meeting = dataService.future_meeting_data;
                } else {
                    $scope.past = true;
                    $scope.meeting = dataService.past_meeting_data;
                }
                $scope.changeHomeData();
                if ($scope.meeting[$scope.meetingIndex]) {

                    $scope.Attendees = $scope.meeting[$scope.meetingIndex].SMAAttendeesList;
                }
                $scope.getMyUserId();

                Service.showLoader(false);
                //                $scope.tab2 = true;
                $scope.toggleObject = {
                    item: $scope.agendaIndex
                };
                $scope.toggleMeetingObject = {
                    item: $scope.dayIndex
                };
                $scope.initVal = 0;
                $rootScope.notificationCount = 0;

                if (LocalFileSystem) {
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {

                        var deviceRootPath = fileSystem.root.toURL();
                        $scope.filepath = deviceRootPath + 'SmartmeetDocs/';


                    }, function () {
                        if (typeof (cordova) != "undefined" && window.plugins) {
                            cordovaService.showCordovaAlert("Cannot Access download path");
                        } else {
                            console.log("Cannot Access download path");

                        }
                        cordovaService.showCordovaAlert("Error in retreiving native location");
                        console.log("fails!");
                    });
                }

            };

            $rootScope.$on('Notification', function (ev, args) {
                console.log('eventX found on $rootScope');
                console.log(args);
                console.log($scope.sessionId);
            });
            $scope.getOfflineDocInfo = function () {

                if ($scope.filepath) {
                    window.resolveLocalFileSystemURL($scope.filepath,
                        function (fileSystem) {
                            var reader = fileSystem.createReader();
                            reader.readEntries(
                                function (entries) {
                                    $scope.fileEntry = entries;
                                    console.log(entries);
                                },
                                function (err) {
                                    console.log(err);
                                }
                            );
                        },
                        function (err) {
                            cordovaService.showCordovaAlert("Error in retreiving native location");
                            console.log(err);
                        }
                    );
                }

            };
            $scope.deleteFile = function (fileUrl, index) {

                $scope.fileEntry.splice(index, 1);
                window.resolveLocalFileSystemURL(fileUrl,
                    function (fileSys) {

                        fileSys.remove();

                    },
                    function (err) {
                        cordovaService.showCordovaAlert("Error in retreiving native location");
                        console.log(err)

                    });



            };
            $scope.isInNotification = function (data) {
                //                console.log(data);
                var ret = false;

                angular.forEach($rootScope.notificationdata, function (item) {
                    if (item.SMLocator === $scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT && item.SMNotificationParentID === $scope.sessionId.toString()) {
                        if (item.Title === data.FileName.split('.')[0]) {
                            ret = true;
                            //                            console.log("match");
                        }
                    }
                });

                return ret;
            };
            $scope.initCurrent = function () {
                Service.showLoader(false);
                angular.forEach($scope.attachments, function (item, index) {

                    dbService.addDocTitle($scope.meeting[$scope.meetingIndex].SMNameOWSTEXT, item)
                });

            };
            $scope.mimeTypeObj = {
                ".au": "audio/basic",
                ".avi": "video/msvideo, video/avi, video/x-msvideo",
                ".bmp": "image/bmp",
                ".bz2": "application/x-bzip2",
                ".css": "text/css",
                ".dtd": "application/xml-dtd",
                ".doc": "application/msword",
                ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
                ".es": "application/ecmascript",
                ".exe": "application/octet-stream",
                ".gif": "image/gif",
                ".gz": "application/x-gzip",
                ".hqx": "application/mac-binhex40",
                ".html": "text/html",
                ".jar": "application/java-archive",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".js": "application/x-javascript",
                ".midi": "audio/x-midi",
                ".mp3": "audio/mpeg",
                ".mpeg": "video/mpeg",
                ".ogg": "audio/vorbis, application/ogg",
                ".pdf": "application/pdf",
                ".pl": "application/x-perl",
                ".png": "image/png",
                ".potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
                ".ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
                ".ppt": "application/vnd.ms-powerpointtd>",
                ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".ps": "application/postscript",
                ".qt": "video/quicktime",
                ".ra": "audio/x-pn-realaudio, audio/vnd.rn-realaudio",
                ".ram": "audio/x-pn-realaudio, audio/vnd.rn-realaudio",
                ".rdf": "application/rdf, application/rdf+xml",
                ".rtf": "application/rtf",
                ".sgml": "text/sgml",
                ".sit": "application/x-stuffit",
                ".sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
                ".svg": "image/svg+xml",
                ".swf": "application/x-shockwave-flash",
                ".tar.gz": "application/x-tar",
                ".tgz": "application/x-tar",
                ".tiff": "image/tiff",
                ".tsv": "text/tab-separated-values",
                ".txt": "text/plain",
                ".wav": "audio/wav, audio/x-wav",
                ".xlam": "application/vnd.ms-excel.addin.macroEnabled.12",
                ".xls": "application/vnd.ms-excel",
                ".xlsb": "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
                ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
                ".xml": "application/xml",
                ".zip": "application/zip, application/x-compressed-zip"
            };

            $scope.getContentType = function (fileName) {
                var fileSplitArr = [];
                fileSplitArr = fileName.split(".");
                var ext = fileSplitArr[fileSplitArr.length - 1];
                ext = ext.toLowerCase();
                var contentType = $scope.mimeTypeObj['.' + ext];
                console.log("before..." + contentType);
                if (typeof contentType === "undefined")
                    contentType = "text/html";

                return contentType;
            };

            $scope.stopLoader = function () {
                $timeout(function () {

                    angular.element('#home_container').css('margin-top', '77px');
                    Service.showLoader(false);
                }, 300);

            };

            $scope.toggleModal = function () {
                $scope.showModal = !$scope.showModal;
            };
            $scope.getMyUserId = function () {
                if ($scope.Attendees) {
                    var attendeesArr = $scope.Attendees[0].SMAttendees.results;
                    for (var i = 0; i < attendeesArr.length; i++) {
                        if (attendeesArr[i].Title === Service.username) {
                            $scope.myId = attendeesArr[i].Id;
                            Service.userId = $scope.myId;
                            console.log($scope.myId);
                        }
                    }
                    localStorage.setItem("userid", $scope.myId);
                }

            };
            $('#btn-search').on('click', function (e) {

                e.preventDefault();
                $('#search').animate({
                    width: 'toggle'
                }).focus();

            });
            $scope.$watch('online', function (newValue, oldValue) {
                if (newValue !== oldValue) {

                    $scope.online = $rootScope.online;
                    //console.log($scope.online);
                    if ($scope.online === false) {
                        dbService.addMeetingById($scope.meeting).then(function () {
                            console.log("Data Added");
                        });
                    }

                }
            });
            $scope.$on('DeviceOnline', function (event, args) {
                $scope.message = args.message;
                $scope.online = $rootScope.online;
                dbService.getOfflineNote().then(function (offlineNote) {
                    console.log(offlineNote);

                    for (var i = 0; i < offlineNote.length; i++) {
                        dbService.clearOfflineNote(offlineNote[i].meetingId);
                        Service.sharecomments(offlineNote[i].meetingId, offlineNote[i].atendeeList, offlineNote[i].docUrl, offlineNote[i].comments, offlineNote[i].sessionId, offlineNote[i].isShared)
                    }
                });
                //                dbService.clearOfflineNote();
                console.log($scope.message);
            });
            angular.element("menu").click(function (e) {
                if (e.target.id == "note" || $(e.target).parents("#note").size()) {

                } else {
                    $scope.closeNote();
                }
            });

            $scope.changeHomeData = function () {
                if ($scope.showDoc) {
                    $scope.closeDoc();
                }
                if ($scope.meeting.length > 0) {
                    console.log($scope.agendaIndex);
                    console.log($scope.meeting);
                    $scope.agenda_arr = $scope.meeting[$scope.meetingIndex].Days[$scope.dayIndex].agenda;
                    console.log($scope.agenda_arr);
                    if ($scope.agenda_arr.length > 0) {
                        $scope.activity = $scope.agenda_arr[$scope.agendaIndex].SMASession;
                        if ($scope.activity == 'Break' || $scope.activity == 'Lunch' || $scope.activity == 'Dinner') {
                            $scope.breakTime = $scope.agenda_arr[$scope.agendaIndex].SMStartTime + " - " + $scope.agenda_arr[$scope.agendaIndex].SMEndTime
                            $scope.break = true;
                        } else {
                            $scope.break = false;
                        }
                        $scope.moderator = $scope.agenda_arr[$scope.agendaIndex].SMAChairName;
                        $scope.description = $scope.agenda_arr[$scope.agendaIndex].SMASessionDescription;
                        $scope.sessionId = $scope.agenda_arr[$scope.agendaIndex].ID;
                        $scope.venue = $scope.agenda_arr[$scope.agendaIndex].SMAVenue;
                        $scope.participants = [];
                        if ($scope.agenda_arr[$scope.agendaIndex].SMAType === "Regular") {
                            for (var i = 0; i < $scope.agenda_arr[$scope.agendaIndex].SMAAttendees.results.length; i++) {
                                $scope.participants.push({
                                    name: $scope.agenda_arr[$scope.agendaIndex].SMAAttendees.results[i].Title,
                                    email: $scope.agenda_arr[$scope.agendaIndex].SMAAttendees.results[i].SipAddress
                                })
                            }
                        }

                        console.log($scope.participants);
                        if ($scope.agenda_arr[$scope.agendaIndex].AttachArray.length == 0) {
                            if ($scope.agenda_arr[$scope.agendaIndex].Attachments) {
                                $scope.tab2 = true;
                                $scope.tab1 = false;
                                if ($rootScope.online) {
                                    Service.showLoader(true);
                                    Service.getAttachments($scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT, $scope.agenda_arr[$scope.agendaIndex].ID).then(
                                        function (response) {
                                            if (response) {
                                                $scope.agenda_arr[$scope.agendaIndex].AttachArray = response;
                                                console.log($scope.agenda_arr[$scope.agendaIndex]);
                                                for (var i = 0; i < $scope.agenda_arr[$scope.agendaIndex].AttachArray.length; i++) {
                                                    $scope.agenda_arr[$scope.agendaIndex].AttachArray[i].notes = {
                                                        "text": ""
                                                    }
                                                }
                                                $scope.attachments = response;
                                                $scope.initCurrent();

                                            } else {
                                                cordovaService.showCordovaAlert("Document detail fetch error");
                                                Service.showLoader(false);
                                            }
                                            Service.showLoader(false);
                                        });
                                    console.log($scope.agenda_arr);
                                    for (var i = 0; i < Service.meeting_obj.length; i++) {
                                        if (Service.meeting_obj[i].SMLocatorOWSTEXT == $scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT) {
                                            Service.meeting_obj.length[i] = $scope.meeting[$scope.meetingIndex];
                                            console.log("Service variable updated");
                                            console.log(Service.meeting_obj);
                                            dbService.addMeeting(Service.meeting_obj).then(function (ret) {
                                                console.log("database updated");
                                            });
                                        }
                                    }
                                } else {
                                    Service.showLoader(false);
                                    $scope.tab2 = false;
                                    $scope.tab1 = true;
                                    $scope.attachments = null;
                                }
                            } else {
                                Service.showLoader(false);
                                $scope.tab2 = false;
                                $scope.tab1 = true;
                                $scope.attachments = null;
                            }

                        } else {
                            Service.showLoader(false);
                            $scope.tab2 = true;
                            $scope.tab1 = false;
                            $scope.attachments = $scope.agenda_arr[$scope.agendaIndex].AttachArray;

                        }
                    } else {
                        Service.showLoader(false);
                        $scope.participants = [];
                        $scope.break = false;
                        $scope.activity = "No Data Available";
                        $scope.moderator = "";
                        $scope.description = "No Data Available";
                        $scope.venue = "No Data Available";
                        $scope.attachments = null;
                    }

                } else {
                    if (typeof (cordova) != "undefined" && window.plugins) {
                        cordovaService.showCordovaAlert("You have no " + $scope.meetingStatus + " meetings. ");
                    } else {
                        console.log("You have no " + $scope.meetingStatus + " meetings. ");
                        $state.go('dashBoard');
                        //                				$(".loading").show();
                    }
                }
                $scope.getOfflineDocInfo();
            };
            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                $timeout(function () {
                    $("#ul_" + $scope.meetingIndex).parent('li').children('a').click();
                }, 200);

            });
            $scope.changeMeeting = function (index) {
                if ($scope.initVal != 0) {
                    $scope.dayIndex = 0;
                    $scope.agendaIndex = 0;
                }
                $scope.meetingIndex = index;
                $scope.Attendees = $scope.meeting[$scope.meetingIndex].SMAAttendeesList;
                $scope.hideShowDiv(false, false, true);
                $scope.changeHomeData();
                $scope.toggleMeetingObject = {
                    item: $scope.dayIndex
                };
                $scope.toggleObject = {
                    item: $scope.agendaIndex
                };
                $scope.initVal = 1;
            };
            $scope.hideShowDiv = function (val1, val2, val3) {
                if (val1 === true) {
                    angular.element('#agenda_note').val($scope.agenda_arr[$scope.agendaIndex].SMADiscussionPoints);
                }
                $scope.createMOM = val1;
                $scope.show_mom = val2;
                $scope.show_details = val3;
            };
            $scope.changeAgenda = function (agendaindex, event) {
                $scope.agendaIndex = agendaindex;
                $scope.hideShowDiv(false, false, true);
                $scope.changeHomeData();
            };
            $scope.changeDate = function (parentIndex, dateIndex) {
                $scope.meetingIndex = parentIndex;
                $scope.dayIndex = dateIndex;
                $scope.agendaIndex = 0;
                $scope.changeHomeData();
                $scope.toggleObject = {
                    item: 0
                };
            };
            $scope.changeTab = function (tab) {
                if (tab == "tab1") {
                    $scope.tab1 = true;
                    $scope.tab2 = false;
                } else {
                    $scope.tab2 = true;
                    $scope.tab1 = false;
                }
            };
            $scope.init();
            $scope.close = function () {
                $scope.leftVisible = false;
                $("#submenu").removeClass("submenu_active");
            };
            $scope.showLeft = function (e) {
                //$scope.visible=true;
                if ($scope.leftVisible === true) {
                    $scope.leftVisible = false;
                }
                $scope.leftVisible = true;

                e.stopPropagation();
                $timeout(function () {
                    $("#submenu").addClass("submenu_active");
                }, 300);

            };
            $scope.showRight = function (e) {
                angular.element('#docnote').val("");
                $scope.comments = "Fetching comments....";
                $scope.loadComments().then(function () {
                    // body...
                    console.log("Inside defer");
                    Service.showLoader(false);
                });
                if ($scope.rightVisible === true) {
                    $scope.rightVisible = false;
                }
                $scope.rightVisible = true;

                e.stopPropagation();
                //                $(".right").addClass("submenu_active");
            };

            $scope.saveMOM = function () {
                $scope.hideShowDiv(false, true, false);

                $scope.agenda_arr[$scope.agendaIndex].SMADiscussionPoints = angular.element('#agenda_note').val();
                $scope.discussion_points = angular.element('#agenda_note').val();
                Service.meeting_obj = $scope.meeting;

            };
            $scope.loadDocument = function (url, isPresent) {
                console.log(url);
                $scope.urlContent = $sce.trustAsResourceUrl($scope.url);
                var lastPart = $scope.url.substr($scope.url.lastIndexOf('/') + 1);
                $scope.doc_type = lastPart.split('.')[1];
                console.log(lastPart.split('.')[1]);
                if ($scope.doc_type === "pdf") {
                    //                
                    $scope.isPDF = true;

                    angular.element(document.getElementById('page')).append($compile("<viewer></viewer>")($scope));
                    //                    $scope.$apply();
                    $scope.fileDownload().then(function (val) {
                        console.log(val);
                        $timeout(function () {
                            angular.element('#home_container').css('margin-top', '0px');
                            jQuery(function ($) {
                                if (typeof $.fn.annotator !== 'function') {
                                    alert(" Annotator concatenation file missing. ");
                                } else {

                                    $(document).ready(function () {
                                        webViewerLoad($scope.fileurl); //load pdf in the viewer;
                                        $scope.loadComments().then(function () {
                                            $('#viewerContainer').annotator().annotator('addPlugin', 'EYStorageAnnotator', {
                                                userAnnotaions: $scope.getUserAnnotaions(),
                                                saveMethod: saveAnnotaion
                                            });
                                            $('#viewerContainer').annotator().annotator("addPlugin", "Touch");
                                        });

                                    });

                                }
                            });
                            //                        Service.showLoader(false);
                        }, 300);


                    });
                } else {

                    $scope.isPDF = false;
                    angular.element(document.getElementById('panzoom')).append($compile("<iframe id='attach_iframe' allowtransparency='true' style='border: 0px;' src='{{urlContent}}'></iframe>")($scope))

                    $('iframe').load(function () {
                        Service.showLoader(false);
                    });
                }

            }
            $scope.loadComments = function () {
                angular.element('#docnote').val("Fetching Comments.....");
                Service.showLoader(true);
                var defer = $q.defer();
                var promises = [];
                $scope.comments = "";
                var commentUrl = $scope.Siteurl;
                if ($rootScope.online) {
                    Service.fetchComments($scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT).then(function (commentData) {
                        if (commentData) {
                            for (var i = 0; i < commentData.length; i++) {
                                if (commentData[i].SMDCFilePath.replace(/%20/g, " ").replace('&amp;wdSmallView', '') === commentUrl) {
                                    $scope.comments = commentData[i].SMDCComments;
                                }
                            }
                            promises.push($scope.comments);
                            console.log($scope.comments);
                            angular.element('#docnote').val($scope.comments);
                        } else {
                            if (typeof (cordova) != "undefined" && window.plugins) {
                                cordovaService.showCordovaAlert("No Network ");
                            } else {
                                console.log("No Network");

                            }
                            $scope.comments = $scope.agenda_arr[$scope.agendaIndex].AttachArray[$scope.docIndex].notes.text;
                            promises.push($scope.agenda_arr[$scope.agendaIndex].AttachArray[$scope.docIndex].notes.text);
                        }

                    });

                } else {
                    cordovaService.showCordovaAlert("No Network");
                }

                $q.all(promises).then(defer.resolve());

                return defer.promise;
            };
            $scope.openAttach = function (index) {
                Service.showLoader(true);
                $scope.comments = "";
                if ($scope.agenda_arr[$scope.agendaIndex] && $scope.agenda_arr[$scope.agendaIndex].AttachArray[index]) {
                    $scope.url = "https://share.ey.net" + $scope.agenda_arr[$scope.agendaIndex].AttachArray[index].ServerRelativeUrl;
                    $scope.docIndex = index;
                    $scope.showDoc = true;
                    //console.log($scope.url);
                    $scope.Siteurl = $scope.url;
                    $scope.urlContent = $sce.trustAsResourceUrl($scope.url);
                    if (typeof (cordova) != "undefined" && window.plugins) {

                        $scope.fileurl = $scope.filepath + $scope.url.substr($scope.url.lastIndexOf('/') + 1).replace(/ /g, '');
                        console.log($scope.fileurl);
                        //Check for the file.
                        //                    console.log(store + $scope.url.substr($scope.url.lastIndexOf('/') + 1));
                        window.resolveLocalFileSystemURL($scope.fileurl, function () {
                            $scope.url = $scope.fileurl;
                            console.log("sucess");
                            $scope.loadDocument($scope.fileurl, true);

                        }, function () {
                            console.log("couldnt find document");
                            if ($rootScope.online) {
                                $scope.loadDocument($scope.url, false);
                            } else {
                                Service.showLoader(false);
                                if (typeof (cordova) != "undefined" && window.plugins) {
                                    cordovaService.showCordovaAlert("No Network ");
                                } else {
                                    console.log("No Network");

                                }
                            }

                        });
                    } else {
                        $scope.loadDocument($scope.url, false);
                        //                              $(".loading").show();
                    }


                    $scope.attach_heading = $scope.agenda_arr[$scope.agendaIndex].AttachArray[index].FileName.split('.')[0];
                    //                angular.element('#docnote').val($scope.comments);

                    $timeout(function () {
                        $("#doc").addClass("doctab");
                        $("#panzoom").panzoom({
                            $zoomIn: $(".zoom-in"),
                            $zoomOut: $(".zoom-out"),
                            $zoomRange: $(".zoom-range"),
                            $reset: $(".reset")
                        });
                    }, 300);

                } else {
                    Service.showLoader(false);
                }
            };
            $scope.openDocument = function (url) {
                $scope.closeDoc();
                document.getElementById("downloadDropdown").classList.toggle("show");
                console.log(url);
                $scope.showDoc = true;
                $scope.urlContent = $sce.trustAsResourceUrl(url);
                var lastPart = url.substr(url.lastIndexOf('/') + 1);
                $scope.attach_heading = lastPart.split('.')[0];
                $scope.doc_type = lastPart.split('.')[1];
                console.log(lastPart.split('.')[1]);
                if ($scope.doc_type === "pdf") {
                    // 
                    Service.showLoader("true");
                    $scope.isPDF = true;

                    angular.element(document.getElementById('page')).append($compile("<viewer></viewer>")($scope));

                    $timeout(function () {
                        angular.element('#home_container').css('margin-top', '0px');
                        jQuery(function ($) {
                            if (typeof $.fn.annotator !== 'function') {
                                alert(" Annotator concatenation file missing. ");
                            } else {

                                $(document).ready(function () {
                                    webViewerLoad(url);


                                    $('#viewerContainer').annotator().annotator('addPlugin', 'EYStorageAnnotator', {
                                        userAnnotaions: $scope.getUserAnnotaions(),
                                        saveMethod: saveAnnotaion
                                    });
                                    $('#viewerContainer').annotator().annotator("addPlugin", "Touch");

                                });

                            }
                        });
                        //                        Service.showLoader(false);
                    }, 300);

                } else {

                    $scope.isPDF = false;
                    angular.element(document.getElementById('panzoom')).append($compile("<iframe id='attach_iframe' allowtransparency='true' style='border: 0px;' src='{{urlContent}}'></iframe>")($scope))
                    $timeout(function () {
                        //                        $("#doc").addClass("doctab");
                        $("#panzoom").panzoom({
                            $zoomIn: $(".zoom-in"),
                            $zoomOut: $(".zoom-out"),
                            $zoomRange: $(".zoom-range"),
                            $reset: $(".reset")
                        });
                    }, 300);

                    $('iframe').load(function () {
                        Service.showLoader(false);
                    });
                }


            };
            $scope.closeDoc = function () {
                Service.showLoader(false);
                $('iframe').height('auto');
                if ($scope.isPDF) {
                    OverlayManager.unregister("documentPropertiesOverlay");
                    OverlayManager.unregister("passwordOverlay");
                    angular.element(document.getElementById('page')).empty();
                    angular.element(document.getElementsByTagName('viewer')).empty();
                }

                angular.element(document.getElementById('panzoom')).empty();

                $scope.showDoc = false;
                $("#doc").removeClass("doctab");
            };
            $scope.closeNote = function () {

                $scope.rightVisible = false;
            };
            $scope.savenote = function () {

                $scope.agenda_arr[$scope.agendaIndex].AttachArray[$scope.docIndex].notes.text = angular.element('#docnote').val();
                if ($rootScope.online) {
                    Service.sharecomments($scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT, [], $scope.Siteurl, $scope.agenda_arr[$scope.agendaIndex].AttachArray[$scope.docIndex].notes.text, $scope.sessionId, false);

                } else {
                    dbService.saveOfflineNote($scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT, [], $scope.Siteurl, $scope.agenda_arr[$scope.agendaIndex].AttachArray[$scope.docIndex].notes.text, $scope.sessionId, false);
                    if (typeof (cordova) != "undefined" && window.plugins) {
                        cordovaService.showCordovaAlert("Note Saved");
                    } else {
                        console.log("Note saved");
                        //                              $(".loading").show();
                    }
                }
                // Service.showLoader(false);
                for (var i = 0; i < Service.meeting_obj.length; i++) {
                    if (Service.meeting_obj[i].SMLocatorOWSTEXT == $scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT) {
                        Service.meeting_obj.length[i] = $scope.meeting[$scope.meetingIndex];
                    }
                }
            };

            //            $scope.search = function () {
            //                var pattern = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
            //
            //                if ($scope.searchText != undefined) {
            //                    Service.showLoader(true);
            //                    $scope.searchArr = [];
            //                    for (var i = 0; i < Service.meeting_obj.length; i++) {
            //                        console.log(Service.meeting_obj[i]);
            //                        console.log(JSON.stringify(Service.meeting_obj[i]));
            //                        if (JSON.stringify(Service.meeting_obj[i]).toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1) {
            //                            $scope.searchArr.push(Service.meeting_obj[i]);
            //                        }
            //                        console.log($scope.searchArr);
            //                        Service.showLoader(false);
            //                    }
            //                }
            //
            //            };
            $scope.share = function () {
                console.log($scope.selected);
                var arr = [];
                var comments = "";
                angular.forEach($scope.Attendees[0].SMAttendees.results, function (item) {
                    if (item.Selected) {
                        arr.push(parseInt(item.Id));
                    }
                });
                console.log(arr);

                if ($scope.isPDf) {
                    comments = $scope.annotation;
                } else {
                    comments = angular.element('#docnote').val();
                }
                if ($rootScope.online) {
                    console.log(comments);
                    Service.sharecomments($scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT, arr, $scope.Siteurl, comments, $scope.sessionId, true);
                    $scope.showModal = false;
                    Service.pushNotification($scope.attach_heading, $scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT, $scope.sessionId, "Comments", "UnRead");
                } else {
                    dbService.saveOfflineNote($scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT, arr, $scope.Siteurl, comments, $scope.sessionId, true);
                }

                $scope.selected = {};
            };
            $scope.sendMail = function (index) {
                var link = 'mailto:' + $scope.participants[index].email + '?subject=Message from ' + '&body=';
                $window.location = link;
            };
            $scope.getData = function () {
                $rootScope.refresh = true;

                $state.go("dashBoard");

            };
            $rootScope.$on("documentClicked", _close);
            $rootScope.$on("escapePressed", _close);

            $scope.saveAnnotation = function (data) {

                console.log(data);
                Service.sharecomments($scope.meeting[$scope.meetingIndex].SMLocatorOWSTEXT, [], $scope.Siteurl, data, $scope.sessionId, false);
            };

            function saveAnnotaion(userAnnotation) {
                $scope.annotation = userAnnotation;
                console.log("Save Annotation called");

            }
            $scope.getUserAnnotaions = function () {
                return $scope.comments;
            }

            $scope.checkAll = function () {
                $scope.selectedAll = !$scope.selectedAll

                angular.forEach($scope.Attendees[0].SMAttendees.results, function (item) {
                    item.Selected = $scope.selectedAll;
                });

            };


            $scope.fileDownload = function (index) {
                $rootScope.downloadingCount = 0;
                $scope.maxPro = 100;
                if (typeof index !== 'undefined') {
                    $scope.url = "https://share.ey.net" + $scope.attachments[index].ServerRelativeUrl;

                }
                $scope.docContentType = $scope.getContentType($scope.url);
                console.log($scope.docContentType);
                console.log($scope.url);
                var defer = $q.defer();
                var fileTransfer = new FileTransfer();
                var uri = encodeURI($scope.url);
                var filename = $scope.url.substr($scope.url.lastIndexOf('/') + 1).replace(/ /g, '');
                console.log(filename);
                $("#ngProgress-container").remove();
                $rootScope.downloading = true;
                $rootScope.progressbar = ngProgressFactory.createInstance();
                $rootScope.showProgress = true;
                $rootScope.progressText = "Downloading File";
                $rootScope.progressbar.start();

                //                var filePath = cordova.file.cacheDirectory;
                //                console.log(filePath);

                fileTransfer.download(
                    uri,
                    $scope.filepath + filename,
                    function (entry) {
                        console.log(entry);
                        defer.resolve("Success");
                        //                         $scope.getOfflineDocInfo();
                        $scope.getOfflineDocInfo();
                        var att = $scope.attachments;
                        $scope.attachments = [];
                        $timeout(function () {

                            console.log($scope.attachments);
                            $rootScope.downloading = false;
                            $rootScope.showProgress = false;
                            $scope.attachments = att;
                        }, 300);


                        if (typeof (cordova) != "undefined" && window.plugins) {
                            $rootScope.progressbar.complete();
                            cordovaService.showCordovaAlert("Download complete ");
                        } else {
                            console.log("Download complete: " + entry.fullPath);

                        }

                    },
                    function (error) {
                        $rootScope.downloading = false;
                        $rootScope.showProgress = false;
                        $scope.stopLoader();
                        var att = $scope.attachments;
                        $scope.attachments = [];
                        $timeout(function () {

                            console.log($scope.attachments);
                            $rootScope.downloading = false;
                            $rootScope.showProgress = false;
                            $scope.attachments = att;
                        }, 300);
                        defer.resolve("error");
                        if (typeof (cordova) != "undefined" && window.plugins) {
                            //                            $scope.hideDownload = !$scope.hideDownload;
                            cordovaService.showCordovaAlert("Download error ");
                        } else {
                            console.log("Download error: " + entry.fullPath);

                        }
                        console.log("download error source " + error.source);
                        console.log("download error target " + error.target);
                        console.log("upload error code" + error.code);
                    },
                    true, {
                        headers: {
                            "Content-type": $scope.docContentType
                        }
                    }
                );
                return defer.promise;
            };

            $scope.getDoctype = function (type) {
                var ret_type = "";
                type = type.split('.')[1];
                if (type === "pdf") {
                    ret_type = "images/pdf.png";
                } else if (type === "pptx" || type === "ppt") {
                    ret_type = "images/pptx.png";
                } else if (type === "doc" || type === "docx") {
                    ret_type = "images/word.png";
                } else if (type === "xls" || type === "xlsm" || type === "xlsx") {
                    ret_type = "images/xls.png";
                }
                return ret_type;
            };
            $scope.isNull = function (str) {
                var ret = true;
                if (!str || str === "" || str === "null") {
                    ret = false;
                }
                return ret;
            };
            $scope.isDownloaded = function (index) {
                //                 $scope.currentPro = 0;
                var attachurl = "https://share.ey.net" + $scope.attachments[index].ServerRelativeUrl;
                var filepath;
                var retVal = false;

                angular.forEach($scope.fileEntry, function (item, index) {
                    if (item.name === attachurl.substr(attachurl.lastIndexOf('/') + 1).replace(/ /g, '')) {
                        retVal = true;
                    }

                });
                return retVal;

            };

            $scope.myfunction = function () {
                dbService.getDocTitle().then(function (result) {
                    console.log(result);
                    angular.forEach(result, function (item, index) {
                        angular.forEach($scope.fileEntry, function (innerItem, innerIndex) {
                            if (item.title.replace(/ /g, '') === innerItem.name) {
                                //                                $scope.fileEntry[innerIndex]
                                $scope.fileEntry[innerIndex].meetingName = item.meetingName;
                                console.log("Success");
                            }
                        })
                    })
                });
                document.getElementById("downloadDropdown").classList.toggle("show");
            };

            function _close() {
                $scope.$apply(function () {
                    $scope.close();

                });
            }
                }]);
