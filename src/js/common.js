import { 
  FormValidator,
  BurgerMenu,
  ScrollToTop,
} from "./modules/modules.js";

removeMobileBlocks();


// Plugins

new FormValidator({
  resetWhenChange: true,

  textInput: {
    onlyLatin: true,
    minLength: 3,
    noNumbers: true,
  },

});

new BurgerMenu({
  activationBreakpoint: 768,
  closeByClickOutOfMenu: false,
  exceptBtns: '.search .search__submit',
  openCallback: function(info) {
    info.button.setAttribute('data-burger-close', '');
    info.button.removeAttribute('data-burger-open', '');
  },
  closeCallback: function(info) {
    info.button.setAttribute('data-burger-open', '');
    info.button.removeAttribute('data-burger-close', '');
    let form = document.querySelector('.search');
    formValidatorEventsHandler.clearForm(form);
  },
});

new ScrollToTop({
  default: 1000,
});


// Functions

function focusStateFix(...selectors) {

  let initSelectors = [ 'a', 'button' ];
  if (selectors) initSelectors.push(...selectors);

  document.addEventListener('pointerdown', (event) => {

    initSelectors.forEach((selector) => {

      let isValid = event.target.closest(selector);
      if (isValid) isValid.addEventListener('pointerleave', (event) => event.currentTarget.blur(), { once: true });

    });

  });

}

function searchShowHide() {

  let search = document.querySelector('.search');
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!search || media) return;

  let input = search.querySelector('.search__input');
  let submit = search.querySelector('.search__submit');
  let warning = search.querySelector('.search__warning');

  input.addEventListener('focus', (event) => {

    search.classList.add('focused');

    input.addEventListener('blur', (event) => {
      search.classList.remove('focused');
      warning.classList.remove('active');
      input.classList.remove('invalid');
    }, { once: true });

  });

  submit.addEventListener('pointerenter', (event) => {

    search.classList.add('active');

    search.addEventListener('pointerleave', (event) => {
      search.classList.remove('active');
      if (!input.matches(':focus')) {
        warning.classList.remove('active');
        input.classList.remove('invalid');
      } 
    }, { once: true });

  });

}

function formValidatorEventsHandler() {

  let form = document.querySelector('[data-form]');
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!form) return;

  defineWarnFields();

  document.addEventListener('formvalid', (event) => {

    let searchBar = event.target.matches('.search');
    let emailBar = event.target.matches('.email');
    let shopSearch = event.target.matches('.market__sidebar');
   
    if (searchBar) {

      formValidatorEventsHandler.clearForm(event.target);
      event.target.classList.remove('active', 'focused');

    } else if (emailBar) {

      let input = event.target.querySelector('input[type="email"]');
      let btn = event.target.querySelector('button[type="submit"]');

      formValidatorEventsHandler.clearForm(event.target);
      event.target.classList.add('done');
      input.setAttribute('disabled', '');
      btn.setAttribute('disabled', '');
      setTimeout(() => btn.textContent = 'SUBSCRIBED', 60);
      
    } else if (shopSearch) {

      let input = event.target.querySelector('.shop-search__input');
      input._lastValue = input.value;
      event.target.dispatchEvent(new CustomEvent('searchvalid', { bubbles: true, cancelable: true, composed: true }));
      formValidatorEventsHandler.clearForm(event.target);

    }

    if (media && typeof BurgerMenu !== 'undefined') {
      BurgerMenu.prototype.closeBurgerMenu();
    }

  })

  document.addEventListener('invalidinput', (event) => {
    
    event.detail.forEach((item) => showWarning(item));

  });

  document.addEventListener('resetinput', (event) => {

    let warning = event.detail.input._warning;
    warning.classList.remove('active');
    warning.style.height = '';

  })

  function showWarning(data) {
    
    let warnField = data.input._warning;
    let text = getWarningText(data.input.type, data.msg);

    if (text) {
      warnField.textContent = text;
      warnField.style.height = warnField.scrollHeight + 'px';
    }
    
    warnField.classList.add('active');

  }

  function getWarningText(type, msg) {

    let text;

    if (type === 'search' || type === 'text') {

      if (msg === 'Empty field') {
        text = 'Enter search query';
      } else if (msg === 'Only latins allowed') {
        text = 'Use only latin symbols';
      } else if (msg === 'Text lower than minimum length') {
        text = 'Enter at least 3 symbols';
      } else if (msg === 'Digits not allowed' || msg === 'Forbidden symbol') {
        text = 'Only letters allowed';
      }

    } else if (type === 'email') {

      if (msg === 'Empty field') {
        text = 'Enter your email address';
      } else if (msg === 'Wrong email format') {
        text = 'Wrong email format';
      }

    }

    return text;

  }

  function defineWarnFields() {

    let inputs = Array.from(document.querySelectorAll('[data-validate]'));

    inputs.forEach((input) => {

      let warnElement = document.querySelector(`[data-warn="${input.id}"]`);
      if (warnElement) input._warning = warnElement;

    });

  }

  formValidatorEventsHandler.clearForm = function(form) {

    Array.from(form.elements).forEach((item) => {

      item.classList.remove('invalid', 'valid');

      if (item._warning) {
        item._warning.classList.remove('active');
        item._warning.style.height = '';
        item._warning.textContent = '';
      }

      if (item.type === 'text' || item.type === 'search' || item.type === 'email') {

        item.value = '';

      } else if (item.type === 'tel') {

        if (item._mask) {
          item._mask.value = '';
        } else {
          item.value = '';
        }

      } else if (item.type === 'checkbox') {

        item.checked = false;

      }

    });

  }

}

function removeMobileBlocks() {

  let mobNavbar = document.querySelector('.mob-navbar');
  let mobMenu = document.querySelector('.mob-menu');
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (media) return;

  if (mobNavbar) mobNavbar.remove();
  if (mobMenu) mobMenu.remove();

}

function changeEmailSubmitText() {

  let media = window.matchMedia('(max-width: 420px)').matches;
  let btn = document.querySelector('.email .email__button');

  if (!btn || !media) return;

  btn.textContent = 'Subscribe';

}

function fixedNavbarState() {

  let desktopNavbar = document.querySelector('.navbar');
  let mobileNavbar = document.querySelector('.mob-navbar');
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!media && !desktopNavbar) return;
  if (media && !mobileNavbar) return;

  window.addEventListener('scroll', (event) => {

    if (window.pageYOffset > 0) {

      if (!media) {
        desktopNavbar.classList.add('active');
      } else {
        mobileNavbar.classList.add('active');
      }

    } else {

      if (!media) {
        desktopNavbar.classList.remove('active');
      } else {
        mobileNavbar.classList.remove('active');
      }

    }

  });

}


focusStateFix('.testim-slider .swiper-pagination-bullet');
searchShowHide();
formValidatorEventsHandler();
changeEmailSubmitText();
fixedNavbarState();