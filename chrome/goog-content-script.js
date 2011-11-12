/*
Copyright 2011 SRI International

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
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


chrome.extension.onRequest.addListener(function (request, sender, callback) {
    console.log("received event")

    if (request.action == 'toggle') {
        // console.log("getJSON: "+request.url+" "+request.data.startkey);
        if (request.show) {
             $(request.selector).removeClass("hidden");
        } else {
            $(request.selector).addClass("hidden");
        }

        Lawnchair(function(){
            this.save({"key":"opt_"+request.selector, "value":request.show})
        });
    } else if (request.action == 'get_toggle') {
        var mycb = callback;
        var lc = Lawnchair(function(){});
        lc.get("opt_"+request.selector, function(obj) {
                mycb({"checked":obj.value});
            });
    }
});



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
                        lc.get("opt_.learning-registry.standards", function(obj){
                            if (obj.value) {
                                $("div#learnreg-"+id+".hidden").removeClass("hidden");
                            } else {
                                $("div#learnreg-"+id).addClass("hidden");
                            }
                        });
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
        'startkey':JSON.stringify([resource,,null,null]),
        'endkey':JSON.stringify([resource,{},{}]),
        'reduce':true,
        'group_level':3
    }

    chrome_getJSON(ajaxUrl, data, function(response) { 
        // console.log("processing results for: "+resource);
        var activities = {};
        var hasActivities = 0;
        for (var i=0; i<response.rows.length; i++) {
            var verb = response.rows[i].key[1];
            if (!activities[verb]) {
                activities[verb] = [];
                hasActivities += 1;
            }
            activities[verb].push(response.rows[i].key[2]);
        }

        if (hasActivities > 0) {
            injectActivity({ "resource": resource, "activity": activities })
        }
    });
}


function injectActivity(data) {
    try {
        var id = Crypto.SHA1(data.resource, {asString:false});
        var div_id = "#learnreg-social-"+id;
        if (!($(div_id) && $(div_id).length > 0)) 
        {
            var activity = [];
            for (var verb in data.activity) {
                activity.push({ "verb": verb, "activities": data.activity[verb]});
            }
            
            chrome_mustache("block-social", {"id":id, "stdImg":imgBulb, "activity":activity}, function(html){
                $(links[data.resource]).closest("div.vsc").append(html);

                var lc = Lawnchair(function(){});
                lc.get("opt_.learning-registry.activity", function(obj){
                    if (obj.value) {
                        $("div#learnreg-social-"+id+".hidden").removeClass("hidden");
                    } else {
                        $("div#learnreg-social-"+id).addClass("hidden");
                    }
                });
            });
        }
    } catch (Error) {
        console.log("injectActivity: "+Error);
    }
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
            doActivity(this.href);
            urls.push(this.href);
            links[this.href]=this;
        });
        // console.log(urls.join("\n\n"));
    } else {
        // console.log("eid: "+eid);
    }
    setTimeout('parseLinks()', 3000);
}


var eid = null;

jQuery(function(){
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




