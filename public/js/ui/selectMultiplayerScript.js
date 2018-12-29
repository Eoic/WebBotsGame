let scriptSelection = document.getElementById('multiplayer-script-list')

function submitSelection() {
    const selectedId = scriptSelection.options[scriptSelection.selectedIndex].value

    let request = new XMLHttpRequest()
    request.open('POST', `${window.location.origin}/scripts/select-mp-script`, true);
    request.responseType = 'json';
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        _id: selectedId
    }))

    request.onreadystatechange = (event) => {
        if(request.readyState === 4 && request.status === 200){
            displayMessage('success', 'Selection updated')
        } else if(request.status === 400) {
            displayMessage('error', 'An error occoured')
        }
    }
}