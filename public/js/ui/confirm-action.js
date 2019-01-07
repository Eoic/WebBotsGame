function deleteUser(id, username) {
    const result = confirm(`Are you sure you want to delete ${username} ?`)

    if (result) {
        const request = new XMLHttpRequest();
        request.open('DELETE', `${window.location.origin}/users/manage-users/${id}`, true);
        request.send();

        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    location.reload()
                } else {
                    displayMessage('error', `Failed to delete user ${username}`)
                }
            }
        }
    }

    return;
}