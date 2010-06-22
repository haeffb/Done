function FoldersAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

FoldersAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.controller.get('foldersListLabel').innerHTML = $L('Folders (drag to sort)');
	this.controller.get('contextsListLabel').innerHTML = $L('Contexts');
	this.controller.get('goalsListLabel').innerHTML = $L('Goals');
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.controller.setupWidget('foldersList', {
		itemTemplate: 'folders/foldersRowTemplate',
		listTemplate: 'folders/foldersListTemplate',
		swipeToDelete: true,
		renderLimit: 20,
		reorderable: true,
		autoconfirmDelete: false,
		addItemLabel: $L('Add folder')
	}, this.foldersModel = {
		items: [],
		disabled: false
	});
	
	this.controller.setupWidget('contextsList', {
		itemTemplate: 'folders/contextsRowTemplate',
		listTemplate: 'folders/foldersListTemplate',
		swipeToDelete: true,
		autoconfirmDelete: false,
		renderLimit: 20,
		reorderable: false,
		addItemLabel: $L('Add context')
	}, this.contextsModel = {
		items: [],
		disabled: false
	});
	
	this.controller.setupWidget('goalsList', {
		itemTemplate: 'folders/goalsRowTemplate',
		listTemplate: 'folders/foldersListTemplate',
		swipeToDelete: true,
		autoconfirmDelete: false,
		renderLimit: 20,
		reorderable: false,
		addItemLabel: $L('Add goal')
	}, this.goalsModel = {
		items: [],
		disabled: false
	});
	
	/* add event handlers to listen to events from widgets */
	this.addItemHandler = this.addItem.bindAsEventListener(this);
	this.deleteItemHandler = this.deleteItem.bindAsEventListener(this);
	this.editItemHandler = this.editItem.bindAsEventListener(this);
	this.reorderItemHandler = this.reorderItem.bindAsEventListener(this);
	this.controller.listen('foldersList', Mojo.Event.listAdd, this.addItemHandler);
	this.controller.listen('foldersList', Mojo.Event.listDelete, this.deleteItemHandler);
	this.controller.listen('foldersList', Mojo.Event.listTap, this.editItemHandler);
	this.controller.listen('foldersList', Mojo.Event.listReorder, this.reorderItemHandler);
	this.controller.listen('contextsList', Mojo.Event.listAdd, this.addItemHandler);
	this.controller.listen('contextsList', Mojo.Event.listDelete, this.deleteItemHandler);
	this.controller.listen('contextsList', Mojo.Event.listTap, this.editItemHandler);
	this.controller.listen('goalsList', Mojo.Event.listAdd, this.addItemHandler);
	this.controller.listen('goalsList', Mojo.Event.listDelete, this.deleteItemHandler);
	this.controller.listen('goalsList', Mojo.Event.listTap, this.editItemHandler);
};

FoldersAssistant.prototype.reorderItem = function (event) {
	//Mojo.Log.info("reorder event %j", event.item, event.toIndex, event.fromIndex);
	
	this.foldersModel.items.splice(event.fromIndex, 1);
	this.foldersModel.items.splice(event.toIndex, 0, event.item);
	var i, nowTime = Math.floor(new Date().getTime() / 1000) * 1000;
	for (i = 0; i < this.foldersModel.items.length; i++) {
		this.foldersModel.items[i].sortorder = i+1;
		this.foldersModel.items[i].modified = nowTime;
		dao.updateFolder(this.foldersModel.items[i], function () {});
		//Mojo.Log.info("Folder: %j", this.foldersModel.items[i]);
	}
	//this.foldersModel.items.sort(this.sortByFolderSort);
	//this.foldersModel.items.sort(this.sortByFolderSort);
	//this.controller.modelChanged(this.foldersModel);
	this.activate();

	MyAPP.local.lastfolderedit = Math.floor(nowTime / 1000);
	MyAPP.localCookie.put(MyAPP.local);

};

FoldersAssistant.prototype.addItem = function (event) {
	//Mojo.Log.info("Add Event in %j", event.target.id);
	var object = {}, 
		nowTime = Math.floor(new Date().getTime() / 1000) * 1000;
	switch (event.target.id) {
		case 'foldersList':
			object = {
				id: 0, 
				label: "New Folder", 
				privy: 0, 
				archived: 0, 
				sortorder: this.foldersModel.items.length + 1, 
				modified: nowTime, 
				value: nowTime
			};
			MyAPP.local.lastfolderedit = Math.floor(nowTime / 1000);
			break;
		case 'contextsList':
 			object = {
				id: 0,
				label: "New Context",
				modified: nowTime,
				value: nowTime
			};
			MyAPP.local.lastcontextedit = Math.floor(nowTime / 1000);
			break;
		case 'goalsList':
 			object = {
				id: 0, 
				label: "New Goal",
				level: 0,
				archived: 0, 
				contributes: "",
				modified: nowTime,
				value: nowTime
			};
			MyAPP.local.lastgoaledit = Math.floor(nowTime / 1000);
			break;
	}
	MyAPP.localCookie.put(MyAPP.local);
	this.controller.showDialog({
		template: 'folders/edit-item',
		assistant: new EditItemAssistant(this, event.target.id, object, this.updateItem.bind(this))
	});
	
};

FoldersAssistant.prototype.deleteItem = function (event) {
	//Mojo.Log.info("Delete Event in %j", event.target.id);
	//Mojo.Log.info("Event Model %j", event.model.items[event.index]);
	
	var nowTime = Math.floor(new Date().getTime() / 1000) * 1000;
	
	// Remove folder, context, or goal from any tasks...
	// (old value, type, new value)
	dao.updateTasksWithFCG(event.model.items[event.index].value, event.target.id, 0);
	
	// Delete folder, context or goal
	switch (event.target.id) {
		case 'foldersList':
			dao.deleteFolder(event.model.items[event.index].value);
			MyAPP.local.lastfolderedit = Math.floor(nowTime / 1000);
			if (MyAPP.prefs.showList === 'folder' && 
					MyAPP.prefs.showFilter == event.model.items[event.index].value) {
				MyAPP.prefs.showFilter = 'all';
				MyAPP.prefsCookie.put(MyAPP.prefs);
			}
			break;
		case 'contextsList':
			dao.deleteContext(event.model.items[event.index].value);
			MyAPP.local.lastcontextedit = Math.floor(nowTime / 1000);
			if (MyAPP.prefs.showList === 'context' && 
					MyAPP.prefs.showFilter == event.model.items[event.index].value) {
				MyAPP.prefs.showFilter = 'all';
				MyAPP.prefsCookie.put(MyAPP.prefs);
			}
			break;
		case 'goalsList':
			dao.deleteGoal(event.model.items[event.index].value);
			MyAPP.local.lastgoaledit = Math.floor(nowTime / 1000);
			if (MyAPP.prefs.showList === 'goal' && 
					MyAPP.prefs.showFilter == event.model.items[event.index].value) {
				MyAPP.prefs.showFilter = 'all';
				MyAPP.prefsCookie.put(MyAPP.prefs);
			}
			break;
	}
	
	// check to see if being used for current filter in list view

	
	// add to DeletedFCG table to sync later
	//Mojo.Log.info("Event ID", event.model.items[event.index].id);
	if (event.model.items[event.index].id) {
		dao.createDeletedFCG(event.model.items[event.index].id, event.target.id);
	}
	MyAPP.localCookie.put(MyAPP.local);	
	
	// refresh models & display
	this.activate();
};

FoldersAssistant.prototype.editItem = function (event) {
	//Mojo.Log.info("Edit Event in %j", event.target.id);
	//Mojo.Log.info("Event Model %j", event.model.items[event.index]);
	//Mojo.Log.info("Event Model %j", event.model);
	//Mojo.Log.info("Event index %j", event.index);
	
	switch (event.target.id) {
		case 'foldersList':
			break;
		case 'contextsList':
			break;
		case 'goalsList':
			break;
	}
	this.controller.showDialog({
		template: 'folders/edit-item',
		assistant: new EditItemAssistant(this, event.target.id, event.model.items[event.index], this.updateItem.bind(this))
	});
	
};

FoldersAssistant.prototype.updateItem = function (type, object) {
	
	//Mojo.Log.info("Update item: %s %j", type, object);
	this.activate();
	
// NOTE: there is a currently a bug in webOS that loses your scroll position when calling a customDialog.
// The following lines are a hack to scroll back to the top of the scene.
	var scroller = this.controller.getSceneScroller();
	//call the widget method for scrolling to the top
	scroller.mojo.revealTop(0);
};

FoldersAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	dao.retrieveFolders(this.gotFoldersDb.bind(this));
};

FoldersAssistant.prototype.gotFoldersDb = function (response) {
	//Mojo.Log.info("Folders response is %j", response, response.length);
	response.sort(this.sortByFolderSort);
	this.foldersModel.items = response;
	//this.foldersModel.items.push({id: 0, label: $L("No Folder"), value: 0});
	this.controller.modelChanged(this.foldersModel);
	
	// Retrieve contexts
	dao.retrieveContexts(this.gotContextsDb.bind(this));
};

FoldersAssistant.prototype.sortByFolderSort = function (a, b) {
	return (a.sortorder - b.sortorder);
};

FoldersAssistant.prototype.gotContextsDb = function (response) {
	//Mojo.Log.info("Contexts response is %j", response);
	this.contextsModel.items = response;
	//this.contextsModel.items.push({id: 0, label: $L("No Context"), value: 0});
	this.controller.modelChanged(this.contextsModel);
	
	// Retrieve goals
	dao.retrieveGoals(this.gotGoalsDb.bind(this));
};

FoldersAssistant.prototype.gotGoalsDb = function(response){
	//Mojo.Log.info("Goals response is %j", response);
	this.goalsModel.items = response;
	//this.goalsModel.items.push({id: 0, label: $L("No Goal"), value: 0});
	this.controller.modelChanged(this.goalsModel);
	
};

FoldersAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

FoldersAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('foldersList', Mojo.Event.listAdd, this.addItemHandler);
	this.controller.stopListening('foldersList', Mojo.Event.listDelete, this.deleteItemHandler);
	this.controller.stopListening('foldersList', Mojo.Event.listTap, this.editItemHandler);
	this.controller.stopListening('foldersList', Mojo.Event.listReorder, this.reorderItemHandler);
	this.controller.stopListening('contextsList', Mojo.Event.listAdd, this.addItemHandler);
	this.controller.stopListening('contextsList', Mojo.Event.listDelete, this.deleteItemHandler);
	this.controller.stopListening('contextsList', Mojo.Event.listTap, this.editItemHandler);
	this.controller.stopListening('goalsList', Mojo.Event.listAdd, this.addItemHandler);
	this.controller.stopListening('goalsList', Mojo.Event.listDelete, this.deleteItemHandler);
	this.controller.stopListening('goalsList', Mojo.Event.listTap, this.editItemHandler);
};
