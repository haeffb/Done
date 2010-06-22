function GoToDateAssistant(sceneAssistant, date, inCallback) {
	this.sceneAssistant = sceneAssistant;
	this.otherDate = date;
	this.inCallback = inCallback;
}

GoToDateAssistant.prototype.setup = function(widget){
	this.sceneAssistant.controller.get('dialog-title').innerHTML = $L('Select Date') + "...";
	
	//Mojo.log.info("Widget", widget);
	this.widget = widget;
		
	this.sceneAssistant.controller.setupWidget('gotodate-picker', {
		label: $L('Date')
	}, this.goToDatePickerModel = {
		date: this.otherDate
	});

	// setup date button label with day of week
	var day = Mojo.Format.formatDate(this.goToDatePickerModel.date, {date: 'full'}).split(" ")[0];
	this.dateButtonModel = {
		label: $L("Use") + " " + day + " " +
		Mojo.Format.formatDate(this.otherDate, {
			date: 'medium'
		})
	};
	
	this.sceneAssistant.controller.setupWidget('Date', {}, 
		this.dateButtonModel
	);
	this.sceneAssistant.controller.setupWidget('Today', {}, {
		label: $L("Use Today")
	});
	/*
	 this.sceneAssistant.controller.setupWidget(
	 'Cancel',
	 {type: Mojo.Widget.defaultButton},
	 {label: $L("Cancel")}
	 );
	 */
	this.goToDateHandler = this.goToDate.bindAsEventListener(this);
	this.sceneAssistant.controller.listen('Date', Mojo.Event.tap, this.goToDateHandler);
	this.goToTodayHandler = this.goToToday.bindAsEventListener(this);
	this.sceneAssistant.controller.listen('Today', Mojo.Event.tap, this.goToTodayHandler);
	this.updateDateLabelHandler = this.updateDateLabel.bindAsEventListener(this);
	this.sceneAssistant.controller.listen('gotodate-picker', Mojo.Event.propertyChange, this.updateDateLabelHandler);
	
};	

GoToDateAssistant.prototype.updateDateLabel = function (event) {
	var day = Mojo.Format.formatDate(this.goToDatePickerModel.date, {date: 'full'}).split(" ")[0];
	//Mojo.Log.info("Day:", day);
	this.dateButtonModel.label= $L("Use") + " " + day + " " +
		Mojo.Format.formatDate(this.goToDatePickerModel.date, {date: 'medium'});
	this.sceneAssistant.controller.modelChanged(this.dateButtonModel);
};

GoToDateAssistant.prototype.goToDate = function() {
	var otherDate = this.goToDatePickerModel.date;
	//Mojo.Log.info("Date is", otherDate);
	this.inCallback(otherDate);
	this.widget.mojo.close();
};

GoToDateAssistant.prototype.goToToday = function() {
	var otherDate = new Date();
	//Mojo.Log.info("Date is", otherDate);
	this.inCallback(otherDate);
	this.widget.mojo.close();
};

GoToDateAssistant.prototype.cleanup = function() {
	this.sceneAssistant.controller.stopListening('Date', Mojo.Event.tap, this.goToDateHandler);
	this.sceneAssistant.controller.stopListening('Today', Mojo.Event.tap, this.goToTodayHandler);
	this.sceneAssistant.controller.stopListening('gotodate-picker', Mojo.Event.propertyChange, this.updateDateLabelHandler);
};
