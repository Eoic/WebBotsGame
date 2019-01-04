window.addEventListener('load', loadConsole, false)

let consoleWindow = document.createElement('div');

function loadConsole(){
    let editorWindow = document.getElementById('editor')
    let clearButton = document.createElement('button')
    consoleWindow.id = 'console-window'
    consoleWindow.style.position = 'relative'
    consoleWindow.style.visibility = 'hidden'
    consoleWindow.style.width = '100%'
    consoleWindow.style.height = '100%'
    consoleWindow.style.backgroundColor = '#403939'
    consoleWindow.style.zIndex = 4
    consoleWindow.style.border = '1px solid #2F2F2F'
    consoleWindow.style.overflowY = 'auto';

    clearButton.style.position = 'sticky'
    clearButton.style.top = 0
    clearButton.className = 'clear-button'
    clearButton.onclick = clearConsole
    let trashIcon = document.createElement('span')
    trashIcon.className = 'fa fa-trash'
    clearButton.appendChild(trashIcon)
    consoleWindow.appendChild(clearButton)
    editorWindow.appendChild(consoleWindow)
}

function showConsole(){
    toggleConsole('console-tab', 'script-tab', 'visible')
}

function hideConsole(){
    toggleConsole('script-tab', 'console-tab', 'hidden')
}

function clearConsole() {
    while (consoleWindow.childNodes.length > 1)
        consoleWindow.removeChild(consoleWindow.lastChild);
}

function toggleConsole(idToSelect, idToRemove, visibility){
    let tabToSelect = document.getElementById(idToSelect)
    let tabToUnselect = document.getElementById(idToRemove)
    tabToSelect.classList.add('btn-primary-selected')
    tabToUnselect.classList.remove('btn-primary-selected')
    consoleWindow.style.visibility = visibility
}

function flushMessages() {
    if(consoleWindow.childNodes.length > 500) {
        clearConsole()
        appendMessage("Output has beeen cleared due to reached message limit", 3)
    }
}

function appendMessage(messageString, type) {

    flushMessages()
    
    let outputLine = document.createElement('p');
    
    switch(type) {
        case 1: // Normal
            outputLine.style.color = '#C5C5C5'
            break
        case 2: // Warning
            outputLine.style.color = '#FF8D14'
            break
        case 3: // Error
            outputLine.style.color = '#FF7B7B'
            break
        default: {
            outputLine.style.color = '#C5C5C5'
        }
    }
    
    outputLine.className = 'output-line'
    outputLine.innerText = '> ' + messageString;
    consoleWindow.appendChild(outputLine)
}