/**
 * GSAP Animations for Vanaxi Website
 * ScrollTrigger-based fade animations for why_in-center sections
 *
 * Structure:
 * - .why_item (vertical sections stacked)
 * - .why_in-center (overflow: hidden, acts as viewport window)
 * - .why_in-center-fixed (position: fixed, full screen, centered)
 * - .why_in-center-content (the text that fades)
 *
 * Problem: All 4 .why_in-center sections are stacked vertically,
 * so they all enter viewport at the same time. Since .why_in-center-fixed
 * is position:fixed, all 4 fixed containers overlap.
 *
 * Solution: Only show ONE section's content at a time based on
 * which section is closest to the viewport center.
 */

(function() {
  'use strict';

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  /**
   * Initialize fade animations for why_in-center sections
   */
  function initWhySectionAnimations() {
    console.log('GSAP: Initializing why section animations');

    // Select all why_in-center sections
    const whySections = document.querySelectorAll('.why_in-center');

    if (whySections.length === 0) {
      console.warn('GSAP: No .why_in-center sections found!');
      return;
    }

    console.log('GSAP: Found', whySections.length, 'why_in-center sections');

    // Store sections and contents
    const sections = Array.from(whySections);
    const contents = sections.map(section => {
      const content = section.querySelector('.why_in-center-content');
      if (content) {
        content.style.removeProperty('opacity');
        gsap.set(content, { opacity: 0 });
      }
      return content;
    });

    // Create ScrollTrigger for the parent section
    ScrollTrigger.create({
      trigger: ".section_why",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      markers: false,  // Set to true for debugging
      onUpdate: (self) => {
        const progress = self.progress;
        const totalSections = sections.length;

        // Calculate which section should be active
        // Use a more precise calculation that accounts for section positions
        let activeIdx = 0;
        let subProgress = 0;

        for (let i = 0; i < totalSections; i++) {
          const sectionStart = i / totalSections;
          const sectionEnd = (i + 1) / totalSections;

          if (progress >= sectionStart && progress < sectionEnd) {
            activeIdx = i;
            subProgress = (progress - sectionStart) / (sectionEnd - sectionStart);
            break;
          } else if (i === totalSections - 1) {
            // Last section
            activeIdx = i;
            subProgress = 1;
          }
        }

        // Log active section change
        if (window.lastActiveIdx !== activeIdx) {
          console.log('GSAP: Active section:', activeIdx, 'sub-progress:', subProgress.toFixed(2));
          window.lastActiveIdx = activeIdx;
        }

        // Update all sections
        contents.forEach((content, index) => {
          if (!content) return;

          let opacity = 0;

          if (index === activeIdx) {
            // Calculate opacity based on sub-progress with adjusted timing
            if (subProgress < 0.15) {
              // Fade in: 0% to 15% → opacity 0 to 1
              opacity = subProgress / 0.15;
            } else if (subProgress < 0.85) {
              // Visible: 15% to 85% → opacity 1
              opacity = 1;
            } else {
              // Fade out: 85% to 100% → opacity 1 to 0
              opacity = 1 - ((subProgress - 0.85) / 0.15);
            }
          } else {
            opacity = 0;
          }

          gsap.set(content, { opacity: opacity });
        });
      }
    });

    ScrollTrigger.refresh();
    console.log('GSAP: ScrollTrigger setup complete');
  }

  /**
   * Initialize all GSAP animations
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initWhySectionAnimations, 100);
      });
    } else {
      setTimeout(initWhySectionAnimations, 100);
    }
  }

  // Initialize
  init();

  // Expose for manual refresh
  window.GSAPAnimations = {
    refreshWhySections: initWhySectionAnimations,
    refresh: () => ScrollTrigger.refresh()
  };

})();
