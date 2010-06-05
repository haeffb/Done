function Utils () {
	
	this.makeDueDate = function(inVal, inDate){
		//Mojo.Log.info("Make Due Date from:", inVal, inDate);
		var myDate = new Date();
		//Mojo.Log.info("MyDate is:", myDate);
		myDate.setHours(0, 0, 0, 0);
		
		switch (inVal) {
			case "0":
				return "";
			case "1":
				return myDate.getTime();
			case "2":
				myDate.setDate(myDate.getDate() + 1);
				return myDate.getTime();
			case "3":
				myDate.setDate(myDate.getDate() + 7);
				return myDate.getTime();
			case "4":
				myDate.setMonth(myDate.getMonth() + 1);
				return myDate.getTime();
			case "5":
				myDate.setFullYear(myDate.getFullYear() + 1);
				return myDate.getTime();
			case "6":
				return inDate;
			default:
				return "";
		}
	};
	
}
var utils = new Utils();
