
// ---------------------------------------------
// BZZ

// ---> Compat

if (!console) { var console = {}; }
if (!console.log) { console.log = function(str) { }; }

// ---> Site

if (!site) { var site = {}; }

// ---------------------------------------------
// INSTALL

site.installer = {};

/*	
	NOTES: DOES IT NEED TO DO..?
	
	* Well, install stuff...
	* And maybe run an update...
	* And verrify if everything is installed correctly...
	
	1. WHAT DOES IT NEED TO INSTALL ?
	* Storage as specified in site.cfg.paths
	* Database? Do we have one?
	* Strings! YES! --> site.data.strings || TODO: No json/api for this
	
	2. WHAT NEEDS TO BE UPDATED ?
	* Radio stations?
	* Strings! YES! --> site.data.strings || TODO: No json/api for this
	* ...
	
	3. WHAT NEEDS TO BE VERIFIED ?
	* Well Oantinken had this problem with cookies getting lost ondestroy() 
	  or reboot or something... It LOOKS like this is fixed since I have no
	  such problem in apps like ScreenDoodle, ShortIt, etc.
	
	
*/

// ---> Data

site.installer.cfg = {}

site.installer.cfg.createfolders_folders = [
	site.cfg.paths.root,
	site.cfg.paths.json,
	site.cfg.paths.images,
	site.cfg.paths.logs,
	site.cfg.paths.other,
];
site.installer.cfg.downloadjson_files = [
	{"dest_path":"Icerrr/json","dest_name":"stations.json","query":"{\"get\":\"stations\"}"},
	{"dest_path":"Icerrr/json","dest_name":"data.strings.json","query":"{\"get\":\"stations\"}"},
	{"dest_path":"Icerrr/json","dest_name":"stations.json","query":"{\"get\":\"stations\"}"},
	{"dest_path":"Icerrr/json","dest_name":"data.strings.json","query":"{\"get\":\"stations\"}"},
	{"dest_path":"Icerrr/json","dest_name":"stations.json","query":"{\"get\":\"stations\"}"},
	{"dest_path":"Icerrr/json","dest_name":"data.strings.json","query":"{\"get\":\"stations\"}"},
	{}
];

// ---> Init

site.installer.init = function() {
	
	console.log("site.installer.init()");
	
	// Well let's start by showing some loading ui
	site.ui.gotosection("#install");
	
	// Clear (and prep) any vars
	site.installer.vars = {};
	
	// Initiate first step: create folders
	setTimeout(function(){site.installer.createfolders_init();},500);
	
}

// ---> Step 1 : create folders

site.installer.createfolders_init = function() {
	site.installer.logger("Create folders...");
	setTimeout(function(){site.installer.createfolders_next();},500);
}

site.installer.createfolders_next = function() {
	
	console.log("site.installer.createfolders_next()");
	
	// Check pathsNum
	if (!site.installer.vars.pathNum && site.installer.vars.pathNum!==0) { site.installer.vars.pathNum = -1;	}
	site.installer.vars.pathNum++;
	
	// Get current path
	currentpath = site.installer.cfg.createfolders_folders[site.installer.vars.pathNum];
	console.log(" > currentpath: "+ currentpath);
	
	// Createfolders finished?
	if (!currentpath) { 
		site.installer.logger("&nbsp;&gt; Done");
		site.installer.downloadjson_init();
		return; // <- important stuff happening here.
	}
	
	// Some output..
	site.installer.logger("&nbsp;&gt; "+ currentpath);
	
	// Do it!
	site.storage.createfolder(currentpath,site.installer.createfolders_cb,site.installer.createfolders_errcb);
	
	
}

site.installer.createfolders_cb = function(directoryEntry) {
	console.log("site.installer.createfolders_cb()");
	site.installer.logger(" OK",{use_br:false});
	site.installer.createfolders_next();
}

site.installer.createfolders_errcb = function(error) {
	console.log("site.installer.createfolders_errcb()");
	site.installer.logger(" ERR",{use_br:false,is_e:true});
	site.installer.logger("&nbsp;&gt; "+site.storage.getErrorType(error)+"",{is_e:true});
	// TODO: YES.. What now..
}

// ---> Step 2 : download json

// Downloadjson...

site.installer.downloadjson_init = function() {
	site.installer.logger("Download json...");
	setTimeout(function(){site.installer.downloadjson_next();},500);
}

site.installer.downloadjson_next = function() {
	
	console.log("site.installer.downloadjson_next()");
	
	// Check jsonNum
	if (!site.installer.vars.jsonNum && site.installer.vars.jsonNum!==0) { site.installer.vars.jsonNum = -1;	}
	site.installer.vars.jsonNum++;
	
	// Get current job
	currentjob = site.installer.cfg.downloadjson_files[site.installer.vars.jsonNum];
	console.log(" > currentjob: "+ currentjob.query);
	
	// downloadjson finished?
	if (!currentjob.query) { 
		site.installer.logger("&nbsp;&gt; Done");
		site.installer.finishup();
		return; // <- important stuff happening here.
	}
	
	// downloadjson finished?
	// TODO: what is this one doing here?
	if (currentjob.query=="{}") { 
		site.installer.logger("&nbsp;&gt; Done");
		site.installer.downloadjson_next();
		return; // <- important stuff happening here.
	}
		
	// Prep webapi exec
	var apiquerystr = currentjob.query;
	var apiaction = "get";
	
	// Some output..
	site.installer.logger("&nbsp;&gt; Download: "+ currentjob.dest_name);
	site.installer.logger("&nbsp;&gt;&gt; ?a="+ apiaction +"&amp;q="+ apiquerystr);
	
	// Do it!
	site.webapi.exec(apiaction,apiquerystr,site.installer.downloadjson_cb,site.installer.downloadjson_errcb);
	
	// tmp
	//site.installer.finishup();
	
}

site.installer.downloadjson_cb = function(res) {
	console.log("site.installer.downloadjson_cb(): "+ site.helpers.countObj(res["data"]));
	site.installer.logger(" OK",{use_br:false});
	site.datatemp = res; // TODO: look at this variable.. it's just sad
	site.installer.downloadjson_write();
}

site.installer.downloadjson_errcb = function(error) {
	console.log("site.installer.downloadjson_errcb()");
	site.installer.logger(" ERR",{use_br:false,is_e:true});
	site.installer.logger("&nbsp;&gt; "+error["message"]+"",{is_e:true});
	// TODO: YES.. What now..
}

// Downloadjson_write

site.installer.downloadjson_write = function() {
	
	console.log("site.installer.downloadjson_write()");
	
	// Check jsonNum
	if (!site.installer.vars.jsonNum && site.installer.vars.jsonNum!==0) { 
		// TODO: Error...
	}
	
	// Get current job
	currentjob = site.installer.cfg.downloadjson_files[site.installer.vars.jsonNum];
	console.log(" > currentjob: "+ currentjob.query);
	
	// Stuff
	var path = currentjob.dest_path;
	var filename = currentjob.dest_name;
	var data = JSON.stringify(site.datatemp["data"]);
	
	console.log(" > Path: "+ path);
	console.log(" > Filename: "+ filename);
	console.log(" > Data: "+ data);
	
	// Some output..
	site.installer.logger("&nbsp;&gt;&gt; Write: "+ path +"/"+ filename);
	
	// Do it
	site.storage.writefile(path,filename,data,site.installer.downloadjson_write_cb,site.installer.downloadjson_write_errcb);
	
}

site.installer.downloadjson_write_cb = function(evt) {
	console.log("site.installer.downloadjson_write_cb()");
	site.installer.logger(" OK",{use_br:false});
	//console.log(" > target: \n > "+site.helpers.arrToString(evt.target,0,"\n"));
	site.installer.downloadjson_next();
}

site.installer.downloadjson_write_errcb = function(error) {
	console.log("site.installer.downloadjson_write_errcb()");
	site.installer.logger(" ERR",{use_br:false,is_e:true});
	site.installer.logger("&nbsp;&gt; "+site.storage.getErrorType(error)+"",{is_e:true});
	// TODO: YES.. What now..
}



// ---> Step X : finish up

site.installer.finishup = function() {
	
	console.log("site.installer.finishup()");
	
	// TODO: set the damn cookie so install doesnt get re-fired :)
	
	site.installer.logger("Finish up...");
	site.installer.logger("&nbsp;&gt; Giving your device a short break...");
	
	setTimeout(function(){
		site.installer.logger("&nbsp;&gt; Ok let's do some hard work!..");
		setTimeout(function(){
			site.installer.logger(" OK",{use_br:false});
			site.installer.logger("&nbsp;&gt; Done");
			site.ui.showloading("Restarting...");
			setTimeout(function() {
				
				site.cookies.put("app_version",site.cfg.app_version);
				site.cookies.put("app_is_installed",1);
				window.location.reload(); // TODO: replace all 'window.location.reload();' with window.location.href=[current_host]/[path-to-file]
				
			},2500);
			//site.ui.gotosection("#home"); // TODO: no not go here, goto #firstlaunch
		},1000);
	},500);
		
	
}

// ---------------------------------------------
// UPDATE

// ---------------------------------------------
// VERIFY

// ---------------------------------------------
// LOGGER

site.installer.logger = function(msg,opts) {
	
	if (!opts) { opts = {}; }
	if (opts.use_br!==false) { opts.use_br = true; }
	if (opts.is_e!==true) { opts.is_e = false; }
	
	if (opts.is_e) { msg = "<span class='e'>"+msg+"</span>"; }
	if (opts.use_br) { msg = "<br>"+msg; }
	
	$("#install .log").append(msg);
	
	// TODO: doesn't work..
	$("#install .main").scrollTop( $("#install .main").height() );
	
	// hidden function: if 'e' set #exit
	if (opts.is_e) {
		site.vars.currentSection = "#exit";
	}
	
}



















