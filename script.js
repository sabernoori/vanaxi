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

    // Reset sub-menu state
    if (elements.servicesMenu) {
      elements.servicesMenu.classList.remove('is-active');
    }
    if (elements.aboutMenu) {
      elements.aboutMenu.classList.remove('is-active');
    }

    // Toggle all icons back
    toggleNavBurgerIcons(false);
    toggleNavAccountIcons(false);
    toggleLogoAndTitle(null, false);

    // After animation completes, reset everything completely
    setTimeout(() => {
      elements.menuWrapper.classList.remove('is-visible');
      elements.mainMenu.classList.remove('is-hidden');
      MenuState.isAnimating = false;
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

    // Hide main menu with fade
    elements.mainMenu.classList.add('is-hidden');

    // Toggle nav_burger icons using attribute selectors
    toggleNavBurgerIcons(true);

    // Toggle nav_account-mob icons
    toggleNavAccountIcons(true);

    // Toggle logo and title - logo hides immediately, title shows with delay
    toggleLogoAndTitle(subMenuType, true);

    // Show the appropriate sub-menu (let CSS handle display)
    if (subMenuType === 'services' && elements.servicesMenu) {
      elements.servicesMenu.classList.add('is-active');

      // Animate items
      animateSubMenuItems(elements.servicesMenu);
    } else if (subMenuType === 'about' && elements.aboutMenu) {
      elements.aboutMenu.classList.add('is-active');

      // Animate items
      animateSubMenuItems(elements.aboutMenu);
    }
  }

  /**
   * Close the current sub-menu
   * @param {boolean} animate - Whether to animate
   */
  function closeSubMenu(animate = true) {
    if (!MenuState.currentSubMenu) return;

    const duration = animate ? TIMING.subMenuTransition : 0;

    // Hide sub-menus first (let CSS handle display)
    if (elements.servicesMenu) {
      elements.servicesMenu.classList.remove('is-active');
    }

    if (elements.aboutMenu) {
      elements.aboutMenu.classList.remove('is-active');
    }

    // Toggle nav_burger icons back using attribute selectors
    toggleNavBurgerIcons(false);

    // Toggle nav_account-mob icons back
    toggleNavAccountIcons(false);

    // Toggle logo and title back
    toggleLogoAndTitle(null, false);

    // Show main menu after submenu has started fading out (with delay)
    setTimeout(() => {
      elements.mainMenu.classList.remove('is-hidden');
    }, animate ? 100 : 0);

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
    setupSectionDetection();
    console.log('Menu: Initialized successfully');
  }

  /**
   * Detect when user is in services section on mobile
   */
  function setupSectionDetection() {
    const navbar = document.querySelector('.navbar');
    const servicesSection = document.querySelector('.section-services');

    if (!navbar || !servicesSection) return;

    // Use Intersection Observer to detect when services section is in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (window.innerWidth <= 991) {
          if (entry.isIntersecting) {
            navbar.classList.add('is-services-section');
          } else {
            navbar.classList.remove('is-services-section');
          }
        } else {
          navbar.classList.remove('is-services-section');
        }
      });
    }, {
      threshold: 0.3
    });

    observer.observe(servicesSection);

    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991) {
        navbar.classList.remove('is-services-section');
      }
    });
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