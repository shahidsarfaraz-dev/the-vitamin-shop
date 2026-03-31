$(document).ready(function () {
  const timeLimitHours = parseInt($('input#refresh_time').val(), 10);
  const timeLimit = timeLimitHours * 60 * 60 * 1000;

  const now = new Date().getTime();
  const closedTimestamp = localStorage.getItem('newsletterModalClosedTimestamp');

  if (closedTimestamp && now - parseInt(closedTimestamp, 10) > timeLimit) {
    localStorage.removeItem('newsletterModalClosed');
    localStorage.removeItem('newsletterModalClosedTimestamp');
  }

  let newsletterModalClosed = localStorage.getItem('newsletterModalClosed') === 'true';

  if (window.location.search.includes('customer_posted=true') && window.location.hash === '#NewsletterModal') {
    localStorage.setItem('newsletterModalClosed', 'true');
    localStorage.setItem('newsletterModalClosedTimestamp', now.toString());
    newsletterModalClosed = true;
  }

  if (!newsletterModalClosed) {
    $(window).on('scroll', function () {
      if (!newsletterModalClosed && $(window).scrollTop() >= 350) {
        $('.newsletter-modal').fadeIn();
      } else {
        $('.newsletter-modal').fadeOut();
      }
    });
  }

  $('#close_nl_modal_btn, #close_nl_modal, #no-thanks').on('click', function () {
    $('.newsletter-modal').fadeOut();
    localStorage.setItem('newsletterModalClosed', 'true');
    localStorage.setItem('newsletterModalClosedTimestamp', now.toString());
    newsletterModalClosed = true;
  });

  $('.newsletter-modal-open').on('click', function (event) {
    if (!$(event.target).is('#close_nl_modal_btn')) {
      $(this).hide();
      $('.newsletter-modal-box').fadeIn();
    }
  });

  var formId = $('.newsletter-modal').data("form-id");
  $('div[data-forms-id="forms-root-' + formId +'"]').last().each(function () {
      if ($(this).length && $('.newsletter-modal-right .newsletter-modal-form').length) {
          $(this).prependTo('.newsletter-modal-right .newsletter-modal-form');
      }
  });
  
});