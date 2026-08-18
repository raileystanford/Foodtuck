import {
  UpdatePageTitle,
  LazyLoad,
} from "./modules/modules.js";

import { cart_titles } from './modules/dictionary.js';


// Plugins

new UpdatePageTitle({
  dictionary: cart_titles,
});


// Functions

function cartCalculatioHandler() {

  let cart = document.querySelector('.cart');
  let summary = document.querySelector('.cart-summary');

  if (!cart || !summary) return;

  let rows = Array.from(document.querySelectorAll('.cart__row:not(.cart__row--head)'));

  mobileView();

  let numberFormatter = new Intl.NumberFormat('ru');
  let isDiscountActivated = false;

  defineElements();
  calculateSummary();

  document.addEventListener('click', (event) => {

    let plus = event.target.closest('.mini-counter__btn--plus');
    let minus = event.target.closest('.mini-counter__btn--minus');
    let remove = event.target.closest('.cart__remove');
    let couponBtn = event.target.closest('.input-area__button');

    if (plus || minus) {
      counterController(event.target);
    } else if (remove) {
      removeItemFromCart(event.target);
    } else if (couponBtn) {
      couponValidator(event.target);
    }

  });

  document.addEventListener('input', (event) => {

    let counter = event.target.closest('.mini-counter');
    let couponInput = event.target.matches('.input-area__input');

    if (counter) {

      inputValueController(event.target);
      calculateItemTotal(counter);
      calculateSummary();

    } else if (couponInput) {

      let block = event.target.closest('.input-area');
      let warning = block.querySelector('.input-area__warning');
      hideCouponFieldWarning(warning, event.target);

    }
    
  });

  document.addEventListener('focusin', (event) => {
    
    miniCounterFocusState(event.target, 'focus');

    event.target.addEventListener('focusout', (event) => miniCounterFocusState(event.target));

  });

  function miniCounterFocusState(elem, state) {

    let counter = elem.closest('.mini-counter');

    rows.forEach((row) => row._counter.classList.remove('active'));

    if (counter && (state === 'focus')) counter.classList.add('active');

  }

  function mobileView() {

    let media = window.matchMedia('(max-width: 768px)').matches;

    if (!media) return;

    let mobCart = document.createElement('div');
    mobCart.classList.add('cart');

    let lines = [];

    rows.forEach((row) => {

      let line = document.createElement('div');
      line.classList.add('cart__row');

      let item = row.querySelector('.cart__item');
      let itemPrice = row.querySelector('.cart__item-price');
      let counter = row.querySelector('.mini-counter');
      let itemTotal = row.querySelector('.cart__total');
      let cartRemove = row.querySelector('.cart__remove');

      line.append(item, itemPrice, counter, itemTotal, cartRemove);
      lines.push(line);

    });

    rows = lines;
    mobCart.append(...lines);
    cart.replaceWith(mobCart);
    cart = mobCart;

  }

  function removeItemFromCart(elem) {

    let row = elem.closest('.cart__row');

    row.remove();
    rows = Array.from(document.querySelectorAll('.cart__row:not(.cart__row--head)'));

    calculateSummary();

  }

  function couponValidator(elem) {

    let area = elem.closest('.cart-summary__input-area');
    let input = area.querySelector('.input-area__input');
    let btn = area.querySelector('.input-area__button');
    let warning = area.querySelector('.input-area__warning');

    let value = input.value.trim();
    let lengthOk = value.length >= 3;
    let latinOk = value.match(/^[a-zA-Z0-9]+$/);

    if (lengthOk && latinOk) {
      successCouponHandler(input, warning, btn);
    } else if (!value) {
      showCouponFieldWarning('Enter your coupon code', warning, input);
    } else if (!latinOk) {
      showCouponFieldWarning('Enter latin symbols and digits', warning, input);
    } else if (!lengthOk) {
      showCouponFieldWarning('Enter minimum 3 symbols', warning, input);
    } 

  }

  function showCouponFieldWarning(text, warning, input) {

    input.classList.add('invalid');
    warning.classList.add('active');
    warning.textContent = text;
    warning.style.height = warning.scrollHeight + 'px';

  }

  function hideCouponFieldWarning(warning, input) {

    input.classList.remove('invalid');
    warning.classList.remove('active');
    warning.textContent = '';
    warning.style.height = '0px';

  }

  function successCouponHandler(input, warning, btn) {

    let lastSumLine = summary.querySelector('.cart-summary__line--total');
    let couponLine = `<div class="cart-summary__line">
                        <span class="cart-summary__service list-text">Coupon Discount</span>
                        <span class="cart-summary__price cart-summary__price--coupon list-text">15.00</span>
                      </div>`;

    input.disabled = true;
    btn.classList.add('active');
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = `Coupon "<span class="input-area__bold">${input.value}"</span> accepted!`;
      input.value = '';
    }, 100);

    lastSumLine.insertAdjacentHTML('beforebegin', couponLine);
    isDiscountActivated = true;

    hideCouponFieldWarning(warning, input);
    calculateSummary();

  }

  function counterController(elem) {

    let counter = elem.closest('.mini-counter');
    let btn = elem.closest('.mini-counter__btn');
    let input = counter.querySelector('.mini-counter__input');

    let type = btn.matches('.mini-counter__btn--plus') ? 'plus' : 'minus';

    if (type === 'plus') {

      input.value = ++input.value;

    } else if (type === 'minus') {

      input.value = --input.value;

    }

    inputValueController(input);
    calculateItemTotal(counter);
    calculateSummary();

  }

  function calculateItemTotal(counter) {

    let price = counter._row._price;
    let totalEl = counter._row._totalEl;
    let counterValue = +counter.querySelector('.mini-counter__input').value;

    totalEl.textContent = numberFormatter.format(counterValue * price) + '.00';
    counter._row._total = counterValue * price;

  }

  function inputValueController(input) {

    let counter = input.closest('.mini-counter');
    let plusBtn = counter.querySelector('.mini-counter__btn--plus');
    let minusBtn = counter.querySelector('.mini-counter__btn--minus');

    let value = +input.value;

    if (value < 2) {
      input.value = 1;
      minusBtn.disabled = true;
    }

    if (value > 1) {
      minusBtn.disabled = false;
    }

    if (value > 998) {
      input.value = 999;
      plusBtn.disabled = true;
    }

    if (value < 999) {
      plusBtn.disabled = false;
    }

  }

  function emptyCartState() {

    let cartEmpty = document.querySelector('.cart-empty');
    let input = document.querySelector('.input-area__input');
    let warning = document.querySelector('.input-area__warning');

    cart.remove();
    summary.classList.add('active');
    cartEmpty.classList.add('active');
    hideCouponFieldWarning(warning, input);

  }

  function calculateSummary() {

    let subtotal = summary.querySelector('.cart-summary__price--subtotal');
    let total = summary.querySelector('.cart-summary__price--total');
    let shipping = summary.querySelector('.cart-summary__price--shipping');
    let coupon = summary.querySelector('.cart-summary__price--coupon');

    let shippingValue = 10;
    let discountValue = 15;

    if (!rows.length) {
      shippingValue = 0;
      shipping.textContent = '0.00';
      if (coupon) coupon.textContent = '0.00';
      emptyCartState();
    }
    
    let itemsTotal = rows.reduce((acc, item) => acc += item._total, 0);
    let summaryTotal = isDiscountActivated && rows.length ? itemsTotal + shippingValue - discountValue : itemsTotal + shippingValue; 
    
    subtotal.textContent = numberFormatter.format(itemsTotal) + '.00';
    total.textContent = numberFormatter.format(summaryTotal) + '.00';

  } 

  function defineElements() {

    rows.forEach((row) => {

      let counter = row.querySelector('.mini-counter');
      counter._row = row;
      
      row._price = parseFloat(row.querySelector('.cart__item-price').textContent);
      row._totalEl = row.querySelector('.cart__total');
      row._total = parseFloat(row._totalEl.textContent);
      row._counter = counter;

    });

  } 

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


pageScrollSmoother();
cartCalculatioHandler();