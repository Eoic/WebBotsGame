window.addEventListener('load', loadConsole, false)

let consoleWindow = document.createElement('div');

function loadConsole(){
    let editorWindow = document.getElementById('editor')
    consoleWindow.id = 'console-window'
    consoleWindow.style.position = 'relative'
    consoleWindow.style.visibility = 'hidden'
    consoleWindow.style.width = '100%'
    consoleWindow.style.height = '100%'
    consoleWindow.style.backgroundColor = '#ced2cf'
    consoleWindow.style.zIndex = 4
    consoleWindow.style.marginLeft = '1px'
    consoleWindow.style.marginTop = '1px'
    consoleWindow.style.overflowY = 'auto';
    editorWindow.appendChild(consoleWindow)
}

function showConsole(){
    toggleConsole('console-tab', 'script-tab', 'visible')
}

function hideConsole(){
    toggleConsole('script-tab', 'console-tab', 'hidden')
}

function toggleConsole(idToSelect, idToRemove, visibility){
    let tabToSelect = document.getElementById(idToSelect)
    let tabToUnselect = document.getElementById(idToRemove)
    tabToSelect.classList.add('btn-primary-selected')
    tabToUnselect.classList.remove('btn-primary-selected')
    consoleWindow.style.visibility = visibility
}

function appendMessage(messageString) {
    let outputLine = document.createElement('p');
    outputLine.className = 'output-line'
    outputLine.innerText = '> ' + messageString;
    consoleWindow.appendChild(outputLine)
}