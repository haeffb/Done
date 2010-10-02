//	************************************************************
//
//						DONE! for Toodledo
//
// *************************************************************
//					Copyright 2010 Brian A Haeffner
// *************************************************************

// Setup namespace for Global Variables
MyAPP = {};
MyAPP.appName = Mojo.appInfo.title;
MyAPP.appId = Mojo.appInfo.id;
MyAPP.appSlogan = $L("Get it Done!");

// Saved from Toodledo Get Account Info
MyAPP.account = {
	userid: "", 
	alias: "", 
	pro: 0, 
	dateformat: 0, 
	timezone: -2, 
	hidemonths: 6, 
	hotlistpriority: 3, 
	hotlistduedate: 7, 
	lastaddedit: 0, 
	lastdelete: 0, 
	lastfolderedit: 0, 
	lastcontextedit: 0, 
	lastgoaledit: 0, 
	lastnotebookedit: 0
};

// Save timestamps for local edits to tasks, etc.
MyAPP.local = {
	lastaddedit: 0, 
	lastdelete: 0, 
	lastfolderedit: 0, 
	lastcontextedit: 0, 
	lastgoaledit: 0, 
	lastnotebookedit: 0,
	lastservertaskmod: 0,
	firstsync: true
};

MyAPP.prefs = {
	key: "",
	email: "none",
	defaultStatus: 0,
	defaultPriority: 0,
	defaultFolder: 0,
	defaultContext: 0,
	defaultGoal: 0,
	defaultDueDate: 0,
	defaultStartDate: 0,
	defaultRepeat: 0,
	defaultStar: 0,
	useCurrent: false,
	repeatFromCompleted: false,
	showFolderAndContext: false,
	showDueDate: true,
	showNote: false,
	showPriority: false,
	showCompleted: false,
	showDeferred: true,
	showFutureTasks: true,
	showNegPriority: true,
	showList: 'all',
	showFilter: 'all',
	wrapTitle: true,
	allowRotate: false,
	showStar: true,
	lastSync: 0,
	syncOnStart: false,
	syncOnQuit: false,
	syncInterval: 30,  // 30 minutes for auto-sync
	syncTimerId: '',
	syncWifiOnly: false,
	localWins: false, // if tasks edited on web & device
	notifications: false,
	notifyTime: 0,
	notifyAlarm: false,
	notifyDaily: false,
	showSnooze: false,
	snoozeTime: 60, //minutes for snoozing due/start times
	indentSubtasks: false,
	color: 1 // light yellow
};

MyAPP.fields = {
	notes: true,
	folder: true,
	context: true,
	goal: true,
	tags: true,
	priority: true,
	duedate: true,
	duetime: true,
	startdate: true, 
	starttime: true,
	status: true,
	repeat: true,
	repeatfrom: true,
	reminder: true,
	star: true,
	length: true
};

MyAPP.server = {
	"unixtime": 0, 
	"date": "", 
	"serveroffset": 0, 
	"tokenexpires": 0
};

/*
MyAPP.colors = [
	{value: 0, label: $L("White"), color: "#FFFFFF"},
	{value: 1, label: $L("Yellow"), color: "#EDE79A"},
	{value: 2, label: $L("Pink"), color: "#FFBAF6"},
	{value: 3, label: $L("Green"), color: "#D2F7D4"},
	{value: 4, label: $L("Blue"), color: "#D1E9FF"},
	{value: 5, label: $L("Orange"), color: "#FFE1C1"},
	{value: 6, label: $L("Purple"), color: "#FAC6FF"},
	{value: 7, label: $L("Gray"), color: "#DDDDDD"}
];

*/

// colors from: http://en.wikipedia.org/wiki/Web_colors
MyAPP.colors = [
	{value: 0, label: $L("White"), color: "#FFFFFF", secondaryIcon: "icon-color-white"},
	{value: 1, label: $L("Light Yellow"), color: "#FFFFE0", secondaryIcon: "icon-color-lightyellow"},
	{value: 2, label: $L("Cornsilk"), color: "#FFF8DC", secondaryIcon: "icon-color-cornsilk"},
	{value: 3, label: $L("Beige"), color: "#F5F5DC", secondaryIcon: "icon-color-beige"},
	{value: 4, label: $L("Khaki"), color: "#F0E68C", secondaryIcon: "icon-color-khaki"},
	{value: 5, label: $L("Honeydew"), color: "#F0FFF0", secondaryIcon: "icon-color-honeydew"},
	{value: 6, label: $L("Pale Green"), color: "#98FB98", secondaryIcon: "icon-color-palegreen"},
	{value: 7, label: $L("Seashell"), color: "#FFF5EE", secondaryIcon: "icon-color-seashell"},
	{value: 8, label: $L("Antique White"), color: "#FAEBD7", secondaryIcon: "icon-color-antiquewhite"},
	{value: 9, label: $L("Pink"), color: "#FFC0CB", secondaryIcon: "icon-color-pink"},
	{value: 10, label: $L("Wheat"), color: "#F5DEB3", secondaryIcon: "icon-color-wheat"},
	{value: 11, label: $L("Tan"), color: "#D2B48C", secondaryIcon: "icon-color-tan"},
	{value: 12, label: $L("Alice Blue"), color: "#F0F8FF", secondaryIcon: "icon-color-aliceblue"},
	{value: 13, label: $L("Lavender"), color: "#E6E6FA", secondaryIcon: "icon-color-lavender"},
	{value: 14, label: $L("Light Gray"), color: "#D3D3D3", secondaryIcon: "icon-color-lightgray"},
	{value: 15, label: $L("Light Blue"), color: "#ADD8E6", secondaryIcon: "icon-color-lightblue"},
	{value: 16, label: $L("Plum"), color: "#DDA0DD", secondaryIcon: "icon-color-plum"}
	
];


MyAPP.appMenuModel = {
	visible: true,
	items: [
		Mojo.Menu.editItem,
		{label: $L('Preferences & Accounts') + "...", command: 'doPrefs', disabled: false},
		{label: $L('Folders Contexts & Goals') + "...", command: 'doFolders', disabled: false},
		{label: $L('Custom Lists') + "...", command: 'doCustom', disabled: false},
		{label: $L('Show Notifications'), command: 'doNotify', disabled: false},
		Mojo.Menu.helpItem
	]
};

function AppAssistant(appController) {
	//save global reference to App Assistant
	//Mojo.Log.info("AppAssistant CONSTRUCTOR!");
	MyAPP.appAssistant = this;
	this.appController = appController;
}

AppAssistant.prototype.setup = function () {
	//Mojo.Log.info("AppAssistant setup()");
	
	//this.initDBandCookies();
};

// -------------------------------------------------------------------
//
// handleLaunch
//	- 
// 
// -------------------------------------------------------------------

AppAssistant.prototype.handleLaunch = function(launchParams){
	//Mojo.Log.info(" ********** App handleLaunch ***********");
	
	this.launchParams = launchParams;
	
	// Note: need to load prefs & other settings prior to launching app...
	this.initDBandCookies();
};

AppAssistant.prototype.handleLaunchAfter = function() {
	
	var launchParams = this.launchParams;
	
	var cardStageController, pushMainScene, stageArgs,
		dashboardStage, pushDashboard;
	cardStageController = this.controller.getStageController('mainStage');
	//Mojo.Log.info("controller is: " + cardStageController);
	//Mojo.Log.info(" Launch Parameters: %j", launchParams);
	if (launchParams.addtask) {
		launchParams.action = "addtask";
	}
	switch (launchParams.action) {
	case "sync":

		if (cardStageController) {
			if (cardStageController.activeScene().sceneName === 'intro') {
				cardStageController.delegateToSceneAssistant("startSync");
			}
			//NOTE: Sync will not fire if other card is open (prefs, help, etc)
		}
		else {
			var launchSync = this.launchDashSync.bind(this, launchParams);

			//Mojo.Log.info("Calling Connection Service Request from AppAssistant");
			this.connectRequest = new Mojo.Service.Request('palm://com.palm.connectionmanager', {
				method: 'getstatus',
				parameters: {},
				onSuccess: function(response){
					//Mojo.Log.info("Connection Response %j", response);
					if (response.isInternetConnectionAvailable) {
						if (!MyAPP.prefs.syncWifiOnly ||
						response.wifi.state === 'connected') {
							launchSync();
						}
						else {
							//Mojo.Log.info("No wifi - sync failed");
							this.controller.showBanner(Mojo.appInfo.title + " Unable to sync!", null, "sync_error");
						}
					}
					else {
						//Mojo.Log.info("No internet - sync failed");
						this.controller.showBanner(Mojo.appInfo.title + " Unable to sync!", null, "sync_error");	
					}
				}.bind(this),
				onFailure: function () {
					//Mojo.Log.info("Connection Status Service Request FAILED!");
				}
			});
		}
		if (MyAPP.prefs.syncOnInterval) {
			sync.setSyncTimer(MyAPP.prefs.syncInterval);
		}
		break;
	case 'notify':
		dashboardStage = this.controller.getStageProxy("dashnotify");
		if (dashboardStage) {
			//Mojo.Log.info("Notify Dashboard already running");
			dashboardStage.delegateToSceneAssistant("addNotify", launchParams.taskValue);
		}
		else {
			//Mojo.Log.info("No notify dashboardStage found.");
			//this.initDBandCookies();
			pushDashboard = function(stageController){
				stageController.pushScene({
					name: 'dashnotify'
				}, launchParams.taskValue);
			};
			this.controller.createStageWithCallback({
				name: "dashnotify",
				lightweight: true
			}, pushDashboard, 'dashboard');
		}
		notify.getNextDate();
		break;
	case 'openTask':
		//Mojo.Log.info("app assistant openTask with value: ", launchParams.taskValue);
		if (cardStageController) {
			// Application already running
			//Mojo.Log.info("Relaunch!");
			if (cardStageController.activeScene().sceneName === 'intro') {
				cardStageController.delegateToSceneAssistant("editTask", launchParams.taskValue);
			}
			else if (cardStageController.activeScene().sceneName === 'addtask') {
				cardStageController.delegateToSceneAssistant("loadNewTask", launchParams.taskValue);					
			}
			else {
				cardStageController.pushScene('addtask', launchParams.taskValue);
			}
			cardStageController.activate();
		}
		else {
			//Mojo.Log.info("Launch new intro stage!");
			//this.initDBandCookies();
			pushMainScene = function (stageController) {
				stageController.pushScene({
					name: 'intro',
					disableSceneScroller: true
				});
			};
			stageArgs = {
				name: 'mainStage',
				lightweight: true
			};
			this.controller.createStageWithCallback(stageArgs, pushMainScene.bind(this), 'card');
			cardStageController = this.controller.getStageProxy('mainStage');
			cardStageController.delegateToSceneAssistant("editTask", launchParams.taskValue);
		}
	
		break;
	case "addtask":
		//Mojo.Log.info("app assistant addTask with value: ", launchParams.taskValue);
		if (cardStageController) {
			// Application already running
			//Mojo.Log.info("Relaunch! to add task");
			if (cardStageController.activeScene().sceneName === 'intro') {
				cardStageController.delegateToSceneAssistant("listAdd", launchParams.addtask);
			}
			else if (cardStageController.activeScene().sceneName === 'addtask') {
				cardStageController.delegateToSceneAssistant("addTask", launchParams.addtask);					
			}
			else {
				var task = taskUtils.newTask(launchParams.addtask);
				dao.updateTask(task, function () {});
				cardStageController.pushScene('addtask', task.value);
			}
			cardStageController.activate();
		}
		else {
			//Mojo.Log.info("Launch new intro stage!");
			//this.initDBandCookies();
			pushMainScene = function (stageController) {
				stageController.pushScene({
					name: 'intro',
					disableSceneScroller: true
				});
			};
			stageArgs = {
				name: 'mainStage',
				lightweight: true
			};
			this.controller.createStageWithCallback(stageArgs, pushMainScene.bind(this), 'card');
			cardStageController = this.controller.getStageProxy('mainStage');
			cardStageController.delegateToSceneAssistant("listAdd", launchParams.addtask);
		}
	
		break;
	
	default:
		//FIRST LAUNCH or TAP on Icon when minimized
		if (cardStageController) {
			// Application already running
			//Mojo.Log.info("Relaunch!");
			cardStageController.activate();
		}
		else {
			//Mojo.Log.info("Launch new intro stage!");
			//this.initDBandCookies();
			pushMainScene = function (stageController) {
				stageController.pushScene({
					name: 'intro',
					disableSceneScroller: true
				});
			};
			stageArgs = {
				name: 'mainStage',
				lightweight: true
			};
			this.controller.createStageWithCallback(stageArgs, pushMainScene.bind(this), 'card');
		}
		break;
	}
	
};

AppAssistant.prototype.initDBandCookies = function () {
	//Mojo.Log.info("Initializing Database");
	// Initialize database
	dao.init();
	
	// Initialize toodledo api
	//Mojo.Log.info("Initializing API");
	api.init();
	
	this.getPrefs();
	
	//Mojo.Log.info("Initializing Cookies");
	// Initialize cookies
	//this.getPrefsCookie();
	//this.getAccountCookie();
	//this.getLocalCookie();
	this.getSyncLogCookie();
	//this.getFieldsCookie();
	
	//Mojo.Log.info("MyAPP.local %j", MyAPP.local);
	
};

AppAssistant.prototype.getPrefs = function () {
	//Mojo.Log.info("Getting Preferences");
	var options = {
		name: Mojo.appInfo.id + ".prefs",
		version: 0.4,
		displayName: Mojo.appInfo.title + " prefs DB"
	};
	
	MyAPP.prefsDb = new Mojo.Depot(options, this.gotPrefsDb.bind(this), this.dbFailure.bind(this));
};

AppAssistant.prototype.gotPrefsDb = function (event) {
	//Mojo.Log.info("Prefs DB Retrieved");
	MyAPP.prefsDb.get('prefs', this.gotPrefs.bind(this), this.dbFailure.bind(this));
};

AppAssistant.prototype.gotPrefs = function (args) {
	if (args) {
		//Mojo.Log.info("Preferences retrieved from Depot");

		//MyAPP.prefs = args;
		for (value in args) {
				MyAPP.prefs[value] = args[value];
				//Mojo.Log.info("Pref: ", value, args[value], MyAPP.prefs[value]);
		}
	}
	else {
		//Mojo.Log.info("PREFS LOAD FAILURE!!!");
		this.getPrefsCookie();
		MyAPP.prefsCookie.remove();
		MyAPP.prefsDb.add('prefs', MyAPP.prefs, 
			function () {},
			function (event) {
				//Mojo.Log.info("Prefs DB failure %j", event);
		});
	}
	//Mojo.Log.info("Prefs: %j", MyAPP.prefs);
	MyAPP.prefsDb.get('account', this.gotAccount.bind(this), this.dbFailure.bind(this));
};

AppAssistant.prototype.gotAccount = function (args) {
	if (args) {
		//Mojo.Log.info("Account retrieved from Depot");
		//MyAPP.account = args;
		for (value in args) {
				MyAPP.account[value] = args[value];
				//Mojo.Log.info("Account: ", value, args[value], MyAPP.account[value]);
		}
	}
	else {
		//Mojo.Log.info("ACCOUNT LOAD FAILURE!!!");
		this.getAccountCookie();
		MyAPP.accountCookie.remove();
		MyAPP.prefsDb.add('account', MyAPP.account, 
			function () {},
			function (event) {
				//Mojo.Log.info("Prefs DB failure %j", event);
		});
	}
	//Mojo.Log.info("Account: %j", MyAPP.account);
	MyAPP.prefsDb.get('local', this.gotLocal.bind(this), this.dbFailure.bind(this));
};

AppAssistant.prototype.gotLocal = function (args) {
	if (args) {
		//Mojo.Log.info("Local retrieved from Depot");
		//MyAPP.local = args;
		for (value in args) {
				MyAPP.local[value] = args[value];
				//Mojo.Log.info("Local: ", value, args[value], MyAPP.local[value]);
		}
	}
	else {
		//Mojo.Log.info("LOCAL LOAD FAILURE!!!");
		this.getLocalCookie();
		MyAPP.localCookie.remove();
		MyAPP.prefsDb.add('local', MyAPP.local, 
			function () {},
			function (event) {
				//Mojo.Log.info("Prefs DB failure %j", event);
		});
	}
	//Mojo.Log.info("Local: %j", MyAPP.local);
	MyAPP.prefsDb.get('fields', this.gotFields.bind(this), this.dbFailure.bind(this));
};

AppAssistant.prototype.gotFields = function (args) {
	if (args) {
		//Mojo.Log.info("Fields retrieved from Depot");
		//MyAPP.fields = args;
		for (value in args) {
				MyAPP.fields[value] = args[value];
				//Mojo.Log.info("Pref: ", value, args[value], MyAPP.fields[value]);
		}
	}
	else {
		//Mojo.Log.info("FIELDS LOAD FAILURE!!!");
		this.getFieldsCookie();
		MyAPP.fieldsCookie.remove();
		MyAPP.prefsDb.add('fields', MyAPP.fields, 
			function () {},
			function (event) {
				//Mojo.Log.info("Prefs DB failure %j", event);
		});
	}
	//Mojo.Log.info("Fields: %j", MyAPP.fields);
	this.handleLaunchAfter();
};

AppAssistant.prototype.dbFailure = function (event) {
	//Mojo.Log.info("Prefs DB failure %j", event);
};

AppAssistant.prototype.launchDashSync = function (launchParams) {
/*
		dashboardStage = this.controller.getStageController("dashsync");
		if (dashboardStage) {
			//Mojo.Log.info("Sync Dashboard already running");
			dashboardStage.delegateToSceneAssistant("displayDashboard", launchParams.dashInfo);
		}
		else {
			//Mojo.Log.info("No Sync dashboardStage found.");
			//this.initDBandCookies();
			pushDashboard = function(stageController){
				stageController.pushScene('dashsync', launchParams.dashInfo);
			};
			this.controller.createStageWithCallback({
				name: "dashsync",
				lightweight: true
			}, pushDashboard, 'dashboard');
		}

*/		
	sync.initSync(this.finishedSync.bind(this));
};

AppAssistant.prototype.finishedSync = function (response) {
	//Mojo.Log.info("Sync Finished! %j", response);
};

AppAssistant.prototype.handleCommand = function (event) {
	if (event.type === Mojo.Event.commandEnable) {
		switch (event.command) {
		case Mojo.Menu.helpCmd:
			event.stopPropagation();
			break;
		}
	}
	if (event.type === Mojo.Event.command) {
		switch (event.command) {
/*
		case 'doPurge':
			this.controller.getActiveStageController().pushScene('purge');
			break;

*/		case Mojo.Menu.helpCmd:
			this.controller.getActiveStageController().pushScene('support');
			break;
		case 'doNotify':
			// update or show Notifications
			notify.updateNotifications(true);
			break;
		}
				
	}
};

AppAssistant.prototype.deactivate = function (event) {
	if (this.connectRequest) {
		//Mojo.Log.info("Deleting connection request object");
		delete this.connectRequest;
	}
};

// ********************************************************
// 	COOKIES
// ********************************************************
AppAssistant.prototype.getPrefsCookie = function () {
	//Mojo.Log.info("Get Cookie!");
	MyAPP.prefsCookie = new Mojo.Model.Cookie(MyAPP.appName + "prefs");
	var args = MyAPP.prefsCookie.get(), clearCookie = false;
	if (args) {
		//MyAPP.prefs = args;
		for (value in args) {
			//fix for stored password
			if (value === 'password') {
				//Mojo.Log.info("clearing password!");
				MyAPP.prefs.MD5password = MD5(args[value]);
				clearCookie = true;
			}
			else {
				MyAPP.prefs[value] = args[value];
				//Mojo.Log.info("Pref: ", value, args[value], MyAPP.prefs[value]);

			}
		}
	}
	else {
		//Mojo.Log.info("PREFS COOKIE LOAD FAILURE!!!");
	}
	if (clearCookie) {
		MyAPP.prefsCookie.remove();
		this.putPrefsCookie();
	}
	//Mojo.Log.info("Preferences: %j", MyAPP.prefs);
};

AppAssistant.prototype.putPrefsCookie = function () {
	//Mojo.Log.info("Put Cookie!");
	var args = MyAPP.prefs;
	MyAPP.prefsCookie.put(args);
	
};

AppAssistant.prototype.getAccountCookie = function () {
	//Mojo.Log.info("Get Cookie!");
	MyAPP.accountCookie = new Mojo.Model.Cookie(MyAPP.appName + "account");
	var args = MyAPP.accountCookie.get();
	if (args) {
		for (value in args) {
			MyAPP.account[value] = args[value];
			//Mojo.Log.info("Account: ", value, args[value], MyAPP.account[value]);
		}
	}
	else {
		//Mojo.Log.info("ACCOUNT COOKIE LOAD FAILURE!!!");
	}
	//Mojo.Log.info("Account info: %j", MyAPP.account);
};

AppAssistant.prototype.getLocalCookie = function () {
	//Mojo.Log.info("Get Cookie!");
	MyAPP.localCookie = new Mojo.Model.Cookie(MyAPP.appName + "local");
	var args = MyAPP.localCookie.get();
	if (args) {
		for (value in args) {
			MyAPP.local[value] = args[value];
			//Mojo.Log.info("Pref: ", value, args[value], MyAPP.local[value]);
		}
	}
	else {
		//Mojo.Log.info("LOCAL COOKIE LOAD FAILURE!!!");
	}
	//Mojo.Log.info("Local info: %j", MyAPP.local);
};

AppAssistant.prototype.getFieldsCookie = function () {
	//Mojo.Log.info("Get Fields Cookie!");
	MyAPP.fieldsCookie = new Mojo.Model.Cookie(MyAPP.appName + "fields");
	var args = MyAPP.fieldsCookie.get();
	if (args) {
		for (value in args) {
			MyAPP.fields[value] = args[value];
			//Mojo.Log.info("Pref: ", value, args[value], MyAPP.local[value]);
		}
	}
	else {
		//Mojo.Log.info("FIELDS COOKIE LOAD FAILURE!!!");
	}
	//Mojo.Log.info("Local info: %j", MyAPP.local);
};

AppAssistant.prototype.getSyncLogCookie = function () {
	//Mojo.Log.info("Get Cookie!");
	MyAPP.syncLogCookie = new Mojo.Model.Cookie(MyAPP.appName + "syncLog");
	var args = MyAPP.syncLogCookie.get();
/*
	if (args) {
		for (value in args) {
			MyAPP.local[value] = args[value];
			//Mojo.Log.info("Pref: ", value, args[value], MyAPP.local[value]);
		}
	}

*/	//Mojo.Log.info("Local info: %j", MyAPP.local);
};
