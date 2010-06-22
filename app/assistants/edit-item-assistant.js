function EditItemAssistant(sceneAssistant, type, object, callBackFunc) {
	this.sceneAssistant = sceneAssistant;
	this.callBackFunc = callBackFunc;
	this.object = object;
	this.type = type;
	//Mojo.Log.info("Object is: %j", object);
}

EditItemAssistant.prototype.setup = function (widget) {
	var localizationData = {}, typeString;
	switch (this.type) {
		case 'foldersList':
			typeString = $L("Folder");
			break;
		case 'contextsList':
			typeString = $L("Context");
			break;
		case 'goalsList':
			typeString = $L("Goal");
			break;
	}
	localizationData = {typeString: typeString, action: $L("Edit")};
	this.sceneAssistant.controller.get('dialog-title').innerHTML = $L('#{action} #{typeString}').interpolate(localizationData) + "...";
	this.sceneAssistant.controller.get('itemGroupLabel').innerHTML = typeString + " " + $L('Info');
	this.sceneAssistant.controller.get('itemNameLabel').innerHTML = typeString;
	//this.sceneAssistant.controller.get('textField1Label').innerHTML = $L('Field 1');
	//this.sceneAssistant.controller.get('textField2Label').innerHTML = $L('Field 2');
	

	this.sceneAssistant.myVar = false;
	
	this.widget = widget;
	this.sceneAssistant.controller.setupWidget('itemName', {
			focusMode: Mojo.Widget.focusSelectMode
		}, 
		this.itemNameModel = {
			value: this.object.label
		}
	);
	
/*
	this.sceneAssistant.controller.setupWidget('textField1', 
		{
			focusMode: Mojo.Widget.focusSelectMode,
			hintText: $L('Text Field 1'),
			//modifierState: Mojo.Widget.numLock,
			autoFocus: false
			//charsAllow: this.onlyNum.bind(this)			
		}, 
		this.textField1Model = {
			value: this.object.id + ""
		}
	);

	this.sceneAssistant.controller.setupWidget('textField2', 
		{
			focusMode: Mojo.Widget.focusSelectMode,
			hintText: $L('Text Field 2'),
			modifierState: Mojo.Widget.numLock,
			autoFocus: false,
			charsAllow: this.onlyNum.bind(this)			
		}, 
		this.textField2Model = {
			value: this.object.value + ""
		}
	);

*/	
	localizationData = {typeString: typeString, action: $L("Update")};
	
	this.sceneAssistant.controller.setupWidget('updateItem', {}, {
		label: $L('#{action} #{typeString}').interpolate(localizationData)
	});

	this.updateItemHandler = this.updateItem.bindAsEventListener(this);
	this.sceneAssistant.controller.listen('updateItem', Mojo.Event.tap, this.updateItemHandler);
};


EditItemAssistant.prototype.onlyNum = function (charCode) {
	if (charCode === 46 || (charCode > 47 && charCode < 58)) {
		return true;
	}
	return false;
};

EditItemAssistant.prototype.updateItem = function () {	

	//Mojo.Log.info("The ID is:", this.object.value);

	var nowTime = Math.floor(new Date().getTime() / 1000) * 1000;

	this.object.label = this.itemNameModel.value;
	this.object.modified = nowTime;
	switch (this.type) {
		case 'foldersList':
			dao.updateFolder(this.object, function () {});
			MyAPP.local.lastfolderedit = Math.floor(nowTime / 1000);
			break;
		case 'contextsList':
			dao.updateContext(this.object, function () {});
			MyAPP.local.lastcontextedit = Math.floor(nowTime / 1000);
			break;
		case 'goalsList':
			dao.updateGoal(this.object, function () {});			
			MyAPP.local.lastgoaledit = Math.floor(nowTime / 1000);
			break;
	}
	
	MyAPP.localCookie.put(MyAPP.local);

	this.callBackFunc(this.type, this.object);  // just in case, does nothing for now
	this.widget.mojo.close();
};

EditItemAssistant.prototype.dummy = function () {
	
};

EditItemAssistant.prototype.returnFromCreateVehicle = function (results) {
	//Mojo.Log.info("Return from Create Vehicle with results: %j", results, this.index);
	Miles.vehicles[this.index].value = results;
	Miles.vehiclesByIndex[results] = Miles.vehicles[this.index];
	//Mojo.Log.info("Vehicle is: %j", Miles.vehicles[this.index]);
};

EditItemAssistant.prototype.cleanup = function () {
	this.sceneAssistant.controller.stopListening('updateItem', Mojo.Event.tap, this.updateItemHandler);
};
