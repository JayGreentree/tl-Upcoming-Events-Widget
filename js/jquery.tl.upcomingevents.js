/*
 * jQuery TicketLeap Upcoming Events Plugin 0.1
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
		
		this.options = opts;
		this.originNode = $(el);
		
		this.wrapNode = $('<div class="tl-upcoming"></div>');
		this.headerNode = $('<div class="tl-upcoming-header"></div>');
		this.contentNode = $('<div class="tl-upcoming-content"></div>');
		
		this.originNode.append(this.wrapNode);
		this.wrapNode.append(this.headerNode);
		this.wrapNode.append(this.contentNode);
		
		this.showEventsList();
		
	}; UpcomingEvents.prototype = {

		clearContent: function(){
			
			this.headerNode.empty();
			this.contentNode.empty();
			
		},

		createButton: function(content, additionalClass, clickFunction){
			var button = $('<span class="tl-upcoming-button '+ additionalClass +'">'+ content +'</span>');
			button.click(clickFunction);
			return button;
		},
		
		showEventsList: function(){
			if(this.events){
				this.clearContent();

				var self = this,
					headerContent = $("<h2>Upcoming Events</h2>");

				this.headerNode.append(headerContent);
				
				$.each(this.events, function(i, eventObj){
					self.contentNode.append(self.createEvent(eventObj));
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
					$.each(data.events, function(idx, eventObj){
						self.events[eventObj.slug] = eventObj;
					});
					self.showEventsList();
				}
			});
		},

		createEvent: function(eventObj){
			var self = this,
				eventEl = $('<div class="tl-upcoming-item tl-upcoming-event"><span class="tl-upcoming-item-label tl-upcoming-event-label">'+eventObj.name+'</span></div>');

			if(eventObj.performance_count == 1){
				eventEl.append(this.createButton('Buy Tickets', 'tl-upcoming-button-buy', function(){
					window.open(eventObj.url);
				}));
			} else if(eventObj.performance_count > 1){
				eventEl.append(this.createButton('Info', 'tl-upcoming-button-info', function(){
					window.open(eventObj.url);
				}));

				eventEl.append(this.createButton('Dates &raquo;', 'tl-upcoming-button-info', function(){
					self.showPerformancesList(eventObj.slug);
				}));
			}
			
			return eventEl;
		},

		showPerformancesList: function(eventSlug){
			if(this.events[eventSlug].performances){
				this.clearContent();
				
				var self = this,
					backButton = $('<span class="tl-upcoming-button tl-upcoming-button-info">&laquo; View all events</span>'),
					headerContent = $('<h2>'+ this.events[eventSlug].name +'</h2>');

				backButton.click(function(){
					self.showEventsList();
				});
				
				this.headerNode.append(headerContent);
				this.headerNode.append(backButton);
				
				$.each(this.events[eventSlug].performances, function(idx, performanceObj){
					self.contentNode.append(self.createPerformance(performanceObj));
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
					$.each(data.performances, function(i, performanceObj){
						self.events[eventSlug].performances[performanceObj.slug] = performanceObj;
					});
					self.showPerformancesList(eventSlug);
				}
			});
		},
		
		createPerformance: function(performanceObj){
			var self = this,
				perfEl = $('<div class="tl-upcoming-item tl-upcoming-performance">'+performanceObj.start_utc+' - '+performanceObj.end_utc+'</div>');
				
			perfEl.append(this.createButton('Buy Tickets', 'tl-upcoming-button-buy', function(){
				window.open(performanceObj.url);
			}));
				
			return perfEl;
		}
		
	};

	// default options
	$.fn.upcomingEvents.defaults = {
		apiUrl: "http://www.local.ticketleap.com:8002/"
	};

})(jQuery);
