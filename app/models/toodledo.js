
function API () {
	
	this.url = "http://api.toodledo.com/api.php?method=";
	//appid: Mojo.appInfo.id,
	this.appid = Mojo.appInfo.ToodledoId; //"Done";
	this.invalidKey = 'key did not validate';
	
	this.init = function(){
		Mojo.Log.info("Setting Key to", MyAPP.prefs.key);
		this.key = MyAPP.prefs.key;
	};
	
	// **************************************************************
	// ***** CALL API FUNCTIONS *****	
	// **************************************************************

	this.doAPI = function (apiString, inCallback) {
		Mojo.Log.info("---Entering doAPI in Toodledo---");
		var error, fullApiString = apiString + ";key=" + this.key;
		Mojo.Log.info("apiString is ", fullApiString);
		new Ajax.Request(fullApiString, {
	  		method: 'get',
	  		onSuccess: function(response){
				Mojo.Log.info("responseXML returned from Toodledo!");
				error = response.responseXML.getElementsByTagName('error');
				if (error.length &&
					error.item(0).textContent === 'key did not validate'
					) {
					Mojo.Log.info("Error:", error.item(0).textContent);
					Mojo.Log.info("***** Key not valid. Calling getToken. *****", MyAPP.account.userid);
					this.getToken(MyAPP.account.userid, this.gotToken.bind(this), 
						this.doAPI.bind(this, apiString, inCallback));
				}
				else {
					//Mojo.Log.info("Response:", response.responseText);
					inCallback(response.responseXML);
				}
			}.bind(this),
			onFailure: this.hadFailure.bind(this)
		});
	};
	
	this.doAPIJSON = function (apiString, inCallback) {
		Mojo.Log.info("---Entering doAPI JSON in Toodledo---");
		var fullApiString = apiString + ";key=" + this.key;
		Mojo.Log.info("apiString is ", fullApiString);
		new Ajax.Request(fullApiString, {
	  		method: 'get',
	  		onSuccess: function(response){
				//Mojo.Log.info("Response:", response.responseText);
				var resp = xml2json.parser(response.responseText);
				//Mojo.Log.info("Response in doAPIJSON %j", resp);
				if (resp.error === 'key did not validate' || 
					resp.error === 'No Key Specified') {
					Mojo.Log.info("Invalid Key", apiString, MyAPP.account.userid);
					this.getToken(MyAPP.account.userid, this.gotToken.bind(this), 
						this.doAPIJSON.bind(this, apiString, inCallback));
				}
				else {
					//Mojo.Log.info("Key OK!");
					inCallback(resp);
				}
			}.bind(this),
			onFailure: this.hadFailure.bind(this)
		});
	};
	
	// **************************************************************
	// ***** ACCOUNT FUNCTIONS *****
	// **************************************************************

	this.getToken = function (uniqueUserid, inCallback, outCallback) {
		Mojo.Log.info("---Entering getToken in Toodledo---");
		
		var method = "getToken";
		var apiString = this.url + method + ";userid=" + uniqueUserid +
			";appid=" + this.appid; 
		Mojo.Log.info("API String: ", apiString);
		//this.doAPIJSON(apiString, inCallback, type);
		new Ajax.Request(apiString, {
	  		method: 'get',
	  		onSuccess: function(response){
				Mojo.Log.info("Response:", response.responseText);
				inCallback(xml2json.parser(response.responseText), outCallback);
			},
			onFailure: this.hadFailure.bind(this)
		});
	};
	
	this.gotToken = function(response, inCallback){
		Mojo.Log.info("Response from getToken %j", response);
		if (response.token) {
			this.key = MD5(MD5(MyAPP.prefs.password) + response.token + MyAPP.account.userid);
			Mojo.Log.info("Key is", this.key, "for", response.token, MyAPP.account.userid, MyAPP.prefs.password);

			MyAPP.prefs.key = this.key;
			MyAPP.prefsCookie.put(MyAPP.prefs);

			inCallback();
		}
		else {
			Mojo.Controller.errorDialog("Unable to retrieve token from Toodledo");
		}
	};

	this.getUniqueUserid = function (email, password, inCallback) {
		Mojo.Log.info("---Entering getUniqueUserid in Toodledo---");
		var method = "getUserid";
		var apiString = this.url + method + ";email=" + 
			encodeURIComponent(email) + ";pass=" + encodeURIComponent(password);
		Mojo.Log.info("API String: ", apiString);
		this.doAPIJSON(apiString, inCallback);
	};
	
	this.getAccountInfo = function (inCallback) {
		var method = "getAccountInfo";
		var apiString = this.url + method;
		apiString += ";unix=1";
		this.doAPIJSON(apiString, inCallback);
		
	};

	this.createAccount = function (email, password, inCallback) {
		Mojo.Log.info("---Entering createAccount in Toodledo---");
		var method = "createAccount";
		var apiString = this.url + method + ";email=" + email + ";pass=" + password;
		Mojo.Log.info("API String: ", apiString);
		this.doAPIJSON(apiString, inCallback);
	};
	
	this.getServerInfo = function (inCallback) {
		Mojo.Log.info("Entering getServerInfo");
		var method = "getServerInfo";
		var apiString = this.url + method ;
		this.doAPIJSON(apiString, inCallback);
		
	};
	
	// **************************************************************
	// ***** TASKS *****
	// **************************************************************
	this.getTasks = function (options, inCallback) {
		Mojo.Log.info("---Entering getTasks in Toodledo---");
		var method = "getTasks";
		var apiString = this.url + method;
		apiString += ";unix=1";
		if (options) {
			for (prop in options) {
				apiString += ";" + prop + "=" + options[prop];
			}
		}
		this.doAPI(apiString, inCallback);
	};
	
	this.getDeletedTasks = function (after, inCallback) {
		Mojo.Log.info("---Entering getDeletedTasks in Toodledo---");
		var method = "getDeleted";
		var apiString = this.url + method;
		apiString += ";unix=1";
		apiString += ";after=" + after;
		this.doAPI(apiString, inCallback);
	};
	
	this.addTask = function (task, timeDiff, inCallback) {
		Mojo.Log.info("---Entering addTask in Toodledo---");
		var method = "addTask";
		var apiString = this.url + method;
		//apiString += ";unix=1";
		for (prop in task) {
			if (task[prop]) {
				//Mojo.Log.info("Property:", prop, task[prop]);
/*
				if (prop === 'added' || prop === 'modified' ||
				prop === 'duedate' ||
				prop === 'startdate' ||
				prop === 'completed') {
					// remove milliseconds from Javascript date object 
					// to be consistent with Toodledo
					// convert dates from local time to server timezone
					apiString += ";" + prop + "=" + (Math.floor(task[prop] / 1000) - timeDiff);
				}

*/
				if (prop === 'added' || prop === 'modified') {
					apiString += ";" + prop + "=" + this.formatDate(task[prop], true);
				}
				else if (prop === 'duedate' || prop === 'startdate' ||
					prop === 'completed') {
					apiString += ";" + prop + "=" + this.formatDate(task[prop], false);
				}
				
				else if (prop === 'duetime' || prop === 'starttime') {
					apiString += ";" + prop + "=" + this.formatTime(task[prop]);
				}
				else if (prop === 'title' || prop === 'tag' || prop === 'note') {
					apiString += ";" + prop + "=" + this.toodleEncode(task[prop]);
				}
				else if (prop !== 'value' && prop !== 'sync') {
					apiString += ";" + prop + "=" + task[prop];
				}
			}
		}
		this.doAPIJSON(apiString, inCallback);
		
	};
	
	this.formatTime = function (unixtimestamp) {
		if (!unixtimestamp) {
			return "0";
		}
		var timeString = "", d = new Date(unixtimestamp), hrs, mins,
			ampm = 'am';
		//Mojo.Log.info("Date:", d);
		hrs =  d.getHours();
		if (hrs > 12) {
			hrs -= 12;
			ampm = 'pm';
		}
		if (hrs === 0) {
			hrs = 12;
		}
		//Mojo.Log.info("Hours:", hrs, ampm);
		timeString = "" + hrs;
		timeString +=  ":";
		mins = d.getMinutes();
		//Mojo.Log.info("Minutes:", mins, mins.length);
		timeString += (mins > 9) ? "" + d.getMinutes() : "0" + d.getMinutes();
		timeString += ampm;
		//Mojo.Log.info("Time String is", timeString);
		return timeString;
	};
	
	this.formatDate = function (unixtimestamp, getTime) {
		if (!unixtimestamp) {
			return "0";
		}
		var dateString = "", d = new Date(unixtimestamp), t;
		dateString = d.getFullYear();
		dateString += "-";
		t = d.getMonth() * 1 + 1;
		dateString += (t > 9) ? "" + t : "0" + t;
		dateString += "-";
		t = d.getDate();
		dateString += (t > 9) ? "" + t : "0" + t;
		if (getTime) {
			dateString += " " + d.getHours() + ":";
			t = d.getMinutes();
			dateString += (t > 9) ? "" + t : "0" + t;
			dateString += ":";
			t = d.getSeconds();
			dateString += (t > 9) ? "" + t : "0" + t;
		}
		//Mojo.Log.info("Date:", d, dateString);
		return dateString;
	};

	this.editTask = function (task, timeDiff, inCallback) {
		Mojo.Log.info("---Entering addTask in Toodledo---");
		var method = "editTask", repeat;
		var apiString = this.url + method;
		//apiString += ";unix=1;reschedule=1";
		if (task.completed) {
			repeat = task.repeat;
			if (repeat > 99) {
				repeat = task.repeat - 100;
			}
			if (repeat > 49){
				// Let Toodledo handle advanced repeats
				Mojo.Log.info("Advanced Repeat - Toodledo Do It!", task.title);
				apiString += ";reschedule=1";
			}
		}
		for (prop in task) {
			Mojo.Log.info("Property:", prop, task[prop]);
			//if (task[prop]) {
				if (prop === 'added' || prop === 'modified') {
					apiString += ";" + prop + "=" + this.formatDate(task[prop], true);
				}
				else if (prop === 'duedate' || prop === 'startdate' ||
					prop === 'completed') {
					apiString += ";" + prop + "=" + this.formatDate(task[prop], false);
				}
				else if (prop === 'duetime' || prop === 'starttime') {
					apiString += ";" + prop + "=" + this.formatTime(task[prop]);
				}
				else if (prop === 'title' || prop === 'tag' || prop === 'note') {
					apiString += ";" + prop + "=" + this.toodleEncode(task[prop]);
				}
				else if (prop !== 'value' && prop !== 'sync') {
					apiString += ";" + prop + "=" + task[prop];
				}
				else {
					Mojo.Log.info("OH!!!! Property:", prop, task[prop]);
				}
			//}
		}
		this.doAPIJSON(apiString, inCallback);
		
	};
	
	this.deleteTask = function (taskID, inCallback) {
		Mojo.Log.info("---Entering deleteTask in Toodledo---");
		var method = "deleteTask";
		var apiString = this.url + method;
		apiString += ";id=" + taskID;
		this.doAPIJSON(apiString, inCallback);
		
	};

	// **************************************************************
	// ***** FOLDERS *****
	// **************************************************************

	this.getFolders = function (inCallback) {
		Mojo.Log.info("---Entering getFolders in Toodledo---");
		var method = "getFolders";
		var apiString = this.url + method;
		this.doAPI( apiString, inCallback);
	};
	
	this.addFolder = function (folder, inCallback) {
		Mojo.Log.info("---Entering addFolder in Toodledo---");
		var method = "addFolder";
		var apiString = this.url + method + ";title=" +
			folder.label + ";private=" +
			folder.privy;
		this.doAPIJSON(apiString, inCallback);
	};
	
	this.editFolder = function (folder, inCallback) {
		Mojo.Log.info("---Entering editFolder in Toodledo---");
		var method = "editFolder";
		var apiString = this.url + method + ";id=" +
			folder.id + ";title=" +
			folder.label + ";private=" +
			folder.privy + ";archived=" + 
			folder.archived;
		this.doAPI(apiString, inCallback);
	};
	
	this.deleteFolder = function (id, inCallback) {
		Mojo.Log.info("---Entering deleteFolder in Toodledo---");
		var method = "deleteFolder";
		var apiString = this.url + method + ";id=" +
			id;
		this.doAPI(apiString, inCallback);
	};
	
	// **************************************************************
	// ***** CONTEXTS *****	
	// **************************************************************

	this.getContexts = function (inCallback) {
		Mojo.Log.info("---Entering getContexts in Toodledo---");
		var method = "getContexts";
		var apiString = this.url + method;
		this.doAPI(apiString, inCallback);
	};

	this.addContext = function (context, inCallback) {
		Mojo.Log.info("---Entering addContext in Toodledo---");
		var method = "addContext";
		var apiString = this.url + method + ";title=" +
			context.label;
		this.doAPIJSON(apiString, inCallback);
	};
	
	this.editContext = function (context, inCallback) {
		Mojo.Log.info("---Entering getTasks in Toodledo---");
		var method = "editContext";
		var apiString = this.url + method + ";id=" +
			context.id + ";title=" +
			context.label;
		this.doAPI(apiString, inCallback);
	};
	
	this.deleteContext = function (id, inCallback) {
		Mojo.Log.info("---Entering getTasks in Toodledo---");
		var method = "deleteContext";
		var apiString = this.url + method + ";id=" +
			id;
		this.doAPI(apiString, inCallback);
	};

	// **************************************************************
	// ****** GOALS ***** 
	// **************************************************************

	this.getGoals = function (inCallback) {
		Mojo.Log.info("---Entering getGoals in Toodledo---");
		var method = "getGoals";
		var apiString = this.url + method;
		this.doAPI(apiString, inCallback);
	};
	
	this.addGoal = function (goal, inCallback) {
		Mojo.Log.info("---Entering addGoal in Toodledo---");
		var method = "addGoal";
		var apiString = this.url + method + ";title=" +
			goal.label + ";level=" +
			goal.level + ";contributes=" +
			goal.contributes;
		this.doAPIJSON(apiString, inCallback);
	};
	
	this.editGoal = function (goal, inCallback) {
		Mojo.Log.info("---Entering editGoal in Toodledo---");
		var method = "editGoal";
		var apiString = this.url + method + ";id=" +
			goal.id + ";title=" +
			goal.label + ";level=" +
			goal.level + ";contributes=" +
			goal.contributes + ";archived=" +
			goal.archived;
		this.doAPI(apiString, inCallback);
	};

	this.deleteGoal = function (id, inCallback) {
		Mojo.Log.info("---Entering getTasks in Toodledo---");
		var method = "deleteGoal";
		var apiString = this.url + method + ";id=" +
			id;
		this.doAPI(apiString, inCallback);
	};
	
	// **************************************************************
	// ***** FAILURE! *****
	// **************************************************************

	this.hadFailure = function (error) {
		Mojo.Log.info("****** AJAX REQUEST FAILURE *******");
		Mojo.Controller.errorDialog("Unable to connect to Toodledo");
	};
	
	
	// **************************************************************
	// ***** TOODLEDO string encoding/decoding *****
	// **************************************************************
	
	this.toodleEncode = function(aString) {
		//Mojo.Log.info("Original String: " + aString);
		var bString = aString.replace(/&/g, "%26");
		bString = bString.replace(/;/g, "%3B");
		bString = bString.replace(/\n/g, "%0D%0A");
		bString = bString.replace(/#/g,"%23");
		//Mojo.Log.info("New String: " + bString);
		return bString;
	};
	
	this.toodleDecode = function(aString) {
		//Mojo.Log.info("Original String: " + aString);
		var bString = aString.replace(/%26/g, "&");
		bString = bString.replace(/%3B/g, ";");
		//bString = bString.replace(/\n/g, "%0D%0A");
		//Mojo.Log.info("New String: " + bString);
		return bString;
	};

}

var api = new API();
