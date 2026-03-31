class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

static renderPage(searchParams, event, updateURLHash = true) {
  FacetFiltersForm.searchParamsPrev = searchParams;
  const sections = FacetFiltersForm.getSections();
  const countContainer = document.getElementById('ProductCount');
  const countContainerDesktop = document.getElementById('ProductCountDesktop');
  document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');

  if (countContainer) {
    countContainer.classList.add('loading');
  }
  if (countContainerDesktop) {
    countContainerDesktop.classList.add('loading');
  }

  sections.forEach((section) => {
    const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
    const filterDataUrl = element => element.url === url;

    FacetFiltersForm.filterData.some(filterDataUrl) ?
      FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
      FacetFiltersForm.renderSectionFromFetch(url, event);
  });

  if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
}

static renderSectionFromFetch(url, event) {
  fetch(url)
    .then(response => response.text())
    .then((responseText) => {
      const html = responseText;
      FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
      
      FacetFiltersForm.renderFilters(html, event);
      FacetFiltersForm.renderProductGridContainer(html);
      FacetFiltersForm.renderProductCount(html);
    })
    .catch((error) => {
      console.error('Error fetching filtered products:', error);
    });
}

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

static renderProductGridContainer(html) {
  const parser = new DOMParser();
  const newDocument = parser.parseFromString(html, 'text/html');

  const newProductGridContainer = newDocument.getElementById('ProductGridContainer');
  if (newProductGridContainer) {
    const gridContainer = document.getElementById('ProductGridContainer');
    gridContainer.innerHTML = newProductGridContainer.innerHTML;

    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  } else {
    console.error('Product grid container not found in the fetched HTML.');
  }

  document.getElementById('ProductGridContainer').classList.remove('loading');
}


  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    container.classList.remove('loading');
    console.log('products-rendered');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }

    document.querySelectorAll('.fade-in-element').forEach(element => {
      element.classList.add('fade-in');
    });    
  }

static renderFilters(html, event) {
  const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

  const facetDetailsElements =
    parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter');
  const matchesIndex = (element) => {
    const jsFilter = event ? event.target.closest('.js-filter') : undefined;
    return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
  }
  const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
  const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

  facetsToRender.forEach((element) => {
    document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
  });

  FacetFiltersForm.renderActiveFacets(parsedHTML);
  // FacetFiltersForm.renderAdditionalElements(parsedHTML);

  const urlParams = new URLSearchParams(window.location.search);

  const vendorFilter = document.querySelector('#VendorFilter');
  if (vendorFilter) {
    const currentVendor = urlParams.get('filter.p.vendor');
    vendorFilter.value = currentVendor || '';
  }

  const productTypeFilter = document.querySelector('#ProductTypeFilter');
  if (productTypeFilter) {
    const currentProductType = urlParams.get('filter.p.product_type');
    productTypeFilter.value = currentProductType || '';
  }

  const sortByFilter = document.querySelector('#SortBy');
  if (sortByFilter) {
    const currentSort = urlParams.get('sort_by');
    sortByFilter.value = currentSort || '';
  }

  if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
}


  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    const targetElementAccessibility = target.querySelector('.facets__summary');
    const sourceElementAccessibility = source.querySelector('.facets__summary');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector('.facets__summary').outerHTML = source.querySelector('.facets__summary').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
  
    const vendorFilter = form.querySelector('#VendorFilter');
    if (vendorFilter && vendorFilter.value) {
      params.set('vendor', vendorFilter.value);
    } else {
      params.delete('vendor');
    }
 
    const productTypeFilter = form.querySelector('#ProductTypeFilter');
    if (productTypeFilter && productTypeFilter.value) {
      params.set('product_type', productTypeFilter.value);
    } else {
      params.delete('product_type');
    }
  
    return params.toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

onSubmitHandler(event) {
  event.preventDefault();

  // Initialize searchParams from the current URL, or create new if none exist
  const searchParams = new URLSearchParams(window.location.search || '');

  // Process all forms and add or remove parameters based on user input
  const forms = document.querySelectorAll('facet-filters-form form');

  forms.forEach((form) => {
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      if (value) {
        searchParams.set(key, value);  // Set the parameter if it has a value
      } else {
        searchParams.delete(key);  // Remove the parameter if it does not have a value
      }
    });
  });

  // Specific handling for vendor filter
  const vendorFilter = document.querySelector('#VendorFilter');
  if (vendorFilter && vendorFilter.value) {
    searchParams.set('filter.p.vendor', vendorFilter.value);
  } else {
    searchParams.delete('filter.p.vendor');
  }

  // Specific handling for product type filter
  const productTypeFilter = document.querySelector('#ProductTypeFilter');
  if (productTypeFilter && productTypeFilter.value) {
    searchParams.set('filter.p.product_type', productTypeFilter.value);
  } else {
    searchParams.delete('filter.p.product_type');
  }

  // Specific handling for sort by filter
  const sortByFilter = document.querySelector('#SortBy');
  if (sortByFilter && sortByFilter.value) {
    searchParams.set('sort_by', sortByFilter.value);
  } else {
    searchParams.delete('sort_by');
  }

  // Convert searchParams back to a string and submit the form
  this.onSubmitForm(searchParams.toString(), event);
}

onSubmitForm(searchParams, event) {
  FacetFiltersForm.renderPage(searchParams, event);
}

onSubmitForm(searchParams, event) {
  FacetFiltersForm.renderPage(searchParams, event);
}

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    
    const facetLink = this.querySelector('a');
    
    if (facetLink) {
      facetLink.setAttribute('role', 'button');
      facetLink.addEventListener('click', this.closeFilter.bind(this));
      facetLink.addEventListener('keyup', (event) => {
        event.preventDefault();
        if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
      });
    } else {
      console.error('Facet link not found in FacetRemove component.');
    }
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);

document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);

  const vendorFilter = document.querySelector('#VendorFilter');
  if (vendorFilter) {
    const currentVendor = urlParams.get('filter.p.vendor');
    vendorFilter.value = currentVendor || '';
  }

  const productTypeFilter = document.querySelector('#ProductTypeFilter');
  if (productTypeFilter) {
    const currentProductType = urlParams.get('filter.p.product_type');
    productTypeFilter.value = currentProductType || '';
  }
});