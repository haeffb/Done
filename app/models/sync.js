function Sync(){
	// arrays of tasks that need to sync
	this.localEditedTasks = [];
	this.webEditedTasks = [];
	
	var taskChunks = 100;
	
	// used to count the number of DB and Ajax transactions in sync
	// so we know when we're Done!
	this.transactionCount = 0;
	
	this.initSync = function(syncCallback, outputDiv){
		// function to call when sync finishes
		this.syncCallback = syncCallback;
		this.tasksNotStarted = true;
		if (outputDiv) {
			this.outputDiv = outputDiv;
		}
		else {
			this.outputDiv = null;
		}
		
		Mojo.Log.info("Starting Sync Process");
		this.syncLog = "<br />" + $L("Starting Sync Process");
		if (this.outputDiv) {
			this.outputDiv.innerHTML = "<br />" + $L("Starting Sync Process");
		}
		
		// objects to keep track of sync progress
		// so we know when we're Done!
		this.synced = {
			tasks: false,
			deleted: false,
			localdeleted: false,
			folders: false,
			contexts: false,
			goals: false,
			tasksadded: false,
			tasksfinal: false,
			foldersadded: false,
			contextsadded: false,
			goalsadded: false,
			deletedFCG: false
		};
		// used to count number of database transactions that need to complete:
		this.count = {
			tasks: 0,
			deleted: 0,
			localdeleted: 0,
			folders: 0,
			contexts: 0,
			goals: 0,
			tasksadded: 0,
			tasksfinal: 0,
			foldersadded: 0,
			contextsadded: 0,
			goalsadded: 0,
			deletedFCG: 0
		};
				
		//Get info from server:
		api.getServerInfo(this.gotServerInfo.bind(this));
		
		this.localWins = MyAPP.prefs.localWins;
	};
	
	// response is in JSON format
	this.gotServerInfo = function(response){
		var serverOffset, ourOffset, timeDiff, ourTime;
		Mojo.Log.info("Response from server info: %j", response);
		if (response.server) {
		
			this.syncLog += "<br />" + $L("Retrieved Server Info");
			if (this.outputDiv) {
				this.outputDiv.innerHTML += "<br />" + $L("Retrieved Server Info");
			}
			//Compare our time to server time & determine adjustment
			ourTime = Math.floor(new Date().getTime() / 1000);
			Mojo.Log.info("Our time is ", ourTime);
			this.servDiff = response.server.unixtime - ourTime;
			
			//Convert last sync date/time to seconds so we can compare to server
			this.lastSync = Math.floor(MyAPP.prefs.lastSync / 1000);
			this.ourTime = Math.floor(new Date().getTime() / 1000);
			Mojo.Log.info("Last sync in seconds:", this.lastSync, this.ourTime);
			
			//Local time of last sync
			this.lastSyncLocal = this.lastSync;
			//Server time of last sync
			this.lastSync += this.servDiff;
			
			Mojo.Log.info("Time Difference is ", this.servDiff, "seconds");
			Mojo.Log.info("Last sync corrected:", this.lastSync, this.lastSyncLocal);
			
			// determine adjustment for unix timestamps from Toodledo
			// based on timezone offsets
			serverOffset = response.server.serveroffset / 60;
			ourOffset = -new Date().getTimezoneOffset();
			Mojo.Log.info("Server %s Our %s", serverOffset, ourOffset);
			this.timeDiff = (serverOffset - ourOffset) * 60;
			Mojo.Log.info("Time Difference with offset is ", this.timeDiff, "seconds");
			//this.lastSync += this.timeDiff;
			
			//this.key = "1";  // testing for invalid key
			api.getAccountInfo(this.gotAccountInfo.bind(this));
		}
		else {
			Mojo.Log.info("No response from server!");
			response = 'No response from server!';
			this.syncCallback(response);
		}
	};
	
	// response is in JSON format
	this.gotAccountInfo = function(response){
		Mojo.Log.info("Response from account info: %j", response);
		if (response.account) {
			this.syncLog += "<br />" + $L("Retrieved Account Info") + 
					" <br />" + $L("Last web add/edit:") + " " + 
					Mojo.Format.formatDate(new Date(response.account.lastaddedit * 1000), "short");
			if (this.outputDiv) {
				this.outputDiv.innerHTML += "<br />" + $L("Retrieved Account Info") + 
					" <br />" + $L("Last web add/edit:") + " " + 
					Mojo.Format.formatDate(new Date(response.account.lastaddedit * 1000), "short");
			}
			// store account info from server, just in case we need it elsewhere
			MyAPP.account = response.account;
			MyAPP.accountCookie = new Mojo.Model.Cookie(MyAPP.appName + "account");
			MyAPP.accountCookie.put(MyAPP.account);
			
			Mojo.Log.info("Last sync server:", this.lastSync, "local:", this.lastSyncLocal);
			Mojo.Log.info("Last add/edit:", MyAPP.account.lastaddedit, MyAPP.local.lastaddedit);
			
			
			// begin by syncing folders...
			this.getFolders();
			
			
		}
		else {
			Mojo.Log.info("No response from server!");
			response = 'No response from server!';
			this.syncCallback(response);
		}
	};
	
	this.beginTaskSync = function () {
		
		Mojo.Log.info("Beginning Task Sync");
		//Check for new/edited tasks on device:
		if (MyAPP.local.lastaddedit > this.lastSyncLocal) {
			//retrieve local tasks
			dao.retrieveTasksFromDate(this.lastSyncLocal * 1000, this.gotLocalTasks.bind(this));
		}
		else {
			Mojo.Log.info("No edits on device!");
			var notasks = [];
			this.gotLocalTasks(notasks);
		}
		
		//Check for deleted tasks on device:
		if (MyAPP.local.lastdelete > this.lastSyncLocal) {
			Mojo.Log.info("Deleted tasks on device!");
			
		}
		
	};
	
	this.gotLocalTasks = function(tasks){
		Mojo.Log.info("New or edited tasks on device: %s", tasks.length);
		this.syncLog += "<br />" + $L("New/edited tasks on device:") + 
				" " + tasks.length;
		if (this.outputDiv) {
			this.outputDiv.innerHTML += "<br />" + $L("New/edited tasks on device:") + 
				" " + tasks.length;
		}
		//Mojo.Log.info("Local tasks is: %j", tasks);
		var i; 
		this.localEditedTasks = [];
		for (i = 0; i < tasks.length; i++) {
			//Set sync to true - will change to false later if
			//task was also edited on web
			tasks[i].sync = true;
			this.localEditedTasks[tasks[i].value] = tasks[i];
		}
		for (i in this.localEditedTasks) {
			if (this.localEditedTasks.hasOwnProperty(i)) {
				Mojo.Log.info("Local Edited Task: %j", this.localEditedTasks[i].title, this.localEditedTasks[i].modified);
			}
		}
		//this.localEditedTasks = tasks;
		//create new array for web tasks
		this.webEditedTasks = [];
		
		//Check for new/edited tasks on web:
		// Adjust modafter by 1 minute to be sure to retrieve any 
		// "Advanced Repeat" tasks created during last sync.
		// This may not be necessary - need to test!
		if ((MyAPP.account.lastaddedit) > this.lastSync * 1) {
			Mojo.Log.info("New or edited tasks on web!");
			var options = {
				modafter: this.lastSync,
				//get the first 100 tasks...
				start: 0,
				end: taskChunks
			};
			api.getTasks(options, this.gotEditedWebTasks.bind(this));
		}
		else {
			Mojo.Log.info("No edited tasks on web!");
			this.syncLog += "<br />" + $L("New/edited tasks from web:") + " 0";
			if (this.outputDiv) {
				this.outputDiv.innerHTML += "<br />" + $L("New/edited tasks from web:") + " 0";
			}
			this.gotWebTasks();
		}
		
	};
	
	this.gotEditedWebTasks = function(responseXML){
		// Need to handle > 1000 tasks from Toodledo...
		var tasksXML = responseXML.getElementsByTagName('tasks');
		var totalTasks = tasksXML[0].getAttribute('total') * 1;
		var start = tasksXML[0].getAttribute('start') * 1;
		var end = tasksXML[0].getAttribute('end') * 1;
		Mojo.Log.info("Total:", totalTasks, "Start:", start, "End:", end);
				
		var taskXML = responseXML.getElementsByTagName('task');
		Mojo.Log.info("New or edited Tasks from Web %s", taskXML.length);
		this.syncLog += "<br />" + $L("New/edited tasks from web:") + 
				" "  + taskXML.length;
		if (this.outputDiv) {
			this.outputDiv.innerHTML += "<br />" + $L("New/edited tasks from web:") + 
				" "  + taskXML.length;
		}
		
		var tasks = [], id, temp, temp2, key;
		var mykeys = ['parent', 'children', 'title', 'tag', 'folder', 'context', 'goal', 
			'added', 'modified', 'duedate', 'startdate', 'duetime', 'started', 
			'starttime', 'reminder', 'repeat', 'completed', 'completedon', 
			'rep_advanced', 'status', 'star', 'priority', 'length', 'timer', 'note'];
		for (i = 0; i < taskXML.length; i++) {
			id = taskXML[i].getElementsByTagName('id').item(0).textContent;
			//Mojo.Log.info("Task ID:", id);
			tasks[i] = {};
			tasks[i].id = id;
			
			for (key = 0; key < mykeys.length; key++) {
				//Mojo.Log.info("Key:", mykeys[key]);
				temp = taskXML[i].getElementsByTagName(mykeys[key]);
				//Mojo.Log.info("Keys %j", temp, key, mykeys[key]);
				if (temp.length > 0) {
					tasks[i][mykeys[key]] = temp.item(0).textContent;
				}
				else {
					tasks[i][mykeys[key]] = 0;
				}
			}
			//Mojo.Log.info("Get context", taskXML[i].getElementsByTagName('context'));
			tasks[i].context = taskXML[i].getElementsByTagName('context').item(0).getAttribute('id');
			tasks[i].goal = taskXML[i].getElementsByTagName('goal').item(0).getAttribute('id');

			// add milliseconds to be consistent with Javascript date object
			// convert duedate/time & startdate/time from server
			// because server stores them as plain strings (2010-04-08)
			// and they are sent in server timezone.
			tasks[i].duedate = tasks[i].duedate ? (tasks[i].duedate * 1 + this.timeDiff * 1) * 1000 : "";
			tasks[i].startdate = tasks[i].startdate ? (tasks[i].startdate * 1 + this.timeDiff * 1) * 1000 : "";
			tasks[i].duetime = (tasks[i].duetime > 0) ? (tasks[i].duetime * 1 + this.timeDiff * 1) * 1000 : "";
			tasks[i].starttime = (tasks[i].starttime > 0) ? (tasks[i].starttime * 1 + this.timeDiff * 1) * 1000 : "";
			
			//tasks[i].added = (tasks[i].added) * 1000;
			tasks[i].modified = (tasks[i].modified) * 1000;
			//tasks[i].completed = (tasks[i].completed > 0) ? (tasks[i].completed) * 1000 : "";
			tasks[i].added = (tasks[i].added * 1 + this.timeDiff * 1) * 1000;
			//tasks[i].modified = (tasks[i].modified * 1 + this.timeDiff * 1) * 1000;
			tasks[i].completed = (tasks[i].completed > 0) ? (tasks[i].completed * 1 + this.timeDiff * 1) * 1000 : "";
			
			tasks[i].value = id;
			
			// Make sure duetime is set to same date as duedate
			// Not sure if Toodledo duetime date can be trusted		
			if (tasks[i].startdate && tasks[i].starttime) {
				temp = new Date(tasks[i].starttime);
				temp2 = new Date(tasks[i].startdate);
				temp2.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
				tasks[i].starttime =  temp2.getTime();
			}
			if (tasks[i].duedate && tasks[i].duetime) {
				temp = new Date(tasks[i].duetime);
				temp2 = new Date(tasks[i].duedate);
				temp2.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
				tasks[i].duetime =  temp2.getTime();
			}

			//Set sync to true - will change to false later if
			//task was also edited on device
			tasks[i].sync = true;
			
			Mojo.Log.info("Task:", i, tasks[i].title, tasks[i].modified);
			//Mojo.Log.info("Task %j", tasks[i]);
			//dao.updateTask(tasks[i], function () { });
			this.webEditedTasks.push(tasks[i]);
		}
		//this.webEditedTasks.concat(this.webEditedTasks, tasks);
		//Mojo.Log.info("Web tasks is: %j", tasks);
		//Mojo.Log.info("Web tasks is: %j", this.webEditedTasks);
		if (totalTasks > end) {
			// need to grab more tasks!
			var options = {
				modafter: this.lastSync * 1 - 60,
				start: end * 1 + 1,
				end: end * 1 + taskChunks
			};
			api.getTasks(
				// options
				{
					modafter: this.lastSync * 1 - 60,
					start: end * 1 + 1,
					end: end * 1 + taskChunks
				}, 
				this.gotEditedWebTasks.bind(this)
			);
		}
		else {
			this.gotWebTasks();
		}
	};
	
	
	this.gotWebTasks = function(){
		Mojo.Log.info("Entering gotWebTasks function to sync tasks");
		this.syncLog += "<br />" + $L("Syncing tasks") + "...";
		if (this.outputDiv) {
			this.outputDiv.innerHTML += "<br />" + $L("Syncing tasks") + "...";
		}
		//Mojo.Log.info("Web tasks is: %j", tasks);
		//this.webEditedTasks = tasks;
		
		// Check for tasks edited both web and locally
		var i, j;
		
		//Mojo.Log.info("Local tasks %j", this.localEditedTasks);
		//Mojo.Log.info("Web tasks %j", this.webEditedTasks);
		
		//Check to see if tasks have been edited in both locations:
		for (j = 0; j < this.webEditedTasks.length; j++) {
			//Mojo.Log.info("J", j, this.webEditedTasks[j].id);
			if (this.localEditedTasks[this.webEditedTasks[j].id]) {
				// uh-oh!
				Mojo.Log.info("UH OH! TASK EDITED IN BOTH PLACES!!!!", this.webEditedTasks[j].id, this.webEditedTasks[j].title);
				this.localEditedTasks[this.webEditedTasks[j].id].sync = false;
				this.webEditedTasks[j].sync = false;
			}
		}
		
		this.syncLocalToWeb();
	};
			
	this.syncLocalToWeb = function() {
		//Sync local updates to web
		var i, j, tasksToAddToWeb = [];
		for (i in this.localEditedTasks) {
			if (this.localEditedTasks.hasOwnProperty(i)) {
				//Mojo.Log.info("Local Edited Task: %j", this.localEditedTasks[i].title);
				if (this.localEditedTasks[i].sync || this.localWins) {
					if (this.localEditedTasks[i].id) {
						api.editTask(this.localEditedTasks[i], this.timeDiff, function(){
							Mojo.Log.info("Edited web task!");
						});
					}
					else {
						tasksToAddToWeb.push(this.localEditedTasks[i]);
					}
				}
			}		
		}
		
		if (tasksToAddToWeb.length) {
			Mojo.Log.info("Sending new tasks to web: %s", tasksToAddToWeb.length);
			for (j = 0; j < tasksToAddToWeb.length; j++) {
				//Mojo.Log.info("This task:", tasksToAddToWeb[j].title);
				api.addTask(tasksToAddToWeb[j], this.timeDiff, this.taskAdded.bind(this, tasksToAddToWeb[j]));
			}
		}
		else {
			Mojo.Log.info("Found no tasks to add to Web!");
			this.finishTransactions('tasksadded');
		}
		
		// Make sure we've retrieved any changes to tasks that we just sent
		// to Toodledo - i.e. new "modified" timestamp, etc.	
		if (this.localEditedTasks.length) {
			this.webEditedTasks = [];
			var options = {
				modafter: MyAPP.account.lastaddedit,
				//get the first 100 tasks...
				start: 0,
				end: taskChunks
			};
			api.getTasks(options, this.gotFinalWebTasks.bind(this));
		}
		else {
			this.count.tasksfinal += 1;
			this.finishTransactions('tasksfinal');
		}
		

		this.syncWebToLocal();
		
	};
	
	this.syncWebToLocal = function () {
		//Sync web updates to local
		//Track number of database adds so we know when we've completed.
		if (this.webEditedTasks.length) {
			for (j = 0; j < this.webEditedTasks.length; j++) {
				//Mojo.Log.info("Adding web task:", j, this.webEditedTasks[j].title);
				this.count.tasks += 1;
				if (this.webEditedTasks[j].sync || !this.localWins) {
					dao.updateTask(this.webEditedTasks[j], this.finishTransactions.bind(this, 'tasks'));
				}
				else {
					this.finishTransactions('tasks');
				}
			}
		}
		else {
			this.finishTransactions('tasks');
		}
		
		//Check for deleted tasks on web:
		if (MyAPP.account.lastdelete > this.lastSync) {
			Mojo.Log.info("Deleted tasks on web since ", this.lastSync);
			api.getDeletedTasks(this.lastSync, this.gotDeletedTasks.bind(this));
			
		}
		else {
			Mojo.Log.info("No deleted tasks on web");
			var string = "<deleted></deleted>";
			var response = (new DOMParser()).parseFromString(string, "text/xml");
			this.gotDeletedTasks(response);
		}		
				
		
	};
	
	this.taskAdded = function(task, response){
		Mojo.Log.info("Task Added!?!?!");
		Mojo.Log.info("response: %j", response);
		Mojo.Log.info("task: %j", task);
		if (response.added) {
			//delete original (local only) task
			//Mojo.Log.info("Deleting task with value: ", task.value);
			dao.deleteTaskValue(task.value, function(){
			});
			//create new task with id from web
			task.id = response.added;
			task.value = task.id;
			Mojo.Log.info("Adding task: %j", task);
			this.count.tasksadded += 1;
			dao.updateTask(task, this.finishTransactions.bind(this, 'tasksadded'));
		}
		else {
			Mojo.Log.info("Error adding task to Toodledo");
			this.count.taskadded += 1;
			this.finishTransactions('tasksadded');
		}
	};
	
	this.gotFinalWebTasks = function(responseXML){
		// Make sure we've retrieved any changes to tasks that we just sent
		// to Toodledo - i.e. new "modified" timestamp, etc.	
		
		// Need to handle > 1000 tasks from Toodledo...
		var tasksXML = responseXML.getElementsByTagName('tasks');
		var totalTasks = tasksXML[0].getAttribute('total') * 1;
		var start = tasksXML[0].getAttribute('start') * 1;
		var end = tasksXML[0].getAttribute('end') * 1;
		Mojo.Log.info("Total:", totalTasks, "Start:", start, "End:", end);
				
		var taskXML = responseXML.getElementsByTagName('task');
		Mojo.Log.info("New or edited Tasks from Web %s", taskXML.length);
/*
		if (this.outputDiv) {
			this.outputDiv.innerHTML += "<br />" + $L("New/edited tasks from web:") + 
				" "  + taskXML.length;
		}

*/		
		var tasks = [], id, temp, key;
		var mykeys = ['parent', 'children', 'title', 'tag', 'folder', 'context', 'goal', 
			'added', 'modified', 'duedate', 'startdate', 'duetime', 'started', 
			'starttime', 'reminder', 'repeat', 'completed', 'completedon', 
			'rep_advanced', 'status', 'star', 'priority', 'length', 'timer', 'note'];
		for (i = 0; i < taskXML.length; i++) {
			id = taskXML[i].getElementsByTagName('id').item(0).textContent;
			//Mojo.Log.info("Task ID:", id);
			tasks[i] = {};
			tasks[i].id = id;
			
			for (key = 0; key < mykeys.length; key++) {
				//Mojo.Log.info("Key:", mykeys[key]);
				temp = taskXML[i].getElementsByTagName(mykeys[key]);
				//Mojo.Log.info("Keys %j", temp, key, mykeys[key]);
				if (temp.length > 0) {
					tasks[i][mykeys[key]] = temp.item(0).textContent;
				}
				else {
					tasks[i][mykeys[key]] = 0;
				}
			}
			//Mojo.Log.info("Get context", taskXML[i].getElementsByTagName('context'));
			tasks[i].context = taskXML[i].getElementsByTagName('context').item(0).getAttribute('id');

			// add milliseconds to be consistent with Javascript date object
			// convert duedate/time & startdate/time from server
			// because server stores them as plain strings (2010-04-08)
			// and they are sent in server timezone.
			tasks[i].duedate = tasks[i].duedate ? (tasks[i].duedate * 1 + this.timeDiff * 1) * 1000 : "";
			tasks[i].startdate = tasks[i].startdate ? (tasks[i].startdate * 1 + this.timeDiff * 1) * 1000 : "";
			tasks[i].duetime = (tasks[i].duetime > 0) ? (tasks[i].duetime * 1 + this.timeDiff * 1) * 1000 : "";
			tasks[i].starttime = (tasks[i].starttime > 0) ? (tasks[i].starttime * 1 + this.timeDiff * 1) * 1000 : "";
			
			//tasks[i].added = (tasks[i].added) * 1000;
			tasks[i].modified = (tasks[i].modified) * 1000;
			//tasks[i].completed = (tasks[i].completed > 0) ? (tasks[i].completed) * 1000 : "";
			tasks[i].added = (tasks[i].added * 1 + this.timeDiff * 1) * 1000;
			//tasks[i].modified = (tasks[i].modified * 1 + this.timeDiff * 1) * 1000;
			tasks[i].completed = (tasks[i].completed > 0) ? (tasks[i].completed * 1 + this.timeDiff * 1) * 1000 : "";
			
			tasks[i].value = id;
			
			// Make sure duetime is set to same date as duedate
			// Not sure if Toodledo duetime date can be trusted		
			if (tasks[i].startdate && tasks[i].starttime) {
				temp = new Date(tasks[i].starttime);
				temp2 = new Date(tasks[i].startdate);
				temp2.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
				tasks[i].starttime =  temp2.getTime();
			}
			if (tasks[i].duedate && tasks[i].duetime) {
				temp = new Date(tasks[i].duetime);
				temp2 = new Date(tasks[i].duedate);
				temp2.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
				tasks[i].duetime =  temp2.getTime();
			}
			
			//Set sync to true - will change to false later if
			//task was also edited on device
			tasks[i].sync = true;
			
			Mojo.Log.info("Task:", i, tasks[i].title, tasks[i].modified);
			//Mojo.Log.info("Task %j", tasks[i]);
			//dao.updateTask(tasks[i], function () { });
			this.webEditedTasks.push(tasks[i]);
		}
		//this.webEditedTasks.concat(this.webEditedTasks, tasks);
		//Mojo.Log.info("Web tasks is: %j", tasks);
		//Mojo.Log.info("Web tasks is: %j", this.webEditedTasks);
		if (totalTasks > end) {
			// need to grab more tasks!
			api.getTasks(
				{
					modafter: MyAPP.account.lastaddedit,
					start: end * 1 + 1,
					end: end * 1 + taskChunks
				}, this.gotEditedWebTasks.bind(this)
			);
		}
		else {
			this.gotFinalTasks();
		}
	};
	
	this.gotFinalTasks = function () {
		Mojo.Log.info("Adding final web tasks:", this.webEditedTasks.length);
		if (this.webEditedTasks.length) {
			for (j = 0; j < this.webEditedTasks.length; j++) {
				//Mojo.Log.info("Adding final web task:", j);
				this.count.tasksfinal += 1;
				if (this.webEditedTasks[j].sync || !this.localWins) {
					dao.updateTask(this.webEditedTasks[j], this.finishTransactions.bind(this, 'tasksfinal'));
				}
				else {
					this.finishTransactions('tasksfinal');
				}
			}
		}
		else {
			Mojo.Log.info("No final web tasks");
			this.finishTransactions('tasksfinal');
		}
		
	};
	
	
	this.gotDeletedTasks = function(responseXML){
		var i, id;
		//Mojo.Log.info("Entering gotDeletedTasks function");
		var taskXML = responseXML.getElementsByTagName('task');
		
		if (taskXML.length > 0) {
			Mojo.Log.info("Tasks deleted on web: %s", taskXML.length);
			this.syncLog += "<br />" + $L("Deleted tasks from web:") + 
					" "  + taskXML.length;
			if (this.outputDiv) {
				this.outputDiv.innerHTML += "<br />" + $L("Deleted tasks from web:") + 
					" "  + taskXML.length;
			}
			for (i = 0; i < taskXML.length; i++) {
				id = taskXML[i].getElementsByTagName('id').item(0).textContent;
				//Mojo.Log.info("Deleting task: %j", id);
				this.count.deleted += 1;
				dao.deleteTaskId(id, this.finishTransactions.bind(this, 'deleted'));
			}
		}
		else {
			Mojo.Log.info("No tasks to delete from device!");
			this.count.deleted += 1;
			this.finishTransactions('deleted');
		}
		dao.retrieveDeletedTasks(this.gotLocalDeletedTasks.bind(this));
	};
	
	this.gotLocalDeletedTasks = function(response){
	
		Mojo.Log.info("Local Deleted Tasks %s", response.length);
		this.syncLog += "<br />" + $L("Deleted tasks from device:") + 
				" "  + response.length;
		if (this.outputDiv) {
			this.outputDiv.innerHTML += "<br />" + $L("Deleted tasks from device:") + 
				" "  + response.length;
		}
		var i;
		if (response.length > 0) {
			for (i = 0; i < response.length; i++) {
				Mojo.Log.info("API Deleting task: %j", response[i]);
				this.count.localdeleted += 1;
				api.deleteTask(response[i].id, this.webTaskDeleted.bind(this, response[i].id));
			}
		}
		else {
			this.finishTransactions('localdeleted');
		}
		
		// Changed to syncing folders first!
		//this.getFolders();
	};
	
	this.webTaskDeleted = function(taskId, response){
		Mojo.Log.info("Deleting from deleted tasks table %s", taskId);
		Mojo.Log.info("response %j", response);
		if (response.success) {
			dao.deleteDeletedTask(taskId, this.finishTransactions.bind(this, 'localdeleted'));
		}
		else {
			Mojo.Log.info("Error deleting task from Toodledo!");
		}
		
	};
	
	this.getFolders = function(){
		Mojo.Log.info("Entering Get Folders");
		
		this.syncLog += "<br />" + $L("Syncing folders") + "...";
		if (this.outputDiv) {
			this.outputDiv.innerHTML += "<br />" + $L("Syncing folders") + "...";
		}
		//check for folder added/edited on device:
		if (MyAPP.local.lastfolderedit > this.lastSync) {
			Mojo.Log.info("last folder edit", MyAPP.local.lastfolderedit, this.lastSync);
			Mojo.Log.info("Folder added/edited on device!");
			dao.retrieveFolders(this.gotLocalFolders.bind(this));
		}
		else {
			this.count.foldersadded += 1;
			this.finishTransactions('foldersadded');
		}
		// check for folder added/edited on web:
		if (MyAPP.account.lastfolderedit > this.lastSync) {
			Mojo.Log.info("Getting Folders!");
			api.getFolders(this.gotFolders.bind(this));
		}
		else {
			Mojo.Log.info("No web folders changes to sync");
			this.finishTransactions('folders');
		}
		
//CONTEXTS		
		this.syncLog += "<br />" + $L("Syncing contexts") + "...";
		if (this.outputDiv) {
			this.outputDiv.innerHTML += "<br />" + $L("Syncing contexts") + "...";
		}
		//check for context added/edited on device:
		if (MyAPP.local.lastcontextedit > this.lastSync) {
			Mojo.Log.info("Context added/edited on device!");
			dao.retrieveContexts(this.gotLocalContexts.bind(this));
		}
		else {
			this.count.contextsadded += 1;
			this.finishTransactions('contextsadded');
		}
		
		//check for context added/edited on web:
		if (MyAPP.account.lastcontextedit > this.lastSync) {
			Mojo.Log.info("Getting Contexts!");
			api.getContexts(this.gotContexts.bind(this));
		}
		else {
			Mojo.Log.info("No web context changes to sync");
			this.finishTransactions('contexts');
		}

// GOALS		
		this.syncLog += "<br />" + $L("Syncing goals") + "...";
		if (this.outputDiv) {
			this.outputDiv.innerHTML += "<br />" + $L("Syncing goals") + "...";
		}
		//check for goal added/edited on device:
		if (MyAPP.local.lastgoaledit > this.lastSync) {
			Mojo.Log.info("Goal added/edited on device!");
			dao.retrieveGoals(this.gotLocalGoals.bind(this));
		}
		else {
			this.count.goalsadded += 1;
			this.finishTransactions('goalsadded');
		}
		
		//check for goals added/edited on web
		if (MyAPP.account.lastgoaledit > this.lastSync) {
			Mojo.Log.info("Getting Goals!");
			api.getGoals(this.gotGoals.bind(this));
		}
		else {
			Mojo.Log.info("No web goal changes to sync");
			this.finishTransactions('goals');
		}


		//check for folders/contexts/goals deleted on device:
		dao.retrieveDeletedFCGs(this.gotLocalFCGs.bind(this));		
		
	};
	
	//Retrieved deleted FCGs from Database
	this.gotLocalFCGs = function (response) {
		Mojo.Log.info("Deleted FCGs response %j", response);
		var i;
		if (response.length) {
			Mojo.Log.info ("Deleting FGCs on web", response.length);
			for (i = 0; i < response.length; i++) {
				switch (response[i].type) {
					case 'foldersList':
						api.deleteFolder(response[i].id, this.webFCGDeleted.bind(this, response[i].id, response[i].type));
						break;
					case 'contextsList':
						api.deleteContext(response[i].id, this.webFCGDeleted.bind(this, response[i].id, response[i].type));
						break;
					case 'goalsList':
						api.deleteGoal(response[i].id, this.webFCGDeleted.bind(this, response[i].id, response[i].type));
						break;
				}
			}
		}
		else {
			this.finishTransactions('deletedFCG');
		}
		
	};
	
	this.webFCGDeleted = function (id, type) {
		Mojo.Log.info("Deleting from deleted FCG table", id, type);
		this.count.deletedFCG += 1;
		dao.deleteDeletedFCG(id, type, this.finishTransactions.bind(this, 'deletedFCG'));
	//	Mojo.Log.info("response %j", response);
/*
		if (response.success) {
			dao.deleteDeletedFCG(id);
		}
		else {
			Mojo.Log.info("Error deleting FCG from Toodledo!");
		}

*/	};
	
	//Retrieved folders from Database
	this.gotLocalFolders = function (response) {
		var i;
		for (i = 0; i < response.length; i++) {
			if (response[i].modified > this.lastSync) {
				if (!response[i].id) {
					// folder added on device - sync to Toodledo
					this.count.foldersadded += 1;
					api.addFolder(response[i], this.folderAdded.bind(this, response[i]));
				}
				else {
					// folder modified on device - sync to Toodledo
					api.editFolder(response[i], function(){});
				}
			}
		}
		if (!this.count.foldersadded) {
			// no folders added
			this.finishTransactions('foldersadded');
		}	
	};
	
	this.folderAdded = function (folder, response) {
		Mojo.Log.info("Folder Added");
		Mojo.Log.info("response: %j", response);
		Mojo.Log.info("folder: %j", folder);
		if (response.added) {
			//delete original (local only) folder
			//Mojo.Log.info("Deleting folder with value: ", folder.value);
			dao.deleteFolder(folder.value, function(){
			});
			
			//update any tasks with the old folder value
			dao.updateTasksWithFCG(folder.value, 'foldersList', response.added);
			
			Mojo.Log.info("List", MyAPP.prefs.showList, "Filter", MyAPP.prefs.showFilter, folder.value);
			
			if (MyAPP.prefs.showList === 'folder' && MyAPP.prefs.showFilter == folder.value) {
				Mojo.Log.info("ShowFilter:", MyAPP.prefs.showFilter);
				MyAPP.prefs.showFilter = response.added;
				Mojo.Log.info("ShowFilter:", MyAPP.prefs.showFilter);
				MyAPP.prefsCookie.put(MyAPP.prefs);
			}

			//create new folder with id from web
			folder.id = response.added;
			folder.value = folder.id;
			Mojo.Log.info("Adding folder: %j", folder);
			dao.updateFolder(folder, this.finishTransactions.bind(this, 'foldersadded'));
		}
		else {
			Mojo.Log.info("Error adding folder to Toodledo");
			this.finishTransactions('foldersadded');
		}
		
	};
	
	this.contextAdded = function (context, response) {
		Mojo.Log.info("Context Added");
		Mojo.Log.info("response: %j", response);
		Mojo.Log.info("context: %j", context);
		if (response.added) {
			//delete original (local only) task
			//Mojo.Log.info("Deleting context with value: ", context.value);
			dao.deleteContext(context.value, function(){
			});
			
			//update any tasks with the old folder value
			dao.updateTasksWithFCG(context.value, 'contextsList', response.added);

			if (MyAPP.prefs.showList === 'context' && MyAPP.prefs.showFilter == context.value) {
				MyAPP.prefs.showFilter = response.added;
				MyAPP.prefsCookie.put(MyAPP.prefs);
			}

			//create new context with id from web
			context.id = response.added;
			context.value = context.id;
			Mojo.Log.info("Adding context: %j", context);
			dao.updateContext(context, this.finishTransactions.bind(this, 'contextsadded'));
		}
		else {
			Mojo.Log.info("Error adding context to Toodledo");
			this.finishTransactions('contextsadded');
		}
		
	};
	
	this.goalAdded = function (goal, response) {
		Mojo.Log.info("Goal Added");
		Mojo.Log.info("response: %j", response);
		Mojo.Log.info("goal: %j", goal);
		if (response.added) {
			//delete original (local only) goal
			//Mojo.Log.info("Deleting goal with value: ", goal.value);
			dao.deleteGoal(goal.value, function(){
			});
			
			//update any tasks with the old folder value
			dao.updateTasksWithFCG(goal.value, 'goalsList', response.added);

			if (MyAPP.prefs.showList === 'goal' && MyAPP.prefs.showFilter == goal.value) {
				Mojo.Log.info("ShowFilter:", MyAPP.prefs.showFilter);
				MyAPP.prefs.showFilter = response.added;
				Mojo.Log.info("ShowFilter:", MyAPP.prefs.showFilter);
				MyAPP.prefsCookie.put(MyAPP.prefs);
			}

			//create new goal with id from web
			goal.id = response.added;
			goal.value = goal.id;
			Mojo.Log.info("Adding goal: %j", goal);
			dao.updateGoal(goal, this.finishTransactions.bind(this, 'goalsadded'));
		}
		else {
			Mojo.Log.info("Error adding gal to Toodledo");
			this.finishTransactions('goalsadded');
		}
		
	};
	
	//Retrieved contexts from Database
	this.gotLocalContexts = function (response) {
		var i;
		for (i = 0; i < response.length; i++) {
			if (response[i].modified > this.lastSync) {
				if (!response[i].id) {
					// context added on device - sync to Toodledo
					this.count.contextsadded += 1;
					api.addContext(response[i], this.contextAdded.bind(this, response[i]));
				}
				else {
					// context modified on device - sync to Toodledo
					api.editContext(response[i], function(){
					});
				}
			}
		}
		if (!this.count.contextsadded) {
			this.finishTransactions('contextsadded');
		}
	};
	
	//Retrieved goals from Database
	this.gotLocalGoals = function (response) {
		var i;
		for (i=0; i < response.length; i++) {
			if (response[i].modified > this.lastSync) {
				if (!response[i].id) {
					// goal added on device - sync to Toodledo
					this.count.goalsadded += 1;
					api.addGoal(response[i], this.goalAdded.bind(this, response[i]));
				}
				else {
					// goal modified on device - sync to Toodledo
					api.editGoal(response[i], function () {});
				}
			}
		}
		if (!this.count.goalsadded) {
			this.finishTransactions('goalsadded');
		}
	};
	
	// Retrieved folders from web
	this.gotFolders = function(responseXML){
		Mojo.Log.info("Entering Folders");
		Mojo.Log.info("Folders XML ", responseXML);
		var folders = [], id;
		//folders[0] = {id: 0, privy: 0, archived: 0, sortorder: 0, label: "No Folder"};
		
		var folderXML = responseXML.getElementsByTagName('folder');
		if (folderXML.length) {
			//Delete any existing folders
			Mojo.Log.info("Found Folders", folderXML.length);
			//dao.deleteAllFolders();
			Mojo.Log.info("number folders", folderXML.length);
			for (i = 0; i < folderXML.length; i++) {
				id = folderXML[i].getAttribute('id');
				//Mojo.Log.info("Id: ", id);
				folders[id] = {};
				folders[id].id = id;
				//Mojo.Log.info("Folder: %j", folders[id]);
				folders[id].privy = folderXML[i].getAttribute('private');
				folders[id].archived = folderXML[i].getAttribute('archived');
				folders[id].sortorder = folderXML[i].getAttribute('order');
				//folders[id].modified = folderXML[i].getAttribute('modified') * 1000;
				folders[id].label = this.toodleDecode(folderXML[i].childNodes[0].nodeValue);
				folders[id].value = id;
				//Mojo.Log.info("Folder: %j", folders[id]);
				this.count.folders += 1;
				dao.updateFolder(folders[id], this.finishTransactions.bind(this, 'folders'));
			}
		}
		else {
			Mojo.Controller.errorDialog("Unable to retrieve folders from Toodledo");
			this.finishTransactions('folders');
		}
	};
	
	this.gotContexts = function(responseXML){
		Mojo.Log.info("Entering gotContexts");
		var contexts = [], id;
		var contextXML = responseXML.getElementsByTagName('context');
		if (contextXML.length) {
			Mojo.Log.info("Number contexts: ", contextXML.length);
			
			//dao.deleteAllContexts();
			for (i = 0; i < contextXML.length; i++) {
				id = contextXML[i].getAttribute('id');
				Mojo.Log.info("Context id: ", id);
				contexts[id] = {};
				contexts[id].id = id;
				contexts[id].label = this.toodleDecode(contextXML[i].childNodes[0].nodeValue);
				//contexts[id].modified = contextXML[i].getAttribute('modified') * 1000;
				contexts[id].value = id;
				//Mojo.Log.info("Context: %j", contexts[id]);
				this.count.contexts += 1;
				dao.updateContext(contexts[id], this.finishTransactions.bind(this, 'contexts'));
			}
		}
		else {
			Mojo.Controller.errorDialog("Unable to retrieve contexts from Toodledo");
			this.finishTransactions('contexts');
		}
	};
	
	this.gotGoals = function(responseXML){
		Mojo.Log.info("Entering gotGoals");
		var goals = [], id;
		var goalXML = responseXML.getElementsByTagName('goal');
		if (goalXML.length) {
			Mojo.Log.info("Number goals: ", goalXML.length);
			
			//dao.deleteAllGoals();
			for (i = 0; i < goalXML.length; i++) {
				id = goalXML[i].getAttribute('id');
				Mojo.Log.info("Goal id: ", id);
				goals[id] = {};
				goals[id].id = id;
				goals[id].label = this.toodleDecode(goalXML[i].childNodes[0].nodeValue);
				//goals[id].modified = goalXML[i].getAttribute('modified') * 1000;
				goals[id].contributes = goalXML[i].getAttribute('contributes');
				goals[id].level = goalXML[i].getAttribute('level');
				goals[id].archived = goalXML[i].getAttribute('archived');
				goals[id].value = id;
				//Mojo.Log.info("Goal: %j", goals[id]);
				this.count.goals += 1;
				dao.updateGoal(goals[id], this.finishTransactions.bind(this, 'goals'));
			}
		}
		else {
			Mojo.Log.info("Unable to retrieve goals from Toodledo");
			Mojo.Controller.errorDialog("Unable to retrieve goals from Toodledo");
			this.finishTransactions('goals');
		}
	};
	
	this.finishTransactions = function(type){
		this.count[type] -= 1;
		Mojo.Log.info("Transaction type: ", type, this.count[type]);
		if (this.count[type] <= 0) {
			Mojo.Log.info("Sync finished for ", type);
			this.synced[type] = true;
		}
		
		if (this.synced.folders &&
			this.synced.contexts &&
			this.synced.goals &&
			this.synced.foldersadded && 
			this.synced.contextsadded &&
			this.synced.goalsadded && 
			this.synced.deletedFCG &&
			this.tasksNotStarted
			) {
				this.tasksNotStarted = false;
				this.beginTaskSync();
				
		}		
		if (this.synced.tasks && this.synced.deleted &&
			this.synced.tasksadded &&
			this.synced.tasksfinal && 
			this.synced.localdeleted
			) {
				
			this.syncLog += "<br />" + $L("Finished Syncing!");
			MyAPP.syncLogCookie.put(this.syncLog);
			if (this.outputDiv) {
				this.outputDiv.innerHTML += "<br />" + $L("Finished Syncing!");
			}
			//Update last sync date/time - leave in milliseconds
			MyAPP.prefs.lastSync = new Date().getTime();
			//MyAPP.prefs.lastSync = this.ourTime * 1000;
			MyAPP.prefsCookie.put(MyAPP.prefs);
		
			Mojo.Log.info("Finished Syncing", MyAPP.prefs.lastSync);
			this.syncCallback($L("Finished Syncing!"));
			notify.getNextDate();
		}
	};
	
	this.toodleDecode = function(aString){
		//Mojo.Log.info("Original String: " + aString);
		var bString = aString.replace(/%26/g, "&");
		bString = bString.replace(/%3B/g, ";");
		//Mojo.Log.info("New String: " + bString);
		return bString;
	};
	
	this.setSyncTimer = function(delayInMinutes){
		Mojo.Log.info("Delay: ", delayInMinutes);
		var dashInfo, d, mo, yr, hrs, mins, secs, myDateString, dStr, bannerParams, date;
		Mojo.Log.info("Starting Sync");
		dashInfo = {
			title: Mojo.appInfo.title + " " + $L("Starting Sync!"),
			message: $L("Swipe to Cancel"),
			count: 1
		};
		
		//For testing purposes ONLY, set delay to 0.5 minutes!
		//delayInMinutes = 0.5;
		
		d = new Date();
		d.setTime(d.getTime() + delayInMinutes * 60 * 1000);
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
		Mojo.Log.info("Date String", myDateString);
		
		dStr = Mojo.Format.formatDate(d, 'medium');
		Mojo.Log.info("Time is", dStr);
		
		
		MyAPP.prefs.syncTimerId = new Mojo.Service.Request("palm://com.palm.power/timeout", {
			method: 'set',
			parameters: {
				key: Mojo.appInfo.id + '.sync',
				//'in': 	'00:05:00',
				at: myDateString,
				wakeup: true,
				uri: 'palm://com.palm.applicationManager/launch',
				params: {
					'id': Mojo.appInfo.id,
					'params': {
						action: 'sync',
						dashInfo: dashInfo
					}
				}
			},
			onSuccess: function(){
				Mojo.Log.info("Success in Setting up Sync!!! at", dStr);
			}.bind(this)
		});
	};
	
	this.clearSyncTimer = function(timerId){
		if (timerId) {
			new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: "clear",
				parameters: {
					"key": Mojo.appInfo.id + '.sync'
				},
				onSuccess: function(){
					Mojo.Log.info("Cleared Sync Timer!");
				}
			});
		}
	};
}

var sync = new Sync();

// OLD STUFF ******************************
/*
	// **************************************************************
	// ***** SYNC FUNCTIONS *****
	// **************************************************************

	this.initSync = function (syncCallback) {
		// function to call when sync finishes
		this.syncCallback = syncCallback;
		Mojo.Log.info("Starting Sync Process");
		this.getServerInfo(this.gotServerInfo.bind(this));
	};
	
	this.gotServerInfo = function (response) {
		Mojo.Log.info("Response from server info: %j", response);
		if (response.server) {
			this.ourTime = Math.floor(new Date().getTime() / 1000);
			this.timeDiff = response.server.unixtime - this.ourTime;
			Mojo.Log.info("Our time is ", this.ourTime);
			Mojo.Log.info("Time Difference is ", this.timeDiff, "seconds");
			
			//this.key = "1";  // testing for invalid key
			this.getAccountInfo(this.gotAccountInfo.bind(this));
		}
		else {
			Mojo.Log.info("No response from server!");
		}
	};
	
	this.gotAccountInfo = function(response){
		Mojo.Log.info("Response from account info: %j", response);
		if (response.account) {
			MyAPP.account = response.account;
			Mojo.Log.info("Last sync:", MyAPP.prefs.lastSync);
			Mojo.Log.info("Last add/edit:", MyAPP.account.lastaddedit);
			
			//Convert last sync date/time to seconds
			var lastSync = Math.floor(MyAPP.prefs.lastSync / 1000);
			Mojo.Log.info("Last sync no seconds:", lastSync, this.ourTime);
			
			//Check for new/edited tasks on device:
			if (MyAPP.local.lastaddedit > lastSync) {
				Mojo.Log.info("New or edited tasks on device!");
				
			}
			
			//Check for deleted tasks on device:
			if (MyAPP.local.lastdelete > lastSync) {
				Mojo.Log.info("Deleted tasks on device!");
				
			}
			
			//Check for new/edited tasks on web:
			if (MyAPP.account.lastaddedit > lastSync) {
				Mojo.Log.info("New or edited tasks on web!");
				var options = {modafter: lastSync};
				this.getTasks(options, this.gotEditedTasks.bind(this));
			}
			
			//Check for deleted tasks on web:
			if (MyAPP.account.lastdelete > lastSync) {
				Mojo.Log.info("Deleted tasks on web since ", lastSync);
				var myDateString, ls;
				ls = new Date(lastSync * 1000);
				myDateString = ls.getFullYear() + "-" + (ls.getMonth()+1) + "-" +
					ls.getDate() + " " + ls.getHours() + ":" +
					ls.getMinutes() + ":" + ls.getSeconds();
				Mojo.Log.info("Date String is", myDateString);
				this.getDeletedTasks(lastSync, this.gotDeletedTasks.bind(this));

			}
			
			//Update last sync date/time - leave in milliseconds
			//MyAPP.prefs.lastSync = Math.floor(new Date().getTime() / 1000);
			MyAPP.prefs.lastSync = new Date().getTime();
			MyAPP.prefsCookie.put(MyAPP.prefs);
			Mojo.Log.info("Finished Syncing", MyAPP.prefs.lastSync);
			
			this.syncCallback("Finished Syncing at " + new Date(MyAPP.prefs.lastSync));
			//this.fullSync(this.syncCallback);
		}
	};
	
	this.gotEditedTasks = function (responseXML) {
		var taskXML = responseXML.getElementsByTagName('task');
		Mojo.Log.info("Added/Edited Tasks from Web: %j", taskXML);
			var tasks = [], id, temp;
			var mykeys = ['parent', 'children', 'title', 'tag', 'folder', 'context', 'goal', 'added', 'modified', 'duedate', 'startdate', 'duetime', 'starttime', 'reminder', 'repeat', 'completed', 'rep_advanced', 'status', 'star', 'priority', 'length', 'timer', 'note'];
			for (i = 0; i < taskXML.length; i++) {
				id = taskXML[i].getElementsByTagName('id').item(0).textContent;
				//Mojo.Log.info("Task ID:", id);
				tasks[i] = {};
				tasks[i].id = id;
				
				for (key = 0; key < mykeys.length; key++) {
					//Mojo.Log.info("Key:", mykeys[key]);
					temp = taskXML[i].getElementsByTagName(mykeys[key]);
					//Mojo.Log.info("Keys %j", temp, key, mykeys[key]);
					if (temp.length > 0) {
						tasks[i][mykeys[key]] = temp.item(0).textContent;
					}
					else {
						tasks[i][mykeys[key]] = 0;
					}
				}
				// add milliseconds to be consistent with Javascript date object
				tasks[i].added *= 1000;
				tasks[i].modified *= 1000;
				tasks[i].duedate *= 1000;
				tasks[i].startdate *= 1000;
				tasks[i].duetime *= 1000;
				tasks[i].starttime *= 1000;
				tasks[i].value = id;
				
				Mojo.Log.info("Task: %j", tasks[i]);
				dao.updateTask(tasks[i], function () { });
			}	
	};
	
	this.gotDeletedTasks = function (response) {
		Mojo.Log.info("Deleted Tasks from Web: %j", response);
		if (response.deleted.num) {
			for (i = 0; i < response.deleted.task.length; i++) {
				dao.deleteTask(response.deleted.task[i].id);
			}
		}
		this.syncCallback("Finished Syncing at " + new Date(MyAPP.prefs.lastSync));
	};
	
	// **************************************************************
	// ***** FIRST SYNC or FULL RE-SYNC FUNCTIONS *****
	// **************************************************************
	
	this.fullSync = function (syncCallback) {
		Mojo.Log.info("Starting Full Sync");
		this.syncCallback = syncCallback;
		this.getFolders(this.gotFolders.bind(this));
	};
	
	this.gotFolders = function(responseXML) {
		
			//Mojo.Log.info("Folders XML ", responseXML);
			var folders = [], id;
			//folders[0] = {id: 0, privy: 0, archived: 0, sortorder: 0, label: "No Folder"};
			
			var folderXML = responseXML.getElementsByTagName('folder');
			
			if (folderXML) {
				//Delete any existing folders
				dao.deleteAllFolders();
				Mojo.Log.info("number folders", folderXML.length);
				for (i = 0; i < folderXML.length; i++) {
					id = folderXML[i].getAttribute('id');
					//Mojo.Log.info("Id: ", id);
					folders[id] = {};
					folders[id].id = id;
					//Mojo.Log.info("Folder: %j", folders[id]);
					folders[id].privy = folderXML[i].getAttribute('private');
					folders[id].archived = folderXML[i].getAttribute('archived');
					folders[id].sortorder = folderXML[i].getAttribute('order');
					folders[id].label = folderXML[i].childNodes[0].nodeValue;
					folders[id].value = id;
					Mojo.Log.info("Folder: %j", folders[id]);
					dao.createFolder(folders[id], function () {});
				}
				//this.foldersModel.items = folders;
				//Mojo.Log.info("Folders %j", this.foldersModel.items);
				Mojo.Log.info("Calling get Contexts");
				this.getContexts(this.gotContexts.bind(this));
			}
			else {
				Mojo.Controller.errorDialog("Unable to retrieve folders from Toodledo");	
			}
	};

	this.gotContexts = function (responseXML) {
			Mojo.Log.info("Entering gotContexts");
			var contexts = [], id;
			var contextXML = responseXML.getElementsByTagName('context');
			Mojo.Log.info("Number contexts: ", contextXML.length);
			
			dao.deleteAllContexts();
			for (i = 0; i < contextXML.length; i++) {
				id = contextXML[i].getAttribute('id');
				Mojo.Log.info("Context id: ", id);
				contexts[id] = {};
				contexts[id].id = id;
				contexts[id].label = contextXML[i].childNodes[0].nodeValue;
				contexts[id].value = id;
				Mojo.Log.info("Context: %j", contexts[id]);
				dao.createContext(contexts[id], function () {});
			}
			
			Mojo.Log.info("Calling getTasks");
			var options = {}; //{notcomp: 1};
			this.getTasks(options, this.gotTasks.bind(this));

	};
	
	this.gotTasks = function (responseXML) {
		
			Mojo.Log.info("---Entering gotTasks---");
			
			var tasks = [], id, temp;
			var mykeys = ['parent', 'children', 'title', 'tag', 'folder', 'context', 'goal', 'added', 'modified', 'duedate', 'startdate', 'duetime', 'starttime', 'reminder', 'repeat', 'completed', 'rep_advanced', 'status', 'star', 'priority', 'length', 'timer', 'note'];
			var taskXML = responseXML.getElementsByTagName('task');
			//Mojo.Log.info("tasks length", taskXML.length);
			
			dao.deleteAllTasks(function () { });
			
			for (i = 0; i < taskXML.length; i++) {
				id = taskXML[i].getElementsByTagName('id').item(0).textContent;
				//Mojo.Log.info("Task ID:", id);
				tasks[i] = {};
				tasks[i].id = id;
				
				for (key = 0; key < mykeys.length; key++) {
					//Mojo.Log.info("Key:", mykeys[key]);
					temp = taskXML[i].getElementsByTagName(mykeys[key]);
					//Mojo.Log.info("Keys %j", temp, key, mykeys[key]);
					if (temp.length > 0) {
						tasks[i][mykeys[key]] = temp.item(0).textContent;
					}
					else {
						tasks[i][mykeys[key]] = 0;
					}
				}
				// add milliseconds to be consistent with Javascript date object
				tasks[i].added *= 1000;
				tasks[i].modified *= 1000;
				tasks[i].duedate *= 1000;
				tasks[i].startdate *= 1000;
				tasks[i].duetime *= 1000;
				tasks[i].starttime *= 1000;
				tasks[i].value = id;
				
				Mojo.Log.info("Task: %j", tasks[i]);
				dao.createTask(tasks[i], function () {});
			}	
		this.fullSyncFinished();
	};
	
	this.fullSyncFinished = function () {			
		MyAPP.prefs.lastSync = Math.floor(new Date().getTime() / 1000);
		MyAPP.prefsCookie.put(MyAPP.prefs);
		
		this.syncCallback("Finished Full Sync at " + new Date(MyAPP.prefs.lastSync * 1000));
	};

*/
