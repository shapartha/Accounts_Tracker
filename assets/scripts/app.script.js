window.onscroll = function () {
    let scrollPos = this.scrollY;
    if (scrollPos > 50) {
        document.querySelector('.scroller').style.display = 'inherit';
    } else {
        document.querySelector('.scroller').style.display = 'none';
    }
}