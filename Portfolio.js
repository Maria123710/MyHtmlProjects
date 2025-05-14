

var typed = new Typed('.text', {
  strings: ["Full Stack Developer","Web Developer", "Programmer"],
  typeSpeed: 100,
  backSpeed: 100,
  backdelay: 1000,
  loop: true
});

const circles = document.querySelectorAll('.circle');

circles.forEach(elem => {
  let dots = parseInt(elem.getAttribute("data-dots"), 10);
  let marked = parseInt(elem.getAttribute("data-percent"), 10);
  let percent = Math.floor((dots * marked) / 100);
  let points = "";
  let rotate = 360 / dots;

  for (let i = 0; i < dots; i++) {
    points += `<div class="points" style="--i:${i}; --rot:${rotate * i}deg"></div>`;
  }

  elem.innerHTML += points;

  const pointsMarked = elem.querySelectorAll('.points');
  for (let i = 0; i < percent; i++) {
    pointsMarked[i].classList.add('marked');
  }
});


var mixer = mixitup('.portfolio-gallary');

const menuLi = document.querySelectorAll('header nav a');
const section = document.querySelectorAll('section');
const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");
const header = document.querySelector("header");

// Active menu on scroll
function activeMenu() {
  let len = section.length;
  while (--len && window.scrollY + header.offsetHeight < section[len].offsetTop) {}
  menuLi.forEach(sec => sec.classList.remove('active1'));
  if (menuLi[len]) {
    menuLi[len].classList.add('active1');
  }
}

// Sticky header + active nav on scroll
window.addEventListener("scroll", () => {
  header.classList.toggle("sticky", window.scrollY > 50);
  activeMenu();
});

// Menu toggle for mobile
menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navbar.classList.toggle("active");
};

// Close mobile menu on nav link click
menuLi.forEach(link => {
  link.addEventListener('click', () => {
    menuIcon.classList.remove("bx-x");
    navbar.classList.remove("active");
  });
});


