var queryButton = document.getElementById("queryButton");
var examplesSelectbox = document.getElementById("examplesSelectbox");
queryButton.addEventListener('click', runQuery, false)
examplesSelectbox.addEventListener('change', updateExample, false)
  
var xmlEditor = ace.edit("xmlEditor");
xmlEditor.getSession().setMode("ace/mode/xml");

var javascriptEditor = ace.edit("javascriptEditor");
javascriptEditor.getSession().setMode("ace/mode/javascript");

function runQuery() {
    try {
        var xml = xmlToJSON.parseString(xmlEditor.getValue());
        var result = eval(javascriptEditor.getValue());
       $('#tree').treeview( {
            data: objectToTreeview(result),
            showBorder: false,
            expandIcon: 'glyphicon glyphicon-chevron-right',
            collapseIcon: 'glyphicon glyphicon-chevron-down'
        } );
    }
    catch(err) {
        alert(err.message);
    }
}

function updateExample() {
   var exampleKey = examplesSelectbox.options[examplesSelectbox.selectedIndex].value;
   var example = xmlExamples[exampleKey]
   
   if(example){
      xmlEditor.setValue(formatXml(example.xml),-1);
      javascriptEditor.setValue(example.query,-1);
      runQuery();
   }
}

function objectToTreeview(obj){
    if(!isObject(obj) && !isArray(obj)){
        return [{text: obj, selectable: false}];
    }
    var arr = [];
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) { 
        var val = obj[prop];

        if(isObject(val)){
            arr.push({text: prop, selectable: false, nodes: objectToTreeview(val)});
        }
        else {
            if(isArray(obj)){
                val.forEach(function(item,index){arr.push({text:prop+ ' ' + (index+1), selectable: false, nodes: objectToTreeview(item)});});
            }
                else {                    
                    arr.push({text: prop +': ' + val, selectable: false });        
                }     
        }

      }
    }

    return arr;

}

function isObject(obj){
    return Object.prototype.toString.call(obj) === '[object Object]';
}

function isArray(obj){
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function formatXml(xml){
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    xml.split('\r\n').forEach(function(node) {
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;

}