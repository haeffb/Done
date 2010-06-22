function DashsyncAssistant(dashInfo) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

	if (dashInfo) {
		this.dashInfo = dashInfo;
		//Mojo.Log.info("Dash Info %j", dashInfo);
	}
}

DashsyncAssistant.prototype.setup = function () {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	this.switchHandler = this.launchMain.bindAsEventListener(this);
	this.controller.listen("dashsyncinfo", Mojo.Event.tap, this.switchHandler);
	
	this.displayDashboard(this.dashInfo);
	
/*
	this.controller.serviceRequest('palm://com.palm.connectionmanager', {
		method: 'getstatus',
		parameters: {},
		onSuccess: function(response){
			Mojo.Log.info("Response %j", response);
			if (response.isInternetConnectionAvailable) {
				this.displayDashboard(this.dashInfo);
			}
		}.bind(this),
		onFailure: function(response){
			this.controller.window.close();
		}.bind(this)
	});
*/
};

DashsyncAssistant.prototype.displayDashboard = function (dashInfo, syncCallback) {
	this.dashInfo = dashInfo;
	this.syncCallback = syncCallback;
	var renderedInfo, infoElement;
	renderedInfo = Mojo.View.render({object: dashInfo,
		template: "dashsync/dashsync-item-info"});
	infoElement = this.controller.get("dashsyncinfo");
	infoElement.innerHTML = renderedInfo;
	//Mojo.Controller.getAppController().playSoundNotification("alerts", "");

	sync.initSync(this.syncFinished.bind(this));
	
};

DashsyncAssistant.prototype.syncFinished = function (response) {
	//Mojo.Log.info("Sync Finished with %j", response);

	//this.controller.modelChanged(this.taskListModel);
	bannerParams = {messageText: MyAPP.appName + " " + response};
	Mojo.Controller.getAppController().showBanner(bannerParams, {});
	
	this.controller.window.close();
	
};


DashsyncAssistant.prototype.launchSnooze = function () {
	//Mojo.Log.info("Tap on Snoozer!!!", this.dashInfo.timer);
	//Miles.setTimer(this.dashInfo.id, this.dashInfo.timer);
	this.controller.window.close();
};

DashsyncAssistant.prototype.launchMain = function () {
	//Mojo.Log.info("Tap on DashAlarm!!!");
	this.controller.serviceRequest('palm://com.palm.applicationManager', 
		{
			method: 'launch',
			parameters: {
				id: MyAPP.appID,
				params: null
			}
		}
	);
	//this.controller.window.close();
};

DashsyncAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


DashsyncAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DashsyncAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening("dashsyncinfo", Mojo.Event.tap, this.switchHandler);
	//this.controller.stopListening("dashsyncmessage", Mojo.Event.tap, this.switchHandler);
	//this.controller.stopListening("dashsyncicon", Mojo.Event.tap, this.snoozeHandler);
	  
	  
};
