var editor = ace.edit("editor");

editor.setOptions({
    fontSize: '12pt',
    printMargin: false,
    theme: 'ace/theme/tomorrow_night',
    mode: 'ace/mode/javascript'
});

let isResizing = false;
let splitter = document.getElementById('splitter');
let scriptsContainer = document.createElement('DIV');
let editorContainer = document.getElementById('editor');
let splitterHeight = Number.parseInt(document.defaultView.getComputedStyle(splitter).height);

window.onload = onLoadHandler;
splitter.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('mousemove', onMouseMove);

// Listener callbacks
function onMouseDown() {
    isResizing = true;
}

/**
 * Disables resizing once mouse 
 * button is released and saves current
 * size in local storage
 */
function onMouseUp() {
    isResizing = false;
    localStorage.setItem('editorHeight', editorContainer.style.height);
}

/**
 * Resizes code editor within screen bounds 
 * while mouse is being moved
 * @param { Object } event 
 */
function onMouseMove(event) {
    if (isResizing) {
        let position = window.innerHeight - event.pageY - splitterHeight / 2;

        if (position < 0)
            position = 0;

        if (event.pageY < splitterHeight / 2)
            position = window.innerHeight - splitterHeight;

        splitter.style.bottom = position + 'px'
        editorContainer.style.height = position + 'px';
    }
}

/**
 * Sets primary editor and splitter heights form
 * local storage.
 */
function setInitialEditorHeight() {
    let height = localStorage.getItem('editorHeight');

    if (height !== null){
        splitter.style.bottom = height;
        editorContainer.style.height = height;
        return;
    }
}

function onLoadHandler(){
    loadScriptsContainer();
    setInitialEditorHeight();
}

function loadScriptsContainer(){
    scriptsContainer.className = 'scripts';
    appendButton('+', 'btn btn-purple btn-adder');
    appendButton('main.js', 'btn btn-purple btn-fluid', fetchScript);
    editorContainer.appendChild(scriptsContainer);
}

function appendButton(innerHTML, className, onClickHandler = undefined){
    let btn = document.createElement('button');
    btn.innerHTML = innerHTML;
    btn.className = className;
    btn.onclick = onClickHandler;
    scriptsContainer.appendChild(btn);
}

/* API CALLS */
function fetchScript(){
    let httpReq = new XMLHttpRequest();

    httpReq.open('GET', `${window.location.origin}/scripts/${this.innerText}`, true);
    //httpReq.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    httpReq.send();

    httpReq.onreadystatechange = (event) => {
        console.log(httpReq.response);
    }
}

function saveScript(){
    
}