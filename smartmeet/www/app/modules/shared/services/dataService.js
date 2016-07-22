angular.module('smartmeetApp')
    .service('dataService', function ($q, $timeout, $rootScope, APIServiceFactory, ENV, Service, ngProgressFactory) {
        this.MeetinArray = [];
        this.current_meeting_data = [];
        this.future_meeting_data = [];
        this.past_meeting_data = [];
        var arrCount = 0;
        this.agendaCount = 0;
        var agendaPromise = [];
        var agendadeferred = $q.defer();
        var attendeesList = [];
        this.refresh = function () {
            agendadeferred = $q.defer();
        };
        this.getSortedArray = function (value) {
            this.main_arr = Service.meeting_obj;
            var deferred = $q.defer();
            this.active_array = [];
            this.flag = 1;
            for (var i = 0; i < this.main_arr.length; i++) {
                if (this.main_arr[i].ArrayStatus == value) {
                    this.active_array.push(this.main_arr[i]);
                    deferred.resolve();
                } else {
                    this.flag = 0;
                    deferred.resolve();
                }
            }
            return deferred.promise;
        };
        this.pushMeetingData = function (res) {
            arrCount = 0;
            var dummycount = 0;
            var deferred = $q.defer();
            var promises = [];
            var mainArr = [];
            var y = 0;
            for (var i = 0; i < res.length; i++) {
                console.log(res[i]);
                //                console.log(JSON.stringify(res[i]));

                dummycount++;
                var jsonARR = {};
                var arrObj = {};
                arrObj[res[i].Cells.results[0].Key] = res[i].Cells.results[0].Value;
                arrObj[res[i].Cells.results[1].Key] = res[i].Cells.results[1].Value;
                arrObj[res[i].Cells.results[2].Key] = res[i].Cells.results[2].Value;
                arrObj[res[i].Cells.results[3].Key] = res[i].Cells.results[3].Value;
                arrObj[res[i].Cells.results[4].Key] = res[i].Cells.results[4].Value;
                arrObj[res[i].Cells.results[5].Key] = res[i].Cells.results[5].Value;
                arrObj[res[i].Cells.results[6].Key] = res[i].Cells.results[6].Value;
                arrObj[res[i].Cells.results[7].Key] = res[i].Cells.results[7].Value;
                arrObj[res[i].Cells.results[8].Key] = res[i].Cells.results[8].Value;
                arrObj[res[i].Cells.results[9].Key] = res[i].Cells.results[9].Value;
                arrObj[res[i].Cells.results[10].Key] = res[i].Cells.results[10].Value;
                arrObj[res[i].Cells.results[11].Key] = res[i].Cells.results[11].Value;
                arrObj[res[i].Cells.results[12].Key] = res[i].Cells.results[12].Value;
                arrObj[res[i].Cells.results[13].Key] = res[i].Cells.results[13].Value;
                arrObj[res[i].Cells.results[14].Key] = res[i].Cells.results[14].Value;
                arrObj[res[i].Cells.results[15].Key] = res[i].Cells.results[15].Value;
                arrObj[res[i].Cells.results[16].Key] = res[i].Cells.results[16].Value;
                if (arrObj["SMIsExpiredOWSCHCS"] == "No") {
                    mainArr.push(arrObj);

                    var date = new Date().setHours(0, 0, 0, 0).valueOf();
                    var startDate = new Date(mainArr[y].SMStartDateOWSDATE).setHours(0, 0, 0, 0).valueOf();
                    //console.log(startDate);
                    var endDate = new Date(mainArr[y].SMEnddateOWSDATE).setHours(0, 0, 0, 0).valueOf();
                    //console.log(endDate);
                    //console.log(date);
                    if (date >= startDate && date <= endDate) {
                        mainArr[y].ArrayStatus = "current";
                        ////console.log("current");
                    } else if (startDate > date) {
                        ////console.log("Future");
                        mainArr[y].ArrayStatus = "future";
                    } else if (startDate < date && endDate < date) {
                        mainArr[y].ArrayStatus = "past";
                        ////console.log("Past");
                    }
                    y++;
                    promises.push(mainArr);

                    console.log(dummycount);
                }


            }
            $q.all(promises).then(deferred.resolve(mainArr));

            return deferred.promise;
        };

        this.pushAgenda = function (res) {

            var self = this;
            var mainArr = res;
            var len = mainArr.length;
            //console.log(len);
            var meetingID = mainArr[arrCount].SMLocatorOWSTEXT;
            var MeetCount = arrCount + 1;

            Service.getMeetingItems(meetingID).then(function (result) {
                //console.log(result);
                if (result) {
                    for (var j = 0; j < result.length; j++) {
                        var agenda_arr = {};
                        agenda_arr = {
                            "ID": result[j].ID,
                            "Modified": result[j].Modified,
                            "SMAAttendeesId": result[j].SMAAttendeesId,
                            "SMAEndDate": result[j].SMAEndDate.split("T")[0],
                            "SMASession": result[j].SMASession,
                            "SMAChairName": result[j].SMAChair.Title,
                            "SMAChairEmail": result[j].SMAChair.SipAddress,
                            "SMAAttendees": result[j].SMAAttendees,
                            "SMStartTime": result[j].SMAStartDate,
                            "SMEndTime": result[j].SMAEndDate,
                            "SMAVenue": result[j].SMAVenue,
                            "SMAType": result[j].SMAType,
                            "SMASessionDescription": result[j].SMASessionDescription,
                            "Attachments": result[j].Attachments,
                            "Created": result[j].Created,
                            "SMAStartDate": result[j].SMAStartDate.split("T")[0],
                            "SMADiscussionPoints": "",
                            "AttachArray": []
                        };
                        attendeesList.push(agenda_arr.SMAAttendees);
                        //                        console.log(attendeesList);
                        for (var y = 0; y < mainArr[arrCount].Days.length; y++) {
                            if (agenda_arr.SMAStartDate === mainArr[arrCount].Days[y].date.replace(/ /g, '')) {
                                mainArr[arrCount].Days[y].agenda.push(agenda_arr);
                            }
                        }

                    }


                }
                Service.getAttendees(meetingID).then(function (data) {
                    mainArr[arrCount].SMAAttendeesList = data;
                    attendeesList = [];
                    console.log(mainArr);
                    arrCount++;
                    if (arrCount < len) {
                        self.pushAgenda(mainArr);
                    } else {
                        agendadeferred.resolve(mainArr);

                    }

                });

            });
            return agendadeferred.promise;


        };
        this.pushDateArray = function (data) {
            var deferred = $q.defer();
            var promises = [];
            var mainArr = data;
            var k = 0;
            for (var i = 0; i < mainArr.length; i++) {
                var date_arr = [];
                if (mainArr[i].SMSeldatesOWSMTXT) {
                    var dates = mainArr[i].SMSeldatesOWSMTXT.split('&')[1].split('|');
                    ////console.log(dates);
                    for (var l = 0; l < dates.length; l++) {
                        if (dates[l].split(';')[2]) {
                            date_arr.push({
                                "date": dates[l].split(";")[0].split('T')[0],
                                "startTime": dates[l].split(";")[0],
                                "endTime": dates[l].split(";")[1],
                                "agenda": []
                            });
                        } else {
                            date_arr.push({
                                "date": dates[l].split(";")[0].split('T')[0],
                                "startTime": dates[l].split(";")[0],
                                "endTime": dates[l].split(";")[1],
                                "agenda": []
                            });
                        }
                    }
                }

                mainArr[k++].Days = date_arr;
                promises.push(mainArr);
                // deferred.resolve(mainArr);       
            }
            console.log(mainArr);
            $q.all(promises).then(deferred.resolve(mainArr));
            return deferred.promise;
        };
        this.setAttendees = function (data) {
            //        console.log(data);
            var deferred = $q.defer();
            var promises = [];
            for (var i = 0; i < data.length; i++) {
                for (var y = 0; y < data[i].Days; y++) {
                    for (var z = 0; z < data[i].Days[y].agenda; z++) {
                        console.log(data[i].Days[y].agenda[z]);
                        promises.push(data);
                    }
                }
            }
            $q.all(promises).then(deferred.resolve(data));
            return deferred.promise;
        };
        this.getDashMeetingData = function (resultDat) {
            this.main_arr = resultDat;
            var deferred = $q.defer();
            var promises = [];
            this.active_array = [];
            this.current_meeting_data = [];
            this.future_meeting_data = [];
            this.past_meeting_data = []
            this.flag = 1;
            for (var i = 0; i < this.main_arr.length; i++) {
                if (this.main_arr[i].ArrayStatus == "current") {
                    this.current_meeting_data.push(this.main_arr[i]);
                    promises.push(this.current_meeting_data);
                } else if (this.main_arr[i].ArrayStatus == "future") {
                    this.future_meeting_data.push(this.main_arr[i]);
                    this.flag = 0;
                    promises.push(this.future_meeting_data);
                } else {
                    this.past_meeting_data.push(this.main_arr[i]);
                    this.flag = 0;
                    promises.push(this.past_meeting_data);
                }
            }
            $q.all(promises).then(deferred.resolve());
            return deferred.promise;
        };
    });
