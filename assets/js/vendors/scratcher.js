//
// Patrik Hartwig, onn behalf of Flip Creative
// 23 June, 2012
//

var buildScratcher = function(element, image, scratchSize, showElemOnScratch, callbackonScratch) {

  //canvas = $(element);
  $(document).off('mousemove.scratcher touchmove.scratcher mousedown.scratcher mouseup.scratcher touchstart.scratcher touchend.scratcher touchmove.scratcher');

  var thisId = $(element).attr('id');
  var classes = $(element).attr('class');

  var canvas = $('<canvas id="'+thisId+'" class="'+classes+'"></canvas>');
  $(element).replaceWith(canvas);
  //document.ontouchstart = function(e){  e.preventDefault();  }
  $(showElemOnScratch).css('visibility', 'hidden').hide();
  var pW = canvas.parent().innerWidth();
  var pH = canvas.parent().height();
  console.log(pW, pH);
  var elemHash = element;
  var elemHash = elemHash.split("#").join("");

  console.log(elemHash, element, image);

  if($('head').find('#css'+elemHash).length == 0)
    $('head').append('<style id="css'+elemHash+'"> @font-face { font-family: "BasicScratch"; src: url("assets/fonts/BasicScratch.ttf"); } '+element+' { position: absolute; top: 0px; left: 50%; margin-left: -'+(pW/2)+'px; width: '+pW+'px; height: '+pH+'px; z-index: 99; }</style>');
  
  var temp = new Image().src = 'assets/fonts/BasicScratch.ttf';
  
  canvas.attr('height', pH).attr('width', pW);
  
  var ctx = canvas[0].getContext("2d");
  ctx.font = "Bold "+scratchSize+"px 'BasicScratch'";
  var base_image = new Image();

  if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
    base_image.src = image.replace('.svg', '.png');
  }else{
    base_image.src = image;
  }
  
  
  // ctx.clearRect(0, 0, pW, pH);
  // ctx.style.visibility = 'hidden'; // Force a change in DOM
  // ctx.offsetHeight; // Cause a repaint to take play
  // ctx.style.visibility = 'inherit'; // Make visible again

  base_image.onload = function() {
    // alert(pW, pH);
    ctx.drawImage(base_image, 0,0, pW, pH);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.save();
  }

  var scratchTrack = {
    count:0,
    mousedown: false,
    offset: canvas.offset()
  };

  $( window ).resize(function() {
    var pW = canvas.parent().innerWidth();
    var pH = canvas.parent().height();

    scratchTrack.offset = canvas.offset();
    $('#css'+elemHash).remove();
    $('head').append('<style id="css'+elemHash+'"> @font-face { font-family: "BasicScratch"; src: url("assets/fonts/BasicScratch.ttf"); } '+element+' { position: absolute; top: 0px; left: 50%; margin-left: -'+(pW/2)+'px; width: '+pW+'px; height: '+pH+'px; z-index: 99; }</style>');
  });

  canvas.attr('data-scratch-count', 0);

  ctx.fillText("I", -100, -100);

  var scratchHere = function(last) {
    if((last.left > 0)&&(last.left < pW)&&(last.top > 0)&&(last.top < pH)) {

      console.log(last, 'scratcher log');
      callbackonScratch();
      callbackonScratch = function(){};

      scratchTrack.count++;
      canvas.attr('data-scratch-count', scratchTrack.count);
      ctx.fillText("I", last.left, Math.round(last.top+(scratchSize/3)));

      $(showElemOnScratch).css('visibility', 'visible').show();
    }
    
  }

  scratchHere({top: -999, left: -999});

  var swipeHere = function(e) {
    //&&($(e.originalEvent.target).attr('id') == canvas.attr('id'))
    if((scratchTrack.mousedown)) {
        var last = {};
        last.left = (e.originalEvent.pageX>0 ? e.originalEvent.pageX: e.originalEvent.targetTouches[0].pageX) - canvas.offset().left;
        last.top = ((e.originalEvent.pageY-$('body').scrollTop())>0 ? e.originalEvent.pageY: e.originalEvent.targetTouches[0].pageY) - canvas.offset().top;
        if(scratchTrack.last) {
          var maxDir = M.distance(scratchTrack.last, last);
          var angle = M.angle(scratchTrack.last, last);
          var count = 0;
          while(count < maxDir) {
            count = count+(scratchSize/4);
            var curCord = M.makeCoord(angle, count, scratchTrack.last);
            scratchHere(curCord);
          }
        }
        scratchHere(last);
        scratchTrack.last = last;
      }
  }

  
  $(document).on({
    'mousemove.scratcher': function (e) {
      if(canvas.hasClass('no-event')) return true;
      e.preventDefault();
      swipeHere(e);
    },
    'touchmove.scratcher': function(e) {
      if(canvas.hasClass('no-event')) return true;
      e.preventDefault();
    }
  }, element);

  $(document).on({
    'mousedown.scratcher': function (e) {
      if(canvas.hasClass('no-event')) return true;
      scratchTrack.mousedown = true;
      scratchTrack.offset = canvas.offset();
      var last = {};
      last.left = (e.originalEvent.pageX>0 ? e.originalEvent.pageX: e.originalEvent.targetTouches[0].pageX) - scratchTrack.offset.left;
      last.top = (e.originalEvent.pageY>0 ? e.originalEvent.pageY: e.originalEvent.targetTouches[0].pageY) - scratchTrack.offset.top;
      scratchTrack.last = last;
    },
    'mouseup.scratcher': function () { if(canvas.hasClass('no-event')) return true; scratchTrack.mousedown = false; scratchTrack.last = false; },
    'touchstart.scratcher': function () { if(canvas.hasClass('no-event')) return true; scratchTrack.mousedown = true; },
    'touchend.scratcher': function () { if(canvas.hasClass('no-event')) return true; scratchTrack.mousedown = false; scratchTrack.last = false; },
    'touchmove.scratcher': function (e) {
      if(canvas.hasClass('no-event')) return true;
      swipeHere(e);
    }
  });
};

var M = {
  distance: function(a,b) {
      var dx = a.top - b.top;
      var dy = a.left - b.left;
      var dist = Math.sqrt(dx*dx + dy*dy);
      return dist;
    },
  angle: function(a,b) {

    dtop = b.top - a.top;
    dleft = b.left - a.left;
    theta = Math.atan2(dtop, dleft);
    return theta;
  },
  makeCoord: function(angle, distance, pos) {
    var b = {};
    b.left = pos.left + (Math.cos(angle) * distance);
    b.top = pos.top + (Math.sin(angle) * distance);
    return b;
  }
};
