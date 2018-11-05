function displayMessage(type, content) {

    let container = document.getElementById('messages-container');

    if(container === null || content.trim() === '')
        return;

    let message = document.createElement('div')
    message.classList.add('notify');
    container.appendChild(message);

    switch(type){
        case 'success':
            message.classList.add('success')
            break;
        case 'warning':
            message.classList.add('warning')
            break;
        case 'error': 
            message.classList.add('error')
            break;
    }

    message.innerHTML = content;
    message.classList.add('visible');

    setTimeout(() => {
        container.removeChild(message);
    }, 3000);
}