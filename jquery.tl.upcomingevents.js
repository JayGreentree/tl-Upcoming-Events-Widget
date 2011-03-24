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

	var FormattableDate = function(date){
			var d = new Date(date),
				dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
				monthMap = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

			return {
				day: dayMap[d.getDay()],
				month: monthMap[d.getMonth()],
				date: d.getDate(),
				year: d.getFullYear(),
				hour: (d.getHours() > 12 ? d.getHours() - 12 : (d.getHours() == 0 ? 12 : d.getHours())),
				minute: (d.getMinutes() > 10 ? d.getMinutes() : "0"+d.getMinutes()),
				ampm: (d.getHours() >= 12 ? 'p.m.' : 'a.m.'),
				toDateString: function(){
					return this.day + ", " +
							this.month + " " +
							this.date + ", " +
							this.year;
				},
				toTimeString: function(){
					return this.hour + ":" +
							this.minute +
							this.ampm;
				},
				toString: function(){
					return this.toDateString() + " " + this.toTimeString();
				}
			};
		},
		
		UpcomingEvents = function(el, opts){

			this.options = opts;
			this.originNode = $(el);

			this.buildShell();
			this.showEventsList();

		}; UpcomingEvents.prototype = {
		
			// base attributes
			options: null,
			originNode: null,
			shell: null,
			events: null,
		
			// header components
			headerLabel: null,
		
			// content area
			content: null,
		
			// navigation buttons
			nextButton: null,
			previousButton: null,
			viewEventsButton: null,
		
			// paging
			currentView: 'events', // performances
			currentEvent: '',
			eventsPage: 1,
			performancesPage: 1,
			totalEvents: 0,
		
			buildShell: function(){
				var self = this,
					html = '<div class="tl-upcoming">' +
								'<div class="tl-upcoming-header">' +
									'<h2 class="tl-upcoming-header-label"></h2>' +
								'</div>'+

								'<div class="tl-upcoming-content">' +
									'<table class="tl-upcoming-content-list"></table>'+
								'</div>' +

								'<div class="tl-upcoming-nav">' +
									'<table class="tl-upcoming-nav-controls">' +
										'<tr>' +
											'<td class="tl-upcoming-nav-previous"><span class="tl-upcoming-button tl-upcoming-button-page">&laquo; Previous</span></td>' +
											'<td class="tl-upcoming-nav-events"><span class="tl-upcoming-button tl-upcoming-button-info">View Events</span></td>' +
											'<td class="tl-upcoming-nav-next"><span class="tl-upcoming-button tl-upcoming-button-page">Next &raquo;</span></td>' +
										'</tr>' +
									'</table>'+
								'</div>' +
							'</div>';
			
				this.shell = $(html);
			
				// get header nodes
				this.headerLabel = this.shell.find('.tl-upcoming-header-label');
			
				// get content area node
				this.content = this.shell.find('.tl-upcoming-content-list');
			
				// setup navigation
				this.nextButton = this.shell.find('.tl-upcoming-nav-next .tl-upcoming-button');
				this.previousButton = this.shell.find('.tl-upcoming-nav-previous .tl-upcoming-button');
				this.viewEventsButton = this.shell.find('.tl-upcoming-nav-events .tl-upcoming-button');
			
				this.nextButton.click(function(){ self.page(true); });
				this.previousButton.click(function(){ self.page(false); });
				this.viewEventsButton.click(function(){ self.showEventsList(); });
			
				this.setPageButtonStates();
			
				// place shell nodes
				this.originNode.prepend(this.shell);
			},
		
			capitalize: function(str){
			   return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
			},
		
			formatISODateString: function(d){
				function pad(n){ return n<10 ? '0'+n : n; }

				return d.getUTCFullYear()+'-'
				+ pad(d.getUTCMonth()+1)+'-'
				+ pad(d.getUTCDate());
			},

			formatDisplayDates: function(startDate, endDate){
				var s = new FormattableDate(startDate),
					e = new FormattableDate(endDate);
				
				return (s.toDateString() == e.toDateString() ? 
							s.toDateString() + ' ' + s.toTimeString() + '-' + e.toTimeString() :
							s.toString() + ' - ' + e.toString());
			},

			page: function(forward){
				this[this.currentView + 'Page'] += (forward ? 1 : -1);
				if(this.currentView == 'events'){
					this.events = null;
				} else if( this.currentView == 'performances'){
					this.events[this.currentEvent].performances = null;
				}
				this['show' + this.capitalize(this.currentView) + 'List'](this.currentEvent);
			},

			setPageButtonStates: function(){
				this.previousButton[this.isFirstPage() ? 'hide' : 'show']();
				this.nextButton[this.isLastPage() ? 'hide' : 'show']();
			},

			isFirstPage: function(){
				return (this.currentView == 'events' && this.eventsPage == 1) || 
						(this.currentView == 'performances' && this.performancesPage == 1);
			},
		
			isLastPage: function(){
				return (this.currentView == 'events' && ((this.options.pageSize > this.totalEvents) || (this.eventsPage*this.options.pageSize >= this.totalEvents))) ||
						(this.currentView == 'performances' && ((this.options.pageSize > this.events[this.currentEvent].performance_count) || 
																(this.performancesPage*this.options.pageSize >= this.events[this.currentEvent].performance_count)));
			},

			clearContent: function(){
				this.content.empty();
			},

			createButton: function(content, additionalClass, clickFunction){
				var button = $('<td class="tl-upcoming-item-control"><span class="tl-upcoming-button '+ additionalClass +'">'+ content +'</span></td>');
				button.click(clickFunction);
				return button;
			},

			markFirstAndLast: function(){
				$(this.content.find('tr').get(0)).addClass('tl-upcoming-item-first');
				$(this.content.find('tr').get(-1)).addClass('tl-upcoming-item-last');
			},

			getObjects: function(eventSlug){
				var url = this.options.apiUrl + "organizations/" + this.options.orgSlug + "/events" + (typeof eventSlug == 'string' ? '/' + eventSlug : '') + "?callback=?",
					pageNum = (typeof eventSlug == 'string' ? this.performancesPage : this.eventsPage);
				
				return $.ajax({
					url: url,
					data: {
						page_num: pageNum,
						page_size: this.options.pageSize,
						dates_after: this.formatISODateString(new Date)
					},
					dataType: 'jsonp'
				});
			},

			showEventsList: function(){
				var self = this;
			
				this.currentView = 'events';
				this.currentEvent = '';
				this.performancesPage = 1;
				this.headerLabel.html('Upcoming Events');
				this.viewEventsButton.hide();
			
				if(this.events){
					this.clearContent();
					$.each(this.events, function(i, eventObj){
						self.content.append(self.createEvent(eventObj));
					});
					this.setPageButtonStates();
				} else {
					this.getEventsList();
				}
				this.markFirstAndLast();
			},

			getEventsList: function(){
				var self = this;
			
				this.events = {};

				$.when(this.getObjects()).then(function(data){
					$.each(data.events, function(idx, eventObj){
						self.events[eventObj.slug] = eventObj;
					});
					self.totalEvents = data.total_count;
					self.showEventsList();
				});
			},

			createEvent: function(eventObj){
				var self = this,
					eventEl = $('<tr class="tl-upcoming-item tl-upcoming-event">' +
									'<td class="tl-upcoming-item-label tl-upcoming-event-label">' +
										'<div class="tl-upcoming-event-title">' + eventObj.name +'</div>' +
										'<div class="tl-upcoming-event-dates">' + this.formatDisplayDates(eventObj.earliest_start_local, eventObj.latest_end_local) + '</div>' +
									'</td>' +
								'</tr>');

				if(eventObj.performance_count == 1){
					eventEl.append(this.createButton('Buy Tickets', 'tl-upcoming-button-buy', function(){
						window.open(eventObj.url);
					}));
				} else if(eventObj.performance_count > 1){
					eventEl.append(this.createButton('Dates &raquo;', 'tl-upcoming-button-info', function(){
						self.showPerformancesList(eventObj.slug);
					}));
				}
			
				return eventEl;
			},

			showPerformancesList: function(eventSlug){
				var self = this;
			
				this.currentView = 'performances';
				this.currentEvent = eventSlug;
				this.headerLabel.html(this.events[eventSlug].name);
				this.viewEventsButton.show();
			
				if(this.events[eventSlug].performances){
					this.clearContent();
					$.each(this.events[eventSlug].performances, function(idx, performanceObj){
						self.content.append(self.createPerformance(performanceObj));
					});
					this.setPageButtonStates();
				} else {
					this.getPerformancesList(eventSlug);
				}
				this.markFirstAndLast();
			},
		
			getPerformancesList: function(eventSlug){
				var self = this;
				this.events[eventSlug].performances = {};

				$.when(this.getObjects(eventSlug)).then(function(data){
					$.each(data.performances, function(i, performanceObj){
						self.events[eventSlug].performances[performanceObj.slug] = performanceObj;
					});
					self.showPerformancesList(eventSlug);
				});
			},

			createPerformance: function(performanceObj){
				var self = this,
					perfEl = $('<tr class="tl-upcoming-item tl-upcoming-performance">' +
									'<td class="tl-upcoming-item-label">' +
										'<div class="tl-upcoming-performance-label">' + this.formatDisplayDates(performanceObj.start_local, performanceObj.end_local) + '</div>' +
									'</td>' +
								'</tr>');
			
				perfEl.append(this.createButton('Buy Tickets', 'tl-upcoming-button-buy', function(){
					window.open(performanceObj.url);
				}));
				
				return perfEl;
			}
		};

	// default options
	$.fn.upcomingEvents.defaults = {
		pageSize: 10,
		apiUrl: "http://public-api.current.ticketleap.com/"
	};

})(jQuery);
