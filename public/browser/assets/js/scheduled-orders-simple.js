/**
 * Scheduled Orders - Simple Version
 * (No toggle functionality - just countdown timers)
 */

(function($) {
  'use strict';

  // Initialize when DOM is ready
  $(document).ready(function() {
    // Initialize countdown timers
    initScheduledCountdowns();

    // Initialize scroll animations if waypoints is available
    initScrollAnimations();
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

          // Only add badge once
          if (!card.find('.schedule-status-badge').length) {
            if (daysLeft === 0 && hoursLeft < 24) {
              card.find('.schedule-header').append(
                '<div class="schedule-status-badge closing-soon">Closing Soon</div>'
              );
            } else if (daysLeft > 0) {
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

})(jQuery);
