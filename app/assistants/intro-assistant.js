function IntroAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.foldersModel = {items: [{id: 0, label: $L('none')}]};
	  this.contextsModel = {items: [{id: 0, label: $L('none')}]};
	  this.goalsModel = {items: [{id: 0, label: $L('none')}]};
	  this.sortSpec = 'folder';
	  this.tasks = [];
	  // used to make sure the list is scrolled to top when changing List or Filter.
	  this.goTop = false;
}

IntroAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

/*
	this.controller.get("syncOutput").innerHTML = $L("Last Sync: ") + 
		(MyAPP.prefs.lastSync > 0) ? Mojo.Format.formatDate(new Date(MyAPP.prefs.lastSync), "medium") : "Not Synced!";

*/	this.controller.get("syncTaskOutput").innerHTML = MyAPP.syncLogCookie.get();
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	this.controller.setupWidget('taskListing', 
		{
			itemTemplate: 'intro/taskRowTemplate',
			listTemplate: 'intro/taskListTemplate',
			swipeToDelete: true,
			autoconfirmDelete: false,
			renderLimit: 30,  // had to increase to get drawers in list to work correctly
			dividerFunction: this.taskDivider.bind(this),
			dividerTemplate: 'intro/divider',
			filterFunction: this.filterFunction.bind(this),
			delay: 300,
			formatters: {
				duedate: this.formatDueDate.bind(this),
				duetime: this.formatDueTime.bind(this),
				folder: this.formatFolder.bind(this),
				context: this.formatContext.bind(this),
				star: this.formatStar.bind(this),
				note: this.formatNote.bind(this),
				hasnote: this.formatHasNote.bind(this),
				priority: this.formatPriority.bind(this),
				parent: this.formatParent.bind(this)
				},
			reorderable: false
		},
		//this.taskListModel = {items: []}
		//this.taskListModel = {items: [], disabled: false}
		this.taskListModel = {disabled: false}
	);
	this.controller.setInitialFocusedElement(this.controller.get('taskListing'));
	
	this.controller.setupWidget('taskCheck', {
		modelProperty: "done"
	});
	
	// Setup scrim and spinner to indicate activity while getting tasks
	this.controller.setupWidget ('Spinner', 
		this.spinnerAttributes = {
			spinnerSize: Mojo.Widget.spinnerLarge
		},
		this.spinnerModel = {
			spinning: false	
		}
	);
	this.controller.get('Scrim').hide();
	this.controller.get('syncTaskOutput').hide();
	
	//Setup scroller for task list (no scene scroller is being used)
	//this.controller.setupWidget('tasks_scroller', {mode: 'vertical'});


	this.filterChoices = [{value: 'all', label: "All"}];
	this.controller.setupWidget('showFilter', 
		{}, this.showFilterModel = {
			value: MyAPP.prefs.showFilter,
			choices: this.filterChoices
	});

	this.controller.setupWidget('showList', 
		{
			choices: [
			{
				secondaryIcon: 'done-icon-tasklist',
				label: $L('All Tasks'),
				value: 'all'
			}, 
			{
				secondaryIcon: 'done-icon-folder',
				label: $L('Folders'),
				value: 'folder'
			}, 
			{
				secondaryIcon: 'done-icon-home',
				label: $L('Contexts'),
				value: 'context'
			}, 
			{
				secondaryIcon: 'done-icon-schedule',
				label: $L('Due Date'),
				value: 'duedate'
			}, 
			{
				secondaryIcon: 'done-icon-priority',
				label: $L('Priority'),
				value: 'priority'
			},
			{
				secondaryIcon: 'done-icon-status',
				label: $L('Status'),
				value: 'status'
			},
			{
				secondaryIcon: 'done-icon-checkmark',
				label: $L('Completed'),
				value: 'completed'
			}
		]
		}, this.showListModel = {
			value: MyAPP.prefs.showList
		});
	// Setup command menu
	this.cmdMenuModel = {
		items: [
			{
				items: [
					{icon: 'new',command: 'doAdd'}
				]
			},
			{
				items: [
					{icon: 'refresh',command: 'doSync'}
				]
			}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.cmdMenuModel);
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, MyAPP.appMenuModel);
	
	/* add event handlers to listen to events from widgets */
	this.listTapHandler = this.listTap.bindAsEventListener(this);
	this.controller.listen('taskListing', Mojo.Event.listTap, this.listTapHandler);
	
	this.checkChangeHandler = this.checkChange.bindAsEventListener(this);
	this.controller.listen('taskListing', Mojo.Event.propertyChange, this.checkChangeHandler);
	
	this.listDeleteHandler = this.listDelete.bindAsEventListener(this);
	this.controller.listen('taskListing', Mojo.Event.listDelete, this.listDeleteHandler);

	this.filterListHandler = this.filterList.bindAsEventListener(this);
	this.controller.listen('taskListing', Mojo.Event.filter, this.filterListHandler);
		
	this.showFilterHandler = this.doFilter.bindAsEventListener(this);
	this.controller.listen('showFilter', Mojo.Event.propertyChange, this.showFilterHandler);
	this.showListHandler = this.doList.bindAsEventListener(this);
	this.controller.listen('showList', Mojo.Event.propertyChange, this.showListHandler);

    this.onKeyDownHandler = this.onKeyDown.bind(this);
    Mojo.Event.listen(this.controller.document, "keydown", this.onKeyDownHandler, true);
	
	this.toggleSyncOutputHandler = this.toggleSyncOutput.bindAsEventListener(this);
	this.controller.listen('syncTaskOutput', Mojo.Event.tap, this.toggleSyncOutputHandler);
	this.showSyncOutputHandler = this.showSyncOutput.bindAsEventListener(this);
	this.controller.listen('syncOutput', Mojo.Event.tap, this.showSyncOutputHandler);	
	
	if (MyAPP.prefs.syncOnStart) {
		this.startSync();
	}
	
	// Set default filterString for title of added task
	this.filterString = '';
};


IntroAssistant.prototype.toggleSyncOutput = function (event) {
	this.controller.get('syncTaskOutput').hide();
};

IntroAssistant.prototype.showSyncOutput = function (event) {
	this.controller.get('syncTaskOutput').show();
};

IntroAssistant.prototype.onKeyDown = function(event) {
	//debugObject(event, 'noFuncs');
	
	//
	// note: to capture gesture + keycode, use keyup event:
	// if (event.keycode === keycode && event.metakey === true)
	//
	
    if (Mojo.Char.isEnterKey(event.keyCode) && this.controller.stageController.activeScene().sceneName === 'intro') {
		//Mojo.Log.info("Enter was pressed!", this.filterString);
		var myString = '';
		myString = this.filterString.substr(0,1).toUpperCase() + this.filterString.substr(1,this.filterString.length);
		this.controller.get('taskListing').mojo.close();
		this.listAdd(myString);
		//this.filterString = '';
        // entered is not set!
    }
};

IntroAssistant.prototype.filterList = function (event) {
	//Mojo.Log.info("FILTER!!! ", event.filterString);
	this.filterString = event.filterString;
};


IntroAssistant.prototype.filterFunction = function (filterString, listWidget, offset, count) {
	this.listOffset = offset;
	//Mojo.Log.info("FilterFunction", listWidget.id, filterString, offset, count);
	//Mojo.Log.info("Original length", this.tasks.length);
	var i, s;
	this.someTasks = [];
	if (filterString !== '') {
		var len = this.tasks.length;
		for (i = 0; i < len; i++) {
			s = this.tasks[i];
			if (s.title.toUpperCase().indexOf(filterString.toUpperCase()) >=0) {
				//Mojo.Log.info("Found string in subject", i);
				this.someTasks.push(s);
			}
			else if (s.note.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in note", i);
				this.someTasks.push(s);
			}
			else if (this.foldersModel.items[s.folder].label.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in location", i);
				this.someTasks.push(s);
			}
			else if (this.contextsModel.items[s.context].label.toUpperCase().indexOf(filterString.toUpperCase())>=0){
				//Mojo.Log.info("Found string in location", i);
				this.someTasks.push(s);
			}
		}
	}
	else {
		//Mojo.Log.info("No filter string");
		this.someTasks = this.tasks;
	}
	//Mojo.Log.info("SomeTasks length", this.someTasks.length);
	
	// cut down list results to just the window asked for by the widget
	var cursor = 0;
	var subset = [];
	var totalSubsetSize = 0;
	while (true) {
		if (cursor >= this.someTasks.length) {
			break;
		}
		if (subset.length < count && totalSubsetSize >= offset) {
			subset.push(this.someTasks[cursor]);
		}
		totalSubsetSize ++;
		cursor ++;
	}
	//Mojo.Log.info("ListWidget", listWidget.id, offset, subset.length);
	//listWidget.mojo.noticeUpdatedItems(offset, subset);
	//listWidget.mojo.setLength(totalSubsetSize);
	//listWidget.mojo.setCount(totalSubsetSize);
	listWidget.mojo.getList().mojo.noticeUpdatedItems(offset, subset);
	listWidget.mojo.getList().mojo.setLength(totalSubsetSize);
	listWidget.mojo.setCount(totalSubsetSize);
};

IntroAssistant.prototype.getFilterChoices = function(list) {
	var choices = [{value: 'all', label: $L("All Tasks"), secondaryIcon: 'done-icon-tasklist'}], 
		thisChoice, i;
	switch (list) {
		case 'folder':
			for (i = 0; i < this.foldersArray.length; i++) {
				thisChoice = this.foldersArray[i];
				thisChoice.secondaryIcon = 'done-icon-folder';
				choices.push(thisChoice);
			}
			break;
		case 'context':
			for (i = 0; i < this.contextsArray.length; i++) {
				choices.push(this.contextsArray[i]);
			}
			break;
		case 'all':
			choices.push({value: 1, label: $L("Hotlist")});
			choices.push({value: 2, label: $L("Starred")});
			choices.push({value: 3, label: $L("Recent")});
			break;
		case 'priority':
			choices.push({value: 3, label: $L("3-Top")});
			choices.push({value: 2, label: $L("2-High")});
			choices.push({value: 1, label: $L("1-Medium")});
			choices.push({value: 0, label: $L("0-Low")});
			choices.push({value: -1, label: $L("Negative")});
			break;
		case 'duedate':
			choices.push({value: 1, label: $L("Overdue")});
			choices.push({value: 2, label: $L("Today")});
			choices.push({value: 3, label: $L("Tomorrow")});
			choices.push({value: 4, label: $L("Next Week")});
			choices.push({value: 5, label: $L("Next Month")});
			choices.push({value: 6, label: $L("No Due Date")});
			break;
		case 'completed':
			choices.push({value: 1, label: $L("Last Week")});
			choices.push({value: 2, label: $L("Last Month")});
			choices.push({value: 3, label: $L("Last Year")});
			break;
		case 'status':
			choices.push({value: 1, label: $L("Next Action")});
			choices.push({value: 2, label: $L("Active")});
			choices.push({value: 3, label: $L("Planning")});
			choices.push({value: 4, label: $L("Deferred Tasks")});
			choices.push({value: 5, label: $L("Reference")});
			choices.push({value: 6, label: $L("No Status")});
			break;
		default:
			break;
	}
	//Mojo.Log.info("Choices array for showFilter: %j", choices);
	return choices;
};

IntroAssistant.prototype.doFilter = function (event) {
	//Mojo.Log.info("Filter: ", event.value);
	this.getTasks(this.showListModel.value, event.value);
	MyAPP.prefs.showFilter = event.value;
	MyAPP.prefsCookie.put(MyAPP.prefs);
	this.goTop = true;
};

IntroAssistant.prototype.doList = function (event) {
	//Mojo.Log.info("List: ", event.value);

	this.goTop = true;
	//reset filter when changing list
	this.showFilterModel.choices = this.getFilterChoices(event.value);
	this.showFilterModel.value = 'all';
	this.controller.modelChanged(this.showFilterModel);
	
	switch (event.value) {
	case 'folder':
		this.sortSpec = event.value;
		this.getTasks(event.value, 'all');
		break;
	case 'context':
		this.sortSpec = event.value;
		this.getTasks(event.value, 'all');
		break;
	case 'duedate':
		this.sortSpec = event.value;
		this.getTasks(event.value, 'all');
		break;
	case 'priority':
		this.sortSpec = event.value;
		this.getTasks(event.value, 'all');
		break;
	case 'completed':
		this.sortSpec = event.value;
		this.getTasks(event.value, 'all');
		break;
	case 'status':
		this.sortSpec = event.value;
		this.getTasks(event.value, 'all');
		break;
	default:
		this.sortSpec = 'folder';
		this.getTasks(event.value, 'all');
		break;
	}
	MyAPP.prefs.showList = event.value;
	MyAPP.prefs.showFilter = 'all';
	MyAPP.prefsCookie.put(MyAPP.prefs);

};

IntroAssistant.prototype.checkChange = function (event) {
	var repeatFromCompleted, newDueDate, newStartDate, repeat, newTask, diff;
	Mojo.Log.info("Event id:", event.target.id);
	if (event.target.id === 'taskCheck') {
		// Changed the "Completed" checkbox
		//Mojo.Log.info("Check Change: %j", event.model.id);
		//Mojo.Log.info("Check Change: %j", event.model);
		//this.controller.get('testOutput').innerHTML = Object.toJSON(event);
		var nowTime = Math.floor(new Date().getTime() / 1000) * 1000;
		event.model.modified = nowTime;
		if (event.model.done) {
			event.model.completed = nowTime;
			if (event.model.repeat && (event.model.duedate || event.model.startdate)) {
				//diff = event.model.duedate *1 - event.model.startdate *1;
				Mojo.Log.info("Repeat Task!", event.model.repeat);
				repeatFromCompleted = false;
				repeat = event.model.repeat;
				if (repeat > 99) {
					repeatFromCompleted = true;
					repeat = repeat - 100;
				}
				if (repeat > 49) {
					Mojo.Log.info("Can't handle advanced repeats!!");
				}
				else {
					newDueDate = (repeatFromCompleted) ? 
						new Date() : new Date(event.model.duedate);
					newStartDate = (repeatFromCompleted) ?
						new Date() : new Date(event.model.startdate);
					switch (repeat) {
						case 1: // weekly
							newDueDate.setDate(newDueDate.getDate() + 7);
							newStartDate.setDate(newStartDate.getDate() + 7);
							break;
						case 2: // monthly
							newDueDate.setMonth(newDueDate.getMonth() + 1);
							newStartDate.setMonth(newStartDate.getMonth() + 1);
							break;
						case 3: // yearly
							newDueDate.setFullYear(newDueDate.getFullYear() + 1);
							newStartDate.setFullYear(newStartDate.getFullYear() + 1);
							break;
						case 4: // daily
							newDueDate.setDate(newDueDate.getDate() + 1);
							newStartDate.setDate(newStartDate.getDate() + 1);
							break;
						case 5: // biweekly
							newDueDate.setDate(newDueDate.getDate() + 14);
							newStartDate.setDate(newStartDate.getDate() + 14);
							break;
						case 6: // bimonthly
							newDueDate.setMonth(newDueDate.getMonth() + 2);
							newStartDate.setMonth(newStartDate.getMonth() + 2);
							break;
						case 7: // semiannually
							newDueDate.setMonth(newDueDate.getMonth() + 6);
							newStartDate.setMonth(newStartDate.getMonth() + 6);
							break;
						case 8: // quarterly
							newDueDate.setMonth(newDueDate.getMonth() + 3);
							newStartDate.setMonth(newStartDate.getMonth() + 3);
							break;
						case 9: // with parent
							//Mojo.Log.info("Can't handle with parent!!");
							break;
					}
					newDueDate.setHours(0, 0, 0, 0);
					newStartDate.setHours(0, 0, 0, 0);
					//Mojo.Log.info("New due date:", newDueDate);
					//Mojo.Log.info("New start date:", newStartDate);
					newTask = Object.clone(event.model);
					
					// Add new task with completed true
					newTask.repeat = 0;
					newTask.id = 0;
					newTask.value = nowTime;
					dao.updateTask(newTask, function(){
						//Mojo.Log.info("Created repeat task");
					});
					
					// Update task with new due date & not completed
					if (event.model.duedate) {
						event.model.duedate = newDueDate.getTime();
					}
					event.model.completed = "";
					
					// If it had a startdate, update that as well...
					if (event.model.startdate) {
						event.model.startdate = newStartDate.getTime();
					}
				}
			}
		}
		else {
			event.model.completed = '';
		}
		MyAPP.local.lastaddedit = Math.floor(event.model.modified / 1000);
		MyAPP.localCookie.put(MyAPP.local);
		Mojo.Log.info("Updating Task %j", event.model);
		dao.updateTask(event.model, this.activate.bind(this));	
		//event.stop();
	}
};

IntroAssistant.prototype.testNotify = function() {
	var d = new Date();
	d.setSeconds(d.getSeconds() + 5);
	notify.setAlarm(d);
};

IntroAssistant.prototype.handleCommand = function (event) {
	//Mojo.Log.info("Command", event.command);
	switch(event.command) {
	case 'doAdd':
		this.listAdd('');
		//this.testNotify();
		break;
/*
	case 'sortFolder':
		this.sortSpec = 'folder';
		this.taskListModel.items.sort(this.specSort.bind(this));
		this.controller.modelChanged(this.taskFilterListModel);
		break;
	case 'sortContext':
		this.sortSpec = 'context';
		this.taskListModel.items.sort(this.specSort.bind(this));
		this.controller.modelChanged(this.taskFilterListModel);
		break;

*/	case 'doSync':
	
		this.startSync();

/*
		var dashInfo = {};
		//var syncCallback = "Whatever"; //this.syncFinished.bind(this);
		//Mojo.Log.info("Starting Sync");
		dashInfo = {
			title: MyAPP.appName + " Starting Sync!", 
			message: "Swipe to Cancel", 
			count: 1
		};
		//Mojo.Log.info("Dash Info %j", dashInfo);
		MyAPP.SyncId = this.controller.serviceRequest('palm://com.palm.applicationManager', {
		    method: 'launch',
		    parameters:  {
					'id': MyAPP.appId,
					'params': {
						action: 'sync',
						dashInfo: dashInfo,
						syncCallback: this.finishSync
					}
		    }
		});

*/		

		break;
	case 'doPrefs':
		this.controller.stageController.pushScene('preferences', 
			this.foldersArray, this.contextsArray);
		break;
	case 'doFolders':
		this.controller.stageController.pushScene('folders');
		break;
	}
};

IntroAssistant.prototype.startSync = function () {
	this.controller.serviceRequest('palm://com.palm.connectionmanager', {
		method: 'getstatus',
		parameters: {},
		onSuccess: function(response){
			//Mojo.Log.info("Response %j", response);
			if (response.isInternetConnectionAvailable) {
				if (!MyAPP.prefs.syncWifiOnly ||
				response.wifi.state === 'connected') {
					this.controller.get('Scrim').show();
					var syncOutput = this.controller.get('syncTaskOutput');
					syncOutput.show();
					this.spinnerModel.spinning = true;
					this.controller.modelChanged(this.spinnerModel);
					sync.initSync(this.syncFinished.bind(this), syncOutput);
				}	
				else {
				//Mojo.Log.info("Wifi connection not available!");			
				Mojo.Controller.errorDialog($L("Wifi connection not available!"));						
				}		
			}
			else {
				//Mojo.Log.info("Internet connection not available!");			
				Mojo.Controller.errorDialog($L("Internet connection not available!"));	
			}
		}.bind(this),
		onFailure: function(response){
			//Mojo.Log.info("Connection Status Service Request FAILED!");
		}.bind(this)
	});

};

IntroAssistant.prototype.setSyncTimer = function (delayInMinutes) {
	var dashInfo, d, mo, yr,
		hrs, mins, secs,
		myDateString, dStr,
		bannerParams,
		date;
	//Mojo.Log.info("Starting Sync");
	dashInfo = {
		title: MyAPP.appName + " " + $L("Starting Sync!"), 
		message: "Swipe to Cancel", 
		count: 1
	};
	
	d = new Date();
	d.setTime(d.getTime() + 0.5 * 60 * 1000);
	mo = d.getUTCMonth() + 1;
	if (mo < 10) {
		mo = '0' + mo;
	}
	date = d.getUTCDate();
	if (date < 10) {
		date = '0' + date;
	}
	yr = d.getUTCFullYear();
	//get hours according to GMT
	hrs = d.getUTCHours();
	if (hrs < 10) {
		hrs = '0' + hrs;
	}
	mins = d.getUTCMinutes();
	if (mins < 10) {
		mins = '0' + mins;
	}
	secs = d.getUTCSeconds();
	if (secs < 10) {
		secs = '0' + secs;
	}
	myDateString = mo + "/" + date + "/" + yr + " " + hrs + ":" + mins + ":" + secs;
	//Mojo.Log.info("Date String", myDateString);
	
	dStr = Mojo.Format.formatDate(d, 'medium');
	//Mojo.Log.info("Time in setSyncTimer is", dStr);


	MyAPP.SyncTimerId = new Mojo.Service.Request("palm://com.palm.power/timeout", {
		method: 'set',
		parameters: {
			key: MyAPP.appId + '.sync',
			//'in': 	'00:05:00',
			at: myDateString,
			wakeup: true,
			uri: 'palm://com.palm.applicationManager/launch',
			params: {
				'id': MyAPP.appId,
				'params': {
					action: 'sync',
					dashInfo: dashInfo
				}
			}
		},
		onSuccess: function () {
			//Mojo.Log.info("Success in Setting up Sync!!!");
		}.bind(this)
	});
};

/*
IntroAssistant.prototype.finishSync = function (response) {
	this.controller.get("syncOutput").innerHTML = $L("Last Sync:") + " " +  
		(MyAPP.prefs.lastSync > 0) ? Mojo.Format.formatDate(new Date(MyAPP.prefs.lastSync), "medium") : "Not Synced!";
	
};

*/
IntroAssistant.prototype.editTask = function (taskValue) {
	Mojo.Log.info("Task value:", taskValue);
	this.controller.stageController.pushScene('addtask', taskValue);
};

IntroAssistant.prototype.listTap = function (event) {
	//Mojo.Log.logProperties(event, 'event');
	//Mojo.Log.info("Event: %j", Object.toJSON(event.item));
	//debugObject(event.originalEvent.target, 'noFuncs');
	var id = event.originalEvent.target.id,
		className = event.originalEvent.target.className,
		curDrawer, curDrawerNode;
	Mojo.Log.info("Classname:", className, "Id:", id);
	if (id === 'taskCheck') {
		this.checkChange (event);
		event.stop();
		return;
	}
	if (className === 'done-icon-note' || className === 'mynote') {
		Mojo.Log.info("Note Icon or drawer tapped!", id, className);

/*
		drawers = this.controller.document.getElementsByName('notesDrawer');
		//Mojo.Log.info("Drawers: ", drawers.length, this.someTasks.length, this.listOffset, event.index);
		curDrawer = drawers[event.index];
		
		curDrawer.mojo.toggleState();
		event.stop();

*/		
		//debugObject(event.originalEvent.target.up(), 'noFuncs');
		
		Mojo.Log.info("list", this.controller.get('taskListing').mojo.getList().mojo.getNodeByIndex(event.index));
		switch (className) {
			case 'done-icon-note':
				//Mojo.Log.info("icon!");
				curDrawer = event.originalEvent.target.up().getElementsByClassName('note-container')[0];
				break;
			case 'mynote':
				//Mojo.Log.info("note!");
				//debugObject(event.originalEvent.target.up(), 'noFuncs');
				curDrawer = event.originalEvent.target.up().up().up().up().getElementsByClassName('note-container')[0];
				break;
		}
		curDrawerNode = this.controller.get('taskListing').mojo.getList().mojo.getNodeByIndex(event.index);
		curDrawer = curDrawerNode.getElementsByClassName('note-container')[0];
		if (curDrawer.getStyle('display') === 'none') {
			curDrawer.show();
		}
		else {
			curDrawer.hide();
			this.controller.get('taskListing').mojo.getList().mojo.revealItem(event.index);
		}
		
		return;
	}
	else if (className === 'mynote') {
		
	}
	if (!id && !className) {
		return;
	}
	this.controller.stageController.pushScene('addtask', 
			//this.taskListModel.items[event.index],
			this.someTasks[event.index].value);
};

IntroAssistant.prototype.listDelete = function (event) {
	//Mojo.Log.info("Event: %j", Object.toJSON(event.item));
	//Mojo.Log.info("Deleting %j", event.index, event.item.id);
	dao.deleteTaskValue(event.item.value, function () {});
	if (event.item.id) {
		dao.createDeletedTask(event.item, function(){
		});
		//save lastdelete in seconds
		var nowTime = Math.floor(new Date().getTime() / 1000);
		MyAPP.local.lastdelete = nowTime;
		MyAPP.localCookie = new Mojo.Model.Cookie(MyAPP.appName + "local");
		MyAPP.localCookie.put(MyAPP.local);
	}
};

IntroAssistant.prototype.listAdd = function (title) {
	// Add a new task, using default values
	var nowTime = Math.floor(new Date().getTime() / 1000) * 1000,
		folder, context;
		
	folder = MyAPP.prefs.defaultFolder;
	context = MyAPP.prefs.defaultContext;
	
	if (MyAPP.prefs.useCurrent) {
		//Mojo.Log.info("List & Filter", MyAPP.prefs.showList, MyAPP.prefs.showFilter);
		if (MyAPP.prefs.showList === 'folder') {
			if (MyAPP.prefs.showFilter !== 'all') {
				folder = MyAPP.prefs.showFilter;
				//Mojo.Log.info("Folder:", folder);
			}
		}	
		if (MyAPP.prefs.showList === 'context') {
			if (MyAPP.prefs.showFilter !== 'all') {
				context = MyAPP.prefs.showFilter;
			}
		}	
	}

	var mytask = {
		id: 0,
		parent: "",
		children: "",
		title: title, // uses FilterList to add a new task...
		tag: "",
		folder: folder,
		context: context,
		goal: MyAPP.prefs.defaultGoal,
		added: nowTime,
		modified:nowTime,
		duedate: utils.makeDueDate(MyAPP.prefs.defaultDueDate, ""),
		startdate: "",
		duetime: "",
		starttime: "",
		reminder: 0,
		repeat: MyAPP.prefs.defaultRepeat,
		completed: "",
		rep_advanced: "",
		status: MyAPP.prefs.defaultStatus,
		star: 0,
		priority: MyAPP.prefs.defaultPriority,
		length: 0,
		timer: 0,
		note: "",
		value: nowTime
	};
	dao.updateTask(mytask, function () {});
	this.controller.stageController.pushScene('addtask', 
			mytask.value);	
};

IntroAssistant.prototype.syncFinished = function (response) {
	//Mojo.Log.info("Sync Finished with %j", response);

	//this.controller.modelChanged(this.taskListModel);
	//bannerParams = {messageText: MyAPP.appName + " " + response};
	//Mojo.Controller.getAppController().showBanner(bannerParams, {});

/*
	// Save list/filter prefs
	MyAPP.prefs.showList = this.showListModel.value;
	MyAPP.prefs.showFilter = this.showFilterModel.value;
	MyAPP.prefsCookie = new Mojo.Model.Cookie(MyAPP.appName + "prefs");
	MyAPP.prefsCookie.put(MyAPP.prefs);

*/	
	this.activate();
	
	this.controller.get("Scrim").hide();	
	this.hideScrim = function () {
		this.controller.get('syncTaskOutput').hide();
	}.bind(this);
	this.hideScrim.delay(10);
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);
/*
	this.controller.get("syncOutput").innerHTML = $L("Last Sync:") + " " +
		(MyAPP.prefs.lastSync > 0) ? Mojo.Format.formatDate(new Date(MyAPP.prefs.lastSync), "medium") : "Not Synced!";

*/
};

IntroAssistant.prototype.taskDivider = function(itemModel) {
	var today, tomorrow, nextDay, nextWeek, yesterday, lastWeek, lastMonth;
	switch (this.showListModel.value) {
		case 'all':
			//return $L("Importance") + ": " + itemModel.importance;
		case 'folder':
			return (this.foldersModel.items[itemModel.folder]) ? 
				this.foldersModel.items[itemModel.folder].label : $L("No Folder");
		case 'context':
			return (this.contextsModel.items[itemModel.context]) ? 
				this.contextsModel.items[itemModel.context].label : $L("No Context");
		case 'duedate':
			today = new Date();
			today.setHours(0, 0, 0, 0);
			tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			nextDay = new Date(tomorrow);
			nextDay.setDate(nextDay.getDate() + 1);
			nextWeek = new Date(tomorrow);
			nextWeek.setDate(nextWeek.getDate() + 7);
			//Mojo.Log.info("Dates:", today, tomorrow, nextWeek);
			if (!itemModel.duedate) {
				return $L("No Due Date");
			}
			else if (itemModel.duedate < today.getTime()) {
				return $L("Overdue!");
			}
			else if (itemModel.duedate >= today.getTime() &&
					itemModel.duedate < tomorrow.getTime()) {
				return $L("Today");
			}
			else if (itemModel.duedate >= tomorrow.getTime() &&
					itemModel.duedate < nextDay.getTime()) {
				return $L("Tomorrow");
			}
			else if (itemModel.duedate >= nextDay.getTime() &&
					itemModel.duedate < nextWeek.getTime()) {
				return $L("Within the Next Week");
			}
			else if (itemModel.duedate >= nextWeek.getTime()) {
				return $L("Future");
			}
			break;
		case 'completed':
			today = new Date();
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			today.setMilliseconds(0);
			tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			lastWeek = new Date(today);
			lastWeek.setDate(lastWeek.getDate() - 7);
			lastMonth = new Date(today);
			lastMonth.setMonth(lastMonth.getMonth() - 1);
			//Mojo.Log.info("Dates:", today, yesterday, lastWeek, new Date(itemModel.completed));
			//Mojo.Log.info("Millis:", today.getTime(), itemModel.completed);
			if (!itemModel.completed) {
				return $L("No Completion Date");
			}
			else if (itemModel.completed < lastMonth.getTime()) {
				return $L("Older!");
			}
			else if (itemModel.completed >= lastMonth.getTime() &&
					itemModel.completed < lastWeek.getTime()) {
				return $L("Within the Last Month");
			}
			else if (itemModel.completed >= lastWeek.getTime() &&
					itemModel.completed < yesterday.getTime()) {
				return $L("Within the Last Week");
			}
			else if (itemModel.completed >= yesterday.getTime() && 
					itemModel.completed < today.getTime()) {
				return $L("Yesterday");
			}
			else if (itemModel.completed >= today.getTime() ) {
				return $L("Today");
			}
			break;
		case 'priority':
			switch (itemModel.priority) {
				case 3:
					return $L("3-Top");
				case 2:
					return $L("2-High");
				case 1: 
					return $L("1-Medium");
				case 0:
					return $L("0-Low");
				default:
					return $L("Negative");
			}
			break;
		case 'status':
			switch (itemModel.status) {
				case 0:
					return $L("No Status");
				case 1:
					return $L("Next Action");
				case 2:
					return $L("Active");
				case 3: 
					return $L("Planning");
				case 4: 
					return $L("Delegated");
				case 5: 
					return $L("Waiting");
				case 6: 
					return $L("Hold");
				case 7: 
					return $L("Postponed");
				case 8: 
					return $L("Someday");
				case 9: 
					return $L("Canceled");
				case 10: 
					return $L("Reference");
				default:
					return $L("Deferred Task");
			}
			break;
	}
};

IntroAssistant.prototype.activate = function(event){
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */

	//Mojo.Controller.errorDialog('IT WORKS', this.controller.window);
	// Check for valid Toodledo userid:
	if (MyAPP.account.userid) {
		// Call the getAuth function to get sync authorization info
		//Mojo.Log.info("Calling getAuth function");
		//GetItDone.getAuth(this.username, this.password, this.gotAuth.bind(this));
		//api.getUniqueUserid (this.username, this.password, this.gotUserid.bind(this));
		//api.getToken(MyAPP.account.userid, this.gotToken.bind(this), 'folders');	
	}
	else {
		this.controller.stageController.pushScene('accounts');
	}
	// Check for task data that didn't get saved to datbase from add-task assistant
	MyAPP.saveCookie = new Mojo.Model.Cookie(MyAPP.appName + ".save");
	var oldTask = MyAPP.saveCookie.get();
	if (oldTask) {
		//Mojo.Log.info("Updating Task from cookie: %j", oldTask);
		dao.updateTask(oldTask, this.loadData.bind(this));
	}
	else {
		this.loadData();
	}
	
	// Handle landscape
	//Mojo.Log.info("Rotate:", MyAPP.prefs.allowRotate);
	if (MyAPP.prefs.allowRotate) {
		//this.controller.modelChanged(this.viewMenuModel);
		this.controller.stageController.setWindowOrientation("free");
		//Mojo.Log.info("Rotate FREE!");
	}
	else {
		this.controller.stageController.setWindowOrientation("up");
		//Mojo.Log.info("Rotate UP!");
	}
	var syncString = $L("Last Sync:") + " ";
	syncString += (MyAPP.prefs.lastSync > 0) ? Mojo.Format.formatDate(new Date(MyAPP.prefs.lastSync), "medium") : "Not Synced!";
	this.controller.get("syncOutput").innerHTML = syncString;
	
};

IntroAssistant.prototype.loadData = function () {
	// Retrieve info from database - start with folders
	//Mojo.Log.info("Entering loadData in IntroAssistant");
	dao.retrieveFolders(this.gotFoldersDb.bind(this));
	MyAPP.saveCookie.remove();
	notify.getNextDate();
};

IntroAssistant.prototype.gotFoldersDb = function (response) {
	var i;
	//Mojo.Log.info("Folders response is %j", response, response.length);
	response.sort(this.sortBySortorder);
	this.foldersArray = response;
	this.foldersArray.push({id: 0, label: $L("No Folder"), value: 0});
	this.foldersModel.items = [];
	this.foldersModel.items[0] = {id: 0, label: $L("No Folder"), value: 0};
	for (i = 0; i < response.length; i++) {
		//Mojo.Log.info("Response folder %j", response[i], i);
		this.foldersModel.items[response[i].value] = response[i];
	}
	
	// Retrieve contexts
	dao.retrieveContexts(this.gotContextsDb.bind(this));
};

IntroAssistant.prototype.sortBySortorder = function (a, b) {
	return (a.sortorder - b.sortorder);
};

IntroAssistant.prototype.gotContextsDb = function (response) {
	//Mojo.Log.info("Contexts response is %j", response);
	var i;
	this.contextsArray = response;
	this.contextsArray.push({id: 0, label: $L("No Context"), value: 0});
	this.contextsModel.items = [];
	this.contextsModel.items[0] = {id: 0, label: $L("No Context"), value: 0};
	for (i = 0; i < response.length; i++) {
		//Mojo.Log.info("Response context %j", response[i], i);
		this.contextsModel.items[response[i].value] = response[i];
	}
	//this.contextsModel.items = response;
	//Mojo.Log.info("Contexts model items %j", this.contextsModel.items);
	
	// Retrieve goals
	dao.retrieveGoals(this.gotGoalsDb.bind(this));
};

IntroAssistant.prototype.gotGoalsDb = function (response) {
	//Mojo.Log.info("Goals response is %j", response);
	var i;
	this.goalsArray = response;
	this.goalsArray.push({id: 0, label: $L("No Goal"), value: 0});
	this.goalsModel.items = [];
	this.goalsModel.items[0] = {id: 0, label: $L("No Goal"), value: 0};
	for (i = 0; i < response.length; i++) {
		//Mojo.Log.info("Response context %j", response[i], i);
		this.goalsModel.items[response[i].value] = response[i];
	}
	//this.goalsModel.items = response;
	//Mojo.Log.info("Goals model items %j", this.goalsModel.items);
	
	// Retrieve tasks using saved list, filter & sortSpec;
	this.showListModel.value = MyAPP.prefs.showList;
	this.controller.modelChanged(this.showListModel);
	this.showFilterModel.value = MyAPP.prefs.showFilter;
	this.showFilterModel.choices = this.getFilterChoices(this.showListModel.value);
	this.controller.modelChanged(this.showFilterModel);
	this.sortSpec = (this.showListModel.value === 'all') ? 
		'folder' : this.showListModel.value;
	this.getTasks(this.showListModel.value, this.showFilterModel.value);

};

IntroAssistant.prototype.gotTasksDb = function (response) {
	//Mojo.Log.info("Tasks response is %j", response);
	//Mojo.Log.info("List in gotTasksDb: ", this.showListModel.value);
	var i, j, doneTime = new Date(), myWrap, tags = [], thisTags = [], index;
	
	this.tasks = [];
	this.childTasks = [];
		
	if (response.length > 0) {
		
		//doneTime.setDate(doneTime.getDate() -  1);
		doneTime.setHours(0, 0, 0, 0);
		
		// Set CSS class value for wrapping title text
	 	myWrap = (MyAPP.prefs.wrapTitle) ? "" : 'truncating-text';
		
		for (i = 0; i < response.length; i++) {
			response[i].done = false;
			response[i].importance = this.calcImportance(response[i]);
			response[i].hasnote = (response[i].note) ? true: false;
	
			
/*
			// grab tags
			if (response[i].tag) {
				thisTags = response[i].tag.split(",");
				for (j = 0; j < thisTags.length; j++) {
					thisTags[j] = thisTags[j].strip();
					if (!tags.include(thisTags[j])) {
						tags.push(thisTags[j]);
					}
				}
				Mojo.Log.info("thisTags %j", thisTags);
				Mojo.Log.info("tags %j", tags);
				tags.each(function (tag) {
					Mojo.Log.info("tag", tag);
				});
			}
*/			
			
			// Set boolean value for completed tasks
			if (response[i].completed) {
				response[i].done = true;
			}

			// Check to see if list type is 'completed'			
			if (this.showListModel.value === 'completed') {
				if (response[i].completed) {
					//response[i].done = true;
					response[i].wrap = myWrap;
					this.tasks.push(response[i]);
				}
			}
			else {
				if ((!response[i].completed) || 
						(response[i].completed > doneTime.getTime() && 
						// showCompleted is backwards!!!
						!MyAPP.prefs.showCompleted)) {
					response[i].wrap = myWrap;
					
					// check for parent/child tasks
					if (!response[i].parent) {
						//Mojo.Log.info("regular task", response[i].title, response[i].id);
						this.tasks.push(response[i]);
					}
					else {
						//Mojo.Log.info("subtask", response[i].title, response[i].parent);
						this.childTasks.push(response[i]);
					}
				}
			}
		}
	}
	else {
		this.tasks = [
/*
			{
			title: 'No Tasks to Display',
			folder: 0,
			context: 0,
			done: false
			}
*/
		];
	}
		
	for (i = 0; i < this.childTasks.length; i++) {
		//Mojo.Log.info("childtask: %j", this.childTasks[i]);
		//Mojo.Log.info("parent:", this.childTasks[i].parent);
		index = 0;
		j = 0;
		for (j=0; j< this.tasks.length; j++) {
			if (this.tasks[j].value === this.childTasks[i].parent) {
				index = j;
			}
		}
		//Mojo.Log.info("index: ", index);
		this.tasks.splice(index, 0, this.childTasks[i]);
	}
	//this.tasks.sort(this.specSort.bind(this));
	if (this.showListModel.value === 'all') {
		//this.tasks.sort(this.sortImportance.bind(this));
	}
	if (this.showListModel.value === 'folder') {
		//this.tasks.sort(this.sortFolder.bind(this));
	}
	this.tasks.reverse();
	this.taskListModel.items = this.tasks;
	//Mojo.Log.info("changing taskListModel");
	//this.controller.modelChanged(this.taskListModel);
	// Use filterFunction since we're using a FilterList widget
	var listWidget = this.controller.get('taskListing');
	this.filterFunction('', listWidget, 0, this.tasks.length);
	if (this.goTop) {
		this.controller.get('tasks_scroller').mojo.revealTop();
		this.goTop = false;
	}
};

IntroAssistant.prototype.calcImportance = function (task) {
	var due, importance, today;
	
	importance = 2 + task.priority + task.star;
	
	today = new Date();
	today.setHours(0, 0, 0, 0);
	
	if (task.duedate) {
		due = task.duedate - today.getTime();
		if (due < 0) {
			importance += 6;
		}
		else if (due < 1000*60*60*24) {
			importance += 5;
		}
		else if (due < 1000*60*60*24*2) {
			importance += 3;
		}
		else if (due < 1000*60*60*24*7) {
			importance += 2;
		}
		else if (due < 1000*60*60*24*14) {
			importance += 1;
		}		
	}
	//Mojo.Log.info("Importance:", task.title, task.duedate, importance, due);
	return importance;	
};

IntroAssistant.prototype.getTasks = function (listType, filter) {
	//Mojo.Log.info("List: %s, filter: %s, sort %s",listType, filter, this.sortSpec);
	var sqlString, date1, date2, val1;
	//sqlString = "SELECT * FROM tasks WHERE (VALUE>0)";
	sqlString = "SELECT t.id as id, t.parent, t.children, t.title, t.tag, " +
		"t.folder, t.context, t.goal, t.added, t.modified as modified, " +
		"t.duedate, t.startdate, " +
		"t.duetime, t.starttime, t.reminder, t.repeat, t.completed, " +
		"t.rep_advanced, t.status, " +
		"t.star, t.priority, t.length, t.timer, t.note, t.value, " + 
		"f.id as folderId, f.label as folderLabel, f.value " + 
		"as folderValue, f.privy as folderPrivy, " +
		"CASE WHEN t.folder=0 THEN '0' ELSE f.sortorder END as sortorder, " + 
		"f.archived as folderArchived, f.modified " +
		"as folderModified";
	sqlString += " FROM tasks t";
	sqlString += " LEFT OUTER JOIN folders f ON t.folder=f.value";
	sqlString += " WHERE (t.value>0)";
	
	if (!MyAPP.prefs.showFutureTasks) {
		date1 = new Date();
		date2 = new Date();
		date1.setHours(0,0,0,0);
		date2.setHours(0,0,0,0);
		date1.setDate(date1.getDate()+1);
		date2.setMonth(date1.getMonth() + MyAPP.account.hidemonths);
		sqlString += " AND (t.startdate<" + date1.getTime() + " OR t.startdate = '') AND (duedate<" + date2.getTime() + " OR duedate ='')";
	}
	if (!MyAPP.prefs.showNegPriority) {
		sqlString += " AND (t.priority>-1)";
	}
	if (!MyAPP.prefs.showDeferred) {
		sqlString += " AND (t.status < 4)";
	}
	var sort1 = (listType == 'all') ? 'sortorder' : listType;
	switch (listType) {
		case 'folder':
			sort1 = 'sortorder';
			if (filter != 'all') {
				sqlString += " AND (t.folder="  + filter + ")";
			}
			break;
		case 'context':
			if (filter != 'all') {
				sqlString += " AND (t.context="  + filter + ")";
			}
			break;
		case 'all':
			switch (filter) {
				case "1": // hotlist
					date1 = new Date();
					date1.setHours(0, 0, 0, 0);
					date1.setDate(date1.getDate() + MyAPP.account.hotlistduedate * 1);
					//Mojo.Log.info("Date for hotlist:", date1);
					val1 = MyAPP.account.hotlistpriority * 1 - 1;
					sqlString += " AND (t.duedate < " + date1.getTime() + 
					" OR t.priority > " + 
						val1 + ")";
					break;
				case "2": // starred
					sqlString += " AND (t.star = 1)";
					break;
				case "3": // recent
					date1 = new Date();
					date1.setDate(date1.getDate() - 7);
					sqlString += " AND (t.added > " + date1.getTime() + ")";
			}
			break;
		case 'priority':
			if (filter != 'all') {
				sqlString += " AND (t.priority="  + filter + ")";
			}
			break;
		case 'status':
			if (filter != 'all') {
				switch (filter) {
					case "1": // Next Action
						sqlString += " AND (t.status=1)";
						break;
					case "2": // Active (status = 1 & 2)
						sqlString += " AND (t.status=1 or t.status=2 )";
						break;
					case "3": // Planning (status = 1 & 2 & 3)
						sqlString += " AND (t.status > 0 and t.status < 4)";
						break;
					case "4": // Deferred Task (status = 4-9)
						sqlString += " AND (t.status > 3 and t.status < 10 )";
						break;
					case "5": // Reference (status = 10)
						sqlString += " AND (t.status = 10)";
						break;
					case "6": // No Status
						sqlString += " AND (t.status = 0)";
						break;
				}
			}
			break;
		case 'duedate':
			if (filter !== 'all') {
				date1 = new Date();
				date1.setHours(0, 0, 0, 0);
				switch (filter) {
					case "1": //overdue
						break;
					case "2": // today
						date1.setDate(date1.getDate() + 1);
						break;
					case "3": // tomorrow
						date1.setDate(date1.getDate() + 2);
						break;
					case "4": // next week
						date1.setDate(date1.getDate() + 7);
						break;
					case "5": // next month
						date1.setMonth(date1.getMonth() + 1);
						break;
				}
				if (filter === "6") { // no due date
					sqlString += " AND (t.duedate = '')";
				}
				else {
					sqlString += " AND (t.duedate < " + date1.getTime() + ")";
				}
			}
			break;
		case 'completed':
			date1 = new Date();
			date1.setHours(0);
			date1.setMinutes(0);
			date1.setSeconds(0);
			date1.setMilliseconds(0);
			switch (filter) {
				case "all":
					break;
				case "1":
					date1.setDate(date1.getDate() - 7);
					break;
				case "2":
					date1.setMonth(date1.getMonth() - 1);
					break;
				case "3":
					date1.setFullYear(date1.getFullYear() - 1);
					break;
			}
			if (filter !== 'all') {
				sqlString += " AND (t.completed > " + date1.getTime() + ")";
			}
			break;
	}
	if (sort1 === 'duedate' || sort1 === 'status' || sort1 === 'sortorder') {
		sqlString += " ORDER BY " + sort1 + " DESC, t.duedate DESC, t.duetime DESC, t.priority ASC, t.star ASC, sortorder ASC, t.context ASC, t.modified ASC";
	}
	else {
		sqlString += " ORDER BY " + sort1 + " ASC, t.duedate DESC, t.duetime DESC, t.priority ASC, t.star ASC, t.context ASC, t.modified ASC";		
	}
	sqlString += ";GO;";
	//Mojo.Log.info("SQL String: ", sqlString);
	dao.retrieveTasksByString(sqlString, this.gotTasksDb.bind(this));
};

IntroAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  
	// Do not allow rotate on other scenes
	this.controller.stageController.setWindowOrientation("up");
	//Mojo.Log.info("Rotate UP!");
	
	// Save list/filter prefs
	MyAPP.prefs.showList = this.showListModel.value;
	MyAPP.prefs.showFilter = this.showFilterModel.value;
	//MyAPP.prefsCookie = new Mojo.Model.Cookie(MyAPP.appName + "prefs");
	MyAPP.prefsCookie.put(MyAPP.prefs);

};

IntroAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  
	this.controller.stopListening('taskListing', Mojo.Event.listTap, this.listTapHandler);
	this.controller.stopListening('taskListing', Mojo.Event.propertyChange, this.checkChangeHandler);
	this.controller.stopListening('taskListing', Mojo.Event.listDelete, this.listDeleteHandler);
		
	this.controller.stopListening('showFilter', Mojo.Event.propertyChange, this.showFilterHandler);
	this.controller.stopListening('showList', Mojo.Event.propertyChange, this.showListHandler);
	
	if (MyAPP.prefs.syncOnQuit && !MyAPP.prefs.syncOnInterval) {
		// delay by 6 seconds to allow app to close...
		this.setSyncTimer(0.1);
	}
	  
};

IntroAssistant.prototype.sortImportance = function (a, b) {
	if (a.importance > b.importance) {
		return 1;
	}
	else if (a.importance < b.importance) {
		return -1;
	}
	else {
		return 0;
	}
	
};

IntroAssistant.prototype.sortFolder = function (a, b) {
	var aFolder, bFolder;
	aFolder = this.foldersModel.items[a.folder].sortorder;
	bFolder = this.foldersModel.items[b.folder].sortorder;
	//Mojo.Log.info(a.title, aFolder, b.title, bFolder);
	if (aFolder > bFolder) {
		return -1;
	}
	else if (aFolder < bFolder) {
		return 1;
	}
	else {
		return 0;
	}
};

IntroAssistant.prototype.specSort = function (a, b) {
		//Mojo.Log.info("Sorting by ", this.sortSpec);
		if (this.sortSpec === 'duedate' ) {
			//Mojo.Log.info("Duedates:", a.duedate, b.duedate );
			if (a.duedate === ''  && b.duedate === '') {
				return 0;
			}
			if (a.duedate === '') {
				return -1;
			}
			if (b.duedate === '') {
				return 1;
			}
			if (a.duedate > b.duedate) {
				return -1;
			}
			if (a.duedate < b.duedate) {
				return 1;
			}
			return 0;
		}	
		if (this.sortSpec === 'completed') {
			if (a.completed === '0'  && b.completed === '0') {
				return 0;
			}
			if (a.completed === '0') {
				return -1;
			}
			if (b.completed === '0') {
				return 1;
			}
			if (a.completed > b.completed) {
				return 1;
			}
			if (a.completed < b.completed) {
				return -1;
			}
			return 0;
			
		}
		var aCat = a[this.sortSpec];
		var bCat = b[this.sortSpec];
		//Mojo.Log.info("Cats:", aCat, bCat);
		if (aCat > bCat) {
			return 1;
		}
		if (aCat < bCat) {
			return -1;
		}
		if (a.duedate === ''  && b.duedate === '') {
			return 0;
		}
		if (a.duedate === '') {
			return -1;
		}
		if (b.duedate === '') {
			return 1;
		}
		if (a.duedate > b.duedate) {
			return -1;
		}
		if (a.duedate < b.duedate) {
			return 1;
		}
		return 0;
};


// List formatters - provide "formatted" values for the list widget
IntroAssistant.prototype.formatDueDate = function (value, model) {
	//Mojo.Log.info("Model Duedate", value, model.duedate);
	if (MyAPP.prefs.showDueDate) {
		return (value) ? Mojo.Format.formatDate(new Date(value), {
			date: 'medium'
		}) : $L("no due date");
	}
	else {
		return "";
	}
};

IntroAssistant.prototype.formatDueTime = function (value, model) {
	//Mojo.Log.info("Model Duedate", value, model.duedate);
	if (MyAPP.prefs.showDueDate) {
		return (value) ? Mojo.Format.formatDate(new Date(value), {
			time: 'short'
		}) : "";
	}
	else {
		return "";
	}
};

IntroAssistant.prototype.formatFolder = function (value, model) {
	//Mojo.Log.info("Model Folder", value, model.folder);
	if (MyAPP.prefs.showFolderAndContext) {
		try {
			return (value) ? this.foldersModel.items[value].label : $L("no folder");
		} 
		catch (e) {
			//Mojo.Log.info("Oops folder error");
			return $L("no folder");
		}
	}
	else {
		return "";
	}
};

IntroAssistant.prototype.formatContext = function (value, model) {
	//Mojo.Log.info("Model Context", value, model.context);
	if (MyAPP.prefs.showFolderAndContext) {
		try {
			return (value) ? this.contextsModel.items[value].label : $L("no context");
		} 
		catch (e) {
			Mojo.Log.info("Oops context error!");
			return $L("no context");
		}
	}
	else {
		return "";
	}
};

IntroAssistant.prototype.formatStar = function (value, model) {
	//Mojo.Log.info("Model Duedate", value, model.duedate);
	return (MyAPP.prefs.showStar) ? "0" : "";
};

IntroAssistant.prototype.formatHasNote = function (value, model) {
	//Mojo.Log.info("Model Duedate", value, model.duedate);
	if (MyAPP.prefs.showNotes && value) {
		return "done-icon-note";
	}
	else {
		return "";
	}
};

IntroAssistant.prototype.formatNote = function (value, model) {
	//Mojo.Log.info("Model Duedate", value, model.duedate);
	if (value) {
		return Mojo.Format.runTextIndexer(value.replace(/\n/g, "<br />"));
	}
	else {
		return "";
	}
};

IntroAssistant.prototype.formatPriority = function (value, model) {
	//Mojo.Log.info("Model Duedate", value, model.duedate);
	//return (value) ? "taskbox priority" + value : "";
	if (MyAPP.prefs.showPriority) {
		return "taskbox priority" + value;
	}
	else {
		return "";
	}
};
IntroAssistant.prototype.formatParent = function (value, model) {
	//Mojo.Log.info("Model Duedate", value, model.duedate);
	//return (value) ? "taskbox priority" + value : "";
	if (value) {
		return "subtask";
	}
	else {
		return "";
	}
};

