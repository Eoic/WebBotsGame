let intervalHandle;
let counter = 5;

window.addEventListener('load', () => {
    timerText.visible = true
    intervalHandle = setInterval(updateCountdown, 1000)
    setTimeout(runMultiplayerScripts, 5000)
})

window.addEventListener('beforeunload', beforeUnloadHandler)

// Starts game after countdown
function runMultiplayerScripts() {
    // Stop countdown
    clearInterval(intervalHandle)
    socket.send(JSON.stringify({ type: 'MULTIPLAYER' }))
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