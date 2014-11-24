'use strict';

(function (window, $) {
    var $body,
        $wrapper;

    window.ui = {
        //height,width
        events: $('<br id="flip-events">'),
        isTouchDevice: false,
        aspectRatio: [1400, 980],
        currentBoard: '#firstBoard',
        boardHistory: ['#firstBoard'],
        boot: function () {
            $(function () {
                ui.init();
                //ui.debug();
            });
        },
        init: function () {
            ui.isTouchDevice = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
            $body = $('body');
            $wrapper = $('#wrapper');

            window.onresize = function (event) {
                ui.resize();
            };
            ui.resize();

            setTimeout(function () {
                $('#firstBoard').addClass('show');
                ui.events.trigger('uiloaded');
            }, 200);

            if (ui.isTouchDevice) {
                var eventMechanic = 'touchstart.flipUi';
            } else {
                var eventMechanic = 'mousedown.flipUi';
            }


            var boardSwapAction = function () {
                var $innerSwap = $('.innerSwap');

                ui.swapBoard($(this).attr('data-board-swap'));
                $innerSwap.off(eventMechanic);
                $innerSwap.one(eventMechanic, '[data-board-swap]', boardSwapAction)
                    .one(eventMechanic, '[data-event]', eventTriggerAction);
            };

            var stopEventTrigs = false;
            var eventTriggerAction = function (e) {
                console.log('event trigger');
                if (stopEventTrigs == true) {
                    console.log('blocked');
                    return false;
                }
                var timeToEvent = 0;
                var elem = this;
                stopEventTrigs = true;
                if ($('input').is(':focus')) {
                    var timeToEvent = 100;
                    $('input').blur();
                }
                setTimeout(function () {
                    ui.events.trigger($(elem).attr('data-event'), {element: elem});
                    $('.innerSwap').off(eventMechanic);
                    $('.innerSwap').one(eventMechanic, '[data-board-swap]', boardSwapAction)
                        .one(eventMechanic, '[data-event]', eventTriggerAction);
                    setTimeout(function () {
                        stopEventTrigs = false;
                    }, 200);
                }, timeToEvent);

            };

            document.ontouchmove = function (e) {
                if (ui.currentBoard != '#termsBoard') e.preventDefault();
            };
            $('.innerSwap').one(eventMechanic, '[data-board-swap]', boardSwapAction)
                .one(eventMechanic, '[data-event]', eventTriggerAction);
        },
        resize: function () {
            if ($('input').is(':focus')) {
                $('body').css('overflow', 'scroll');
                document.activeElement.scrollIntoViewIfNeeded();
                $('input').one('blur', function () {
                    console.log('blue');
                    setTimeout(function () {
                        $('body').css('overflow', 'hidden');
                    }, 100);

                });
                return true;
            }
            console.log('resize');
            //detect landscape or portrait
            if ($body.height() < $body.width()) {
                console.log('landscape');
                $body.removeClass('portrait').addClass('landscape');
                if (ui.isTouchDevice) return false;
            }
            if ($body.height() > $body.width()) {
                console.log('portrait');
                $body.removeClass('landscape').addClass('portrait');

                console.log(ui.pxtoperChache.textScaler, ui.pxtoperChache.dims);
                if ((ui.pxtoperChache.textScaler == true) && (ui.pxtoperChache.dims == true)) {
                    return false;
                }
            }

            //detect touch device

            if (ui.isTouchDevice) {
                $body.removeClass('no-touch').addClass('touch');
            } else {
                $body.removeClass('touch').addClass('no-touch');
            }


            // adjustable aspect ratio
            if (true) {
                var mlt = 980 / $body.width();
                var aSheight = $body.height() * mlt;
                aSheight = Math.min(aSheight, 1500);
                aSheight = Math.max(aSheight, 1400);
                ui.aspectRatio = [aSheight, 980];
            }

            var h = $body.height();
            var w = h / (ui.aspectRatio[0] / ui.aspectRatio[1]);
            var tW = $body.width();
            if (w > tW) {
                w = parseInt(tW);
                h = parseInt(tW * (ui.aspectRatio[0] / ui.aspectRatio[1]));
            }
            ui.aspectRatio = [h, w];
            $wrapper.height(h);
            $wrapper.width(w);
            console.time('pxtoper');
            ui.pxtoper();
            console.timeEnd('pxtoper');

            console.time('scaleText');
            ui.scaleText(h);
            console.timeEnd('scaleText');

            console.log(ui.aspectRatio, 'aspectRatio');


        },
        pxtoperChache: {
            textScaler: false,
            dims: false
        },
        pxtoper: function () {
            console.log('pxtoper');
            if (!ui.pxtoperChache.textScaler) {

                ui.pxtoperChache.textScaler = true;
                console.log('textScaler class add', ui.pxtoperChache.textScaler);
                $body.find('[data-font]').each(function () {
                    // $(this).css('font-size', parseInt($(this).attr('data-font'))+'px').removeAttr('data-font').addClass('textScaler');
                    $(this).css('font-size', parseInt($(this).attr('data-font')) + 'px').addClass('textScaler');
                });
            }

            ui.pxtoperChache.elems = $body.find('[data-dims]');
            ui.pxtoperChache.elems.each(function () {

                if (!ui.pxtoperChache.dims) {
                    var tdims = $(this).attr('data-dims').split(',');
                    $(this).data('cdims', tdims);
                } else {
                    var tdims = $(this).data('cdims');
                }


                var dims = {};

                var p = {
                    h: $(this).parent().height(),
                    w: $(this).parent().width()
                };

                // if( $wrapper.width() < 980) {
                if (ui.aspectRatio[1] < 980) {
                    var cRatio = (980 / p.w) * p.h;

                    //console.log(p.w, p.h, 980, cRatio);
                    p.h = cRatio;

                    //console.log(p.w, $wrapper.width(), ui.aspectRatio[1], 'debug');
                    if (Math.abs(p.w - $wrapper.width() < 2)) {
                        //console.log(p.w, $wrapper.width(), ui.aspectRatio[1], 'debug');
                        p.w = 980;
                    }
                }

                // console.log(p, $(this).parent()[0]);
                for (var i in tdims) {
                    var take = 0;
                    if (i == 0 && tdims[i] != '')
                        dims.top = (parseInt(tdims[i]) / p.h) * 100 + '%';
                    if (i == 1 && tdims[i] != '')
                        dims.left = (parseInt(tdims[i]) / p.w) * 100 + '%';
                    if (i == 2 && tdims[i] != '')
                        dims.width = (parseInt(tdims[i]) / p.w) * 100 + '%';
                    if (i == 3 && tdims[i] != '')
                        dims.height = (parseInt(tdims[i]) / p.h) * 100 + '%';
                    if (i == 4 && tdims[i] != '') {
                        if ($(this).hasClass('absc')) {
                            dims.top = 100 - ((parseInt(tdims[i]) / p.h) * 100) + '%';
                        } else {
                            dims.bottom = ((parseInt(tdims[i]) / p.h) * 100) + '%';
                        }
                    }
                    if (i == 5 && tdims[i] != '') {
                        if ($(this).hasClass('absc')) {
                            dims.left = 100 - ((parseInt(tdims[i]) / p.w) * 100) + '%';
                        } else {
                            dims.right = ((parseInt(tdims[i]) / p.w) * 100) + '%';
                        }
                    }
                }
                $(this).css(dims);//.removeAttr('data-dims');

            });
            ui.pxtoperChache.dims = true;
        },
        scaleText: function (h) {
            if (ui.aspectRatio[1] < 980) {
                var cRatio = (980 / ui.aspectRatio[1]);
            }

            $('.textScaler').not('[data-textscaler-fs]').each(function () {
                $(this).attr('data-textscaler-fs', (parseFloat($(this).css('font-size')) / cRatio) / ui.aspectRatio[0]);
                $(this).attr('data-textscaler-lh', (parseFloat($(this).css('line-height')) / cRatio) / ui.aspectRatio[0]);
            });

            $('[data-textscaler-fs]').each(function () {
                var fS = parseFloat($(this).attr('data-textscaler-fs'));
                $(this).css('font-size', Math.floor(fS * h));
                var lH = $(this).attr('data-textscaler-lh');
                if (lH != 'NaN') {
                    $(this).css('line-height', Math.floor(parseFloat(lH) * h) + 'px');
                }
            });
        },
        swapBoard: function (elem) {
            console.log('swapping');
            if (elem == 'goBack') {
                ui.boardHistory.pop();
                elem = ui.boardHistory[ui.boardHistory.length - 1];
                console.log(elem);
            } else {
                ui.boardHistory.push(elem);
            }
            $('.innerSwap').removeClass('show');
            $(elem).css('pointer-events', 'none').addClass('show');

            ui.currentBoard = elem;
            setTimeout(function () {
                $(elem).css('pointer-events', 'all');
            }, 100);
        },
        debug: function () {
            $('#wrapper').on('click', function (e) {
                console.log('top/left', e.pageY, e.pageX);
                console.log('bottom/right', $('#wrapper').height() - e.pageY, $('#wrapper').width() - e.pageX);
            });
        },
        blockPointer: function (time) {
            $body.css('pointer-events', 'none').addClass('show');
            setTimeout(function () {
                $body.css('pointer-events', 'all');
            }, time);
        },
        showLoad: function (bool) {
            if (bool == true) {
                $wrapper.addClass('dim').css('opacity', 0.5);
                console.log('added dim');
            } else {
                $wrapper.removeClass('dim').css('opacity', 1);
                console.log('removed dim');
            }

        }
    };

    ui.boot();
})(window, jQuery);
