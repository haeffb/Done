function FieldConfigAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

FieldConfigAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	this.controller.get("yellowpad").style.backgroundColor = MyAPP.colors[MyAPP.prefs.color].color; //"#D2F7D4";
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */

	//Mojo.Log.info("Fields: %j", MyAPP.fields);
	
	this.fieldConfigModel = {
		items: [
			{label: $L("Notes"), field: "NotesRow", value: MyAPP.fields.notes},
			{label: $L("Folder"), field: "FolderRow", value: MyAPP.fields.folder},
			{label: $L("Context"), field: "ContextRow", value: MyAPP.fields.context},
			{label: $L("Goal"), field: "GoalRow", value: MyAPP.fields.goal},
			{label: $L("Tags"), field: "TagsRow", value: MyAPP.fields.tags},
			{label: $L("Priority"), field: "PriorityRow", value: MyAPP.fields.priority},
			{label: $L("Due Date"), field: "DueDateRow", value: MyAPP.fields.duedate},
			{label: $L("Due Time"), field: "DueTimeRow", value: MyAPP.fields.duetime},
			{label: $L("Start Date"), field: "StartDateRow", value: MyAPP.fields.startdate},
			{label: $L("Start Time"), field: "StartTimeRow", value: MyAPP.fields.starttime},
			{label: $L("Status"), field: "StatusRow", value: MyAPP.fields.status},
			{label: $L("Repeat"), field: "RepeatRow", value: MyAPP.fields.repeat},
			{label: $L("Repeat From"), field: "RepeatFromRow", value: MyAPP.fields.repeatfrom},
			{label: $L("Reminder"), field: "ReminderRow", value: MyAPP.fields.reminder},
			{label: $L("Length"), field: "LengthRow", value: MyAPP.fields.length},
			{label: $L("Star"), field: "StarRow", value: MyAPP.fields.star}
		]
	};
	
	this.controller.setupWidget("field-config-list", {
			itemTemplate: 'field-config/fieldConfigRowTemplate'
		},
		this.fieldConfigModel
	);

	
/*
	this.controller.setupWidget("fieldCheck", {
		modelProperty: value
	});

*/	
	/* add event handlers to listen to events from widgets */
};

FieldConfigAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

FieldConfigAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  
	//retrieve field settings:
	MyAPP.fields.notes = this.fieldConfigModel.items[0].value;
	MyAPP.fields.folder = this.fieldConfigModel.items[1].value;
	MyAPP.fields.context = this.fieldConfigModel.items[2].value;
	MyAPP.fields.goal = this.fieldConfigModel.items[3].value;
	MyAPP.fields.tags = this.fieldConfigModel.items[4].value;
	MyAPP.fields.priority = this.fieldConfigModel.items[5].value;
	MyAPP.fields.duedate = this.fieldConfigModel.items[6].value;
	MyAPP.fields.duetime = this.fieldConfigModel.items[7].value;
	MyAPP.fields.startdate = this.fieldConfigModel.items[8].value;
	MyAPP.fields.starttime = this.fieldConfigModel.items[9].value;
	MyAPP.fields.status = this.fieldConfigModel.items[10].value;
	MyAPP.fields.repeat = this.fieldConfigModel.items[11].value;
	MyAPP.fields.repeatfrom = this.fieldConfigModel.items[12].value;
	MyAPP.fields.reminder = this.fieldConfigModel.items[13].value;
	MyAPP.fields.length = this.fieldConfigModel.items[14].value;
	MyAPP.fields.star = this.fieldConfigModel.items[15].value;
	
	//MyAPP.fieldsCookie.put(MyAPP.fields);
	MyAPP.prefsDb.add('fields', MyAPP.fields, 
		function () {},
		function (event) {
			Mojo.Log.info("Prefs DB failure %j", event);
		});
	//Mojo.Log.info("Fields: %j", MyAPP.fields);
	//Mojo.Log.info("Field Config Saved");
	
};

FieldConfigAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
