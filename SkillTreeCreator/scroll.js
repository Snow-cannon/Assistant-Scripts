//Set up the stage
var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
    container: 'graph',
    width: width,
    height: height,
    draggable: true,
    x: width/2,
    y: height/2
});

//Add Layers to the stage
var graphL = new Konva.Layer();
var linesL = new Konva.Layer();
var nodesL = new Konva.Layer();
stage.add(graphL);
stage.add(linesL);
stage.add(nodesL);

var WIDTH = 30000;
var HEIGHT = 30000;
var NUMBER = 200;
var scaleBy = 0.9;

//If the stage is clicked, set all selections to null
stage.on('click', (e) => {
    if(e.target !== stage){
        return;
    }
    if(clickedNode !== null){
        setClickedState(clickedNode, false);
        clickedNode = null;
    }
    clickedHex = null;
    trans.nodes([]);
})

//Zoom
stage.on('wheel', (e) => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();
    var mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
    };

    var newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
});


//-------------------- Graph Render -------------------//

var widthLine = new Konva.Line({
    points: [-WIDTH, 0, WIDTH, 0],
    stroke: 'red',
    strokeWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',
});
var heightLine = new Konva.Line({
    points: [0, -HEIGHT, 0, HEIGHT],
    stroke: 'red',
    strokeWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',
});
graphL.add(widthLine);
graphL.add(heightLine);

//------------------- Key events --------------------//

var shiftPressed = false;
var numPress = [false, false, false, false];

window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
  
    switch (event.key) {
        case "Shift":
            shiftPressed = true;
            break;
        case "1": //Set size
            numPress[0] = true;
            numPress[1] = false;
            numPress[2] = false;
            numPress[3] = false;
            break;
        case "2": //Set size
            numPress[0] = false;
            numPress[1] = true;
            numPress[2] = false;
            numPress[3] = false;
            break;
        case "3": //Set size
            numPress[0] = false;
            numPress[1] = false;
            numPress[2] = true;
            numPress[3] = false;
            break;
        case "4": //Set size
            numPress[0] = false;
            numPress[1] = false;
            numPress[2] = false;
            numPress[3] = true;
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }
  
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  }, true);

window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    //Create variables in case they are used
    let pos = stage.getRelativePointerPosition();
    let x = pos.x;
    let y = pos.y;
    if(!shiftPressed){
        x = Math.round(x / snapSize) * snapSize,
        y = Math.round(y / snapSize) * snapSize
    }
    let size = 1;
    let index = -1;

    switch (event.key) {
        case "Shift": //For other purposes in the script
            shiftPressed = false;
            break;
        case "1": //Saved for later
            if(clickedNode !== null){
                setNodeSize(clickedNode, 1);
            }
            break;
        case "2": //Saved for later
            if(clickedNode !== null){
                setNodeSize(clickedNode, 2);
            }
            break;
        case "3": //Saved for later
            if(clickedNode !== null){
                setNodeSize(clickedNode, 3);
            }
            break;
        case "4": //Saved for later
            if(clickedNode !== null){
                setNodeSize(clickedNode, 4);
            }
            break;
        case "a": //Creates a node
        case "Space":
            if(numPress[1]){ size = 2; }
            else if(numPress[2]){ size = 3; }
            else if(numPress[3]){ size = 4; }
            makeNode(x, y, size);
            break;
        case "d": //Deletes a node
        case "Delete":
            if(clickedNode !== null){
                removeNode(clickedNode);
                clickedNode = null;
            }
            if(clickedHex !== null){
                removeHex(clickedHex);
                clickedHex = null;
                trans.nodes([]);
            }
            break;
        case "h": //Creates a hexagon
            if(numPress[1]){ size = 2; }
            else if(numPress[2]){ size = 3; }
            else if(numPress[3]){ size = 4; }
            makeNodegon(x, y, size);
            break;
        case "e":
            if(clickedHex !== null){
                extendHex(clickedHex, size);
            }
        default:
            return; // Quit when this doesn't handle the key event.
    }
    
      // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);

//setClickedObj(type: String, node: Node) => None
function setClickedObj(type, node){
    if(type === "hex"){
        if(clickedNode !== null){
            setClickedState(clickedNode, false);
            clickedNode = null;
        }
        clickedHex = node;
        trans.nodes([node]);
    } else if(type === "node"){
        clickedHex = null;
        trans.nodes([]);
    }
}

//------------------- Positions --------------------//

//drawPolygon(x: number, y: number, sides: number, dir: number) => Array[number]
function drawPolygon(x, y, r, sides, dir){
    let steps = 360 / sides;
    let angle = dir;
    let pos = [];
    pos.push([x + (Math.cos(angle) * (r + (Math.sin(angle)))), y + (Math.sin(angle) * (r + (Math.sin(angle))))]);
    for(let i = 0; i < sides - 1; ++i){
        angle += sides;
        pos.push([x + (Math.cos(angle) * (r + (Math.sin(angle)))), y + (Math.sin(angle) * (r + (Math.sin(angle))))]);
    }
    return pos;
}

//------------------- Transformer --------------------//

//The transformer tool for rotating hexagons
var trans = new Konva.Transformer({
    rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
    resizeEnabled: false,
});
nodesL.add(trans);

//------------------- Create Paint Objects --------------------//

var nodes = []; //A list of nodes and accompanying data
var ConLines = []; //A list of lines and connected nodes
var groups = []; //A list of hexagons and their center points
var clickedNode = null; //A single node that is currently selected
var clickedHex = null; //A single hex center for controlling the hex rotation
var snapSize = 20; //The size of the grid
const attributes = ['nsize', 'name', 'script', 'tool']; //The list of extra attributes each node contains

makeNodegon(0, 0, 3);

//The shadow object you see on the screen
var shadow = new Konva.Rect({
    x: 0,
    y: 0,
    visible: false,
    width: snapSize * 2,
    height: snapSize * 2,
    fill: '#FF7B17',
    //opacity: 0.6,
    stroke: '#CF6412',
    strokeWidth: 3,
    dash: [20, 2],
    offsetX: snapSize,
    offsetY: snapSize
});
linesL.add(shadow);

//Makes a node, and sets its functions for clicking and dragging
//makeNode(x: number, y: number, size: number) => None
function makeNode(x, y, size){
    var node = new Konva.Circle({
        x: x,
        y: y,
        fill: 'green',
        radius: size * 20,
        draggable: true,
        shadowBlur: 10
    });
    var posTxt = new Konva.Text
    attributes.map(a => node.setAttr(a, ''));
    node.setAttr('nsize', size);
    //add the node to the layer, and push it to the node array
    nodes.push(node);
    nodesL.add(node);
    node.on("dragmove", (e) => {
        if(!shiftPressed){
            let t = node.position();
            shadow.show();
            setShadow(t.x, t.y, node.width() / (snapSize * 2));
        } else {
            shadow.hide();
        }
        updateLines();
    });
    node.on('dragend', (e) => {
        if(!shiftPressed){ setPos(node); }
        shadow.hide();
        updateLines();
    })
    node.on("click", setClicked);
    return node;
}

//setNode(node: Node, x: number, y: number, attr: Array) => None
function setNode(node, x, y, attr){
    node.x(x);
    node.y(y);
    for(let i = 0; i < attributes.length; i++){
        if(attr.length - 1 < i){
            node.setAttr(attributes[i], '');
        } else {
            node.setAttr(attributes[i], attr[i]);
        }
    }
    setNodeSize(node, node.getAttr('nsize'));
}

//setNodeSize(node: Node, size: number) => None
function setNodeSize(node, size){
    node.setAttr('nsize', size);
    node.radius(size * snapSize);
}

//Creates a line that connects to 2 nodes
//makeConLine(nodeA: Node, nodeB: Node) => None
function makeConLine(nodeA, nodeB){
    var ConLine = new Konva.Line({
        stroke: 'black',
        strokeWidth: 6,
        shadowBlur: 5
    });
    ConLines.push([ConLine, nodeA, nodeB]);
    linesL.add(ConLine);
    ConLine.on("click", createMidNode);
    return ConLine;
}

//Creates a node in the middle of a line, and connects it to the line
//createMidNode(e: Event) => None
function createMidNode(e){
    let line = e.target;
    let points = line.points();
    let midX = (points[0] + points[2]) / 2;
    let midY = (points[1] + points[3]) / 2;
    let newNode = makeNode(midX, midY, 1);
    let conNodes = getLineNodes(line);
    setLineConnections(line, conNodes[0], newNode);
    makeConLine(newNode, conNodes[1]);
}

function makeEmptyGon(x, y, size, rot){

    //Creates the group to add the nodes into
    rad = size * snapSize;
    let newGroup = new Konva.Group({
        x: x,
        y: y,
        rotation: rot,
        draggable: false
    });

    //Creates a center node that is more convenient for dragging
    let centerNode = new Konva.Circle({
        x: x,
        y: y,
        radius: rad,
        rotation: rot,
        draggable: true,
        fill: "yellow",
        stroke: "black"
    });
    nodesL.add(centerNode);
    nodesL.add(newGroup);
    centerNode.setAttr('nsize', size);

    //Set Events
    centerNode.on("click", (e) => {
        setClickedObj("hex", centerNode);
    });
    centerNode.on("transform", (e) => {
        let r = centerNode.rotation();
        newGroup.setAttr('rotation', r);
        updateLines();
    });
    centerNode.on("dragmove", (e) => {
        let t = centerNode.position();
        newGroup.setAttr('x', t.x);
        newGroup.setAttr('y', t.y);
        if(!shiftPressed){
            shadow.show();
            setShadow(t.x, t.y, centerNode.width() / (snapSize * 2));
        } else {
            shadow.hide();
        }
        updateLines();
    })
    centerNode.on('dragend', (e) => {
        if(!shiftPressed){ setPos(centerNode); }
        shadow.hide();
        let t = centerNode.position();
        newGroup.setAttr('x', t.x);
        newGroup.setAttr('y', t.y);
        updateLines();
        stage.batchDraw();
    });
    groups.push([centerNode, newGroup, []]);
    return groups.length - 1; //Group index
}

//makes a polygon with a node at each of it's corners
//makeNodeGon(x: number, y: number, size: number) => None
function makeNodegon(x, y, size){
    let rad = size * 20;
    let pos = []; //Creates an empty list to hold node positions
    let newNode = null;
    pos = drawPolygon(0, 0, rad * 5, 5, 1); //fills the position list with the points on the polygon
    let tmpConNodes = []; //Temporary list to hold node objects

    //Creates the group to add the nodes into
    let newGroup = new Konva.Group({
        x: x,
        y: y,
        draggable: false
    });

    //Creates a center node that is more convenient for dragging
    let centerNode = new Konva.Circle({
        x: x,
        y: y,
        radius: rad,
        draggable: true,
        fill: "yellow",
        stroke: "black"
    });
    nodesL.add(centerNode);
    nodesL.add(newGroup);
    centerNode.setAttr('nsize', size);

    //Set events
    centerNode.on("click", (e) => {
        setClickedObj("hex", centerNode);
    });
    centerNode.on("transform", (e) => {
        let r = centerNode.rotation();
        newGroup.setAttr('rotation', r);
        updateLines();
    });
    centerNode.on("dragmove", (e) => {
        let t = centerNode.position();
        newGroup.setAttr('x', t.x);
        newGroup.setAttr('y', t.y);
        if(!shiftPressed){
            shadow.show();
            setShadow(t.x, t.y, centerNode.width() / (snapSize * 2));
        } else {
            shadow.hide();
        }
        updateLines();
    })
    centerNode.on('dragend', (e) => {
        if(!shiftPressed){ setPos(centerNode); }
        shadow.hide();
        let t = centerNode.position();
        newGroup.setAttr('x', t.x);
        newGroup.setAttr('y', t.y);
        updateLines();
        stage.batchDraw();
    });
    groups.push([centerNode, newGroup, []]);

    //Creates a node for each position
    for(let i=0; i<pos.length; ++i){
        newNode = makeNode(pos[i][0], pos[i][1], size)
        tmpConNodes.push(newNode);
        nodeStopDrag(newNode);
        newGroup.add(newNode);
        groups[groups.length-1][2].push(newNode);
    }

    //Creates and connects lines to each node in the list
    for(let i=0; i<tmpConNodes.length -1; i++){
        makeConLine(tmpConNodes[i], tmpConNodes[i+1]);
    }
    if(tmpConNodes.length > 1){
        makeConLine(tmpConNodes[tmpConNodes.length-1], tmpConNodes[0]);
    }

    updateLines();
}

//extendHex(centerNode: Node) => None
function extendHex(centerNode){
    let index = getCenterHexIndex(centerNode);
    let oldNodes = groups[index][2];
    let newNodes = [];
    let node = null;
    oldNodes.map(x => {
        node = makeNode(x.x() * 3, x.y() * 3, x.getAttr('nsize'));
        newNodes.push(node);
        groups[index][1].add(node);
        groups[index][2].push(node);1
        makeConLine(x, node);
    });
    updateLines();
}

//------------------- Interact with Paint Objects --------------------//

//sets the draggable state of a node to false
//nodeStopDrag(node: Node) => None
function nodeStopDrag(node){
    node.draggable(false);
}

//Sets a node to clicked, or if a node is already selected, creates a line from node A to node B if it does not already exist
//setClicked(e: Event) => None
function setClicked(e){
    let node = e.target;
    setClickedObj("node", node);
    if(clickedNode === null){
        if(!checkExistingLine(node, clickedNode)){
            setClickedState(node, true);
            clickedNode = node;
            updateLines();
        }
    } else if(clickedNode !== node){
        if(!checkExistingLine(node, clickedNode)){
            makeConLine(node, clickedNode);
            setClickedState(clickedNode, false);
            if(!shiftPressed){
                clickedNode = node;
                setClickedState(node, true);
            } else {
                clickedNode = null;
            }
            updateLines();
        } else {
            removeLine(node, clickedNode);
            setClickedState(clickedNode, false);
            if(!shiftPressed){
                clickedNode = node;
                setClickedState(node, true);
            } else {
                clickedNode = null;
            }
            updateLines();
        }
    } else {
        node.fill("green");
        clickedNode = null;
    }
}

//Sets a node to clicked or not clicked
//setClickedState(node: Node, state: Boolean) => None
function setClickedState(node, state){
    if(state){
        node.fill("red");
    } else {
        node.fill("green");
    }
}

//setLineConnections(line: Line, nodeA: Node, nodeB: Node) => None
function setLineConnections(line, nodeA, nodeB){
    let index = getLineIndex(line);
    ConLines[index][1] = nodeA;
    ConLines[index][2] = nodeB;
}

//setShadow(x: number, y: number, size: number) => None
function setShadow(x, y, size){
    shadow.position({
        x: Math.round(x / snapSize) * snapSize,
        y: Math.round(y / snapSize) * snapSize
    });
    shadow.scale({ x: size, y: size });
}

//setPos(node: Node) => None
function setPos(node){
    node.position({
        x: Math.round(node.x() / snapSize) * snapSize,
        y: Math.round(node.y() / snapSize) * snapSize
    });
}

//------------------- Remove Paint Objects --------------------//

//Removes a line based on index
//removeLineIndex(index: number) => None
function removeLineIndex(index){
    if(index > -1){
        let line = ConLines[index][0];
        line.destroy();
        ConLines.splice(index, 1);
    }
}

//Removes a line based on it's connected nodes
//removeLine(nodeA: Node, nodeB: Node) => None
function removeLine(nodeA, nodeB){
    let index = getLineIndexFromNodes(nodeA, nodeB);
    removeLineIndex(index);
}

//Deletes a node and all lines connected to it
//removeNode(node: Node) => None
function removeNode(node){

    //Remove node from the node array
    let index = nodes.indexOf(node);
    if(index > -1){
        nodes.splice(index, 1);
    }

    //Remove all connected lines
    for(let i=0; i<ConLines.length; ++i){
        line = ConLines[i];
        if((line[1] === node || line[2] === node)){
            //remove.push(i);;
            removeLineIndex(i);
            --i;
        }
    }
    node.destroy();
}

//removeHex(centerNode: Node) => None
function removeHex(centerNode){
    let index = getCenterHexIndex(centerNode);
    let group = groups[index][1];

    //Remove the nodes, which will remove the lines as well
    for(let i = 0; i < groups[index][2].length; ++i){
        removeNode(groups[index][2][i]);
    }
    groups.splice(index, 1);
    group.destroy();
    centerNode.destroy();
}

//deleteAll() => None
function deleteAll(){
    nodes.map(x => {
        //Remove all connected lines
        for(let i=0; i<ConLines.length; ++i){
            line = ConLines[i];
            if((line[1] === x || line[2] === x)){
                //remove.push(i);;
                removeLineIndex(i);
                --i;
            }
        }
    
        x.destroy();
    });

    groups.map(x => {
        x[0].destroy();
        x[1].destroy();
    });

    nodes = []; //A list of nodes and accompanying data
    ConLines = []; //A list of lines and connected nodes
    groups = []; //A list of hexagons and their center points
    clickedNode = null; //A single node that is currently selected
    clickedHex = null; //A single hex center for controlling the hex rotation

}

//------------------- Update Paint Objects --------------------//

//Resets the position of all lines connected to nodes
//updateLines() => None
function updateLines() {
    let line = [];
    let nodeA = null;
    let nodeB = null;
    for(let i=0; i < ConLines.length; ++i){
        line = ConLines[i][0];
        nodeA = ConLines[i][1];
        nodeB = ConLines[i][2];
        posA = nodeA.getAbsolutePosition(nodesL);
        posB = nodeB.getAbsolutePosition(nodesL);
        line.points([posA.x, posA.y, posB.x, posB.y]);
    }
}

//------------------- Get Paint Object Data --------------------//

//Checks if 2 nodes are connected
//checkExistingLine(nodeA: Node, nodeB: Node) => Boolean
function checkExistingLine(nodeA, nodeB){
    return getLineIndexFromNodes(nodeA, nodeB) !== -1;
}

//Gets the index of the line connecting 2 nodes
//getLineIndexFromNodes(nodeA: Node, nodeB: Node) => number
function getLineIndexFromNodes(nodeA, nodeB){
    let line = [];
    for(let i=0; i<ConLines.length; ++i){
        line = ConLines[i];
        if((line[1] === nodeA && line[2] === nodeB) || (line[1] === nodeB && line[2] === nodeA)){ return i; }
    }
    return -1;
}

//getLineIndex(line: Line) => number
function getLineIndex(line){
    let tmpLine = null;
    for(let i=0; i<ConLines.length; ++i){
        tmpLine = ConLines[i][0];
        if(line === tmpLine){ return i; }
    }
    return -1;
}

//Gets the nodes a line is connected to
//getLineNodes(line: Line) => Array
function getLineNodes(line){
    let tmpLine = null;
    for(let i=0; i<ConLines.length; ++i){
        tmpLine = ConLines[i][0];
        if(line === tmpLine){ return [ConLines[i][1], ConLines[i][2]]; }
    }
    return [];
}

//getCenterHexIndex(centerNode: Node) => number
function getCenterHexIndex(centerNode){
    for(let i = 0; i < groups.length; ++i){
        if(groups[i][0] === centerNode){
            return i;
        }
    }
    return -1;
}

//getNodeIndex(node: Node) => number
function getNodeIndex(node){
    return nodes.indexOf(node);
}

//------------------- Get Data Values -------------------//

//getValues() => 2D_Array
function getAllNodeValues(relative){
    let vals = [];
    nodes.map(node => vals.push(getNodeValues(node, relative)));
    return vals;
}

//getNodeValues(node: Node) => Array
function getNodeValues(node, relative){
    let vals = [];
    let pos = null;
    if(relative){
        pos =node.position();
    } else {
        pos = node.getAbsolutePosition();
    }
    vals.push(pos.x);
    vals.push(pos.y);
    attributes.map(a => vals.push(node.getAttr(a)));
    return vals;
}

//getAllLines() => 2D_Array
function getAllLines(){
    let vals = [];
    ConLines.map(line => vals.push([getNodeIndex(line[1]), getNodeIndex(line[2])]));
    return vals;
}

function getAllGroups(){
    let vals = [];
    let tmp = [];
    groups.map(x => {
        tmp = [];
        tmp.push(x[0].x());
        tmp.push(x[0].y());
        tmp.push(x[0].getAttr('nsize'));
        tmp.push(x[0].rotation());
        x[2].map(y => {
            tmp.push(getNodeIndex(y));
            //console.log(getNodeIndex(y));
        });
        tmp.push('Is Group');
        vals.push(tmp);
    });
    return vals;
}

//------------------- Make CSV -------------------//

//makeDataCSVLine(data: Array) => String
function makeDataCSVLine(data){
    return data.join(",");
}

//makeCSV() => String
function makeCSV(data){
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

//------------------- Load CSV -------------------//

//splitFile(text: String) => Array
function splitFile(text){
    let arrays = [];
    let doc = text.split('\n');
    for(let i = 0; i < doc.length; ++i){
        arrays.push(doc[i].split(','));
    }
    return arrays;
}

//loadNewScene(data: 2D_Array) => None
function loadNewScene(data){
    deleteAll();
    let nodeA = null;
    let nodeB = null;
    let newGon = null;
    data.map(x => {
        if(x.length === 2){
            nodeA = nodes[x[0]];
            nodeB = nodes[x[1]];
            makeConLine(nodeA, nodeB);
        } else if(x[x.length-1] !== 'Is Group'){
            nodeA = makeNode(0, 0, 1);
            setNode(nodeA, parseFloat(x[0]), parseFloat(x[1]), x.slice(2, 2 + attributes.length));
        } else {
            newGon = makeEmptyGon(parseFloat(x[0]), parseFloat(x[1]), parseFloat(x[2]), parseFloat(x[3]));
            for(let i = 4; i < x.length - 1; ++i){
                groups[newGon][1].add(nodes[parseInt(x[i])]);
                groups[newGon][2].push(nodes[parseInt(x[i])]);
            }
        }
    });
    updateLines();
}

//------------------- Download File -------------------//

//download(strData: String, strMimeType: String) => Boolean
function download(strData, strFileName, strMimeType) {
    if(strFileName === ""){
        window.alert("Please name the file");
        return;
    }
    if(!confirm(`Download ${strFileName}?`)){
        return;
    }
    
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

    //build download link:
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);

    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    } /* end if(window.MSBlobBuilder) */

    if ('download' in a) { //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            var e = D.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            D.body.removeChild(a);
        }, 66);
        return true;
    }; /* end if('download' in a) */

    //do iframe dataURL download: (older W3)
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
}

//downloadCSVs() => downloads file
function downloadCSVs(){
    stage.x(0);
    stage.y(0);
    stage.scale({ x: 1, y: 1 });

    //Download File
    let vals = getAllNodeValues(false);
    let connections = getAllLines();
    connections.map(x => {
        vals[x[0]].push(x[1]);
        vals[x[1]].push(x[0]);
    });
    let pos = [];
    connections.map(x => {
        pos.push([
            nodes[x[0]].getAbsolutePosition().x,
            nodes[x[0]].getAbsolutePosition().y,
            nodes[x[1]].getAbsolutePosition().x,
            nodes[x[1]].getAbsolutePosition().y
        ]);
    });
    download(makeCSV(vals), 'nodes.txt', 'text/plain');
    download(makeCSV(pos), 'lines.txt', 'text/plain');

    //Upload File
    let groupVals = getAllGroups();
    console.log(groupVals);
    vals = getAllNodeValues(true);
    connections = getAllLines();
    connections.map(x => {
        vals[x[0]].push(x[1]);
        vals[x[1]].push(x[0]);
    });
    download(makeCSV(vals.concat(connections).concat(groupVals)), 'upload.txt', 'text/plain');
}

//------------------- Start Script --------------------//

updateLines();