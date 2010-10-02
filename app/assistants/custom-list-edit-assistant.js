function CustomListEditAssistant(customList) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

	  if (customList) {
	  	this.customListId = customList;
	  }
}

CustomListEditAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.controller.get('CustomListTitle').innerHTML = $L("Custom List");	
	this.controller.get('FiltersTitle').innerHTML = $L("Filters");
	this.controller.get('foldersListLabel').innerHTML = $L("Folders");
	this.controller.get('contextsListLabel').innerHTML = $L("Contexts");
	this.controller.get('goalsListLabel').innerHTML = $L("Goals");
	this.controller.get('tagsListLabel').innerHTML = $L("Tags");
	this.controller.get('priorityListLabel').innerHTML = $L("Priority");
	this.controller.get('starredListLabel').innerHTML = $L("Starred");
	this.controller.get('statusListLabel').innerHTML = $L("Status");
	this.controller.get('completedListLabel').innerHTML = $L("Completed");


	this.controller.get('DatesTitle').innerHTML = $L("Dates");
	this.controller.get('dueDateListLabel').innerHTML = $L("Due Dates");
	this.controller.get('DueDateToggleLabel').innerHTML = $L("Include Older");
	this.controller.get('NoDueDateToggleLabel').innerHTML = $L("No Due Date");
	this.controller.get('startDateListLabel').innerHTML = $L("Start Dates");
	this.controller.get('StartDateToggleLabel').innerHTML = $L("Include Older");
	this.controller.get('NoStartDateToggleLabel').innerHTML = $L("No Start Date");
	
	this.controller.get('SortTitle').innerHTML = $L('Sort') + " - " +$L("(drag to sort)");


	this.controller.get("yellowpad").style.backgroundColor = MyAPP.colors[MyAPP.prefs.color].color; //"#D2F7D4";
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
    // Add Custom List Name text input field
    this.controller.setupWidget("CustomListNameId", this.nameAttributes = {
        hintText: $L('Custom list name') + '...',
        multiline: false,
        enterSubmits: false,
        autoFocus: false,
        changeOnKeyPress: true,
        focusMode: Mojo.Widget.focusSelectMode
    }, 
		this.customListNameModel = {
        value: ""
		//value: this.customList.label
    });
	
	this.controller.setupWidget('customCheck', {
		modelProperty: 'selected'
	});
	
	this.controller.setupWidget('foldersList', {
		itemTemplate: 'custom-list-edit/foldersRowTemplate',
		listTemplate: 'custom-list-edit/foldersListTemplate',
		swipeToDelete: false,
		renderLimit: 20,
		reorderable: false,
		autoconfirmDelete: false
	}, 
		this.folderListModel = {
			items: [
				{label: 'Folder A', selected: false},
				{label: 'Folder B', selected: true},
				{label: 'Folder C', selected: true}
			]
		}
	);
	this.controller.setupWidget('foldersDrawer', {}, {open: false});
	
	this.controller.setupWidget('contextsList', {
		itemTemplate: 'custom-list-edit/foldersRowTemplate',
		listTemplate: 'custom-list-edit/foldersListTemplate',
		swipeToDelete: false,
		renderLimit: 20,
		reorderable: false,
		autoconfirmDelete: false
	}, 
		this.contextListModel = {
			items: [
				{label: 'Context A', selected: true},
				{label: 'Context B', selected: true}
			]
		}
	);
	this.controller.setupWidget('contextsDrawer', {}, {open: false});

	this.controller.setupWidget('goalsList', {
		itemTemplate: 'custom-list-edit/foldersRowTemplate',
		listTemplate: 'custom-list-edit/foldersListTemplate',
		swipeToDelete: false,
		renderLimit: 20,
		reorderable: false,
		autoconfirmDelete: false
	}, 
		this.goalListModel = {
			items: [
				{label: 'Goal A', selected: true},
				{label: 'Goal B', selected: true}
			]
		}
	);
	this.controller.setupWidget('goalsDrawer', {}, {open: false});

	this.controller.setupWidget('tagsList', {
		itemTemplate: 'custom-list-edit/foldersRowTemplate',
		listTemplate: 'custom-list-edit/foldersListTemplate',
		swipeToDelete: false,
		renderLimit: 20,
		reorderable: false,
		autoconfirmDelete: false
	}, 
		this.tagsListModel = {
			items: [
				//{label: 'Tag A', selected: true},
				//{label: 'Tag B', selected: true}
			]
		}
	);
	this.controller.setupWidget('tagsDrawer', {}, {open: false});

	this.controller.setupWidget('priorityList', {
			itemTemplate: 'custom-list-edit/foldersRowTemplate',
			listTemplate: 'custom-list-edit/foldersListTemplate',
			swipeToDelete: false,
			renderLimit: 20,
			reorderable: false,
			autoconfirmDelete: false
		},
		this.priorityListModel = {
			items: []	
		}
	);
	this.controller.setupWidget('priorityDrawer', {}, {open: false});
	
	this.controller.setupWidget('starredList', {
			itemTemplate: 'custom-list-edit/foldersRowTemplate',
			listTemplate: 'custom-list-edit/foldersListTemplate',
			swipeToDelete: false,
			renderLimit: 20,
			reorderable: false,
			autoconfirmDelete: false
		},
		this.starredListModel = {
			items: []	
		}
	);
	this.controller.setupWidget('starredDrawer', {}, {open: false});

	this.controller.setupWidget('completedList', {
			itemTemplate: 'custom-list-edit/foldersRowTemplate',
			listTemplate: 'custom-list-edit/foldersListTemplate',
			swipeToDelete: false,
			renderLimit: 20,
			reorderable: false,
			autoconfirmDelete: false
		},
		this.completedListModel = {
			items: []	
		}
	);
	this.controller.setupWidget('completedDrawer', {}, {open: false});
	
	this.controller.setupWidget('statusList', 
		{
			itemTemplate: 'custom-list-edit/foldersRowTemplate',
			listTemplate: 'custom-list-edit/foldersListTemplate',
			swipeToDelete: false,
			renderLimit: 20,
			reorderable: false,
			autoconfirmDelete: false
		},
		this.statusListModel = {
	        items: []
		}
	);
	this.controller.setupWidget('statusDrawer', {}, {open: false});
	
	
	this.controller.setupWidget('DueDateSelector', {
			label: $L("Due Dates")
		},
		this.dueDateSelectorModel = {
			choices: [
				{label: $L("Overdue"), value: 0},
				{label: $L("Today"), value: 1},
				{label: $L("Tomorrow"), value: 2},
				{label: $L("Next Week"), value: 3},
				{label: $L("Next Month"), value: 4},
				{label: $L("No Due Date"), value: 5},				
				{label: $L("All Due Dates"), value: 6}
			],
			value: 6
		}
	);
	this.controller.setupWidget('DueDateOlderToggle', {	},
		this.dueDateOlderToggleModel ={
			value: false
		}
	);
	this.controller.setupWidget('NoDueDateToggle', {	},
		this.noDueDateToggleModel ={
			value: false
		}
	);
	this.controller.setupWidget('dueDateDrawer', {}, {open: false});


	this.controller.setupWidget('StartDateSelector', {
			label: $L("Start Dates")
		},
		this.startDateSelectorModel = {
			choices: [
				{label: $L("Overdue"), value: 0},
				{label: $L("Today"), value: 1},
				{label: $L("Tomorrow"), value: 2},
				{label: $L("Next Week"), value: 3},
				{label: $L("Next Month"), value: 4},
				{label: $L("No Start Date"), value: 5},				
				{label: $L("All Start Dates"), value: 6}
			],
			value: 6
		}
	);
	this.controller.setupWidget('StartDateOlderToggle', {	},
		this.startDateOlderToggleModel = {
			value: false
		}
	);
	this.controller.setupWidget('NoStartDateToggle', {	},
		this.noStartDateToggleModel = {
			value: false
		}
	);
	this.controller.setupWidget('startDateDrawer', {}, {open: false});
	
	this.controller.setupWidget('sortList',
 		{
			itemTemplate: 'custom-list-edit/sortRowTemplate',
			listTemplate: 'custom-list-edit/foldersListTemplate',
			swipeToDelete: false,
			renderLimit: 20,
			reorderable: true,
			autoconfirmDelete: false
		},
		this.sortListModel = {
	        items: [
							
			]
		}
 );
	
	/* add event handlers to listen to events from widgets */
	this.drawerTapHandler = this.drawerTap.bindAsEventListener(this);
	this.controller.listen('foldersListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('contextsListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('goalsListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('tagsListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('priorityListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('starredListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('completedListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('statusListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('dueDateListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.listen('startDateListLabel', Mojo.Event.tap, this.drawerTapHandler);
	
	this.sortListTapHandler = this.sortListTap.bindAsEventListener(this);
	this.controller.listen('sortList', Mojo.Event.listTap, this.sortListTapHandler);
	this.sortListReorderHandler = this.sortListReorder.bindAsEventListener(this);
	this.controller.listen('sortList', Mojo.Event.listReorder, this.sortListReorderHandler);
	
	this.listsTapHandler = this.listsTap.bindAsEventListener(this);
	this.controller.listen('foldersList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.listen('contextsList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.listen('goalsList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.listen('statusList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.listen('starredList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.listen('completedList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.listen('priorityList', Mojo.Event.propertyChange, this.listsTapHandler);
	//this.controller.listen('tagsList', Mojo.Event.propertyChange, this.listsTapHandler);

	this.dueDateChangeHandler = this.dueDateChange.bindAsEventListener(this);
	this.controller.listen('DueDateSelector', Mojo.Event.propertyChange, this.dueDateChangeHandler);
	this.controller.listen('StartDateSelector', Mojo.Event.propertyChange, this.dueDateChangeHandler);
	
	this.controller.setInitialFocusedElement(null); 
};

CustomListEditAssistant.prototype.dueDateChange = function(event){
	//Mojo.Log.info("Date Changed");
	this.controller.get('dueDateListCount').innerHTML = "(" +
		this.dueDateSelectorModel.choices[this.dueDateSelectorModel.value].label +
		")";
	this.controller.get('startDateListCount').innerHTML = "(" +
		this.startDateSelectorModel.choices[this.startDateSelectorModel.value].label +
		")";
	
	this.showDateOptions();
};

CustomListEditAssistant.prototype.showDateOptions = function () {
	if (this.dueDateSelectorModel.value * 1 === 5 || this.dueDateSelectorModel.value * 1 === 6) {
		this.controller.get("DueDateOlderRow").hide();
		this.controller.get("NoDueDateRow").hide();
	}
	else {
		this.controller.get("DueDateOlderRow").show();
		this.controller.get("NoDueDateRow").show();
		
	}
	if (this.startDateSelectorModel.value * 1 === 5 || this.startDateSelectorModel.value * 1 === 6) {
		this.controller.get("StartDateOlderRow").hide();
		this.controller.get("NoStartDateRow").hide();
	}
	else {
		this.controller.get("StartDateOlderRow").show();
		this.controller.get("NoStartDateRow").show();
		
	}
};

CustomListEditAssistant.prototype.listsTap = function (event) {
	//Mojo.Log.info("Lists Tap");
	//this.saveCustomList();
	this.updateCounts();
};

CustomListEditAssistant.prototype.sortListReorder = function (event) {
	this.sortListModel.items.splice(event.fromIndex, 1);
	this.sortListModel.items.splice(event.toIndex, 0, event.item);
	var i;
	for (i = 0; i < this.sortListModel.items.length; i++) {
		this.sortListModel.items[i].sortorder = i;
	}
	
};

CustomListEditAssistant.prototype.sortListTap = function (event) {
	//Mojo.Log.info("Sort List Tap %j", event.index);
	//debugObject(event, 'noFuncs');
	this.sortListModel.items[event.index].dir = 
		(this.sortListModel.items[event.index].dir === 'ASC') ?
		'DESC' : 'ASC';
	this.sortListModel.items[event.index].oppdir = 
		(this.sortListModel.items[event.index].dir === 'ASC') ?
		'ASC' : 'DESC';
	this.controller.modelChanged(this.sortListModel);
};

CustomListEditAssistant.prototype.drawerTap = function (event) {
	//Mojo.Log.info("Drawer Tap");
	//debugObject(event.target, 'noFuncs');
	switch (event.target.id){ 
		case 'foldersListLabel':
			this.controller.get('foldersDrawer').mojo.toggleState();
			break;
		case 'contextsListLabel':
			this.controller.get('contextsDrawer').mojo.toggleState();
			break;
		case 'goalsListLabel':
			this.controller.get('goalsDrawer').mojo.toggleState();
			break;
		case 'tagsListLabel':
			this.controller.get('tagsDrawer').mojo.toggleState();
			break;
		case 'priorityListLabel':
			this.controller.get('priorityDrawer').mojo.toggleState();
			break;
		case 'starredListLabel':
			this.controller.get('starredDrawer').mojo.toggleState();
			break;
		case 'completedListLabel':
			this.controller.get('completedDrawer').mojo.toggleState();
			break;
		case 'statusListLabel':
			this.controller.get('statusDrawer').mojo.toggleState();
			break;
		case 'dueDateListLabel':
			this.controller.get('dueDateDrawer').mojo.toggleState();
			break;
		case 'startDateListLabel':
			this.controller.get('startDateDrawer').mojo.toggleState();
			break;
		
	}
	//this.updateCounts();
};

CustomListEditAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

    // Retrieve custom list;
    dao.retrieveCustomList(this.customListId, this.gotCustomList.bind(this));
};

CustomListEditAssistant.prototype.gotCustomList = function (response) {
	
	if (response && response[0]) {
		//Mojo.Log.info (response[0].listobject);
		this.customList = response[0].listobject.evalJSON();
	}
	//Mojo.Log.info("Custom List is: %j", this.customList);
	
	this.customListNameModel.value = this.customList.label;
	this.controller.modelChanged(this.customListNameModel);
	this.controller.get('CustomListNameId').mojo.focus();	
	this.statusListModel.items = this.customList.status;
	this.controller.modelChanged(this.statusListModel);
	
	this.priorityListModel.items = this.customList.priority;
	this.controller.modelChanged(this.priorityListModel);
	
	this.starredListModel.items = this.customList.starred;
	this.controller.modelChanged(this.starredListModel);
	
	this.completedListModel.items = this.customList.completed;
	this.controller.modelChanged(this.completedListModel);
	
	this.dueDateSelectorModel.value = this.customList.duedate;
	this.controller.modelChanged(this.dueDateSelectorModel);
	this.dueDateOlderToggleModel.value = this.customList.duedatebefore;
	this.controller.modelChanged(this.dueDateOlderToggleModel);
	this.noDueDateToggleModel.value = this.customList.noduedates;
	this.controller.modelChanged(this.noDueDateToggleModel);
	
	this.startDateSelectorModel.value = this.customList.startdate;
	this.controller.modelChanged(this.startDateSelectorModel);
	this.startDateOlderToggleModel.value = this.customList.startdatebefore;
	this.controller.modelChanged(this.startDateOlderToggleModel);
	this.noStartDateToggleModel.value = this.customList.nostartdates;
	this.controller.modelChanged(this.noStartDateToggleModel);

	this.showDateOptions();
	
	this.sortListModel.items = this.customList.sort;
	this.controller.modelChanged(this.sortListModel);
	
	
	
	//this.notFolders = this.customList.folders.split(',');
	//this.notContexts = this.customList.contexts.split(',');
	//this.notGoals = this.customList.goals.split(',');
	
	
	
	//Get Folders from db
    dao.retrieveFolders(this.gotFoldersDb.bind(this));	
};

CustomListEditAssistant.prototype.gotFoldersDb = function(response){
    //Mojo.Log.info("Folders response is %j", response, response.length);
	var i;
    this.folderListModel.items = [{
        id: 0,
        label: $L("No Folder"),
        value: 0
    }];
    this.folderListModel.items = this.folderListModel.items.concat(response);
    this.folderListModel.items.sort(this.sortByFolderSort.bind(this));
	
	//Mojo.Log.info("Folders in customList %j", this.customList.folders);
	//Mojo.Log.info("Folders: %j", this.folderListModel.items);
	
 	for (i=0; i < this.folderListModel.items.length; i++) {
		if (this.customList.folders.indexOf(this.folderListModel.items[i].id) === -1) {
			this.folderListModel.items[i].selected = true;
		}
		else {
			this.folderListModel.items[i].selected = false;
		}
	}
 	this.controller.modelChanged(this.folderListModel);
	
    // Retrieve contexts
    dao.retrieveContexts(this.gotContextsDb.bind(this));
};

CustomListEditAssistant.prototype.sortByFolderSort = function(a, b){
    return (a.sortorder - b.sortorder);
};

CustomListEditAssistant.prototype.sortByLabel = function (a, b) {
	if (a.label > b.label) {
		return 1;
	}
	if (a.label < b.label) {
		return -1;
	}
	return 0;
};

CustomListEditAssistant.prototype.gotContextsDb = function(response){
    //Mojo.Log.info("Contexts response is %j", response);
	var i;
	response.sort(this.sortByLabel.bind(this));
    this.contextListModel.items = [{
        id: 0,
        label: $L("No Context"),
        value: 0
    }];
    this.contextListModel.items = this.contextListModel.items.concat(response);
    
  	for (i=0; i < this.contextListModel.items.length; i++) {
		if (this.customList.contexts.indexOf(this.contextListModel.items[i].id) === -1) {
			this.contextListModel.items[i].selected = true;
		}
		else {
			this.contextListModel.items[i].selected = false;
		}
	}
 	this.controller.modelChanged(this.contextListModel);

   // Retrieve goals
    dao.retrieveGoals(this.gotGoalsDb.bind(this));
};

CustomListEditAssistant.prototype.gotGoalsDb = function(response){
	//Mojo.Log.info("Goals response is %j", response);
	var i;
	response.sort(this.sortByLabel.bind(this));
	this.goalListModel.items = [{
		id: 0,
		label: $L("No Goal"),
		value: 0
	}];
	this.goalListModel.items = this.goalListModel.items.concat(response);
	
	for (i = 0; i < this.goalListModel.items.length; i++) {
		if (this.customList.goals.indexOf(this.goalListModel.items[i].id) === -1) {
			this.goalListModel.items[i].selected = true;
		}
		else {
			this.goalListModel.items[i].selected = false;
		}
	}
	this.controller.modelChanged(this.goalListModel);
	
	var sqlString = "SELECT DISTINCT tag FROM tasks;GO;";
	dao.retrieveTasksByString(sqlString, this.gotTagsDb.bind(this));
};


CustomListEditAssistant.prototype.gotTagsDb = function (response) {
	//Mojo.Log.info("Tags are %j", response);
	var tag, tagArray, i;
	this.tagsListModel.items = [
		{label: "No tags"}
	];
	response.each(function (tag, index){
		//Mojo.Log.info("Tag %s %j", index, tag);
		tagArray = tag.tag.split(",");
		for (i = 0; i < tagArray.length; i++) {
			tag = {};
			tag.label = (tagArray[i].replace(/^\s+/,""));
			tag.selected = true;
			if (tag.label) {
				this.tagsListModel.items.push(tag);
			}
		}	
	}.bind(this));
 	for (i=0; i < this.tagsListModel.items.length; i++) {
		if (!this.customList.tags || this.customList.tags.indexOf(this.tagsListModel.items[i].label) === -1) {
			this.tagsListModel.items[i].selected = true;
		}
		else {
			this.tagsListModel.items[i].selected = false;
		}
	}

	//Mojo.Log.info("Tags array %j", this.tagsListModel.items);
	this.controller.modelChanged(this.tagsListModel);
	
 	this.updateCounts();  
	this.dueDateChange();
};

CustomListEditAssistant.prototype.updateCounts = function ( ) {

	this.controller.get('foldersListCount').innerHTML = "(" + 
		this.countSelected(this.folderListModel) + " " + $L("of") + " " +
		this.folderListModel.items.length + ")";
	this.controller.get('contextsListCount').innerHTML = "(" + 
		this.countSelected(this.contextListModel) + " " + $L("of") + " " +
		this.contextListModel.items.length + ")";
	this.controller.get('goalsListCount').innerHTML = "(" + 
		this.countSelected(this.goalListModel) + " " + $L("of") + " " +
		this.goalListModel.items.length + ")";
	this.controller.get('tagsListCount').innerHTML = "(" + 
		this.countSelected(this.tagsListModel) + " " + $L("of") + " " +
		this.tagsListModel.items.length + ")";
	this.controller.get('statusListCount').innerHTML = "(" + 
		this.countSelected(this.statusListModel) + " " + $L("of") + " " +
		this.statusListModel.items.length + ")";
	this.controller.get('priorityListCount').innerHTML = "(" + 
		this.countSelected(this.priorityListModel) + " " + $L("of") + " " +
		this.priorityListModel.items.length + ")";
	
	var star = this.starredListModel.items[0].selected;
	var notstar = this.starredListModel.items[1].selected;
	var startext = $L("Neither");
	if (star) {
		if (notstar) {
			startext = $L("Both");
		}
		else {
			startext = $L("Starred");
		}
	}
	else {
		if (notstar) {
			startext = $L("Not Starred");
		}
	}
	this.controller.get('starredListCount').innerHTML = startext;
	
	var completed = this.completedListModel.items[0].selected;
	var notcompleted = this.completedListModel.items[1].selected;
	var completetext = $L("Neither");
	if (completed) {
		if (notcompleted) {
			completetext = $L("Both");
		}
		else {
			completetext = $L("Completed");
		}
	}
	else {
		if (notcompleted) {
			completetext = $L("Not Completed");
		}
	}
	this.controller.get('completedListCount').innerHTML = completetext;
};
 
CustomListEditAssistant.prototype.countSelected = function (listModel) {
	//Mojo.Log.info("ListModel %j", listModel);
	var count = 0;
	listModel.items.each(function (item) {
		if (item.selected) {
			//Mojo.Log.info("Count PlusPlus!");
			count ++;
		}		
	});
	return count;
};

CustomListEditAssistant.prototype.saveCustomList = function () {
	var i, customList = {};
	customList.id = this.customList.id;
	customList.label = this.customListNameModel.value;
	customList.folders = [];
	this.folderListModel.items.each(function (folder, index) {
		if (!folder.selected) {
			//Mojo.Log.info("Folder", folder.label, index);
			customList.folders.push(folder.id);
		}
	}); 
	customList.contexts = [];
	this.contextListModel.items.each(function (context, index) {
		if (!context.selected) {
			//Mojo.Log.info("Context", context.label, index);
			customList.contexts.push(context.id);
		}
	}); 
	customList.goals = [];
	this.goalListModel.items.each(function (goal, index) {
		if (!goal.selected) {
			//Mojo.Log.info("Goal", goal.label, index);
			customList.goals.push(goal.id);
		}
	}); 
	customList.tags = [];
	this.tagsListModel.items.each(function (tag, index) {
		if (!tag.selected) {
			//Mojo.Log.info("Tag", tag.label, index);
			customList.tags.push(tag.label);
		}
	}); 
	customList.status = this.statusListModel.items;
	customList.starred = this.starredListModel.items;
	customList.completed = this.completedListModel.items;
	customList.priority = this.priorityListModel.items;
	customList.duedate = this.dueDateSelectorModel.value;
	customList.duedatebefore = this.dueDateOlderToggleModel.value;
	customList.noduedates = this.noDueDateToggleModel.value;
	customList.startdate = this.startDateSelectorModel.value;
	customList.startdatebefore = this.startDateOlderToggleModel.value;
	customList.nostartdates = this.noStartDateToggleModel.value;
	
	customList.sort = this.sortListModel.items;
	
	//Mojo.Log.info("Custom List Object %j", customList.duedate);
	dao.updateCustomList(customList.id, customList.label, Object.toJSON(customList), 
		this.listUpdated.bind(this, customList.id));
	this.customList = customList;

};

CustomListEditAssistant.prototype.listUpdated = function (listId, results) {
	
};

CustomListEditAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  
	this.saveCustomList();	  
};

CustomListEditAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('foldersListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('contextsListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('goalsListLabel', Mojo.Event.tap, this.drawerTapHandler);
	//this.controller.stopListening('tagsListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('priorityListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('starredListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('completedListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('statusListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('dueDateListLabel', Mojo.Event.tap, this.drawerTapHandler);
	this.controller.stopListening('startDateListLabel', Mojo.Event.tap, this.drawerTapHandler);
	
	this.controller.stopListening('sortList', Mojo.Event.listTap, this.sortListTapHandler);
	this.controller.stopListening('sortList', Mojo.Event.listReorder, this.sortListReorderHandler);

	this.controller.stopListening('foldersList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.stopListening('contextsList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.stopListening('goalsList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.stopListening('statusList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.stopListening('starredList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.stopListening('completedList', Mojo.Event.propertyChange, this.listsTapHandler);
	this.controller.stopListening('priorityList', Mojo.Event.propertyChange, this.listsTapHandler);
	//this.controller.stopListening('tagsList', Mojo.Event.propertyChange, this.listsTapHandler);

	this.controller.stopListening('DueDateSelector', Mojo.Event.propertyChange, this.dueDateChangeHandler);
	this.controller.stopListening('StartDateSelector', Mojo.Event.propertyChange, this.dueDateChangeHandler);

};
