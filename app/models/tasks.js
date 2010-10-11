var taskUtils = {

// Create a new task
	newTask: function (inTitle) {
		// Add a new task, using default values
		var nowTime = Math.floor(new Date().getTime() / 1000) * 1000,
			folder, context, repeat,
			title = inTitle || "";
			
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
	
		var mytask = {
			id: 0,
			parent: "",
			children: "",
			title: title, // used by FilterList to add a new task...
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
			length: "",
			timer: "",
			note: "",
			value: nowTime
		};
		return mytask;
	},
	
	// Snooze from dashboard notifications
	snooze: function (taskValue) {
		var sqlString = "SELECT * FROM tasks WHERE value=" +taskValue + "; GO;";
		dao.retrieveTasksByString(sqlString, taskUtils.gotSnoozeTask.bind(this));		
	},
	
	gotSnoozeTask: function (response) {
		//Mojo.Log.info("Snooze task %j", response[0]);
		var a = response[0], nowTime = new Date().getTime(),
			today = new Date(),
			tomorrow = new Date(),
			snoozer = 60*24*60*1000; // add one day in milliseconds
			
		today.setHours(0,0,0,0);
		tomorrow.setHours(0,0,0,0);
		tomorrow.setDate(tomorrow.getDate()+1);
		//Mojo.Log.info("Dates", today, tomorrow);
		
		if (a.duedate && a.duedate < nowTime) {
			// snooze duedate/time
			if (a.duetime && a.duetime < nowTime) {
				// snooze  duetime
				//Mojo.Log.info("Snooze duetime");
				snoozer = MyAPP.prefs.snoozeTime*60*1000; // in milliseconds
				a.duetime += snoozer;
				a.duedate = new Date(a.duetime);
				a.duedate = a.duedate.setHours(0,0,0,0);
				//a.duedate = a.duedate.getTime();
			}
			else {
				// snooze duedate
				//Mojo.Log.info("Snooze duedate");
				a.duedate = tomorrow.getTime();
			}
		}
		else if (a.startdate && a.startdate < nowTime) {
			if (a.starttime && a.starttime < nowTime) {
				// snooze starttime
				//Mojo.Log.info("Snooze starttime");
				snoozer = MyAPP.prefs.snoozeTime*60*1000; // in milliseconds
				a.starttime += snoozer;
				a.startdate = new Date(a.starttime);
				a.startdate = a.startdate.setHours(0,0,0,0).getTime();
			}	
			else {
				//Mojo.Log.info("Snooze startdate");
				// snooze startdate
				a.startdate = tomorrow.getTime();
			}
		}
		a.modified = nowTime;
		//Mojo.Log.info("Snoozed: %j", a);
				
		this.saveToDB(a, this.returnFromDb);    

	},
	
	// Get tags from DB
	getTags: function () {
		var sqlString = "SELECT DISTINCT tag FROM tasks;GO;";
		dao.retrieveTasksByString(sqlString, taskUtils.gotTagsDb.bind(this));
	},
	
	gotTagsDb: function (response) {
		//Mojo.Log.info("Tags are %j", response);
		var tags = [], tagArray, i;
		response.each(function (tag, index){
			//Mojo.Log.info("Tag %s %j", index, tag);
			tagArray = tag.tag.split(",");
			for (i = 0; i < tagArray.length; i++) {
				tags.push(tagArray[i].replace(/^\s+/,""));
			}	
		});
		//Mojo.Log.info("Tags array %j", tags);
		MyAPP.tags = tags;
	},

// Save to database
	saveToDB: function (task, inCallback) {
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
	    dao.updateTask(task, inCallback);
	},

	returnFromDb: function(){
	    //Mojo.Log.info("Removing Save Cookie");
	    MyAPP.saveCookie.remove();
	    // Update notification alarm
	    notify.getNextDate();
	},
	
// List formatters - provide "formatted" values for the list widget
	formatDueDate: function (value, model) {
		//Mojo.Log.info("Model Duedate", value, model.duedate);
		if (MyAPP.prefs.showDueDate) {
			var nowTime = new Date(),
				today = new Date(),
				tomorrow = new Date();
			today.setHours(0,0,0,0);
			tomorrow.setHours(0,0,0,0);
			tomorrow.setDate(tomorrow.getDate() + 1);
			
			if (value >= today && value < tomorrow) {
				return $L("Today");
			}
			else if (value >= tomorrow && value < tomorrow.setHours(tomorrow.getHours() + 24)) {
				return $L("Tomorrow");
			}
			return (value) ? Mojo.Format.formatDate(new Date(value), {
				date: 'medium'
			}) : $L("no due date");
		}
		else {
			return "";
		}
	},
	
	formatDue: function (value, model) {
		//apply CSS class for overdue and due today
		if (model.duedate && model.duedate < new Date().getTime() ) {
			if (model.duedate && model.duedate < (new Date().getTime() - 86400000)) {
				return "due overdue";
			}
			else {
				return "due";
			}
		}
		else {
			return "";
		}
	},

	formatDueTime: function (value, model) {
		//Mojo.Log.info("Model Duedate", value, model.duedate);
		if (MyAPP.prefs.showDueDate) {
			return (value) ? Mojo.Format.formatDate(new Date(value), {
				time: 'short'
			}) : "";
		}
		else {
			return "";
		}
	},

	formatFolder: function (value, model) {
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
	},

	formatContext: function (value, model) {
		//Mojo.Log.info("Model Context", value, model.context);
		if (MyAPP.prefs.showFolderAndContext) {
			try {
				return (value) ? this.contextsModel.items[value].label : $L("no context");
			} 
			catch (e) {
				//Mojo.Log.info("Oops context error!");
				return $L("no context");
			}
		}
		else {
			return "";
		}
	},

	formatTags: function (value, model) {
		//Mojo.Log.info("Model Tags", value, model.tag);
		if (MyAPP.prefs.showTags) {
			return (value) ? value : ""; //$L("no tags");
		}
		else {
			return "";
		}
	},

	formatStar: function (value, model) {
		//Mojo.Log.info("Model Duedate", value, model.duedate);
		return (MyAPP.prefs.showStar) ? "0" : "";
	},

	formatHasNote: function (value, model) {
		//Mojo.Log.info("Model Duedate", value, model.duedate);
		if (MyAPP.prefs.showNotes && value) {
			return "done-icon-note";
		}
		else {
			return "";
		}
	},

	formatNote: function (value, model) {
		//Mojo.Log.info("Model Duedate", value, model.duedate);
		if (value) {
			return Mojo.Format.runTextIndexer(value.replace(/\n/g, "<br />"));
		}
		else {
			return "";
		}
	},

	formatPriority: function (value, model) {
		//Mojo.Log.info("Model Duedate", value, model.duedate);
		//return (value) ? "taskbox priority" + value : "";
		if (MyAPP.prefs.showPriority) {
			return "taskbox priority" + value;
		}
		else {
			return "";
		}
	},
	
	//formatParent: function (value, model) {
	formatIndent: function (value, model) {
		//Mojo.Log.info("Indent", value);
		if (value && MyAPP.prefs.indentSubtasks) {
			return "subtask";
		}
		else {
			return "";
		}
	},

	formatRepeat: function (value, model) {
		//Mojo.Log.info("Model Duedate", value, model.duedate);
		//return (value) ? "taskbox priority" + value : "";
		var repeat = model.repeat > 99 ? model.repeat - 100 : model.repeat;
		if (value && repeat) {
			return "recur";
		}
		else {
			return "left";
		}
	}
};
