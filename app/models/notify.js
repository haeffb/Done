function Notify() {
	
	this.setTomorrow = function() {
		var tomorrow, daily;
		tomorrow = new Date();
		daily = new Date(MyAPP.prefs.notifyTime);
		//Mojo.Log.info("Daily: ", daily);
		//tomorrow.setHours(0, 0, 0, 0);
		tomorrow.setHours(
			daily.getHours(),
			daily.getMinutes(),
			0, 0
		);
		if (tomorrow.getTime() < new Date().getTime()) {
			tomorrow.setDate(tomorrow.getDate() + 1);
		}
		//Mojo.Log.info("Tomorrow:", tomorrow);
		return tomorrow;
	};
	
	this.getNextDate = function () {
		if (!MyAPP.prefs.notifications) {
			// Notifications not enabled
			return;
		}
		var sqlString, tomorrow = this.setTomorrow().getTime(), now = new Date().getTime();
/*
		sqlString = "SELECT * FROM tasks WHERE (duetime<" + tomorrow + ") " + 
			"AND (duetime>" + now + ") " +
			"OR (starttime< " + tomorrow + ") " + 
			"AND (starttime>" + now + ") " +
			"ORDER BY duetime DESC, duedate DESC, " +
			"starttime DESC, startdate DESC, title ASC;GO;";

*/		sqlString = "SELECT * FROM tasks WHERE (duetime >" + now + ") " +
			"OR (starttime >" + now + ") AND (completed=0 OR completed='')" +
			"ORDER BY duetime DESC, duedate DESC, " +
			"starttime DESC, startdate DESC, title ASC;GO;";
		//Mojo.Log.info("Now:", new Date().getTime(), sqlString);
		dao.retrieveTasksByString(sqlString, this.gotTasksDB.bind(this));
	};
	
	this.gotTasksDB = function (response) {
		var thisDate = null, i, due, start, temp, now;
		//Mojo.Log.info("This Date: ", thisDate);
		//Mojo.Log.info("Response in notify %j", response);
		if (MyAPP.prefs.notifyDaily) {
			thisDate = this.setTomorrow();		
			//Mojo.Log.info("This Date: ", thisDate);
		}
		if (response.length) {
			if (!thisDate) {
				thisDate = new Date();
				// HACK - set to notify in 10 years!
				thisDate.setFullYear(thisDate.getFullYear() + 10);
			}
			now = new Date();
			for (i = 0; i < response.length; i++) {
				//Mojo.Log.info("Task:", response[i].title, response[i].duetime, response[i].starttime);
				//Mojo.Log.info("Task: %j", response[i]);
				//Mojo.Log.info("Now:", now.getTime(), now);
				if (response[i].duetime && (response[i].duetime > now.getTime())) {
					//due = new Date();
					//temp = new Date(response[i].duetime);
					due = new Date(response[i].duetime);
					//due.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
					thisDate = (due < thisDate) ? due : thisDate;
					//Mojo.Log.info("this, due, temp", thisDate, due, temp);
				}
				
				if (response[i].starttime && (response[i].starttime > now.getTime())) {
					//start = new Date();
					//temp = new Date(response[i].starttime);
					start = new Date(response[i].starttime);
					//start.setHours(temp.getHours(), temp.getMinutes(), temp.getSeconds(), 0);
					thisDate = (start < thisDate) ? start : thisDate;
					//Mojo.Log.info("this, start, temp", thisDate, start, temp);
				}
			}
		}
		//Mojo.Log.info("setting alarm at", thisDate);
		this.setAlarm(thisDate);
	};
	
	this.setAlarm = function(myDate){
		if (myDate) {
			var myDateString;
			myDateString = this.makeDateString(myDate);
			new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: 'set',
				parameters: {
					key: Mojo.appInfo.id + '.notify',
					//'in': 	'00:05:00',
					at: myDateString,
					wakeup: true,
					uri: 'palm://com.palm.applicationManager/launch',
					params: {
						'id': Mojo.appInfo.id,
						'params': {
							action: 'notify'
						}
					}
				},
				onSuccess: function(){
					//Mojo.Log.info("Success in Setting up Notification at", myDateString);
				}.bind(this)
			});
		}
	};
	
	this.updateNotifications = function (launch, taskValue) {
		var dashboardStage = Mojo.Controller.getAppController().getStageProxy("dashnotify");
		if (launch || dashboardStage) {
			//Mojo.Log.info("Updating Notifications");
			new Mojo.Service.Request("palm://com.palm.applicationManager/launch", {
				parameters: {
					'id': Mojo.appInfo.id,
					'params': {
						action: 'notify',
						taskValue: taskValue || null
					}
				}
			});
			//Mojo.Log.info("Called relaunch with Notify");
		}
	};
		
	this.clearNotification = function (value) {
			new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: "clear",
				parameters: {
					"key": Mojo.appInfo.id + '.notify'
				},
				onSuccess: function(){
					//Mojo.Log.info("Cleared Notification Timer!");
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
