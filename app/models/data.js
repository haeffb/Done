// **********************************************
// 	Data Access Object 
// **********************************************

function DAO () {
	this.db = null;
	var	databaseName = "ext:" + Mojo.appInfo.title + "DB", 	// required
		version = "0.2", 									// required
		displayName = Mojo.appInfo.title + " database"; 	// optional
		
		// Function for deleting all data - preparation for
		// changing account settings!
		this.deleteEverything = function () {
			this.deleteAllContexts();
			this.deleteAllDeletedTasks();
			this.deleteAllFolders();
			this.deleteAllGoals();
			this.deleteAllTasks();
			this.deleteAllDeletedFCGs();
			this.deleteAllCustomLists();
		};

/*  ********* SAVING FOR GETITDONEAPP ***************
	var sqlCreateTodoTable = "CREATE TABLE IF NOT EXISTS 'Todos' " +
		"(object_type INTEGER, object_id INTEGER, title TEXT, notes TEXT, " +
		"parent_id TEXT, sort_order INTEGER, due_date INTEGER, " +
		"created_by INTEGER, completed INTEGER); GO;";
	var sqlCreateTodo = "INSERT INTO 'Todos' (object_type, object_id, " +
		"title, notes, parent_id, sort_order, due_date, created_by, " +
		"completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); GO;";
	var sqlUpdateTodo = "UPDATE 'Todos' SET object_type=?, " +
		"title=?, notes=?, parent_id=?, sort_order=?, due_date=?, " +
		"created_by=?, completed=? WHERE object_id=?; GO;";
	var sqlRetrieveTodos = "SELECT * FROM Todos; GO;";
	var sqlDeleteTodo = "DELETE FROM Todos WHERE object_id=?; GO;";
	var sqlPurgeTodo = "DELETE FROM Todos WHERE (date > ? AND date < ?); GO;";
	var sqlGetEarliestTodo = "SELECT MIN(date) AS test FROM 'Todos'; GO;";

*/
// **********************************************
// Initialize database
// **********************************************
	this.init = function() {
		//Mojo.Log.info("Entering db init");

		//Mojo.Log.info("Database info:", databaseName, version, displayName);
		//Mojo.Log.info("SQL =", sqlCreateFoldersTable);
	
	    this.db = openDatabase(databaseName, version, displayName);
		
		if (!this.db) {
			//Mojo.Log.info("DAO ERROR! - Could not Open Database!");
		    Mojo.Controller.errorDialog(
		     	$L("DAO ERROR! - Could not Open Database!")
		    );
		}
	    this.db.transaction((function (inTransaction) {

			inTransaction.executeSql(sqlCreateTasksTable, [], 
				function() {
					//Mojo.Log.info("Created Tasks Table"); 
				}, 
				this.errorHandler
			);
	    	inTransaction.executeSql(sqlCreateFoldersTable, [], 
				function() {
					//Mojo.Log.info("Created Folders Table"); 
				}, 
				this.errorHandler
			);
	    	inTransaction.executeSql(sqlCreateContextsTable, [], 
				function () {
					//Mojo.Log.info("Created Contexts Table"); 
				}, 
				this.errorHandler
			);
	    	inTransaction.executeSql(sqlCreateGoalsTable, [], 
				function () {
					//Mojo.Log.info("Created Goals Table"); 
				}, 
				this.errorHandler
			);
	    	inTransaction.executeSql(sqlCreateDeletedTasksTable, [], 
				function () {
					//Mojo.Log.info("Created Deleted Tasks Table"); 
				}, 
				this.errorHandler
			);
	    	inTransaction.executeSql(sqlCreateDeletedFCGTable, [], 
				function () {
					//Mojo.Log.info("Created Deleted FCG Table"); 
				}, 
				this.errorHandler
			);
	    	inTransaction.executeSql(sqlCreateCustomListTable, [], 
				function () {
					//Mojo.Log.info("Created Custom List Table"); 
				}, 
				this.errorHandler
			);

	    }).bind(this));

		//Mojo.Log.info("****** Leaving db init *******");
  }; // End init().
// **********************************************
// Folder functions
// **********************************************

	// Setup SQL statements
	// Folders
	var sqlCreateFoldersTable = "CREATE TABLE IF NOT EXISTS 'folders' " + 
		"(id INTEGER, label TEXT, privy INTEGER, archived INTEGER, " +
		"sortorder INTEGER, modified INTEGER, value INTEGER PRIMARY KEY); GO;";
	var sqlCreateFolder = "INSERT INTO 'folders' (id, label, privy, archived, " + 
		"sortorder, modified, value) " +
		"VALUES (?, ?, ?, ?, ?, ?, ?); GO;";
	var sqlUpdateFolder = "REPLACE INTO 'folders' (id, label, privy, archived, " + 
		"sortorder, modified, value) " +
		"VALUES (?, ?, ?, ?, ?, ?, ?); GO;";
//	var sqlUpdateFolder = 	"UPDATE 'folders' SET label=?, privy=?, archived=? " +
//		"sortorder=?, modified=?, value=? WHERE id=?; GO;";
	var sqlRetrieveFolders = "SELECT * FROM folders ORDER BY label; GO;";
	var sqlDeleteFolder = "DELETE FROM folders WHERE value=?; GO;";
	var sqlDeleteAllFolders = "DELETE FROM folders; GO;";


	// ***** FOLDERS methods *****
	this.createFolder = function (f, inCallback) {
		//Mojo.Log.info("Entering db createFolder()");
		
		//Mojo.Log.info("Folder is %j", f);

	    this.db.transaction((function (inTransaction) { 
			inTransaction.executeSql(sqlCreateFolder, [ f.id, f.label, 
					f.privy, f.archived, f.sortorder, f.modified, f.value ], 
				function(inTransaction, inResultSet){
					//Mojo.Log.info("DB results: %j", inResultSet);
					var results = inResultSet.insertId;
					inCallback(results);
				},
				this.errorHandler);
	    }).bind(this));

  	}; // End createFolder().

	// Update Folder
	this.updateFolder = function (inFolderObject, inCallback) {
		//Mojo.Log.info("Entering db updateFolder()");
		
		var f = inFolderObject;
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlUpdateFolder, 
				[f.id, f.label, f.privy, f.archived, f.sortorder, f.modified, f.value],
				function(inTransaction, inResultSet){
					//Mojo.Log.info("DB results: %j", inResultSet);
					var results = inResultSet.insertId;
					inCallback(results);
				},
				this.errorHandler);
	    }).bind(this));

	}; // End updateFolder().
	
	this.retrieveFolders = function (inCallBack) {
		//Mojo.Log.info("Entering db retrieveFolders()");
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveFolders,
			[ ],
			function (inTransaction, inResultSet) {
				//Mojo.Log.info("Retrieve Folders Success");
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						//Mojo.Log.info("Result 1: %j", inResultSet.rows.item(i));
						// Use clone of object to avoid problems with immutability
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				//Mojo.Log.info("Folder Results in db: %j", results);
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));
	};

	this.deleteFolder = function (inFolder) {
		//Mojo.Log.info("Entering db deleteFolder()");
		// Delete Folder with value inFolder
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteFolder,
				[inFolder], 
				function(){
					//Mojo.Log.info("Deleted Folder", inFolder);
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.deleteAllFolders = function () {
		// Delete Folders
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteAllFolders,
				[], 
				function(){
					//Mojo.Log.info("Deleted Folders");
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.updateTasksWithFolder = function (inFolder) {
		//Mojo.Log.info("Entering db updateTasksWithFolder()");
		// Reset any folders with this value to default (0) value
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlUpdateTasksWithFolder,
				[0, inFolder],
				function (inTransaction, inResultSet) { 
					//Mojo.Log.info("SQL =", sqlUpdateTasksWithFolder);
					//Mojo.Log.info("Updated Tasks With Folder", inFolder);
					//Mojo.Log.info("Results: %j", inResultSet.rows);
				},
				function(inTransaction, inError) {
				    Mojo.Controller.errorDialog(
				     	$L("DAO ERROR") + " - (" + inError.code + ") : " + inError.message
				    );
				}
			);
	    }).bind(this));
	};
	
// **********************************************
// Context functions
// **********************************************

	// Contexts SQL statements
	var sqlCreateContextsTable = "CREATE TABLE IF NOT EXISTS 'contexts' " + 
		"(id INTEGER, label TEXT, modified INTEGER, value INTEGER PRIMARY KEY); GO;";
	var sqlCreateContext = "INSERT INTO 'contexts' (id, label, modified, value) " +
		"VALUES (?, ?, ?, ?); GO;";
	var sqlUpdateContext = "REPLACE INTO 'contexts' (id, label, modified, value) " +
		"VALUES (?, ?, ?, ?); GO;";
//	var sqlUpdateContext = "UPDATE 'contexts' SET label=?, modified=?, value=? WHERE id=?; GO;";
	var sqlRetrieveContexts = "SELECT * FROM contexts ORDER BY label; GO;";
	var sqlDeleteContext = "DELETE FROM contexts WHERE value=?; GO;";
	var sqlDeleteAllContexts = "DELETE FROM contexts; GO;";

	// ***** CONTEXTS methods *****
	this.createContext = function (c, inCallback) {
		//Mojo.Log.info("Entering db createContext()");
		
	    this.db.transaction((function (inTransaction) { 
		inTransaction.executeSql(sqlCreateContext, [ c.id, c.label, 
			c.modified, c.value ], 
			function(inTransaction, inResultSet){
				//Mojo.Log.info("DB results: %j", inResultSet);
				var results = inResultSet.insertId;
				inCallback(results);
			},
			this.errorHandler);
	    }).bind(this));
  	}; // End createContext().

	// Update Context
	this.updateContext = function (inContextObject, inCallback) {
		//Mojo.Log.info("Entering db updateContext()");
		
		var c = inContextObject;
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlUpdateContext, 
				[c.id, c.label, c.modified, c.value],
				function(inTransaction, inResultSet){
					//Mojo.Log.info("DB results: %j", inResultSet);
					var results = inResultSet.insertId;
					inCallback(results);
				},
				this.errorHandler);
	    }).bind(this));

	}; // End updateContext().
	
	this.retrieveContexts = function (inCallBack) {
		//Mojo.Log.info("Entering db retrieveContexts()");
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveContexts,
			[ ],
			function (inTransaction, inResultSet) {
				//Mojo.Log.info("Retrieve Contexts Success");
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						//Mojo.Log.info("Result 1: %j", inResultSet.rows.item(i));
						// Use clone of object to avoid problems with immutability
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				//Mojo.Log.info("Context Results in db: %j", results);
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));
	};

	this.deleteContext = function (inContext) {
		//Mojo.Log.info("Entering db deleteContext()");
		// Delete Context with value inContext
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteContext,
				[inContext], 
				function(){
					//Mojo.Log.info("Deleted Context", inContext);
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.deleteAllContexts = function () {
		//Mojo.Log.info("Entering db deleteContext()");
		// Delete All Contexts
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteAllContexts,
				[], 
				function(){
					//Mojo.Log.info("Deleted Contexts");
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.updateTasksWithContext = function (inContext) {
		//Mojo.Log.info("Entering db updateTasksWithContext()");
		// Reset any contexts with this value to default (0) value
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlUpdateTasksWithContext,
				[0, inContext],
				function (inTransaction, inResultSet) { 
					//Mojo.Log.info("SQL =", sqlUpdateTasksWithContext);
					//Mojo.Log.info("Updated Tasks With Folder", inContext);
					//Mojo.Log.info("Results: %j", inResultSet.rows);
				},
				function(inTransaction, inError) {
				    Mojo.Controller.errorDialog(
				     	$L("DAO ERROR") + " - (" + inError.code + ") : " + inError.message
				    );
				}
			);
	    }).bind(this));
	};
	
// **********************************************
// GOAL functions
// **********************************************
	
	// Goal SQL queries
	var sqlCreateGoalsTable = "CREATE TABLE IF NOT EXISTS 'goals' " + 
		"(id INTEGER, label TEXT, level INTEGER, archived INTEGER, " +
		"contributes INTEGER, modified INTEGER, value INTEGER PRIMARY KEY); GO;";
	var sqlCreateGoal = "INSERT INTO 'goals' (id, label, level, archived, " +
		"contributes, modified, value) " +
		"VALUES (?, ?, ?, ?, ?, ?, ?); GO;";
	var sqlUpdateGoal = "REPLACE INTO 'goals' (id, label, level, archived, " +
		"contributes, modified, value) " +
		"VALUES (?, ?, ?, ?, ?, ?, ?); GO;";
//	var sqlUpdateGoal = "UPDATE 'goals' SET label=?, level=?, archived=?, " +
//		"contributes=?, modified=?, value=? WHERE id=?; GO;";
	var sqlRetrieveGoals = "SELECT * FROM goals ORDER BY label; GO;";
	var sqlDeleteGoal = "DELETE FROM goals WHERE value=?; GO;";
	var sqlDeleteAllGoals = "DELETE FROM goals; GO;";

	// ***** Goal methods *****
	this.createGoal = function (g, inCallback) {
		//Mojo.Log.info("Entering db createGoal()");
		
		//Mojo.Log.info("Creating Goal: %j", g);

	    this.db.transaction((function (inTransaction) { 
			inTransaction.executeSql(sqlCreateGoal, [ g.id, g.label, g.level,
				g.archived, g.contributes, g.modified, g.value ], 
			function(inTransaction, inResultSet){
				//Mojo.Log.info("DB results: %j", inResultSet);
				var results = inResultSet.insertId;
				inCallback(results);
			},
			this.errorHandler);
	    }).bind(this));

  	}; // End createGoal().

	// Update Goal
	this.updateGoal = function (g, inCallback) {
		//Mojo.Log.info("Entering db updateGoal()");
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlUpdateGoal, 
				[g.id, g.label, g.level, g.archived, g.contributes, g.modified, 
					g.value],
				function(inTransaction, inResultSet){
					//Mojo.Log.info("DB results: %j", inResultSet);
					var results = inResultSet.insertId;
					inCallback(results);
				},
				this.errorHandler);
	    }).bind(this));

	}; // End updateGoal().
	
	this.retrieveGoals = function (inCallBack) {
		//Mojo.Log.info("Entering db retrieveGoals()");
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveGoals,
			[ ],
			function (inTransaction, inResultSet) {
				//Mojo.Log.info("Retrieve Goals Success");
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						//Mojo.Log.info("Result 1: %j", inResultSet.rows.item(i));
						// Use clone of object to avoid problems with immutability
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				//Mojo.Log.info("Goal Results in db: %j", results);
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));
	};

	this.deleteGoal = function (inGoal) {
		//Mojo.Log.info("Entering db deleteFolder()");
		// Delete Folder with value inFolder
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteGoal,
				[inGoal], 
				function(){
					//Mojo.Log.info("Deleted Goal", inGoal);
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.deleteAllGoals = function () {
		// Delete Goals
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteAllGoals,
				[], 
				function(){
					//Mojo.Log.info("Deleted Goals");
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.updateTasksWithGoal = function (inGoal) {
		//Mojo.Log.info("Entering db updateTasksWithGoal()");
		// Reset any goals with this value to default (0) value
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlUpdateTasksWithGoal,
				[0, inGoal],
				function (inTransaction, inResultSet) { 
					//Mojo.Log.info("SQL =", sqlUpdateTasksWithGoal);
					//Mojo.Log.info("Updated Tasks With Folder", inGoal);
					//Mojo.Log.info("Results: %j", inResultSet.rows);
				},
				function(inTransaction, inError) {
				    Mojo.Controller.errorDialog(
				     	$L("DAO ERROR") + " - (" + inError.code + ") : " + inError.message
				    );
				}
			);
	    }).bind(this));
	};

// **********************************************
// DELETED TASK functions
// Save ID's of locally deleted tasks for syncing
// **********************************************
	
	// Deleted Task SQL queries
	var sqlCreateDeletedTasksTable = "CREATE TABLE IF NOT EXISTS 'deletedtasks' " + 
		"(id INTEGER, label TEXT, value INTEGER PRIMARY KEY); GO;";
	var sqlCreateDeletedTask = "INSERT INTO 'deletedtasks' (id, label, value) " +
		"VALUES (?, ?, ?); GO;";
	var sqlRetrieveDeletedTasks = "SELECT * FROM deletedtasks; GO;";
	var sqlDeleteDeletedTask = "DELETE FROM deletedtasks WHERE value=?; GO;";
	var sqlDeleteAllDeletedTasks = "DELETE FROM deletedtasks; GO;";

	// ***** Deleted Task methods *****
	this.createDeletedTask = function (t, inCallback) {
		//Mojo.Log.info("Entering db createDeletedTask()");
		
		//Mojo.Log.info("Creating Deleted Task: %j", t);

	    this.db.transaction((function (inTransaction) { 
			inTransaction.executeSql(sqlCreateDeletedTask, [ t.id, t.label, t.value ], 
			function(inTransaction, inResultSet){
				//Mojo.Log.info("DB results: %j", inResultSet);
				var results = inResultSet.insertId;
				inCallback(results);
			},
			this.errorHandler);
	    }).bind(this));

  	}; // End createDeletedTask().
	
	this.retrieveDeletedTasks = function (inCallBack) {
		//Mojo.Log.info("Entering db retrieveDeletedTasks()");
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveDeletedTasks,
			[ ],
			function (inTransaction, inResultSet) {
				//Mojo.Log.info("Retrieve DeletedTasks Success");
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						//Mojo.Log.info("Result 1: %j", inResultSet.rows.item(i));
						// Use clone of object to avoid problems with immutability
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				//Mojo.Log.info("DeletedTasks Results in db: %j", results);
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));
	};

	this.deleteDeletedTask = function (inTaskValue, inCallback) {
		//Mojo.Log.info("Entering db deleteFolder()");
		// Delete Folder with value inFolder
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteDeletedTask,
				[inTaskValue], 
				function(inTransaction, inResultSet){
					//Mojo.Log.info("Deleted Deleted Task ", inTaskValue);
					inCallback();
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.deleteAllDeletedTasks = function () {
		// Delete Deleted Tasks
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteAllDeletedTasks,
				[], 
				function(){
					//Mojo.Log.info("Deleted DeletedTasks");
				},
				this.errorHandler);
	    }).bind(this));
	};
		
		
// **********************************************
// DELETED FOLDER CONTEXT GOAL functions
// Save ID's of locally deleted FCG's for syncing
// **********************************************
	
	// Deleted FCG SQL queries
	var sqlCreateDeletedFCGTable = "CREATE TABLE IF NOT EXISTS 'deletedfcgs' " + 
		"(id INTEGER PRIMARY KEY, type TEXT); GO;";
	var sqlCreateDeletedFCG = "INSERT INTO 'deletedfcgs' (id, type) " +
		"VALUES (?, ?); GO;";
	var sqlRetrieveDeletedFCGs = "SELECT * FROM deletedfcgs; GO;";
	var sqlDeleteDeletedFCG = "DELETE FROM deletedfcgs WHERE (id=? AND type=?); GO;";
	var sqlDeleteAllDeletedFCGs = "DELETE FROM deletedfcgs; GO;";

	// ***** Deleted FCG methods *****
	this.createDeletedFCG = function (id, type) {
		//Mojo.Log.info("Entering db createDeletedFCG()");
		
		//Mojo.Log.info("Creating Deleted FCG: %j", id, type);

	    this.db.transaction((function (inTransaction) { 
			inTransaction.executeSql(sqlCreateDeletedFCG, [ id, type ], 
			function(inTransaction, inResultSet){
				//Mojo.Log.info("DB results: %j", inResultSet);
				var results = inResultSet.insertId;
				//inCallback(results);
			},
			this.errorHandler);
	    }).bind(this));

  	}; // End createDeletedTask().
	
	this.retrieveDeletedFCGs = function (inCallBack) {
		//Mojo.Log.info("Entering db retrieveDeletedTasks()");
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveDeletedFCGs,
			[ ],
			function (inTransaction, inResultSet) {
				//Mojo.Log.info("Retrieve DeletedFCGs Success");
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						//Mojo.Log.info("Result 1: %j", inResultSet.rows.item(i));
						// Use clone of object to avoid problems with immutability
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				//Mojo.Log.info("DeletedFCGs Results in db: %j", results);
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));
	};

	this.deleteDeletedFCG = function (inValue, inType, inCallback) {
		//Mojo.Log.info("Entering db deleteDeletedFCGs()");
		// Delete FCG with id inValue
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteDeletedFCG,
				[inValue, inType], 
				function(inTransaction, inResultSet){
					//Mojo.Log.info("Deleted Deleted FCG ", inValue, inType);
					inCallback();
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.deleteAllDeletedFCGs = function () {
		// Delete Deleted FCGs
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteAllDeletedFCGs,
				[], 
				function(){
					//Mojo.Log.info("Deleted DeletedFCGs");
				},
				this.errorHandler);
	    }).bind(this));
	};
		
// **********************************************
// CSTOM LISTS functions
// Save confinguration of custom lists for viewing tasks
// **********************************************
	
	// Custom List SQL queries
	var sqlCreateCustomListTable = "CREATE TABLE IF NOT EXISTS 'customlists' " + 
		"(id INTEGER PRIMARY KEY, label TEXT, listobject TEXT); GO;";
	var sqlUpdateCustomList = "REPLACE INTO 'customlists' (id, label, listobject) " +
		"VALUES (?, ?, ?); GO;";
	var sqlRetrieveCustomLists = "SELECT id, label, listobject FROM customlists; GO;";
	var sqlRetrieveCustomList = "SELECT listobject from customlists WHERE id=?; GO;";
	var sqlDeleteCustomList = "DELETE FROM customlists WHERE (id=?); GO;";
	var sqlDeleteAllCustomLists = "DELETE FROM customlists; GO;";

	// ***** Custom List methods *****
	this.updateCustomList = function (id, label, listobject, inCallback) {
		//Mojo.Log.info("Entering db updateCustomList()");
		
		//Mojo.Log.info("Updating CustomList: %j", id, label);

	    this.db.transaction((function (inTransaction) { 
			inTransaction.executeSql(sqlUpdateCustomList, [ id, label, listobject ], 
			function(inTransaction, inResultSet){
				//Mojo.Log.info("DB results: %j", inResultSet);
				var results = inResultSet.insertId;
				inCallback(results);
			},
			this.errorHandler);
	    }).bind(this));

  	}; // End createDeletedTask().
  	
	this.retrieveCustomList = function (inId, inCallback) {
		//Mojo.Log.info("Entering db retrieveCustomList()");
		// Retrieve Custom List with id inId
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveCustomList,
			[inId], 
			function(inTransaction, inResultSet){
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						//Mojo.Log.info("Result in Custom List: %j", inResultSet.rows.item(i));
						// Use clone of object to avoid problems with immutability
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				//Mojo.Log.info("CustomList Results in db: %j", results);
				inCallback(results);
			},
			this.errorHandler);
	    }).bind(this));
	};
	
	this.retrieveCustomLists = function (inCallBack) {
		//Mojo.Log.info("Entering db retrieveCustomLists()");
		
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveCustomLists,
			[ ],
			function (inTransaction, inResultSet) {
				//Mojo.Log.info("Retrieve Custom Lists Success");
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						//Mojo.Log.info("Result 1: %j", inResultSet.rows.item(i));
						// Use clone of object to avoid problems with immutability
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				//Mojo.Log.info("CustomList Results in db: %j", results);
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));
	};

	this.deleteCustomList = function (inId, inCallback) {
		//Mojo.Log.info("Entering db deleteCustomList()");
		// Delete Custom List with id inId
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteCustomList,
				[inId], 
				function(inTransaction, inResultSet){
					//Mojo.Log.info("Deleted Custom List ", inId);
					inCallback();
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	this.deleteAllCustomLists = function () {
		// Delete Custom Lists
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteAllCustomLists,
				[], 
				function(){
					//Mojo.Log.info("Deleted Custom Lists");
				},
				this.errorHandler);
	    }).bind(this));
	};
		
// **********************************************
// Tasks functions
// **********************************************

	// Tasks SQL Statements
	var sqlCreateTasksTable = "CREATE TABLE IF NOT EXISTS 'tasks' " +
		"(id INTEGER, parent INTEGER, children TEXT, title TEXT, tag TEXT, " +
		"folder INTEGER, context INTEGER, goal INTEGER, added INTEGER, modified INTEGER, " +
		"duedate INTEGER, startdate INTEGER, duetime INTEGER, starttime INTEGER, " + 
		"reminder INTEGER, repeat INTEGER, completed INTEGER, rep_advanced INTEGER, " +
		"status INTEGER, star INTEGER, priority INTEGER, length INTEGER, " +
		"timer INTEGER, note TEXT, value INTEGER PRIMARY KEY); GO;";
	var sqlCreateTask = "INSERT INTO 'tasks' (id, parent, children, title, tag, " +
		"folder, context, goal, added, modified, duedate, startdate, " +
		"duetime, starttime, reminder, repeat, completed, rep_advanced, status, " +
		"star, priority, length, timer, note, value) VALUES " +
		"(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); GO;";
/*
	var sqlUpdateTask = "UPDATE 'tasks' SET parent=?, children=?, title=?, tag=?, " +
		"folder=?, context=?, goal=?, added=?, modified=?, duedate=?, started=?, " +
		"duetime=?, starttime=?, reminder=?, repeat=?, completed=?, rep_advanced=?, status=?, " +
		"star=?, priority=?, length=?, timer=?, note=?, id=? WHERE value=?; GO;";

*/
	var sqlUpdateTask = "REPLACE INTO 'tasks' (id, parent, children, title, tag, " +
		"folder, context, goal, added, modified, duedate, startdate, " +
		"duetime, starttime, reminder, repeat, completed, rep_advanced, status, " +
		"star, priority, length, timer, note, value) VALUES " +
		"(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); GO;";
	var sqlRetrieveAllTasks = "SELECT * FROM tasks; GO;";
	var sqlRetrieveTasksFromDate = "SELECT * FROM tasks WHERE (modified > ? OR id = 0); GO;";
	var sqlDeleteTaskId = "DELETE FROM tasks WHERE id=?; GO;";
	var sqlDeleteTaskValue = "DELETE FROM tasks WHERE value=?; GO;";
	var sqlDeleteAllTasks = "DELETE FROM tasks; GO;";
	var sqlPurgeTasks = "DELETE FROM tasks WHERE (added > ? AND added < ?); GO;";
	var sqlUpdateTasksWithFolder = "UPDATE 'tasks' SET folder=?, modified=? WHERE folder=?; GO;";
	var sqlUpdateTasksWithContext = "UPDATE 'tasks' SET context=?, modified=? WHERE context=?; GO;";
	var sqlUpdateTasksWithGoal = "UPDATE 'tasks' SET goal=?, modified=? WHERE goal=?; GO;";
	var sqlGetEarliestAddedDate = "SELECT MIN(added) AS test FROM 'tasks'; GO;";
	
	// ***** TASKS Methods *****
	this.createTask = function  (t, inCallback) {
		
	    this.db.transaction((function (inTransaction) { 
	    	inTransaction.executeSql(sqlCreateTask, 
				[ t.id, t.parent, t.children, t.title, t.tag, t.folder, t.context, t.goal,
					t.added, t.modified, t.duedate, t.startdate, t.duetime, t.starttime,
					t.reminder, t.repeat, t.completed, t.rep_advanced, t.status,
					t.star, t.priority, t.length, t.timer, t.note, t.value ], 
				function(inTransaction, inResultSet){
					//Mojo.Log.info("DB results: %j", inResultSet);
					var results = inResultSet.insertId;
					inCallback(results);
				},
				this.errorHandler);
	    }).bind(this));

  	}; // End createTask().

	// Update Task
	this.updateTask = function (t, inCallback) {
		Mojo.Log.info("Entering DAO.updateTask() with %j", t);

		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlUpdateTask, 
				[ t.id, t.parent, t.children, t.title, t.tag, t.folder, t.context, t.goal,
					t.added, t.modified, t.duedate, t.startdate, t.duetime, t.starttime,
					t.reminder, t.repeat, t.completed, t.rep_advanced, t.status,
					t.star, t.priority, t.length, t.timer, t.note, t.value ], 
				function(inTransaction, inResultSet){
					inCallback();
				}, 
				this.errorHandler);
	    }).bind(this));
		
	}; // End updateTask().
	
	this.retrieveTasks = function (inCallBack) {
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveAllTasks,
			[ ],
			function (inTransaction, inResultSet) {
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						// Use clone of object to avoid problems with immutability
						//Mojo.Log.info("Task %j", inResultSet.rows.item(i));
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));

	}; // End retrieveTasks().
	
	//Retrieve tasks using a passed in query string
	//Allows complex retrieval of tasks (by filter, etc)
	this.retrieveTasksByString = function (sqlString, inCallBack) {
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlString,
			[ ],
			function (inTransaction, inResultSet) {
				var results = [], i;
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						// Use clone of object to avoid problems with immutability
						//Mojo.Log.info("Task %j", inResultSet.rows.item(i));
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));

	}; // End retrieveTasksByString().

	this.retrieveTasksFromDate = function (inDate, inCallBack) {
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlRetrieveTasksFromDate,
			[ inDate ],
			function (inTransaction, inResultSet) {
				var results = [], i;
				//Mojo.Log.info("Rows", inResultSet.rows.length);
				if (inResultSet.rows) {
					for (i = 0; i < inResultSet.rows.length; i++) {
						// Use clone of object to avoid problems with immutability
						//Mojo.Log.info("Task: %j", inResultSet.rows.item(i), i);
						results.push(Object.clone(inResultSet.rows.item(i)));
					}
				}
				inCallBack(results);
			},
			this.errorHandler);
	    }).bind(this));

	}; // End retrieveTasks().
	
	// Delete a single task by Id
	this.deleteTaskId = function (inId, inCallback) {
		// Delete Task
		this.db.transaction((function (inTransaction, inResultSet) {
			inTransaction.executeSql(sqlDeleteTaskId,
				[inId], 
				function (inResultSet ) {
					//Mojo.Log.info("Deleted task:", inId);
					inCallback();
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	// Delete a single task by value
	this.deleteTaskValue = function (inVal, inCallback) {
		//Mojo.Log.info("Entering Delete Task by Value");
		// Delete Task
		this.db.transaction((function (inTransaction, inResultSet) {
			inTransaction.executeSql(sqlDeleteTaskValue,
				[inVal], 
				function (inResultSet ) {
					//Mojo.Log.info("Deleted task value:", inVal);
					this.resetParent(inVal);
					inCallback();
				}.bind(this),
				this.errorHandler);
	    }).bind(this));
	};
	
	this.resetParent = function (inVal) {
		var sqlResetParent = "UPDATE 'tasks' SET parent='' where parent=?;GO;";
		this.db.transaction((function (inTransaction, inResultSet) {
			inTransaction.executeSql(sqlResetParent,
				[inVal], 
				function (inResultSet ) {
					//Mojo.Log.info("Reset parents for children tasks of:", inVal);
				},
				this.errorHandler);
	    }).bind(this));
		
	};
	
	// Delete ALL  tasks *** Danger Will Robinson! Danger! ***
	this.deleteAllTasks = function (inCallback) {
		// Delete Task
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlDeleteAllTasks,
				[], 
				function ( ) { 
					//Mojo.Log.info("Deleted ALL tasks");
					//inCallback();
				},
				this.errorHandler);
	    }).bind(this));
	};
	
	// Delete tasks added within a date range
	this.purgeTasks = function (inDate1, inDate2, inCallback) {
		// Delete Tasks
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlPurgeTasks,
				[inDate1, inDate2], 
				function ( ) {
					inCallback();
				},
				this.errorHandler);
	    }).bind(this));
	};

	// Update tasks when deleting folder, context, goal
	this.updateTasksWithFCG = function (inValue, inType, inNewValue) {
		//Mojo.Log.info("Entering updateTasksWithFCG", inType, inValue, inNewValue);
		// 60000 milliseconds hack to make sure tasks are re-sycned with new 
		//folder, context, or goal,
		// NEED TO FIX THIS!!!!
		var sqlString, nowTime = Math.floor(new Date().getTime() / 1000) * 1000 + 60000;
		// Determine type of update
		switch (inType) {
			case 'foldersList':
				sqlString = sqlUpdateTasksWithFolder;
				break;
			case 'contextsList':
				sqlString = sqlUpdateTasksWithContext;
				break;
			case 'goalsList':
				sqlString = sqlUpdateTasksWithGoal;
				break;
		}
		this.db.transaction((function (inTransaction) {
			inTransaction.executeSql(sqlString,
				[inNewValue, nowTime, inValue], 
				function ( ) {
					//inCallback();
				},
				this.errorHandler);
	    }).bind(this));
	};

	// Select earliest added task in database
	this.getEarliestAddedDate = function (inCallBack) {
		this.db.transaction((function (inTransaction, inResultSet) {
			inTransaction.executeSql(sqlGetEarliestAddedDate,
				[],
				function(inTransaction, inResultSet){
					inCallBack(inResultSet.rows.item(0).test);
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

var dao = new DAO();


