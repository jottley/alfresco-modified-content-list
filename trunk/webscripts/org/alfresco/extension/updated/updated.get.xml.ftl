<?xml version="1.0" encoding="UTF-8"?>
<#if results?size &gt; 0>
<contentItems>
	<#list results as row>
		<contentItem name='${row.name}' path='${row.displayPath}' modDate='${xmldate(row.properties.modified)}'/>
	</#list>
</contentItems>
<#else>
<contentitem/>
</#if>