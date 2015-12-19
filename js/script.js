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
    //try {
        var xml = xmlToJSON.parseString(xmlEditor.getValue());
        window.xmlObject = xml;
        var result = eval(javascriptEditor.getValue());

        var treeview = objectToTreeview(result);  
        var gridview = treeviewToGridView(treeview);
        createGrid(gridview);
       
    //}
    //catch(err) {
    //    alert(err.message);
    //}
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
        return [{text: obj + '', selectable: false}];
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
                    arr.push({text: prop +': ' + val, selectable: false });        
                }     
        }

      }
    }
    return arr;
}

var dataIndex = 0;

function treeviewToGridView(treeview){
  var gridData = [];
  var currentIndex = 0;
  var level = 0;

  for (var i = 0; i < treeview.length; i++) {
      currentIndex = nodeToGridview(treeview[i], gridData,currentIndex,0);
  }

  return gridData;
}

function nodeToGridview(node, gridData, currentIndex, level, parent){

  var currentNode =  {
    "index": currentIndex,
    "id": "id_" + currentIndex,
    "indent": level,
    "parent":parent,
    "title": node.text
  };
  gridData.push(currentNode);
  currentIndex++;

  if(node.nodes){
    for (var i = 0; i < node.nodes.length; i++) {
      currentIndex = nodeToGridview(node.nodes[i], gridData,currentIndex,level+1,currentNode["index"]);
    }

  }
  return currentIndex;
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

function createGrid(newData) {
  var data = newData; 
  window.data = newData; //FILTERCOMPONENT NEEDS THIS...
  var dataView;
  var grid;

  var TaskNameFormatter = function (row, cell, value, columnDef, dataContext) {
    value = value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px'></span>";
    var idx = dataView.getIdxById(dataContext.id);
    if (data[idx + 1] && data[idx + 1].indent > data[idx].indent) {
      if (dataContext._collapsed) {
        return spacer + " <span class='toggle tree-expand'></span>&nbsp;" + value;
      } else {
        return spacer + " <span class='toggle tree-collapse'></span>&nbsp;" + value;
      }
    } else {
      return spacer + " <span class='notoggle'></span>&nbsp;" + value;
    }
  };

  function collapseFilter(item) {
  if (item.parent != null) {
    var parent = data[item.parent];
    while (parent) {
      if (parent._collapsed) {
        return false;
      }
      parent = data[parent.parent];
    }
  }
  return true;
  }
  var columns = [ {id: "title", name: "Title", field: "title", cssClass: "cell-title", formatter: TaskNameFormatter}];
  var options = {
    enableColumnReorder: false,
    enableCellNavigation: true,
    forceFitColumns:true,
    headerRowHeight:0,
    headerHeight: 0
  };

    // initialize the model
  dataView = new Slick.Data.DataView({ inlineFilters: true });
  dataView.beginUpdate();
  dataView.setItems(data);
  dataView.setFilter(collapseFilter);
  dataView.endUpdate();
  
  // initialize the grid
  grid = new Slick.Grid("#myGrid", dataView, columns, options);
  grid.onCellChange.subscribe(function (e, args) {
    dataView.updateItem(args.item.id, args.item);
  });  

  //Add toggle click
  grid.onClick.subscribe(function (e, args) {
    if ($(e.target).hasClass("toggle") || $(e.target.children[1]).hasClass("toggle")) {
      var item = dataView.getItem(args.row);
      if (item) {
        if (!item._collapsed) {
          item._collapsed = true;
        } else {
          item._collapsed = false;
        }
        dataView.updateItem(item.id, item);
      }
      e.stopImmediatePropagation();
    }
  });

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });
  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });
}