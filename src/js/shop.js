import {
  UpdatePageTitle,
  LazyLoad,
  CustomSelect,
} from "./modules/modules.js";

import { shop_titles, goods_info } from './modules/dictionary.js';


// Plugins

new UpdatePageTitle({
  dictionary: shop_titles,
});

new CustomSelect({
  openType: 'click',
  calcHeight: true,
  voidClose: true,
  initVar: true,
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

function customRange() {

  if (typeof noUiSlider === 'undefined') return;

  let range = document.querySelector('#price-range');

  if (!range) return;

  let container = range.closest('.custom-range');
  let minValue = container.querySelector('.custom-range__value-min');
  let maxValue = container.querySelector('.custom-range__value-max');

  noUiSlider.create(range, {
    start: [1, 150],
    connect: true,
    range: {
      'min': 1,
      'max': 150
    },
    margin: 15,
  });

  let clas = range.noUiSlider;
  let leftButton = container.querySelector('.noUi-handle-lower');
  let rightButton = container.querySelector('.noUi-handle-upper');

  leftButton.addEventListener('pointerdown', (event) => {
    leftButton.setPointerCapture(event.pointerId);
  });

  rightButton.addEventListener('pointerdown', (event) => {
    rightButton.setPointerCapture(event.pointerId);
  });

  clas.on('update', (values, handle) => {

    range._current = { min: values[0], max: values[1] };
    minValue.textContent = '$' + Math.trunc(values[0]);
    maxValue.textContent = '$' + Math.trunc(values[1]);

  });

}

function favoriteButtonHandler() {

  let btn = document.querySelector('.product-card__btn--like');

  if (!btn) return;

  document.addEventListener('click', (event) => {

    let favBtn = event.target.closest('.product-card__btn--like');
    if (favBtn) favBtn.classList.toggle('active');

  });

}

function goodsSortHandler() {

  let goodsArea = document.querySelector('.market__goods-content');
  let initGoods = Array.from(document.querySelectorAll('.product-card'));

  if (!goodsArea || !initGoods.length) return;

  let currentPage = 1;
  let goodsPerPage = 15;
  let filteredGoods = [...initGoods];
  let pagination = document.querySelector('.pagination');
  let paginationBody = pagination.querySelector('.pagination__body');
  let prevBtn = pagination.querySelector('.pagination__btn--prev');
  let nextBtn = pagination.querySelector('.pagination__btn--next');

  let mainBlock = document.querySelector('.market');
  let select_sortBy = document.querySelector('.market__custom-select--sortBy [data-select]');
  let marketSearch = document.querySelector('.shop-search__input');
  let priceRange = document.querySelector('#price-range');
  let currentFiltersBlock = document.querySelector('.market__selected-filters');

  writeDataToGoods(goods_info);
  renderPagination(false);

  document.addEventListener('searchvalid', (event) => sortGoods());

  document.addEventListener('change', (event) => {
    
    let shopSearch = event.target.matches('.shop-search__input');
    let searchInput = event.target.matches('.search__input');

    if (!shopSearch && !searchInput) sortGoods();
    
  });

  priceRange.noUiSlider.on('change', (event) => sortGoods());

  document.addEventListener('varselected', (event) => {

    let sortBy = event.target.closest('.market__custom-select--sortBy');
    let show = event.target.closest('.market__custom-select--show');

    if (sortBy) {
      sortGoods();
    } else if (show) {
      calculatePagination(event.target);
    }

  });

  prevBtn.addEventListener('click', () => {

    if (currentPage <= 1) return;
    currentPage--;
    renderPagination();

  });

  nextBtn.addEventListener('click', () => {

    const totalPages = Math.ceil(filteredGoods.length / goodsPerPage);
    if (currentPage >= totalPages) return;
    currentPage++;
    renderPagination();

  });

  function sortGoods() {

    filteredGoods = [];

    if (marketSearch.value.trim()) {
      marketSearch._lastValue = marketSearch.value.trim();
    }

    const searchVal = marketSearch._lastValue || '';
    const sortByValue = select_sortBy._selectedVariant.dataset.selectVar;
    const categoryValue = document.querySelector('.check-list__input:checked')?.value;
    const minRangeValue = Math.trunc(priceRange._current.min);
    const maxRangeValue = Math.trunc(priceRange._current.max);
    const activeTags = getActiveTags();

    initGoods.forEach((good) => {

      const info = good._data;

      let searchOk = searchVal ? new RegExp(searchVal, 'i').test(info.name) : true;
      let categoryOk = categoryValue ? info.category === categoryValue : true;
      let priceOk = info.price >= minRangeValue && info.price <= maxRangeValue;
      let tagsOk = activeTags ? activeTags.every(tag => info.tags.includes(tag)) : true;

      if (searchOk && categoryOk && priceOk && tagsOk) filteredGoods.push(good);

    });

    sortByHandler(sortByValue, filteredGoods);
    showSelectedFilters(searchVal);
    currentPage = 1;
    renderPagination();

  }

  function sortByHandler(value, arr) {

    switch (value) {

      case 'newest':

        arr.sort((a, b) => b._data.time - a._data.time);
        break;

      case 'oldest':

        arr.sort((a, b) => a._data.time - b._data.time);
        break;

      case 'expensive':

        arr.sort((a, b) => b._data.price - a._data.price);
        break;

      case 'cheap':

        arr.sort((a, b) => a._data.price - b._data.price);
        break;

      case 'popular':

        arr.sort((a, b) => a._data.popularity - b._data.popularity);
        break;

    }

  }

  function calculatePagination(element) {

    switch (element.dataset.selectVar) {

      case 'sort_show_default':
        goodsPerPage = 15;
        break;

      case 'sort_show_18':
        goodsPerPage = 18;
        break;

      case 'sort_show_21':
        goodsPerPage = 21;
        break;

      case 'sort_show_24':
        goodsPerPage = 24;
        break;

      case 'sort_show_27':
        goodsPerPage = 27;
        break;

    }

    currentPage = 1;
    showSelectedFilters(marketSearch._lastValue || '');
    renderPagination();

  }

  function showSelectedFilters(searchValue) {

    currentFiltersBlock.innerHTML = '';

    let categoryInput = document.querySelector('.check-list__input:checked');

    let minRangeValue = Math.trunc(priceRange._current.min);
    let maxRangeValue = Math.trunc(priceRange._current.max);

    let min = Math.trunc(priceRange.noUiSlider.options.range.min);
    let max = Math.trunc(priceRange.noUiSlider.options.range.max);

    let activeTags = getActiveTags();

    let sortByVar = select_sortBy._selectedVariant;
    let showVar = document.querySelector('.market__custom-select--show [data-select]')._selectedVariant;

    let hasFilters = false;

    if (searchValue) {

      hasFilters = true;

      createFilterItem('Search', `"${searchValue}"`, () => {

        marketSearch.value = '';
        marketSearch._lastValue = '';

        sortGoods();

      });

    }

    if (sortByVar && sortByVar.dataset.selectVar !== 'default') {

      hasFilters = true;

      createFilterItem(
        'Sort By',
        sortByVar.querySelector('[data-select-var-text]').textContent,
        () => {

          document.querySelector(
            '.market__custom-select--sortBy [data-select-var="default"]'
          ).click();

        }
      );

    }

    if (showVar && showVar.dataset.selectVar !== 'sort_show_default') {

      hasFilters = true;

      createFilterItem(
        'Show',
        showVar.querySelector('[data-select-var-text]').textContent,
        () => {

          document.querySelector(
            '.market__custom-select--show [data-select-var="sort_show_default"]'
          ).click();

        }
      );

    }

    if (categoryInput) {

      hasFilters = true;

      let catValue = categoryInput.parentElement.querySelector('.check-list__text')?.textContent;

      createFilterItem('Category', catValue, () => {

        categoryInput.checked = false;

        sortGoods();

      });

    }

    if (minRangeValue !== min || maxRangeValue !== max) {

      hasFilters = true;

      createFilterItem(
        'Price',
        `$${minRangeValue} - $${maxRangeValue}`,
        () => {

          priceRange.noUiSlider.set([min, max]);

          sortGoods();

        }
      );

    }

    if (activeTags?.length) {

      activeTags.forEach((tag) => {

        hasFilters = true;

        let input = document.querySelector(`.tags-check__input[value="${tag}"]`);
        let tagName = input.parentElement.querySelector('label')?.textContent;

        createFilterItem('Tag', tagName, () => {

          let input = document.querySelector(
            `.tags-check__input[value="${tag}"]`
          );

          if (input) {
            input.checked = false;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }

          sortGoods();

        });

      });

    }

    let filtersCount = currentFiltersBlock.children.length;

    if (filtersCount > 1) {

      let clearBtn = document.createElement('button');

      clearBtn.type = 'button';
      clearBtn.className = 'market__filters-clear tes-text';
      clearBtn.textContent = 'Clear all';

      clearBtn.addEventListener('click', clearAllFilters);

      currentFiltersBlock.prepend(clearBtn);

    }

    mainBlock.classList.toggle('active', hasFilters);

  }

  function createFilterItem(name, value, removeHandler) {

    let item = document.createElement('div');
    item.className = 'selected-filter market__selected-filter';

    item.innerHTML = `
      <span class="selected-filter__name tes-text">${name}:</span>
      <span class="selected-filter__value tes-text">${value}</span>
      <button class="selected-filter__remove" type="button">&times;</button>
    `;

    item
      .querySelector('.selected-filter__remove')
      .addEventListener('click', removeHandler);

    currentFiltersBlock.append(item);

  }

  function clearAllFilters() {

    marketSearch.value = '';
    marketSearch._lastValue = '';

    document
      .querySelectorAll('.check-list__input')
      .forEach(input => input.checked = false);

    document
      .querySelectorAll('.tags-check__input')
      .forEach(input => input.checked = false);

    let min = Math.trunc(priceRange.noUiSlider.options.range.min);
    let max = Math.trunc(priceRange.noUiSlider.options.range.max);

    priceRange.noUiSlider.set([min, max]);

    document
      .querySelector('.market__custom-select--sortBy [data-select-var="default"]')
      .click();

    document
      .querySelector('.market__custom-select--show [data-select-var="sort_show_default"]')
      .click();

    sortGoods();

  }

  function showSelectedGoods(goods) {

    goodsArea.innerHTML = '';

    if (!goods.length) {

      goodsArea.innerHTML = `
        <span class="market__no-goods bold-text">No products found</span>
      `;

      return;

    }

    let fragment = document.createDocumentFragment();

    goods.forEach((good) => {

      good.classList.add('appear');
      fragment.append(good);

      setTimeout(() => {
        good.classList.remove('appear');
      }, 400);
    });

    goodsArea.append(fragment);

  }

  function renderPagination(state = true) {

    if (!filteredGoods.length) {

      pagination.classList.add('hidden');

      showSelectedGoods([]);

      return;

    }

    pagination.classList.remove('hidden');

    const totalPages = Math.ceil(filteredGoods.length / goodsPerPage);

    currentPage = Math.min(currentPage, totalPages);
    currentPage = Math.max(currentPage, 1);

    const start = (currentPage - 1) * goodsPerPage;
    const end = start + goodsPerPage;

    showSelectedGoods(filteredGoods.slice(start, end));
    renderPaginationButtons(totalPages);
    
  }

  function renderPaginationButtons(totalPages) {

    paginationBody.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {

      const btn = document.createElement('button');

      btn.type = 'button';
      btn.className = 'pagination__btn menu-text';
      btn.textContent = i;

      if (i === currentPage) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {

        if (currentPage === i) return;
        currentPage = i;
        renderPagination();

      });

      paginationBody.append(btn);

    }

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

  }

  function getActiveTags() {

    let checkedInputs = Array.from(document.querySelectorAll('.tags-check__input:checked'));

    if (!checkedInputs.length) return;

    let result = [];

    checkedInputs.forEach((item) => result.push(item.value));

    return result;

  }

  function writeDataToGoods(data) {

    if (!data) return;

    data.forEach((item) => {

      let card = document.querySelector(`#${item.id}`);
      if (card) card._data = item;

    });

  }

}


pageScrollSmoother();
customRange();
favoriteButtonHandler();
goodsSortHandler();