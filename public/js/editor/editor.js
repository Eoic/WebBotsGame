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

splitter.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('mousemove', onMouseMove);

// Listener callbacks
function onMouseDown() {
    isResizing = true;
    console.log('Resizing enabled');
}

function onMouseUp() {
    isResizing = false;
    console.log('Resizing disabled');
    // Save to local storage
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