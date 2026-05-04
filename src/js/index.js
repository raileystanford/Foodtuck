import {
  Parallax,
} from "./modules/modules.js";


// Plugins

// new Parallax();

new Swiper('#food-cat', {
  slidesPerView: 4,
  spaceBetween: 33,
  speed: 900,
  loop: true,
  simulateTouch: true,

  // autoplay: {
  //   delay: 2000,
  //   disableOnInteraction: false,
  //   pauseOnMouseEnter: true,
  // },

  keyboard: {
    enabled: true, 
    onlyInViewport: true,
    pageUpDown: true, 
  },

  on: {

    click(swiper) {

      let slide = swiper.clickedSlide;
      let url = slide.firstElementChild.dataset.link ?? './404.html';

      window.location.href = url;

    }

  }

});


// Functions

function replaceAboutImgMobile() {

  let media = window.matchMedia('(max-width: 996px)').matches;

  if (!media) return;

  let subtitle = document.querySelector('.index-about .heading__subtitle');
  let imgs = Array.from(document.querySelectorAll('.index-about__pic'));

  if (!subtitle || !imgs) return;

  let elem = document.createElement('div');
  elem.classList.add('heading__images');

  elem.append(...imgs);
  subtitle.after(elem);

}

function replaceHeaderImgMobile() {

  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!media) return;

  let subtitle = document.querySelector('.header .heading__subtitle');
  let img = document.querySelector('.header .food-gravity');

  if (!subtitle || !img) return;

  img.classList.remove('index-intro__food-gravity');
  img.classList.add('heading__food-gravity');
  subtitle.after(img);

}

function linkImitatorForSlides() {

  let slides = Array.from(document.querySelectorAll('.food-cat .cm-slider__slide'));

  if (!slides.length) return;

  let links = [ '#', '#', '#', '#', '#', '#', '#', '#' ];

  

}


replaceHeaderImgMobile();
replaceAboutImgMobile();