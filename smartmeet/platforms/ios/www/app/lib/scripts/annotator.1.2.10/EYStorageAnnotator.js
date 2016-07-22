Annotator.Plugin.EYStorageAnnotator = function (element,options) {
    return {
        pluginInit: function () {          
          
            var _that = this;
           
            var userAnnotations =null;
            this.annotator
                .subscribe("beforeAnnotationCreated", function (annotation) {
                    annotation.id = generateUUID();                  
                })
                .subscribe("annotationCreated",createAnnotation )
                .subscribe("annotationUpdated", updateAnnotation)
                .subscribe("annotationDeleted",deleteAnnotation);

            function generateUUID() {
                var d = new Date().getTime();
                var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
                return uuid;
            }

            function createAnnotation(annotation) {
                delete annotation.quote;//deleting the quote property as it is not required
                annotation.pageNumber = annotation.ranges[0].start.split('[')[2].split(']')[0];// getting the page number from the start range
                var pagenumber = 'page' + annotation.pageNumber;
                if (userAnnotations && !userAnnotations[pagenumber]) {
                    userAnnotations[pagenumber] = [];
                }
                userAnnotations[pagenumber].push(annotation);
                saveAnnotation(userAnnotations);
            }

            function updateAnnotation(annotation) {
                var pagenumber = 'page' + annotation.pageNumber;
                for (var i = 0; i < userAnnotations[pagenumber].length; i++) {
                    if (userAnnotations[pagenumber][i].id == annotation.id) {
                        userAnnotations[pagenumber][i] = annotation;
                        break;
                    }
                }
                saveAnnotation(userAnnotations);
            }

            function deleteAnnotation(annotation) {
                if (typeof (annotation.pageNumber) !== "undefined" && annotation.pageNumber !== null) {
                    var pagenumber = 'page' + annotation.pageNumber;
                    for (var i = 0; i < userAnnotations[pagenumber].length; i++) {
                        if (userAnnotations[pagenumber][i].id == annotation.id) {
                            userAnnotations[pagenumber].splice(i, 1);
                            break;
                        }
                    }
                    saveAnnotation(userAnnotations);
                }
            }

            function saveAnnotation(data) {
                var userAnnotaions = JSON.stringify(data);
                angular.element(document.getElementById('ngView')).scope().saveAnnotation(userAnnotaions);
//                options.saveMethod(userAnnotaions);
            }


            document.addEventListener('textlayerrendered', function (e) {
                 angular.element(document.getElementById('ngView')).scope().stopLoader();
                 var annot=angular.element(document.getElementById('ngView')).scope().getUserAnnotaions();
                if(annot == "" || annot=="[]"){
                annot=null;
                }
                                      userAnnotations=annot ? JSON.parse(annot):{};
                if (!userAnnotations) {
                    userAnnotations = options.userAnnotaions ? JSON.parse(options.userAnnotaions) : {};
                }
                var pagenumber = 'page' + e.detail.pageNumber;
                if (userAnnotations[pagenumber]) {
                    _that.annotator.loadAnnotations(userAnnotations[pagenumber].slice());
                }
            });
           
        }
    }

};
