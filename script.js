// toggle icon navbar


// scroll sections
let sections = document.querySelectorAll('')

window.onscroll = () => {
    // sticky header
    let header = document.querySelector('header');

    header.classList.toggle('sticky', window.scrollY > 100);
}
