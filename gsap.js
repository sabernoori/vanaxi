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
    ScrollTrigger.matchMedia({
      // Mobile / tablet only
      '(max-width: 991px)': function() {
        const images = gsap.utils.toArray('.section_why .why_img');
        if (!images.length) return;

        const cleanups = [];

        images.forEach((img) => {
          const triggerEl =
            img.closest('.why_img-box') ||
            img.closest('.why_image-wrapper') ||
            img;

          gsap.set(img, {
            scale: 1.3,
            transformOrigin: '50% 50%',
            force3D: true
          });

          let played = false;
          const play = () => {
            if (played) return;
            played = true;
            gsap.to(img, {
              scale: 1,
              duration: 1,
              ease: 'power3.out',
              overwrite: 'auto'
            });
          };

          const armTrigger = () => {
            const st = ScrollTrigger.create({
              trigger: triggerEl,
              start: 'top 92%',
              once: true,
              invalidateOnRefresh: true,
              onEnter: play
            });

            // If already in / past the start line when armed, play immediately
            // (common on mobile — onEnter does not fire retroactively)
            if (st.start <= window.pageYOffset + window.innerHeight * 0.92) {
              play();
              st.kill();
            }

            cleanups.push(() => st.kill());
            ScrollTrigger.refresh();
          };

          if (img.complete && img.naturalWidth > 0) {
            armTrigger();
          } else {
            const onReady = () => armTrigger();
            img.addEventListener('load', onReady, { once: true });
            img.addEventListener('error', onReady, { once: true });
            cleanups.push(() => {
              img.removeEventListener('load', onReady);
              img.removeEventListener('error', onReady);
            });
          }
        });

        return function() {
          cleanups.forEach((fn) => fn());
          gsap.set(images, { clearProps: 'transform' });
        };
      }
    });
  }
  // ==========================================
  // END: Why Image First-Load Scale Down
  // ==========================================

  // ==========================================
  // START: Process Steps Sticky Scroll
  // ==========================================
  function initProcessStepsScroll() {
    // ----------------------------------------------------------
    // CONFIG — tweak these freely
    // ----------------------------------------------------------
    // vhPerStep: scroll travel (in vh) between each centered step.
    //   Total long height ≈ sticky panel height + (steps - 1) * vhPerStep
    // scrub: higher = smoother lag behind the scroll (try 0.8–1.4)
    // inactiveOpacity: opacity when a step is fully away from center (0–1)
    // fadeFalloff: how far from center (as fraction of process_center height)
    //   a step must travel before it reaches inactiveOpacity
    // snap: snap scroll progress to each step center
    // snapDuration: seconds for soft snap settle (higher = smoother)
    // stickyTop: must match CSS .process_wrapper { top: … }
    // ----------------------------------------------------------
    const PROCESS_STEPS_CONFIG = {
      vhPerStep: 100,
      scrub: 1.1,
      inactiveOpacity: 0.15,
      fadeFalloff: 0.55,
      snap: true,
      snapDuration: 0.65,
      stickyTop: '10vh'
    };

    const long = document.querySelector('.section_process .process_long');
    const wrapper = document.querySelector('.section_process .process_wrapper');
    const center = document.querySelector('.section_process .process_center');
    const track = document.querySelector('.section_process .process_steps-track');
    if (!long || !wrapper || !center || !track) return;

    const steps = gsap.utils.toArray(track.querySelectorAll('.process_step-wrapper'));
    if (steps.length < 2) return;

    let scrollTriggerInstance = null;
    let stepTargets = [];

    const getStepTargets = () => {
      // y needed so each step's vertical center sits in process_center midpoint
      const mid = center.clientHeight / 2;
      return steps.map((step) => {
        const stepMid = step.offsetTop + step.offsetHeight / 2;
        return -(stepMid - mid);
      });
    };

    const smoothstep = (t) => t * t * (3 - 2 * t);

    const applyProgress = (progress) => {
      const y = gsap.utils.interpolate(stepTargets)(progress);
      gsap.set(track, { y });

      // Fade from real position vs process_center midpoint (not step index)
      const centerRect = center.getBoundingClientRect();
      const centerMidY = centerRect.top + centerRect.height / 2;
      const falloffPx = Math.max(1, center.clientHeight * PROCESS_STEPS_CONFIG.fadeFalloff);

      steps.forEach((step) => {
        const rect = step.getBoundingClientRect();
        const stepMidY = rect.top + rect.height / 2;
        const dist = Math.abs(stepMidY - centerMidY);
        const t = smoothstep(gsap.utils.clamp(0, 1, dist / falloffPx));
        const opacity = gsap.utils.interpolate(
          1,
          PROCESS_STEPS_CONFIG.inactiveOpacity
        )(t);

        gsap.set(step, { opacity });
        step.classList.toggle('is-inactive', opacity < 0.9);
      });
    };

    const setLongHeight = () => {
      // Keep sticky panel size + one configurable vh block per step transition
      const panelHeight = wrapper.offsetHeight;
      const travelVh = (steps.length - 1) * PROCESS_STEPS_CONFIG.vhPerStep;
      long.style.height = `calc(${panelHeight}px + ${travelVh}vh)`;
    };

    const create = () => {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
        scrollTriggerInstance = null;
      }

      setLongHeight();
      // Reset transform before measuring offsets
      gsap.set(track, { y: 0 });
      stepTargets = getStepTargets();
      applyProgress(0);

      const snapIncrement = steps.length > 1 ? 1 / (steps.length - 1) : 1;

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: long,
        start: `top ${PROCESS_STEPS_CONFIG.stickyTop}`,
        end: 'bottom bottom',
        scrub: PROCESS_STEPS_CONFIG.scrub,
        invalidateOnRefresh: true,
        snap: PROCESS_STEPS_CONFIG.snap
          ? {
              snapTo: snapIncrement,
              duration: {
                min: PROCESS_STEPS_CONFIG.snapDuration * 0.75,
                max: PROCESS_STEPS_CONFIG.snapDuration
              },
              ease: 'power2.inOut'
            }
          : false,
        onRefresh: () => {
          setLongHeight();
          stepTargets = getStepTargets();
          applyProgress(scrollTriggerInstance ? scrollTriggerInstance.progress : 0);
        },
        onUpdate: (self) => {
          applyProgress(self.progress);
        }
      });

      ScrollTrigger.refresh();
    };

    create();

    // Rebuild targets after fonts/images settle
    window.addEventListener('load', () => {
      setLongHeight();
      ScrollTrigger.refresh();
      if (scrollTriggerInstance) applyProgress(scrollTriggerInstance.progress);
    }, { once: true });
  }
  // ==========================================
  // END: Process Steps Sticky Scroll
  // ==========================================

  // ==========================================
  // START: Why Center Content Fade In (Desktop)
  // ==========================================
  // Structure (desktop):
  //   .why_in-center        → relative, overflow:hidden, clip-path:inset(0%)
  //   .why_in-center-fixed  → position:fixed; inset:0 (full viewport, flex-centered)
  //   .why_in-center-content→ the text block sitting in screen center
  //
  // The clip window (.why_in-center) scrolls over the fixed text.
  // Fade must run while that clip is crossing the text — not while the
  // text is still fully above the mask (where opacity changes are invisible).
  // ==========================================
  function initWhyCenterFadeIn() {
    ScrollTrigger.matchMedia({
      '(min-width: 992px)': function() {
        const centers = gsap.utils.toArray('.section_why .why_in-center');
        if (!centers.length) return;

        const tweens = [];

        centers.forEach((center) => {
          const content = center.querySelector('.why_in-center-content');
          if (!content) return;

          // Clear any previous opacity on the full-viewport shell
          const fixed = center.querySelector('.why_in-center-fixed');
          if (fixed) gsap.set(fixed, { clearProps: 'opacity' });

          gsap.set(content, { opacity: 0 });

          const tween = gsap.fromTo(
            content,
            { opacity: 0 },
            {
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: center,
                // Start: clip top meets content bottom.
                // Content is viewport-centered via fixed flex, so its bottom
                // is a stable viewport line (not tied to the moving clip).
                start: () => {
                  const vh = window.innerHeight;
                  // Prefer live measure; fall back to geometric center
                  const rect = content.getBoundingClientRect();
                  let contentBottom;
                  if (rect.height > 1) {
                    contentBottom = rect.bottom;
                  } else {
                    contentBottom = (vh + content.offsetHeight) / 2;
                  }
                  return 'top ' + contentBottom + 'px';
                },
                // End: after 30% of why_in-center height.
                // Floor at 30vh so the fade is perceptible (why_in-center is
                // only ~24rem from the image column — 30% is still short).
                end: () => {
                  const fromCenter = center.offsetHeight * 0.35;
                  const minVisible = window.innerHeight * 0.35;
                  return '+=' + Math.max(fromCenter, minVisible);
                },
                scrub: true,
                invalidateOnRefresh: true
              }
            }
          );

          tweens.push(tween);
        });

        ScrollTrigger.refresh();

        return function() {
          tweens.forEach((tween) => {
            if (tween.scrollTrigger) tween.scrollTrigger.kill();
            tween.kill();
          });
          centers.forEach((center) => {
            const content = center.querySelector('.why_in-center-content');
            const fixed = center.querySelector('.why_in-center-fixed');
            if (content) gsap.set(content, { clearProps: 'opacity' });
            if (fixed) gsap.set(fixed, { clearProps: 'opacity' });
          });
        };
      }
    });
  }
  // ==========================================
  // END: Why Center Content Fade In (Desktop)
  // ==========================================

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          initWhyImgScaleDown();
          initWhyCenterFadeIn();
          initServicesDesktopScroll();
          initProcessStepsScroll();
        }, 100);
      });
    } else {
      setTimeout(() => {
        initWhyImgScaleDown();
        initWhyCenterFadeIn();
        initServicesDesktopScroll();
        initProcessStepsScroll();
      }, 100);
    }
  }

  init();

  window.GSAPAnimations = {
    refreshServicesDesktop: initServicesDesktopScroll,
    refreshWhyImgScale: initWhyImgScaleDown,
    refreshWhyCenterFade: initWhyCenterFadeIn,
    refreshProcessSteps: initProcessStepsScroll,
    refresh: () => ScrollTrigger.refresh()
  };

})();