import {
  Parallax,
  DigitsCountingAnimation,
  UpdatePageTitle,
} from "./modules/modules.js";

import { links, index_titles } from './modules/dictionary.js';


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

new UpdatePageTitle({
  dictionary: index_titles,
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

function menuTabsHandler() {

  let block = document.querySelector('.menu-tabs');

  if (!block) return;

  let tabs = Array.from(block.querySelectorAll('.menu-tabs__tab'));
  let triggers = Array.from(block.querySelectorAll('.menu-tabs__button'));
  let menuItems = Array.from(block.querySelectorAll('.menu-item'));
  let media = window.matchMedia('(max-width: 768px)').matches;
  let screenTimer;

  preloadFullImages();
  selectInitialTab();

  document.addEventListener('click', (event) => {

    let trigger = event.target.closest('.menu-tabs__button');

    if (trigger) switchTabs(trigger);

  });

  if (!media) {

    document.addEventListener('pointerover', (event) => {

      let menuItem = event.target.closest('.menu-item');

      if (menuItem) {
        showImageOnScreen(menuItem);
      }

    });

  }

  function switchTabs(btn) {

    let tab = block.querySelector(`[data-tab="${btn.dataset.trig}"]`);

    if (!tab) return;
    if (tab.matches('.active')) return;

    tabs.forEach((tab, index) => {

      tab.classList.remove('active');
      triggers[index].classList.remove('active');
      triggers[index].disabled = false;

    });

    btn.classList.add('active');
    btn.disabled = true;

    setTimeout(() => {
      tab.classList.add('active');
      showInitialImageOnScreens();
    }, 200);
    
  }

  function showImageOnScreen(item) {

    let tab = item.closest('.menu-tabs__tab');
    let screen = tab.querySelector('.menu-tabs__big-img');
    let full = item.dataset.full;
    let alt = item.querySelector('.menu-item__icon')?.alt;

    if (screen.currentURL === full) return;

    screen.classList.add('active');

    clearTimeout(screenTimer);

    screenTimer = setTimeout(() => {

      screen.src = full;
      screen.alt = alt;
      screen.currentURL = full;
      screen.classList.remove('active');

    }, 260);

  }

  function preloadFullImages() { 

    let observer = new IntersectionObserver((list, obs) => {

      list.forEach((item) => {

        if (item.isIntersecting) {

          menuItems.forEach((item) => {
            let img = new Image();
            img.src = item.dataset.full;
          });

          showInitialImageOnScreens();
          obs.disconnect();

        }

      });

    }, { root: null, threshold: 0.01, rootMargin: '1000px 0px' });

    observer.observe(block);

  }

  function showInitialImageOnScreens() {

    tabs.forEach((tab) => {

      let menuItem = tab.querySelector('.menu-item');
      let screen = tab.querySelector('.menu-tabs__big-img');
      let full = menuItem.dataset.full;
      let alt = menuItem.querySelector('.menu-item__icon')?.alt;

      screen.src = full;
      screen.alt = alt;
      screen.currentURL = full;

    });

  }

  function selectInitialTab() {

    triggers[0].classList.add('active');
    triggers[0].disabled = true;
    tabs[0].classList.add('active');

  }

}

function linkImitator(data) {

  let element = document.querySelector('[data-link]');

  if (!element || !data) return;

  let link = document.createElement('a');

  document.addEventListener('click', (event) => {

    let linkElement = event.target.closest('[data-link]');
   
    if (linkElement) runLink(linkElement);

  });

  function runLink(element) {

    let url = data[element.dataset.link]?.url ?? './404.html';
    let target = data[element.dataset.link]?.target ?? '';

    link.href = url;
    link.target = target;

    link.click();

  }

}

function showMoreHandler() {

  let triggers = Array.from(document.querySelectorAll('[data-show-trig]'));
  let contents = Array.from(document.querySelectorAll('[data-show]'));

  if (!triggers.length || !contents.length) return;

  defineElements();

  document.addEventListener('click', (event) => {

    let trigger = event.target.closest('[data-show-trig]');

    if (trigger) showHideContent(trigger);

  });

  function showHideContent(btn) {

    let content = btn._content

    if (!content) return;

    if (content.matches('.active')) {

      content.classList.remove('active');
      content.style.height = '';

      btn.classList.remove('active');
      btn.textContent = btn._initText;

    } else {

      content.classList.add('active');
      content.style.height = content.scrollHeight + 'px';

      btn.classList.add('active');
      btn.textContent = 'Hide';

    }

  }

  function defineElements() {

    triggers.forEach((btn) => {

      let content = document.querySelector(`[data-show="${btn.dataset.showTrig}"]`);

      btn._content = content;
      btn._initText = btn.textContent;
      content._btn = btn;

    });

  }

}


replaceHeaderImgMobile();
replaceAboutImgMobile();
replaceChooseUsImgMobile();
// slidersAutoplayViewportController();
menuTabsHandler();
linkImitator(links);
showMoreHandler();