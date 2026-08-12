import {
  UpdatePageTitle,
  LazyLoad,
  Demonstrator,
  ImageZoom,
} from "./modules/modules.js";

import { item_titles } from './modules/dictionary.js';

mobileGoodDescription();


// Plugins

new UpdatePageTitle({
  dictionary: item_titles,
});

new Demonstrator('#demo1', {

  scrollToClick: true,

  autoplayOnViewport: {
    margin: 0,
    threshold: 0.05,  
  }, 

  extraSlide: true,
  showDelay: [200, 300],

  slider: {

    slidesPerView: 4,
    slidesPerGroup: 1, 
    spaceBetween: 24,
    speed: 600,
    simulateTouch: true,
    direction: 'vertical',

    navigation: {
      nextEl: '.demo-controls .demo-controls__btn--next',
      prevEl: '.demo-controls .demo-controls__btn--prev',
    },

    autoplay: {
      enabled: true,
      delay: 2000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },

    breakpoints: {

      996: {
        direction: 'vertical',
      },

      768: {
        slidesPerView: 4,
        direction: 'horizontal',
        spaceBetween: 24,
      },

      576: {
        slidesPerView: 4,
        direction: 'horizontal',
        spaceBetween: 20,
      },

      0: {
        slidesPerView: 3,
        direction: 'horizontal',
        spaceBetween: 15,
      }

    },

    on: {

      afterInit: (swiper) => {
        demoControlsBtnAutoplay(swiper);
      },

    }

  }

});

new ImageZoom({
  mode: 'hover',
  mobileViewport: 768,
  strictHoverTarget: true,

  startZoom: 1.2,
  minZoom: 1,
  maxZoom: 1.6,
  zoomStep: 0.2,

  mobile: {
    minZoom: 1,
    maxZoom: 1.8,
    zoomStep: 0.2,
  }
});


// Functions

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

  window._scrollSmoother = smoother;

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

function demoControlsBtnAutoplay(swiper) {
  
  let demoControls = document.querySelector('.good-description__demo-controls');
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!demoControls || media) return;

  demoControls.addEventListener('pointerenter', (event) => {

    swiper.autoplay.stop();
    demoControls.addEventListener('pointerleave', (event) => swiper.autoplay.start(), { once: true });

  });

}

function itemCounter() {

  let counter = document.querySelector('.counter');

  if (!counter) return;

  let increaseBtn = counter.querySelector('.counter__btn--plus');
  let decreaseBtn = counter.querySelector('.counter__btn--minus');
  let input = counter.querySelector('.counter__input');
  let addCartBtn = document.querySelector('.good-description__common-btn');

  valueController();

  document.addEventListener('click', (event) => {

    let incBtn = event.target.closest('.counter__btn--plus');
    let decBtn = event.target.closest('.counter__btn--minus');
    let addBtn = event.target.closest('.good-description__common-btn');

    if (incBtn) increaseValue();
    if (decBtn) decreaseValue();
    if (addBtn) resetValue();

  });

  input.addEventListener('input', (event) => valueController());

  function resetValue() {

    input.value = 1;
    valueController();

  }

  function increaseValue() {

    let value = +input.value;
    input.value = ++value;
    valueController();

  }

  function decreaseValue() {

    let value = +input.value;
    input.value = --value;
    valueController();

  }

  function valueController() {

    let value = +input.value;

    if (value >= 999) {
      input.value = 999;
      increaseBtn.disabled = true;
    } else if (value <= 1 || input.value.startsWith('0')) {
      input.value = 1;
      decreaseBtn.disabled = true;
    } else if (value > 1) {
      decreaseBtn.disabled = false;
    }

    if (value < 999) {
      increaseBtn.disabled = false;
    }

  }

}

function wishlistBtn() {

  let btn = document.querySelector('[data-btn]');

  if (!btn) return;

  let span = btn.querySelector('.common-btn__text');

  btn.addEventListener('click', (event) => btnState());

  function btnState() {

    btn.classList.toggle('active');

    if (btn.matches('.active')) {
      span.textContent = 'In Wishlist';
    } else {
      span.textContent = 'Add to Wishlist';
    }

  }

}

function mobileGoodDescription() {

  let media = window.matchMedia('(max-width: 996px)').matches;
  let block = document.querySelector('.good-description');

  if (!media || !block) return;

  let demonstrator = block.querySelector('.demonstrator');
  let name = block.querySelector('.good-description__name');

  name.after(demonstrator);

}

function tabletsHandler() {

  let tabs = Array.from(document.querySelectorAll('[data-tabs]'));

  if (!tabs.length) return;

  let currentTabsBlock;
  defineElements();
  selectInitTab();

  document.addEventListener('click', (event) => {

    let trigger = event.target.closest('[data-tab-trig]');

    if (trigger) {
      showSelectedTab(trigger);
    }

  });

  function showSelectedTab(trigger) {

    currentTabsBlock = trigger.closest('[data-tabs]');

    let tab = currentTabsBlock.querySelector(`[data-tab="${trigger.dataset.tabTrig}"]`);

    if (!tab || tab.matches('.active')) return;

    currentTabsBlock._tabs.forEach((tab) => tab.classList.remove('active'));
    currentTabsBlock._triggers.forEach((trig) => trig.classList.remove('active'));

    trigger.classList.add('active');
    tab.classList.add('active');
    tab.parentElement.style.height = tab.scrollHeight + 'px';

  }

  function selectInitTab() {

    tabs.forEach((item) => {
      item._triggers[0].classList.add('active');
      item._tabs[0].classList.add('active');

      let container = item._tabs[0].parentElement;
      container.style.height = item._tabs[0].offsetHeight + 'px';
      container.style.overflow = 'hidden';
    })

  }

  function defineElements() {

    tabs.forEach((item) => {
      item._triggers = Array.from(item.querySelectorAll('[data-tab-trig]'));
      item._tabs = Array.from(item.querySelectorAll('[data-tab]'));
    })

  }

}


// pageScrollSmoother();
itemCounter();
wishlistBtn();
tabletsHandler();