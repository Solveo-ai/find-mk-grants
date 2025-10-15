	
//js that includes the basic functionality to load Components asyncronously
var replaceComponentCount = 0;
var replaceComponentCountSinceLastSecond = 0;
var replaceComponentMaxPerSecond = 50; //set to negative value to set no max
	
setInterval(function(){
	var tmp___ = replaceComponentCountSinceLastSecond;
	replaceComponentCountSinceLastSecond = 0;
	if(tmp___ >= replaceComponentMaxPerSecond * 0.9) {
	   htmlChanged();
   	}
}, 1000);

var replaceComponentShowresultParam = "____showresult";
var replaceComponentAjaxParam = "____ajax";

function createComponent(options, tag) {
    var selfClosingTags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr", "command", "keygen", "menuitem"];
    var outputstring = "<" + tag + " data-component "; 
    for (var k in options) {
        if (options.hasOwnProperty(k)) {
           outputstring += "data-" + k + "=\"" + options[k] + "\" ";
        }
    }
    //console.log(outputstring);
    if(selfClosingTags.indexOf(tag) >= 0) {
       outputstring += "/>";
    }
    else {
       outputstring += "></" + tag + ">"; 
    }
    return outputstring;
}

function replaceLazyComponents() {
    $("[data-lazycomponent]:not(.componentLoading, .componentLoadingFailed)").each(function(){
        if($(this).isInViewport()) {
            $(this).attr("data-component", "");
            $(this).removeAttr("data-lazycomponent");
            htmlChanged();
        }
    });
}
$(window).on("load resize scroll",replaceLazyComponents);


function replaceComponents() {
    //function that searches for all unreplaced components
    //first check for ajaxcomponents
    $("[data-ajaxcomponent]:not(.componentLoading, .componentLoadingFailed)").each(function(){
        $(this).attr("data-component", "");
        $(this).removeAttr("data-ajaxcomponent");
    });
    
    
	$("[data-component]:not(.componentLoading, .componentLoadingFailed)").each(function(){
		if(replaceComponentMaxPerSecond >= 0 && replaceComponentCountSinceLastSecond <= replaceComponentMaxPerSecond) {
			var selfComponent = this;
			replaceComponent(selfComponent, {}, false);
		}
		else {
			console.log(replaceComponentCountSinceLastSecond+" components were loaded asyncronously since last second. that is a bit much (limit should be "+replaceComponentMaxPerSecond+") the remaining components should be loaded in the next second.");
		}
	});
}

var replaceComponentReturnvalues = {};
function replaceComponent(selfComponent, postdata, afterReplaceCallback) {
    replaceComponentCount++;
	replaceComponentCountSinceLastSecond++;
    //function that replaces a specific unreplaced component
	if(typeof selfComponent == "string") {
		//selfComponent is a jquery Selector -> make object
		$(selfComponent).each(function(){
			replaceComponent(this, postdata, afterReplaceCallback)
		});
		return;
	}
    $(selfComponent).addClass("componentLoading");
    var selfPosition = $(selfComponent).css("position");
    if(selfPosition != "relative" && selfPosition != "absolute" && selfPosition != "fixed") {
		if($(selfComponent).parents('.echoverlay-inner-wrap').length == 0){
       		$(selfComponent).css("position", "relative");
		}
    }
    $(selfComponent).append('<span class="componentIcon componentIcon-load"></span>');
    var data = {};
    $.each(selfComponent.attributes, function(i, attrib){
        if (attrib.name.substring(0, 5) == "data-") {
           data[attrib.name] = attrib.value;
        }
    });
    var getString = window.location.search.split("?");
    if(getString[1] !== undefined) {
       var getParams = getString[1].split("&");
        for (var i = 0; i < getParams.length; i++) {
            var thisParam = getParams[i].split("=");
            if((thisParam[0] != replaceComponentShowresultParam && thisParam[0] != replaceComponentAjaxParam) && data[thisParam[0]] == undefined) {
               data[thisParam[0]] = (thisParam[1] === undefined ? "" : thisParam[1]);
            }
        }
    }
    var ajaxParams = "?";
    for (var k in data) {
        if (data.hasOwnProperty(k) && data[k] != "{}") {
            ajaxParams += k + "=" + data[k] + "&";
        }
    }
    ajaxParams += replaceComponentAjaxParam + "=1";
    //console.log(systemConfiguration.path_component + "resources/replaceComponents.php"+ajaxParams);
	//console.log(systemConfiguration.protocol + "://" + systemConfiguration._site_url + "/" + systemConfiguration.path_component + "resources/replaceComponents.php"+ajaxParams);
	//console.log(location.protocol);
    var ajaxObj = {
        url: systemConfiguration.path_component + "resources/replaceComponents.php"+ajaxParams,
        cache: false,
        data: postdata,
        type: "POST",
        success: function(returnval){
            if(returnval.returnvalues !== undefined && typeof returnval.returnvalues == 'object') {
                for (var k in returnval.returnvalues){
                    if (returnval.returnvalues.hasOwnProperty(k)) {
                        replaceComponentReturnvalues[k] = returnval.returnvalues[k];
                    }
                }
                replaceComponentReturnvalues = returnval.returnvalues;
            }
            if(returnval.location !== undefined ) {
                window.location.replace(returnval.location);
            }
            else if(returnval.html !== undefined && returnval.dependencies !== undefined) {
                //$(selfComponent).replaceWith(returnval.html); //replaced with replaceAll to get new Element as return
				var replaced = $(returnval.html).replaceAll(selfComponent);
				/*if(replaced.attr("data-reload") != undefined && replaced.attr("data-reload") == 1){
					/*var options = {"component": ""};
					$.each(replaced.data(),function(i,v){
						if(i != "reload"){
							options[i] = v;
						}
					});
					var newc = createComponent(options, "div");
					replaced = $(replaced).replaceWith($(newc));
					location.reload();
				}*/
				//now check for autofocus inputs in new html and autofocus them
				var autofocusinputs = replaced.find("input[autofocus], select[autofocus], button[autofocus], textarea[autofocus]");
				if(autofocusinputs.length > 0) {
				   autofocusinputs.first().focus();
			   	}
                for (var cat in returnval.dependencies) {
                    if (returnval.dependencies.hasOwnProperty(cat)) {
                       	var catdependencies = returnval.dependencies[cat];
						
						//add the dependecies in reverse order
						var arr = [];
						for (var key in catdependencies) {
							if (catdependencies.hasOwnProperty(key)) {
								arr.push(key);
							}
						}
						for (var i=arr.length-1; i>=0; i--) {
							var dependencyurl = arr[i];
                            if (catdependencies.hasOwnProperty(dependencyurl)) {
                               var dependentComponents = catdependencies[dependencyurl];
                               var functionname = "addDependency_" + cat;
                                if (typeof window[functionname] === "function") { 
                                    window[functionname](dependencyurl, dependentComponents);   
                                }
                            }
                        }
                    }
                }
				htmlChanged();
				
            }
            else {
                componentError(selfComponent, "async-replaceComponent-invalid", {});
            }
            
            if(typeof afterReplaceCallback == "function") {
               afterReplaceCallback();
            }
			$(window).trigger("resize"); //to trigger rerender of various things such as masonry grid...
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            componentError(selfComponent, "async-replaceComponent-failed", {"textStatus": textStatus, "errorThrown": errorThrown});
        },
        complete: function(XMLHttpRequest, textStatus){
            completed = 1;
        }
    };
    if(postdata instanceof FormData) {
        ajaxObj.contentType = false;
        ajaxObj.processData = false;
    }
    $.ajax(ajaxObj);
   
}

function componentError(selfComponent, errortype, erroroptions) {
    //function that throws an error on a specific component - loading the error asyncronously from componentError.php/html if possible
    var data = {};
    for (var erroroption in erroroptions) {
        if (erroroptions.hasOwnProperty(erroroption)) {
           data[erroroption] = erroroptions[erroroption];
        }
    }
    data.type = errortype;
    data["iconOnly"] = "1";
    data[replaceComponentAjaxParam] = "1";
    $.ajax({
        url: systemConfiguration.path_component + "resources/componentError.php",
        cache: true,
        data: data,
        type: "GET",
        success: function(returhtml){
            $(selfComponent).removeClass("componentLoading");
            $(selfComponent).addClass("componentLoadingFailed");
            $(selfComponent).find(".componentIcon").remove();
            $(selfComponent).append(returhtml);
            htmlChanged();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            $(selfComponent).removeClass("componentLoading");
            $(selfComponent).addClass("componentLoadingFailed");
            $(selfComponent).find(".componentIcon").remove();
            $(selfComponent).append('<span class="componentIcon componentIcon-error"></span>');
            htmlChanged();
        }
    });
}
    
function addDependency_css(url, dependentComponents) {
    //function that adds a CSS Dependency and completes dependentcomponents Information in case that dependency is already loaded
	var url_with_resource_param = url + ((url.indexOf("?") !== -1) ? "&" : "?")+"version="+resource_param;
		
	var existing = $('link[href="' + url + '"], link[href="' + url_with_resource_param + '"]');
	if(existing.length == 0) {
	   $('link[data-componentdependencies]').each(function(){
		   	var componentdependencies = JSON.parse($(this).attr("data-componentdependencies"));
		   	if((url in componentdependencies)) {
				existing = $(this);
			}
	   });
	}
	
    if(existing.length > 0) {
       for (var k in dependentComponents) {
            if (dependentComponents.hasOwnProperty(k)) {
				if(existing.attr("data-componentdependencies") != undefined) {
			   		var componentdependencies = JSON.parse(existing.attr("data-componentdependencies"));
					if(componentdependencies[url].indexOf(dependentComponents[k]) == -1) {
					   	componentdependencies[url].push(dependentComponents[k]);
						existing.attr("data-componentdependencies", JSON.stringify(componentdependencies)); //json HTML Encoded 
				   	}
				}
				else {
				   	if(existing.attr("data-dependentcomponents").indexOf(dependentComponents[k]) == -1) {
					   existing.attr("data-dependentcomponents", existing.attr("data-dependentcomponents") + " " + dependentComponents[k]);
					}
				}
            }
        }
    }
    else {
        var dependentComponentsString = "";
        for (var k in dependentComponents) {
            if (dependentComponents.hasOwnProperty(k)) {
                if(dependentComponentsString.length > 0) {
                   dependentComponentsString += " ";
                }
                dependentComponentsString += dependentComponents[k];
            }
        }
        $("head").append('<link href="' +url_with_resource_param + '" rel="stylesheet" type="text/css" media="all" data-dependentcomponents="' + dependentComponentsString + '">');
    }
}

function addDependency_js(url, dependentComponents) {
    //function that adds a JS Dependency and completes dependentcomponents Information in case that dependency is already loaded
	var url_with_resource_param = url + ((url.indexOf("?") !== -1) ? "&" : "?")+"version="+resource_param;
	
    var existing = $('script[src="' + url + '"], script[src="' + url_with_resource_param + '"]');
	if(existing.length == 0) {
	   $('script[data-componentdependencies]').each(function(){
		   	var componentdependencies = JSON.parse($(this).attr("data-componentdependencies"));
		   	if((url in componentdependencies)) {
				existing = $(this);
			}
	   });
	}
	
    if(existing.length > 0) {
       for (var k in dependentComponents) {
            if (dependentComponents.hasOwnProperty(k)) {
				if(existing.attr("data-componentdependencies") != undefined) {
			   		var componentdependencies = JSON.parse(existing.attr("data-componentdependencies"));
					if(componentdependencies[url].indexOf(dependentComponents[k]) == -1) {
					   	componentdependencies[url].push(dependentComponents[k]);
						existing.attr("data-componentdependencies", JSON.stringify(componentdependencies)); //json HTML Encoded 
				   	}
				}
				else {
					if(existing.attr("data-dependentcomponents").indexOf(dependentComponents[k]) == -1) {
					   existing.attr("data-dependentcomponents", existing.attr("data-dependentcomponents") + " " + dependentComponents[k]);
					}
				}
            }
        }
    }
    else {
        var dependentComponentsString = "";
        for (var k in dependentComponents) {
            if (dependentComponents.hasOwnProperty(k)) {
                if(dependentComponentsString.length > 0) {
                   dependentComponentsString += " ";
                }
                dependentComponentsString += dependentComponents[k];
            }
        }
        $("head").append('<script type="text/javascript" src="' +url_with_resource_param + '" data-dependentcomponents="' + dependentComponentsString + '"></' + 'script>');
    }
}

function initComponentForms() {
    //function that adds submit event listeners to componentForms that do not have these listeners yet
    $("form[data-componentform]:not(.componentform-initialized)").each(function(){
        $(this).addClass("componentform-initialized");
        $(this).on("submit", function(event){
            event.preventDefault();
			var target = this;
            if($($(this).attr("data-componentform")).length > 0) {
               target = $($(this).attr("data-componentform"))[0];
            }
            var postdata = new FormData(this);
            
            var afterReplaceCallback = false;
            
            var rdt_configmap_id = $(this).attr("data-componentform-rdt_configmap_id");
            var rdt_config_id = $(this).parents('.adminForm').attr('data-rdt_config_id');
            var action = $(this).parents('.adminForm').attr('data-action');
            
            if(rdt_configmap_id != undefined && rdt_config_id != undefined) {
                
                afterReplaceCallback = function(){
                    map_refresh(rdt_configmap_id, rdt_config_id, replaceComponentReturnvalues,action);
                };
            }
			var callback_refresh = $(this).attr("data-componentform-callback-refresh");
			if(callback_refresh != undefined && afterReplaceCallback == false) {

				/**
                 * data-componentform-callback-refresh takes a jQery Selector that can target other components that should be loaded again
                 * for example if you add a image you may want to refresh the image list
                 * */
                afterReplaceCallback = function(){
					$(callback_refresh).each(function(){
						replaceComponent(this, {}, false);
					});
                };
			}
            replaceComponent(target, postdata, afterReplaceCallback,"");
        });
    });
}

function testComponents() {
    // function that lets us test all of the components individually (without taking post data into account)
    // is meant to be called using the console
    // if styling of a component is off it might miss dependecies
    $("#testComponents").remove();
    $("[data-componentname][data-componentcollection]").each(function(){
        var selfComponent = this;
        testComponent(selfComponent);
    });
}

function testComponent(selfComponent) {
    var data = {};
    $.each(selfComponent.attributes, function(i, attrib){
        if (attrib.name.substring(0, 5) == "data-") {
           data[attrib.name] = attrib.value;
        }
    });
    var getString = window.location.search.split("?");
    if(getString[1] !== undefined) {
       var getParams = getString[1].split("&");
        for (var i = 0; i < getParams.length; i++) {
            var thisParam = getParams[i].split("=");
            data[thisParam[0]] = (thisParam[1] === undefined ? "" : thisParam[1]);
        }
    }
    var ajaxParams = "?";
    for (var k in data) {
        if (data.hasOwnProperty(k)) {
            ajaxParams += k + "=" + data[k] + "&";
        }
    }
    ajaxParams += replaceComponentShowresultParam + "=1";
    var url = systemConfiguration.path_component + "resources/replaceComponents.php"+ajaxParams
    addTestComponentLink(url, (data["data-componentname"] ? data["data-componentname"] : "component"));
}

function addTestComponentLink(url, name) {
    if($("#testComponents").length == 0) {
        $("body").append('<div id="testComponents" style="position: fixed; top: 0px; left: 0px; bottom: 0px; right: 0px; background-color: #FFFFFF; color: #333333; z-index: 2147483647;"></div>');
        $("#testComponents").append('<button type="button" onclick="$(\'#testComponents\').remove();" style="float: right; margin: 20px; ">testComponents schließen</button>');
        $("#testComponents").append('<ul id="testComponentsList"></ul>');
    }
    $("#testComponentsList").append('<li><a href="' + url + '" target="_blank">' + name + '</a></li>');
}

if(typeof $.fn.isInViewport == "undefined") {
    $.fn.isInViewport = function () { // function that detects if object is visible to the user (for example used for lazycomponents that load only when visible to the user)
        var KelementTop = $(this).offset().top;
        var KelementBottom = KelementTop + $(this).outerHeight();
        var KviewportTop = $(window).scrollTop();
        var KviewportBottom = KviewportTop + $(window).height();
        return (KelementBottom > KviewportTop && KelementTop < KviewportBottom) && $(this).is(":visible");
    };
}


//systemConfiguration loads essential parts of the configuration.php file to be usable in JS
var systemConfiguration = {"path_admin":"\/_admin\/","path_assets":"\/_assets\/","path_component":"\/_component\/","path_library":"\/_lib\/","path_media":"\/_media\/","path_tools":"\/_tools\/","path_templates":"\/_tpl\/","locktimeout":150,"path_upload":"\/var\/www\/eurvie\/www\/","_site_id":1,"protocol":"https","_site_url":"www.euro-access.eu"};

var devmode = false;
if(devmode) {
   console.info("in order to test all components individually call \"testComponents();\" in your JS Console and use the appearing UI.");
}
	
var resource_param = '2025-07-21_11:42:15';

(function() {
    
    addHtmlChanged('replaceLazyComponents');
    addHtmlChanged('replaceComponents');
    addHtmlChanged('initComponentForms');
})();
