/**
 * Scheduled Orders JavaScript
 * Handles countdown timers and section toggling
 */

(function($) {
  'use strict';

  // Initialize when DOM is ready
  $(document).ready(function() {

    // Initialize countdown timers for scheduled orders
    initScheduledCountdowns();

    // Initialize section toggle functionality
    initSectionToggle();

    // Check URL parameters for auto-filtering
    checkURLParameters();
  });

  /**
   * Initialize countdown timers for scheduled order cards
   */
  function initScheduledCountdowns() {
    $('.schedule-countdown').each(function() {
      var $this = $(this);
      var finalDate = $this.data('countdown');

      if (finalDate && $.fn.countdown) {
        $this.countdown(finalDate, function(event) {
          $this.html(event.strftime(
            '<div class="countdown-section">' +
              '<span class="countdown-amount">%D</span>' +
              '<span class="countdown-period">Days</span>' +
            '</div>' +
            '<div class="countdown-section">' +
              '<span class="countdown-amount">%H</span>' +
              '<span class="countdown-period">Hours</span>' +
            '</div>' +
            '<div class="countdown-section">' +
              '<span class="countdown-amount">%M</span>' +
              '<span class="countdown-period">Mins</span>' +
            '</div>' +
            '<div class="countdown-section">' +
              '<span class="countdown-amount">%S</span>' +
              '<span class="countdown-period">Sec</span>' +
            '</div>'
          ));

          // Add status badge based on time remaining
          var daysLeft = parseInt(event.strftime('%D'));
          var hoursLeft = parseInt(event.strftime('%H'));
          var card = $this.closest('.schedule-card-wrap');

          if (daysLeft === 0 && hoursLeft < 24) {
            if (!card.find('.schedule-status-badge').length) {
              card.find('.schedule-header').append(
                '<div class="schedule-status-badge closing-soon">Closing Soon</div>'
              );
            }
          } else if (daysLeft > 0) {
            if (!card.find('.schedule-status-badge').length) {
              card.find('.schedule-header').append(
                '<div class="schedule-status-badge open">Open</div>'
              );
            }
          }
        });
      }
    });
  }

  /**
   * Initialize section toggle between Deals and Scheduled Orders
   */
  function initSectionToggle() {
    // Create toggle controls if they don't exist
    var dealsSection = $('section.section-padding').find('h3:contains("Deals Of The Day")').closest('section');
    var scheduledSection = $('#scheduled-orders-section');

    // Only add toggle if both sections exist
    if (dealsSection.length && scheduledSection.length) {
      // Create toggle controls
      var toggleHTML =
        '<div class="container mb-4">' +
          '<div class="section-toggle-controls">' +
            '<button class="toggle-btn active" data-target="deals">Deals Of The Day</button>' +
            '<button class="toggle-btn" data-target="scheduled">Scheduled Orders</button>' +
          '</div>' +
        '</div>';

      // Insert toggle before deals section
      dealsSection.before(toggleHTML);

      // Hide scheduled section by default
      scheduledSection.hide();

      // Handle toggle clicks
      $('.toggle-btn').on('click', function() {
        var target = $(this).data('target');

        // Update active state
        $('.toggle-btn').removeClass('active');
        $(this).addClass('active');

        // Show/hide sections with smooth transition
        if (target === 'deals') {
          scheduledSection.fadeOut(300, function() {
            dealsSection.fadeIn(300);
          });
        } else if (target === 'scheduled') {
          dealsSection.fadeOut(300, function() {
            scheduledSection.fadeIn(300);
            // Reinitialize countdowns after showing
            initScheduledCountdowns();
          });
        }

        // Update URL without page reload
        updateURL(target);
      });
    }
  }

  /**
   * Check URL parameters and auto-filter if needed
   */
  function checkURLParameters() {
    var urlParams = new URLSearchParams(window.location.search);
    var filter = urlParams.get('filter');

    if (filter === 'scheduled') {
      // Trigger click on scheduled button
      $('.toggle-btn[data-target="scheduled"]').trigger('click');
    }
  }

  /**
   * Update URL with current filter
   */
  function updateURL(filter) {
    if (window.history && window.history.pushState) {
      var newURL = window.location.pathname;
      if (filter === 'scheduled') {
        newURL += '?filter=scheduled';
      }
      window.history.pushState({path: newURL}, '', newURL);
    }
  }

  /**
   * Add smooth scroll to schedule cards when clicking on navigation
   */
  function initSmoothScroll() {
    $('a[href*="#scheduled-orders"]').on('click', function(e) {
      e.preventDefault();
      var target = $(this.getAttribute('href'));

      if (target.length) {
        // First show scheduled section
        $('.toggle-btn[data-target="scheduled"]').trigger('click');

        // Then scroll to it
        setTimeout(function() {
          $('html, body').stop().animate({
            scrollTop: target.offset().top - 100
          }, 1000);
        }, 400);
      }
    });
  }

  // Initialize smooth scroll
  initSmoothScroll();

  /**
   * Add animation when cards come into view
   */
  function initScrollAnimations() {
    if (typeof $.fn.waypoint !== 'undefined') {
      $('.schedule-card-wrap').waypoint(function() {
        $(this.element).addClass('animate-in');
      }, {
        offset: '90%'
      });
    }
  }

  // Initialize scroll animations
  initScrollAnimations();

})(jQuery);
