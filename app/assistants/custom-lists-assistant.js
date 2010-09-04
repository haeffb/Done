function CustomListsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

CustomListsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	this.controller.get('customListLabel').innerHTML = $L('Custom Lists');
		
	this.controller.get("yellowpad").style.backgroundColor = MyAPP.colors[MyAPP.prefs.color].color; //"#D2F7D4";
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.controller.setupWidget('customList', {
		itemTemplate: 'custom-lists/customListRowTemplate',
		listTemplate: 'custom-lists/customListTemplate',
		swipeToDelete: true,
		renderLimit: 20,
		reorderable: false,
		autoconfirmDelete: false,
		addItemLabel: $L('Add custom list')
	}, this.customListsModel = {
		items: [
			//{label: "Test", id: 1234}
			],
		disabled: false
	});
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.addItemHandler = this.addItem.bindAsEventListener(this);
	this.deleteItemHandler = this.deleteItem.bindAsEventListener(this);
	this.editItemHandler = this.editItem.bindAsEventListener(this);
	//this.reorderItemHandler = this.reorderItem.bindAsEventListener(this);
	this.controller.listen('customList', Mojo.Event.listAdd, this.addItemHandler);
	this.controller.listen('customList', Mojo.Event.listDelete, this.deleteItemHandler);
	this.controller.listen('customList', Mojo.Event.listTap, this.editItemHandler);
	//this.controller.listen('customList', Mojo.Event.listReorder, this.reorderItemHandler);
	//Mojo.Log.info("OK!");
};

CustomListsAssistant.prototype.reorderItem = function (event) {
	
};

CustomListsAssistant.prototype.deleteItem = function (event) {
	//Mojo.Log.info("Delete custom list", event.index, event.item.id);
	dao.deleteCustomList(event.item.id, function () {});
	if (MyAPP.prefs.showList === 'custom' && 
			MyAPP.prefs.showFilter == event.index + 1) {
		MyAPP.prefs.showFilter = 'all';
		//MyAPP.prefsCookie.put(MyAPP.prefs);
		MyAPP.prefsDb.add('prefs', MyAPP.prefs, 
			function () {},
			function (event) {
				Mojo.Log.info("Prefs DB failure %j", event);
		});
	}
	
	
};

CustomListsAssistant.prototype.editItem = function (event) {
	//Mojo.Log.info("Tap on list item", event.index);
	//debugObject(event, 'noFuncs');
	this.controller.stageController.pushScene('custom-list-edit', event.item.id);
	
};

CustomListsAssistant.prototype.addItem = function (event) {
	//Mojo.Log.info("Add custom list");
	var list = {
		label: $L("New Custom List"),
		id: new Date().getTime(),
		folders: [],
		contexts: [],
		goals: [],
		priority: [
			{label: $L("3-Top"), selected: true, value: 3},		
			{label: $L("2-High"), selected: true, value: 2}, 
			{label: $L("1-Medium"), selected: true, value: 1}, 
			{label: $L("0-Low"), selected: true, value: 0}, 
			{label: $L("Negative"), selected: true, value: "-1"}
		],
		duedate: 6,
		duedatebefore: true,
		startdate: 6,
		startdatebefore: true,
		starred: [
			{label: $L("Starred"), selected: true, value: 0},
			{label: $L("Not Starred"), selected: true, value: 1}
		],
		status: [
				{label: $L("No Status"), selected: true, value: "0"}, 
				{label: $L("Next Action"),selected: true, value: "1"}, 
				{label: $L("Active"), selected: true, value: "2"}, 
				{label: $L("Planning"), selected: true, value: "3"}, 
				{label: $L("Delegated"), selected: true, value: "4"}, 
				{label: $L("Waiting"), selected: true, value: "5"}, 
				{label: $L("Hold"), selected: true, value: "6"}, 
				{label: $L("Postponed"), selected: true, value: "7"}, 
				{label: $L("Someday"), selected: true, value: "8"}, 
				{label: $L("Canceled"), selected: true, value: "9"}, 
				{label: $L("Reference"), selected: true, value: "10"}
				],
		completed: [
			{label: $L("Completed"), selected: false, value: 0},
			{label: $L("Not Completed"), selected: true, value: 1}			
		],
		sort: [
				{label: $L('Folder'), type: 'folder', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Context'), type: 'context', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Goal'), type: 'goal', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Tag'), type: 'tag', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Priority'), type: 'priority', dir: 'DESC', oppdir: 'ASC'},
				{label: $L('Starred'), type: 'star', dir: 'DESC', oppdir: 'ASC'},
				{label: $L('Status'), type: 'status', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Title'), type: 'title', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Due Date'), type: 'duedate', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Start Date'), type: 'startdate', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Length'), type: 'length', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Modified'), type: 'modified', dir: 'ASC', oppdir: 'DESC'},
				{label: $L('Added'), type: 'added', dir: 'ASC', oppdir: 'DESC'}
				//{label: $L('Importance'), type: 'importance', dir: 'DESC', oppdir: 'ASC'}		
		]
	};
	
	//Mojo.Log.info("Adding list to database");
	dao.updateCustomList(list.id, list.label, Object.toJSON(list), this.listAdded.bind(this, list.id));
	//this.listAdded(list);
	
};

CustomListsAssistant.prototype.listAdded = function (listId, results) {
	//Mojo.Log.info("List", listId, "Results", results);
	this.controller.stageController.pushScene('custom-list-edit', listId);
};

CustomListsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  
	//Mojo.Log.info("Custom Lists Activate!");
	dao.retrieveCustomLists(this.gotCustomLists.bind(this));
};

CustomListsAssistant.prototype.gotCustomLists = function (response) {
	this.customListsModel.items = response;
	this.controller.modelChanged(this.customListsModel);
};

CustomListsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

CustomListsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('customList', Mojo.Event.listAdd, this.addItemHandler);
	this.controller.stopListening('customList', Mojo.Event.listDelete, this.deleteItemHandler);
	this.controller.stopListening('customList', Mojo.Event.listTap, this.editItemHandler);
};
