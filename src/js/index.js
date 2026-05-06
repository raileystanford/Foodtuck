import {
  Parallax,
  DigitsCountingAnimation,
} from "./modules/modules.js";


// Plugins

// new Parallax();

// AUTOPLAY
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

  },

  breakpoints: {

    1201: {
      spaceBetween: 33,
    },

    997: {
      slidesPerView: 4,
      spaceBetween: 22,
    },

    577: {
      slidesPerView: 3,
      spaceBetween: 15,
      speed: 900,
    },

    421: {
      slidesPerView: 2,
      spaceBetween: 10,
      speed: 700,
    },

    1: {
      slidesPerView: 1,
      spaceBetween: 20,
      speed: 700,
    }

  }

});

new DigitsCountingAnimation({
  intObserverParams: {
    threshold: 0.1,
    // delay: 2000,
    // Также и остальное тоже можно указать
  },
  duration: 1500, // Длительность анимации счетчика
  steps: 30, // Количество шагов за которые пройдет анимация
  // once: true, // Если тру то анимируется только один раз. Если фолс то анимируется при каждом попадании в область видимости
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

function slidersAutoplayViewportController(except = '.a93fj3fds1') {

  let sliders = Array.from(document.querySelectorAll(`.swiper:not(${except})`));

  if (sliders.length === 0) return;

  let observer = new IntersectionObserver((list, obs) => {

    list.forEach((item) => {

      if (item.isIntersecting) {
        item.target.swiper?.autoplay.start();
      } else {
        item.target.swiper?.autoplay.stop();
      }

    })

  }, { root: null, threshold: 0.2 });

  sliders.forEach((slider) => observer.observe(slider));

}

function replaceChooseUsImgMobile() {

  let media = window.matchMedia('(max-width: 996px)').matches;

  if (!media) return;

  let subtitle = document.querySelector('.choose-us .heading__subtitle');
  let img = document.querySelector('.choose-us .img-tabs');

  if (!subtitle || !img) return;

  img.classList.remove('choose-us__img-tabs');
  img.classList.add('heading__img-tabs');
  subtitle.after(img);

}


replaceHeaderImgMobile();
replaceAboutImgMobile();
replaceChooseUsImgMobile();
// slidersAutoplayViewportController();