/*
 * List all updated content from a date to now
 *   
 * This web script will return all a list of all content in a specified space
 * modified after the specified date
 *   
 * /alfresco/service/updated/in/{path}/since?date={date}
 *   
 * {path}    This is the path to the space that contains the content you want
 *           to work with.
 *   
 * {date}    Find all content newer than this date.  The date format is open:
 *           Tested with yyyy/MM/dd hh:mm:ss but multiple formats can be passed
 *           check out http://www.w3schools.com/jS/js_obj_date.asp for examples
 *           
 * Removing /in/ in the URL as seen below
 *   
 * /alfresco/service/updated/{path}/since?date={date}
 *   
 * will perform for a recursive search of all content in all spaces under the 
 * space passed in the {path} parameter
 */
var filterDateString = args.date;
var filterDate;
var filterDateISO;

var path = url.templateArgs['path'];
var match = url.match;

var node = "";
var unfilteredResults;
var results;

var systemFolder = "-TYPE:\"cm:systemfolder\" " +
		"-TYPE:\"{http://www.alfresco.org/model/rule/1.0}rule\" " +
		"-TYPE:\"{http://www.alfresco.org/model/action/1.0}compositeaction\" " +
		"-TYPE:\"{http://www.alfresco.org/model/action/1.0}actioncondition\" " +
		"-TYPE:\"{http://www.alfresco.org/model/action/1.0}action\" " +
		"-TYPE:\"{http://www.alfresco.org/model/action/1.0}actionparameter\"";

// Functions


function toISO8601String(date) { // based on http://delete.me.uk/2005/03/iso8601.html
	/*
	 * accepted values for the format [1-6]: 1 Year: YYYY (eg 1997) 2 Year and
	 * month: YYYY-MM (eg 1997-07) 3 Complete date: YYYY-MM-DD (eg 1997-07-16) 4
	 * Complete date plus hours and minutes: YYYY-MM-DDThh:mmTZD (eg
	 * 1997-07-16T19:20+01:00) 5 Complete date plus hours, minutes and seconds:
	 * YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00) 6 Complete date
	 * plus hours, minutes, seconds and a decimal fraction of a second
	 * YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)
	 */
	if (!format) {
		var format = 6;
	}
	if (!offset) {
		var offset = 'Z';
		var date = date;
	} else {
		var d = offset.match(/([-+])([0-9]{2}):([0-9]{2})/);
		var offsetnum = (Number(d[2]) * 60) + Number(d[3]);
		offsetnum *= ((d[1] == '-') ? -1 : 1);
		var date = new Date(Number(Number(date) + (offsetnum * 60000)));
	}

	var zeropad = function(num) {
		return ((num < 10) ? '0' : '') + num;
	}

	var str = "";
	str += date.getUTCFullYear();
	if (format > 1) {
		str += "-" + zeropad(date.getUTCMonth() + 1);
	}
	if (format > 2) {
		str += "-" + zeropad(date.getUTCDate());
	}
	if (format > 3) {
		str += "T" + zeropad(date.getUTCHours()) + ":"
				+ zeropad(date.getUTCMinutes());
	}
	if (format > 5) {
		var secs = Number(date.getUTCSeconds() + "."
				+ ((date.getUTCMilliseconds() < 100) ? '0' : '')
				+ zeropad(date.getUTCMilliseconds()));
		str += ":" + zeropad(secs);
	} else if (format > 4) {
		str += ":" + zeropad(date.getUTCSeconds());
	}

	if (format > 3) {
		str += offset;
	}
	return str;
}

//Alfresco only indexes dates and not time. This does the post processing on the range 
function filterResults(unfilteredResults) {
	var now = new Date();
	var filteredResults = new Array();
	
	for each (node in unfilteredResults) {
		
		var testDate = new Date(node.properties.modified);
		
		//if the nodes modified date is between the passed date/time and now add
		//to filteredResult Array
		if ((filterDate <= testDate) && (testDate <= now)){	
			filteredResults.push(node);
		}
	}
	
	return filteredResults;
}

function getNodeFromPath(path) {

	node = "";

	if (path.match("Company Home/")) {
		sans = path.substring(13);
		var node = companyhome.childByNamePath(sans);
	} else if (path.match("Company Home")) {
		var node = companyhome;
	} else {
		var node = companyhome.childByNamePath(path);
	}

	return node
}

// Validate the parameters are there

// was the date passed?
if (filterDateString == undefined || filterDateString.length == 0) {
	status.code = 400;
	status.message = "Date has not been provided.";
	status.redirect = true;
}

// was the path passed?
if (path == undefined || path.length == 0) {
	status.code = 400;
	status.message = "Path has not been provided.";
	status.redirect = true;
}

// Main

// get a real node to work with
node = getNodeFromPath(path);

// convert the date string into a date object
filterDate = new Date(filterDateString);

// convert the date into an ISO8601 formated String (lucene requires the format)
filterDateISOString = toISO8601String(filterDate);

if (match == "/updated/in/") {
	// query the space and get all content modified from passed date to now
	unfilteredResults = search
			.luceneSearch("+PARENT:\""
					+ node.nodeRef
					+ "\" AND @cm\\:modified:["
					+ filterDateISOString
					+ " TO NOW] -TYPE:\"cm:folder\" -TYPE:\"st:site\""+systemFolder);
} else {
	// query the space and get all content modified from passed date to now
	unfilteredResults = search
			.luceneSearch("+PATH:\""
					+ node.qnamePath
					+ "//*\" AND @cm\\:modified:["
					+ filterDateISOString
					+ " TO NOW] -TYPE:\"cm:folder\" -TYPE:\"st:site\""+systemFolder);
}

//filter the query results to get nodes within our time range
results =  filterResults(unfilteredResults);

// return modified content
model.results = results;