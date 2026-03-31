$(function(){
  // === CONFIG ===
  var PAGE_LIMIT  = 250;
  var MAX_SHOW    = 7;
  var MAX_PAGES   = 3;
  var DEBOUNCE_MS = 140;

  // === ELEMENTS ===
  var $input = $('#SearchInput');
  if (!$input.length) return;

  var $form = $input.closest('form');
  var $wrap = $input.closest('.collection_search_field');
  var $dropdown = $('#CollectionPredictiveResults');
  var $list = $dropdown.find('.predictive-list');
  var $close = $dropdown.find('.close_predictive');
  var $viewAllBtn = $dropdown.find('button[type="submit"], a[href]');
  var $scroll = $dropdown.find('.scroll-predictions');

  if (!$dropdown.length || !$list.length) return;

  var handle = $input.data('collection-handle');
  if (!handle) {
    var m = (location.pathname || '').match(/\/collections\/([^\/\?]+)/);
    if (m && m[1]) handle = m[1];
  }
  if (!handle) return;

  // === HELPERS ===
  function escHtml(s) {
    return (s || '').toString()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escAttr(s) { return escHtml(s); }

  function productUrl(p) { return p && p.handle ? '/products/' + p.handle : '#'; }

  // Image resolver
  function productImage(p) {
    if (!p) return '';
    if (p.featured_image && p.featured_image.src) return p.featured_image.src;
    if (p.image && p.image.src) return p.image.src;
    if (Array.isArray(p.images) && p.images.length && p.images[0].src) return p.images[0].src;
    if (Array.isArray(p.variants) && p.variants.length) {
      var v0 = p.variants[0];
      if (v0 && v0.featured_image && v0.featured_image.src) return v0.featured_image.src;
      if (v0 && v0.image && v0.image.src) return v0.image.src;
    }
    return '';
  }

  function variantList(p) {
    if (!p.variants || !p.variants.length) return '';
    return p.variants
      .map(function (v) { return (v && v.title) ? v.title : ''; })
      .filter(function (t) { return t && t.toLowerCase() !== 'default title'; })
      .join(' / ');
  }

  function norm(s){ return (s||'').toString().toLowerCase(); }
  function haystack(p) {
    var t = (norm(p.title) + ' ' + norm(p.vendor));
    var tags = (p.tags || []).map(norm).join(' ');
    var skus = (p.variants || []).map(function(v){ return norm(v.sku); }).join(' ');
    return (t + ' ' + tags + ' ' + skus).trim();
  }

  function setActive($items, idx) {
    idx = Math.max(0, Math.min(idx, $items.length - 1));
    $items.attr('aria-selected', 'false').attr('tabindex', '-1');
    var $el = $items.eq(idx).attr('aria-selected', 'true').attr('tabindex', '0');
    return $el;
  }
  
  function ensureVisible($container, $el) {
    if (!$el.length) return;
    var c = $container.get(0);
    var e = $el.get(0);
    var cTop = c.scrollTop;
    var cBottom = cTop + c.clientHeight;
    var eTop = e.offsetTop;
    var eBottom = eTop + e.offsetHeight;
  
    if (eTop < cTop) {
      c.scrollTop = eTop;
    } else if (eBottom > cBottom) {
      c.scrollTop = eBottom - c.clientHeight;
    }
  }


  function hideDropdown() {
    $dropdown.attr('hidden', true);
    $list.empty();
    $input.attr('aria-expanded', 'false');
  }

  function showDropdown() {
    $dropdown.removeAttr('hidden');
    $input.attr('aria-expanded', 'true');
  }

  // Build a /search URL that mirrors the form (type, filter, view) + q
  function buildSearchURL(q) {
    var action = $form.attr('action') || '{{ routes.search_url }}';
    try {
      var u = new URL(action, window.location.origin);
      u.searchParams.set('q', q || '');
      $form.find('input[name]').each(function(){
        var name = this.name, val = this.value;
        if (name === 'q') return;
        if (val != null && val !== '') u.searchParams.set(name, val);
      });
      return u.toString();
    } catch (e) {
      return action + '?q=' + encodeURIComponent(q || '');
    }
  }

  function fetchNativeSearchJSON(q) {
    var base = $form.attr('action') || '/search';
    var url = base
      + '?type=product'
      + '&filter.p.m.custom.map=true'
      + '&view=predictive'
      + '&q=' + encodeURIComponent(q);
    return $.getJSON(url);
  }

  // Map products by handle so we can resolve Shopify's predictive results quickly
  function indexByHandle(arr) {
    var map = Object.create(null);
    for (var i = 0; i < arr.length; i++) {
      var h = arr[i] && arr[i].handle;
      if (h) map[h] = arr[i];
    }
    return map;
  }

// Call Shopify Predictive Search for products in native relevance order
function fetchPredictiveProducts(query) {
  var url = '/search/suggest.json?q=' + encodeURIComponent(query) +
            '&resources[type]=product' +
            '&resources[limit]=10';
  return $.getJSON(url).then(function (data) {
    var items = (data && data.resources && data.resources.results && data.resources.results.products) || [];
    return items.map(function (p) { return p.handle; });
  });
}


  // === RENDER ===
  function render(items, q) {
    if (!items || !items.length) {
      hideDropdown();
      return;
    }

    var html = items.map(function (p, i) {
      var img = productImage(p);
      var vendor = p.vendor ? escHtml(p.vendor) : '';
      var variants = variantList(p);
      var sub = vendor + (variants ? ' — ' + escHtml(variants) : '');

      var media = img
        ? '<div class="predictive-thumb" ><img src="' + escAttr(img) + '" alt="" loading="lazy"></div>'
        : '<div class="predictive-thumb predictive-thumb--placeholder"></div>';

      return (
        '<a href="' + escAttr(productUrl(p)) + '" ' +
           'class="predictive-item" role="option" data-index="' + i + '" ' +
           'aria-selected="false" tabindex="-1">' +
          media +
          '<div class="predictive-text">' +
            '<div class="predictive-title">' + escHtml(p.title) + '</div>' +
            '<div class="predictive-sub">' + sub + '</div>' +
          '</div>' +
        '</a>'
      );
    }).join('');

    $list.html(html);
    showDropdown();

    // var $items = $list.find('a.predictive-item');
    // setActive($items, 0);

    if (items.length >= MAX_SHOW) {
      $viewAllBtn.show();
    
      if ($viewAllBtn.is('a')) {
        $viewAllBtn.attr('href', buildSearchURL(q));
      }
    } else {
      $viewAllBtn.hide();
    }
  }

  // === DATA ===
  var products = [];
  var loaded = false;
  var loading = false;

  function loadProductsAll() {
    if (loaded) return $.Deferred().resolve(products).promise();
    if (loading) return loading;
  
    var dfd = $.Deferred();
    loading = dfd.promise();
  
    var all = [];
    var page = 1;
  
    function fetchPage() {
      $.getJSON('/collections/' + encodeURIComponent(handle) + '/products.json', {
        limit: PAGE_LIMIT,
        page: page
      })
      .done(function (data) {
        var batch = (data && data.products) || [];
        all = all.concat(batch);
        if (batch.length < PAGE_LIMIT || page >= MAX_PAGES) {
          products = all;
          loaded = true;
          var tmp = loading; loading = false;
          dfd.resolve(products);
        } else {
          page += 1;
          fetchPage();
        }
      })
      .fail(function () {
        products = all;
        loaded = true;
        var tmp = loading; loading = false;
        dfd.resolve(products);
      });
    }
  
    fetchPage();
    return dfd.promise();
  }

  // === INPUT ===
  var debounceId = null;

  $input
    .attr({
      autocomplete: 'off',
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
      'aria-controls': 'CollectionPredictiveResults'
    })
    .on('focus', function () { loadProductsAll(); })
    .on('input', function () {
      var q = $.trim(this.value).toLowerCase();
      clearTimeout(debounceId);

      if (!q) { hideDropdown(); return; }
      if (!loaded) loadProducts();

      debounceId = setTimeout(function () {
        var q = $.trim($input.val() || '');
        if (!q) { hideDropdown(); return; }

        function runNative() {
          fetchNativeSearchJSON(q).done(function (arr) {
            if (Array.isArray(arr) && arr.length) {
              var items = arr.slice(0, MAX_SHOW);
              render(items, q.toLowerCase());
            } else {
              hideDropdown();
            }
          }).fail(function () {
            var qLower = q.toLowerCase();
            var results = products
              .filter(function (p) { return haystack(p).indexOf(qLower) !== -1; })
              .slice(0, MAX_SHOW);
            results.length ? render(results, qLower) : hideDropdown();
          });
        }

        if (!loaded) { loadProductsAll().then(runNative); } else { runNative(); }
      }, DEBOUNCE_MS);


    })

    .on('keydown', function (e) {
      if ($dropdown.is('[hidden]')) return;
    
      var $items = $list.find('a.predictive-item');
      if (!$items.length) return;
    
      if (e.key === 'ArrowDown') {
        e.preventDefault(); // don’t scroll page
        // move focus to first active item
        var $active = $items.filter('[aria-selected="true"]');
        var idx = $active.length ? parseInt($active.data('index'), 10) : 0;
        var $el = setActive($items, idx);
        $el.focus();
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    });

    $dropdown.on('keydown', 'a.predictive-item', function (e) {
      var $items = $list.find('a.predictive-item');
      if (!$items.length) return;
    
      var $current = $(this);
      var idx = parseInt($current.data('index'), 10) || 0;
    
      if (e.key === 'ArrowDown' && idx === $items.length - 1) {
        e.preventDefault();
        $viewAllBtn.focus();
        ensureVisible($scroll.length ? $scroll : $list, $viewAllBtn);
        return;
      }
    
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var next = Math.min(idx + 1, $items.length - 1);
        var $el = setActive($items, next);
        $el.focus();
        ensureVisible($scroll.length ? $scroll : $list, $el);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = Math.max(idx - 1, 0);
        var $el = setActive($items, prev);
        $el.focus();
        ensureVisible($scroll.length ? $scroll : $list, $el);
      } else if (e.key === 'Home') {
        e.preventDefault();
        var $el = setActive($items, 0);
        $el.focus();
        ensureVisible($scroll.length ? $scroll : $list, $el);
      } else if (e.key === 'End') {
        e.preventDefault();
        var $el = setActive($items, $items.length - 1);
        $el.focus();
        ensureVisible($scroll.length ? $scroll : $list, $el);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        hideDropdown();
        $input.trigger('focus');
      }
    });

    $dropdown.on('keydown', '.scroll-predictions button[type="submit"]', function (e) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        var $items = $list.find('a.predictive-item');
        if ($items.length) {
          var $el = setActive($items, $items.length - 1);
          $el.focus();
          ensureVisible($scroll.length ? $scroll : $list, $el);
        } else {
          $input.trigger('focus');
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        hideDropdown();
        $input.trigger('focus');
      }
    });

  // Close + outside click
  $close.on('click', function (e) { e.preventDefault(); hideDropdown(); $input.trigger('focus'); });
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.collection_search_field, #CollectionPredictiveResults').length) hideDropdown();
  });
  $input.on('blur', function () {
    setTimeout(function () {
      if (!document.activeElement || !$(document.activeElement).closest('#CollectionPredictiveResults').length) hideDropdown();
    }, 150);
  });

  // Keep the “View all results” button/anchor in sync on submit
  if ($viewAllBtn.is('a')) {
    $viewAllBtn.on('mousedown keydown', function () {
      var q = $.trim($input.val() || '').toLowerCase();
      $(this).attr('href', buildSearchURL(q));
    });
  }
});