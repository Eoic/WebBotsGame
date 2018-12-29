function createGame(opponent) {
    let request = new XMLHttpRequest()

    request.open('POST', `${window.location.origin}/lobby`, true);
    request.responseType = 'json';
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        opponentName: opponent
    }));

    request.onreadystatechange = (event) => {
        if(request.readyState === 4 && request.status === 200){
            console.log(request.response)
        }
    }
}