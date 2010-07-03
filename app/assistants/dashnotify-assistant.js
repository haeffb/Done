//
//
// Add notifications table to database
// dao.addNotification will add to the DB AND will set alarm.
// alarm will delete from DB
// dao.deleteNotification will clear alarm
// dao.resetNotifications will reset all alarms
// dao.clearNotifications will clear all alarms
//
//
function DashnotifyAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

}

DashnotifyAssistant.prototype.setup = function () {
	/* this function is for setup tasks that have to happen when the scene is first created */
	//Mojo.Log.info("Dashnotify setup.");		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	/* add event handlers to listen to events from widgets */

	this.launchMainEditHandler = this.launchMainEdit.bindAsEventListener(this);
	this.controller.listen("dash-notify-message", Mojo.Event.tap, this.launchMainEditHandler);

	this.nextNotifyHandler = this.nextNotify.bindAsEventListener(this);
	this.launchMainHandler = this.launchMain.bindAsEventListener(this);
	this.controller.listen("dash-notify-icon", Mojo.Event.tap, this.nextNotifyHandler);	
	
/*
	this.nextNotifyHandler = this.nextNotify.bindAsEventListener(this);
	this.controller.listen("dash-arrow-right", Mojo.Event.tap, this.nextNotifyHandler);	
	this.prevNotifyHandler = this.prevNotify.bindAsEventListener(this);
	this.controller.listen("dash-arrow-left", Mojo.Event.tap, this.prevNotifyHandler);	

*/
	// Display initial notification.
	this.addNotify();

}; 

DashnotifyAssistant.prototype.addNotify = function () {
	this.dashInfos = [];
	this.display = 1;
	var sqlString, nowDate;
	nowDate = new Date().getTime();
	
	sqlString = "SELECT * FROM tasks WHERE (duedate<" + nowDate + 
		" OR duetime<"	+ nowDate + " OR startdate<" + nowDate +
		" OR starttime<" + nowDate + ") AND (completed=0 OR completed='') " +
		"ORDER BY duetime ASC, duedate ASC, " +
		"starttime ASC, startdate ASC, title DESC;GO;";
	//Mojo.Log.info("SQLString in Notification dashboard:", sqlString);
	dao.retrieveTasksByString(sqlString, this.gotTasksDB.bind(this));
};

DashnotifyAssistant.prototype.gotTasksDB = function (response) {
	//Mojo.Log.info("Notify for ", response.length, " tasks");
	var myDateString;

	if (response && response.length) {
		//response.reverse();
		response.sort(this.sortDates);
		for (i = 0; i < response.length; i++) {
			//Mojo.Log.info("Task in dashnotify: %j", response[i]);
			myDateString = (response[i].duedate) ? Mojo.Format.formatDate(new Date(response[i].duedate), {
				date: 'medium'
			}) : $L("no due date");
			myDateString += " ";
			myDateString += (response[i].duetime) ? Mojo.Format.formatDate(new Date(response[i].duetime), {
				time: 'short'
			}) : "";
			this.dashInfos.push({
				title: response[i].title,
				message: myDateString,
				count: i+1,
				value: response[i].value
			});
		}
		Mojo.Log.info("dashInfos:%j", this.dashInfos[0]);
		//this.display = response.length;
		this.display = 1;
		this.displayDashboard();
		if (MyAPP.prefs.notifyAlarm) {
			Mojo.Controller.getAppController().playSoundNotification("alerts", "");
		}
	}
	else {
		//Mojo.Log.info("No tasks to notify!!!");
		this.controller.window.close();
	}
};

DashnotifyAssistant.prototype.sortDates = function (a, b) {
	
	var aDate, bDate, nowDate = new Date().getTime();
	
	//Mojo.Log.info("A", a.title, "due", a.duedate, "time", a.duetime, "start", 
	//	a.startdate, "time", a.starttime);
	//Mojo.Log.info("B", b.title, "due", b.duedate, "time", b.duetime, "start", 
	//	b.startdate, "time", b.starttime);
	
	aDate = (a.duetime) ? a.duetime: a.duedate;
	bDate = (b.duetime) ? b.duetime: b.duedate;
	
	if (a.duetime) {
		aDate = a.duetime;
	}
	if (b.duetime) {
		bDate = b.duetime;
	}
	
	if ((a.startdate < nowDate && a.startdate > aDate) || aDate > nowDate) {
		aDate = (a.starttime) ? a.starttime : a.startdate;
	}
	if ((b.startdate < nowDate && b.startdate > bDate) || bDate > nowDate) {
		bDate = (b.starttime) ? b.starttime : b.startdate;
	}

	//Mojo.Log.info("A", aDate, "B", bDate);
	return bDate-aDate;
		
};

DashnotifyAssistant.prototype.displayDashboard = function () {
	var dashInfo = this.dashInfos[this.display - 1];
	this.controller.get('dash-notify-count').innerHTML = this.dashInfos.length;
	this.controller.get("dash-notify-title").innerHTML = this.display + ". " + dashInfo.title;
	this.controller.get('dash-notify-text').innerHTML = dashInfo.message;
	
};

DashnotifyAssistant.prototype.prevNotify = function () {
	//Mojo.Log.info("Tap on Icon!!!", this.dashInfos.length, this.display) ;
	this.display -= 1;
	if (!this.display) {
		this.display = this.dashInfos.length;
	}
	this.displayDashboard();
};
DashnotifyAssistant.prototype.nextNotify = function () {
	//Mojo.Log.info("Tap on Icon!!!", this.dashInfos.length, this.display) ;
	this.display += 1;
	if (this.display > this.dashInfos.length) {
		this.display = 1;
	}
	this.displayDashboard();
};

DashnotifyAssistant.prototype.launchMainEdit = function (event) {
	//Mojo.Log.info("Tap on DashAlarm!!! %j", event.target.className);
	//Mojo.Log.logProperties(event.target, "event");
	//Mojo.Log.info("launch app with ", this.display-1, this.dashInfos[this.display - 1].value);
	this.controller.serviceRequest('palm://com.palm.applicationManager', 
		{
			method: 'launch',
			parameters: {
				id: Mojo.appInfo.id,
				params: {
					action: 'openTask',
					taskValue: '' + this.dashInfos[this.display - 1].value
				}
			}
		}
	);
	//Remove the task from the dashboard
	//this.dashInfos.splice(this.display-1, 1);
	if (this.dashInfos.length) {
		this.nextNotify();
	}
	else {
		this.controller.window.close();
	}
};
DashnotifyAssistant.prototype.launchMain = function (event) {
	//Mojo.Log.info("Tap on DashAlarm!!! %j", event.target.className);
	this.controller.serviceRequest('palm://com.palm.applicationManager', 
		{
			method: 'launch',
			parameters: {
				id: Mojo.appInfo.id				
			}
		}
	);
};

DashnotifyAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


DashnotifyAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DashnotifyAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening("dash-notify-message", Mojo.Event.tap, this.launchMainEditHandler);
	this.controller.stopListening("dash-notify-icon", Mojo.Event.tap, this.launchMainHandler);	
	
	//this.controller.stopListening("dash-arrow-right", Mojo.Event.tap, this.nextNotifyHandler);	
	//this.controller.stopListening("dash-arrow-left", Mojo.Event.tap, this.prevNotifyHandler);	
	  
	  
};
