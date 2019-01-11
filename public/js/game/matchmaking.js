window.addEventListener('load', () => {
    setTimeout(() => {
        let request = new XMLHttpRequest()

        request.open('GET', `${window.location.origin}/multiplayer/start-game`, true);
        request.responseType = 'json';
        request.setRequestHeader('Content-Type', 'application/json');
        request.send();

        request.onreadystatechange = (_event) => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    let loadingStatus = document.getElementById('loading-status')
                    loadingStatus.children[0].innerText = 'Game found'
                    loadingStatus.removeChild(loadingStatus.children[1])

                    let gameLink = document.createElement('a');
                    gameLink.className = 'btn btn-success btn-block btn-center btn-link'
                    gameLink.innerHTML = "<span class='fa fa-play'></span> START"
                    gameLink.href = `${window.location.origin}/multiplayer`

                    loadingStatus.appendChild(gameLink)
                } else {
                    let errorContainer = document.getElementById('error-container')
                    errorContainer.style.visibility = 'visible'
                    errorContainer.innerText = request.response.error
                }
            }
        }
    }, 2000)
})