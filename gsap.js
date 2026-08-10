/**
 * GSAP Animations for Vanaxi Website
 */

(function() {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ==========================================
  // START: Desktop Services ScrollTrigger
  // ==========================================
  function initServicesDesktopScroll() {
    const longWrapper = document.querySelector('.services_box-desktop .services_long-wrapper');
    if (!longWrapper) return;

    let scrollTriggerInstance = null;
    let isProgrammaticScroll = false;

    function waitForServicesDesktop(callback) {
      if (window.ServicesDesktop && window.ServicesDesktop.isReady()) {
        callback();
        return;
      }

      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        if (window.ServicesDesktop && window.ServicesDesktop.isReady()) {
          clearInterval(timer);
          callback();
        } else if (attempts > 40) {
          clearInterval(timer);
          console.warn('GSAP: ServicesDesktop controller not ready');
        }
      }, 50);
    }

    function getScrollBounds() {
      const rect = longWrapper.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const start = rect.top + scrollY;
      const end = start + longWrapper.offsetHeight - window.innerHeight;
      return { start: start, end: Math.max(start + 1, end) };
    }

    function scrollToIndex(index) {
      const api = window.ServicesDesktop;
      if (!api) return;

      const count = api.getItemCount();
      if (count <= 0) return;

      const clamped = Math.max(0, Math.min(count - 1, index));
      const bounds = getScrollBounds();
      const targetProgress = (clamped + 0.02) / count;
      const targetY = bounds.start + (bounds.end - bounds.start) * targetProgress;

      isProgrammaticScroll = true;
      api.setFromScroll(clamped, 0);

      const scrollProxy = {
        y: window.pageYOffset || document.documentElement.scrollTop
      };

      gsap.to(scrollProxy, {
        duration: 0.9,
        y: targetY,
        ease: 'power2.inOut',
        onUpdate: () => {
          window.scrollTo(0, scrollProxy.y);
        },
        onComplete: () => {
          isProgrammaticScroll = false;
          ScrollTrigger.update();
        }
      });
    }

    function createScrollTrigger() {
      const api = window.ServicesDesktop;
      if (!api || !api.isDesktop()) return;

      const count = api.getItemCount();
      if (count <= 0) return;

      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
        scrollTriggerInstance = null;
      }

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: longWrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (isProgrammaticScroll) return;

          const progress = self.progress;
          const rawIndex = Math.min(count - 1, Math.floor(progress * count));
          const segmentStart = rawIndex / count;
          const segmentSize = 1 / count;
          const segmentProgress = segmentSize > 0
            ? (progress - segmentStart) / segmentSize
            : 0;

          api.setFromScroll(rawIndex, Math.max(0, Math.min(1, segmentProgress)));
        }
      });

      api.registerScrollToIndex(scrollToIndex);
      ScrollTrigger.refresh();
    }

    waitForServicesDesktop(() => {
      const mq = window.matchMedia('(min-width: 992px)');

      const setup = () => {
        if (mq.matches) {
          createScrollTrigger();
        } else if (scrollTriggerInstance) {
          scrollTriggerInstance.kill();
          scrollTriggerInstance = null;
        }
      };

      setup();

      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', setup);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(setup);
      }
    });
  }
  // ==========================================
  // END: Desktop Services ScrollTrigger
  // ==========================================

  // ==========================================
  // START: Why Image First-Load Scale Down
  // ==========================================
  function initWhyImgScaleDown() {
    const images = gsap.utils.toArray('.section_why .why_img');
    if (!images.length) return;

    images.forEach((img) => {
      gsap.set(img, {
        scale: 1.3,
        transformOrigin: '50% 50%',
        force3D: true
      });

      const play = () => {
        gsap.to(img, {
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      };

      const armTrigger = () => {
        ScrollTrigger.create({
          trigger: img.closest('.why_image-wrapper') || img,
          start: 'top 88%',
          once: true,
          onEnter: play
        });
      };

      if (img.complete && img.naturalWidth > 0) {
        armTrigger();
      } else {
        img.addEventListener('load', armTrigger, { once: true });
        img.addEventListener('error', armTrigger, { once: true });
      }
    });
  }
  // ==========================================
  // END: Why Image First-Load Scale Down
  // ==========================================

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          initWhyImgScaleDown();
          initServicesDesktopScroll();
        }, 100);
      });
    } else {
      setTimeout(() => {
        initWhyImgScaleDown();
        initServicesDesktopScroll();
      }, 100);
    }
  }

  init();

  window.GSAPAnimations = {
    refreshServicesDesktop: initServicesDesktopScroll,
    refreshWhyImgScale: initWhyImgScaleDown,
    refresh: () => ScrollTrigger.refresh()
  };

})();
