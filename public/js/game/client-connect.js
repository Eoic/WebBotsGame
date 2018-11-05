let connectionString = `ws://${window.location.host}`;
let socket = new WebSocket(connectionString);

socket.onmessage = (event) => {
    console.log(JSON.parse(event.data));
}

function runScript() {

    displayMessage('warning', 'Running script...')

    socket.send(JSON.stringify({
        code: editor.getValue()
    }));
}

function endSession() {
    socket.close();
}