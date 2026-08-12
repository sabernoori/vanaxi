/**
 * Start Menu Toggle Animation Controller
 * Handles mobile menu open/close with smooth animations
 */

(function() {
  'use strict';

  // State management
  const MenuState = {
    isOpen: false,
    currentSubMenu: null,
    isAnimating: false
  };

  // DOM Elements
  const elements = {
    burgerIcon: null,
    closeIconMain: null,
    menuWrapper: null,
    navBurger: null,
    mainMenu: null,
    servicesMenu: null,
    aboutMenu: null,
    backIcon: null,
    menuItems: {
      services: null,
      plans: null,
      drivers: null,
      about: null
    }
  };

  // Animation timing constants
  const TIMING = {
    menuOpen: 500,
    menuClose: 400,
    staggerDelay: 50,
    subMenuTransition: 300
  };

  /**
   * Initialize all DOM element references
   */
  function initElements() {
    elements.burgerIcon = document.querySelector('.burger-icon');
    elements.closeIconMain = document.querySelector('[icon-action="close-main"].close-icon.is-step1');
    elements.menuWrapper = document.querySelector('.menu_open-wrapper');
    elements.navBurger = document.querySelector('.nav_burger');
    elements.mainMenu = document.querySelector('.menu_open.is-main');
    elements.servicesMenu = document.querySelector('.menu_open.is-services');
    elements.aboutMenu = document.querySelector('.menu_open.is-about');
    elements.backIcon = document.querySelector('[icon-action="back"].back-icon');

    // Menu items
    elements.menuItems.services = document.querySelector('#nav-services');
    elements.menuItems.plans = document.querySelector('#nav-plans');
    elements.menuItems.drivers = document.querySelector('#nav-drivers');
    elements.menuItems.about = document.querySelector('#nav-about');

    return validateElements();
  }

  /**
   * Validate that all required elements exist
   */
  function validateElements() {
    const required = [
      'burgerIcon',
      'closeIconMain',
      'menuWrapper',
      'navBurger',
      'mainMenu'
    ];

    const missing = required.filter(key => !elements[key]);

    if (missing.length > 0) {
      console.warn('Menu: Missing required elements:', missing);
      return false;
    }

    return true;
  }

  /**
   * Open the mobile menu with animations
   */
  function openMenu() {
    // Safety reset - clear any stuck animation state
    MenuState.isAnimating = false;

    if (MenuState.isOpen) return;

    MenuState.isAnimating = true;
    MenuState.isOpen = true;

    // Add classes for animations (CSS handles visibility)
    elements.menuWrapper.classList.add('is-visible');

    // Small delay to ensure visibility is applied before animation
    requestAnimationFrame(() => {
      // Add classes for animations
      elements.navBurger.classList.add('is-menu-open');
      elements.menuWrapper.classList.add('is-open');

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Reset any sub-menu state
      closeSubMenu(false);

      // Set animation complete
      setTimeout(() => {
        MenuState.isAnimating = false;
      }, TIMING.menuOpen);
    });
  }

  /**
   * Close the mobile menu with animations
   * @param {boolean} animate - Whether to animate the close
   */
  function closeMenu(animate = true) {
    if (MenuState.isAnimating || !MenuState.isOpen) return;

    MenuState.isAnimating = true;
    MenuState.isOpen = false;

    const duration = animate ? TIMING.menuClose : 0;

    // Remove open class to trigger close animation
    elements.navBurger.classList.remove('is-menu-open');
    elements.menuWrapper.classList.remove('is-open');

    // Re-enable body scroll
    document.body.style.overflow = '';

    // Add class for fade-only closing (no slide)
    if (elements.servicesMenu) {
      elements.servicesMenu.classList.add('is-closing');
      elements.servicesMenu.classList.remove('is-active');
    }
    if (elements.aboutMenu) {
      elements.aboutMenu.classList.add('is-closing');
      elements.aboutMenu.classList.remove('is-active');
    }

    // Toggle all icons back
    toggleNavBurgerIcons(false);
    toggleNavAccountIcons(false);
    toggleLogoAndTitle(null, false);

    // After animation completes, reset everything completely
    setTimeout(() => {
      elements.menuWrapper.classList.remove('is-visible');
      elements.mainMenu.classList.remove('is-pushed');
      MenuState.isAnimating = false;

      // Remove closing class
      if (elements.servicesMenu) {
        elements.servicesMenu.classList.remove('is-closing');
      }
      if (elements.aboutMenu) {
        elements.aboutMenu.classList.remove('is-closing');
      }
    }, duration);

    // Reset submenu state
    MenuState.currentSubMenu = null;
  }

  /**
   * Toggle menu open/close
   */
  function toggleMenu() {
    if (MenuState.isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /**
   * Open a sub-menu (services or about)
   * @param {string} subMenuType - 'services' or 'about'
   */
  function openSubMenu(subMenuType) {
    if (MenuState.isAnimating) return;

    MenuState.currentSubMenu = subMenuType;

    // Toggle icons and title first
    toggleNavBurgerIcons(true);
    toggleNavAccountIcons(true);
    toggleLogoAndTitle(subMenuType, true);

    // Push main menu to left (CSS handles the slide)
    elements.mainMenu.classList.add('is-pushed');

    // Show the appropriate sub-menu (slides in from right)
    if (subMenuType === 'services' && elements.servicesMenu) {
      elements.servicesMenu.classList.add('is-active');
      animateSubMenuItems(elements.servicesMenu);
    } else if (subMenuType === 'about' && elements.aboutMenu) {
      elements.aboutMenu.classList.add('is-active');
      animateSubMenuItems(elements.aboutMenu);
    }
  }

  /**
   * Close the current sub-menu
   * @param {boolean} animate - Whether to animate
   */
  function closeSubMenu(animate = true) {
    if (!MenuState.currentSubMenu) return;

    // Slide submenu back to right (CSS handles the animation)
    if (elements.servicesMenu) {
      elements.servicesMenu.classList.remove('is-active');
    }

    if (elements.aboutMenu) {
      elements.aboutMenu.classList.remove('is-active');
    }

    // Bring main menu back from left
    elements.mainMenu.classList.remove('is-pushed');

    // Toggle icons and title
    toggleNavBurgerIcons(false);
    toggleNavAccountIcons(false);
    toggleLogoAndTitle(null, false);

    MenuState.currentSubMenu = null;
  }

  /**
   * Animate sub-menu items with stagger effect
   * @param {HTMLElement} menuContainer - The sub-menu container
   */
  function animateSubMenuItems(menuContainer) {
    const items = menuContainer.querySelectorAll('.menu_item, .nav_services-card');

    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(10px)';

      setTimeout(() => {
        item.style.transition = `opacity ${TIMING.subMenuTransition}ms cubic-bezier(0.83, 0, 0.17, 1),
                                  transform ${TIMING.subMenuTransition}ms cubic-bezier(0.83, 0, 0.17, 1)`;
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 100 + (index * TIMING.staggerDelay));
    });
  }

  /**
   * Update menu title visibility based on active sub-menu
   * @param {string} subMenuType - 'services' or 'about'
   */
  function updateMenuTitles(subMenuType) {
    const servicesTitle = document.querySelector('.menu_title.is-services');
    const aboutTitle = document.querySelector('.menu_title.is-about');

    if (servicesTitle) {
      if (subMenuType === 'services') {
        servicesTitle.classList.add('is-visible');
        servicesTitle.style.display = 'block';
      } else {
        servicesTitle.classList.remove('is-visible');
        servicesTitle.style.display = 'none';
      }
    }

    if (aboutTitle) {
      if (subMenuType === 'about') {
        aboutTitle.classList.add('is-visible');
        aboutTitle.style.display = 'block';
      } else {
        aboutTitle.classList.remove('is-visible');
        aboutTitle.style.display = 'none';
      }
    }
  }

  /**
   * Hide all menu titles
   */
  function hideMenuTitles() {
    const servicesTitle = document.querySelector('.menu_title.is-services');
    const aboutTitle = document.querySelector('.menu_title.is-about');

    if (servicesTitle) servicesTitle.style.display = 'none';
    if (aboutTitle) aboutTitle.style.display = 'none';
  }

  /**
   * Toggle nav_burger icons using attribute selectors
   * @param {boolean} isSubMenuOpen - true if submenu is open
   */
  function toggleNavBurgerIcons(isSubMenuOpen) {
    const closeMain = document.querySelector('[icon-action="close-main"]');
    const backIcon = document.querySelector('[icon-action="back"]');
    const burgerIcon = document.querySelector('.burger-icon');

    if (isSubMenuOpen) {
      // Hide close-main and burger, show back icon
      if (closeMain) {
        closeMain.style.opacity = '0';
        closeMain.style.pointerEvents = 'none';
      }
      if (burgerIcon) {
        burgerIcon.classList.add('is-hidden');
      }
      if (backIcon) {
        backIcon.style.opacity = '1';
        backIcon.style.transform = 'scale(1) rotate(0deg)';
        backIcon.style.pointerEvents = 'auto';
      }
    } else {
      // Show close-main and burger, hide back icon
      if (closeMain) {
        closeMain.style.opacity = '';
        closeMain.style.pointerEvents = '';
      }
      if (burgerIcon) {
        burgerIcon.classList.remove('is-hidden');
      }
      if (backIcon) {
        backIcon.style.opacity = '';
        backIcon.style.transform = '';
        backIcon.style.pointerEvents = '';
      }
    }
  }

  /**
   * Toggle nav_account-mob icons (icon-24 and close-layers)
   * @param {boolean} showCloseLayers - true to show close-layers, false to show icon-24
   */
  function toggleNavAccountIcons(showCloseLayers) {
    const navAccountMob = document.querySelector('.nav_account-mob');
    if (!navAccountMob) return;

    const icon24 = navAccountMob.querySelector('.icon-24');
    const closeLayers = navAccountMob.querySelector('[icon-action="close-layers"]');

    if (showCloseLayers) {
      // Hide icon-24 and show close-layers
      if (icon24) icon24.classList.add('is-hidden');
      if (closeLayers) closeLayers.classList.add('is-visible');
    } else {
      // Show icon-24 and hide close-layers
      if (icon24) icon24.classList.remove('is-hidden');
      if (closeLayers) closeLayers.classList.remove('is-visible');
    }
  }

  /**
   * Toggle logo and menu title visibility
   * @param {string|null} subMenuType - 'services', 'about', or null
   * @param {boolean} showTitle - true to show title, false to show logo
   */
  function toggleLogoAndTitle(subMenuType, showTitle) {
    const logo = document.querySelector('.nav_logo-link-center');
    const servicesTitle = document.querySelector('.menu_title.is-services');
    const aboutTitle = document.querySelector('.menu_title.is-about');

    if (showTitle) {
      // Hide logo first
      if (logo) logo.classList.add('is-hidden');

      // Hide all titles first
      if (servicesTitle) servicesTitle.classList.remove('is-visible');
      if (aboutTitle) aboutTitle.classList.remove('is-visible');

      // Show the specific title after a short delay
      setTimeout(() => {
        if (subMenuType === 'services' && servicesTitle) {
          servicesTitle.classList.add('is-visible');
        } else if (subMenuType === 'about' && aboutTitle) {
          aboutTitle.classList.add('is-visible');
        }
      }, 100);
    } else {
      // Hide titles first
      if (servicesTitle) servicesTitle.classList.remove('is-visible');
      if (aboutTitle) aboutTitle.classList.remove('is-visible');

      // Show logo immediately (no delay needed for closing)
      if (logo) logo.classList.remove('is-hidden');
    }
  }

  /**
   * Handle menu item clicks
   * @param {Event} event - Click event
   */
  function handleMenuItemClick(event) {
    const menuItem = event.currentTarget;
    const menuItemId = menuItem.id;

    switch (menuItemId) {
      case 'nav-services':
        openSubMenu('services');
        break;
      case 'nav-about':
        openSubMenu('about');
        break;
      case 'nav-plans':
        // Handle plans click - could navigate or show sub-menu
        console.log('Plans clicked');
        break;
      case 'nav-drivers':
        // Handle drivers click
        console.log('Drivers clicked');
        break;
      default:
        break;
    }
  }

  /**
   * Handle back button click
   */
  function handleBackClick() {
    closeSubMenu();
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (!MenuState.isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (MenuState.currentSubMenu) {
          closeSubMenu();
        } else {
          closeMenu();
        }
        break;
      case 'Tab':
        // Trap focus within menu when open
        trapFocus(event);
        break;
    }
  }

  /**
   * Trap focus within the menu for accessibility
   * @param {KeyboardEvent} event
   */
  function trapFocus(event) {
    const focusableElements = elements.menuWrapper.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"]), input, select, textarea'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Burger icon click
    if (elements.burgerIcon) {
      elements.burgerIcon.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
      });
    }

    // Close icon click
    if (elements.closeIconMain) {
      elements.closeIconMain.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
      });
    }

    // Back icon click
    if (elements.backIcon) {
      elements.backIcon.addEventListener('click', (e) => {
        e.preventDefault();
        handleBackClick();
      });
    }

    // Close layers icon click (in nav_account-mob) - closes entire menu
    const closeLayersIcon = document.querySelector('[icon-action="close-layers"]');
    if (closeLayersIcon) {
      closeLayersIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Close the entire menu and reset everything
        closeMenu();
      });
    }

    // Menu items clicks
    Object.values(elements.menuItems).forEach(item => {
      if (item) {
        item.addEventListener('click', handleMenuItemClick);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Close menu on window resize (if width becomes large)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991 && MenuState.isOpen) {
        closeMenu(false);
      }
    });

    // Close menu when clicking outside
    elements.menuWrapper?.addEventListener('click', (e) => {
      if (e.target === elements.menuWrapper) {
        closeMenu();
      }
    });
  }

  /**
   * Initialize the menu system
   */
  function init() {
    if (!initElements()) {
      console.error('Menu: Could not initialize - missing elements');
      return;
    }

    setupEventListeners();
    setupScrollHide();
    console.log('Menu: Initialized successfully');
  }

  /**
   * Setup scroll-based navbar hide/show
   */
  function setupScrollHide() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollTop = 0;
    let scrollThreshold = 10; // Minimum scroll amount to trigger hide/show
    let ticking = false;

    // Monitor mobile menu state
    const observer = new MutationObserver(() => {
      if (MenuState.isOpen) {
        navbar.classList.add('menu-open');
      } else {
        navbar.classList.remove('menu-open');
      }
    });

    // Observe menu wrapper for class changes
    const menuWrapper = document.querySelector('.menu_open-wrapper');
    if (menuWrapper) {
      observer.observe(menuWrapper, { attributes: true, attributeFilter: ['class'] });
    }

    // Monitor desktop dropdowns
    const dropdowns = document.querySelectorAll('.w-dropdown');
    dropdowns.forEach(dropdown => {
      const dropdownObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const isOpen = dropdown.classList.contains('w-dropdown--open');
            if (isOpen) {
              navbar.classList.add('menu-open');
            } else {
              // Check if any other dropdown is still open
              const anyOpen = document.querySelector('.w-dropdown--open');
              if (!anyOpen && !MenuState.isOpen) {
                navbar.classList.remove('menu-open');
              }
            }
          }
        });
      });

      dropdownObserver.observe(dropdown, { attributes: true, attributeFilter: ['class'] });
    });

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Don't hide if menu is open
          if (navbar.classList.contains('menu-open')) {
            lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            ticking = false;
            return;
          }

          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollDelta = scrollTop - lastScrollTop;

          // Scrolling down and past the threshold
          if (scrollDelta > scrollThreshold && scrollTop > 100) {
            navbar.classList.add('is-hidden');
          }
          // Scrolling up
          else if (scrollDelta < -scrollThreshold) {
            navbar.classList.remove('is-hidden');
          }

          lastScrollTop = scrollTop;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API for external use
  window.MenuController = {
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    isOpen: () => MenuState.isOpen,
    openSubMenu: openSubMenu,
    closeSubMenu: closeSubMenu
  };

})();


/**
 * End of Menu Toggle Animation Controller
*/

// ==========================================
// START: Desktop Services Accordion Controller
// ==========================================
(function() {
  'use strict';

  const DESKTOP_MQ = '(min-width: 992px)';
  const IMAGE_KEYS = ['on-demand', 'city-to-city', 'transfer', 'personal'];

  const state = {
    activeIndex: 0,
    activeImageIndex: -1,
    items: [],
    images: [],
    isDesktop: false,
    isReady: false,
    scrollToIndex: null,
    imageTween: null
  };

  function queryDesktopRoot() {
    return document.querySelector('.services_box-desktop');
  }

  function collectItems(root) {
    return Array.from(root.querySelectorAll('.services_list > .services_item')).map((item) => {
      return {
        el: item,
        title: item.querySelector('.services_item-title-holder'),
        content: item.querySelector('.services_item-content-holder'),
        progress: item.querySelector('.services_progress')
      };
    });
  }

  function collectImages(root) {
    const wrapper = root.querySelector('.services_img-wrapper-desk');
    if (!wrapper) return [];

    return IMAGE_KEYS.map((key) => wrapper.querySelector(`.services_img.${key}`)).filter(Boolean);
  }

  function setProgressFill(progressEl, amount) {
    if (!progressEl) return;
    const value = Math.max(0, Math.min(1, amount));
    progressEl.style.transform = `scaleX(${value})`;
  }

  function setActiveImage(index, immediate) {
    if (!state.images.length) return;
    if (index === state.activeImageIndex && !immediate) return;

    const nextImg = state.images[index];
    if (!nextImg) return;

    // Stop any previous GSAP transforms/tweens so nothing can slide/scale
    if (typeof gsap !== 'undefined') {
      if (state.imageTween) {
        state.imageTween.kill();
        state.imageTween = null;
      }
      gsap.killTweensOf(state.images);
      gsap.set(state.images, {
        clearProps: 'transform,translate,x,y,xPercent,yPercent,scale,scaleX,scaleY,rotation'
      });
    }

    state.images.forEach((img, i) => {
      const isActive = i === index;
      img.classList.toggle('is-active', isActive);
      img.style.transform = 'none';
      img.style.translate = 'none';

      if (immediate) {
        img.style.transition = 'none';
        img.style.opacity = isActive ? '1' : '0';
        // Force reflow then restore CSS transition for later fades
        void img.offsetWidth;
        img.style.transition = '';
      } else {
        img.style.opacity = isActive ? '1' : '0';
      }
    });

    state.activeImageIndex = index;
  }

  function setItemClasses(entry, isActive) {
    entry.el.classList.toggle('is-open', isActive);

    if (entry.title) {
      entry.title.classList.toggle('is-active', isActive);
      entry.title.classList.toggle('is-not-active', !isActive);
    }

    if (entry.content) {
      entry.content.classList.toggle('is-not-active', !isActive);
    }

    if (entry.progress) {
      entry.progress.classList.toggle('is-visible', isActive);
      entry.progress.classList.toggle('is-hidden', !isActive);
      if (!isActive) {
        setProgressFill(entry.progress, 0);
      }
    }
  }

  function activate(index, options) {
    if (!state.isReady || !state.isDesktop) return;
    if (index < 0 || index >= state.items.length) return;

    const opts = options || {};
    const previous = state.activeIndex;
    const next = index;

    if (previous !== next) {
      state.items.forEach((entry, i) => {
        setItemClasses(entry, i === next);
      });
      setActiveImage(next, false);
      state.activeIndex = next;
    } else {
      setItemClasses(state.items[next], true);
    }

    const progressAmount = typeof opts.progress === 'number' ? opts.progress : (previous === next ? undefined : 0);
    if (typeof progressAmount === 'number' && state.items[next]) {
      setProgressFill(state.items[next].progress, progressAmount);
    }

    if (opts.scroll && typeof state.scrollToIndex === 'function') {
      state.scrollToIndex(next);
    }
  }

  function setFromScroll(index, progress) {
    activate(index, { progress: progress, scroll: false });
  }

  function onItemClick(event) {
    if (!state.isDesktop) return;

    const item = event.currentTarget;
    const index = state.items.findIndex((entry) => entry.el === item);
    if (index < 0 || index === state.activeIndex) return;

    activate(index, { progress: 0, scroll: true });
  }

  function bindClicks() {
    state.items.forEach((entry) => {
      if (!entry.el) return;
      entry.el.addEventListener('click', onItemClick);
      entry.el.setAttribute('role', 'button');
      entry.el.setAttribute('tabindex', '0');
      entry.el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onItemClick(event);
        }
      });
    });
  }

  function syncDesktopFlag() {
    state.isDesktop = window.matchMedia(DESKTOP_MQ).matches;
  }

  function init() {
    const root = queryDesktopRoot();
    if (!root) return;

    state.items = collectItems(root);
    state.images = collectImages(root);

    if (state.items.length === 0) {
      console.warn('ServicesDesktop: No service items found');
      return;
    }

    syncDesktopFlag();
    bindClicks();

    // Initial UI state from markup / first item
    let initial = state.items.findIndex((entry) => entry.title && entry.title.classList.contains('is-active'));
    if (initial < 0) initial = 0;

    state.isReady = true;
    if (state.isDesktop) {
      setActiveImage(initial, true);
      activate(initial, { progress: 0, scroll: false });
    }

    const mq = window.matchMedia(DESKTOP_MQ);
    const onMqChange = () => {
      syncDesktopFlag();
      if (state.isDesktop) {
        setActiveImage(state.activeIndex, true);
        activate(state.activeIndex, { progress: 0, scroll: false });
      }
    };

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onMqChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onMqChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ServicesDesktop = {
    activate: activate,
    setFromScroll: setFromScroll,
    setProgressFill: setProgressFill,
    getActiveIndex: () => state.activeIndex,
    getItemCount: () => state.items.length,
    isReady: () => state.isReady,
    isDesktop: () => state.isDesktop,
    registerScrollToIndex: (fn) => {
      state.scrollToIndex = fn;
    },
    getItems: () => state.items
  };
})();
// ==========================================
// END: Desktop Services Accordion Controller
// ==========================================

// ==========================================
// START: FAQ Accordion
// ==========================================
(function() {
  'use strict';

  function getParts(item) {
    return {
      item: item,
      answer: item.querySelector('.faq_answer'),
      icon: item.querySelector('.faq_question-group .icon-24')
    };
  }

  function clearHeightListener(answer) {
    if (answer._faqHeightHandler) {
      answer.removeEventListener('transitionend', answer._faqHeightHandler);
      answer._faqHeightHandler = null;
    }
  }

  function collapseAnswer(answer, immediate, onDone) {
    if (!answer) {
      if (onDone) onDone();
      return;
    }

    clearHeightListener(answer);

    if (immediate) {
      answer.style.height = '0px';
      answer.classList.add('is-hide');
      if (onDone) onDone();
      return;
    }

    answer.style.height = answer.scrollHeight + 'px';
    answer.offsetHeight;

    answer._faqHeightHandler = (event) => {
      if (event.propertyName !== 'height') return;
      clearHeightListener(answer);
      answer.classList.add('is-hide');
      if (onDone) onDone();
    };
    answer.addEventListener('transitionend', answer._faqHeightHandler);
    answer.style.height = '0px';
  }

  function expandAnswer(answer, immediate) {
    if (!answer) return;
    clearHeightListener(answer);

    answer.classList.remove('is-hide');

    if (immediate) {
      answer.style.height = 'auto';
      return;
    }

    answer.style.height = '0px';
    answer.offsetHeight;
    answer.style.height = answer.scrollHeight + 'px';

    answer._faqHeightHandler = (event) => {
      if (event.propertyName !== 'height') return;
      clearHeightListener(answer);
      answer.style.height = 'auto';
    };
    answer.addEventListener('transitionend', answer._faqHeightHandler);
  }

  function closeItem(item, immediate) {
    const parts = getParts(item);

    // Drop active styles immediately (background / icon) — don't wait for height
    parts.item.classList.remove('is-active');
    parts.item.setAttribute('aria-expanded', 'false');

    if (parts.icon) {
      parts.icon.classList.remove('is-open');
    }

    collapseAnswer(parts.answer, immediate);
  }

  function openItem(item, list, immediate) {
    list.querySelectorAll('.faq_item.is-active').forEach((active) => {
      if (active !== item) closeItem(active, immediate);
    });

    const parts = getParts(item);
    parts.item.classList.add('is-active');
    parts.item.setAttribute('aria-expanded', 'true');

    if (parts.icon) {
      parts.icon.classList.add('is-open');
    }

    expandAnswer(parts.answer, immediate);
  }

  function toggleItem(item, list) {
    if (item.classList.contains('is-active')) {
      closeItem(item, false);
    } else {
      openItem(item, list, false);
    }
  }

  function initFaqList(list) {
    const items = Array.from(list.querySelectorAll('.faq_item'));
    if (!items.length) return;

    items.forEach((item) => {
      const parts = getParts(item);

      // Always start closed on first load
      item.classList.remove('is-active');
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-expanded', 'false');

      if (parts.icon) {
        parts.icon.classList.remove('is-open');
      }

      if (parts.answer) {
        clearHeightListener(parts.answer);
        parts.answer.classList.add('is-hide');
        parts.answer.style.height = '0px';
      }

      item.addEventListener('click', () => {
        toggleItem(item, list);
      });

      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleItem(item, list);
        }
      });
    });
  }

  function init() {
    document.querySelectorAll('.faq_list').forEach(initFaqList);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.FaqAccordion = {
    refresh: init
  };
})();
// ==========================================
// END: FAQ Accordion
// ==========================================

// ==========================================
// START: Story Card Background Videos
// ==========================================
(function() {
  'use strict';

  // Sample MP4s (Webflow BG Video can't use YouTube URLs)
  // Swap these or set data-video-src on each .story_video
  const STORY_VIDEO_FALLBACKS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  ];

  function mountStoryVideos() {
    const hosts = document.querySelectorAll('.section_story .story_video');
    hosts.forEach((host, index) => {
      if (host.querySelector('video.story_video-el')) return;

      const urlField = host.closest('.story_item')?.querySelector('.story_video-url');
      const urlFromProp = urlField ? (urlField.textContent || '').trim() : '';

      const card = host.closest('.story_item') || host.closest('[data-video-src]');
      const src =
        urlFromProp ||
        host.getAttribute('data-video-src') ||
        (card && card.getAttribute('data-video-src')) ||
        STORY_VIDEO_FALLBACKS[index % STORY_VIDEO_FALLBACKS.length];

      if (!src) return;

      const video = document.createElement('video');
      video.className = 'story_video-el';
      video.src = src;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.setAttribute('aria-hidden', 'true');

      host.appendChild(video);

      const play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function() {});
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountStoryVideos);
  } else {
    mountStoryVideos();
  }

  window.StoryVideos = {
    refresh: mountStoryVideos
  };
})();
// ==========================================
// END: Story Card Background Videos
// ==========================================

// ==========================================
// START: Story Bento Featured Column Marker
// ==========================================
(function() {
  'use strict';

  // Component instances can't take Designer classes/attrs, so mark the
  // grid cell that uses the Featured sticky layout for CSS placement.
  // Also set an explicit row span so featured owns the full column height
  // (grid-row 1 / -1 only covers explicit rows, not implicit ones).
  function markFeaturedStoryCells() {
    const isDesktop = window.matchMedia('(min-width: 992px)').matches;

    document.querySelectorAll('.section_story .story_grid').forEach((grid) => {
      const cells = Array.from(grid.children);
      let featuredCell = null;

      cells.forEach((cell) => {
        cell.classList.remove('is-story-featured');
        cell.style.removeProperty('grid-row');
        cell.style.removeProperty('grid-column');

        const content =
          cell.matches('.story_content')
            ? cell
            : cell.querySelector('.story_content');

        if (!content) return;

        const style = window.getComputedStyle(content);
        const isFeaturedLayout =
          style.position === 'sticky' ||
          content.classList.contains('featured') ||
          cell.classList.contains('story_featured-slot');

        if (isFeaturedLayout) {
          cell.classList.add('is-story-featured');
          featuredCell = cell;
        }
      });

      if (!featuredCell || !isDesktop) return;

      // Desktop: 3 cols, featured takes 1 → remaining cards flow in 2 cols
      const others = Math.max(0, cells.length - 1);
      const rows = Math.max(1, Math.ceil(others / 2));
      featuredCell.style.gridColumn = '1 / 2';
      featuredCell.style.gridRow = '1 / span ' + rows;
    });
  }

  function init() {
    markFeaturedStoryCells();
    // Variant styles can apply slightly after first paint
    window.setTimeout(markFeaturedStoryCells, 100);
    window.setTimeout(markFeaturedStoryCells, 500);
    window.addEventListener('resize', markFeaturedStoryCells);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.StoryBentoGrid = {
    refresh: markFeaturedStoryCells
  };
})();
// ==========================================
// END: Story Bento Featured Column Marker
// ==========================================
