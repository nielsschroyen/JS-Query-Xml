

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
    //  xmlEditor.selectAll();
    //  xmlEditor.clearSelection();
      xmlEditor.setValue(example.xml);

    //  javascriptEditor.selectAll();
    //  javascriptEditor.clearSelection();
      javascriptEditor.setValue(example.query);

      runQuery();
   }
}