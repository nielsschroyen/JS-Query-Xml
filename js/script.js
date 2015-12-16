

var queryButton = document.getElementById("queryButton");
var resultDiv = document.getElementById("resultDiv");
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
    	resultDiv.innerHTML = html(eval(javascriptEditor.getValue())); 
    }
    catch(err) {
        resultDiv.innerHTML = err.message
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