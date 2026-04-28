import {
  Parallax,
} from "./modules/modules.js";


// Plugins

// new Parallax();


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


replaceHeaderImgMobile();
replaceAboutImgMobile();