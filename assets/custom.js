$( document ).ready(function() {
  $(".product-accordion-group input:checkbox").on('click', function() {
    var $box = $(this);
    if ($box.is(":checked")) {
      var group = "input:checkbox[name='" + $box.attr("name") + "']";
      $(group).prop("checked", false);
      $box.prop("checked", true);
    } else {
      $box.prop("checked", false);
    }
  });
  let mouseEnter = null
  $(document).on("mouseenter", ".top-level-menu-item", (e) => {
    mouseEnter = true
    setTimeout(() => {
      if (mouseEnter) {
        $(e.target).closest(".top-level-menu-item").addClass('toggled-open')
      }
    }, 500)
  })
  $(document).on("mouseleave", ".top-level-menu-item", (e) => {
    mouseEnter = false
    $(e.target).closest(".top-level-menu-item").removeClass('toggled-open')
  })
});

/* Wishlist Functionality */

// blog page filtering
$( document ).ready(function() {
  var articles = $( ".blog-articles .blog-articles__article" ).each(function( index ) {
    articleCategory = $(this).data('category');
    categoryString = articleCategory.replace(/\s+/g, '-').toLowerCase();
    if (window.location.href.indexOf("health-tips") > -1) {
      if(categoryString == 'physician-recommendations'){
        $(this).remove();
      }
    }
    if (window.location.href.indexOf("physician-recommendations") > -1) {
      if(categoryString == 'health-tips'){
        $(this).remove();
      }      
    }    
  });
  if (window.location.href.indexOf("health-tips") > -1) {
    $('.title--primary').text('Health Tips');
  }
  if (window.location.href.indexOf("physician-recommendations") > -1) {
    $('.title--primary').text('Physician Recommendations');
  }
  if (window.location.href.indexOf("brad-kings-ultimate-advantage") > -1) {
    $('.title--primary').text("Brad King's Ultimate Advantage");
  }  
  if (window.location.href.indexOf("genuine-health-for-a-healthy-lifestyle") > -1) {
    $('.title--primary').text("Genuine Health For a Healthy Lifestyle");
  }
  if (window.location.href.indexOf("womensense-products-designed-specifically-for-women") > -1) {
    $('.title--primary').text("WomenSense");
  }
  if (window.location.href.indexOf("womensense-products-designed-specifically-for-women") > -1) {
    $('.title--primary').text("WomenSense");
  }
  if (window.location.href.indexOf("sisu-vitamins-health-for-life") > -1) {
    $('.title--primary').text("Sisu Vitamins - Health for Life");
  }
  if (window.location.href.indexOf("aor-canada-orthomolecular-supplementation") > -1) {
    $('.title--primary').text("AOR Canada");
  }
  if (window.location.href.indexOf("prairie-naturals-live-the-healthy-life") > -1) {
    $('.title--primary').text("Prairie Naturals Live the Healthy Life");
  }
  if (window.location.href.indexOf("purica-nature-science-you") > -1) {
    $('.title--primary').text("Purica - Nature. Science. You.");
  }
});

// blog page load more posts
$(document).ready(function() {
  var articlesToShow = 16;
  var increment = 8;

  function showArticles() {
    $('.blog-articles .blog-articles__article').each(function(index) {
      if (index < articlesToShow) {
        $(this).css('display', 'block');
      } else {
        $(this).css('display', 'none');
      }
    });
  }

  showArticles();

  if ($('.blog-articles .blog-articles__article').length <= articlesToShow) {
    $('#loadPosts').hide();
  }

  $('#loadPosts').click(function(event) {
    event.preventDefault()
    articlesToShow += increment;
    showArticles();

    if ($('.blog-articles .blog-articles__article').length <= articlesToShow) {
      $(this).hide();
    }
  });
});

// fade-in effect on scroll
$(document).ready(function() {
  function checkIfInView() {
      $('.fade-in-element').each(function() {
          var elementTop = $(this).offset().top;
          var windowBottom = $(window).scrollTop() + $(window).height();

          if (elementTop < windowBottom) {
              $(this).addClass('fade-in');
          }
      });
  }

  checkIfInView();

  $(window).on('scroll', function() {
      checkIfInView();
  });
  
});

// output youtube video thumbnail for educational videos post type
$(document).ready(function() {
    $('.video-library-embed').each(function() {
        var videoUrl = $(this).data('video');
        
        var videoIdMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        
        var fallbackImageUrl = 'https://cdn.shopify.com/s/files/1/0735/4164/8666/files/video-post-placeholder.jpg?v=1719365446'; // Change this to the actual path of your fallback image
        
        if (videoIdMatch && videoIdMatch[1]) {
            var videoId = videoIdMatch[1];
            
            var thumbnailUrl = 'https://img.youtube.com/vi/' + videoId + '/0.jpg';
            
            var $this = $(this);
            var img = new Image();
            img.onload = function() {
                $this.css('background-image', 'url(' + thumbnailUrl + ')');
            };
            img.onerror = function() {
                $this.css('background-image', 'url(' + fallbackImageUrl + ')');
            };
            img.src = thumbnailUrl;
        } else {
            $(this).css('background-image', 'url(' + fallbackImageUrl + ')');
        }
    });
});


// reformat embed urls on individual article pages for video library
$(document).ready(function() {
    $('iframe.article-video').each(function() {
        var videoUrl = $(this).data('video-url');
        if (videoUrl) {
            var videoId = videoUrl.split('v=')[1];
            var ampersandPosition = videoId.indexOf('&');
            if(ampersandPosition != -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
            var embedUrl = 'https://www.youtube.com/embed/' + videoId;
            $(this).attr('src', embedUrl);
        }
    });
});

// accordions on orders/my account page
$(document).ready(function() {
    $('.mobile-table-row-header').click(function() {
        $(this).next('tr').toggleClass('active');
        $(this).toggleClass('active');
    });  
});
$(document).ready(function() {
    setTimeout(function() {
        $('#shopwaive_acct_table_history').on('click', 'tr', function() {
            $(this).toggleClass('active');
        });
    }, 2000);
});


// megamenu overflow adjustment
$(document).ready(function() {
    function calculateAndApplyDistance() {
        var elementBottom = $('.header-wrapper').offset().top + $('.header-wrapper').outerHeight();
        var viewportBottom = $(window).scrollTop() + $(window).height();
        var distance = viewportBottom - elementBottom;
        $('.submenu-child').css('max-height', distance + 'px');
    }

    calculateAndApplyDistance();

    $(window).scroll(function() {
        calculateAndApplyDistance();
    });

    $(window).resize(function() {
        calculateAndApplyDistance();
    });
});

// fix scroll position on account pages
$(document).on('click', 'a[href="#recover"], a[href="#login"]', function () {
    setTimeout(function () {
        $(window).scrollTop(0);
    }, 10);
});


// custom mobile menu
$(document).ready(function() {  
  $('.header__icon--menu').click(function(){
    $('body').toggleClass('mobile-menu-active');
  });
  $('.mobile-menu-custom-parent-title a').click(function(e) {
    if (!$(this).hasClass('mobile-menu-home')) {
      e.preventDefault();
      $(this).toggleClass('active');
      $(this).closest('li').children('.mobile-menu-custom-childlinks').toggleClass('active');
    }
  });
  
});

// fix for scroll offset on internal urls
$(document).ready(function() {
    if ($('body').hasClass('template-page-brands') || $('body').hasClass('template-product')) {
        function scrollToHash(hash) {
            var target = $(hash);
            if (target.length) {
                var headerHeight = 250;
                $('html, body').animate({
                    scrollTop: target.offset().top - headerHeight
                }, 500, 'linear');
            }
        }

        $('a[href^="#"]').click(function(e) {
            e.preventDefault();
            var hash = this.hash;
            scrollToHash(hash);
        });

        if (window.location.hash) {
            scrollToHash(window.location.hash);
        }
    }
});

/* Promotional Carousel */

$(document).ready(function () {
  var $carouselWrapper = $('.carousel-wrapper');
  var $carousel = $carouselWrapper.find('ul');
  var $items = $carouselWrapper.find('.carousel-item');
  var $leftArrow = $('.carousel-arrow-left');
  var $rightArrow = $('.carousel-arrow-right');
  var currentIndex = 0;
  var swipeThreshold = 50;
  var tapThreshold = 10;
  var autoSlideInterval = parseInt($carouselWrapper.data('speed'), 10);
  var timer;

  var $firstClones = $items.slice(0, 2).clone();
  var $lastClones = $items.slice(-2).clone();
  $carousel.append($firstClones);
  $carousel.prepend($lastClones);

  function calculateSlideWidth() {
    var windowWidth = $(window).width();
    var slidesToShow = windowWidth < 1140 ? 1 : 2;
    var slideWidth = $('.carousel-container').width() / slidesToShow;
    $items.add($firstClones).add($lastClones).css('width', slideWidth);
    return {
      slideWidth: slideWidth,
      slidesToShow: slidesToShow
    };
  }

  var settings = calculateSlideWidth();
  var maxIndex = $items.length - 1;

  $carousel.css('transform', 'translateX(-' + settings.slideWidth * 2 + 'px)');

  function updateCarousel(transition = true) {
    var transformValue = -(settings.slideWidth * (currentIndex + 2));
    $carousel.css({
      transform: 'translateX(' + transformValue + 'px)',
      transition: transition ? 'transform 0.5s ease' : 'none',
    });

    if (currentIndex < 0) {
      setTimeout(() => {
        currentIndex = maxIndex;
        updateCarousel(false);
      }, 500);
    } else if (currentIndex > maxIndex) {
      setTimeout(() => {
        currentIndex = 0;
        updateCarousel(false);
      }, 500);
    }

    updateArrows();
  }

  function updateArrows() {
    $leftArrow.toggleClass('enabled-arrow', true);
    $rightArrow.toggleClass('enabled-arrow', true);
  }

  function nextSlide() {
    currentIndex++;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex--;
    updateCarousel();
  }

  function resetTimer() {
    clearInterval(timer);
    if (autoSlideInterval > 0) {
      timer = setInterval(nextSlide, autoSlideInterval);
    }
  }

  $rightArrow.click(function () {
    nextSlide();
    resetTimer();
  });

  $leftArrow.click(function () {
    prevSlide();
    resetTimer();
  });

  var startX, endX, startTime, endTime;
  var isSwipe = false;

  $carousel.on('touchstart', function (e) {
    startX = e.originalEvent.touches[0].clientX;
    startTime = new Date().getTime();
    isSwipe = false;
    e.stopPropagation();
  });

  $carousel.on('touchmove', function (e) {
    endX = e.originalEvent.touches[0].clientX;
    var swipeDistance = startX - endX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      isSwipe = true;
    }

    e.stopPropagation();
  });

  $carousel.on('touchend', function (e) {
    var swipeDistance = startX - endX;
    endTime = new Date().getTime();
    var elapsedTime = endTime - startTime;

    e.stopPropagation();

    if (isSwipe) {
      if (swipeDistance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetTimer();
    } else if (Math.abs(swipeDistance) < tapThreshold && elapsedTime < 200) {
      return;
    }
  });

  $(window).resize(function () {
    settings = calculateSlideWidth();
    maxIndex = $items.length - 1;
    updateCarousel(false);
    resetTimer();
  });

  $carouselWrapper.on('mouseenter', function () {
    clearInterval(timer);
  });

  $carouselWrapper.on('mouseleave', function () {
    resetTimer();
  });

  updateArrows();
  updateCarousel(false);
  if (autoSlideInterval > 0) {
    timer = setInterval(nextSlide, autoSlideInterval);
  }
});

/* Hero Carousel */

$(document).ready(function () {
  var $carouselWrapper = $('.hero-carousel-wrapper');
  var $carousel = $carouselWrapper.find('ul');
  var $items = $carouselWrapper.find('.hero-carousel-item');
  var $leftArrow = $('.hero-carousel-arrow-left');
  var $rightArrow = $('.hero-carousel-arrow-right');
  var $bulletsContainer = $('.hero-carousel-bullets');
  var currentIndex = 0;
  var swipeThreshold = 50;
  var autoSlideInterval = parseInt($carouselWrapper.data('speed'), 10);
  var timer;
  var $firstItems = $items.slice(0, 3).clone();
  var $lastItems = $items.slice(-3).clone();
  $carousel.append($firstItems);
  $carousel.prepend($lastItems);

  function calculateSlideWidth() {
    var windowWidth = $(window).width();
    var slidesToShow;

    if (windowWidth < 1140) {
      slidesToShow = 1;
    } else if (windowWidth >= 1140 && windowWidth < 1400) {
      slidesToShow = 2.7;
    } else {
      slidesToShow = 2.5;
    }

    var slideWidth = $carouselWrapper.width() / slidesToShow;
    $items.add($firstItems).add($lastItems).css('width', slideWidth);
    return {
      slideWidth: slideWidth,
      slidesToShow: slidesToShow,
    };
  }

  var settings = calculateSlideWidth();
  var maxIndex = $items.length - 1;

  $carousel.css('transform', 'translateX(-' + settings.slideWidth * 3 + 'px)');

  function updateCarousel(transition = true) {
    var transformValue = -(settings.slideWidth * (currentIndex + 3));
    $carousel.css({
      transform: 'translateX(' + transformValue + 'px)',
      transition: transition ? 'transform 0.5s ease' : 'none',
    });

    if (currentIndex < 0) {
      setTimeout(() => {
        currentIndex = maxIndex;
        updateCarousel(false);
      }, 500);
    } else if (currentIndex > maxIndex) {
      setTimeout(() => {
        currentIndex = 0;
        updateCarousel(false);
      }, 500);
    }

    updateBullets();
    updateArrows();
  }

  function updateArrows() {
    $leftArrow.toggleClass('enabled-arrow', true);
    $rightArrow.toggleClass('enabled-arrow', true);
  }

  function updateBullets() {
    var actualIndex = (currentIndex + maxIndex + 1) % (maxIndex + 1);
    $bulletsContainer.find('.hero-bullet').removeClass('active-bullet');
    $bulletsContainer.find(`.hero-bullet[data-index="${actualIndex}"]`).addClass('active-bullet');
  }

  function generateBullets() {
    $bulletsContainer.empty();
    for (let i = 0; i <= maxIndex; i++) {
      $bulletsContainer.append(
        `<div class="hero-bullet" data-index="${i}"></div>`
      );
    }
    updateBullets();
  }

  function moveToSlide(index) {
    currentIndex = index;
    updateCarousel();
    resetTimer();
  }

  function nextSlide() {
    currentIndex++;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex--;
    updateCarousel();
  }

  function resetTimer() {
    clearInterval(timer);
    if (autoSlideInterval > 0) {
      timer = setInterval(nextSlide, autoSlideInterval);
    }
  }

  $rightArrow.click(function () {
    nextSlide();
    resetTimer();
  });

  $leftArrow.click(function () {
    prevSlide();
    resetTimer();
  });

  $bulletsContainer.on('click', '.hero-bullet', function () {
    var index = parseInt($(this).data('index'), 10);
    moveToSlide(index);
  });

  var startX, endX, isSwipe = false;

  $carousel.on('touchstart', function (e) {
    startX = e.originalEvent.touches[0].clientX;
    isSwipe = false;
  });

  $carousel.on('touchmove', function (e) {
    endX = e.originalEvent.touches[0].clientX;
    if (Math.abs(startX - endX) > swipeThreshold) {
      isSwipe = true;
    }
  });

  $carousel.on('touchend', function () {
    var swipeDistance = startX - endX;
    if (isSwipe) {
      if (swipeDistance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetTimer();
    }
  });

  $(window).resize(function () {
    settings = calculateSlideWidth();
    maxIndex = $items.length - 1;
    updateCarousel(false);
    resetTimer();
  });

  $carouselWrapper.on('mouseenter', function () {
    clearInterval(timer);
  });

  $carouselWrapper.on('mouseleave', function () {
    resetTimer();
  });

  generateBullets();
  updateArrows();
  updateCarousel(false);
  if (autoSlideInterval > 0) {
    timer = setInterval(nextSlide, autoSlideInterval);
  }
});


/* Collections */

$(document).ready(function(){
  if (window.location.href.indexOf('filter.p.vendor') === -1) {
    $('#brand_filter_option_placeholder').text('Filter by brand');
  }
  if (window.location.href.indexOf('filter.p.type') === -1) {
    $('#type_filter_option_placeholder').text('Filter by type');
  }
});

// Header Position

$(document).ready(function () {
  var $header = $(".header-wrapper");
  var $placeholder = $("<div class='header-wrapper-ghost'></div>").hide();
  var headerOffset = $header.offset().top;

  // Insert the placeholder immediately before the header in the DOM
  $header.before($placeholder);

  // Update header offset on window resize
  $(window).resize(function () {
    headerOffset = $header.offset().top;
    $placeholder.height($header.outerHeight()); // Update placeholder height
  });

  $(window).scroll(function () {
    if ($(window).scrollTop() >= headerOffset) {
      $header.css({ position: "fixed", top: 0 });
      $placeholder.show(); // Show placeholder to prevent content jump
    } else {
      $header.css({ position: "relative", top: "auto" });
      $placeholder.hide(); // Hide placeholder when header is not fixed
    }
  });

  // Initial placeholder height
  $placeholder.height($header.outerHeight());
});