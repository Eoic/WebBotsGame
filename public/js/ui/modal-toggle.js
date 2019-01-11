const modal = document.getElementById('modal-window')

function closeModal() {
    modal.style.visibility = "hidden";
}

function openModal(conditionFulfilled) {
    if(conditionFulfilled)
        modal.style.visibility = "visible"
}

function setModalConfirmEvent(onClickHandler) {
    document.getElementById('modal-confirm').onclick = onClickHandler
}

function setDeletionMessage() {
    let script = document.querySelector('.btn-active');
    
    if(script === null)
        return;

    document.getElementById('modal-content').innerHTML = `Are you sure you want to delete <b> ${script.innerText} </b> ?`
}