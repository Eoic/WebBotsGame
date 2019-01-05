window.addEventListener('load', (event) => {
    const state = loadMenuState()
    toggleMenu(state)
})

/**
 * Returns information about whether menu is open from local storage
 * If item in local storage is empty, assumes that menu is closed
 */
function loadMenuState() {
    const state = JSON.parse(localStorage.getItem('menu-open'))

    if(state !== null)
        return state;

    return false
}

/**
 * Opens or closes menu according to given param
 */
function toggleMenu(state) {
    if(state == null)
        return;

    let menuItems = document.getElementById('navbar-items')

    if(state === false){
        menuItems.classList.add('navbar-items-none');
        return;
    }

    menuItems.classList.remove('navbar-items-none');
}

/**
 * Add onclick event listener to menu button
 */
document.getElementById('list-menu-button').addEventListener('click', () => {
    const state = document.getElementById('navbar-items').classList.toggle('navbar-items-none')
    localStorage.setItem('menu-open', JSON.stringify(!state))
})