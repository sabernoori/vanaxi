(function () {

  'use strict';



  var MOBILE_BREAKPOINT = 991;

  var TRANSITION_MS = 350;



  var menuWrapper = document.querySelector('.menu_wrapper');

  var burgerToggle = document.querySelector('.nav_burger .dropdown-toggle');

  var menuMain = document.querySelector('.menu_list.is-main');

  var menuServices = document.querySelector('.menu_list.is-services');

  var servicesTrigger = document.querySelector('.menu_first-list .menu_item:first-child');



  if (!menuWrapper || !burgerToggle || !menuMain || !menuServices || !servicesTrigger) return;



  function isMobile() {

    return window.innerWidth <= MOBILE_BREAKPOINT;

  }



  function resetMenuState() {

    menuWrapper.classList.remove(

      'is-layer-services',

      'is-layer-about',

      'is-animating-layers',

      'is-closing-from-layer'

    );

  }



  function openMenu() {

    if (!isMobile() || menuWrapper.classList.contains('is-open')) return;



    resetMenuState();

    menuWrapper.style.display = 'flex';

    menuWrapper.offsetHeight;

    menuWrapper.classList.add('is-open');

    document.body.classList.add('menu-open');

  }



  function closeMenu() {

    if (!menuWrapper.classList.contains('is-open')) {

      menuWrapper.style.display = 'none';

      document.body.classList.remove('menu-open');

      resetMenuState();

      return;

    }



    var closingFromLayer =

      menuWrapper.classList.contains('is-layer-services') ||

      menuWrapper.classList.contains('is-layer-about');



    if (closingFromLayer) {

      menuWrapper.classList.add('is-closing-from-layer');

    }



    menuWrapper.classList.remove('is-open');



    var closed = false;



    function finishClose() {

      if (closed) return;

      closed = true;

      menuWrapper.removeEventListener('transitionend', onTransitionEnd);

      menuWrapper.style.display = 'none';

      document.body.classList.remove('menu-open');

      resetMenuState();

    }



    function onTransitionEnd(event) {

      if (event.target !== menuWrapper || event.propertyName !== 'opacity') return;

      finishClose();

    }



    menuWrapper.addEventListener('transitionend', onTransitionEnd);

    window.setTimeout(finishClose, TRANSITION_MS + 50);

  }



  function openServicesLayer() {

    if (!menuWrapper.classList.contains('is-open')) return;



    menuWrapper.classList.add('is-animating-layers');

    menuWrapper.offsetHeight;

    menuWrapper.classList.add('is-layer-services');

  }



  function backToMainLayer() {

    menuWrapper.classList.add('is-animating-layers');

    menuWrapper.classList.remove('is-layer-services', 'is-layer-about');

  }



  burgerToggle.addEventListener('click', function (event) {

    if (!isMobile()) return;



    event.preventDefault();

    event.stopPropagation();

    openMenu();

  });



  menuWrapper.addEventListener('click', function (event) {

    if (!isMobile()) return;



    var actionTarget = event.target.closest('[icon-action]');



    if (actionTarget) {

      var action = actionTarget.getAttribute('icon-action');



      if (action === 'close') {

        event.preventDefault();

        closeMenu();

        return;

      }



      if (action === 'back') {

        event.preventDefault();

        backToMainLayer();

        return;

      }

    }



    if (event.target.closest('.menu_first-list .menu_item') === servicesTrigger) {

      event.preventDefault();

      openServicesLayer();

    }

  });



  window.addEventListener('resize', function () {

    if (isMobile()) return;



    menuWrapper.classList.remove('is-open');

    menuWrapper.style.display = '';

    document.body.classList.remove('menu-open');

    resetMenuState();

  });

})();

