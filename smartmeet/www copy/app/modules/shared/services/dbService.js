angular.module('smartmeetApp')
    .service('dbService', function ($q, $timeout, $rootScope, APIServiceFactory, ENV, Service, cordovaService) {
        var setUp = "";
        var db;
        this.init = function () {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
            var deferred = $q.defer();

            if (setUp) {
                deferred.resolve(true);
                return deferred.promise;
            }

            var openRequest = indexedDB.open("SmartMeet", 2);

            openRequest.onerror = function (e) {
                //console.log("Error opening db");
                //console.dir(e);
                deferred.reject(e.toString());
            };

            openRequest.onupgradeneeded = function (e) {

                var thisDb = e.target.result;
                var objectStore;

                //Create Meetings
                if (!thisDb.objectStoreNames.contains("Meetings")) {
                    objectStore = thisDb.createObjectStore("Meetings", {
                        autoIncrement: true
                    });
                    objectStore.createIndex("SMNameOWSTEXT", "SMNameOWSTEXT", {
                        unique: false
                    });
                }
                if (!thisDb.objectStoreNames.contains("OfflineNotes")) {
                    objectStore = thisDb.createObjectStore("OfflineNotes", {
                        autoIncrement: true
                    });
                }
                if (!thisDb.objectStoreNames.contains("NoteTitle")) {
                    objectStore = thisDb.createObjectStore("NoteTitle", {
                        autoIncrement: true
                    });
                }

            };
            openRequest.onsuccess = function (e) {
                db = e.target.result;
                db.onerror = function (event) {
                    // Generic error handler for all errors targeted at this database's
                    // requests!
                    deferred.reject("Database error: " + event.target.errorCode);
                };
                setUp = true;
                deferred.resolve(true);
            };
            return deferred.promise;
        };
        this.addMeeting = function (data) {
            var defer = $q.defer();
            var promises = [];
            console.log(data);
            var objectStore = db.transaction("Meetings", "readwrite").objectStore("Meetings");
            var req = objectStore.clear();
            req.onsuccess = function (e) {
                //console.log("Data Cleared");
            };
            req.onerror = function (e) {
                //console.log("Data No cleared. Error" + e);
            };
            $.each(data, function (key, value) {
                var request = objectStore.add(JSON.stringify(data[key]), data[key].SMLocatorOWSTEXT);
                request.onsuccess = function (event) {
                    //console.log("Data Insertion success");
                    promises.push(request);
                };
                request.onerror = function (e) {
                    Service.showLoader(false);
                    cordovaService.showCordovaAlert("Error in adding Meetings to database");
                    //console.log(e);
                };
            });
            $q.all(promises).then(defer.resolve());
            return defer.promise;
        };
        this.addMeetingById = function (data) {
            var defer = $q.defer();
            var promises = [];
            console.log(data);
            var objectStore = db.transaction("Meetings", "readwrite").objectStore("Meetings");
            $.each(data, function (key, value) {
                var request = objectStore.add(JSON.stringify(data[key]), data[key].SMLocatorOWSTEXT);
                request.onsuccess = function (event) {
                    //console.log("Data Insertion success");
                    promises.push(request);
                };
                request.onerror = function (e) {
                    Service.showLoader(false);
                    cordovaService.showCordovaAlert("Error in adding meeting to database");
                    //console.log(e);
                };
            });
            $q.all(promises).then(defer.resolve());
            return defer.promise;
        };
        this.getMeetingData = function () {
            var defer = $q.defer();
            var returnData = [];
            var self = this;
            self.init().then(function () {
                var objectStore = db.transaction("Meetings", "readwrite").objectStore("Meetings");
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = objectStore.openCursor(keyRange);
                cursorRequest.onsuccess = function (e) {
                    var result = e.target.result;
                    if (!!result === false) {
                        defer.resolve(returnData);
                        return
                    }
                    returnData.push(JSON.parse(result.value));
                    result.continue();
                };
            });
            return defer.promise
        };
        this.saveOfflineNote = function (meetingId, atendeeList, docUrl, comments, sessionId, isShared) {
            //console.log(data);
            var offlineNote = {
                "meetingId": meetingId,
                "atendeeList": atendeeList,
                "docUrl": docUrl,
                "comments": comments,
                "sessionId": sessionId,
                "isShared": isShared
            };
            console.log(offlineNote);
            var objectStore = db.transaction("OfflineNotes", "readwrite").objectStore("OfflineNotes");
            //            var req = objectStore.clear();
            var request = objectStore.add(JSON.stringify(offlineNote), meetingId);
            request.onsuccess = function (event) {
                console.log("Success");
            }
            request.onerror = function (e) {
                Service.showLoader(false);
                cordovaService.showCordovaAlert("Error saving notes offline");
                //console.log(e);
            }
        };
        this.clearOfflineNote = function (meetingId) {
            var objectStore = db.transaction("OfflineNotes", "readwrite").objectStore("OfflineNotes");
            var req = objectStore.delete(meetingId);
        };
        this.getOfflineNote = function () {
            var defer = $q.defer();
            var returnData = [];
            var self = this;
            self.init().then(function () { //remove this before build
                var objectStore = db.transaction("OfflineNotes", "readwrite").objectStore("OfflineNotes");
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = objectStore.openCursor(keyRange);
                cursorRequest.onsuccess = function (e) {
                    var result = e.target.result;
                    if (!!result === false) {
                        defer.resolve(returnData);
                        return
                    }
                    returnData.push(JSON.parse(result.value));
                    result.continue();
                };
            });
            return defer.promise
        };
        this.addDocTitle = function (Meetingname, item) {

            var note = {
                "meetingName": Meetingname,
                "title": item.FileName
            };
            console.log(note);
            var objectStore = db.transaction("NoteTitle", "readwrite").objectStore("NoteTitle");
            var request = objectStore.add(JSON.stringify(note));
            request.onsuccess = function (event) {
                console.log("Success");
            }
            request.onerror = function (e) {
                Service.showLoader(false);
                cordovaService.showCordovaAlert("Error in adding Document title to database");
                //console.log(e);
            }
        };
        this.getDocTitle = function () {
            var defer = $q.defer();
            var returnData = [];
            var self = this;
            self.init().then(function () {
                var objectStore = db.transaction("NoteTitle", "readwrite").objectStore("NoteTitle");
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = objectStore.openCursor(keyRange);
                cursorRequest.onsuccess = function (e) {
                    var result = e.target.result;
                    if (!!result === false) {
                        defer.resolve(returnData);
                        return
                    }
                    returnData.push(JSON.parse(result.value));
                    result.continue();
                };
            });
            return defer.promise
        };

    });
