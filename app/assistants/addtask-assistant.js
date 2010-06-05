function AddtaskAssistant(task) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	Mojo.Log.info("Entering AddTaskAssitant Constructor");
	this.taskValue = task;
	this.isDirty = false; // set to true if any data is changed
}

AddtaskAssistant.prototype.setup = function(){

	/* this function is for setup tasks that have to happen when the scene is first created */
	this.controller.get('dueTimeLabelId').innerHTML = $L("Due Time");
	this.controller.get('startTimeLabelId').innerHTML = $L("Start Time");
	this.controller.get('repeatFromLabel').innerHTML = $L("Repeat From");
	this.controller.get('notesLabel').innerHTML = $L("Note");

		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	// Add Task Name text input field
	this.controller.setupWidget("TaskInputId",
         this.taskAttributes = {
             hintText: $L('Task name') + '...',
             multiline: true,
             enterSubmits: false,
             autoFocus: true,
			 changeOnKeyPress: true,
			 focusMode: Mojo.Widget.focusSelectMode
		     },
		this.taskModel = {
			value: ""
		}
	);

	this.controller.setupWidget('taskcheck', {
		modelProperty: "done"
	});

	this.folderModel = {
		value: "", 
		choices: [],
		disabled: false
	};
	//Mojo.Log.info("Folder Model: %j", this.folderModel);
	this.controller.setupWidget("FolderSelectorId",
        this.folderAttributes = {
			label: $L("Folder")
		},
		this.folderModel
    );

	// Add Priority Selector List
	this.controller.setupWidget("PrioritySelectorId",
        this.priorityAttributes = {
			label: $L("Priority")
			},
        this.priorityModel = {
			//choices: this.toodledo.priorityChoices,
			choices: [
                {label: $L("Negative"), value: "-1"},
                {label: $L("0-Low"), value: 0},
                {label: $L("1-Medium"), value: 1},
                {label: $L("2-High"), value: 2},
                {label: $L("3-Top"), value: 3}
                ],
        	value: 0,
        	disabled: false
    });

	// Add Context Selector List
	this.contextModel = {
		choices: [],
		value: 0, 
		disabled: false
	};

	//Mojo.Log.info("Context Model: %j", this.contextModel);
	this.controller.setupWidget("ContextSelectorId",
        this.contextAttributes = {
			label: $L("Context")           
			},
 		this.contextModel
	);
	
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
	        value: 0,
	        disabled: false
    	}
	);
	
	// Add DueDate Selector List
	this.controller.setupWidget("DueDateSelectorId",
        this.duedateAttributes = {
			label: $L("Due Date")           
			},
        this.duedateModel = {
			choices: [],
	        value: 0,
	        disabled: false
	    }
	);

	// Add StartDate Selector List
	this.controller.setupWidget("StartDateSelectorId",
        this.startdateAttributes = {
			label: $L("Start Date")           
			},
        this.startdateModel = {
			choices: [],
	        value: 0,
	        disabled: false
	    }
	);
	
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
                {label: $L("With Parent"), value: "9"},
				{label: $L("Advanced"), value: "50"}
                ]
			},
        this.repeatModel = {
	        value: this.repeat,
	        disabled: false
	    }
	);
	
	// Add Repeat From toggle button
	this.controller.setupWidget('RepeatFromToggleId',
		this.repeatFromAttributes = {
			trueLabel: $L('Completed'),
			falseLabel: $L('Due Date')
		},
		this.repeatFromModel = {
			value: false,
			disabled: false
		}
	);

	// Add Note text input field
	this.controller.setupWidget("NoteId",
         this.noteAttributes = {
             hintText: $L('Notes') + '...',
             multiline: true,
             enterSubmits: false,
             autoFocus: false,
			 changeOnKeyPress: true,
			 focusMode: Mojo.Widget.focusInsertMode
		     },
		this.noteModel = {
			value: ""
		}
	);


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
	
	// Setup command menu
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {
		items: [{
			label: $L("Duplicate Task"),
			command: "copy-task"
		}]
	});

		
	/* add event handlers to listen to events from widgets */
	this.datePropertyChangedHandler = this.datePropertyChanged.bind(this);
	this.controller.listen('DueDateSelectorId', Mojo.Event.propertyChange, this.datePropertyChangedHandler);
	this.timePropertyChangedHandler = this.timePropertyChanged.bind(this);
	this.controller.listen('dueTimeRow', Mojo.Event.tap, this.timePropertyChangedHandler);

	this.startdatePropertyChangedHandler = this.startdatePropertyChanged.bind(this);
	this.controller.listen('StartDateSelectorId', Mojo.Event.propertyChange, this.startdatePropertyChangedHandler);
	this.starttimePropertyChangedHandler = this.starttimePropertyChanged.bind(this);
	this.controller.listen('startTimeRow', Mojo.Event.tap, this.starttimePropertyChangedHandler);

	this.starChangedHandler = this.starChanged.bind(this);
	this.controller.listen('star', Mojo.Event.tap, this.starChangedHandler);
	this.controller.listen('notstar', Mojo.Event.tap, this.starChangedHandler);

	this.dirtyHandler = this.dirtyFunction.bind(this);
	//this.controller.listen(this.controller.document, Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.listen('TaskInputId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.listen('FolderSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.listen('PrioritySelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.listen('ContextSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.listen('StatusSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.listen('RepeatSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.listen('RepeatFromToggleId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.listen('NoteId', Mojo.Event.propertyChanged, this.dirtyHandler);
		
};

AddtaskAssistant.prototype.handleCommand = function (event) {
	switch (event.command) {
		case "copy-task":
			this.copyTask();
			break;
	}
};

AddtaskAssistant.prototype.copyTask = function () {
	var nowTime = Math.floor(new Date().getTime() / 1000) * 1000;
	
	// save original task
	this.saveTask();
	
	this.task.id = 0;
	this.task.value = nowTime;
	this.task.added = nowTime;
	this.task.modified = nowTime;
	this.task.completed = "";
	this.task.children = "";
	
	// need to do something about saveCookie, etc.
	dao.updateTask(this.task, function () {});
	
};

AddtaskAssistant.prototype.dirtyFunction = function (event) {
	Mojo.Log.info("Something Dirty!");
	this.isDirty = true;
	this.saveTask();
};

AddtaskAssistant.prototype.starChanged = function (event) {
	//Mojo.Log.info("Star tapped");
	if (this.task.star === 0) {
		this.task.star = 1;
		this.controller.get('star').show();
		this.controller.get('notstar').hide();
	}
	else {
		this.task.star = 0;
		this.controller.get('star').hide();
		this.controller.get('notstar').show();		
	}
	//Mojo.Log.info("Star value", this.task.star);
	//this.isDirty = true;
	this.dirtyFunction();
};

AddtaskAssistant.prototype.timePropertyChanged = function (event) {
	//Mojo.Log.info("Due Time Tapped!", this.task.duetime);
	var myTime = (this.task.duetime) ? new Date(this.task.duetime) : new Date();
	//Mojo.Log.info("myTime is", myTime);
	this.controller.showDialog({
		template: 'addtask/gototime',
		assistant: new GoToTimeAssistant(this, myTime, this.gotTime.bind(this))
	});
};

AddtaskAssistant.prototype.gotTime = function (date) {
	if (date) {
		date.setSeconds(0);
		date.setMilliseconds(0);
		//Mojo.Log.info("New Due Time is", Mojo.Format.formatDate(date, {
		//	time: 'short'
		//}));
		this.task.duetime = date.getTime();
		this.controller.get('dueTimeId').innerHTML = Mojo.Format.formatDate(date, {
			time: 'short'
		});
	}
	else {
		this.task.duetime = "";
		this.controller.get('dueTimeId').innerHTML = $L("No Due Time");
	}
// NOTE: there is a currently a bug in webOS that loses your scroll position when calling a customDialog.
// The following lines are a hack to scroll back to the top of the scene.
	var scroller = this.controller.getSceneScroller();
	//call the widget method for scrolling to the top
	scroller.mojo.revealTop(0);
	this.isDirty = true;
	this.dirtyFunction();
};

AddtaskAssistant.prototype.starttimePropertyChanged = function (event) {
	//Mojo.Log.info("Start Time Tapped!", this.task.starttime);
	var myTime = (this.task.starttime) ? new Date(this.task.starttime) : new Date();
	//Mojo.Log.info("myTime is", myTime);
		this.controller.showDialog({
			template: 'addtask/gototime',
			assistant: new GoToTimeAssistant(this, myTime, this.gotStartTime.bind(this))
		});
};

AddtaskAssistant.prototype.gotStartTime = function (date) {
	if (date) {
		date.setSeconds(0);
		date.setMilliseconds(0);
	//	Mojo.Log.info("New Start Time is", Mojo.Format.formatDate(date, {
	//		time: 'short'
	//	}));
		this.task.starttime = date.getTime();
		this.controller.get('startTimeId').innerHTML = Mojo.Format.formatDate(date, {
			time: 'short'
		});
	}
	else {
		this.task.starttime = "";
		this.controller.get('startTimeId').innerHTML = $L("No Start Time");
	}
// NOTE: there is a currently a bug in webOS that loses your scroll position when calling a customDialog.
// The following lines are a hack to scroll back to the top of the scene.
	var scroller = this.controller.getSceneScroller();
	//call the widget method for scrolling to the top
	scroller.mojo.revealTop(0);
	this.isDirty = true;
	this.dirtyFunction();
};


AddtaskAssistant.prototype.startdatePropertyChanged = function (event) {
	//Mojo.Log.info("********* property Change *************");  
	//Mojo.Log.info(this.startdateModel.value, this.startdateModel.label);
	var myDate = (this.task.startdate) ? new Date(this.task.startdate) : new Date();
	if (this.startdateModel.value == "7") {
		// reset to previous value in case user cancels dialog...
		this.startdateModel.value = this.task.startdateval;
		this.controller.modelChanged(this.startdateModel);
		this.controller.showDialog({
			template: 'addtask/gotodate',
			assistant: new GoToDateAssistant(this, myDate, this.gotStartDate.bind(this))
		});
	}
	else {
		this.task.startdateval = event.value;
		this.isDirty = true;
	this.dirtyFunction();
	}
	
};

AddtaskAssistant.prototype.datePropertyChanged = function(event){
	//Mojo.Log.info("********* property Change *************");  
	//Mojo.Log.info(this.duedateModel.value, this.duedateModel.label);
	var myDate = (this.task.duedate) ? new Date(this.task.duedate) : new Date();
	if (this.duedateModel.value == "7") {
		// reset to previous value in case user cancels dialog...
		this.duedateModel.value = this.task.duedateval;
		this.controller.modelChanged(this.duedateModel);
		this.controller.showDialog({
			template: 'addtask/gotodate',
			assistant: new GoToDateAssistant(this, myDate, this.gotDate.bind(this))
		});
	}
	else {
		this.task.duedateval = event.value;
		this.isDirty = true;
	this.dirtyFunction();
	}
};

AddtaskAssistant.prototype.gotDate = function (date) {
	//Mojo.Log.info("New Date is:", date);
	this.task.duedate = date.getTime();
	this.task.duedateval = "6";
	this.dueDateString = Mojo.Format.formatDate(new Date(this.task.duedate), {
		date: 'medium'
	});
	this.dueChoices = [
            {label: $L("No Due Date"), value: "0"},
			{label: $L("Today"), value: "1"},
			{label: $L("Tomorrow"), value: "2"},
			{label: $L("In One Week"), value: "3"},
			{label: $L("In One Month"), value: "4"},
			{label: $L("In One Year"), value: "5"},
			{label: this.dueDateString, value: "6"},
			{label: $L("Other") + "...", value: "7"}
            ];
	this.duedateModel.value = "6";
	this.duedateModel.choices = this.dueChoices;
	this.controller.modelChanged(this.duedateModel);
	
// NOTE: there is a currently a bug in webOS that loses your scroll position when calling a customDialog.
// The following lines are a hack to scroll back to the top of the scene.
	var scroller = this.controller.getSceneScroller();
	//call the widget method for scrolling to the top
	scroller.mojo.revealTop(0);
	
	this.isDirty = true;
	this.dirtyFunction();

};

AddtaskAssistant.prototype.gotStartDate = function (date) {
	//Mojo.Log.info("New Date is:", date);
	this.task.startdate = date.getTime();
	this.task.startdateval = "6";
	this.startDateString = Mojo.Format.formatDate(new Date(this.task.startdate), {
		date: 'medium'
	});
	this.startChoices = [
            {label: $L("No Due Date"), value: "0"},
			{label: $L("Today"), value: "1"},
			{label: $L("Tomorrow"), value: "2"},
			{label: $L("In One Week"), value: "3"},
			{label: $L("In One Month"), value: "4"},
			{label: $L("In One Year"), value: "5"},
			{label: this.startDateString, value: "6"},
			{label: $L("Other") + "...", value: "7"}
            ];
	this.startdateModel.value = "6";
	this.startdateModel.choices = this.startChoices;
	this.controller.modelChanged(this.startdateModel);
	
// NOTE: there is a currently a bug in webOS that loses your scroll position when calling a customDialog.
// The following lines are a hack to scroll back to the top of the scene.
	var scroller = this.controller.getSceneScroller();
	//call the widget method for scrolling to the top
	scroller.mojo.revealTop(0);
	
	this.isDirty = true;
	this.dirtyFunction();

};

AddtaskAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	 
	this.loadData();
};

AddtaskAssistant.prototype.loadData = function () {
	// Retrieve info from database - start with folders
	dao.retrieveFolders(this.gotFoldersDb.bind(this));
	MyAPP.saveCookie.remove();
};

AddtaskAssistant.prototype.gotFoldersDb = function (response) {
	//Mojo.Log.info("Folders response is %j", response, response.length);
	this.folders = [{id: 0, label: $L("No Folder"), value: 0}];
	this.folders = this.folders.concat(response);
	
	// Retrieve contexts
	dao.retrieveContexts(this.gotContextsDb.bind(this));
};

AddtaskAssistant.prototype.gotContextsDb = function (response) {
	//Mojo.Log.info("Contexts response is %j", response);
	this.contexts = [{id: 0, label: $L("No Context"), value: 0}];
	this.contexts = this.contexts.concat(response);
	
	// Retrieve goals
	dao.retrieveGoals(this.gotGoalsDb.bind(this));
};

AddtaskAssistant.prototype.gotGoalsDb = function (response) {
	//Mojo.Log.info("Goals response is %j", response);
	var sqlString;
	this.goals = [{id: 0, label: $L("No Goal"), value: 0}];
	this.goals = this.goals.concat(response);
	
	// Retrieve task by value;
	sqlString = "SELECT * FROM tasks WHERE value=" + this.taskValue + ";GO;";
	dao.retrieveTasksByString(sqlString, this.gotTasks.bind(this));
};

AddtaskAssistant.prototype.gotTasks = function (responseText) {
	Mojo.Log.info("Task: %j", responseText);
	this.task = responseText[0];

	var startTimeString = $L("No Start Time");
	var dueTimeString = $L("No Due Time");
	if (this.task.duetime) {
		dueTimeString = Mojo.Format.formatDate(new Date(this.task.duetime), {
			time: 'short'
		});}
	this.controller.get('dueTimeId').innerHTML = dueTimeString;
	if (this.task.starttime) {
		startTimeString = Mojo.Format.formatDate(new Date(this.task.starttime), {
			time: 'short'
		});}
	this.controller.get('startTimeId').innerHTML = startTimeString;

	if (this.task.duedate) {
		//Mojo.Log.info("Task has duedate", new Date(this.task.duedate));
		this.task.duedateval = "6";
		this.dueDateString = Mojo.Format.formatDate(new Date(this.task.duedate), {
			date: 'medium'
		});
		this.dueChoices = [
                {label: $L("No Due Date"), value: "0"},
				{label: $L("Today"), value: "1"},
				{label: $L("Tomorrow"), value: "2"},
				{label: $L("In One Week"), value: "3"},
				{label: $L("In One Month"), value: "4"},
				{label: $L("In One Year"), value: "5"},
				{label: this.dueDateString, value: "6"},
				{label: $L("Other") + "...", value: "7"}
                ];
	}
	else {
		this.task.duedateval = "0";
		this.dueChoices = [
                {label: $L("No Due Date"), value: "0"},
				{label: $L("Today"), value: "1"},
				{label: $L("Tomorrow"), value: "2"},
				{label: $L("In One Week"), value: "3"},
				{label: $L("In One Month"), value: "4"},
				{label: $L("In One Year"), value: "5"},
				{label: $L("Other") + "...", value: "7"}
                ];
	}
	if (this.task.startdate) {
		//Mojo.Log.info("Task has startdate", new Date(this.task.startdate));
		this.task.startdateval = "6";
		this.startDateString = Mojo.Format.formatDate(new Date(this.task.startdate), {
			date: 'medium'
		});
		this.startChoices = [
                {label: $L("No Start Date"), value: "0"},
				{label: $L("Today"), value: "1"},
				{label: $L("Tomorrow"), value: "2"},
				{label: $L("In One Week"), value: "3"},
				{label: $L("In One Month"), value: "4"},
				{label: $L("In One Year"), value: "5"},
				{label: this.startDateString, value: "6"},
				{label: $L("Other") + "...", value: "7"}
                ];
	}
	else {
		this.task.startdateval = "0";
		this.startChoices = [
                {label: $L("No Start Date"), value: "0"},
				{label: $L("Today"), value: "1"},
				{label: $L("Tomorrow"), value: "2"},
				{label: $L("In One Week"), value: "3"},
				{label: $L("In One Month"), value: "4"},
				{label: $L("In One Year"), value: "5"},
				{label: $L("Other") + "...", value: "7"}
                ];
	}


	
	if (this.task.star === 1) {
		this.controller.get('star').show();
		this.controller.get('notstar').hide();
	}
	else {
		this.controller.get('star').hide();
		this.controller.get('notstar').show();		
	}

	// 100 is added to repeat value to repeat from Completion Date
	// rather than Due Date in Toodledo
	this.repeatFromCompleted = false;
	this.repeat = this.task.repeat;
	if (this.task.repeat > 99) {
		this.repeatFromCompleted = true;
		this.repeat = this.task.repeat - 100;
	}

	this.taskModel.value = this.task.title;
	this.controller.modelChanged(this.taskModel);
	
	this.repeatModel.value = this.repeat;
	this.controller.modelChanged(this.repeatModel);

	this.repeatFromModel.value = this.repeatFromCompleted;
	this.controller.modelChanged(this.repeatFromModel);
	
	this.duedateModel.choices = this.dueChoices;
	this.duedateModel.value = this.task.duedateval;
	this.controller.modelChanged(this.duedateModel);
	this.startdateModel.choices = this.startChoices;
	this.startdateModel.value = this.task.startdateval;
	this.controller.modelChanged(this.startdateModel);

	this.priorityModel.value = this.task.priority;
	this.controller.modelChanged(this.priorityModel);
	this.contextModel.choices = this.contexts;
	this.contextModel.value = this.task.context;
	this.controller.modelChanged(this.contextModel);
	this.folderModel.choices = this.folders;
	this.folderModel.value = this.task.folder;
	this.controller.modelChanged(this.folderModel);
	this.statusModel.value = this.task.status;
	this.controller.modelChanged(this.statusModel);
	this.noteModel.value = this.task.note;
	this.controller.modelChanged(this.noteModel);
	this.isDirty = false; // set to true if any data is changed

	

};

AddtaskAssistant.prototype.loadNewTask = function (taskValue) {
	Mojo.Log.info("Load New Task:", taskValue);
	this.saveTask();
	sqlString = "SELECT * FROM tasks WHERE value=" + taskValue + ";GO;";
	dao.retrieveTasksByString(sqlString, this.gotTasks.bind(this));
};


AddtaskAssistant.prototype.deactivate = function(event){
	if (!this.taskModel.value) {
		// No title - delete task!
		dao.deleteTaskValue(this.task.value, function() {});
	}
	//this.saveTask();
};

AddtaskAssistant.prototype.saveTask = function () {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	var temp;
	if (this.isDirty) {
		this.task.title = this.taskModel.value;
		this.task.folder = this.folderModel.value ? this.folderModel.value : 0;
		this.task.priority = this.priorityModel.value;
		this.task.context = this.contextModel.value ? this.contextModel.value : "0";
		this.task.status = this.statusModel.value;
		this.task.repeat = this.repeatModel.value;
		if (this.repeatFromModel.value) {
			this.task.repeat = this.task.repeat * 1 + 100;
		}
		//Mojo.Log.info("Repeat:", this.task.repeat);
		this.task.duedate = utils.makeDueDate(this.duedateModel.value, this.task.duedate);

		if (this.task.duedate && this.task.duetime) {
			temp = new Date(this.task.duetime);
			this.task.duetime = new Date(this.task.duedate);
			this.task.duetime.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
			this.task.duetime = this.task.duetime.getTime();
		}
		this.task.startdate = utils.makeDueDate(this.startdateModel.value, this.task.startdate);

		if (this.task.startdate && this.task.starttime) {
			temp = new Date(this.task.starttime);
			this.task.starttime = new Date(this.task.startdate);
			this.task.startime.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
			this.task.starttime =  this.task.startime.getTime();
		}
		
		this.task.note = this.noteModel.value;
		//Mojo.Log.info("Duedate:", this.task.duedate, new Date(this.task.duedate));
		var nowTime = Math.floor(new Date().getTime() / 1000) * 1000;
		this.task.modified = nowTime;
		MyAPP.local.lastaddedit = nowTime / 1000;
		//Mojo.Log.info("Now", nowTime);
		MyAPP.localCookie = new Mojo.Model.Cookie(MyAPP.appName + "local");
		MyAPP.localCookie.put(MyAPP.local);
		
		// Save data to a cookie in the event the user closes app before DB commit
		// Will check for this cookie on app load and resave to DB if needed.
		MyAPP.saveCookie = new Mojo.Model.Cookie(MyAPP.appName + ".save");
		MyAPP.saveCookie.put(this.task);
		
		// Save info to database
		// update existing entry in database
		
		Mojo.Log.info("Updating Task: %j", this.task);
		dao.updateTask(this.task, this.returnFromDb.bind(this));
	}
};

AddtaskAssistant.prototype.returnFromDb = function () {
	//Mojo.Log.info("Removing Save Cookie");
	MyAPP.saveCookie.remove();	
	// Update notification alarm
	notify.getNextDate();
	this.isDirty = false;
};


AddtaskAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('DueDateSelectorId', Mojo.Event.propertyChange, this.datePropertyChangedHandler);
	this.controller.stopListening('dueTimeId', Mojo.Event.tap, this.timePropertyChangedHandler);

	this.controller.stopListening('StartDateSelectorId', Mojo.Event.propertyChange, this.startdatePropertyChangedHandler);
	this.controller.stopListening('startTimeRow', Mojo.Event.tap, this.starttimePropertyChangedHandler);

	this.controller.stopListening('star', Mojo.Event.tap, this.starChangedHandler);
	this.controller.stopListening('notstar', Mojo.Event.tap, this.starChangedHandler);

	this.controller.stopListening('TaskInputId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.stopListening('FolderSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.stopListening('PrioritySelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.stopListening('ContextSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.stopListening('StatusSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.stopListening('RepeatSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.stopListening('RepeatFromToggleId', Mojo.Event.propertyChanged, this.dirtyHandler);
	this.controller.stopListening('NoteId', Mojo.Event.propertyChanged, this.dirtyHandler);
};
