angular.module('smartmeetApp')
    .service('Service', function(ENV, $http, $q,cordovaService) {
        this.meeting_obj = [];
        this.username = "";
        this.accountname = "";
        this.userId = "";
        this.notificatonData=[];
        this.alertText="";
        this.sharedCommentCount=0;
        this.attendeeListLength=0;
        this.iscommentsShared=false;
        this.showLoader = function(IsOn) {
            if (IsOn) {
                                			if(typeof(cordova) != "undefined" && window.plugins){
                                                window.plugins.spinnerDialog.show("","",true);
                                                $(".loading").hide();
                                			}else{
                                				$(".loading").show();
                                			}
            } else {
                                			if(typeof(cordova) != "undefined" && window.plugins){
                                                    window.plugins.spinnerDialog.hide();
                                                $(".loading").hide();
                                			}else{
                                				$(".loading").hide();
                                			}
            }
        };

        this.getMeetingData = function() {
            var self = this;
            var queryText = "";
            console.log(localStorage.getItem('accountname'));
            queryText = "(SMOrganiserOWSUSER:" + this.accountname + " OR SMAttendeesOWSUSER:" + this.accountname + ")";
            var sortOrder = "&sortlist='Created:descending'";
            var searchUrl = "https://share.ey.net" + "/_api/search/query?querytext='" + queryText + "'" + "&sortlist='Created:descending'&selectproperties='SMNameOWSTEXT,SMDescriptionOWSMTXT,SMOrganiserOWSUSER,SMAttendeesOWSUSER,SMStartDateOWSDATE,SMEnddateOWSDATE,SMExpirationDateOWSDATE,SMOrganiserOWSUSER,SMIsExpiredOWSCHCS,SMIsPublishedOWSCHCS,SMSeldatesOWSMTXT,SMLocatorOWSTEXT,AuthorOWSUSER'";
            console.log(searchUrl);
            return $http({
                url: searchUrl,
                method: "GET",
                headers: {
                    'Accept': 'application/JSON; ODATA=verbose'
                }
            }).then(function(response) {
                console.log(response.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results);
                return response.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
            }, function(error) {
                return null;
            })
        };

        this.getMeetingItems = function(meetingID) {
            var deferred = $q.defer();
            var config = {
                headers: {
                    'Accept': 'application/json;odata=verbose'
                }
            };
            //            var url = "https://share.ey.net/sites/SMARTMeet/" + meetingID + "/_api/web/lists/GetByTitle('Agenda')/items?$select=Id,SMAStartDate,SMStartTime,SMEndTime,SMAVenue,SMAType,Created,Modified,SMAEndDate,SMASession,SMASessionDescription,SMAChair,SMAChair/Title,SMAChair/Id,SMAChair/Name,SMAChair/SipAddress,SMAAttendees/Title,SMAAttendees/Id,SMAAttendees/Name,SMAAttendees/SipAddress,Attachments,AttachmentFiles&$expand=SMAChair,SMAAttendees,AttachmentFiles";
            var url = "https://share.ey.net/sites/SMARTMeet/" + meetingID + "/_api/web/lists/GetByTitle('Agenda')/items?$select=Id,SMAStartDate,SMAVenue,SMAType,Created,Modified,SMAEndDate,SMASession,SMASessionDescription,SMAChair,SMAChair/Title,SMAChair/Id,SMAChair/Name,SMAChair/SipAddress,SMAAttendees/Title,SMAAttendees/Id,SMAAttendees/Name,SMAAttendees/SipAddress,Attachments,AttachmentFiles&$expand=SMAChair,SMAAttendees,AttachmentFiles"
            $http.get(url, config).success(function(response) {

                console.log(response);
                deferred.resolve(response.d.results);
                //                return jsonObj;
            }).error(function(msg, code) {
                deferred.resolve(null);
                //                return error;
            });
            return deferred.promise;
        };
        this.getAttachments = function(meetingId, AgendaId) {
            var url = "https://share.ey.net/sites/SMARTMeet/" + meetingId + "/_api/web/lists/GetByTitle('Agenda')/items(" + AgendaId + ")/AttachmentFiles";
            return $http({
                url: url,
                method: "GET",
                headers: {
                    'Accept': 'application/JSON; ODATA=verbose'
                }
            }).then(function(response) {
                console.log(response.data.d.results);
                return response.data.d.results;
            }, function(error) {
                return null;
            })

        };
        this.fetchComments = function(meetingId) {
            console.log(meetingId);
            var url = "https://share.ey.net/sites/SMARTMeet/" + meetingId + "/_api/web/lists/GetByTitle('DocumentComments')/Items??$filter=(SMDCommentedById%20eq%2021)";
            return $http({
                url: url,
                method: "GET",
                headers: {
                    'Accept': 'application/JSON; ODATA=verbose'
                }
            }).then(function(response) {
                console.log(response.data.d.results);
                return response.data.d.results;
            }, function(error) {
                return null;
            })
        };
        this.getUserDetails = function() {
            var url = "https://share.ey.net/sites/SMARTMeet/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
            return $http({
                url: url,
                method: "GET",
                headers: {
                    'Accept': 'application/JSON; ODATA=verbose'
                }
            }).then(function(response) {
                console.log(response);
                return response.data.d;
            }, function(error) {
                return null;
            })
        };
        this.getAttendees = function(meetingId) {
            var defer = $q.defer();
            var config = {
                headers: {
                    'Accept': 'application/json;odata=verbose'
                }
            };
            var url = "https://share.ey.net/sites/SMARTMeet/" + meetingId + "/_api/web/lists/GetByTitle('Meeting')/Items?$select=Id,SMAttendees/Title,SMAttendees/Name,SMAttendees/Id&$expand=SMAttendees";
            $http.get(url, config).success(function(response) {

                console.log(response);
                defer.resolve(response.d.results);
                //                return jsonObj;
            }).error(function(msg, code) {
                defer.resolve(null);
                //                return error;
            });
            return defer.promise;
        };


        this.sharecomments = function(meetingId, attendeeList, sessiondocurl, comments, sessionId, shouldShare) {
            var self = this;
            self.sharedCommentCount=0;
            self.attendeeListLength=attendeeList.length;
            self.iscommentsShared=false;
            self.showLoader(true);
            var requestUrl = "https://share.ey.net/sites/SMARTMeet/" + meetingId + "/_vti_bin/listdata.svc/DocumentComments?$filter=(SMDCommentedById eq " + self.userId + ")";
            console.log(requestUrl);
            var userFound = false;
            var CourseUserId;
            var config = {
                headers: {
                    'Accept': 'application/json;odata=verbose'
                },
                async: false
            };
            $http.get(requestUrl, config).success(function(result) {
                if(attendeeList.length){
                    self.iscommentsShared=true;
                    self.alertText="Your comments have been shared";
                    angular.forEach(attendeeList,function(item,index){
                        self.sharedCommentCount++;
                console.log(item);
                      var arr=[];
                        arr.push(item);
                        console.log(arr);
                    angular.forEach(result.d.results, function(item, index) {
                      
                    if (sessiondocurl == item.SMDCFilePath.replace('&amp;wdSmallView','')) {
                        var itemid = item.Id;
                        userFound = true;
                        var dataItem = {
                            __metadata: {
                                'type': 'SP.Data.DocumentCommentsListItem'
                            },
                            SMDCComments: comments.toString(),
                            SMASession: sessionId.toString(),
                            SMDCFilePath: sessiondocurl.toString(),
                            SMDCShare: shouldShare,
                            SMDCommentedById: self.userId,
                            SMDCToEmailId: {
                                'results': arr
                            }

                        };

                        self.updateItem(itemid, dataItem, meetingId)
                    }
                });
               
                
                if (!userFound) {
                        console.log(arr);
                    var dataItem = {
                        __metadata: {
                            'type': 'SP.Data.DocumentCommentsListItem'
                        },
                        SMDCComments: comments.toString(),
                        SMASession: sessionId.toString(),
                        SMDCFilePath: sessiondocurl.toString(),
                        SMDCShare: shouldShare,
                        SMDCommentedById: self.userId,
                        SMDCToEmailId: {
                            'results': arr
                        }

                    };
                    //                                               

                    console.log(dataItem);
                    self.addNewItem(dataItem, meetingId)
                    // });
                   
                }
            });

                }else{
                     self.alertText="Comments Saved";
                     angular.forEach(result.d.results, function(item, index) {
                      
                    if (sessiondocurl == item.SMDCFilePath.replace('&amp;wdSmallView','')) {
                        var itemid = item.Id;
                        userFound = true;
                        var dataItem = {
                            __metadata: {
                                'type': 'SP.Data.DocumentCommentsListItem'
                            },
                            SMDCComments: comments.toString(),
                            SMASession: sessionId.toString(),
                            SMDCFilePath: sessiondocurl.toString(),
                            SMDCShare: shouldShare,
                            SMDCommentedById: self.userId,
                            SMDCToEmailId: {
                                'results': []
                            }

                        };

                        self.updateItem(itemid, dataItem, meetingId)
                    }
                });
               
                
                if (!userFound) {
                    var dataItem = {
                        __metadata: {
                            'type': 'SP.Data.DocumentCommentsListItem'
                        },
                        SMDCComments: comments.toString(),
                        SMASession: sessionId.toString(),
                        SMDCFilePath: sessiondocurl.toString(),
                        SMDCShare: shouldShare,
                        SMDCommentedById: self.userId,
                        SMDCToEmailId: {
                            'results': []
                        }

                    };
                    self.addNewItem(dataItem, meetingId)
                    // });
                   
                }

                }
             

            }).error(function() {
                self.showLoader(false);
                console.log('Item retrieval failed');
            })

        };
        //
        //        this.getSPFormDigestValue = function() {
        //            var url = "https://share.ey.net/sites/SMARTMeet/SitePages/testPage.aspx";
        //            var deferred = $q.defer();
        //
        //
        //            var config = {
        //                headers: {
        //                    "Accept": "application/json; odata=verbose"
        //                }
        //            };
        //            $http.get(url, config).success(function(data) {
        //                console.log(data);
        //                deferred.resolve($(data).find("#__REQUESTDIGEST").val());
        //            }).error(function(data) {
        //                deferred.reject(JSON.stringify(data));
        //            })
        //            return deferred.promise;
        //        };


        this.getSPFormDigestValue = function() {
            var url = "https://share.ey.net/sites/SMARTMeet/_api/contextinfo";
            var deferred = $q.defer();

            var data = [];
            var config = {
                headers: {
                    "accept":   "application/json; odata=verbose",
                     
                    "content-type": "application/json;odata=verbose"
                }
            };
            $http.post(url, data, config).success(function(data) {
                console.log(data.d.GetContextWebInformation.FormDigestValue);
                deferred.resolve(data.d.GetContextWebInformation.FormDigestValue);
            }).error(function(data) {
                deferred.reject("no token");
            })
            return deferred.promise;
        };

        this.updateItem = function(itemid, dataItem, meetingId) {
            var self = this;
            //            self.showLoader(true);
            var url = "https://share.ey.net/sites/SMARTMeet/" + meetingId + "/_api/web/lists/GetByTitle('DocumentComments')/Items(" + itemid + ")"
            var data = JSON.stringify(dataItem);


            self.getSPFormDigestValue().then(function(token) {
                console.log(token);

                var tokenString = token.toString();
                var config = {
                    headers: {

                        "Accept": "application/json;odata=verbose",

                        "X-HTTP-Method": "MERGE",

                        "If-Match": "*",
                        "content-Type": "application/json;odata=verbose",
                        "X-RequestDigest": tokenString,
                        "withCredentials": true,

                    }
                };
                $http.post(url, data, config).success(function(result) {
                    self.showLoader(false);
                    if(self.iscommentsShared){
                        if(self.sharedCommentCount === self.attendeeListLength){
                                                      self.sharedCommentCount=0;
                            if (typeof(cordova) != "undefined" && window.plugins) {

                                    cordovaService.showCordovaAlert(self.alertText);
                                } else {
                                    console.log(self.alertText);
                                    //                              $(".loading").show();
                                }
                        }

                    }else{
                        if (typeof(cordova) != "undefined" && window.plugins) {

                                cordovaService.showCordovaAlert(self.alertText);
                            } else {
                                console.log(self.alertText);
                                //                              $(".loading").show();
                            }
                    }
                    
                    console.log(result);
                }).error(function(error) {
                    console.log("error occured");
                    console.log(JSON.stringify(error));
                    self.showLoader(false);

                    if (typeof(cordova) != "undefined" && window.plugins) {
                    cordovaService.showCordovaAlert("Error occured while Saving. Please try again later");
                } else {
                    console.log("Note not saved");
                    //                              $(".loading").show();
                }
                })

            });



        };

        this.getNotifications = function() {
            if(!this.userId || this.userId===""){
            this.userId=localStorage.getItem("userid");
            }
            var defer = $q.defer();
            var self = this;
            var url = " https://share.ey.net/sites/SMARTMeet/_api/web/lists/getbytitle('NotificationCenter')/items?$filter=SMNotificationUserId eq '" + this.userId + "'";
            console.log(url);
            var config = {
                headers: {
                    'Accept': 'application/JSON; ODATA=verbose'
                }
            };
            $http.get(url, config).success(function(response) {
                defer.resolve(response.d.results);
            }).error(function() {
                defer.resolve(null)
            })
            return defer.promise;
        };
        this.addNewItem = function(dataItem, meetingId) {
            var self = this;
            //            self.showLoader(true);
            var url = "https://share.ey.net/sites/SMARTMeet/" + meetingId + "/_api/web/lists/GetByTitle('DocumentComments')/Items";
            self.getSPFormDigestValue().then(function(token) {
                console.log(token);
                var data = JSON.stringify(dataItem);
                var tokenString = token.toString();
                var config = {
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-Type": "application/json;odata=verbose",
                        "X-RequestDigest": tokenString,
                        "withCredentials": true,
                    }
                };
                $http.post(url, data, config).success(function(result) {
                    console.log(result);
                    self.showLoader(false);
                    if(self.iscommentsShared){
                                                      self.sharedCommentCount=0;
                        if(self.sharedCommentCount === self.attendeeListLength){
                            if (typeof(cordova) != "undefined" && window.plugins) {

                                    cordovaService.showCordovaAlert(self.alertText);
                                } else {
                                    console.log(self.alertText);
                                    //                              $(".loading").show();
                                }
                        }

                    }else{
                        if (typeof(cordova) != "undefined" && window.plugins) {

                                cordovaService.showCordovaAlert(self.alertText);
                            } else {
                                console.log(self.alertText);
                                //                              $(".loading").show();
                            }
                    }
                    
                }).error(function(error) {
                    console.log("error occured");
                    self.showLoader(false);
                    if(self.iscommentsShared){
                                                      self.sharedCommentCount=0;
                        if(self.sharedCommentCount === self.attendeeListLength){
                            if (typeof(cordova) != "undefined" && window.plugins) {

                                    cordovaService.showCordovaAlert("Error occured. Please try again later");
                                } else {
                                    console.log("Error occured. Please try again later");
                                    //                              $(".loading").show();
                                }
                        }

                    }else{
                        if (typeof(cordova) != "undefined" && window.plugins) {

                                cordovaService.showCordovaAlert("Error occured. Please try again later");
                            } else {
                                console.log("Error occured. Please try again later");
                                //                              $(".loading").show();
                            }
                    }
                })

            });
            //     var url="https://share.ey.net/sites/SMARTMeet/1456112390659/_api/web/lists/GetByTitle('DocumentComments')/Items?$select=Id,Author/Title,Author/Id&$expand=Author&$filter=Author/Id%20eq%20%2722%27";

        };
        this.pushNotification = function(docTitle, meetingId, sessionId, notificationType, notificationStatus) {
            var notification_metadata = {
                __metadata: {
                    'type': 'SP.Data.NotificationCenterListItem'
                },
                "Title": docTitle.toString(),
                "SMLocator": meetingId.toString(),
                "SMNotificationParentID": sessionId.toString(),
                "SMNotificationType": notificationType.toString(),
                "SMNotificationOn": docTitle.toString(),
                "SMNotificationStatus": notificationStatus.toString(),
                "SMNotificationUserId": this.userId.toString(),
                "SMNotificationUserTitle": this.username.toString()
            };
            var self = this;
            //            self.showLoader(true);
            var url = "https://share.ey.net/sites/SMARTMeet/_api/web/lists/GetByTitle('NotificationCenter')/Items";
            self.getSPFormDigestValue().then(function(token) {
                console.log(token);
                var data = JSON.stringify(notification_metadata);
                var tokenString = token.toString();
                var config = {
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-Type": "application/json;odata=verbose",
                        "X-RequestDigest": tokenString,
                        "withCredentials": true,
                    }
                };
                $http.post(url, data, config).success(function(result) {
                    console.log(result);
                    self.showLoader(false);
                }).error(function(error) {
                    console.log("error occured");
                    self.showLoader(false);
                    console.log(JSON.stringify(error));
                })

            });

        };
    this.deleteNotification=function(itemId){
     var deferred = $q.defer();
        var notification_metadata = {};
            var self = this;
            //            self.showLoader(true);
            var url = "https://share.ey.net/sites/SMARTMeet/_api/web/lists/getbytitle('NotificationCenter')/items(" + itemId + ")";
            self.getSPFormDigestValue().then(function(token) {
                console.log(token);
//                var data = JSON.stringify(notification_metadata);
                var tokenString = token.toString();
                var config = {
                    headers: {
                                    "Accept": "application/json;odata=verbose",
                                    "X-Http-Method": "DELETE",
                                    "X-RequestDigest": tokenString,
                                    "If-Match": "*",
                                    "withCredentials": true,
                    }
                };
                $http.post(url, notification_metadata, config).success(function(result) {
                    console.log(result);
                    deferred.resolve("Success");
                    self.showLoader(false);
                }).error(function(error) {
                    console.log("error occured");
                    deferred.resolve("Error");
                    self.showLoader(false);
                    console.log(JSON.stringify(error));
                })

            });
        return deferred.promise;
    };

    });