<p>Using the <a href="http://dev.ticketleap.com/">TicketLeap Public API</a> you can add your 
	events to your own website. We've developed a <a href="http://jquery.com/">jQuery</a> plugin 
	to demonstrate this. Take a look at the <a href="/Upcoming-Events-Widget/example.html">Upcoming 
	Events Widget Example</a>. You can use this on widget on your own site to share your TicketLeap 
	events on your own website.</p>

<h2>How to Use It</h2>

<p>Download the <a href="http://github.com/TicketLeap/Upcoming-Events-Widget">Upcoming Events Widget 
	on GitHub</a> and put the source in your site directory.</p>

<p>On the page you will be using the Upcoming Events Widget, add the following HTML to the head of your page.</p>

<pre><code class="brush: xml;">&lt;link href="PATH_TO_SOURCE/jquery.tl.upcoming.css" rel="stylesheet" type="text/css" /&gt;
&lt;script src="PATH_TO_SOURCE/jquery-1.5.1.js" type="text/javascript"&gt;&lt;/script&gt;
&lt;script src="PATH_TO_SOURCE/jquery.tl.upcomingevents.js" type="text/javascript"&gt;&lt;/script&gt;</code></pre>

<p>Place the following html on your page where you want to show the Upcoming Events Widget.</p>

<pre><code class="brush: xml;">&lt;div id="#upcoming-events"&gt;&lt;/div&gt;</code></pre>

<p>Initialize the Upcoming Events Widget. The code below can be placed anywhere on your page. There are three 
	options to set when you initialize the widget:</p>
	
<ul>
	<li><strong>orgSlug</strong> should be set to your organization's subdomain slug. This option is required.</li>
	<li><strong>pageSize</strong> determines how many events and performances to show at a time. This is optional.
		The default value is 5.</li>
	<li><strong>apiKey</strong> should be set to your personal API key obtained from <a href="http://www.ticketleap.com">http://www.ticketleap.com</a> under "My Account"</li>
</ul>

<pre><code class="brush: js;">&lt;script type="text/javascript"&gt;
	$(function(){

		$('#upcoming-events').upcomingEvents({
			orgSlug: 'awesomepuppies',
			pageSize: 5
			apiKey: 'PUT_API_KEY_HERE'
		 });

	});
&lt;/script&gt;</code></pre>

<h2>Customizing</h2>

<p>Customizing the Upcoming Events Widget requires a little web development know how. All of the CSS styles for 
	the widget are defined in <strong>jquery.tl.upcoming.css</strong>.</p>

<h2>Support and Development</h2>

<p>Depending on your site, there may be CSS and JavaScript conflicts with the Upcoming Events Widget. Though we 
	can't help implement the widget on your site, if you find a bug with the <a href="http://dev.ticketleap.com/">Public API</a> or with 
	the widget itself, please submit a <a href="https://ticketleap.zendesk.com/anonymous_requests/new">support 
	request</a>.</p>
	
<p>Feel free to share your enhancements or fixes to the widget.
	<a href="http://github.com/TicketLeap/Upcoming-Events-Widget">Fork the repository on GitHub</a> and submit a 
	pull request.</p>


