tatts-christmas
===============

Tatts JS phone scratch panel game

Preview
https://go.fieldtestapp.com/n73pqs


flip.ui for mobile devices
==========================

Requirements : jquery 2.0+

Flip UI Helpers 
--------------

*basic page structure*

```html
<body>
	<div id="wrapper">
		<div class="innerSwap" id="firstBoard"></div> 
		<!-- first board to show .innerSwap is the board class -->
	</div>
	<div id="landscape"></div>
</body>
```

*Classes*

 - textScaler - scales text with screen size changes
 - abs - defines absolute posistioning
 - center - centers element on X axis

*Custom Attributes*

 - data-dims="[int(top),int(left),int(width),int(height),int(bottom),int(right)" build element at right % scale

 - data-board-swap="[#id]" swapping boards id of board element to swap to, including #

 - data-font="[int]" font size in px, this will append the textScaler class automatically

Flip UI events 
--------------

data-events="eventName"

usage ui.events.on('eventName', function(event, element) {});