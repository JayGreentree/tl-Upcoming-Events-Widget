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
		
		this.wrapNode = $('<table class="tl-upcoming"></table>');
		this.headerNode = $('<thead class="tl-upcoming-header"></thead>');
		this.contentNode = $('<tbody class="tl-upcoming-content"></tbody>');
		this.navNode = $('<tfoot class="tl-upcoming-nav"></tfoot>');
		
		this.originNode.append(this.wrapNode);
		this.wrapNode.append(this.headerNode);
		this.wrapNode.append(this.contentNode);
		this.wrapNode.append(this.navNode);
		
		this.eventPage = 1;
		
		this.showEventsList();
		
	}; UpcomingEvents.prototype = {

		clearContent: function(){
			
			this.headerNode.empty();
			this.contentNode.empty();
			this.navNode.empty();
			
		},

		createButton: function(content, additionalClass, clickFunction){
			var button = $('<td><span class="tl-upcoming-button '+ additionalClass +'">'+ content +'</span></td>');
			button.click(clickFunction);
			return button;
		},
		
		showEventsList: function(){
			if(this.events){
				this.clearContent();
				this.performancePage = 1;

				var self = this,
					headerContent = $("<h2>Upcoming Events</h2>");

				this.headerNode.append(headerContent);
				
				if(this.eventPage != 1){
					this.navNode.append(this.createButton('&laquo;', 'tl-upcoming-button-page', function(){ self.pageEventsList(false); }));
				}

				if(this.eventPage*this.options.pageSize < this.total_events){
					this.navNode.append(this.createButton('&raquo;', 'tl-upcoming-button-page', function(){ self.pageEventsList(true); }));
				}
				
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
				url: this.options.apiUrl + "organizations/"+ this.options.orgSlug +"/events?callback=?",
				data: {
					page_num: this.eventPage,
					page_size: this.options.pageSize
				},
				dataType: 'json',
				success: function(data){
					$.each(data.events, function(idx, eventObj){
						self.events[eventObj.slug] = eventObj;
					});
					self.total_events = data.total_count;
					self.showEventsList();
				}
			});
		},
		
		pageEventsList: function(forward){
			this.events = null;
			this.eventPage += (forward ? 1 : -1);
			this.showEventsList();
		},

		createEvent: function(eventObj){
			var self = this,
				eventEl = $('<tr class="tl-upcoming-item tl-upcoming-event"><td class="tl-upcoming-item-label tl-upcoming-event-label">'+eventObj.name+'</td></tr>');

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
				
				if(this.performancePage != 1){
					this.navNode.append(this.createButton('&laquo;', 'tl-upcoming-button-page', function(){ self.pagePerformancesList(eventSlug, false); }));
				}

				if(this.performancePage*this.options.pageSize < this.events[eventSlug].performance_count){
					this.navNode.append(this.createButton('&raquo;', 'tl-upcoming-button-page', function(){ self.pagePerformancesList(eventSlug, true); }));
				}
				
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
				url: this.options.apiUrl + "organizations/"+ this.options.orgSlug +"/events/"+eventSlug+"?callback=?",
				data: {
					page_num: this.performancePage,
					page_size: this.options.pageSize
				},
				dataType: 'json',
				success: function(data){
					$.each(data.performances, function(i, performanceObj){
						self.events[eventSlug].performances[performanceObj.slug] = performanceObj;
					});
					self.showPerformancesList(eventSlug);
				}
			});
		},
		
		pagePerformancesList: function(eventSlug, forward){
			this.events[eventSlug].performances = null;
			this.performancePage += (forward ? 1 : -1);
			this.showPerformancesList(eventSlug);
		},

		createPerformance: function(performanceObj){
			var self = this,
				perfEl = $('<tr class="tl-upcoming-item tl-upcoming-performance"><td>'+performanceObj.start_local+' - '+performanceObj.end_local+'</td></tr>');
				
			perfEl.append(this.createButton('Buy Tickets', 'tl-upcoming-button-buy', function(){
				window.open(performanceObj.url);
			}));
				
			return perfEl;
		}
		
	};

	// default options
	// $.fn.upcomingEvents.defaults = {
	// 	pageSize: 4,
	// 	orgSlug: 'bacons',
	// 	apiUrl: "http://publicapi.local.ticketleap.com:8002/"
	// };

	// default options
	$.fn.upcomingEvents.defaults = {
		pageSize: 10,
		orgSlug: 'awesomepuppies',
		apiUrl: "http://publicapi.current.ticketleap.com/"
	};

})(jQuery);
