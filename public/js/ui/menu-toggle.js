/*
window.addEventListener('load', () => {
    let navbarState = JSON.parse(localStorage.getItem('navbar-closed'))

    if(navbarState !== null)
        if(navbarState && window.innerWidth < 1000)
            document.getElementById('navbar-items').classList.add('navbar-items-none')
})
*/

document.getElementById('list-menu-button').addEventListener('click', () => {
    let result = document.getElementById('navbar-items').classList.toggle('navbar-items-none')
    localStorage.setItem('navbar-closed', result)
})

window.addEventListener('resize', (_event) => {
  let largerScreen = false

  if(window.innerWidth >= 1000 && !largerScreen) {
      document.getElementById('navbar-items').classList.remove('navbar-items-none')
      largerScreen = true
  }

  if(window.innerWidth < 1000 && largerScreen === true) {
        largerScreen = false;
  }
})
