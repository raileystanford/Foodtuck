import {
  Parallax,
  DigitsCountingAnimation,
  UpdatePageTitle,
} from "./modules/modules.js";

import { links, index_titles } from './modules/dictionary.js';


// Plugins

new Parallax();

new Swiper('#food-cat', {
  slidesPerView: 4,
  spaceBetween: 33,
  speed: 900,
  loop: true,
  simulateTouch: true,

  autoplay: {
    delay: 2000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },

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

new Swiper('#testim-slider', {
  speed: 900,
  effect: "flip",
  autoHeight: true,
  loop: true,

  pagination: {
    el: '#testim-slider .testim-slider__pagination',
    type: 'bullets',
    clickable: true,
  },

  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },

  keyboard: {
    enabled: true, 
    onlyInViewport: true,
    pageUpDown: true, 
  },

});

new DigitsCountingAnimation({
  intObserverParams: {
    threshold: 0.1,
  },
  duration: 1500,
  steps: 30,
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

    if (media) return;

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

function chefsMobile() {

  let media = window.matchMedia('(max-width: 768px)').matches;
  let cards = Array.from(document.querySelectorAll('.chefs .chef'));

  if (!media || !cards.length) return;

  let block = document.querySelector('.chefs');
  let slider;

  removeElements();
  createSliderStructure();
  initSlider();

  function createSliderStructure() {

    slider = document.createElement('div');
    slider.classList.add('swiper', 'chefs__slider');

    let wrapper = document.createElement('div');
    wrapper.classList.add('swiper-wrapper');

    cards.forEach((card) => {

      let slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.append(card);
      wrapper.append(slide);

    });

    slider.append(wrapper);
    block.append(slider);

  }

  function removeElements() {

    let btn = document.querySelector('.chefs .outline-btn');
    cards[0].parentElement.remove();
    btn?.remove();

  }

  function initSlider() {

    new Swiper(slider, {
      slidesPerView: 2.3,
      spaceBetween: 15,
      speed: 900,
      loop: true,

      autoplay: {
        delay: 2000,
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
      },

      breakpoints: {

        577: {
          slidesPerView: 2.3,
          spaceBetween: 15,
        },

        421: {
          slidesPerView: 1.7,
          spaceBetween: 15,
        },

        1: {
          slidesPerView: 1.3,
          spaceBetween: 15,
        },

      }

    });

  }

}

function videoPlayer() {

  let videoPlayBtn = document.querySelector('.process .video-btn');

  if (!videoPlayBtn) return

  const media = window.matchMedia('(max-width: 768px)').matches;
  const element = {};
  let smoothWrapper = document.querySelector('.smooth-scroll-wrapper');

  createVideoBlock();
  defineElements();
  preloadVideo(); 

  document.addEventListener('click', (event) => {

    let isPlayBtn = event.target.closest('.process .video-btn');
    let isCloseBtn = event.target.closest('.video-block__close');

    if (isPlayBtn) {

      if (media) {
        openMobileVideo();
      } else {
        openVideoBlock();
      }
      
    } else if (isCloseBtn) {
      closeVideoBlock();
    }

  });

  if (!media) {

    document.addEventListener('keydown', (event) => {

      if (event.key === 'Escape') {

        if (element.container.matches('.active')) closeVideoBlock();

      }

    });

  }

  element.video.addEventListener('ended', (event) => {

    if (media) {
      closeMobileVideo();
    } else {
      closeVideoBlock();
    }

    element.video.currentTime = 0;

    if (document.fullscreenElement) {

      element.container.addEventListener('transitionend', (event) => {
        videoPlayBtn.scrollIntoView({ behavior: "instant", block: "center" });
      }, { once: true })

      document.exitFullscreen();

      videoPlayBtn.scrollIntoView({ behavior: "instant", block: "center" });

    }

  });

  document.addEventListener("fullscreenchange", () => {

    if (media) {
      if (!document.fullscreenElement) closeMobileVideo();
    } else {
      videoPlayBtn.scrollIntoView({ behavior: "instant", block: "center" });
    }
    
  });

  element.video.addEventListener("webkitendfullscreen", () => {
    
    if (media) {
      closeMobileVideo();
    } else {
      videoPlayBtn.scrollIntoView({ behavior: "instant", block: "center" });
    }
    
  });

  async function openMobileVideo() {

    element.container.classList.add('active');

    if (element.video.requestFullscreen) {
      await element.video.requestFullscreen();
    } else if (element.video.webkitEnterFullscreen) {
      await element.video.webkitEnterFullscreen();
    }

    setTimeout(() => {
      element.video.play();
    }, 200);
    
  }

  function closeMobileVideo() {

    element.container.classList.remove('active');
    element.video.pause();

    videoPlayBtn.scrollIntoView({ behavior: "instant", block: "center" });

  }

  function openVideoBlock() {

    if (element.scrollTopBtn) element.scrollTopBtn.style.display = 'none';

    if (smoothWrapper) {
      smoothWrapper.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px';
    } else {
      document.body.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px';
    }

    document.body.style.overflow = 'hidden';

    element.container.addEventListener('transitionend', (event) => element.container.focus(), { once: true });

    element.container.classList.add('active');
    element.overlay.classList.add('active');

    element.container.focus();
    
    clearTimeout(element.timer);

    element.timer = setTimeout(() => {
      element.video.play();
    }, 200);
    
  }

  function closeVideoBlock() {

    if (smoothWrapper) {
      smoothWrapper.style.paddingRight = '';
    } else {
      document.body.style.paddingRight = '';
    }

    document.body.style.overflow = '';
    
    if (element.scrollTopBtn) element.scrollTopBtn.style.display = '';

    element.container.classList.remove('active');
    element.overlay.classList.remove('active');

    clearTimeout(element.timer);
    element.video.pause();

  }

  function createVideoBlock() {

    let block = document.createElement('div');
    block.classList.add('video-block');

    let content = `
      <button class="video-block__close">&times;</button>
      <video class="video-block__video" playsinline controls preload="none" src="./videos/process-video.mp4" type="video/mp4">
    `;

    let overlay = document.createElement('div');
    overlay.classList.add('video-overlay');

    block.insertAdjacentHTML('beforeend', content);
    document.body.append(block, overlay);

  }

  function defineElements() {

    element.container = document.querySelector('.video-block');
    element.video = element.container.querySelector('.video-block__video');
    element.closeBtn = element.container.querySelector('.video-block__close');
    element.overlay = document.querySelector('.video-overlay');
    element.scrollTopBtn = document.querySelector('.scroll-top');

    element.container.tabIndex = -1;

  }

  function preloadVideo() {

    let observer = new IntersectionObserver((list, obs) => {

      list.forEach((item) => {

        if (item.isIntersecting) {

          element.video.preload = 'auto';
          obs.disconnect();

        }

      })

    }, { root: null, threshold: 1 });

    observer.observe(videoPlayBtn);

  }

}

function likeCounter() {

  let btns = Array.from(document.querySelectorAll('[data-like]'));

  if (!btns.length) return;

  document.addEventListener('click', (event) => {

    let likeBtn = event.target.closest('[data-like]');

    if (likeBtn) handleCount(likeBtn);

  });

  function handleCount(btn) {

    let countArea = btn.querySelector('span');

    if (btn.matches('.active')) {
      btn.classList.remove('active');
      btn._likeCount--;
    } else {
      btn.classList.add('active');
      btn._likeCount = btn._likeCount ? btn._likeCount++ : 1;
    }

    countArea.textContent = btn._likeCount === 0 ? '' : btn._likeCount;

  }

}

function shareHandler() {

  let elements = Array.from(document.querySelectorAll('.share-btn'));

  if (!elements.length) return;

  document.addEventListener('click', (event) => {

    let trigger = event.target.closest('.share-btn__trigger');
    let emptySpace = !event.target.closest('.share-btn');
    let link = event.target.closest('.share-btn__link');

    if (trigger) openCloseContent(trigger);
    if (emptySpace || link) closeAllContents();

  });

  function openCloseContent(btn) {

    let main = btn.closest('.share-btn');

    if (main.matches('.active')) {
      main.classList.remove('active');
    } else {
      closeAllContents();
      main.classList.add('active');
    }

  }

  function closeAllContents() {
    elements.forEach((element) => element.classList.remove('active'));
  }

}

function blogpostMobile() {

  let container = document.querySelector('.blogpost__body');
  let cards = Array.from(document.querySelectorAll('.blogpost .news-card'));
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!media || !container || !cards.length) return;

  createSlider();
  initSlider();

  function createSlider() {

    container.classList.remove('blogpost__body');
    container.classList.add('swiper', 'blogpost__slider');

    let wrapper = document.createElement('div');
    wrapper.classList.add('swiper-wrapper');

    cards.forEach((card) => {

      let slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.append(card);
      wrapper.append(slide);

    });

    container.append(wrapper);

  }

  function initSlider() {

    new Swiper(container, {
      slidesPerView: 2,
      spaceBetween: 20,
      speed: 800,
      loop: true,

      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },

      breakpoints: {

        576: {
          slidesPerView: 2,
          spaceBetween: 20,
        },

        420: {
          slidesPerView: 1.3,
          spaceBetween: 20,
        },

        1: {
          slidesPerView: 1.15,
          spaceBetween: 10,
        },

      }

    });

  }

}

function runGSAPAnimation() {

  let media = window.matchMedia('(max-width: 831px)').matches;

  if (media || (typeof GSAPanimation === 'undefined')) {
    let animElements = Array.from(document.querySelectorAll('[data-anim]'));
    animElements.forEach((item) => item.removeAttribute('data-anim'));
    return;
  }
  
  window.addEventListener('load', (event) => GSAPanimation());
}

function GSAPanimation() {

  GSAPController();

  if (sessionStorage.animDisabled === 'true') {
    removeDataAnim();
    return;
  }

  let media = window.matchMedia('(max-width: 768px)').matches;

  if (media) {
    removeDataAnim();
    return;
  } 

  try {
    gsap, ScrollTrigger, ScrollSmoother
  } catch {
    removeDataAnim();
    return;
  }

  setStaticHeight();
  updateTeamBlockHeight();

  let shopAnim, smoother;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  if (ScrollTrigger.isTouch !== 1) {

    smoother = ScrollSmoother.create({ 
      wrapper: '.smooth-scroll-wrapper',
      content: '.smooth-scroll-page',
      smooth: 0.8,
    });

  }

  window._GSAP = true;

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

  function GSAPController() {
    
    window.anim = function() {

      if (sessionStorage.animDisabled === 'true') {
        sessionStorage.animDisabled = 'false';
      } else {
        sessionStorage.animDisabled = 'true';
      }

      window.location.reload();
      
    }

  }

  function updateTeamBlockHeight() {

    let button = document.querySelector('.chefs .outline-btn');
    let timeId;

    button.addEventListener('click', (event) => {

      clearTimeout(timeId);

      timeId = setTimeout(() => {
        refreshAll();
      }, 500);

    })

  }

  function refreshAll() {
    ScrollTrigger.refresh();
    if (smoother) smoother.refresh();
  }

  function removeDataAnim() {
    let animElements = Array.from(document.querySelectorAll('[data-anim]'));
    animElements.forEach((item) => item.removeAttribute('data-anim'));
  }

  function anim(selector, from, to, scrollTrig = {}) {

    let scrollConfig = {
      trigger: selector,
      toggleActions: "play reset play reset",
      ...scrollTrig,
    }

    const anim = gsap.fromTo(
      
      selector,

      {
        opacity: 0,
        visibility: 'hidden',
        ...from
      },

      {
        scrollTrigger: !scrollTrig ? null : scrollConfig,
        opacity: 1,
        visibility: 'visible',

        onStart: function()  {
          let elements = this._targets;
          elements.forEach((element) => {
            element.style.transition = 'none';
            element.style.pointerEvents = 'none';
          });
        },

        onComplete: function() { 
          let elements = this._targets;
          elements.forEach((element) => {
            element.removeAttribute('data-anim');
            element.style.cssText = '';
            element.style.pointerEvents = '';
          });
          if (this._targets[0]?.matches('.navbar')) this.kill();

          let staticHeightEl = this._targets[0].closest('[data-static-height]');
          if (staticHeightEl) {
            staticHeightEl.style.height = '';
            staticHeightEl.removeAttribute('data-static-height');
          }
        },

        ...to
      }

    )

    return anim;

  }

  function tl(selector, scrollTrig = {}) {

    let timeline = gsap.timeline({
      scrollTrigger: {
        trigger: selector,
        toggleActions: "play reset play reset",
        ...scrollTrig,
      }
    });

    return timeline;

  }

  function setStaticHeight() {

    let el1 = document.querySelector('.choose-us__img-tabs');

    el1.style.height = 722.48 + 'px';

    [el1].forEach((item) => item.setAttribute('data-static-height', ''));

  }

  // Header

  tl('.header')
    
    .add( anim('.header .food-gravity__img--main', { scale: 0.3, rotate: 240 }, { scale: 1, rotate: 0, delay: 0.1, duration: 0.7 }, false) )
    .add( anim('.header .food-gravity__img--leaf', { x: -50, rotate: 30 }, { x: 0, rotate: 0, duration: 0.5 }, false), '-=0.1' )
    .add( anim('.header .food-gravity__circle', { scale: 0.1 }, { scale: 1, duration: 0.5 }, false), '-=0.45' )

    .add( anim('.header .food-gravity__img--mint', { scale: 0.1 }, { scale: 1, duration: 0.5 }, false) )
    .add( anim('.header .food-gravity__img--wood', { scale: 0.1 }, { scale: 1, duration: 0.5 }, false), '-=0.3' )
    .add( anim('.header .food-gravity__img--branch', { scale: 0.1 }, { scale: 1, duration: 0.5 }, false), '-=0.3' )
    .add( anim('.header .food-gravity__img--leaf-s', { scale: 0.1 }, { scale: 1, duration: 0.5 }, false), '-=0.3' )

    .add( anim('.navbar', { x: 300 }, { x: 0, duration: 0.6 }, false), '-=2' )

    .add( anim('.header .heading', { y: -100 }, { y: 0, duration: 0.6 }, false), '-=2' )
    .add( anim('.header .btn-circle', { y: 100 }, { y: 0, duration: 0.6 }, false), '-=2' )
    .add( anim('.header .soc-line', { x: -150 }, { x: 0, duration: 0.6 }, false), '-=2' );

  // About us

  anim('.index-about .heading', { x: -250 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 65%' });
  anim('.index-about .list', { x: -200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 70%' });
  anim('.index-about .btn-circle', { x: -200 }, { x: 0 }, { scrub: true, start: 'top 105%', end: 'bottom 85%' });
  anim('.index-about__pic', { x: 200 }, { x: 0, stagger: 0.11, }, { scrub: true, start: 'top 110%', end: 'bottom 60%' });

  // Food category

  anim('.food-cat .heading', { x: -250 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 70%' });
  anim('.food-cat .cm-slider', { x: 250 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 90%' });

  // Choose us

  anim('.choose-us .img-tabs__pic', { scale: 0.1 }, { scale: 1, stagger: 0.1, }, { scrub: true, start: 'top 103%', end: 'bottom 50%' });
  anim('.choose-us .heading', { x: 200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 65%' });
  anim('.choose-us .icon-text', { scale: 0.1 }, { scale: 1, stagger: 0.1, }, { scrub: true, start: 'top 100%', end: 'bottom 70%' });
  anim('.choose-us .experience', { y: 150 }, { y: 0 }, { scrub: true, start: 'top 120%', end: 'bottom 100%' });

  // Stats

  tl('.stats', { scrub: true, start: 'top 115%', end: 'bottom 80%' })
    .add( anim('.stats', { x: -300 }, { x: 0 }, false) )
    .add( anim('.stats .stat', { scale: 0.1 }, { scale: 1, stagger: 0.1 }, false), '-=0.25' );

  // Demo menu

  anim('.demo-menu .heading', { scale: 0.1 }, { scale: 1 }, { scrub: true, start: 'top 105%', end: 'bottom 70%' });
  anim('.demo-menu .menu-tabs', { scale: 0.1 }, { scale: 1 }, { scrub: true, start: 'top 105%', end: 'bottom 70%' });

  // Chefs

  anim('.chefs .heading', { x: 200 }, { x: 0 }, { scrub: true, start: 'top 105%', end: 'bottom 70%' });

  // Testimonials

  anim('.testimonials .heading', { x: 200 }, { x: 0 }, { scrub: true, start: 'top 105%', end: 'bottom 70%' });
  anim('.testimonials .testim-slider', { x: -200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 95%' });

  // Process

  anim('.process', { x: -300 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 100%' });

  // Blogpost

  anim('.blogpost .heading', { scale: 0.1 }, { scale: 1 }, { scrub: true, start: 'top 105%', end: 'bottom 70%' });
  anim('.blogpost .news-card:first-child', { x: -200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'center 70%' });
  anim('.blogpost .news-card:nth-child(2)', { y: 200 }, { y: 0 }, { scrub: true, start: 'top 115%', end: 'center 90%' });
  anim('.blogpost .news-card:last-child', { x: 200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'center 70%' });

  // Footer

  anim('.support .heading', { x: -200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 80%' });
  anim('.support .email', { x: 200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'bottom 80%' });

  anim('.footer-nav .about-us', { x: -200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'center 80%' });
  anim('.footer-nav .f-posts', { x: 200 }, { x: 0 }, { scrub: true, start: 'top 110%', end: 'center 80%' });
  anim('.footer-nav .nav-list', { y: 200 }, { y: 0 }, { scrub: true, start: 'top 120%', end: 'center 100%' });

  anim('.footer-nav .address', { x: 300 }, { x: 0 }, { scrub: true, start: 'top 100%', end: 'top 89%' });

}


replaceHeaderImgMobile();
replaceAboutImgMobile();
replaceChooseUsImgMobile();
chefsMobile();
menuTabsHandler();
linkImitator(links);
showMoreHandler();
videoPlayer();
likeCounter();
shareHandler();
blogpostMobile();
slidersAutoplayViewportController();
runGSAPAnimation();