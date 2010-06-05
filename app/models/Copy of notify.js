function Notify() {
	
	this.setNotification = function(task){
		
		this.task = task;
	
		// If task already had an alarm set, clear it...
		dao.retrieveAlarms(this.clearTaskNotifications.bind(this));

		
		Mojo.Log.info("In Notify setNotification with task: %j", task);
		Mojo.Log.info("Date & Time:", new Date(task.duedate), new Date(task.duetime));

		// Determine timestamp for this task's alarm
		// If task has duedate or startdate, set notification
		if (task.duedate) {
			this.myDate = new Date(task.duedate);
			if (task.duetime) {
				this.myDate = new Date(task.duetime);
			}
		}
		else if (task.startdate) {
			this.myDate = new Date(task.startdate);
			if (task.starttime) {
				this.myDate = new Date(task.starttime);
			}
		}
		this.timestamp = this.myDate.getTime();
		
		dao.retrieveAlarmsTimestamp(this.timestamp, this.gotMyAlarms.bind(this));
		};
		
	this.gotMyAlarms = function (response) {
		Mojo.Log.info("In GotAlarms");
		Mojo.Log.info("Alarms response %j", response);
		var sqlString;
		if (response.length) {
			// Already have alarm at this timestamp!
			var myTasks = response.tasks.split(" ");
			Mojo.Log.info("Task Ids: %j", myTasks);
			
			sqlString = "SELECT * FROM tasks WHERE value=in.(" + myTasks + ");GO;";
			dao.retrieveTasksByString(sqlString, this.gotTasksDB.bind(this));
		}
		else {
			alarms = [];
			this.gotTasksDB(alarms);
		}
	};
	
	this.gotTasksDB = function(response) {
		Mojo.Log.info("Got Tasks response %j", response);
		var myDateString, i, dashInfo = [];
		
		myDateString = (this.task.duedate) ? Mojo.Format.formatDate(new Date(this.task.duedate), {
			date: 'medium'
		}) : $L("no due date");
		myDateString += " ";
		myDateString += (this.task.duetime) ? Mojo.Format.formatDate(new Date(this.task.duetime), {
			time: 'short'
		}) : "";
		
		tasks = "";
		for (i = 0; i < response.length; i++) {
			dashInfo[i] = {
				task: response[i].value,
				title: response[i].title,
				message: myDateString,
				count: i+1
			};	
			tasks += response.value + ", ";	
		}
				
		dashInfo.push( {
			task: this.task.value,
			title: this.task.title,
			message: myDateString,
			count: dashInfo.length + 1
		});
		tasks += this.task.value;
		
		myDateString = this.makeDateString(this.myDate);
		this.setAlarm(myDateString, dashInfo, this.timestamp);
		
		Mojo.Log.info("Updating Alarm Db with:", this.timestamp, tasks);
		dao.updateAlarm(this.timestamp, tasks);
		
	};
	
	this.setAlarm = function (myDateString, dashInfo, timestamp) {
		new Mojo.Service.Request("palm://com.palm.power/timeout", {
			method: 'set',
			parameters: {
				key: Mojo.appInfo.id + '.notify.' + timestamp,
				//'in': 	'00:05:00',
				at: myDateString,
				wakeup: true,
				uri: 'palm://com.palm.applicationManager/launch',
				params: {
					'id': Mojo.appInfo.id,
					'params': {
						action: 'notify',
						dashInfo: dashInfo
					}
				}
			},
			onSuccess: function(){
				Mojo.Log.info("Success in Setting up Notification for " + this.task.title + " at", myDateString);
			}.bind(this)
		});
		
	};
	
	this.clearTaskNotifications = function (response) {
		// clear notification for this.task.value
		Mojo.Log.info("Clearing Notification for task:", this.task.title);
		Mojo.Log.info("Alarms Response: %j", response);
		var i, k = -1;
		for (i = 0; i < response.length; i++) {
			if (response[i].tasks.indexOf(this.task.value)) {
				// timestamp includes this task - remove it...
				this.clearNotification(response[i].timestamp);
				k = i;
			}
		}
		if (k > -1) {
			// found a timestamp with this.task.value, need to remove that task
			// then reset the alarm for the rest...
		}
	};
	
	this.clearNotification = function (value) {
			new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: "clear",
				parameters: {
					"key": Mojo.appInfo.id + '.notify.' + value
				},
				onSuccess: function(){
					//Mojo.Log.info("Cleared Notification Timer! for task ", value);
				}
			});
		
	};
	
	this.makeDateString = function (d) {
		var mo, yr, hrs, mins, secs, myDateString, date;
		//Mojo.Log.info("Setting dateString for Timer");
		
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
		return (myDateString);
		
	};
}

var notify = new Notify();
