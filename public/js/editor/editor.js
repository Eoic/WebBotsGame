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
let scriptsSelect = document.getElementById('scripts-dropdown')
let splitterHeight = Number.parseInt(document.defaultView.getComputedStyle(splitter).height);

window.onload = onLoadHandler;
splitter.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', () => {
    // Dont let editor container to be taller than window height
    /*
    let editorHeight = Number.parseInt(editorContainer.style.height);
    if(editorHeight > window.innerHeight)
        splitter.style.bottom = window.innerHeight - splitterHeight + 'px'
        editorContainer.style.height = window.innerHeight - splitterHeight + 'px';
        */
})

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
        editor.resize();
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

    if (onClickHandler !== undefined)
        btn.onclick = onClickHandler;

    scriptsContainer.appendChild(btn);
}

function appendInput(className, keyPressHandler) {
    let input = document.createElement('input');
    input.className = className;
    input.placeholder = 'New script...';
    input.maxLength = 15;
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
        if (request.readyState === 4 && request.status === 200) {
            request.response.forEach(element => {
                appendButton(element.name, selectScript);
                let option = document.createElement('option');
                option.value = element.name;
                option.innerText = element.name;
                scriptsSelect.appendChild(option)
            });
        }
    }
}

/**
 * Display clicked button as selected and fetch code
 * of selected script
 * @param {Object} event On click event 
 */
function selectScript(event) {
    scriptsContainer.querySelectorAll('.btn-active').forEach(element => {
        element.classList.remove('btn-active');
    });

    this.classList.add('btn-active');

    let request = new XMLHttpRequest();
    request.responseType = 'json';
    request.open('GET', `${window.location.origin}/scripts/${this.innerText}`, true);
    request.send();

    request.onreadystatechange = (event) => {
        if (request.readyState === 4 && request.status === 200) {
            typeof request.response.code !== 'undefined' ?
                editor.setValue(request.response.code, -1) :
                editor.setValue('');
        }
    }
}

/**
 * Send POST request to create new script
 * on ENTER key press
 * @param { Object } event 
 */
function createScript(event) {
    if (event.keyCode === 13 && isFilenameValid(this.value)) {
        let request = new XMLHttpRequest();

        request.open('POST', `${window.location.origin}/scripts`, true);
        request.responseType = 'json';
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({
            filename: this.value
        }));

        request.onreadystatechange = (event) => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    displayMessage('success', `Created <b>${request.response.filename}</b>`);
                    appendButton(request.response.filename, selectScript);
                    let option = document.createElement('option');
                    option.innerText = request.response.filename;
                    option.value = request.response.filename;
                    scriptsSelect.appendChild(option);
                    this.value = '';
                } else if(request.status === 304) {
                    displayMessage('error', "Script with this name is already created")
                }
            }
        }
    }
}

function isFilenameValid(value) {
    let trimmed = value.trim();

    if (trimmed.length > 0 && trimmed.length < 16) {
        return true;
    }

    displayMessage('error', 'Filename must be between 1 and 15 characters long')
    return false;
}

function saveScript() {

    let selected = document.querySelector('.btn-active');

    if (selected === null){
        displayMessage('error', 'No script is selected')
        return;
    }

    let request = new XMLHttpRequest();
    let filename = selected.innerText

    request.open('PUT', `${window.location.origin}/scripts`, true);
    request.responseType = 'json';
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        filename,
        code: editor.getValue()
    }));

    request.onreadystatechange = (event) => {
        if (request.readyState === 4 && request.status === 200) {
            displayMessage('success', `Script <b> ${filename} </b> saved successfully`);
        }
    }
}

function deleteScript() {
    let request = new XMLHttpRequest();
    let selected = document.querySelector('.btn-active');

    console.log(selected);

    if (selected === null)
        return;

    let filename = selected.innerText;

    request.open('DELETE', `${window.location.origin}/scripts/${filename}`, true);
    request.send();

    request.onreadystatechange = (event) => {
        if (request.readyState === 4 && request.status === 200) {
            selected.parentNode.removeChild(selected);

            for (let i = 0; i < scriptsSelect.length; i++)
                if (scriptsSelect.options[i].innerText === selected.innerText)
                    scriptsSelect.removeChild(scriptsSelect.options[i]);

            editor.setValue('');
            displayMessage('success', `Script <b>${filename}</b> deleted successfully`)
        }
    }
}