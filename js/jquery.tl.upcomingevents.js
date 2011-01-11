/*
 * jQuery TicketLeap Upcoming Events Plugin 0.4.1
 * Copyright (c) 2010 Tim Crowe
 *
 * http://www.ticketleap.com/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
*/
(function($){

	$.fn.extend({
		upcomingEvents: function(opts){
			opts = $.extend({}, $.fn.upcomingEvents.defaults, opts);

			return this.each(function(){
				new UpcomingEvents(this, opts);
			});
		}
	});

	var UpcomingEvents = function(el, opts){
		
		// console.log(this, el, opts);
		this.options = opts;
		this.element = $(el);
		
		this.showEventsList();
		
	}; UpcomingEvents.prototype = {

		setupWrapper: function(){},

		emptyWrapper: function(){
			this.element.empty();
		},

		showEventsList: function(){
			if(this.events){
				var self = this;
				this.emptyWrapper();
				
				$.each(this.events, function(idx, evt){
					self.element.append(self.createEvent(evt.name, evt.slug));
				});
			} else {
				this.getEventsList();
			}
		},

		getEventsList: function(){
			var self = this;
			this.events = {};

			$.ajax({
				url: this.options.apiUrl + "organizations/bacons/events?callback=?",
				dataType: 'json',
				success: function(data){
					$.each(data.events, function(idx, evt){
						// console.log(self, idx, evt);
						self.events[evt.slug] = evt;
					});
					self.showEventsList();
				}
			});
		},

		createEvent: function(eventName, eventSlug){
			var self = this;
			
			eventEl = $('<div class="tl-event">'+eventName+'</div>');
			eventEl.click(function(){
				self.showPerformancesList(eventSlug);
			});
			return eventEl;
		},

		showPerformancesList: function(eventSlug){
			if(this.events[eventSlug].performances){
				
				var self = this;
				this.emptyWrapper();
				
				showEventsElement = $('<div>Show All Events</div>');
				showEventsElement.click(function(){
					self.showEventsList();
				});
				
				self.element.append(showEventsElement);
				
				$.each(this.events[eventSlug].performances, function(idx, perf){
					self.element.append(self.createPerformance(perf.start_utc, perf.end_utc, perf.slug));
				});
				
			} else {
				this.getPerformancesList(eventSlug);
			}
		},
		
		getPerformancesList: function(eventSlug){
			var self = this;
			this.events[eventSlug].performances = {};
			
			$.ajax({
				url: this.options.apiUrl + "organizations/bacons/events/"+eventSlug+"?callback=?",
				dataType: 'json',
				success: function(data){
					$.each(data.performances, function(idx, perf){
						self.events[eventSlug].performances[perf.slug] = perf;
					});
					self.showPerformancesList(eventSlug);
				}
			});
		},
		
		createPerformance: function(performanceStart, performanceEnd, performanceSlug){
			var self = this;
			
			perfEl = $('<div class="tl-performance">'+performanceStart+' - '+performanceEnd+'</div>');
			// eventEl.click(function(){
			// 	self.showPerformancesList(eventSlug);
			// });
			return perfEl;
		}
		
	};

	// default options
	$.fn.upcomingEvents.defaults = {
		apiUrl: "http://www.local.ticketleap.com:8002/"
	};

})(jQuery);
