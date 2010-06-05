function GoToTimeAssistant(sceneAssistant, date, inCallback) {
	this.sceneAssistant = sceneAssistant;
 	//Mojo.Log.info("Time is: ", date);
	this.otherDate = date;
	this.inCallback = inCallback;
}

GoToTimeAssistant.prototype.setup = function(widget){
	this.sceneAssistant.controller.get('dialog-title').innerHTML = $L('Select Time') + "...";
	
	//Mojo.log.info("Widget", widget);
	this.widget = widget;
		
	this.sceneAssistant.controller.setupWidget('gototime-picker', {
		label: $L('Time')
	}, this.goToTimePickerModel = {
		time: this.otherDate
	});
	
	this.sceneAssistant.controller.setupWidget('Time', {}, {
		label: $L("Use Selected Time")
	});
	this.sceneAssistant.controller.setupWidget('Now', {}, {
		label: $L("Use Now")
	});
	this.sceneAssistant.controller.setupWidget('None', {}, {
		label: $L("No Due Time")
	});
	/*
	 this.sceneAssistant.controller.setupWidget(
	 'Cancel',
	 {type: Mojo.Widget.defaultButton},
	 {label: $L("Cancel")}
	 );
	 */
	this.goToTimeHandler = this.goToTime.bindAsEventListener(this);
	this.sceneAssistant.controller.listen('Time', Mojo.Event.tap, this.goToTimeHandler);
	this.goToNowHandler = this.goToNow.bindAsEventListener(this);
	this.sceneAssistant.controller.listen('Now', Mojo.Event.tap, this.goToNowHandler);
	this.goToNoneHandler = this.goToNone.bindAsEventListener(this);
	this.sceneAssistant.controller.listen('None', Mojo.Event.tap, this.goToNoneHandler);
	
};	

GoToTimeAssistant.prototype.goToTime = function() {
	var otherDate = this.goToTimePickerModel.time;
	//Mojo.Log.info("Time is", otherDate);
	this.inCallback(otherDate);
	this.widget.mojo.close();
};

GoToTimeAssistant.prototype.goToNow = function() {
	var otherDate = new Date();
	//Mojo.Log.info("Time is", otherDate);
	this.inCallback(otherDate);
	this.widget.mojo.close();
};

GoToTimeAssistant.prototype.goToNone = function () {
	var otherDate = "";
	this.inCallback(otherDate);
	this.widget.mojo.close();
	
};

GoToTimeAssistant.prototype.cleanup = function() {
	this.sceneAssistant.controller.stopListening('Time', Mojo.Event.tap, this.goToTimeHandler);
	this.sceneAssistant.controller.stopListening('Now', Mojo.Event.tap, this.goToNowHandler);
	this.sceneAssistant.controller.stopListening('None', Mojo.Event.tap, this.goToNoneHandler);
};
