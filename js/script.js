document.getElementById("queryButton").addEventListener('click', runQuery, false);
document.getElementById("exampleAverage").addEventListener('click', function(){ updateExample('average')}, false);
document.getElementById("exampleBooks").addEventListener('click', function(){updateExample('books')}, false);
document.getElementById("exampleCatalog").addEventListener('click', function(){updateExample('catalog')}, false);
document.getElementById("exampleBigCatalog").addEventListener('click', function(){updateExampleBigCatalog()}, false);  

var  exampleDropdownText = document.getElementById("exampleDropdownText");
var xmlEditor = ace.edit("xmlEditor");
xmlEditor.getSession().setMode("ace/mode/xml");

var javascriptEditor = ace.edit("javascriptEditor");
javascriptEditor.getSession().setMode("ace/mode/javascript");

function runQuery() {
    try {
        var xml = xmlToJSON.parseString(xmlEditor.getValue());
        window.xmlObject = xml;
        var result = eval(javascriptEditor.getValue());
       $('#tree').treeview( {
            data: objectToTreeview(result),
            showBorder: false,
            expandIcon: 'glyphicon glyphicon-chevron-right',
            collapseIcon: 'glyphicon glyphicon-chevron-down',
            levels: 1,
        } );
    }
    catch(err) {
        alert(err.message);
    }
}

function getBigCatalog(callback){
	var myXML = ""
	var request = new XMLHttpRequest();
	request.open("GET", "js/bigcatalog.xml", true);
	request.onreadystatechange = function(){
		if (request.readyState == 4) {
			if (request.status == 200 || request.status == 0) {
				callback(request.responseText);
			}
		}
	}
request.send();
	
}

function updateSpan(span, content){
    while( span.firstChild ) {
    span.removeChild( span.firstChild );
}
span.appendChild( document.createTextNode(content) );
}

function updateExampleBigCatalog() {   
   function afterGetXml(xml){
      updateSpan(exampleDropdownText, 'Big dataset (downloads 10MB)');
      xmlEditor.setValue(formatXml(xml),-1);
      javascriptEditor.setValue('xml',-1);
      runQuery();
   }
   
   getBigCatalog(afterGetXml);
}

function updateExample(exampleKey) {
   var example = xmlExamples[exampleKey]
   
   if(example){
      updateSpan(exampleDropdownText, example.description);
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
            if(isArray(val)){
                val.forEach(function(item,index){arr.push({text:prop+ '[' + (index) + ']', selectable: false, nodes: objectToTreeview(item)});});
            }
                else {                    
                    arr.push({text: '<b>'+prop +':</b> ' + val, selectable: false });        
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