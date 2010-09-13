{
    "modified": [
    <#list results as row>
        {
            "node": {
                "name": "${row.name}",
                "path": "${row.displayPath}",
                "modified": "${row.properties.modified?datetime}" 
            }
        }<#if row_has_next>, </#if>
    </#list> 
    ] 
}