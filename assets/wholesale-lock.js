$(function() {
  const formId = $('.wholesale-lock').data("form-id");
  $('div[data-forms-id="forms-root-' + formId +'"]').last().each(function () {
      if ($(this).length && $('.wholesale-lock .wholesale_eflyer_form_wrapper').length) {
          $(this).prependTo('.wholesale-lock .wholesale_eflyer_form_wrapper');
      }
  });
  
  const url = new URL(window.location.href);
  const params = url.searchParams;
  
  if (params.get('success') === 'true') {
    $('.wholesale-lock').children().not('.loading-overlay__spinner').hide();
    $('.wholesale-lock').children('.loading-overlay__spinner').removeClass('hidden');
    params.delete('success');
    const newUrl = url.origin + url.pathname + (params.toString() ? '?' + params.toString() : '');
    window.location.replace(newUrl);
  }
});