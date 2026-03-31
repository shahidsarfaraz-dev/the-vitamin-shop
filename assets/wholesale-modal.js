$(function() {
  const $wrapper = $('.wholesale-modal-wrapper');
  const $initial = $('.modal-initial-message');
  const $login = $('.modal-login-form');
  const $register = $('.modal-register-form');
  const $bgTarget = $('.wholesale-modal-left');
  const $registerErrors = $('.modal-register-form .form-errors .register-error');
  const $loginErrors = $('.modal-login-form .form-errors .login-error');
  const $errorsBox = $('.form-errors');
  const $registrationContentBox = $('.modal-register-form .content-box');

  // Read image URLs from JSON
  const imgData = JSON.parse(document.getElementById('wholesale-modal-images').textContent);

  // Preload images
  ['bg1', 'bg2', 'bg3'].forEach(key => {
    const img = new Image();
    img.src = imgData[key];
  });

  function setBg(which) {
    const url = imgData[`bg${which}`];
    if (url) {
      $bgTarget.css('background-image', `url('${url}')`);
    }
  }

  function closeWholesaleModal() {
    $wrapper.fadeOut();
    setTimeout(() => {
      $login.hide();
      $register.hide();
      $initial.show();
      setBg(1);
    }, 500);
  }

  $('.open-wholesale-modal').click(() => {
    $wrapper.fadeIn();
  });

  $wrapper.click(e => {
    if (!$(e.target).closest('.wholesale-modal').length) {
      closeWholesaleModal();
    }
  });

  $('.close-wholesale-modal').click(() => {
    closeWholesaleModal();
  });

  $('.open-modal-login').click(() => {
    $initial.hide();
    $register.hide();
    $login.fadeIn();
    $errorsBox.hide();
    $registrationContentBox.show();
    setBg(3);
  });

  $('.open-modal-register').click(() => {
    $initial.hide();
    $login.hide();
    $register.fadeIn();
    $errorsBox.hide();
    $registrationContentBox.show();
    setBg(2);
  });

  $('.open-wholesale-modal-register').click(() => {
    $wrapper.fadeIn();
    $initial.hide();
    $login.hide();
    $register.show();
    setBg(2);
  });
  
  $('.open-wholesale-modal-login').click(() => {
    $wrapper.fadeIn();
    $initial.hide();
    $register.hide();
    $login.show();
    setBg(3);
  });

  if ($registerErrors.length) {
    $wrapper.fadeIn();
    $initial.hide();
    $login.hide();
    $register.show();
    setBg(2);
    $registrationContentBox.hide();
  } else if ($loginErrors.length) {
    $wrapper.fadeIn();
    $initial.hide();
    $register.hide();
    $login.show();
    setBg(3);
  }

});