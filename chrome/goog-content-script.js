var chrome_getJSON = function(url, data, callback) {
  // console.log("sending RPC");
  chrome.extension.sendRequest({"action":"getJSON", "data":data, "url":url}, callback);
}

var chrome_ajax = function(data) {
  // console.log("sending RPC");
  chrome.extension.sendRequest({"action":"ajax", "data":data}, data.success);
}

var chrome_mustache = function(id, data, callback) {
  chrome.extension.sendRequest({"action":"mustache", "id": id, "data":data}, callback);
}

var imgBulb = chrome.extension.getURL("images/dialog-information-2.png");
var imgEdu = chrome.extension.getURL("images/applications-education.png");
var couchdb = "http://demolearningregistry.sri.com";

function idResults(data) {
    try {
        var id = Crypto.SHA1(data.resource, {asString:false});
        var div_id = "#learnreg-"+id;
        if (!($(div_id) && $(div_id).length > 0)) {
            chrome_mustache("block", {"id":id, "stdImg":imgEdu}, function(html){
                $(links[data.resource]).closest("div.vsc").append(html);
                getAlignmentInfo(id, data);
            });
            
        }
    } catch (Error) {
        console.log("idResults: "+Error);
    }
}



function getAlignmentInfo(id, data) {
    for(var i=0; i<data.stds.length; i++) {
        console.log(id+": "+i+" u:"+data.stds[i]);
        queryJesAndCo(id, data.stds[i]);
    }
}

function queryJesAndCo(id, asn) {
    // var resource = "http://asn.jesandco.org/resources/S1017AA1";
    // resource = "http://purl.org/ASN/resources/S101D0D7";
    //http://asn.jesandco.org/api/1/taxon?uri=http://asn.jesandco.org/resources/S113022D&callback=foo
    console.log("start queryJesAndCo: "+id+": "+asn);
    var baseUrl = 'http://asn.jesandco.org/api/1/taxon';

    var lc = Lawnchair(function(){});
       lc.get(asn, function(keyExists){
            if (keyExists && keyExists.value.statementNotation != "") {
                chrome_mustache("std", keyExists.value, function(html) {
                    if (html && html != "") {
                        $("div#learnreg-"+id+" div.data").append(html);

                        // console.log("cached data for: "+id+" "+html);
                    }
                });

            } else {
              

                var aurl = asn.replace("//purl.org/ASN", "//asn.jesandco.org");
                console.log(aurl);
        
                var data = {
                    "uri": aurl
                };

                var callback = function(response, status, jqXHR) {
                    var jesurl = aurl;
                    var info = {
                        "identifier": asn,
                        "category": "",
                        "educationLevel": [],
                        "standard":[],
                        "statementNotation":[]
                    }

                    try {
                        var statement = response[jesurl];

                        // Try finding the umbrella category.
                        try {
                            var isPartOf = statement["http://purl.org/dc/terms/isPartOf"]

                            for (var i=0; i<isPartOf.length; i++) {
                                var asn_id = isPartOf[i].value.replace(/^.*\//, "");
                                if (asn_id.match(/^D[A-Z0-9]+$/)) {
                                    var doc = response[isPartOf[i].value];
                                    try {
                                        info["category"] = doc["http://purl.org/dc/elements/1.1/title"][0].value;
                                    } catch (e1) {
                                        try {
                                            info["category"] = doc["http://purl.org/dc/terms/description"][0].value;
                                        } catch (e2) { }
                                    }

                                }
                                
                            }
                        } catch (e) { }

                        function value(obj) {
                            return obj.value;
                        }

                        function strip(url) {
                            try {
                                return url.value.replace(/^.*\//, '');
                            } catch (Error) {
                                return "";   
                            }
                        }


                        // Try getting the standard
                        try {
                            info["standard"] = statement["http://purl.org/dc/terms/description"].map(value);
                        } catch (e) { }

                        try {
                            info["educationLevel"] = statement["http://purl.org/dc/terms/educationLevel"].map(strip);
                        } catch (e) { }

                        try {
                            info["statementNotation"] = statement["http://purl.org/ASN/schema/core/statementNotation"].map(value);
                        } catch (e) { }


                        // info.category = info.category.map(strip).join(", ");
                        info.standard = info.standard.join(", ");
                        info.educationLevel = info.educationLevel.join(", ");
                        info.statementNotation = info.statementNotation.join(", ");

                    } catch (Error) {
                        console.log(Error);
                    }

                    Lawnchair(function() {
                        this.save({"key":asn, "value":info});
                    });

                    if (info.statementNotation != "") {
                        chrome_mustache("std", info, function(html) {
                            if (html && html != "") {
                                $("div#learnreg-"+id+" div.data").append(html);
                                // console.log("data for: "+id+" "+html);
                            }
                        });
                    }
                    // var html = Mustache.to_html(template, info);
                    
                    
                }

                data["callback"] = "foo";

                var params = {
                    "url": baseUrl,
                    "dataType": "json",
                    "data": data,
                    "success": callback,
                    "cache": false,
                    "jsonp": "callback"
                };

                chrome_ajax(params);


          }
           
       }); 


   
}


// function queryJesAndCoSPARQL(id, asn) {
//     // var resource = "http://asn.jesandco.org/resources/S1017AA1";
//     // resource = "http://purl.org/ASN/resources/S101D0D7";
//     var baseUrl = 'http://asn.jesandco.org:8890/sparql';

//     aurl = asn.replace("//purl.org/ASN", "//asn.jesandco.org")
//     console.log(aurl);
//     var query='select * where {<'+aurl+'> ?predicate ?object}';

//     //var query='select * where {?asnURI ?property ?value; asn:identifier <'+resource+'>}'
//     var data = {
//         'default-graph-uri':"",
//         'query': query,
//         'debug': 'on',
//         'timeout': "",
//         'format': 'json',
//         'save': 'display',
//         'fname': ""
//     };

//     var callback = function(response, status, jqXHR) {
//         var info = {
//             "identifier": asn,
//             "educationLevel": [],
//             "description":[],
//             "subject": []
//             "statementNotation":[]
//         }
//         try {
//             var bindings = response.results.bindings
//             for(var i=0; i < bindings.length; i++) {
//                 switch(bindings[i].predicate.value) {
//                     case "http://purl.org/dc/terms/subject":
//                         info.subject.push(bindings[i].object.value);
//                         break;
//                     case "http://purl.org/dc/terms/educationLevel":
//                         info.educationLevel.push(bindings[i].object.value);
//                         break;
//                     case "http://purl.org/dc/terms/description":
//                         info.description.push(bindings[i].object.value);
//                         break;
//                     case "http://purl.org/ASN/schema/core/statementNotation":
//                         info.statementNotation.push(bindings[i].object.value);
//                     default:
//                         break;
//                 }
//             }

//             function strip(url) {
//                 return url.replace(/^.*\//, '');
//             }

//             info.subject = info.subject.map(strip).join(", ");
//             info.educationLevel = info.educationLevel.map(strip).join(", ");

//         } catch( Error) {
//             console.log(Error);
//         }

//         var template = 
//             '<div style="font-size:10px;"><p>' +
//             '{{#description}}'+
//                 '{{#identifier}}<a href="{{identifier}}" target="_blank">{{/identifier}}'+
//                     '{{.}}'+
//                 '{{#identifier}}</a>{{/identifier}}<br/>'+
//             '{{/description}}' +
//             '{{#educationLevel}}<em>Education Level:</em> {{educationLevel}}<br/>{{/educationLevel}}' +
//             '{{#subject}}<em>Subject:</em> {{subject}}<br/>{{/subject}}' +
//             '</p><div>';

//         var html = Mustache.to_html(template, info);
//         $("div#learnreg-"+id+" div.data").append(html);
//         console.log("data for: "+id+" "+JSON.stringify(response));
//     }

//     var params = {
//         "url": baseUrl,
//         "dataType": "jsonp",
//         "data": data,
//         "success": callback,
//         "cache": false,
//         "jsonp": "callback"
//     };

//     chrome_ajax(params);
// }


function doAlignment(resource) {
    var ajaxUrl = couchdb+'/resource_data/_design/standards-alignment/_view/by-resource-locator?callback=?'
    var data = {
        'startkey':JSON.stringify([resource,null]),
        'endkey':JSON.stringify([resource,{}]),
        'reduce':true,
        'group_level':2
    }

    chrome_getJSON(ajaxUrl, data, function(response) { 
        // console.log("processing results for: "+resource);
        var urls = [];
        var urlmap = {};
        for (var i=0; i<response.rows.length; i++) {
            var key = response.rows[i].key[1];
            if (!urlmap[key]) {
                urlmap[key] = true;
                urls.push(key);
            }
        }

        if (urls.length > 0) {
            idResults({ "resource": resource, "stds": urls })
        }
    });
}

function doActivity(resource) {
    var ajaxUrl = couchdb+'/resource_data/_design/paradata-activity/_view/by-resource-id?callback=?'
    var data = {
        'startkey':JSON.stringify([resource,null]),
        'endkey':JSON.stringify([resource,{}]),
        'reduce':true,
        'group_level':2
    }

    chrome_getJSON(ajaxUrl, data, function(response) { 
        // console.log("processing results for: "+resource);
        var stmtMap = {};
        for (var i=0; i<response.rows.length; i++) {
            var activity = response.rows[i].key[1];
            if (!stmtMap[activity]) {
                stmtMap[key] = 0;
            }
        }

        if (urls.length > 0) {
            idResults({ "resource": resource, "stds": urls })
        }
    });
}

var links = {};
function parseLinks() {
    // console.log("parsing links");
    var new_eid = $("ol#rso").attr("eid");
    if (new_eid != eid) {
        links = {};
        eid = new_eid;
        var urls = [];
        $("#ires li.g a.l").each(function() {
            doAlignment(this.href);
            urls.push(this.href);
            links[this.href]=this;
        });
        // console.log(urls.join("\n\n"));
    } else {
        // console.log("eid: "+eid);
    }
    setTimeout('parseLinks()', 3000);
}


// function attachInstantSearchListener(eid) {

//     var callback = function() {
//         console.log("search input keypress.");
//         var new_eid = $("ol#rso").attr("eid");
//         if (new_eid != eid) {
//             console.log("search results changed!!!");
//             eid = new_eid;
//             parseLinks();
//         }
//     }

//     try {
//         $("input#lst-ib.gsfi").unbind("keypress", callback);
//     } catch (Error) {
//         console.log(Error)
//     }

//     $("input#lst-ib.gsfi").bind("keypress", callback);
// }

var eid = null;

jQuery(function(){
    // attachInstantSearchListener(eid);
    // setTimeout('attachInstantSearchListener(eid);', 1000);

    $("body").live("keydown", function(event) {
        // Bind to both command (for Mac) and control (for Win/Linux)
        var modifier = event.ctrlKey || event.metaKey;
        if (modifier && event.shiftKey && event.altKey && event.keyCode == 191) {
            Lawnchair(function() {
               this.nuke(function() {
                   alert("Local Storage Nuked!");
               }); 
            });
        }
    });

    parseLinks();
});




