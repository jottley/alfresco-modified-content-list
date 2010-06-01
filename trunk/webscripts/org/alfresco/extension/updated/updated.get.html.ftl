<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Modified Content List</title>
	</head>

	<body>
		<p>These are the documents that have been modified:</p>
		<ul>
			<#list results as row>
			<li>Name: ${row.name}, Path: ${row.displayPath}, modified: ${row.properties.modified?string}</li>
			</#list>
		</ul>
	</body>
</html>