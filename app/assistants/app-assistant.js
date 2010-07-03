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
	pro: 1, 
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
	lastservertaskmod: 0
};

MyAPP.prefs = {
	key: "",
	email: "none",
	password: "",
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
	showDeferred: false,
	showFutureTasks: false,
	showNegPriority: false,
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
	notifyAlarm: false
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
	star: true
};

MyAPP.server = {
	"unixtime": 0, 
	"date": "", 
	"serveroffset": 0, 
	"tokenexpires": 0
};

MyAPP.appMenuModel = {
	visible: true,
	items: [
		Mojo.Menu.editItem,
		{label: $L('Preferences & Accounts') + "...", command: 'doPrefs', disabled: false},
		{label: $L('Folders Contexts & Goals') + "...", command: 'doFolders', disabled: false},
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
	
	this.initDBandCookies();
};

// -------------------------------------------------------------------
//
// handleLaunch
//	- 
// 
// -------------------------------------------------------------------

AppAssistant.prototype.handleLaunch = function (launchParams) {
	//Mojo.Log.info(" ********** App handleLaunch ***********");
	
	var cardStageController, pushMainScene, stageArgs,
		dashboardStage, pushDashboard;
	cardStageController = this.controller.getStageController('mainStage');
	//Mojo.Log.info("controller is: " + cardStageController);
	if (!launchParams) {
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
	}
	else {
		Mojo.Log.info(" Launch Parameters: %j", launchParams);
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
						//Mojo.Log.info("Response %j", response);
						if (response.isInternetConnectionAvailable) {
							if (!MyAPP.prefs.syncWifiOnly ||
							response.wifi.state === 'connected') {
								launchSync();
							}
						}
					},
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
				dashboardStage.delegateToSceneAssistant("addNotify");
			}
			else {
				//Mojo.Log.info("No notify dashboardStage found.");
				//this.initDBandCookies();
				pushDashboard = function(stageController){
					stageController.pushScene('dashnotify');
				};
				this.controller.createStageWithCallback({
					name: "dashnotify",
					lightweight: true
				}, pushDashboard, 'dashboard');
			}
			notify.getNextDate();
			break;
		case 'openTask':
			//Mojo.Log.info("app assitant openTask with value: ", launchParams.taskValue);
			if (cardStageController) {
				// Application already running
				//Mojo.Log.info("Relaunch!");
				if (cardStageController.activeScene().sceneName === 'intro') {
					cardStageController.delegateToSceneAssistant("editTask", launchParams.taskValue);
				}
				else if (cardStageController.activeScene().sceneName === 'addtask') {
					cardStageController.delegateToSceneAssistant("loadNewTask", launchParams.taskValue);					
				}

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
		default:
			break;
		}
	}
	
};

AppAssistant.prototype.initDBandCookies = function () {
	// Initialize database
	dao.init();
	
	// Initialize cookies
	this.getPrefsCookie();
	this.getAccountCookie();
	this.getLocalCookie();
	this.getSyncLogCookie();
	this.getFieldsCookie();
	
	// Initialize toodledo api
	api.init();
};

AppAssistant.prototype.launchDashSync = function (launchParams) {
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
	var args = MyAPP.prefsCookie.get();
	if (args) {
		//MyAPP.prefs = args;
		for (value in args) {
			MyAPP.prefs[value] = args[value];
			//Mojo.Log.info("Pref: ", value, args[value], MyAPP.prefs[value]);
		}
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
