
// ---------------------------------------------
// BZZ

// ---> Site

if (!site) { var site = {}; }

// ---------------------------------------------
// CHANNEL EDIT

site.chedit = {};

// ---> Init

site.chedit.init = function(station_id_to_edit, askedAboutStationName, askedAboutNowplaying, checkedPlayability, isPlayable) {
	
	loggr.info("------------------------------------");
	loggr.info("site.chedit.init()");
	
	site.ui.hideloading();
	
	// Add lifecycle history
	site.lifecycle.add_section_history("#editstation");
	
	// Show UI
	site.ui.gotosection("#editstation");
	
	// Magic || TODO: move to function
	$("#editstation input[name='station_url']")[0].onchange = function(evt) {
		site.chedit.askedAboutNowplaying = false;
		site.chedit.checkedPlayability = false;
		site.chedit.isPlayable = false;
		if (!$("#editstation input[name='station_name']")[0].value) {
			site.ui.showtoast("Checking stream...");
			$("#editstation .action.save").css("display","block");
			site.chedit.check(true,true);
		}
	}
	$("#editstation img.station_icon")[0].onchange = function(evt) {
		if (!$("#editstation input[name='station_icon']")[0].value) {
			$("#editstation img.station_icon").attr("src",$("#editstation input[name='station_icon']")[0].value.trim());
		}
	}
	
	// Set station_id hidden field
	if (station_id_to_edit) {
		site.chedit.isNewStation = false;
		var station_info = site.data.stations[site.helpers.session.getStationIndexById(station_id_to_edit)]; // station_id_to_edit
		$("#editstation .action.save").css("display","block");
		$("#editstation .action.trash").css("display","block");
		$("#editstation input[name='station_id']")[0].value = station_id_to_edit;
		$("#editstation input[name='station_name']")[0].value = station_info.station_name
		$("#editstation input[name='station_url']")[0].value = station_info.station_url
		$("#editstation input[name='station_icon']")[0].value = station_info.station_icon
		site.chedit.newentry = {
			station_id: station_id_to_edit,
			station_edited: station_info.station_edited,
			station_name: station_info.station_name,
			station_url: station_info.station_url,
			station_icon: station_info.station_icon,
			station_image: station_info.station_icon,
			station_host: station_info.station_host,
			station_port: station_info.station_port,
			station_path: station_info.station_path,
			station_country: station_info.station_country,
			station_bitrate: station_info.station_bitrate
		}
		$("#editstation img.station_icon").attr("src",$("#editstation input[name='station_icon']")[0].value.trim());
		$("#editstation img.station_icon")[0].onclick = function() {
			loggr.error(" > chicon.init()",{dontupload:true});
			site.chicon.init($("#editstation input[name='station_id']")[0].value.trim());
		}
	} else if (station_id_to_edit===false) { // clean
		site.chedit.isNewStation = true;
		$("#editstation .action.save").css("display","none");
		$("#editstation .action.trash").css("display","none");
		$("#editstation input[name='station_id']")[0].value = "";
		$("#editstation input[name='station_name']")[0].value = ""
		$("#editstation input[name='station_url']")[0].value = ""
		$("#editstation input[name='station_icon']")[0].value = ""
		$("#editstation img.station_icon").attr("src","img/icons-80/ic_station_default.png");
		$("#editstation img.station_icon").off("click");
		$("#editstation img.station_icon")[0].onclick = function() {
			loggr.error(" > chedit.searchicon() (1)",{dontupload:true});
			site.ui.showtoast('One moment...');
			site.chedit.searchicon();
		}
		site.chedit.newentry = {};
	} else { // continue but make sure the station_id is cleared
		loggr.warn(" > !station_id_to_edit but it's not false?");
		$("#editstation .action.save").css("display","none");
		$("#editstation .action.trash").css("display","none");
		$("#editstation input[name='station_id']")[0].value = "";
		$("#editstation img.station_icon").attr("src","img/icons-80/ic_station_default.png");
		$("#editstation img.station_icon").off("click");
		$("#editstation img.station_icon")[0].onclick = function() {
			loggr.error(" > chedit.searchicon() (2)",{dontupload:true});
			site.ui.showtoast('One moment...');
			site.chedit.searchicon();
		}
	}
	
	// Reset some values
	site.chedit.askedAboutStationName = askedAboutStationName;
	site.chedit.askedAboutNowplaying = askedAboutNowplaying;
	site.chedit.checkedPlayability = checkedPlayability;
	site.chedit.isPlayable = isPlayable;
	
}

// PAUSE RESUME
// - Important stuff: this is function that will be called whenever site.ui.gotosection is called

site.chedit.onpause = function() {
	loggr.log("site.chedit.onpause()");
	// not needed now
}

site.chedit.onresume = function() {
	loggr.log("site.chedit.site.home.()");
	// not needed now
}

// ---> Save

site.chedit.save = function() {
	
	loggr.log("site.chedit.save()");
	
	var isNewStation = false;
	
	// Overwrite data.stations :| || TODO: is this safe?
	if ($("#editstation input[name='station_id']")[0].value) {
		site.chedit.newentry.station_id = $("#editstation input[name='station_id']")[0].value.trim();
	}
	// New station: auto star it
	else {
		isNewStation = true; // <- will later be used to determine whether setStarred should be called
	}
	
	// Remove tmp data
	site.chedit.newentry.tmp = 0;
	
	// Safety
	if (!site.chedit.newentry.station_edited) {
		loggr.log(" > site.chedit.newentry.station_edited = {};");
		site.chedit.newentry.station_edited = {};
	}
	
	// Clear icon_local and image_local
	site.chedit.newentry.station_icon_local = null;
	site.chedit.newentry.station_image_local = null;
	
	// Find changes
	var originalStationIfAny = site.data.stations[site.helpers.session.getStationIndexById(site.chedit.newentry.station_id)];
	if (originalStationIfAny) {
		for (var key in site.chedit.newentry) {
			if (site.chedit.newentry[key] != originalStationIfAny[key]) {
				site.chedit.newentry.station_edited[key] = new Date().getTime();
			}
		}
	} else {
		loggr.warn(" > !originalStationIfAny, are we sure?");
	}
	
	loggr.log(" > Changes:");
	loggr.log(site.helpers.arrToString(site.chedit.newentry.station_edited,1,"\n"));
	
	// Use MergeStations :D || but in reverse :D
	var addstations = [site.chedit.newentry];
	var newstations = site.helpers.mergeStations(addstations, site.data.stations);
	
	// Store!
	site.data.stations = newstations;
	site.storage.writefile(site.cfg.paths.json,"stations.json",JSON.stringify(site.data.stations),
		function(evt) { 
			site.helpers.flagdirtyfile(site.cfg.paths.json+"/stations.json"); // TODO: do something with flagged files..
			site.chedit.changesHaveBeenMade = true;
			site.ui.showtoast("Saved!");
			if (isNewStation) { 
				// New station! Set starred
				site.chlist.setStarred(site.chedit.newentry.station_id);
				site.chedit.changesHaveBeenMadeGotoStarred = true;
				// Reload chedit
				site.chedit.init(site.chedit.newentry.station_id, site.chedit.askedAboutStationName, site.chedit.askedAboutNowplaying, site.chedit.checkedPlayability, site.chedit.isPlayable);
			}
			site.helpers.uploadStation(site.chedit.newentry);
		},
		function(e){ 
			alert("Error writing to filesystem: "+site.storage.getErrorType(e)); 
			loggr.log(site.storage.getErrorType(e)); 
		}
	);
	
}

// ---> Remove

site.chedit.remove = function() {
	
	loggr.log("site.chedit.remove()");
	
	if (!confirm("Are you sure you want to remove this station?\n\nThis can't be undone easily.")) { return; }
	
	// Gather data..
	var station_id = $("#editstation input[name='station_id']")[0].value.trim();
	
	// Clear currentstation if needed
	if (site.session.currentstation_id == station_id) {
		site.session.currentstation_id = null;
		site.session.currentstation = null;
	}
	
	// Find station in data
	var stationIndex = site.helpers.session.getStationIndexById(station_id);
	if (stationIndex<0) { site.ui.showtoast("Huh? Could not find station..?"); return; }
	
	// Check if starred (and unstar if so)
	if (site.chlist.isStarred(station_id)) {
		site.chlist.unsetStarred(station_id);
	}
	
	// Build newstations
	loggr.log(" > Build new stations list...");
	var newstations = [];
	for (var i in site.data.stations) {
		if (!site.data.stations[i]) { continue; } // TODO: This shouldn't be neccasary..?
		if (!site.data.stations[i].station_name) { continue; } // TODO: This shouldn't be neccasary..?
		if (site.data.stations[i].station_id != station_id) {
			newstations.push(site.data.stations[i]);
		}
	}
	
	// Store!
	site.data.stations = newstations;
	site.storage.writefile(site.cfg.paths.json,"stations.json",JSON.stringify(site.data.stations),
		function(evt) { 
			site.helpers.flagdirtyfile(site.cfg.paths.json+"/stations.json"); // TODO: do something with flagged files..
			site.chedit.changesHaveBeenMade = true;
			site.ui.showtoast("Removed!");
			site.chedit.changesHaveBeenMade = true;
			site.chlist.init(true);
		},
		function(e){ 
			alert("Error writing to filesystem: "+site.storage.getErrorType(e)); 
			loggr.log(site.storage.getErrorType(e)); 
		}
	);
	
}

// ---> Check

// Check
// - Checks fields

site.chedit.check = function(findStationName,silent) {
	
	if (site.chedit.isChecking) { return; }
	if (site.chedit.timeout_checking) { clearTimeout(site.chedit.timeout_checking); }
	site.chedit.timeout_checking = setTimeout(function() { site.chedit.isChecking = false; },500);
	site.chedit.isChecking = true;

	loggr.log("site.chedit.check()");
	
	// Blur focus
	$("#editstation input").trigger("blur");
	
	// Start getting values
	var station_id = $("#editstation input[name='station_id']")[0].value.trim();
	var station_name = $("#editstation input[name='station_name']")[0].value.trim();
	var station_url = $("#editstation input[name='station_url']")[0].value.trim();
	var station_icon = $("#editstation input[name='station_icon']")[0].value.trim();
	
	// findStationName :)
	if (findStationName) {
		station_name = site.helpers.getUniqueID();
	}
	
	// Check mandatory values
	if (!station_name) {
		site.ui.showtoast("Station name is mandatory");
		site.ui.hideloading();
		return;
	}
	if (!station_url) {
		site.ui.showtoast("Station url is mandatory");
		site.ui.hideloading();
		return;
	}
	
	// Check if exsits: name
	if (site.data.stations && !station_id) {
		for (var i in site.data.stations) {
			if (!site.data.stations[i].station_name) { continue; }
			if (station_name.toLowerCase()==site.data.stations[i].station_name.toLowerCase()) {
				alert("A station with name '"+ station_name +"' already exists. Please change it.");
				site.ui.hideloading();
				return;
			}
		}
	} else {
		//loggr.warn(" > Huh? !site.data.stations...?"); // TODO: CLEANNUP
		//loggr.log(" >> "+ station_id);
		//loggr.log(" >> "+ site.data.stations);
	}
	
	// Check if exsits: url
	if (site.data.stations && !station_id) {
		for (var i in site.data.stations) {
			if (!site.data.stations[i].station_url) { continue; }
			if (station_url.toLowerCase()==site.data.stations[i].station_url.toLowerCase()) {
				alert("A station with this url already exists: '"+site.data.stations[i].station_name+"'");
				site.ui.hideloading();
				return;
			}
		}
	} else {
		// loggr.warn(" > Huh? !site.data.stations...?"); // TODO: CLEANNUP
	}
	
	// Create new entry
	if (!site.chedit.newentry) { site.chedit.newentry = {}; }
	site.chedit.newentry.station_id = "CUSTOM."+site.helpers.genUniqueStationId(station_name).replace(" ","_");
	site.chedit.newentry.station_name = station_name;
	site.chedit.newentry.station_icon = station_icon;
	site.chedit.newentry.station_image = station_icon;
	site.chedit.newentry.station_country = ""
	site.chedit.newentry.station_bitrate = "-1 kbps"
	
	site.chedit.newentry.station_icon_local = null;
	site.chedit.newentry.station_image_local = null;
	
	// Start checking the actual urls..
	site.chedit.check_station_url(station_name, station_url, silent);
	
}

// Check station_url

site.chedit.check_station_url = function(station_name, station_url, silent, playlistChecked, isPlaylist) {
	
	loggr.log("site.chedit.check_station_url()");
	
	site.ui.showloading("Wait");
	
	// --> Auto-gen host, port and other stuff
	
	// Host || TODO: this should be doable in a nicer, cleaner way?
	var stationHostPortAndPath = site.chedit.getStationHostPortAndPath(station_name, station_url);
	var station_host = stationHostPortAndPath.host;
	var station_port = stationHostPortAndPath.port;
	var station_path = stationHostPortAndPath.path;
	
	// Do api call
	var apiqueryobj = {
		"get":"station_info",
		"station_id":"TMP."+site.helpers.genUniqueStationId(station_name).replace(" ","_"),
		"station_host":station_host,
		"station_port":station_port,
		"station_path":station_path
	}
	
	var apiaction = "get";
	var apiquerystr = JSON.stringify(apiqueryobj);
	
	site.webapi.exec(apiaction,apiquerystr,
		function(data) {
			loggr.log(JSON.stringify(data["data"]));
			if (!data["data"]["content-type"]) { 
				// Not good!
				site.ui.hideloading();
				if (!silent) { site.ui.showtoast("Err: Icerrr cannot verify station url"); }
			} else {
				// Good!
				
				// Check content-type
				if (data["data"]["content-type"].indexOf("audio/mpeg")<0 
				 && data["data"]["content-type"].indexOf("audio/aacp")<0
				 && data["data"]["content-type"].indexOf("audio/x-mpegurl")<0
				 && data["data"]["content-type"].indexOf("audio/")<0 // TODO: To easy on the type?
				 && data["data"]["content-type"].indexOf("audio%2F")<0 // TODO: To easy on the type?
				 && !site.chedit.isPlayable
				) {
					
					loggr.log(" > Webapi cannot read metadata, test if playable at all...");
					
					if (site.chedit.checkedPlayability == station_url) {
						site.ui.showtoast("Sorry, doesn't work");
						site.ui.hideloading();
						return;
					}
					site.chedit.checkedPlayability = station_url;
					
					// Station not verified, try if it is playable
					site.chedit.testStationPlayable(station_url,
						function() { // playable
								
							site.chedit.isPlayable = true;
							
							var conf;
							if (site.chedit.askedAboutNowplaying) { conf = true; }
							else {
								conf = confirm("Icerrr can not read the station's metadata but it can play the stream. 'Now playing' info will not be available. Continue?");
								site.chedit.askedAboutNowplaying = true;
							}
							
							if (conf) {
								
								// Save host, port, path (i knew this data was going to be useful :D
								site.chedit.newentry.station_url = $("#editstation input[name='station_url']")[0].value.trim();
								site.chedit.newentry.station_host = station_host;
								site.chedit.newentry.station_port = station_port;
								site.chedit.newentry.station_path = station_path;
								
								// TODO: Fixme: remove this data before saving it, it's useless because outdated..
								site.chedit.newentry.tmp = {};
								site.chedit.newentry.tmp.station_info = data["data"];
								
								site.chedit.check_station_icon(silent);
								
							} else {
								site.ui.hideloading();
								if (!silent) { site.ui.showtoast("Err: Icerrr cannot verify station url");  }
							}
							
						},
						function() { // not playable
							
							// Check content-type for playlist-ish keywords
							if (data["data"]["content-type"].indexOf("text")>=0
							 || data["data"]["content-type"].indexOf("audio/x-mpegurl")>=0
							) {
								loggr.log(" > Playlist detected(?), parse it...");
								site.chedit.parsePlaylist(station_url, station_name, function(){ site.chedit.check_station_url(station_name,$("#editstation input[name='station_url']")[0].value,silent,true); });
								return;
							}
								
							// Utterly failed..
							site.ui.hideloading();
							if (!silent) { site.ui.showtoast("Err: Icerrr cannot verify station url");  }
							
						}
					);
					return;
				}
				
				// Check if it's a shoutcast stream (we need to append ';' to the path for chromecast..
				var isShoutcast = false;
				if (data["data"]["icy-notice1"]) {
					if (data["data"]["icy-notice1"].toLowerCase().indexOf("shoutcast")>=0) {
						isShoutcast = true;
					}
				}
				if (data["data"]["icy-notice2"]) {
					if (data["data"]["icy-notice2"].toLowerCase().indexOf("shoutcast")>=0) {
						isShoutcast = true;
					}
				}
				if (isShoutcast) {
					var url = $("#editstation input[name='station_url']")[0].value.trim();
					var lastchar = url.substr(-1);
					if (lastchar!=";") {
						loggr.log(" > Detected shoutcast, append ';' to url..");
						if (lastchar=="/") {
							url += ";";
						} else {
							url += "/;";
						}
						$("#editstation input[name='station_url']")[0].value = url;
					}
				}
				
				// Message!
				if (!silent) {
					site.ui.hideloading();
					site.ui.showtoast("Station url verified!");
				}
				
				// Apply station_name from results?
				if (data["data"]["icy-name"] && !site.chedit.askedAboutStationName) {
					if (site.helpers.capitalize(data["data"]["icy-name"])!=site.chedit.newentry.station_name) {
						if (confirm("We found the following Station name:\n'"+ site.helpers.capitalize(data["data"]["icy-name"]) +"'.\n\nWould you like to apply it?")) {
							site.chedit.newentry.station_name = site.helpers.capitalize(data["data"]["icy-name"]);
							$("#editstation input[name='station_name']")[0].value = site.helpers.capitalize(data["data"]["icy-name"]);
						}
						site.chedit.askedAboutStationName = true;
					}
				}
				
				// Save host, port, path (i knew this data was going to be useful :D
				site.chedit.newentry.station_url = $("#editstation input[name='station_url']")[0].value.trim();
				site.chedit.newentry.station_host = data["data"]["queryj"]["host"];
				site.chedit.newentry.station_port = data["data"]["queryj"]["port"];
				site.chedit.newentry.station_path = data["data"]["queryj"]["path"];
				
				// TODO: Fixme: remove this data before saving it, it's useless because outdated..
				site.chedit.newentry.tmp = {};
				site.chedit.newentry.tmp.station_info = data["data"];
				
				site.chedit.check_station_icon(silent);
				
			}
		},
		function(error) {
			site.ui.hideloading();
			if (error.message) { site.ui.showtoast(error.message); loggr.log(error.message); }
			else { loggr.log(error); }
		}
	);
	
}

// Check station_icon

site.chedit.check_station_icon = function(silent) {
	
	loggr.log("site.chedit.check_station_icon()");
	
	var newentry = site.chedit.newentry;
	// site.chedit.newentry.tmp.station_info
	
	// Start getting values
	var station_name = $("#editstation input[name='station_name']")[0].value.trim();
	var station_url = $("#editstation input[name='station_url']")[0].value.trim();
	var station_icon = $("#editstation input[name='station_icon']")[0].value.trim();
	
	var img = document.createElement("img");
	img.onload = function() {
		// All good :D
		// TODO: Works
		site.ui.hideloading();
		$("#editstation img.station_icon").attr("src",$("#editstation input[name='station_icon']")[0].value.trim());
		newentry.station_icon_local = null;
		newentry.station_image_local = null;
		loggr.log(" > All good :D");
		site.chedit.save();
		/*
		if (confirm("Everything seems to check out! Save now?")) {
			site.chedit.save();
		}
		/**/
	}
	img.onerror = function(evt) {
		// Search the google :D
		// TODO: Work
		if (station_name) {
			loggr.log(" > Search the google :D");
			if (confirm("Station icon could not be loaded. Search Google for an icon?\n\n(Note: You may change the icon later)")) {
				site.chedit.searchicon();
			} else {
				site.ui.hideloading();
			}
		} else {
			site.ui.hideloading();
		}
	}
	img.src = site.helpers.urlAddCachebust(station_icon)
	
	
}

// ---> Search

site.chedit.searchicon = function() {
	
	loggr.log("site.chedit.searchicon()");
	
	if (!site.chedit.newentry) {
		site.ui.showtoast("Cannot search without info");
		site.ui.hideloading();
		return;
	}
	if (!$("#editstation input[name='station_name']")[0].value.trim()) {
		site.ui.showtoast("Cannot search without station name");
		return;
	}
	if (!site.chedit.newentry.station_url) {
		site.ui.showtoast("Cannot search without station url");
		site.ui.hideloading();
		return;
	}
	
	// Prep data || TODO: need more info, 'radio 1' returns image for bbc radio 1
	var searchstring = ""
		+ '"'+ $("#editstation input[name='station_name']")[0].value.trim() +'"' +" "
		+ site.chedit.newentry.station_country +" "
	//	+ site.chedit.newentry.station_url +" "
		+ "logo icon";
	
	var opts = {
		restrictions:[
			[google.search.ImageSearch.RESTRICT_FILETYPE, google.search.ImageSearch.FILETYPE_PNG]
		]
	}
	
	// Search
	site.helpers.googleImageSearch(searchstring,
		function(results) {
			
			loggr.log(" > "+ results.length +" result(s)");
			
			// TODO: let user pick image? Nah, we're going with the first one for now
			// --> Find square image(s)
			var theresult = false;
			for (var i=0; i<results.length; i++) {
				var result = results[i];
				var aspect = site.helpers.calcImageAspect(result["width"],result["height"]);
				if (aspect<1.1) { 
					loggr.log(" > Found square(ish) result: "+ aspect);
					theresult = result; break; 
				}
				
			}
			// Okat just use some image if we can't find a suitable one.. || TODO: fix this
			if (!theresult) { theresult = results[0]; }
			
			loggr.log(" > Result info:");
			loggr.log(" >> tbw/tbh: "+ result.tbWidth +" x "+ result.tbHeight);
			loggr.log(" >> w/h: "+ result.width +" x "+ result.height);
			
			// Set src
			loggr.log(" > Pick: "+theresult.url);
			$("#editstation input[name='station_icon']")[0].value = theresult.url;
			
			// Auto check..
			site.chedit.check();
			
		},
		function() {
			loggr.log(" > No image found...");
			site.ui.showtoast("Could not find an icon on Google...");
			site.ui.hideloading();
		},
		opts
	);
	
}

// ---> Parse playlist

site.chedit.parsePlaylist = function(station_url, station_name, cb, cberr) {
	
	var apiqueryobj = {
			"get":"parse_playlist",
			"url":station_url
		}
		
		var apiaction = "get";
		var apiquerystr = JSON.stringify(apiqueryobj);
		
		site.webapi.exec(apiaction,apiquerystr,
			function(data) {
				var url = data["data"];
				if (url.toLowerCase().indexOf("<")>=0 || url.toLowerCase().indexOf(">")>=0) {
					site.ui.showtoast("Err: Icerrr cannot verify station url");
					site.ui.hideloading();
					if (cberr) { cberr({error:1,message:"Unknown data"}); }
					return;
				}
				site.chedit.newentry.station_url = url;
				$("#editstation input[name='station_url']")[0].value = url;
				if (cb) { cb(); }
			},
			function(error) {
				site.ui.showtoast("Err: Icerrr cannot verify station url");
				site.ui.hideloading();
				if (error.message) { site.ui.showtoast(error.message); loggr.log(error.message); }
				else { loggr.log(error); }
				if (cberr) { cberr(error); }
			}
		);
	
}

// ---> Helpers

// Get station host, port and path

site.chedit.getStationHostPortAndPath = function(station_name, station_url) {
	
	loggr.log("site.chedit.getStationHostPortAndPath()");
	
	// --> Auto-gen host, port and other stuff
	
	// Host || TODO: this should be doable in a nicer, cleaner way?
	var station_host = station_url;
	var station_port = 80; // logic, since it should have http:// in front of it?
	var station_path = "";
	
	if (station_host.indexOf("http://")>=0) {
		station_host = station_host.substr("http://".length);
	} else if (station_host.indexOf("https://")>=0) {
		station_host = station_host.substr("https://".length);
	}
	
	if (station_host.indexOf("/")>0 && station_host.indexOf(":")>0) { 
		station_port_end = station_host.indexOf("/")-station_host.indexOf(":")-1; 
		station_path = station_host.substr(station_host.indexOf("/"));
	} else if (station_host.indexOf("/")<0 && station_host.indexOf(":")>0) {
		station_port_end = station_host.length-station_host.indexOf(":")-1; 
		station_path = "/";
 	} else { 
		station_port_end = station_host.length-station_host.indexOf(":")-1; 
	}
	
	if (station_host.indexOf(":")>=0) {
		station_port = station_host.substr(station_host.indexOf(":")+1,station_port_end);
		station_host = station_host.substr(0,station_host.indexOf(":"));
	} else if (station_host.indexOf("/")>=0) {
		station_path = station_host.substr(station_host.indexOf("/"));
		station_host = station_host.substr(0,station_host.indexOf("/"));
	}
	
	loggr.log(" > Host: "+ station_host);
	loggr.log(" > Port: "+ station_port);
	loggr.log(" > Path: "+ station_path);
	
	return {"host":station_host,"port":station_port,"path":station_path};
	
}

// Test station url playable

site.chedit.testStationPlayable = function(station_url,cb,cberr) {
	
	loggr.log("site.chedit.testStationPlayable()");
	
	if (site.chedit.isTestingPlayable) { return; }
	site.chedit.isTestingPlayable = true;
	
	// -> Check if station actually works...
	
	site.ui.showloading();
	loggr.log(" > "+ station_url);
	
	var mediaPlayer = new Media(station_url,
		function() {
			// Do nothing..
		},
		function(error) {
			if (!site.chedit.isTestingPlayable) { return; }
			loggr.warn(" > Station is not working");
			loggr.log(" > Error: "+ site.mp.getErrorByCode(error.code));
			site.chedit.isTestingPlayable = false;
			mediaPlayer.stop();
			mediaPlayer.release();
			if (site.chedit.station_test_timeout) { clearTimeout(site.chedit.station_test_timeout); }
			setTimeout(function() { if (cberr) { cberr(); } },1);
		},
		function(status) {
			loggr.log(" > Status: "+ status);
			switch (status) {
				
				case Media.MEDIA_RUNNING:
				
					if (site.chedit.station_test_timeout) { clearTimeout(site.chedit.station_test_timeout); }
				
					mediaPlayer.stop();
					mediaPlayer.release();
	
					// -> Gogo
					
					site.chedit.changesHaveBeenMade = true;
					
					setTimeout(function() { if (cb) { cb(); } },1);
					
					site.chedit.isTestingPlayable = false;
					
			}
		}
	);
	
	mediaPlayer.play();

	if (site.chedit.station_test_timeout) { clearTimeout(site.chedit.station_test_timeout); }
	site.chedit.station_test_timeout = setTimeout(function(){
		loggr.warn(" > Station is not working");
		loggr.log(" > Timed out");
		site.chedit.isTestingPlayable = false;
		mediaPlayer.stop();
		mediaPlayer.release();
		setTimeout(function() { if (cberr) { cberr(); } },1);
	},10000);
	
}















