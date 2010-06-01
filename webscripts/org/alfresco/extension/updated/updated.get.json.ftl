{
    "modified": [
    <#list results as row>
        {
            "node": {
                "name": "${row.name}",
                "path": "${row.displayPath}",
                "modified": "${row.properties.modified?string}" 
            }
        }<#if permission_has_next>, </#if>
    </#list> 
    ] 
}