//------------------ Get Values ------------------//

//getValues() => Array
function getValues(){
    let vals = [];
    vals.push(getStrInput('cname'));
    vals.push(checkNumEmpty('cost'));
    vals.push(checkNumEmpty('damage'));
    vals.push(checkNumEmpty('healing'));
    vals.push(checkNumEmpty('armor'));
    vals.push(checkNumEmpty('energy_gain'));
    vals.push(getStrInput("type"));
    vals.push(getStrInput("path"));
    vals.push(getCheckbox("isFancy"));
    return vals;
}

//makeDataCSVLine(data: Array) => String
function makeDataCSVLine(data){
    return data.join(",");
}

function getStrInput(name){
    let val = document.getElementById(name).value;
    if(name === "type"){
        document.getElementById(name).value = "Action";
    } else {
        document.getElementById(name).value = "";
    }
    return val;
}

//checkNumEmpty(name: String) => number
function checkNumEmpty(name){
    let val = document.getElementById(name).value;
    document.getElementById(name).value = 0;
    if(val.length == 0){
        return 0;
    } else {
        return val;
    }
}

//getCheckbox(name: String) => Boolean
function getCheckbox(name){
    if(document.getElementById(name).checked){
        document.getElementById(name).checked = false;
        return 1;
    } else {
        return 0;
    }
}

//------------------ Make CSV ------------------//

//makeCSV() => String
function makeCSV(){
    let data = table_to_array('dataTable');
    let file = '';
    for(let i = 0; i < data.length; ++i){
        if(!(i == data.length -1)){
            file += makeDataCSVLine(data[i]) + '\n';
        }
    }
    if(data.length > 0){
        file += makeDataCSVLine(data[data.length - 1])
    }
    return file;
}

//splitFile(text: String) => Array
function splitFile(text){
    let arrays = [];
    let type = getTypeArray();
    let doc = text.split('\n');
    for(let i = 0; i < doc.length; ++i){
        arrays.push(doc[i].split(','));
        //for(let j = 0; j < arrays[i].length; ++j){
            //if(type[j] === "String"){
            //    arrays[i][j] = arrays[i][j].substring(1, arrays[i][j].length - 1);
            //}
        //}
    }
    return arrays;
}

//------------------ Table Functions ------------------//

//addTable(vals: array)
function addTable(text) {
    data = splitFile(text);
    document.getElementById("fileName").value = document.getElementById("file-input").value.split("\\")[2].split(".")[0];
    parent = document.getElementById("data");
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    var myTableDiv = document.getElementById("data");
  
    var table = document.createElement('TABLE');
    table.id = 'dataTable';
  
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);
    tableBody.id = 'dataBody';
  
    for (var i = 0; i < data.length; i++) {
        var newI = data.length - i - 1;
        var tr = document.createElement('TR');
        tr.id = `GeneratedRow${newI}`;
        tableBody.prepend(tr);
  
        //Create Table Elements
        for (var j = 0; j < data[i].length; j++) {
            var td = document.createElement('TD');
            
            //Highlight the name
            if(j === 0){
                td.setAttribute("class", "name");
            }

            td.appendChild(document.createTextNode(data[i][j]));
            tr.appendChild(td);
        }
        
        addRemove(tr);
        addEdit(tr);
    }
    myTableDiv.appendChild(table);
}



function table_to_array(table_id) {
    let types = getTypeArray();
    let myData = document.getElementById(table_id).rows;
    let my_liste = [];

    for (var i = 0; i < myData.length; i++) {

        el = myData[i].children;
        my_el = [];

        for (var j = 0; j < types.length; j++) {
            //if(types[j] === "String"){
            //    my_el.push('"' + el[j].innerText + '"');
            //} else {
                my_el.push(el[j].innerText);
            //}
        }

        //my_liste.push(my_el);
        my_liste = prependArray(my_el, my_liste);
    }
    return my_liste;
}

//editCard(tr: Table Row Element, data: Array)
function editCard(tr, data){
    let c = tr.children;
    for(let i = 0; i < data.length; ++i){
        c[i].innerHTML = data[i];
    }
}


function addCard(){

    let cname = document.getElementById("cname").value;

    //Don't add an unnamed card
    if(cname === ""){
        window.alert("Please name the card")
        return;
    } else if(checkNameExists(cname)){
        window.alert('"' + cname + '" already exists');
        return;
    }

    //Get Values
    data = getValues();

    let slot = getOpenSlot();

    //If there is an empty card, replace it. Otherwise, add a new card to the table
    if(slot === "Full"){
        let i = document.getElementById('dataTable').rows;
        tableBody = document.getElementById('dataBody');
        var tr = document.createElement('TR');
        tableBody.prepend(tr);
        for (var j = 0; j < data.length; j++) {
            var td = document.createElement('TD');
        
            //Highlight the name
            if(j === 0){
                td.setAttribute("class", "newName");
            } else {
                td.setAttribute("class", "new");
            }
        
            td.appendChild(document.createTextNode(data[j]));
            tr.appendChild(td);
        }
        addRemove(tr);
        addEdit(tr);
    } else {
        editCard(slot, data);
    }
}




function setOnClick(button, type){
    if(type === 0){
        button.onclick = function (e) {
            let btn = e.target;
            let remove = btn.parentNode.parentNode;
            let removeParent = remove.parentNode;
            let cardName = remove.firstChild.innerHTML;
            if(confirm(`Remove Card: ${cardName}?`)){
                let c = remove.children;
                c[0].innerHTML = "Empty";
                for(let i = 1; i < c.length - 2; ++i){
                    c[i].innerHTML = 0;
                }
            }
        }
    } else if(type === 1){
        button.onclick = function (e) {
            let btn = e.target;
            data = [];
            let remove = btn.parentNode.parentNode;
            let removeParent = remove.parentNode;
            let cardName = remove.firstChild.innerHTML;
            if(confirm(`Edit Card: ${cardName}?`)){
                let c = remove.children;
                for(let i = 0; i < c.length - 2; ++i){
                    data.push(c[i].innerHTML);
                }
                c[0].innerHTML = "Edit";
            }
            setInputs(data);
        }
    }
}




//addRemove(tr: HTML Table Row)
function addRemove(tr){
    //Give each row a "Remove Row" option
    let btn = document.createElement("button");
    var td = document.createElement('TD');
    td.setAttribute("class", "new bad");
    btn.innerHTML = "Remove Card";
    td.appendChild(btn);
    tr.appendChild(td);
    setOnClick(btn, 0);
}

//addEdit(tr: Table Row)
function addEdit(tr){
    //Give each row a "Remove Row" option
    let btn = document.createElement("button");
    var td = document.createElement('TD');
    td.setAttribute("class", "new good");
    btn.innerHTML = "Edit Card";
    td.appendChild(btn);
    tr.appendChild(td);
    setOnClick(btn, 1);
}




//prependArray(value: Object, oldArray: Array) => Array
function prependArray(value, oldArray) {
    var newArray = new Array(value);
  
    for(var i = 0; i < oldArray.length; ++i) {
      newArray.push(oldArray[i]);
    }
  
    return newArray;
}




//getOpenSlot() => TableRow:String
function getOpenSlot(){
    let tableChildren = document.getElementById("dataBody").children;
    if(checkNameExists("Edit")){
        for(let i = tableChildren.length - 1; i >= 0; --i){
            if(tableChildren[i].firstChild.innerHTML === "Edit"){
                return tableChildren[i];
            }
        }
    } else {
        for(let i = tableChildren.length - 1; i >= 0; --i){
            if(tableChildren[i].firstChild.innerHTML === "Empty"){
                return tableChildren[i];
            }
        }
    }
    return "Full";
}



//checkNameExists(name: String) => Boolean
function checkNameExists(name){
    let tableChildren = document.getElementById("dataBody").children;
    for(let i = tableChildren.length - 1; i >= 0; --i){
        if(tableChildren[i].firstChild.innerHTML === name){
            return true;
        }
    }
    return false;
}



function setInputs(data){
    document.getElementById("cname").value = data[0];
    document.getElementById("cost").value = data[1];
    document.getElementById("damage").value = data[2];
    document.getElementById("healing").value = data[3];
    document.getElementById("armor").value = data[4];
    document.getElementById("energy_gain").value = data[5];
    document.getElementById("type").value = data[6];
    document.getElementById("path").value = data[7];
    document.getElementById("isFancy").value = data[8];
}

function getTypeArray(){
    return ["String", "number", "number", "number", "number", "number", "String", "String", "number"];
}