import {
  UpdatePageTitle,
  ImageZoom,
  DigitsCountingAnimation,
  LazyLoad,
} from "./modules/modules.js";

import { menu_titles } from './modules/dictionary.js';


// Plugins

new UpdatePageTitle({
  dictionary: menu_titles,
});

new ImageZoom({
  mode: 'hover',
  mobileViewport: 768,
  strictHoverTarget: true,
  startZoom: 1.2,
  minZoom: 1,
  maxZoom: 1.5,
  zoomStep: 0.2,

  mobile: {
    minZoom: 1,
    maxZoom: 1.6,
    zoomStep: 0.2,
  }
});

new DigitsCountingAnimation({
  intObserverParams: {
    threshold: 0.1,
  },
  duration: 1500,
  steps: 30,
});


// Functions

function menuBlocksHandler() {

  let menuBlock = document.querySelector('.menu-block');
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!menuBlock) return;

  preloadImages();

  let screenTimer;

  if (!media) {

    document.addEventListener('pointerover', (event) => {

      let item = event.target.matches('.menu-block__item');

      if (item) {

        let block = event.target.closest('.menu-block');

        showImageOnScreen(event.target);

        block.addEventListener('pointerleave', (event) => {
          resetInitialImageOnScreen(block);
        }, { once: true });

      }

    });

  } else {

    setMobileInitActiveItem();

    document.addEventListener('click', (event) => {

      let item = event.target.closest('.menu-block__item');
      console.log(item);

      if (item) {
        setActiveState(item);
        showImageOnScreen(item);
      }

    });

  }

  function setActiveState(item) {

    let main = item.closest('.menu-block');
    let items = Array.from(main.querySelectorAll('.menu-block__item'));

    items.forEach((item) => item.classList.remove('active'));
    item.classList.add('active');

  }

  function setMobileInitActiveItem() {

    let blocks = Array.from(document.querySelectorAll('.menu-block'));
    blocks.forEach((block) => {
      let item = block.querySelector('.menu-block__item');
      item.classList.add('active');
    });

  }

  function showImageOnScreen(item) {

    let block = item.closest('.menu-block');
    let screen = block.querySelector('.menu-block__screen');
    let url = item.dataset.screen;

    if (screen.getAttribute('src') === url) return;

    clearTimeout(screenTimer);

    screen.parentElement.classList.add('effect');

    screenTimer = setTimeout(() => {
      screen.src = url;
      screen.parentElement.classList.remove('effect');
    }, 200);

  }

  function resetInitialImageOnScreen(block) {

    let item = block.querySelector('.menu-block__item');

    showImageOnScreen(item);

  }

  function preloadImages() {
    
    let blocks = Array.from(document.querySelectorAll('.menu-block'));
    let observer = new IntersectionObserver((list, obs) => {

      list.forEach((item) => {
        
        if (item.isIntersecting) {

          let elements = Array.from(item.target.querySelectorAll('.menu-block__item'));
          elements.forEach((el) => {
            new Image().src = el.dataset.screen;
          });

          obs.unobserve(item.target);

        }

      });

    }, { root: document.querySelector('.smooth-scroll-wrapper'), threshold: 0.1, rootMargin: '700px 0px' });

    blocks.forEach((block) => observer.observe(block));

  }

}

function activateFirstblock() {

  let block = document.querySelector('.menu-block');
  
  if (!block) return;

  let screen = block.querySelector('.menu-block__screen');
  screen.classList.add('loaded');

}

function pageScrollSmoother() {

  let media = window.matchMedia('(max-width: 768px)').matches;

  if (media) {
    new LazyLoad({
      offset: 800,
    });
    return;
  }

  try {
    gsap, ScrollTrigger, ScrollSmoother
  } catch {
    console.warn('Missing GSAP component');
    new LazyLoad({
      offset: 800,
    });
    return;
  }

  let smoother;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  if (ScrollTrigger.isTouch !== 1) {

    smoother = ScrollSmoother.create({ 
      wrapper: '.smooth-scroll-wrapper',
      content: '.smooth-scroll-page',
      smooth: 0.8,
    });

  }

  lazyLoad();

  function lazyLoad() {

    let blocks = Array.from(document.querySelectorAll('[data-load-block]'));

    if (!blocks.length) return;

    function load(info) {

      let block = info.vars.trigger;
      let elements = Array.from(block.querySelectorAll('[data-load]'));

      elements.forEach((element) => {

        let tag = element.tagName;

        element.addEventListener('load', (event) => {
          element.classList.add('loaded');
          element.removeAttribute('data-load');
          element.dispatchEvent(new CustomEvent('lazyloaded', { bubbles: true, cancelable: true, composed: true }));
        }, { once: true });

        if (tag === 'SOURCE' && element.parentElement.tagName === 'PICTURE') {
          element.srcset = element.dataset.load;
        } else if (tag === 'IMG' || tag === 'IFRAME') {
          element.src = element.dataset.load;
        } else if (tag === 'AUDIO' || tag === 'VIDEO') {
          element.preload = 'auto';
        } 

      });

    }

    blocks.forEach((block) => {

      ScrollTrigger.create({

        trigger: block,
        start: "top bottom+=800",
        once: true,

        onEnter: load,
        onEnterBack: load,

      });

    });

  }

  document.addEventListener('click', (event) => {

    let link = event.target.closest('a');

    if (link) {

      let anchor = link.href.match(/#\w+$/);
      let target = document.querySelector(anchor);

      if (target) {
        event.preventDefault();
        smoother.scrollTo(target, true, 'top top');
      }

    }

  });

  window.addEventListener("load", () => {

    let hash = window.location.hash;

    if (hash) {
      let target = document.querySelector(hash);
      if (target) smoother.scrollTo(target, true, 'top top');
    }

  });

}

function menuBlockMobile() {

  let media = window.matchMedia('(max-width: 996px)').matches;

  if (!media) return;

  let blocks = Array.from(document.querySelectorAll('.menu-block'));

  blocks.forEach((block) => {

    let screen = block.querySelector('.menu-block__screen-wrapper');
    let title = block.querySelector('.menu-block__title');

    title.after(screen);

  });

}


pageScrollSmoother();
menuBlocksHandler();
activateFirstblock();
menuBlockMobile();