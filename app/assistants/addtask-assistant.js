function AddtaskAssistant(taskValue){
    /* this is the creator function for your scene assistant object. It will be passed all the 
     additional parameters (after the scene name) that were passed to pushScene. The reference
     to the scene controller (this.controller) has not be established yet, so any initialization
     that needs the scene controller should be done in the setup function below. */
    //Mojo.Log.info("Entering AddTaskAssitant Constructor with", taskValue);
    this.taskValue = taskValue;
}

AddtaskAssistant.prototype.setup = function(){

    /* this function is for setup tasks that have to happen when the scene is first created */
    this.controller.get('dueTimeLabelId').innerHTML = $L("Due Time");
    this.controller.get('startTimeLabelId').innerHTML = $L("Start Time");
    this.controller.get('repeatFromLabel').innerHTML = $L("Repeat From");
    this.controller.get('notesLabel').innerHTML = $L("Note");
    this.controller.get('tagsLabel').innerHTML = $L("Tags");
    
    
	this.controller.get("yellowpad").style.backgroundColor = MyAPP.colors[MyAPP.prefs.color].color; //"#D2F7D4";
    /* use Mojo.View.render to render view templates and add them to the scene, if needed */
    
    /* setup widgets here */
    // Add Task Name text input field
    this.controller.setupWidget("TaskInputId", this.taskAttributes = {
        hintText: $L('Task name') + '...',
        multiline: true,
        enterSubmits: false,
        autoFocus: true,
        changeOnKeyPress: true,
        focusMode: Mojo.Widget.focusSelectMode
    }, this.taskModel = {
        value: ""
    });
    
    this.controller.setupWidget('addTaskCheck', {}, this.addTaskCheckModel = {
        value: false
    });
    
    this.folderModel = {
        value: "",
        choices: [],
        disabled: false
    };
    //Mojo.Log.info("Folder Model: %j", this.folderModel);
    this.controller.setupWidget("FolderSelectorId", this.folderAttributes = {
        label: $L("Folder")
    }, this.folderModel);
    
    // Add Priority Selector List
    this.controller.setupWidget("PrioritySelectorId", this.priorityAttributes = {
        label: $L("Priority")
    }, this.priorityModel = {
        //choices: this.toodledo.priorityChoices,
        choices: [{
            label: $L("Negative"),
            value: "-1"
        }, {
            label: $L("0-Low"),
            value: 0
        }, {
            label: $L("1-Medium"),
            value: 1
        }, {
            label: $L("2-High"),
            value: 2
        }, {
            label: $L("3-Top"),
            value: 3
        }],
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
    this.controller.setupWidget("ContextSelectorId", this.contextAttributes = {
        label: $L("Context")
    }, this.contextModel);
    
    // Add Goal Selector List
    this.goalModel = {
        choices: [],
        value: 0,
        disabled: false
    };
    
    //Mojo.Log.info("Context Model: %j", this.contextModel);
    this.controller.setupWidget("GoalSelectorId", this.contextAttributes = {
        label: $L("Goal")
    }, this.goalModel);
    
    // Add Status Selector List
    this.controller.setupWidget("StatusSelectorId", this.statusAttributes = {
        label: $L("Status"),
        choices: [{
            label: $L("No Status"),
            value: "0"
        }, {
            label: $L("Next Action"),
            value: "1"
        }, {
            label: $L("Active"),
            value: "2"
        }, {
            label: $L("Planning"),
            value: "3"
        }, {
            label: $L("Delegated"),
            value: "4"
        }, {
            label: $L("Waiting"),
            value: "5"
        }, {
            label: $L("Hold"),
            value: "6"
        }, {
            label: $L("Postponed"),
            value: "7"
        }, {
            label: $L("Someday"),
            value: "8"
        }, {
            label: $L("Canceled"),
            value: "9"
        }, {
            label: $L("Reference"),
            value: "10"
        }]
    }, this.statusModel = {
        value: 0,
        disabled: false
    });
    
    // Add DueDate Selector List
    this.controller.setupWidget("DueDateSelectorId", this.duedateAttributes = {
        label: $L("Due Date")
    }, this.duedateModel = {
        choices: [],
        value: 0,
        disabled: false
    });
    
    // Add StartDate Selector List
    this.controller.setupWidget("StartDateSelectorId", this.startdateAttributes = {
        label: $L("Start Date")
    }, this.startdateModel = {
        choices: [],
        value: 0,
        disabled: false
    });
    
    // Add Repeat Selector List
    this.controller.setupWidget("RepeatSelectorId", this.repeatAttributes = {
        label: $L("Repeat"),
        choices: [{
            label: $L("No Repeat"),
            value: "0"
        }, {
            label: $L("Weekly"),
            value: "1"
        }, {
            label: $L("Monthly"),
            value: "2"
        }, {
            label: $L("Yearly"),
            value: "3"
        }, {
            label: $L("Daily"),
            value: "4"
        }, {
            label: $L("Biweekly"),
            value: "5"
        }, {
            label: $L("Bimonthly"),
            value: "6"
        }, {
            label: $L("Semiannually"),
            value: "7"
        }, {
            label: $L("Quarterly"),
            value: "8"
        }, {
            label: $L("With Parent"),
            value: "9"
        }, {
            label: $L("Advanced"),
            value: "50"
        }]
    }, this.repeatModel = {
        value: this.repeat,
        disabled: false
    });
    
    // Add Repeat From toggle button
    this.controller.setupWidget('RepeatFromToggleId', this.repeatFromAttributes = {
        trueLabel: $L('Completed'),
        falseLabel: $L('Due Date')
    }, this.repeatFromModel = {
        value: false,
        disabled: false
    });
    
    // Add Reminder selector button
	
	var reminderChoices = [];
	if (MyAPP.account.pro === 1) {
		reminderChoices = [{
            label: $L("No Reminder"),
            value: "0"
        }, {
            label: "15 " + $L("minutes"),
            value: "15"
        }, {
            label: "30 " + $L("minutes"),
            value: "30"
        }, {
            label: "45 " + $L("minutes"),
            value: "45"
        }, {
            label: "1 " + $L("hour"),
            value: "60"
        }, {
            label: "1.5 " + $L("hours"),
            value: "90"
        }, {
            label: "2 " + $L("hours"),
            value: "120"
        }, {
            label: "3 " + $L("hours"),
            value: "180"
        }, {
            label: "4 " + $L("hours"),
            value: "240"
        }, {
            label: "1 " + $L("day"),
            value: "1440"
        }, {
            label: "2 " + $L("days"),
            value: "2880"
        }, {
            label: "3 " + $L("days"),
            value: "4320"
        }, {
            label: "4 " + $L("days"),
            value: "5760"
        }, {
            label: "5 " + $L("days"),
            value: "7200"
        }, {
            label: "6 " + $L("days"),
            value: "8640"
        }, {
            label: "1 " + $L("week"),
            value: "10080"
        }, {
            label: "1 " + $L("year"),
            value: "20160"
        }, {
            label: "2 " + $L("years"),
            value: "40320"
        }];
	}
	else {
		reminderChoices =  [{
            label: $L("No Reminder"),
            value: "0"
        }, {
            label: "1 " + $L("hour"),
            value: "60"
        }];
	}
    this.controller.setupWidget("ReminderSelectorId", this.reminderAttributes = {
        label: $L("Reminder"),
		choices: reminderChoices
    }, this.reminderModel = {
        value: this.reminder,
        disabled: false
    });
    
    // Add Note text input field
    this.controller.setupWidget("NoteId", this.noteAttributes = {
        hintText: $L('Notes') + '...',
        multiline: true,
        enterSubmits: false,
        autoFocus: false,
        changeOnKeyPress: true,
        autoReplace: true,
        focusMode: Mojo.Widget.focusInsertMode
    }, this.noteModel = {
        value: ""
    });
	
    // Add Length text input field
    this.controller.setupWidget("LengthId", this.lengthAttributes = {
        hintText: $L('Length (min)') + '...',
        multiline: true,
        enterSubmits: false,
        autoFocus: false,
        changeOnKeyPress: true,
        autoReplace: true,
        focusMode: Mojo.Widget.focusInsertMode
    }, this.lengthModel = {
        value: ""
    });
    
    // Add Tags text input field
    this.controller.setupWidget("TagsId", this.noteAttributes = {
        hintText: $L('Tags') + '...',
        multiline: true,
        enterSubmits: false,
        autoFocus: false,
        changeOnKeyPress: true,
        focusMode: Mojo.Widget.focusInsertMode
    }, this.tagModel = {
        value: ""
    });
    
    
    // Setup scrim and spinner to indicate activity while getting tasks
    this.controller.setupWidget('Spinner', this.spinnerAttributes = {
        spinnerSize: Mojo.Widget.spinnerLarge
    }, this.spinnerModel = {
        spinning: false
    });
    this.controller.get('Scrim').hide();
	
	// Setup subtask list
	this.controller.setupWidget('subtaskListing', 
		{
			itemTemplate: 'addtask/taskRowTemplate',
			listTemplate: 'addtask/taskListTemplate',
			swipeToDelete: true,
			autoconfirmDelete: false,
			renderLimit: 30,  // had to increase to get drawers in list to work correctly
			//dividerFunction: this.taskDivider.bind(this),
			dividerTemplate: 'intro/divider',
			//filterFunction: this.filterFunction.bind(this),
			delay: 200,
			addItemLabel: $L("Add subtask"),
			formatters: {
				duedate: taskUtils.formatDueDate.bind(this),
				duetime: taskUtils.formatDueTime.bind(this),
				//folder: taskUtils.formatFolder.bind(this),
				//context: taskUtils.formatContext.bind(this),
				star: taskUtils.formatStar.bind(this),
				note: taskUtils.formatNote.bind(this),
				hasnote: taskUtils.formatHasNote.bind(this),
				priority: taskUtils.formatPriority.bind(this)
				//parent: taskUtils.formatParent.bind(this)
				},

		reorderable: false
		},
		//this.taskListModel = {items: []}
		//this.taskListModel = {items: [], disabled: false}
		this.subtaskListModel = {disabled: false,
			items: [
				{title: "Task 1", parent: "111"},
				{title: "Task 2", parent: "111"}
			]
		}
	);
	this.controller.get('subtaskListLabel').innerHTML = $L("Subtasks");
	this.controller.get('subtaskListCount').innerHTML = $L("None");
	this.controller.setupWidget('subtaskDrawer', {}, {open: false});
	this.drawerTapHandler = this.drawerTap.bindAsEventListener(this);
	this.controller.listen('subtaskListCount', Mojo.Event.tap, this.drawerTapHandler);
	this.parentRowTapHandler = this.parentRowTap.bindAsEventListener(this);
	this.controller.listen('ParentRow', Mojo.Event.tap, this.parentRowTapHandler);
	this.subtaskListTapHandler = this.subtaskListTap.bindAsEventListener(this);
	this.controller.listen('subtaskListing', Mojo.Event.listTap, this.subtaskListTapHandler);
	this.subtaskListAddHandler = this.subtaskListAdd.bindAsEventListener(this);
	this.controller.listen('subtaskListing', Mojo.Event.listAdd, this.subtaskListAddHandler);
	this.controller.setupWidget('taskCheck', {
		modelProperty: "done"
	});
	
    
    // Setup command menu
    
    this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {
        items: [
			{
			icon: 'new',
			command: 'add-task'
			},
			{
 			icon: "copytask",
            command: "copy-task"
        	}
/*			,
			{
				icon: 'sub-task',
				command: 'make-subtask'
			}
*/
		]
    });
    
    /* add event handlers to listen to events from widgets */
    this.datePropertyChangedHandler = this.datePropertyChanged.bind(this);
    this.controller.listen('DueDateSelectorId', Mojo.Event.propertyChange, this.datePropertyChangedHandler);
    this.timePropertyChangedHandler = this.timePropertyChanged.bind(this);
    this.controller.listen('DueTimeRow', Mojo.Event.tap, this.timePropertyChangedHandler);
    
    this.startdatePropertyChangedHandler = this.startdatePropertyChanged.bind(this);
    this.controller.listen('StartDateSelectorId', Mojo.Event.propertyChange, this.startdatePropertyChangedHandler);
    this.starttimePropertyChangedHandler = this.starttimePropertyChanged.bind(this);
    this.controller.listen('StartTimeRow', Mojo.Event.tap, this.starttimePropertyChangedHandler);
    
    this.starChangedHandler = this.starChanged.bind(this);
    this.controller.listen('star', Mojo.Event.tap, this.starChangedHandler);
    this.controller.listen('notstar', Mojo.Event.tap, this.starChangedHandler);
    
    this.dirtyHandler = this.saveTask.bind(this);
    //this.controller.listen(this.controller.document, Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('TaskInputId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('FolderSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('PrioritySelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('ContextSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('GoalSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('StatusSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('RepeatSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('RepeatFromToggleId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('ReminderSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('NoteId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('LengthId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.listen('TagsId', Mojo.Event.propertyChanged, this.dirtyHandler);
    
    this.checkChangeHandler = this.checkChange.bindAsEventListener(this);
    this.controller.listen('addTaskCheck', Mojo.Event.propertyChanged, this.checkChangeHandler);

	this.checkChangeHandlerSub = this.checkChangeSub.bindAsEventListener(this);
	this.controller.listen('subtaskListing', Mojo.Event.propertyChange, this.checkChangeHandlerSub);
    
};

AddtaskAssistant.prototype.subtaskListTap = function (event) {
	//Mojo.Log.info("Subtask List Tap");
	//debugObject(event.originalEvent.target, 'noFuncs');
	//Mojo.Log.info("Event target", event.originalEvent.target.className);
	//Mojo.Log.info("Event item %j", event.item);
	
	var className = event.originalEvent.target.className;
	switch (className) {
		case 'subtaskIcon':
			event.item.parent = '';
			taskUtils.saveToDB(event.item, taskUtils.returnFromDb.bind(this));
			this.subtaskListModel.items.splice(event.index, 1);
			this.controller.modelChanged(this.subtaskListModel);
			this.controller.get('subtaskListCount').innerHTML = 
				this.subtaskListModel.items.length + " " +$L("Subtasks");
			break;
		default:
			this.saveTask();
			this.controller.stageController.pushScene('addtask', event.item.value);
			break;
	}
};

AddtaskAssistant.prototype.subtaskListAdd = function (title) {
	var mytask = taskUtils.newTask();
	mytask.parent = this.task.value;
	mytask.folder = this.task.folder;
	mytask.goal = this.task.goal;
	mytask.context = this.task.context;
	mytask.tag = this.task.tag;
	mytask.status = this.task.status;
	dao.updateTask(mytask, function () {});
	this.controller.stageController.pushScene('addtask', 
			mytask.value);	
};

AddtaskAssistant.prototype.parentRowTap = function (event) {
	//Mojo.Log.info("Parent Row Tap");
	this.saveTask();
	this.controller.stageController.pushScene('addtask', 
			this.task.parent);	
	
};

AddtaskAssistant.prototype.subtaskListChoose = function (event) {
	//Mojo.Log.info("Subtaks Choose event %j", event);
};

AddtaskAssistant.prototype.drawerTap = function (event) {
	//Mojo.Log.info("Drawer Tap");
	//debugObject(event.target, 'noFuncs');
	switch (event.target.id){ 
		case 'subtaskListCount':
			this.controller.get('subtaskDrawer').mojo.toggleState();
			break;		
	}
	//this.updateCounts();
};

AddtaskAssistant.prototype.handleCommand = function(event){
    switch (event.command) {
		case "add-task":
			this.addTask();
			break;
        case "copy-task":
            this.copyTask();
            break;
        case "field-config":
            this.controller.stageController.pushScene('field-config');
            break;
		case "save-task":
			this.controller.stageController.popScene();
			break;
		case "make-subtask":
			this.subTask();
			break;
    }
};

AddtaskAssistant.prototype.addTask = function (title) {
/* THIS FUNCTION IS NOT WORKING PROPERLY!!!!! */
	var nowTime = Math.floor(new Date().getTime() / 1000) * 1000,
		folder, context, repeat;
		
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

	repeat = MyAPP.prefs.defaultRepeat;
	repeat = (MyAPP.prefs.repeatFromCompleted) ? repeat + 100 : repeat;
	
    // save original task
    this.saveTask();
    
    this.task = {
		id: 0,
		parent: "",
		children: "",
		title: title || "", // uses FilterList to add a new task...
		tag: "",
		folder: folder,
		context: context,
		goal: MyAPP.prefs.defaultGoal,
		added: nowTime,
		modified:nowTime,
		duedate: utils.makeDueDate(MyAPP.prefs.defaultDueDate, ""),
		startdate: utils.makeDueDate(MyAPP.prefs.defaultStartDate, ""),
		duetime: "",
		starttime: "",
		reminder: 0,
		repeat: repeat,
		completed: "",
		completedon: "",
		rep_advanced: "",
		status: MyAPP.prefs.defaultStatus,
		star: 0,
		priority: MyAPP.prefs.defaultPriority,
		length: 0,
		timer: 0,
		note: "",
		value: nowTime
	};
    
    // need to do something about saveCookie, etc.
    dao.updateTask(this.task, function(){
    });
	
	this.taskValue = this.task.value;
	this.loadData();
	
	Mojo.Controller.getAppController().showBanner(
		{messageText: MyAPP.appName + " " + $L("task saved")},
		{}
	);
	
};

AddtaskAssistant.prototype.subTask = function(){
	var dashboardStage = Mojo.Controller.getAppController().getStageProxy("dashnotify");
	if (true) { //(dashboardStage) {
		//Mojo.Log.info("Updating Notifications", Mojo.appInfo.id);
		new Mojo.Service.Request('palm://com.palm.applicationManager', {
			method: "launch",
			parameters: {
				'id': Mojo.appInfo.id,
				'params': {
					action: 'notify'
				}
			}
		});
		//Mojo.Log.info("Called relaunch with Notify");
	}
};

AddtaskAssistant.prototype.copyTask = function(){

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
    dao.updateTask(this.task, function(){
    });
	
	Mojo.Controller.getAppController().showBanner(
		{messageText: MyAPP.appName + " " + $L("task duplicated")},
		{}
	);
    
};

AddtaskAssistant.prototype.checkChangeSub = function (event) {
	//Mojo.Log.info("Sub Check Changed!");
	//Mojo.Log.info("Event model %j", event.model.done);
	
	//taskUtils.checkChange(event.model);

};

AddtaskAssistant.prototype.checkChange = function(event){
    var repeatFromCompleted, newDueDate, newStartDate, repeat, newTask, diff;
    Mojo.Log.info("Event id:", event.target.id);
    // Changed the "Completed" checkbox
    var nowTime = Math.floor(new Date().getTime() / 1000) * 1000;
    this.task.modified = nowTime;
    if (this.addTaskCheckModel.value) {
        this.task.completed = nowTime;
        if (this.task.repeat && (this.task.duedate || this.task.startdate)) {
            //diff = this.task.duedate *1 - this.task.startdate *1;
            //Mojo.Log.info("Repeat Task!", this.task.repeat);
            repeatFromCompleted = false;
            repeat = this.task.repeat;
            if (repeat > 99) {
                repeatFromCompleted = true;
                repeat = repeat - 100;
            }
            if (repeat > 49) {
                //Mojo.Log.info("Can't handle advanced repeats!!");
            }
            else {
                newDueDate = (repeatFromCompleted) ? new Date() : new Date(this.task.duedate);
                newStartDate = (repeatFromCompleted) ? new Date() : new Date(this.task.startdate);
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
                newTask = Object.clone(this.task);
                
                // Add new task with completed true
                newTask.repeat = 0;
                newTask.id = 0;
                newTask.value = nowTime;
                dao.updateTask(newTask, function(){
                    //Mojo.Log.info("Created repeat task");
                });
                
                // Update task with new due date & not completed
                if (this.task.duedate) {
                    this.task.duedate = newDueDate.getTime();
                }
                this.task.completed = "";
                
                // If it had a startdate, update that as well...
                if (this.task.startdate) {
                    this.task.startdate = newStartDate.getTime();
                }
                //Mojo.Log.info("Updating Task %j", this.task);
                dao.updateTask(this.task, function(){
                });
                this.task = newTask;
            }
        }
		notify.updateNotifications(false, this.task.value+'');
		
    }
    else {
        this.task.completed = '';
		this.task.completedon = '';
    }
    
    this.saveTask();
	// update notifications if the notification stage is open
	
};


AddtaskAssistant.prototype.starChanged = function(event){
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
    this.saveTask();
};

AddtaskAssistant.prototype.timePropertyChanged = function(event){
    //Mojo.Log.info("Due Time Tapped!", this.task.duetime);
    var myTime = (this.task.duetime) ? new Date(this.task.duetime) : new Date();
    //Mojo.Log.info("myTime is", myTime);
    this.controller.showDialog({
        template: 'addtask/gototime',
        assistant: new GoToTimeAssistant(this, myTime, this.gotTime.bind(this))
    });
};

AddtaskAssistant.prototype.gotTime = function(date){
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
    this.saveTask();
};

AddtaskAssistant.prototype.starttimePropertyChanged = function(event){
    //Mojo.Log.info("Start Time Tapped!", this.task.starttime);
    var myTime = (this.task.starttime) ? new Date(this.task.starttime) : new Date();
    //Mojo.Log.info("myTime is", myTime);
    this.controller.showDialog({
        template: 'addtask/gototime',
        assistant: new GoToTimeAssistant(this, myTime, this.gotStartTime.bind(this))
    });
};

AddtaskAssistant.prototype.gotStartTime = function(date){
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
    this.saveTask();
};


AddtaskAssistant.prototype.startdatePropertyChanged = function(event){
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
        this.saveTask();
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
        this.saveTask();
    }
};

AddtaskAssistant.prototype.gotDate = function(date){
    //Mojo.Log.info("New Date is:", date);
    this.task.duedate = date.getTime();
    this.task.duedateval = "6";
    this.dueDateString = Mojo.Format.formatDate(new Date(this.task.duedate), {
        date: 'medium'
    });
    this.dueChoices = [{
        label: $L("No Due Date"),
        value: "0"
    }, {
        label: $L("Today"),
        value: "1"
    }, {
        label: $L("Tomorrow"),
        value: "2"
    }, {
        label: $L("In One Week"),
        value: "3"
    }, {
        label: $L("In One Month"),
        value: "4"
    }, {
        label: $L("In One Year"),
        value: "5"
    }, {
        label: this.dueDateString,
        value: "6"
    }, {
        label: $L("Other") + "...",
        value: "7"
    }];
    this.duedateModel.value = "6";
    this.duedateModel.choices = this.dueChoices;
    this.controller.modelChanged(this.duedateModel);
    
    // NOTE: there is a currently a bug in webOS that loses your scroll position when calling a customDialog.
    // The following lines are a hack to scroll back to the top of the scene.
    var scroller = this.controller.getSceneScroller();
    //call the widget method for scrolling to the top
    scroller.mojo.revealTop(0);
    
    this.saveTask();
    
};

AddtaskAssistant.prototype.gotStartDate = function(date){
    //Mojo.Log.info("New Date is:", date);
    this.task.startdate = date.getTime();
    this.task.startdateval = "6";
    this.startDateString = Mojo.Format.formatDate(new Date(this.task.startdate), {
        date: 'medium'
    });
    this.startChoices = [{
        label: $L("No Due Date"),
        value: "0"
    }, {
        label: $L("Today"),
        value: "1"
    }, {
        label: $L("Tomorrow"),
        value: "2"
    }, {
        label: $L("In One Week"),
        value: "3"
    }, {
        label: $L("In One Month"),
        value: "4"
    }, {
        label: $L("In One Year"),
        value: "5"
    }, {
        label: this.startDateString,
        value: "6"
    }, {
        label: $L("Other") + "...",
        value: "7"
    }];
    this.startdateModel.value = "6";
    this.startdateModel.choices = this.startChoices;
    this.controller.modelChanged(this.startdateModel);
    
    // NOTE: there is a currently a bug in webOS that loses your scroll position when calling a customDialog.
    // The following lines are a hack to scroll back to the top of the scene.
    var scroller = this.controller.getSceneScroller();
    //call the widget method for scrolling to the top
    scroller.mojo.revealTop(0);
    
    this.saveTask();
    
};

AddtaskAssistant.prototype.aboutToActivate = function (callback) {
	this.activateCallback = callback;
	this.loadData();
};

AddtaskAssistant.prototype.activate = function(event){
    /* put in event handlers here that should only be in effect when this scene is active. For
     example, key handlers that are observing the document */
    //this.loadData();
};

AddtaskAssistant.prototype.loadData = function(){
    // Retrieve info from database - start with folders
    dao.retrieveFolders(this.gotFoldersDb.bind(this));
    
    //Hide fields based on field-config settings
    var fields = [{
        field: "notes",
        row: "NotesRow",
        value: MyAPP.fields.notes
    }, {
        field: "folder",
        row: "FolderRow",
        value: MyAPP.fields.folder
    }, {
        field: "context",
        row: "ContextRow",
        value: MyAPP.fields.context
    }, {
        field: "goal",
        row: "GoalRow",
        value: MyAPP.fields.goal
    }, {
        field: "tags",
        row: "TagsRow",
        value: MyAPP.fields.tags
    }, {
        field: "priority",
        row: "PriorityRow",
        value: MyAPP.fields.priority
    }, {
        field: "duedate",
        row: "DueDateRow",
        value: MyAPP.fields.duedate
    }, {
        field: "duetime",
        row: "DueTimeRow",
        value: MyAPP.fields.duetime
    }, {
        field: "startdate",
        row: "StartDateRow",
        value: MyAPP.fields.startdate
    }, {
        field: "starttime",
        row: "StartTimeRow",
        value: MyAPP.fields.starttime
    }, {
        field: "status",
        row: "StatusRow",
        value: MyAPP.fields.status
    }, {
        field: "repeat",
        row: "RepeatRow",
        value: MyAPP.fields.repeat
    }, {
        field: "repeatfrom",
        row: "RepeatFromRow",
        value: MyAPP.fields.repeatfrom
    }, {
        field: "reminder",
        row: "ReminderRow",
        value: MyAPP.fields.reminder
    }, {
        field: "star",
        row: "StarRow",
        value: MyAPP.fields.star
    }, {
        field: "length",
        row: "LengthRow",
        value: MyAPP.fields.length
    }];
    
    for (i = 0; i < fields.length; i++) {
        if (fields[i].value) {
            this.controller.get(fields[i].row).show();
        }
        else {
            this.controller.get(fields[i].row).hide();
        }
    }
    
    //can't remember why this is here...!
    MyAPP.saveCookie.remove();
};

AddtaskAssistant.prototype.showDates = function () {
		var a = new Date(this.task.added);
		//a = a.setMinutes(a.getMinutes() - a.getTimezoneOffset());
		//Mojo.Log.info(a);
		var m = new Date(this.task.modified);
		//m = m.setMinutes(m.getMinutes() - m.getTimezoneOffset());
		
		this.controller.get('taskdetails').innerHTML =  $L("Added") + ": " +
			Mojo.Format.formatDate(new Date(a), 'medium') +
			"<br />" + $L("Modified") + ": " + 
			Mojo.Format.formatDate(new Date(m), 'medium');
};


AddtaskAssistant.prototype.gotFoldersDb = function(response){
    //Mojo.Log.info("Folders response is %j", response, response.length);
    this.folders = [{
        id: 0,
        label: $L("No Folder"),
        value: 0
    }];
    this.folders = this.folders.concat(response);
    this.folders.sort(this.sortByFolderSort.bind(this));
    
    // Retrieve contexts
    dao.retrieveContexts(this.gotContextsDb.bind(this));
};

AddtaskAssistant.prototype.sortByFolderSort = function(a, b){
    return (a.sortorder - b.sortorder);
};
AddtaskAssistant.prototype.gotContextsDb = function(response){
    //Mojo.Log.info("Contexts response is %j", response);
    this.contexts = [{
        id: 0,
        label: $L("No Context"),
        value: 0
    }];
    this.contexts = this.contexts.concat(response);
    
    // Retrieve goals
    dao.retrieveGoals(this.gotGoalsDb.bind(this));
};

AddtaskAssistant.prototype.gotGoalsDb = function(response){
    //Mojo.Log.info("Goals response is %j", response);
    var sqlString;
    this.goals = [{
        id: 0,
        label: $L("No Goal"),
        value: 0
    }];
    this.goals = this.goals.concat(response);
    
    // Retrieve task by value;
    sqlString = "SELECT * FROM tasks WHERE value=" + this.taskValue + ";GO;";
	//Mojo.Log.info("SQL String is: ", sqlString);
    dao.retrieveTasksByString(sqlString, this.gotTasks.bind(this));
};



AddtaskAssistant.prototype.gotTasks = function(responseText){
    //Mojo.Log.info("Task: %j", responseText);
    this.task = responseText[0];
    
    var startTimeString = $L("No Start Time");
    var dueTimeString = $L("No Due Time");
    if (this.task.duetime) {
        dueTimeString = Mojo.Format.formatDate(new Date(this.task.duetime), {
            time: 'short'
        });
    }
    this.controller.get('dueTimeId').innerHTML = dueTimeString;
    if (this.task.starttime) {
        startTimeString = Mojo.Format.formatDate(new Date(this.task.starttime), {
            time: 'short'
        });
    }
    this.controller.get('startTimeId').innerHTML = startTimeString;
    
    if (this.task.duedate) {
        //Mojo.Log.info("Task has duedate", new Date(this.task.duedate));
        this.task.duedateval = "6";
        this.dueDateString = Mojo.Format.formatDate(new Date(this.task.duedate), {
            date: 'medium'
        });
        this.dueChoices = [{
            label: $L("No Due Date"),
            value: "0"
        }, {
            label: $L("Today"),
            value: "1"
        }, {
            label: $L("Tomorrow"),
            value: "2"
        }, {
            label: $L("In One Week"),
            value: "3"
        }, {
            label: $L("In One Month"),
            value: "4"
        }, {
            label: $L("In One Year"),
            value: "5"
        }, {
            label: this.dueDateString,
            value: "6"
        }, {
            label: $L("Other") + "...",
            value: "7"
        }];
    }
    else {
        this.task.duedateval = "0";
        this.dueChoices = [{
            label: $L("No Due Date"),
            value: "0"
        }, {
            label: $L("Today"),
            value: "1"
        }, {
            label: $L("Tomorrow"),
            value: "2"
        }, {
            label: $L("In One Week"),
            value: "3"
        }, {
            label: $L("In One Month"),
            value: "4"
        }, {
            label: $L("In One Year"),
            value: "5"
        }, {
            label: $L("Other") + "...",
            value: "7"
        }];
    }
    if (this.task.startdate) {
        //Mojo.Log.info("Task has startdate", new Date(this.task.startdate));
        this.task.startdateval = "6";
        this.startDateString = Mojo.Format.formatDate(new Date(this.task.startdate), {
            date: 'medium'
        });
        this.startChoices = [{
            label: $L("No Start Date"),
            value: "0"
        }, {
            label: $L("Today"),
            value: "1"
        }, {
            label: $L("Tomorrow"),
            value: "2"
        }, {
            label: $L("In One Week"),
            value: "3"
        }, {
            label: $L("In One Month"),
            value: "4"
        }, {
            label: $L("In One Year"),
            value: "5"
        }, {
            label: this.startDateString,
            value: "6"
        }, {
            label: $L("Other") + "...",
            value: "7"
        }];
    }
    else {
        this.task.startdateval = "0";
        this.startChoices = [{
            label: $L("No Start Date"),
            value: "0"
        }, {
            label: $L("Today"),
            value: "1"
        }, {
            label: $L("Tomorrow"),
            value: "2"
        }, {
            label: $L("In One Week"),
            value: "3"
        }, {
            label: $L("In One Month"),
            value: "4"
        }, {
            label: $L("In One Year"),
            value: "5"
        }, {
            label: $L("Other") + "...",
            value: "7"
        }];
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
    
    this.reminderModel.value = this.task.reminder;
    this.controller.modelChanged(this.reminderModel);
    
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
    
    this.goalModel.choices = this.goals;
    this.goalModel.value = this.task.goal;
    this.controller.modelChanged(this.goalModel);
    
    this.statusModel.value = this.task.status;
    this.controller.modelChanged(this.statusModel);
    
    this.noteModel.value = this.task.note;
    this.controller.modelChanged(this.noteModel);

    this.lengthModel.value = this.task.length + "";
    this.controller.modelChanged(this.lengthModel);
    
    this.tagModel.value = this.task.tag;
    this.controller.modelChanged(this.tagModel);
    
    this.addTaskCheckModel.value = (this.task.completed > 0) ? true : false;
    this.controller.modelChanged(this.addTaskCheckModel);
	
	
	if (MyAPP.account.pro === 1) {
		if (this.task.parent) {
			this.controller.get("SubtaskRow").hide();
			sqlString = "SELECT title FROM tasks WHERE value=" + this.task.parent + ";GO;";
			dao.retrieveTasksByString(sqlString, this.gotParent.bind(this));
			
		}
		else {
			sqlString = "SELECT * FROM tasks WHERE parent=" + this.taskValue + ";GO;";
			dao.retrieveTasksByString(sqlString, this.gotSubtasks.bind(this));			
		}
	}
	else {
		this.controller.get("SubtaskRow").hide();
		this.controller.get("ParentRow").hide();	
		this.activateCallback();	
	}
	this.showDates();
};

AddtaskAssistant.prototype.gotSubtasks = function (response) {
	//Mojo.Log.info("Subtasks: %j", response);
	this.controller.get('subtaskListCount').innerHTML = response.length + " " +$L("Subtasks");
	var i;
	for (i = 0; i < response.length; i++){
		response[i].done = response[i].completed ? true : false;
	}
	this.subtaskListModel.items = response;
	this.controller.modelChanged(this.subtaskListModel);
	this.activateCallback();
};

AddtaskAssistant.prototype.gotParent = function (response) {
	//Mojo.Log.info("Parent %j", response);
	this.controller.get("parentTitle").innerHTML = response[0].title;
	this.controller.get("ParentRow").show();
	this.activateCallback();
};

AddtaskAssistant.prototype.loadNewTask = function(taskValue){
    //Mojo.Log.info("Load New Task:", taskValue);
    this.saveTask();
    var sqlString = "SELECT * FROM tasks WHERE value=" + taskValue + ";GO;";
    dao.retrieveTasksByString(sqlString, this.gotTasks.bind(this));
	sqlString = "SELECT * FROM tasks WHERE parent=" + taskValue + ";GO;";
	dao.retrieveTasksByString(sqlString, this.gotSubtasks.bind(this));
};


AddtaskAssistant.prototype.deactivate = function(event){
    if (!this.taskModel.value) {
        // No title - delete task!
        dao.deleteTaskValue(this.task.value, function(){
        });
    }
    //this.saveTask();
};

AddtaskAssistant.prototype.saveTask = function(){
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
     this scene is popped or another scene is pushed on top */
    var temp, temp2;
    this.task.title = this.taskModel.value;
    this.task.folder = this.folderModel.value ? this.folderModel.value : 0;
    this.task.priority = this.priorityModel.value;
    this.task.context = this.contextModel.value ? this.contextModel.value : "0";
    this.task.goal = this.goalModel.value ? this.goalModel.value : 0;
    this.task.tag = this.tagModel.value;
    this.task.status = this.statusModel.value;
    this.task.repeat = this.repeatModel.value;
    this.task.reminder = this.reminderModel.value;
    if (this.repeatFromModel.value) {
        this.task.repeat = this.task.repeat * 1 + 100;
    }
    //Mojo.Log.info("Repeat:", this.task.repeat);
    this.task.duedate = utils.makeDueDate(this.duedateModel.value, this.task.duedate);
    
    if (this.task.duedate && this.task.duetime) {
        temp = new Date(this.task.duetime);
        temp2 = new Date(this.task.duedate);
        temp2.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
        this.task.duetime = temp2.getTime();
    }
    
    this.task.startdate = utils.makeDueDate(this.startdateModel.value, this.task.startdate);
    
    if (this.task.startdate && this.task.starttime) {
        temp = new Date(this.task.starttime);
        temp2 = new Date(this.task.startdate);
        temp2.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
        this.task.starttime = temp2.getTime();
    }
    
    this.task.note = this.noteModel.value;
	this.task.length = this.lengthModel.value * 1;
    //Mojo.Log.info("Duedate:", this.task.duedate, new Date(this.task.duedate));

	taskUtils.saveToDB(this.task, taskUtils.returnFromDb);    
	this.showDates();
};

AddtaskAssistant.prototype.saveToDB = function (task) {
    var nowTime = Math.floor(new Date().getTime() / 1000) * 1000;
    task.modified = nowTime;
    MyAPP.local.lastaddedit = nowTime / 1000;
	MyAPP.prefsDb.add('local', MyAPP.local, 
		function () {},
		function (event) {
			//Mojo.Log.info("Prefs DB failure %j", event);
		});
    
    // Save data to a cookie in the event the user closes app before DB commit
    // Will check for this cookie on app load and resave to DB if needed.
    MyAPP.saveCookie = new Mojo.Model.Cookie(MyAPP.appName + ".save");
    MyAPP.saveCookie.put(task);
    
    // Save info to database
    // update existing entry in database
    
    //Mojo.Log.info("Updating Task: %j", this.task);
    dao.updateTask(task, this.returnFromDb.bind(this));
};

AddtaskAssistant.prototype.returnFromDb = function(){
    //Mojo.Log.info("Removing Save Cookie");
    MyAPP.saveCookie.remove();
    // Update notification alarm
    notify.getNextDate();
};


AddtaskAssistant.prototype.cleanup = function(event){
    /* this function should do any cleanup needed before the scene is destroyed as 
     a result of being popped off the scene stack */
    this.controller.stopListening('DueDateSelectorId', Mojo.Event.propertyChange, this.datePropertyChangedHandler);
    this.controller.stopListening('DueTimeRow', Mojo.Event.tap, this.timePropertyChangedHandler);
    
    this.controller.stopListening('StartDateSelectorId', Mojo.Event.propertyChange, this.startdatePropertyChangedHandler);
    this.controller.stopListening('StartTimeRow', Mojo.Event.tap, this.starttimePropertyChangedHandler);
    
    this.controller.stopListening('star', Mojo.Event.tap, this.starChangedHandler);
    this.controller.stopListening('notstar', Mojo.Event.tap, this.starChangedHandler);
    
    this.controller.stopListening('TaskInputId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('FolderSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('PrioritySelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('ContextSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('GoalSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('StatusSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('RepeatSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('RepeatFromToggleId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('ReminderSelectorId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('NoteId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('LengthId', Mojo.Event.propertyChanged, this.dirtyHandler);
    this.controller.stopListening('TagsId', Mojo.Event.propertyChanged, this.dirtyHandler);

	this.controller.stopListening('subtaskListCount', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('subtaskListing', Mojo.Event.listTap, this.subtaskListTapHandler);
 	this.controller.stopListening('subtaskListing', Mojo.Event.listAdd, this.subtaskListAddHandler);
	this.controller.stopListening('ParentRow', Mojo.Event.tap, this.parentRowTapHandler);
   
};

