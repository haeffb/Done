function PreferencesAssistant(folders, contexts) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

	this.folders = folders;
	//this.folders.push({id: 0, label: "No Folder", value: 0});
	this.contexts = contexts;
	//this.contexts.push({id: 0, label: "No Context", value: 0});
}

PreferencesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.controller.get('prefsHeader').innerHTML = MyAPP.appName + " " + $L("Preferences");
	this.controller.get('AccountId').innerHTML = $L("Email:") + " " + MyAPP.prefs.email;
	this.controller.get('taskOptionsTitle').innerHTML = $L("Default Task Options");
	this.controller.get('accountOptionsTitle').innerHTML = $L("Account Settings");
	this.controller.get('appOptionsTitle').innerHTML = $L("Display Settings");
	this.controller.get('syncOptionsTitle').innerHTML = $L("Sync Settings");
	this.controller.get('notificationsOptionsTitle').innerHTML = $L("Notification Settings");
	this.controller.get('filterOptionsTitle').innerHTML = $L("Filter Settings");
	this.controller.get('repeatFromLabel').innerHTML = $L("Repeat From");

	this.controller.get('accountOptionsTitle').innerHTML = $L("Account Settings");
	this.controller.get('folderOptionsTitle').innerHTML = $L("Configuration Settings");

	this.controller.setupWidget("EditAccountButtonId", 
		this.accountButtonAttributes = {}, 
		this.accountButtonModel = {
			buttonLabel : $L('Edit Account Settings'),        
			buttonClass : '',        
			disabled : false        
		});
		
	this.controller.setupWidget("EditFoldersButtonId", 
		this.folderButtonAttributes = {}, 
		this.folderButtonModel = {
			buttonLabel : $L('Edit Folders/Contexts/Goals'),        
			buttonClass : '',        
			disabled : false        
		});
		
	this.controller.setupWidget("FieldConfigButtonId", 
		this.folderButtonAttributes = {}, 
		this.folderButtonModel = {
			buttonLabel : $L('Field Configuration'),        
			buttonClass : '',        
			disabled : false        
		});
		
		
	// Add Folder Selector List
	this.controller.setupWidget("FolderSelectorId",
        this.folderAttributes = {
			label: $L("Folder")
		},
		this.folderModel = {
			choices: []
			//value: MyAPP.prefs.defaultFolder
		}
    );

	// Add Context Selector List
	this.controller.setupWidget("ContextSelectorId",
        this.contextAttributes = {
			label: $L("Context")
			},
		this.contextModel = {
			choices: []
			//value: MyAPP.prefs.defaultContext
		}
    );
	
	// Add Goal Selector List
	this.controller.setupWidget("GoalSelectorId",
        this.goalAttributes = {
			label: $L("Goal")
			},
		this.goalModel = {
			choices: []
			//value: MyAPP.prefs.defaultGoal
		}
    );
	
/*
	// Add Hotlist Priority Selector List
	this.controller.setupWidget("HotlistPriorityId",
        this.hotlistPriorityAttributes = {
			label: $L("Min Priority")
			},
        this.hotlistPriorityModel = {
			choices: [
                {label: $L("Negative"), value: "-1"},
                {label: $L("0-Low"), value: 0},
                {label: $L("1-Medium"), value: 1},
                {label: $L("2-High"), value: 2},
                {label: $L("3-Top"), value: 3},
				{label: $L("No Priority"), value: 4}
                ],
        	value: MyAPP.prefs.hotlistPriority,
        	disabled: false
    });

	// Add Hotlist DueDate within Picker
	this.controller.setupWidget("HotlistDueDaysId",
		this.hotlistDueDaysAttributes = {
			label: $L("Due within (days)"),
			min: 0,
			max: 28,
			modelProperty: 'value'
			//labelPlacement: Mojo.Widget.labelPlacementRight,
			//focus: false
		},
		this.hotlistDueDaysModel = {
			value: MyAPP.prefs.hotlistDaysDue
			//value:7
		}
	);

*/
	// Add Priority Selector List
	this.controller.setupWidget("PrioritySelectorId",
        this.priorityAttributes = {
			label: $L("Priority")
			},
        this.priorityModel = {
			//choices: this.toodledo.priorityChoices,
			choices: [
                {label: $L("No Priority"), value: "-1"},
                {label: $L("0-Low"), value: 0},
                {label: $L("1-Medium"), value: 1},
                {label: $L("2-High"), value: 2},
                {label: $L("3-Top"), value: 3}
                ],
        	value: MyAPP.prefs.defaultPriority,
        	disabled: false
    });

	// Add Status Selector List
	this.controller.setupWidget("StatusSelectorId",
        this.statusAttributes = {
			label: $L("Status"),            
			choices: [
                {label: $L("No Status"), value: "0"},
                {label: $L("Next Action"), value: "1"},
                {label: $L("Active"), value: "2"},
                {label: $L("Planning"), value: "3"},
                {label: $L("Delegated"), value: "4"},
                {label: $L("Waiting"), value: "5"},
                {label: $L("Hold"), value: "6"},
                {label: $L("Postponed"), value: "7"},
                {label: $L("Someday"), value: "8"},
                {label: $L("Canceled"), value: "9"},
                {label: $L("Reference"), value: "10"}
                ]
			},
        this.statusModel = {
        value: MyAPP.prefs.defaultStatus,
        disabled: false
    });
	
	// Add Repeat Selector List
	this.controller.setupWidget("RepeatSelectorId",
        this.repeatAttributes = {
			label: $L("Repeat"),            
			choices: [
                {label: $L("No Repeat"), value: "0"},
                {label: $L("Weekly"), value: "1"},
                {label: $L("Monthly"), value: "2"},
                {label: $L("Yearly"), value: "3"},
                {label: $L("Daily"), value: "4"},
                {label: $L("Biweekly"), value: "5"},
                {label: $L("Bimonthly"), value: "6"},
                {label: $L("Semiannually"), value: "7"},
                {label: $L("Quarterly"), value: "8"},
                {label: $L("With Parent"), value: "9"}
                ]
			},
        this.repeatModel = {
        value: MyAPP.prefs.defaultRepeat,
        disabled: false
    });
	
	// Add DueDate Selector List
	this.controller.setupWidget("DueDateSelectorId",
        this.duedateAttributes = {
			label: $L("Due Date"),            
			choices: [
                {label: $L("No Due Date"), value: "0"},
				{label: $L("Today"), value: "1"},
				{label: $L("Tomorrow"), value: "2"},
				{label: $L("In One Week"), value: "3"},
				{label: $L("In One Month"), value: "4"},
				{label: $L("In One Year"), value: "5"}
                ]
			},
        this.dueDateModel = {
        value: MyAPP.prefs.defaultDueDate,
        disabled: false
    });
	
	// Add StartDate Selector List
	this.controller.setupWidget("StartDateSelectorId",
        this.startdateAttributes = {
			label: $L("Start Date"),            
			choices: [
                {label: $L("No Start Date"), value: "0"},
				{label: $L("Today"), value: "1"},
				{label: $L("Tomorrow"), value: "2"},
				{label: $L("In One Week"), value: "3"},
				{label: $L("In One Month"), value: "4"},
				{label: $L("In One Year"), value: "5"}
                ]
			},
        this.startDateModel = {
        value: MyAPP.prefs.defaultStartDate,
        disabled: false
    });

	// Add Repeat From toggle button
	this.controller.setupWidget('RepeatFromToggleId',
		this.repeatFromAttributes = {
			trueLabel: $L('Completed'),
			falseLabel: $L('Due Date')
		},
		this.repeatFromModel = {
			value: MyAPP.prefs.repeatFromCompleted,
			disabled: false
		}
	);

	this.toggleAttributes = {
		trueLabel: $L('Yes'),
		falseLabel: $L('No')
	};

	// Add Background Color Selector List
	this.controller.setupWidget("BGColorSelectorId",
        this.bgColorAttributes = {
			label: $L("Color")
		},
		this.bgColorModel = {
			choices: MyAPP.colors,
			value: MyAPP.prefs.color
		}
    );


	// Add Wrap title toggle
	this.controller.setupWidget('wrapTitleToggleId',
		this.toggleAttributes,
		this.wrapTitleModel = {
			value: MyAPP.prefs.wrapTitle,
			disabled: false			
		});
	this.controller.get('wrapTitleLabel').innerHTML = $L("Wrap Title");

	// Add Show Star toggle
	this.controller.setupWidget('showStarToggleId',
		this.toggleAttributes,
		this.showStarModel = {
			value: MyAPP.prefs.showStar,
			disabled: false			
		});
	this.controller.get('showStarLabel').innerHTML = $L("Show Star");

	// Add Show Folder & Context toggle
	this.controller.setupWidget('showFolderToggleId',
		this.toggleAttributes,
		this.showFolderModel = {
			value: MyAPP.prefs.showFolderAndContext,
			disabled: false			
		});
	this.controller.get('showFolderLabel').innerHTML = $L("Show Folder/Context");
	
	// Add Show Tags toggle
	this.controller.setupWidget('showTagsToggleId',
		this.toggleAttributes,
		this.showTagsModel = {
			value: MyAPP.prefs.showTags,
			disabled: false			
		});
	this.controller.get('showTagsLabel').innerHTML = $L("Show Tags");
	
	// Add Indent Subtasks toggle
	this.controller.setupWidget('indentSubtasksToggleId',
		this.toggleAttributes,
		this.indentSubtasksModel = {
			value: MyAPP.prefs.indentSubtasks,
			disabled: false			
		});
	this.controller.get('indentSubtasksLabel').innerHTML = $L("Indent Subtasks");
	
	// Add Show Notes toggle
	this.controller.setupWidget('showNotesToggleId',
		this.toggleAttributes,
		this.showNotesModel = {
			value: MyAPP.prefs.showNotes,
			disabled: false			
		});
	this.controller.get('showNotesLabel').innerHTML = $L("Show Notes");
	
	// Add Show Priority toggle
	this.controller.setupWidget('showPriorityToggleId',
		this.toggleAttributes,
		this.showPriorityModel = {
			value: MyAPP.prefs.showPriority,
			disabled: false			
		});
	this.controller.get('showPriorityLabel').innerHTML = $L("Show Priority");

	// Add useCurrent Folder & Context toggle
	this.controller.setupWidget('useCurrentToggleId',
		this.toggleAttributes,
		this.useCurrentModel = {
			value: MyAPP.prefs.useCurrent,
			disabled: false			
		});
	this.controller.get('useCurrentLabel').innerHTML = $L("Use Folder/Context");

	// Add Show Completed toggle
	this.controller.setupWidget('showCompletedToggleId',
		this.toggleAttributes,
		this.showCompletedModel = {
			value: MyAPP.prefs.showCompleted,
			disabled: false			
		});
	this.controller.get('showCompletedLabel').innerHTML = $L("Hide Completed");

	// Add Show NegPriority toggle
	this.controller.setupWidget('showNegPriorityToggleId',
		this.toggleAttributes,
		this.showNegPriorityModel = {
			value: MyAPP.prefs.showNegPriority,
			disabled: false			
		});
	this.controller.get('showNegPriorityLabel').innerHTML = $L("Show (-1) Priority");

	// Add Show FutureTasks toggle
	this.controller.setupWidget('showFutureTasksToggleId',
		this.toggleAttributes,
		this.showFutureTasksModel = {
			value: MyAPP.prefs.showFutureTasks,
			disabled: false			
		});
	this.controller.get('showFutureTasksLabel').innerHTML = $L("Show Future Tasks");

	// Add Show Deferred toggle
	this.controller.setupWidget('showDeferredToggleId',
		this.toggleAttributes,
		this.showDeferredModel = {
			value: MyAPP.prefs.showDeferred,
			disabled: false			
		});
	this.controller.get('showDeferredLabel').innerHTML = $L("Show Deferred");


	// Add localWins toggle
	this.controller.setupWidget('localWinsToggleId',
		this.toggleAttributes,
		this.localWinsModel = {
			value: MyAPP.prefs.localWins,
			disabled: false			
		});
	this.controller.get('localWinsLabel').innerHTML = $L("Local wins on conflict");

	// Add syncOnStart toggle
	this.controller.setupWidget('syncOnStartToggleId',
		this.toggleAttributes,
		this.syncOnStartModel = {
			value: MyAPP.prefs.syncOnStart,
			disabled: false			
		});
	this.controller.get('syncOnStartLabel').innerHTML = $L("Sync at Launch");

	// Add syncOnQuit toggle
	this.controller.setupWidget('syncOnQuitToggleId',
		this.toggleAttributes,
		this.syncOnQuitModel = {
			value: MyAPP.prefs.syncOnQuit,
			disabled: false			
		});
	this.controller.get('syncOnQuitLabel').innerHTML = $L("Sync after Exit");

	// Add syncOnInterval toggle
	this.controller.setupWidget('syncOnIntervalToggleId',
		this.toggleAttributes,
		this.syncOnIntervalModel = {
			value: MyAPP.prefs.syncOnInterval,
			disabled: false			
		});
	this.controller.get('syncOnIntervalLabel').innerHTML = $L("Auto-Sync");

	// Add syncWifiOnly toggle
	this.controller.setupWidget('syncWifiOnlyToggleId',
		this.toggleAttributes,
		this.syncWifiOnlyModel = {
			value: MyAPP.prefs.syncWifiOnly,
			disabled: false			
		});
	this.controller.get('syncWifiOnlyLabel').innerHTML = $L("Sync only on Wifi");

	// Add Enable Notifications toggle
	this.controller.setupWidget('notificationsToggleId',
		this.toggleAttributes,
		this.notificationsModel = {
			value: MyAPP.prefs.notifications,
			disabled: false			
		});
	this.controller.get('notificationsLabel').innerHTML = $L("Enable Notifications");
	
	// Add Enable Daily Notifications toggle
	this.controller.setupWidget('notifyDailyToggleId',
		this.toggleAttributes,
		this.notifyDailyModel = {
			value: MyAPP.prefs.notifyDaily,
			disabled: false
		});
	this.controller.get('notifyDailyLabel').innerHTML = $L("Daily Notifications");
	
	// Notification time picker
	this.controller.setupWidget('notificationTime', 
	{
		label: " " //$L('Daily') + ":"
	}, this.notificationTimePickerModel = {
		time: new Date(MyAPP.prefs.notifyTime),
		disabled: false
	});
	
	// Add Notifications Alarm toggle
	this.controller.setupWidget('notifyAlarmToggleId',
		this.toggleAttributes,
		this.notifyAlarmModel = {
			value: MyAPP.prefs.notifyAlarm,
			disabled: false
		});
	this.controller.get('notifyAlarmLabel').innerHTML = $L("Alert Sound");
	
	// Display notify options (or not)
	this.toggleNotifyDisplay(MyAPP.prefs.notifications);

/*
	// Add Show Due Date & Due Time toggle
	this.controller.setupWidget('showDueDateToggleId',
		this.toggleAttributes,
		this.showDueDateModel = {
			value: MyAPP.prefs.showDueDate,
			disabled: false			
		});
	this.controller.get('showDueDateLabel').innerHTML = $L("Show Due Date/Time");

*/	
/*
	// Add allow Landscape toggle
	this.controller.setupWidget('allowRotateToggleId',
		this.allowRotateAttributes = {
			trueLabel: $L('Yes'),
			falseLabel: $L('No')
		},
		this.allowRotateModel = {
			value: MyAPP.prefs.allowRotate,
			disabled: false			
		});
	this.controller.get('allowRotateLabel').innerHTML = $L("Allow Landscape");

*/
	//	Setup app menu
	this.appMenuModel = {
		visible: true,
		items: [
			Mojo.Menu.editItem,
			{ label: $L("Preferences & Accounts") + "...", command: 'do-myPrefs', disabled: true },
	    	{ label: $L("Help") + "...", command: Mojo.Menu.helpCmd, disabled: false }
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);
	
	/* add event handlers to listen to events from widgets */
	this.editAccountHandler = this.editAccount.bind(this);
	this.controller.listen('EditAccountButtonId', Mojo.Event.tap, this.editAccountHandler);
	this.editFolderHandler = this.editFolder.bind(this);
	this.controller.listen('EditFoldersButtonId', Mojo.Event.tap, this.editFolderHandler);
	this.fieldConfigHandler = this.fieldConfig.bind(this);
	this.controller.listen('FieldConfigButtonId', Mojo.Event.tap, this.fieldConfigHandler);
	
	this.notificationsChangeHandler = this.notificationsChange.bind(this);
	this.controller.listen('notificationsToggleId', Mojo.Event.propertyChange, this.notificationsChangeHandler);
	this.controller.listen('notifyDailyToggleId', Mojo.Event.propertyChange, this.notificationsChangeHandler);

	this.controller.setInitialFocusedElement(null);

};

PreferencesAssistant.prototype.notificationsChange = function (event) {
	//debugObject(event.target, 'noFuncs');
	// Enable notifications toggled
	Mojo.Log.info("Notifications Change");
	MyAPP.prefs.notifications = this.notificationsModel.value;
	MyAPP.prefs.notifyDaily = this.notifyDailyModel.value;
	if (event.target.id && event.target.id === 'notificationsToggleId') {
		this.toggleNotifyDisplay(event.model.value);
	}

	if (!event.model.value && event.target.id && event.target.id === 'notificationsToggleId') {
		notify.clearNotification();
	}
	else {
		notify.getNextDate();
	}
};

PreferencesAssistant.prototype.toggleNotifyDisplay = function (event) {
	if (event) {
		this.controller.get('notifyDailyRow').show();
		this.controller.get('notifyTimePickerRow').show();
		this.controller.get('notifyAlarmRow').show();
		this.controller.get('notifyRow').removeClassName('single');
		this.controller.get('notifyRow').addClassName('first');
		
	}
	else {
		this.controller.get('notifyDailyRow').hide();
		this.controller.get('notifyTimePickerRow').hide();
		this.controller.get('notifyAlarmRow').hide();
		this.controller.get('notifyRow').removeClassName('first');
		this.controller.get('notifyRow').addClassName('single');
		
	}
};

PreferencesAssistant.prototype.editAccount = function (event) {
	//Mojo.Log.info('Going to accounts scene');
	this.controller.stageController.pushScene('accounts');
};
PreferencesAssistant.prototype.editFolder = function (event) {
	//Mojo.Log.info('Going to folders scene');
	this.controller.stageController.pushScene('folders');
};
PreferencesAssistant.prototype.fieldConfig = function (event) {
	//Mojo.Log.info('Going to fields scene');
	this.controller.stageController.pushScene('field-config');
};

PreferencesAssistant.prototype.aboutToActivate = function(callback) {
	this.activateCallback = callback;
	// get folders & contexts & goals for defaults
	dao.retrieveFolders(this.gotFoldersDb.bind(this));
	
};

PreferencesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	// update email in case returning from Account settings
	this.controller.get('AccountId').innerHTML = $L("Email:") + " " + MyAPP.prefs.email;
	
	// hide "indent subtasks" toggle for non-Pro accounts
	if (MyAPP.account.pro !== 1) {
		this.controller.get('indentSubtasksRow').hide();
	}
	
};

PreferencesAssistant.prototype.gotFoldersDb = function (response) {
	//Mojo.Log.info("Folders response is %j", response, response.length);
	this.folderModel.choices = response;
	this.folderModel.choices.push({id: 0, label: $L("No Folder"), value: 0});
	this.folderModel.value = MyAPP.prefs.defaultFolder;
	this.controller.modelChanged(this.folderModel);
	
	// Retrieve contexts
	dao.retrieveContexts(this.gotContextsDb.bind(this));
};

PreferencesAssistant.prototype.gotContextsDb = function (response) {
	//Mojo.Log.info("Contexts response is %j", response);
	this.contextModel.choices = response;
	this.contextModel.choices.push({id: 0, label: $L("No Context"), value: 0});
	this.contextModel.value = MyAPP.prefs.defaultContext;
	this.controller.modelChanged(this.contextModel);
	
	// Retrieve goals
	dao.retrieveGoals(this.gotGoalsDb.bind(this));
};

PreferencesAssistant.prototype.gotGoalsDb = function(response){
	//Mojo.Log.info("Goals response is %j", response);
	this.goalModel.choices = response;
	this.goalModel.choices.push({id: 0, label: $L("No Goal"), value: 0});
	this.goalModel.value = MyAPP.prefs.defaultGoal;
	this.controller.modelChanged(this.goalModel);
	
	this.activateCallback();
};

PreferencesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  
	// Get task option values
	MyAPP.prefs.defaultPriority = this.priorityModel.value;
	MyAPP.prefs.defaultFolder = this.folderModel.value;
	MyAPP.prefs.defaultRepeat = this.repeatModel.value;
	MyAPP.prefs.defaultStatus = this.statusModel.value;
	MyAPP.prefs.defaultDueDate = this.dueDateModel.value;
	MyAPP.prefs.defaultStartDate = this.startDateModel.value;
	MyAPP.prefs.defaultContext = this.contextModel.value;
	MyAPP.prefs.defaultGoal = this.goalModel.value;
	MyAPP.prefs.useCurrent = this.useCurrentModel.value;
	MyAPP.prefs.repeatFromCompleted = this.repeatFromModel.value;
	MyAPP.prefs.wrapTitle = this.wrapTitleModel.value;
	//MyAPP.prefs.allowRotate = this.allowRotateModel.value;
	MyAPP.prefs.showStar = this.showStarModel.value;
	MyAPP.prefs.showFolderAndContext = this.showFolderModel.value;
	MyAPP.prefs.showTags = this.showTagsModel.value;
	//MyAPP.prefs.showDueDate = this.showDueDateModel.value;
	MyAPP.prefs.showDeferred = this.showDeferredModel.value;
	MyAPP.prefs.showFutureTasks = this.showFutureTasksModel.value;
	MyAPP.prefs.showNegPriority = this.showNegPriorityModel.value;
	MyAPP.prefs.showCompleted = this.showCompletedModel.value;
	MyAPP.prefs.localWins = this.localWinsModel.value;
	MyAPP.prefs.syncOnStart = this.syncOnStartModel.value;
	MyAPP.prefs.syncOnQuit = this.syncOnQuitModel.value;
	MyAPP.prefs.syncOnInterval = this.syncOnIntervalModel.value;
	MyAPP.prefs.syncWifiOnly = this.syncWifiOnlyModel.value;
	MyAPP.prefs.notifications = this.notificationsModel.value;
	MyAPP.prefs.notifyTime = this.notificationTimePickerModel.time.getTime();
	MyAPP.prefs.notifyAlarm = this.notifyAlarmModel.value;
	MyAPP.prefs.notifyDaily = this.notifyDailyModel.value;
	MyAPP.prefs.showNotes = this.showNotesModel.value;
	MyAPP.prefs.showPriority = this.showPriorityModel.value;
	MyAPP.prefs.indentSubtasks = this.indentSubtasksModel.value;
	MyAPP.prefs.color = this.bgColorModel.value;
	
	//Mojo.Log.info("Leaving Prefs Scene with %j", MyAPP.prefs);
	//MyAPP.prefsCookie = new Mojo.Model.Cookie(MyAPP.appName + "prefs");
	//MyAPP.prefsCookie.put(MyAPP.prefs);
	MyAPP.prefsDb.add('prefs', MyAPP.prefs, 
		function () {},
		function (event) {
			Mojo.Log.info("Prefs DB failure %j", event);
	});
	
	// Set auto-syncing if selected
	if (MyAPP.prefs.syncOnInterval) {
		//Mojo.Log.info("Setting up Auto-Sync in", MyAPP.prefs.syncInterval, "minutes");
		sync.setSyncTimer(MyAPP.prefs.syncInterval);
	}
	else {
		//Mojo.Log.info("Clearing Auto-Sync Timer");
		sync.clearSyncTimer(MyAPP.prefs.syncTimerId);
	}
};

PreferencesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('EditAccountButtonId', Mojo.Event.tap, this.editAccountHandler);
	this.controller.stopListening('EditFoldersButtonId', Mojo.Event.tap, this.editFolderHandler);
	this.controller.stopListening('FieldConfigButtonId', Mojo.Event.tap, this.fieldConfigHandler);
	this.controller.stopListening('notificationsToggleId', Mojo.Event.propertyChange, this.notificationsChangeHandler);
	this.controller.stopListening('notifyDailyToggleId', Mojo.Event.propertyChange, this.notificationsChangeHandler);
};
