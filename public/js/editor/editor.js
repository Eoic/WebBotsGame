var editor = ace.edit("editor");

editor.setOptions({
    fontSize: '12pt',
    printMargin: false,
    theme: 'ace/theme/tomorrow_night',
    mode: 'ace/mode/javascript'
});

let isResizing = false;
let splitter = document.getElementById('splitter');
let scriptsContainer = document.createElement('div');
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

    if (height !== null) {
        splitter.style.bottom = height;
        editorContainer.style.height = height;
        return;
    }
}

function onLoadHandler() {
    loadScriptsContainer();
    setInitialEditorHeight();
}

function loadScriptsContainer() {
    scriptsContainer.className = 'scripts';
    appendInput('script-input', createScript);
    fetchScripts();
    editorContainer.appendChild(scriptsContainer);
}

function appendButton(innerHTML, onClickHandler = undefined) {
    let btn = document.createElement('button');
    btn.innerHTML = innerHTML;
    btn.className = 'btn btn-purple btn-fluid';
    btn.onclick = onClickHandler;
    scriptsContainer.appendChild(btn);
}

function appendInput(className, keyPressHandler) {
    let input = document.createElement('input');
    input.className = className;
    input.placeholder = 'New script...';
    input.onkeypress = keyPressHandler;
    scriptsContainer.appendChild(input);
}

/* API CALLS */
/**
 * Fetch all scripts created by user
 */
function fetchScripts() {
    let request = new XMLHttpRequest();

    request.open('GET', `${window.location.origin}/scripts`, true);
    request.responseType = 'json';
    request.setRequestHeader('Content-Type', 'application/json');
    request.send();

    request.onreadystatechange = (event) => {
        if(request.readyState === 4 && request.status === 200){
            request.response.forEach(element => {
                appendButton(element.name);
            });
        }
    }
}

function selectScript(){

}

/**
 * Send POST request to create new script
 * on ENTER key press
 * @param { Object } event 
 */
function createScript(event) {
    if (event.keyCode === 13 && this.value.trim() !== '') {
        let request = new XMLHttpRequest();

        request.open('POST', `${window.location.origin}/scripts`, true);
        request.responseType = 'json';
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({ filename: this.value }));

        request.onreadystatechange = (event) => {
            if(request.readyState === 4 && request.status === 200){
                console.log(`${request.response.filename} created`);
                appendButton(request.response.filename);
                this.value = '';
            }
        }
    }
}

function deleteScript(){
    
}

function saveScript() {

}