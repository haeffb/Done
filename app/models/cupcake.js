/*
 * CUPCAKE.JS
 * 
 * Simple SQLite database example for saving/retrieving a "cookie" like object that
 * can be longer than 4k.
 * 
 * Usage:
 * 
 *  ---In setup() of StageAssistant:---
 *  
 *  cupcake.init();
 *  
 * ---Someplace you want to save the settings object:---
 *  
 *  myObject = { ... some settings object stuff ... }
 *  cupcake.updateCupcake('aLabel', myObject);
 * 
 *
 *  ---Someplace you want to retrieve the object:---
 *  
 *  cupcake.retrieveCupcake ('aLabel', this.gotCupcake.bind(this));
 * 
 *  ---This is the callback function where the object will be retrieved---
 *  
 *  MyAssistant.prototype.gotCupcake = function (response) {
 *  	this.myObject = response;
 *  }
 * 
 * ---Someplace you want to delete a cupcake:---
 * 
 * cupcake.deleteCupcake('aLabel');
 */
 
 
function CUPCAKE(){
	this.db = null;
	var databaseName = "ext:" + Mojo.appInfo.title + "CupcakeDB", // required
		version = "0.2", // required
 		displayName = Mojo.appInfo.title + " cupcake database"; // optional
 
 
	this.init = function(){
		//Mojo.Log.info("Entering db init");
 
		//Mojo.Log.info("Database info:", databaseName, version, displayName);
		//Mojo.Log.info("SQL =", sqlCreateFoldersTable);
 
		this.db = openDatabase(databaseName, version, displayName);
 
		if (!this.db) {
			Mojo.Log.info("DAO ERROR! - Could not Open Database!");
			Mojo.Controller.errorDialog($L("DAO ERROR! - Could not Open Database!"));
			return false;
		}
 
		// Create table
		var sqlCreateCupcakeTable = "CREATE TABLE IF NOT EXISTS 'cupcakes' " + 
		"(label TEXT PRIMARY KEY, cupcakeobject TEXT); GO;";
		this.db.transaction((function (inTransaction) {
 
			inTransaction.executeSql( sqlCreateCupcakeTable, 
				[], 
				function() {
					//Mojo.Log.info("Created Tasks Table"); 
				}, 
				this.errorHandler
			);
 
	    }).bind(this));		
 
		return true;
	};
 
	this.updateCupcake = function ( label, cupcake ) {
		var sqlUpdateCupcake = "REPLACE INTO 'cupcakes' (label, cupcakeobject) " +
		"VALUES (?, ?); GO;";
 
		cupcake = Object.toJSON(cupcake);
 
	    this.db.transaction((function (inTransaction) { 
			inTransaction.executeSql( sqlUpdateCupcake, 
			[ label, cupcake ], 
			function(inTransaction, inResultSet){
				Mojo.Log.info("DB results: %j", inResultSet);
			},
			this.errorHandler);
	    }).bind(this));
 
	};	
 
	this.retrieveCupcake = function (inLabel, inCallback) {
 
		//Mojo.Log.info("Entering db retrieveCupcake()");
 
		// Retrieve Cupcake with label inLabel
		var sqlRetrieveCupcake =  "SELECT label, cupcakeobject from cupcakes WHERE label=?; GO;";
 
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql( sqlRetrieveCupcake,
			[inLabel], 
			function(inTransaction, inResultSet){
				var results = [], i, temp;
				if (inResultSet.rows) {
					results = Object.clone(inResultSet.rows.item(0));
				}
 
				//Mojo.Log.info("Cupcake Results in db: %j", results);
				inCallback(results.cupcakeobject.evalJSON());
			},
			this.errorHandler);
	    }).bind(this));
	};
 
	this.deleteCupcake = function (inLabel) {
		//Mojo.Log.info("Entering db deleteCupcake()");
		// Delete Cupcake with label inLabel
 
		var sqlDeleteCupcake = "DELETE FROM cupcakes WHERE (label=?); GO;";
 
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteCupcake,
				[inLabel], 
				function(inTransaction, inResultSet){
					//Mojo.Log.info("Deleted Cupcake ", inLabel);
				},
				this.errorHandler);
	    }).bind(this));
	};
 
 
// **********************************************
// Error Handler
// **********************************************
 
	this.errorHandler = function(inTransaction, inError) {
		Mojo.Log.info("DAO ERROR!", inError.message);
	    Mojo.Controller.errorDialog(
	     	$L("DAO ERROR") + " - (" + inError.code + ") : " + inError.message
	    );
 
  	}; // End errorHandler().
 
}
 
var cupcake = new CUPCAKE();