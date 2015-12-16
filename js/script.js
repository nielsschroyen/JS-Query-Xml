var queryButton = document.getElementById("queryButton");
var resultDiv = document.getElementById("resultDiv");
var commandTextBox = document.getElementById("commandTextBox");
var xmlTextBox = document.getElementById("xmlTextBox");
var examplesSelectbox = document.getElementById("examplesSelectbox");
queryButton.addEventListener('click', runQuery, false)
examplesSelectbox.addEventListener('change', updateExample, false)

function runQuery() {
    try {
        var xml = xmlToJSON.parseString(xmlTextBox.value);
    	resultDiv.innerHTML = html(eval(commandTextBox.value)); 
    }
    catch(err) {
        resultDiv.innerHTML = err.message
    }
}

function updateExample() {
   var exampleKey = examplesSelectbox.options[examplesSelectbox.selectedIndex].value;
   var example = xmlExamples[exampleKey]
   
   if(example){
    xmlTextBox.value = example.xml;
    commandTextBox.value = example.query;
    runQuery();
   }
}