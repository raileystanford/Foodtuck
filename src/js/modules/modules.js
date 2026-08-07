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

class LazyLoad {

  constructor(params) {
    this.params = params ?? {};
    this.blocks= Array.from(document.querySelectorAll('[data-load-block], [data-load-bg]'));

    if (this.blocks.length > 0) {
      this.ownMethodsBinder();
      this.checkWebpSupport();
    }

  }

  runMethods(event) {

    if (event) {

      let img = event.target;

      if (event.type === 'load') {
        this.webpSupport = (img.width > 0) && (img.height > 0);
      } else if (event.type === 'error') {
        this.webpSupport = false;
      }

    }

    this.createObserver();
    this.observeBlocks();
    this.showLine();

  }

  checkWebpSupport() {

    if (this.params.bgWebpNeed) {

      const img = new Image();

      img.addEventListener('load', this.runMethods);
      img.addEventListener('error', this.runMethods);

      img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAAQJaQAA3AAA/v3/9gA';

    } else {

      this.runMethods();

    }

  }

  createObserver() {
    
    let offset = this.params.offset ?? 700;
    let root = document.querySelector(`${this.params.root}`);
      
    this.observer = new IntersectionObserver((list, observer) => {

      list.forEach((item) => {
        if (item.isIntersecting) {
          this.observerHandler(item.target);
          observer.unobserve(item.target);
        }
      })

    }, { root: root, rootMargin: `${offset}px ${offset}px`, threshold: 0.01 });
    
  }

  observerHandler(container) {
    
    if (container.matches('[data-load-block]')) {

      let elements = Array.from(container.querySelectorAll('[data-load]'));
      elements.forEach((element) => {

        let inPicture = element.closest('picture');
        let inVideo = element.closest('video');
        let inAudio = element.closest('audio');

        let url = element.dataset.load;

        this.loadHandler(element);

        if (inPicture) {
          element.tagName === 'IMG' ? element.src = url : element.srcset = url;
        } else if (inVideo || inAudio) {
          element.preload = 'auto';
        } else {
          element.src = url;
        }

        element.removeAttribute('data-load');

      });

    } 
    
    if (container.matches('[data-load-bg]')) {
      
      let path = container.dataset.loadBg;
      let src = path;

      if (this.webpSupport) src = path.replace(/.\w+$/, '.webp');

      container.style.backgroundImage = `url(${src})`;
      container.removeAttribute('data-load-bg');

    }

  }

  loadHandler(item) {
    item.addEventListener('load', (event) => {
      event.currentTarget.classList.add('loaded');
      event.currentTarget.dispatchEvent(new CustomEvent('lazyloaded', { bubbles: true }));
    }, { once: true });
  }

  observeBlocks() {
    this.blocks.forEach((block) => {

      let isContent = block.querySelector('[data-load]');
      let isBgLoad = block.matches('[data-load-bg]');
      if (isContent || isBgLoad) {
        this.observer.observe(block);
      }

    });
  }

  showLine() {
    if (this.params.showLine) {
      let offset = this.params.offset ?? 700;
      this.blocks.forEach((block) => {
        block.style.position = 'relative';
        let line = document.createElement('div');
        line.style.cssText = `display: block; width: 100vw; height: 2px; background: red; position: absolute; left: 0; top: -${offset}px`;
        block.prepend(line);
      })
    }
  }

}

class ScrollToTop {

  constructor(params) {
    this.params = params ?? {};
    this.clientWidth = document.documentElement.clientWidth;
    this.button = document.querySelector('[data-scroll-top]');

    if (this.button) {
      this.ownMethodsBinder();
      this.setEventListeners(); 
      this.scrollHandler(); 
    }
  }

  setEventListeners() {
    window.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.updateClientWidth);
    this.button.addEventListener('click', this.moveToTop);
  }

  moveToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
    this.button.blur();
    this.button.classList.add('off');
  }

  updateClientWidth() {
    this.clientWidth = document.documentElement.clientWidth;
  }

  getActivationCoordinate() {
    let activationCoordinate;
    for (let key in this.params) {
      let [min, max] = key.split('-');
      min = +min;
      max = +max;
      if (this.clientWidth >= min && this.clientWidth <= max) { 
        activationCoordinate = this.params[key];
        break;
      } else {
        activationCoordinate = this.params.default;
      }
    }
    return activationCoordinate ?? 900;
  }

  controlButton(state) {
    if (state) {
      this.button.classList.add('active');
    } else {
      this.button.classList.remove('active');
      this.button.classList.remove('off');
    }
  }

  scrollHandler() {
    let coordinate = this.getActivationCoordinate();
    let scrollY = window.pageYOffset;
    
    if (scrollY >= coordinate) {
      this.controlButton(true)
    } else {
      this.controlButton(false)
    }
  }

}

class DigitsCountingAnimation {
  constructor(params) {
    this.params = params ?? {};
    this.containers = Array.from(document.querySelectorAll('[data-dig-anim="main"]'));

    if (this.containers.length) {
      this.intervals = new Map();
      this.ownMethodsBinder();
      this.prepareInitialState();
      this.observeAllElements();
    }
  }

  prepareInitialState() {
    this.containers.forEach(container => {
      const elements = container.querySelectorAll('[data-dig-anim]:not([data-dig-anim="main"])');

      elements.forEach(el => {
        const isReverse = el.dataset.digAnim !== 'increase';

        const text = el.textContent.trim();
        const separator = text.includes(',') ? ',' : '.';

        const number = parseFloat(text.replace(',', '.').match(/\d+\.?\d*/)[0]);

        el.dataset.originalNumber = number;
        el.dataset.originalSeparator = separator;

        const decimalPlaces = (number.toString().split('.')[1] || []).length;

        const startValue = isReverse ? number : 0;

        this.setText(el, startValue, decimalPlaces, separator);
      });
    });
  }

  observeAllElements() {
    const observerSettings = this.params.intObserverParams ?? {};

    this.observer = new IntersectionObserver(this.countingActivation, {
      root: observerSettings.root || null,
      rootMargin: observerSettings.rootMargin || '0px',
      threshold: observerSettings.threshold || 0.01,
    });

    this.containers.forEach(el => this.observer.observe(el));
  }

  countingActivation(entries) {
    entries.forEach(entry => {
      const container = entry.target;

      if (entry.isIntersecting) {
        if (this.intervals.has(container)) return;

        this.countingAnimation(container);

        if (this.params.once) {
          this.observer.unobserve(container);
        }
      } else {
        if (!this.params.once) {
          this.stopAndReset(container);
        }
      }
    });
  }

  countingAnimation(container) {
    const elements = container.querySelectorAll('[data-dig-anim]:not([data-dig-anim="main"])');

    elements.forEach(el => {
      const isReverse = el.dataset.digAnim !== 'increase';

      const number = parseFloat(el.dataset.originalNumber);
      const separator = el.dataset.originalSeparator;
      const decimalPlaces = (number.toString().split('.')[1] || []).length;

      let current = isReverse ? number : 0;
      this.setText(el, current, decimalPlaces, separator);

      const duration = this.params.duration ?? 2000;
      const steps = this.params.steps ?? 100;
      const stepTime = duration / steps;
      const increment = number / steps;

      const intervalID = setInterval(() => {
        current += isReverse ? -increment : increment;

        if (isReverse ? current <= 0 : current >= number) {
          current = isReverse ? 0 : number;
          this.setText(el, current, decimalPlaces, separator);
          this.removeInterval(container, intervalID);
        } else {
          this.setText(
            el,
            decimalPlaces ? current : Math.floor(current),
            decimalPlaces,
            separator
          );
        }
      }, stepTime);

      this.addInterval(container, intervalID);
    });
  }

  stopAndReset(container) {
    this.clearBlockIntervals(container);

    const elements = container.querySelectorAll('[data-dig-anim]:not([data-dig-anim="main"])');

    elements.forEach(el => {
      const isReverse = el.dataset.digAnim !== 'increase';

      const number = parseFloat(el.dataset.originalNumber);
      const separator = el.dataset.originalSeparator;
      const decimalPlaces = (number.toString().split('.')[1] || []).length;

      const value = isReverse ? number : 0;

      this.setText(el, value, decimalPlaces, separator);
    });
  }

  setText(el, value, decimals, separator) {
    let formatted = decimals
      ? value.toFixed(decimals)
      : value.toString();

    el.textContent = separator === ','
      ? formatted.replace('.', ',')
      : formatted;
  }

  addInterval(block, id) {
    if (!this.intervals.has(block)) {
      this.intervals.set(block, []);
    }
    this.intervals.get(block).push(id);
  }

  removeInterval(block, id) {
    clearInterval(id);

    const arr = this.intervals.get(block);
    if (!arr) return;

    const i = arr.indexOf(id);
    if (i !== -1) arr.splice(i, 1);

    if (!arr.length) this.intervals.delete(block);
  }

  clearBlockIntervals(block) {
    if (!this.intervals.has(block)) return;

    this.intervals.get(block).forEach(clearInterval);
    this.intervals.delete(block);
  }
}

class ImageZoom {

  constructor(options = {}) {

    this.mode = options.mode ?? 'hover';
    this.isMobile = window.matchMedia(`(max-width:${options.mobileViewport ?? 768}px)`).matches;

    this.selectOptions(options);
    this.containers = document.querySelectorAll('[data-zoom]');
    this.createFullscreen();
    this.containers.forEach(c => this.initContainer(c));

  }

  selectOptions(options) {

    this.minZoom = options.minZoom ?? 1;
    this.maxZoom = options.maxZoom ?? 3;
    this.zoomStep = options.zoomStep ?? 0.15;
    this.startZoom = options.startZoom ?? 1.6;

    if (!this.isMobile) return;

    let mobile = Object.keys(options.mobile ?? {}).length > 0;

    if (!mobile) return

    this.minZoom = options.mobile.minZoom ?? options.minZoom ?? 1;
    this.maxZoom = options.mobile.maxZoom ?? options.maxZoom ?? 3;
    this.zoomStep = options.mobile.zoomStep ?? options.zoomStep ?? 0.15;
    this.startZoom = options.mobile.startZoom ?? options.startZoom ?? 1.6;

  }

  initContainer(container) {

    const img = container.querySelector('[data-zoom-img]');
    if (!img) return;

    if (this.isMobile) {
      container.addEventListener('click', () => this.openFullscreen(img));
      return;
    }

    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    Object.assign(img.style, {
      position: 'absolute',
      transformOrigin: '0 0',
      willChange: 'transform'
    });

    img.dataset.zoomScale = 1;
    img.dataset.imgX = 0;
    img.dataset.imgY = 0;

    this.mode === 'hover'
      ? this.initHoverZoom(container, img)
      : this.initClickZoom(container, img);

    container.addEventListener('wheel', e => {
      e.preventDefault();
      const { x, y } = this.getCoords(e, container);
      this.zoomDesktop(img, e.deltaY < 0 ? 1 : -1, x, y, container);
    }, { passive: false });

    container.addEventListener('dragstart', e => e.preventDefault());
  }

  initHoverZoom(container, img) {

    let active = false;

    const move = e => {
      const { x, y } = this.getCoords(e, container);

      if (!active) {
        img.dataset.zoomScale = this.startZoom;
        active = true;
      }

      this.moveDesktop(img, x, y, container);
    };

    container.addEventListener('mouseenter', () => {
      container.classList.add('active');
      container.addEventListener('mousemove', move);
    });

    container.addEventListener('mouseleave', () => {
      container.classList.remove('active');
      container.removeEventListener('mousemove', move);
      img.dataset.zoomScale = 1;
      this.applyDesktopTransform(img, 0, 0, container);
      active = false;
    });
  }

  initClickZoom(container, img) {

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;

    container.addEventListener('pointerdown', e => {
      if (+img.dataset.zoomScale === 1) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', e => {
      if (!dragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;

      startX = e.clientX;
      startY = e.clientY;

      this.applyDesktopTransform(
        img,
        (+img.dataset.imgX) + dx,
        (+img.dataset.imgY) + dy,
        container
      );
    });

    container.addEventListener('pointerup', () => dragging = false);

    container.addEventListener('click', e => {

      if (moved) {
        moved = false;
        return;
      }

      if (+img.dataset.zoomScale === 1) {
        container.classList.add('active');
        img.dataset.zoomScale = this.startZoom;
        const { x, y } = this.getCoords(e, container);
        this.applyDesktopTransform(
          img,
          -x * (this.startZoom - 1),
          -y * (this.startZoom - 1),
          container
        );
      } else {
        container.classList.remove('active');
        img.dataset.zoomScale = 1;
        this.applyDesktopTransform(img, 0, 0, container);
      }
    });
  }

  zoomDesktop(img, dir, x, y, container) {

    let scale = +img.dataset.zoomScale;
    scale = Math.min(this.maxZoom, Math.max(this.minZoom, scale + this.zoomStep * dir));
    img.dataset.zoomScale = scale;

    this.applyDesktopTransform(
      img,
      -x * (scale - 1),
      -y * (scale - 1),
      container
    );
  }

  moveDesktop(img, x, y, container) {
    if (+img.dataset.zoomScale <= 1) return;
    this.applyDesktopTransform(
      img,
      -x * (+img.dataset.zoomScale - 1),
      -y * (+img.dataset.zoomScale - 1),
      container
    );
  }

  applyDesktopTransform(img, x, y, container) {

    if (!container) return;

    const scale = +img.dataset.zoomScale;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const iw = img.offsetWidth * scale;
    const ih = img.offsetHeight * scale;

    const minX = Math.min(0, cw - iw);
    const minY = Math.min(0, ch - ih);

    x = Math.min(0, Math.max(minX, x));
    y = Math.min(0, Math.max(minY, y));

    img.dataset.imgX = x;
    img.dataset.imgY = y;
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  createFullscreen() {

    if (!this.isMobile) return;

    this.fs = document.createElement('div');
    this.fs.className = 'zoom-fs';

    this.fsImg = document.createElement('img');
    this.fsImg.classList.add('zoom-fs__img');

    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'zoom-fs__close-btn';
    this.closeBtn.textContent = '✕';

    this.fs.append(this.fsImg, this.closeBtn);
    document.body.appendChild(this.fs);

    this.initFullscreenGestures();

    this.closeBtn.onclick = () => this.closeFullscreen();
    this.fs.onclick = e => e.target === this.fs && this.closeFullscreen();

  }

  openFullscreen(sourceImg) {

    this.fsImg.src = sourceImg.src;

    this.scale = 1;
    this.x = 0;
    this.y = 0;

    this.applyFullscreenTransform();

    requestAnimationFrame(() => {
      this.fs.classList.add('active');
    });

    document.body.style.overflow = 'hidden';
  }

  closeFullscreen() {

    this.applyFullscreenTransform();
    this.fs.classList.remove('active');
    document.body.style.overflow = '';

  }

  initFullscreenGestures() {

    let startDist = 0;
    let startScale = 1;
    let startX = 0;
    let startY = 0;
    let dragging = false;

    this.fs.addEventListener('touchstart', e => {

      this.fsImg.style.transition = 'none';

      if (e.touches.length === 2) {
        startDist = this.getDistance(e.touches[0], e.touches[1]);
        startScale = this.scale;
      }

      if (e.touches.length === 1 && this.scale > 1) {
        dragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }

    }, { passive: false });

    this.fs.addEventListener('touchmove', e => {
      e.preventDefault();

      if (e.touches.length === 2) {
        const dist = this.getDistance(e.touches[0], e.touches[1]);
        this.scale = Math.min(this.maxZoom, Math.max(this.minZoom, startScale * (dist / startDist)));
        this.constrainFullscreen();
        this.applyFullscreenTransform();
      }

      if (dragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        this.x += dx;
        this.y += dy;
        this.constrainFullscreen();
        this.applyFullscreenTransform();
      }

    }, { passive: false });

    this.fs.addEventListener('touchend', () => dragging = false);
  }

  constrainFullscreen() {

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const iw = this.fsImg.offsetWidth * this.scale;
    const ih = this.fsImg.offsetHeight * this.scale;

    const minX = Math.min(0, (vw - iw) / 2);
    const maxX = Math.max(0, (iw - vw) / 2);
    const minY = Math.min(0, (vh - ih) / 2);
    const maxY = Math.max(0, (ih - vh) / 2);

    this.x = Math.min(maxX, Math.max(minX, this.x));
    this.y = Math.min(maxY, Math.max(minY, this.y));
  }

  applyFullscreenTransform() {
    this.fsImg.style.transform = `translate(-50%, -50%) translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
  }

  getCoords(e, el) {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  getDistance(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

}

class CustomSelect {

  constructor(params) {

    this.elements = Array.from(document.querySelectorAll('[data-select]'));

    if (!this.elements.length) return;

    this.opt = params ?? {};
    this.opt.openType = params.openType ?? 'click';
    this.opt.calcHeight = params.calcHeight ?? true;
    this.opt.voidClose = params.voidClose ?? true;
    this.opt.initVar = params.initVar ?? true;

    this.defineComponents();
    this.selectInitVariant();
    this.preopenSelect();
    this.setEventListeners();

  }

  setEventListeners() {

    if (this.opt.openType === 'hover') {

      this.elements.forEach((element) => {

        element.addEventListener('pointerenter', (event) => {

          this.openSelect(event.target);

          element.addEventListener('pointerleave', (event) => {

            this.closeSelect(event.target);

          }, { once: true });

        });

      });

      document.addEventListener('click', (event) => {

        let isVariant = event.target.closest('[data-select-var]');

        if (isVariant) {
          this.selectVariant(isVariant);
          this.closeSelect(isVariant);
        }

      });

    } else {

      document.addEventListener('click', (event) => {

        let isTrigger = event.target.closest('[data-select-trigger]');
        let isVariant = event.target.closest('[data-select-var]');
        let isVoid = !event.target.closest('[data-select]');

        if (isTrigger) {

          let block = isTrigger.closest('[data-select]');

          if (block.matches('.opened')) {
            this.closeSelect(isTrigger);
          } else {
            this.openSelect(isTrigger);
          }
          
        } else if (isVariant) {
          
          this.selectVariant(isVariant);
          this.closeSelect(isVariant);

        } else if (isVoid && this.opt.voidClose) {

          this.closeAllSelects();

        }

      });

    }

  }

  preopenSelect() {

    this.elements.forEach((item) => {

      if (item.matches('.opened')) this.openSelect(item);

    });

  }

  selectInitVariant() {

    if (!this.opt.initVar) return;

    this.elements.forEach((item) => {

      let initVar = item.querySelector('[data-select-init]') ?? item._vars[0];
      this.selectVariant(initVar);

    });

  }

  closeAllSelects() {

    this.elements.forEach((item) => {
      if (item.matches('.opened')) this.closeSelect(item);
    });

  }

  updateSelectsList() {

    this.elements = Array.from(document.querySelectorAll('[data-select]'));

  }

  selectVariant(variant) {

    let block = variant.closest('[data-select]');
    let value = variant.dataset.selectVar;
    let text = variant.querySelector('[data-select-var-text]').textContent;

    block._selectedVariant = variant;
    block._triggerText.textContent = text;

    block._vars.forEach((item) => item.classList.remove('selected'));
    variant.classList.add('selected');
    
    variant.dispatchEvent(new CustomEvent('varselected', { bubbles: true, cancelable: true, composed: true, detail: { text, value, variant } }));

  }

  openSelect(element) {

    if (!this.opt.multiple) this.closeAllSelects();

    let block = element.closest('[data-select]');
    
    block.classList.add('opened');
    this.setVarsHeight(block);

    block.dispatchEvent(new CustomEvent('selectopened', { bubbles: true, cancelable: true, composed: true }));

  }

  closeSelect(element) {

    let block = element.closest('[data-select]');

    block.classList.remove('opened');
    this.setVarsHeight(block);

    block.dispatchEvent(new CustomEvent('selectclosed', { bubbles: true, cancelable: true, composed: true }));

  }

  setVarsHeight(block) {

    if (!this.opt.calcHeight) return;

    let isOpened = block.matches('.opened');

    if (isOpened) {
      block._varsBlock.style.height = block._varsBlock.scrollHeight + 'px';
    } else {
      block._varsBlock.style.height = '';
    }
    
  }

  defineComponents() {

    this.elements.forEach((element) => {

      element._trigger = element.querySelector('[data-select-trigger]');
      element._triggerText = element.querySelector('[data-select-trig-text]');
      element._varsBlock = element.querySelector('[data-select-vars]');
      element._vars = Array.from(element.querySelectorAll('[data-select-var]'));

    });

  }

}

class Demonstrator {

  constructor(selector, options = {}) {

    if (typeof Swiper === 'undefined') {
      console.warn('[Demonstrator] Swiper not loaded');
      return;
    }

    this.root = document.querySelector(selector);

    if (!this.root) {
      console.warn('[Demonstrator] Root element not found');
      return;
    }

    this.opt = options;

    this.mobileBreakpoint = this.opt.mobile ?? 768;
    this.isMobile = window.matchMedia(`(max-width:${this.mobileBreakpoint}px)`).matches;
    this.scrollToClick = this.opt.scrollToClick ?? true;
    this.showDelay = this.opt.showDelay ?? [0, 0];
    this.extraSlide = this.opt.extraSlide;
    this.sliderEl = this.root.querySelector('.swiper');
    this.screen = this.root.querySelector('.demonstrator__screen');
    this.screenPic = this.root.querySelector('.demonstrator__big-img');

    this.imgTimer = null;
    this.animTimer = null;
    this.swiper = null;
    this.lazyObserver = null;
    this.viewportObserver = null;

    this.init();

  }

  init() {

    this.createSwiper();
    this.bindEvents();

    if (this.opt.lazy) {
      this.initLazy();
    } else {
      this.updateScreen();
    }

    if (this.opt.autoplayOnViewport) this.initViewportObserver();
    if (this.extraSlide) this.addExtraSlide();

  }

  createSwiper() {

    this.swiper = new Swiper(this.sliderEl, {

      slidesPerView: 4,
      spaceBetween: 10,
      direction: 'vertical',
      speed: 500,
      simulateTouch: true,

      mousewheel: {
        enabled: true,
        forceToAxis: true
      },

      keyboard: {
        enabled: true,
        onlyInViewport: true
      },

      pagination: {
        el: this.root.querySelector('.demonstrator__pagination'),
        clickable: true,
        type: 'bullets'
      },

      navigation: {
        nextEl: this.root.querySelector('.demonstrator__btn--next'),
        prevEl: this.root.querySelector('.demonstrator__btn--prev')
      },

      ...this.opt.slider

    });

    this.loop = this.swiper.params.loop;
    this.autoplay = this.swiper.params.autoplay?.enabled;
    this.swiper.on('slideChange', () => this.updateScreen());

  }

  onClick(e) {

    const slide = e.target.closest('.swiper-slide');

    if (!slide) return;

    if (!this.scrollToClick) return;

    const index = Number(slide.dataset.swiperSlideIndex ?? [...this.swiper.slides].indexOf(slide));

    if (this.loop) {
      this.swiper.slideToLoop(index);
    } else {
      this.swiper.slideTo(index);
    }

  }

  getRealSlide() {

    if (!this.swiper) return null;

    if (!this.loop) {
      return this.swiper.slides[this.swiper.activeIndex];
    }

    const realIndex = this.swiper.realIndex;

    return [...this.swiper.slides].find(slide => {
      return (!slide.classList.contains('swiper-slide-duplicate') && Number(slide.dataset.swiperSlideIndex) === realIndex);
    });

  }

  getSlideImage(slide) {

    if (!slide) return null;

    const img = slide.querySelector('.demonstrator__img');

    if (!img) return null;

    return {

      slide,
      thumb: img,
      full: img.dataset.full || img.currentSrc || img.src,
      alt: img.alt || ''

    };

  }

  updateScreen() {

    const slide = this.getRealSlide();

    if (!slide) return;

    const data = this.getSlideImage(slide);

    if (!data) return;

    if ( this.screenPic.dataset.current == data.full) {

      this.updateActiveSlide(slide);
      return;

    }

    this.updateActiveSlide(slide);

    clearTimeout(this.imgTimer);

    clearTimeout(this.animTimer);

    this.screenPic.classList.add('active');

    this.imgTimer = setTimeout(() => {

      this.screenPic.dataset.current = data.full;
      this.screenPic.src = data.full;
      this.screenPic.alt = data.alt;

    }, this.showDelay[0]);

    this.animTimer = setTimeout(() => {

      this.screenPic.classList.remove('active');

    }, this.showDelay[1]);

  }

  updateActiveSlide(activeSlide) {

    const slides = this.root.querySelectorAll('.swiper-slide');

    slides.forEach(slide => {
      slide.classList.remove('active');
    });

    const real = Number(activeSlide.dataset.swiperSlideIndex);

    slides.forEach(slide => {

      if (Number(slide.dataset.swiperSlideIndex) === real) {
        slide.classList.add('active');
      }

    });

  }

  initLazy() {

    const rootMargin = this.opt.lazy?.margin ?? 800;
    const threshold = this.opt.lazy?.threshold ?? 0.01;

    this.lazyObserver = new IntersectionObserver(entries => {

      const entry = entries[0];

      if (!entry.isIntersecting) return;

      this.preloadFullImages();
      this.loadThumbs();
      this.updateScreen();

      this.lazyObserver.disconnect();
      this.lazyObserver = null;

    }, { rootMargin: `${rootMargin}px ${rootMargin}px`, threshold});

    this.lazyObserver.observe(this.root);

  }

  preloadFullImages() {

    const images = this.root.querySelectorAll('.demonstrator__img[data-full]');

    images.forEach(img => {

      const preload = new Image();
      preload.src = img.dataset.full;

    });

  }

  loadThumbs() {

    const lazy = this.root.querySelectorAll('[data-lazy]');

    lazy.forEach(node => {

      if ( node.tagName === 'IMG') {

        node.src =node.dataset.lazy;

      } else if (node.tagName === 'SOURCE') {

        node.srcset = node.dataset.lazy;

      }

      node.removeAttribute('data-lazy');

    });

  }

  initViewportObserver() {

    if (!this.opt.autoplayOnViewport || !this.swiper?.autoplay) return;

    const { margin = 0, threshold = 0.1 } = this.opt.autoplayOnViewport;

    this.viewportObserver = new IntersectionObserver(entries => {

      const entry = entries[0];

      if (!entry) return;

      if (entry.isIntersecting) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }

    }, { rootMargin: `${margin}px 0px`, threshold });

    this.viewportObserver.observe(this.root);

  }

  startAutoplay() {

    if (!this.swiper || !this.swiper.autoplay) return;
    this.swiper.autoplay.start();

  }

  stopAutoplay() {

    if (!this.swiper || !this.swiper.autoplay) return;
    this.swiper.autoplay.stop();

  }

  handlePointerEnter = () => {

    if (!this.autoplay) return;
    this.stopAutoplay();

  }

  handlePointerLeave = () => {

    if (!this.autoplay) return;
    this.startAutoplay();

  }

  handlePointerDown = () => {

    if (!this.autoplay) return;
    this.stopAutoplay();

  }

  addExtraSlide() {

    let slidesCount = Math.trunc(+this.swiper.params.slidesPerView);

    if (slidesCount > 1) {

      for (let i = 1; i <= slidesCount - 1; i++) {
        this.swiper.appendSlide(`<div class="swiper-slide" style="visibility: hidden;"></div>`);
      }

    }

  }

  bindEvents() {

    this.root.addEventListener('click', this.onClick.bind(this));

    if (!this.autoplay) return;

    if (this.isMobile) {

      this.root.addEventListener('pointerdown', this.handlePointerDown);

    } else {

      this.root.addEventListener('pointerenter', this.handlePointerEnter);
      this.root.addEventListener('pointerleave', this.handlePointerLeave);

    }

  }

  handleResize = () => {

    const mobile = window.matchMedia(`(max-width:${this.mobileBreakpoint}px)`).matches;

    if (mobile === this.isMobile) return;

    this.isMobile = mobile;
    this.unbindPointerEvents();
    this.bindPointerEvents();

  }

  bindPointerEvents() {

    if (!this.autoplay) return;

    if (this.isMobile) {

      this.root.addEventListener('pointerdown', this.handlePointerDown);
      return;

    }

    this.root.addEventListener('pointerenter', this.handlePointerEnter);
    this.root.addEventListener('pointerleave', this.handlePointerLeave);

  }

  unbindPointerEvents() {

    this.root.removeEventListener('pointerdown', this.handlePointerDown);
    this.root.removeEventListener('pointerenter', this.handlePointerEnter);
    this.root.removeEventListener('pointerleave', this.handlePointerLeave);

  }

  destroy() {

    clearTimeout(this.imgTimer);
    clearTimeout(this.animTimer);

    this.root.removeEventListener('click', this.onClick);
    this.unbindPointerEvents();

    window.removeEventListener('resize', this.handleResize);

    if (this.lazyObserver) {

      this.lazyObserver.disconnect();
      this.lazyObserver = null;

    }

    if (this.viewportObserver) {

      this.viewportObserver.disconnect();
      this.viewportObserver = null;

    }

    if (this.swiper) {

      this.swiper.destroy(true, true);
      this.swiper = null;

    }

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
  LazyLoad,
  ScrollToTop,
  DigitsCountingAnimation,
);

export {
  FormValidator,
  Parallax,
  BurgerMenu,
  UpdatePageTitle,
  LazyLoad,
  ScrollToTop,
  DigitsCountingAnimation,
  ImageZoom,
  CustomSelect,
  Demonstrator,
}