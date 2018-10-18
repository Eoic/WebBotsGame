var editor = ace.edit("editor");

editor.setOptions({
    fontSize: '12pt',
    printMargin: false,
    theme: 'ace/theme/tomorrow_night',
    mode: 'ace/mode/javascript'
});

let isResizing = false;
let splitter = document.getElementById('splitter');

let editorContainer = document.getElementById('editor');
let splitterHeight = Number.parseInt(document.defaultView.getComputedStyle(splitter).height);


window.onload = setInitialEditorHeight;
splitter.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('mousemove', onMouseMove);

// Listener callbacks
function onMouseDown() {
    isResizing = true;
}

function onMouseUp() {
    isResizing = false;
    localStorage.setItem('editorHeight', editorContainer.style.height);
}

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