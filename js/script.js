var queryButton = document.getElementById("queryButton");
var resultDiv = document.getElementById("resultDiv");
var commandTextBox = document.getElementById("commandTextBox");
var xmlTextBox = document.getElementById("xmlTextBox");
queryButton.addEventListener('click', runQuery, false)

function runQuery() {
    try {
        var xml = xmlToJSON.parseString(xmlTextBox.value);
    	resultDiv.innerHTML = html(eval(commandTextBox.value)); 
    }
    catch(err) {
        resultDiv.innerHTML = err.message
    }
}