class FormValidator {

  constructor(params) {

    this.forms = Array.from(document.querySelectorAll('[data-form]'));

    if (this.forms.length === 0) return;

    this.params = params ?? {};
    this.resetWhenChange = this.params.resetWhenChange ?? true;
    this.realTimeCheck = this.params.realTimeCheck;
    this.invalids = [];

    this.ownMethodsBinder();
    this.updateFormFields();
    this.initPhoneMask();
    this.setEventListeners();

  }

  setEventListeners() {

    document.addEventListener('submit', this.submitHandler);

    if (this.resetWhenChange || this.realTimeCheck) {
      document.addEventListener('input', this.inputHandler);
    }

  }

  submitHandler(event) {

    this.form = event.target;

    if (!this.form.closest('[data-form]')) return;

    event.preventDefault();

    this.form._elements.forEach((field) => {

      field.classList.remove('valid');

      if (field.type === 'text' || field.tagName === 'TEXTAREA' || field.type === 'search') {
        this.validateTextField(field);
      } else if (field.type === 'email') {
        this.validateEmailField(field);
      } else if (field.type === 'tel') {
        this.validatePhoneField(field);
      } else if (field.type === 'checkbox') {
        this.validateSoloCheckbox(field);
      } else if (field.tagName !== 'INPUT') {
        this.validateGroupedCheckboxRadios(field);
      }

    });

    let validInputs = this.form.querySelectorAll('.valid');

    if (validInputs.length === this.form._elements.length) {
      this.validEvent();
      // this.form.submit();
    } else {
      this.invalidEvent();
    }

  }

  inputHandler(event) {

    let input = event.target;

    if (!input.matches('[data-validate]')) return;

    input.classList.remove('valid');

    if (this.resetWhenChange) {
      
      if (input.matches('.invalid')) {
        input.classList.remove('invalid');
        this.resetEvent(input);
      }

    }

    if (this.realTimeCheck) {

      this.form = input.closest('[data-form]');

      if (input.type === 'text' || input.tagName === 'TEXTAREA' || input.type === 'search') {
        this.validateTextField(input);
      } else if (input.type === 'email') {
        this.validateEmailField(input);
      } else if (input.type === 'tel') {
        this.validatePhoneField(input);
      }

      if (this.invalids.length > 0) this.invalidEvent();

    }
 
  }

  validEvent() {

    let event = new CustomEvent('formvalid', {

      bubbles: true,
      cancelable: true,
      composed: true,

    });

    this.form.dispatchEvent(event);

  }

  invalidEvent() {

    let event = new CustomEvent('invalidinput', {

      bubbles: true,
      cancelable: true,
      composed: true,
      detail: [...this.invalids],

    });

    this.form.dispatchEvent(event);
    this.invalids.length = 0;

  }

  resetEvent(input) {

    let event = new CustomEvent('resetinput', {

      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { input },

    });

    if (this.form) this.form.dispatchEvent(event);

  }

  validationError(input, msg) {

    input.classList.add('invalid');
    this.invalids.push({ input, msg });

  }

  validateTextField(input) {

    let opt = this.params.textInput ?? {};
    let value = input.value.trim();

    let isEmpty = value.length === 0;
    let isLatinText = !/[а-я]/i.test(value);
    let isCyrylicText = !/[a-z]/i.test(value);
    let isMinLengthDone = value.length >= (opt.minLength ?? 1);
    let isNotContainNumbers = !/\d+/.test(value);
    let isContainForbiddenSymbols;

    if (opt.forbiddenSymbols !== false) {
      isContainForbiddenSymbols = (opt.forbiddenSymbols ?? /[\!@\#\$\%\~\^\&\*\(\)_\=\+\{\}\[\];:'"\>\<,\./?\\\|`\-]/).test(value);
    } else {
      isContainForbiddenSymbols = false;
    }

    if (isEmpty) {
      this.validationError(input, 'Empty field');
    } else if (!isLatinText && opt.onlyLatin) {
      this.validationError(input, 'Only latins allowed');
    } else if (!isCyrylicText && opt.onlyCyrylic) {
      this.validationError(input, 'Only cyrylic allowed');
    } else if (!isNotContainNumbers && opt.noNumbers) {
      this.validationError(input, 'Digits not allowed');
    } else if (isContainForbiddenSymbols) {
      this.validationError(input, 'Forbidden symbol');
    } else if (!isMinLengthDone) {
      this.validationError(input, 'Text lower than minimum length');
    } else {
      input.classList.remove('invalid');
      input.classList.add('valid');
    }

  }

  validateEmailField(input) {

    let opt = this.params.emailInput ?? {};
    let value = input.value.trim();
    let regExp = /^[a-z][a-z0-9._-]*(?<![._-])@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

    let isEmpty = value.length === 0;
    let isMultipleAccepted = input.multiple;
    let isMultiple = (value.match(/@/g) ?? []).length > 1;
    let isOnlyLatinSymbols = !/[а-я]/i.test(value);
    let isCorrectFormat, isAllowedDomain;

    if (isMultipleAccepted) {

      let correctCount = 0;

      let emails = value.split(' ');
    
      emails.forEach((email) => {
        if (regExp.test(email)) correctCount++;
      });

      if (correctCount === emails.length) {
        isCorrectFormat = true;
      } else {
        isCorrectFormat = false;
      }

    } else {

      isCorrectFormat = regExp.test(value);

    }

    if (opt.allowedDomains) {

      isAllowedDomain = opt.allowedDomains.some((item) => value.includes(item));

    } else {

      isAllowedDomain = true;

    }

    if (isEmpty) {
      this.validationError(input, 'Empty field');
    } else if (!isOnlyLatinSymbols) {
      this.validationError(input, 'Cyrylic symbols forbidden');
    } else if (!isMultipleAccepted && isMultiple) {
      this.validationError(input, 'More than one email');
    } else if (!isCorrectFormat) {
      this.validationError(input, 'Wrong email format');
    } else if (!isAllowedDomain) {
      this.validationError(input, 'Wrong mail service');
    } else {
      input.classList.remove('invalid');
      input.classList.add('valid');
    }

  }

  validatePhoneField(input) {

    if (this.isPhoneMaskExist) {

      let value = input._mask.unmaskedValue;
      let mask = input._mask.masked.mask;
      let maskLength = mask.match(/\d/g).length;
      let codeLength = mask.match(/\{\d+\}/)[0].length - 2;

      let isFullNumber = value.length === maskLength;
      let isEmpty = value.length === codeLength;

      if (isEmpty) {
        this.validationError(input, 'Empty field');
      } else if (!isFullNumber) {
        this.validationError(input, 'Enter full number');
      } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
      }
      
    } else {

      let value = input.value.trim();
      value = value.includes('+') ? value.replace(/\+/g, '') : value;
      let opt = this.params.phoneInput ?? {};

      let isEmpty = value.length === 0;
      let isMultiple = input.multiple;
      let isContainForbiddenSymbols = /[а-яa-z!@#$%^&*\(\)_=\-\|\}\{'";:\/?\.\\>,<`~]/i.test(value);
      let isFullLength = opt.length ? value.length === opt.length : true;
      let isOverNumbered = value.length > opt.length;

      let isAllowedCountry, isCorrectFormat;

      if (opt.code) {

        if (isMultiple) {

          let phones = value.split(' ');
          let validCount = 0;

          phones.forEach((phone) => {

            if (phone.startsWith(opt.code)) validCount++;

          });

          isAllowedCountry = validCount === phones.length;

        } else {

          isAllowedCountry = value.startsWith(opt.code);

        }

      } else {

        isAllowedCountry = true;

      }

      if (isEmpty) {
        this.validationError(input, 'Empty field');
      } else if (isContainForbiddenSymbols) {
        this.validationError(input, 'Forbidden symbol');
      } else if (!isAllowedCountry) {
        this.validationError(input, 'Wrong number country');
      } else if (isOverNumbered) {
        this.validationError(input, 'Value bigger than length');
      } else if (!isFullLength) {
        this.validationError(input, 'Enter full number');
      }  else {
        input.classList.remove('invalid');
        input.classList.add('valid');
      }

    }

  }

  validateSoloCheckbox(input) {

    let isChecked = input.checked;

    if (!isChecked) {
      this.validationError(input, 'Checkbox not selected');
    } else {
      input.classList.remove('invalid');
      input.classList.add('valid');
    }

  }

  validateGroupedCheckboxRadios(element) {

    let inputs = Array.from(element.querySelectorAll('[type="checkbox"], [type="radio"]'));
    let isSomeChecked = inputs.some((input) => input.checked);

    if (!isSomeChecked) {
      this.validationError(element, 'Select at least one element');
    } else {
      element.classList.remove('invalid');
      element.classList.add('valid');
    }

  }

  async initPhoneMask() {

    if (!this.params.phoneMask) return;

    let inputs = Array.from(document.querySelectorAll('[data-form] input[type="tel"][data-validate]'));

    if (inputs.length === 0) return;

    let maskModule = await import('https://unpkg.com/imask?module');
    const IMask = maskModule.default ?? maskModule.IMask ?? window.IMask;

    inputs.forEach((input) => {

      let mask = IMask(input, this.params.phoneMask);
      input._mask = mask;

    });

    this.isPhoneMaskExist = true;

  }

  updateFormFields() {

    this.forms.forEach((form) => {

      let inputs = Array.from(form.querySelectorAll('[data-validate]'));

      form._validator = this;
      form._elements = inputs;
      
      inputs.forEach((input) => input._validator = this);

    });

  }

}

class Parallax {
    
  constructor(params) {

    this.params = params ?? {};
    this.off = this.params.off ?? 768;
    this.parallaxElements = Array.from(document.querySelectorAll('[data-parallax]'));
    let media = window.matchMedia(`(max-width: ${this.off}px)`).matches;

    if (this.parallaxElements.length > 0 && !media) {

      this.readyElements = [];
      this.targets = new Map();
      this.positions = new Map();

      this.ownMethodsBinder();
      this.writeSettingsInElements();
      this.setIntersectionObserver();
      this.setEventListeners();

      requestAnimationFrame(this.animate);

    }
  }

  writeSettingsInElements() {

    this.parallaxElements.forEach((element) => {

      let values = element.dataset.parallax.split('/');

      element._depth = +values[0] || 0.06;
      element._ease = +values[1] || 0.09;
      element._delay = +values[2] || 0;
      element._type = values[3] === 'invert' ? -1 : 1;
      element._delayOnce = values[4] === 'always' ? false : true;
      element._resetOnExit = values[5] === 'false' ? false : true;
      
      element._isReady = false;
      element._wasActivated = false;
      element._inView = false; 

    });

  }

  setEventListeners() {
    window.addEventListener('mousemove', this.workOperator);
  }

  workOperator(event) {

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    this.readyElements.forEach((el) => {

      const depth = el._depth;
      const invert = el._type;

      let targetX = invert * (mouseX - centerX) * depth;
      let targetY = invert * (mouseY - centerY) * depth;

      const container = el.closest('[data-parallax-area]');
      if (container) {

        if (!el._initialOffset) {

          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();

          el._initialOffset = {
            left: elRect.left - containerRect.left,
            top: elRect.top - containerRect.top
          };
        }

        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const init = el._initialOffset;

        const maxX = containerRect.width - elRect.width - init.left;
        const maxY = containerRect.height - elRect.height - init.top;
        const minX = -init.left;
        const minY = -init.top;

        targetX = Math.max(minX, Math.min(targetX, maxX));
        targetY = Math.max(minY, Math.min(targetY, maxY));

      }

      this.targets.set(el, { x: targetX, y: targetY });

      if (!this.positions.has(el)) {
        this.positions.set(el, { x: 0, y: 0 });
      }

    });
  }

  animate() {

    this.readyElements.forEach((el) => {

      let pos = this.positions.get(el) || { x: 0, y: 0 };
      let target = this.targets.get(el) || { x: 0, y: 0 };

      let ease = el._ease;
      ease = Math.min(Math.max(ease, 0), 1);

      pos.x += (target.x - pos.x) * ease;
      pos.y += (target.y - pos.y) * ease;

      this.positions.set(el, pos);
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    });

    requestAnimationFrame(this.animate);

  }

  setIntersectionObserver() {

    this.observer = new IntersectionObserver(this.intersectionCallback, {

      root: null,
      rootMargin: this.params.rootMargin ?? '0px',
      threshold: this.params.threshold ?? 0,

    });

    this.parallaxElements.forEach((item) => this.observer.observe(item));

  }

  intersectionCallback(entries) {

    entries.forEach((entry) => {

      const el = entry.target;

      if (entry.isIntersecting) {

        el._inView = true;

        if (!el._isReady) {

            if (el._delay > 0 && (!el._delayOnce || !el._wasActivated)) {

                clearTimeout(el._delayTimer);
                el._delayTimer = setTimeout(() => {
                    el._isReady = true;
                    el._wasActivated = true;
                    el.classList.add('ready');
                    this.updateReadyElements();
                }, el._delay);

            } else {
                el._isReady = true;
                el._wasActivated = true;
                el.classList.add('ready');
                this.updateReadyElements();
            }

        } else {
            this.updateReadyElements();
        }

      }  else {

        el._inView = false;


        clearTimeout(el._delayTimer);


        el._isReady = false;
        el.classList.remove('ready');

        if (el._resetOnExit) {
            this.targets.delete(el);
            this.positions.delete(el);
            el.style.transform = el._initialTransform || '';
        }

        this.updateReadyElements();

      }

    });

  }

  updateReadyElements() {
    this.readyElements = this.parallaxElements.filter(el => el._isReady && el._inView);
  }

}

class BurgerMenu {

  constructor(params) {

    this.params = params ?? {};
    this.params.exceptBtns = this.params.exceptBtns ?? '';
    let media = this.params.activationBreakpoint ?? 768;
    let mediaOk = window.matchMedia(`(max-width: ${media}px)`).matches;

    if (!mediaOk) return;

    this.ownMethodsBinder();
    this.getElements();
    this.createOverlay();
    this.setEventListeners();

  }

  setEventListeners() {

    document.addEventListener('click', (event) => {
        
      let target = event.target;
      let except = this.params.exceptBtns;

      if (target.closest('[data-burger-open]')) {
        this.openBurgerMenu();
      } else if (target.closest('[data-burger-close]')) {
        this.closeBurgerMenu();
      } else if ((target.closest('a') || target.closest(`button:not(${except})`)) && target.closest('[data-burger-content]')) {
        this.closeBurgerMenu();
      } else if (!target.closest('[data-burger-content]') && !target.closest('[data-burger-open]') && this.params.closeByClickOutOfMenu) {
        this.closeBurgerMenu();
      }

    });

  }

  openBurgerMenu() {
    this.openButton.classList.toggle('active');
    this.content.classList.toggle('active');
    this.overlay?.classList.toggle('active');
    
    this.handlePageOverflow();
    this.params.openCallback?.({ 
      button: this.openButton, 
      content: this.content, 
      overlay: this.overlay,
      closeBtn: this.closeButton,
    });
  }

  closeBurgerMenu() {
    this.openButton.classList.remove('active');
    this.content.classList.remove('active');
    this.overlay?.classList.remove('active');

    this.handlePageOverflow();
    this.params.closeCallback?.({ 
      button: this.openButton, 
      content: this.content, 
      overlay: this.overlay,
      closeBtn: this.closeButton,
    });
  }

  handlePageOverflow() {
    let burgerActive = this.content.matches('.active');
    let scrollOffset = window.innerWidth - document.documentElement.clientWidth;

    if (burgerActive) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = scrollOffset + 'px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  } 

  createOverlay() {
    if (this.params.needOverlay) {
      this.overlay = document.createElement('div');
      this.overlay.classList.add('burger-overlay');
      document.body.append(this.overlay);
    }
  }

  getElements() {
    this.openButton = document.querySelector('[data-burger-open]');
    this.closeButton = document.querySelector('[data-burger-close]');
    this.content = document.querySelector('[data-burger-content]');
  }

}

class UpdatePageTitle {

  constructor(params) {
    this.params = params ?? {};
    this.items = Array.from(document.querySelectorAll('[data-title]'));
    this.title = document.querySelector('title');
    let media = window.matchMedia(`(max-width: ${this.params.mobile ?? 768}px)`).matches;
    
    if (this.items.length > 0 && !media) {
      this.ownMethodsBinder();
      this.createObserver();
      this.installObserverOnElements();
      this.translateListener();
    }
  
  }

  installObserverOnElements() {

    this.items.forEach((item) => this.observer.observe(item));

  }

  createObserver() {

    let params = this.params.observer ?? {};

    let options = {
      root: null,
      rootMargin: params.rootMargin ?? '0px',
      threshold: params.threshold ?? 0.4,
      delay: params.delay ?? 0
    }

    this.observer = new IntersectionObserver(this.observerHandler, options);

  }

  observerHandler(list, observer) {

    list.forEach((item) => {

      let element = item.target;
      let msg = element.dataset.title;

      if (item.isIntersecting) {
        
        if (this.params.dictionary) {
          this.title._translateKey = msg; 
          this.translator();
        } else {
          this.title.textContent = msg;
        }
  
      }

    })

  }

  translateListener() {

    if (!this.params.dictionary) return;

    document.addEventListener('translated', (event) => this.translator());

  }

  translator() {

    let lang = document.documentElement.lang;
    let key = this.title._translateKey;
    if (!key) return;
    let text = this.params.dictionary[key][lang];
    this.title.textContent = text;

  }

}





function setupMixin(...classes) {

  const mixin = {

    ownMethodsBinder() {
      let prototype = Object.getPrototypeOf(this);
      let ownMethods = Object.getOwnPropertyNames(prototype);

      for (let item of ownMethods) {
        if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
      }
    }

  };

  classes.forEach((item) => Object.assign(item.prototype, mixin));

}

setupMixin(
  FormValidator,
  Parallax,
  BurgerMenu,
  UpdatePageTitle,
);

export {
  FormValidator,
  Parallax,
  BurgerMenu,
  UpdatePageTitle,
}