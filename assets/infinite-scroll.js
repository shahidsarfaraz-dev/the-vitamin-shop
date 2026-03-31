document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get('page'), 10) || 1;
  const productGrid = document.querySelector('#product-grid');
  const pagination = document.querySelector('.pagination');
  const loadMoreButton = document.getElementById('load-more');
  const loadingIndicator = document.getElementById('loading-indicator');
  const maxItemsBeforeFallback = 560;
  let loadedItemCount = 0;
  let isScrollEnabled = false;
  let isLoading = false;

  if (currentPage >= 2) {
    const facetFiltersForm = document.querySelector('#FacetFiltersForm');
    const facetFiltersFormMobile = document.querySelector('.facets-container');
    if (facetFiltersForm) {
      facetFiltersForm.style.display = 'none';
      facetFiltersFormMobile.style.display = 'none';
    }
  }

  const showLoadingIndicator = () => {
    loadingIndicator.style.display = 'block';
  };

  const hideLoadingIndicator = () => {
    loadingIndicator.style.display = 'none';
  };

  const loadMoreProducts = () => {
    if (isLoading) return;

    const nextPageLink = pagination.querySelector('.next_button');
    if (!nextPageLink) {
      hideLoadingIndicator();
      removeScrollListener();
      return;
    }

    isLoading = true;
    showLoadingIndicator();

    fetch(nextPageLink.href)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const newProducts = doc.querySelectorAll('#product-grid > li');
        newProducts.forEach((product) => productGrid.appendChild(product));
        loadedItemCount += newProducts.length;

        if (loadedItemCount >= maxItemsBeforeFallback) {
          console.log('Max items loaded, switching to normal pagination.');
          switchToNormalPagination();
          return;
        }

        const newPagination = doc.querySelector('.pagination');
        if (newPagination) {
          pagination.innerHTML = newPagination.innerHTML;
        } else {
          pagination.remove();
          removeScrollListener();
        }
      })
      .catch((error) => console.error('Error loading next page:', error))
      .finally(() => {
        isLoading = false;
        hideLoadingIndicator();
      });
  };

  const handleLoadMoreClick = (event) => {
    event.preventDefault();
    loadMoreProducts();
    loadMoreButton.remove();
    isScrollEnabled = true;
    attachScrollListener();
  };

  const handleScroll = () => {
    const lastProduct = document.querySelector('#product-grid > li:last-child');
    if (!lastProduct || isLoading) return;

    const lastProductPosition = lastProduct.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (lastProductPosition <= windowHeight + 100) {
      loadMoreProducts();
    }
  };

  const attachScrollListener = () => {
    if (isScrollEnabled) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  };

  const removeScrollListener = () => {
    window.removeEventListener('scroll', handleScroll);
  };

  const switchToNormalPagination = () => {
    removeScrollListener();
    loadMoreButton?.remove();
    loadingIndicator?.remove();
    pagination.style.display = 'block';
  };

  if (currentPage >= 2) {
    isScrollEnabled = true;
    attachScrollListener();
    if (loadMoreButton) loadMoreButton.remove();
  } else {
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', handleLoadMoreClick);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.querySelector('#ProductGridContainer');
  if (!productGrid || !document.body.classList.contains('search-results-page')) {
    return;
  }

  const pagination = document.querySelector('.pagination');
  const loadMoreButton = document.getElementById('load-more');
  const loadingIndicator = document.getElementById('loading-indicator');
  let isLoading = false;

  const showLoadingIndicator = () => {
    loadingIndicator.style.display = 'block';
  };

  const hideLoadingIndicator = () => {
    loadingIndicator.style.display = 'none';
  };

  const loadMoreProducts = () => {
    if (isLoading || !pagination) return;

    const nextButton = pagination.querySelector('.next_button');
    if (!nextButton) {
      hideLoadingIndicator();
      return;
    }

    isLoading = true;
    showLoadingIndicator();

    fetch(nextButton.href)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const newProducts = doc.querySelectorAll('#product-grid > li');
        newProducts.forEach((product) => productGrid.querySelector('#product-grid').appendChild(product));

        const newPagination = doc.querySelector('.pagination');
        if (newPagination) {
          pagination.innerHTML = newPagination.innerHTML;
        } else {
          pagination.remove();
        }
      })
      .catch((error) => console.error('Error loading next page:', error))
      .finally(() => {
        isLoading = false;
        hideLoadingIndicator();
      });
  };

  if (pagination) {
    window.addEventListener('scroll', () => {
      const lastProduct = document.querySelector('#product-grid > li:last-child');
      if (!lastProduct || isLoading) return;

      const lastProductPosition = lastProduct.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (lastProductPosition <= windowHeight + 100) {
        loadMoreProducts();
      }
    });
  }

  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', (event) => {
      event.preventDefault();
      loadMoreProducts();
    });
  }
});
