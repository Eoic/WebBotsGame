let intervalHandle;
let counter = 5;

window.addEventListener('load', () => {
    timerText.visible = true
    intervalHandle = setInterval(updateCountdown, 1000)
    setTimeout(runMultiplayerScripts, 5000)
})

window.addEventListener('beforeunload', beforeUnloadHandler)

function runMultiplayerScripts() {
    let request = new XMLHttpRequest()
    request.open('GET', `${window.location.origin}/multiplayer/start-game`, true)
    request.responseType = 'json';
    request.setRequestHeader('Content-Type', 'application/json');
    request.send()

    // Stop countdown
    clearInterval(intervalHandle)

    request.onreadystatechange = (_event) => {
        if(request.readyState === 4 && request.status === 200) {
            setPlayerNames(request.response.playerOne.username, request.response.playerTwo.username)
            socket.send(JSON.stringify({
                multiplayerData: request.response,
                type: 'MULTIPLAYER'
            }))
        }
    }
}

/**
 * Sets player names in game info panel
 * @param {String} playerOne 
 * @param {String} playerTwo 
 */
function setPlayerNames(playerOne, playerTwo) {
    document.getElementById('player-one-name').innerText = playerOne
    document.getElementById('player-two-name').innerText = playerTwo
}

/**
 * Timeout before game start
 */
function updateCountdown() {
    updateTimer(--counter)
}

/**
 * Called when user tries to exit the page or refresh it
 * @param {Object} event 
 */
function beforeUnloadHandler(event) {
    event.returnValue = 'Are you sure?'
}