var iframe = document.createElement('iframe');
iframe.src = 'testScroll.html';
iframe.id = "canvas";
document.body.appendChild(iframe);
var win = null;
iframe.onload = function() {
    win = iframe.contentWindow;
    win.onclick = function () { getData(); }
};

function getData(){
    if(win.clickedNode !== null){
        let name = win.clickedNode.getAttr('name');
        document.getElementById('name').value = name;
        let script = win.clickedNode.getAttr('script');
        document.getElementById('script').value = script;
        let tool = win.clickedNode.getAttr('tool');
        document.getElementById('tool').value = tool;
    }
}

function setData(){
    if(win.clickedNode !== null){
        let name = document.getElementById('name').value;
        win.clickedNode.setAttr('name', name);
        let script = document.getElementById('script').value;
        win.clickedNode.setAttr('script', script);
        let tool = document.getElementById('tool').value;
        win.clickedNode.setAttr('tool', tool);
    }
}