'use strict';

(function () {
    var mousePosition = {x: 0, y: 0},
        playerObject = {
            title: 'Mr.',
            fname: '',
            lname: '',
            email: '',
            mobile: '',
            age: 0,
            postcode: '',
            sys: '',
            dob_day: '01',
            dob_month: '01',
            dob_year: 1981,
            password: ''
        },
        gameType = null,
        playsRemain,
        $boardImage;

    /**
     * Function validates playerObject (data from registration form)
     *
     * @function
     * @name checkValid
     * @returns {undefined}
     */
    function checkValid() {
        var player;

        for (player in playerObject) {
            if (playerObject.hasOwnProperty(player)) {
                $('[name="' + player + '"]').val(playerObject[player]);
            }
        }

        $('[data-valid]').each(function () {
            var $this = $(this),
                check = $this.attr('data-valid').split(','),
                ret = true,
                fieldName;

            for (fieldName in check) {
                if (check.hasOwnProperty(fieldName)) {
                    if (check[fieldName] === 'email') {
                        if (playerObject.email.indexOf('@') < 0)
                            ret = false;
                    }
                    if (check[fieldName] === 'fname') {
                        if (playerObject.fname.length < 1)
                            ret = false;
                    }
                    if (check[fieldName] === 'password') {
                        if (playerObject.password.length < 1)
                            ret = false;
                    }
                    if (check[fieldName] === 'lname') {
                        if (playerObject.lname.length < 1)
                            ret = false;
                    }
                    if (check[fieldName] === 'mobile') {
                        if (!playerObject.mobile.match(/^\d{10}$/))
                            ret = false;
                    }
                    if (check[fieldName] === 'postcode') {
                        if (parseInt(playerObject.postcode).toString().length < 3)
                            ret = false;
                    }
                    if (check[fieldName] === 'sys') {
                        if (playerObject.sys.length != 10)
                            ret = false;
                    }
                }
            }
            if (!ret) {
                $this.addClass('disabled');
            } else {
                $this.removeClass('disabled');
            }
        });
    }

    /**
     * Function handles clicks on game area
     *
     * @function
     * @name gameClickHandler
     * @returns {boolean}
     */
    function gameClickHandler() {
        var zoomTo,
            game;

        console.log('clicked panel');

        if ($(this).attr('data-revealed') !== 'false') {
            console.log('blocked');
            return true;
        }

        $boardImage = $('#boardImage img.playImage');
        zoomTo = $(this).attr('data-zoom').split(',');
        game = $(this).attr('data-game').split(',');
        mousePosition = {
            x: parseFloat(zoomTo[0]),
            y: parseFloat(zoomTo[1])
        };
        console.log(mousePosition);
        $('.gameClick').addClass('hide');

        // console.log('start zoom animation');
        ui.blockPointer(200);

        $boardImage.velocity({
            scale: [7.5, 1],
            translateZ: [1, 1],
            translateX: [zoomTo[0] + '%', '0%'],
            translateY: [zoomTo[1] + '%', '0%']
        }, {
            duration: 700, mobileHA: false, complete: function () {
                $('#scratcher1').removeClass('no-event');
                $('#boardImage').addClass('zoomed');
            }
        });

        buildScratcher('#scratcher1', 'assets/images/panels/Panel_' + game + '.svg', '200', '#scratchRevealer',
            buildScratcherHandle
        );
    }

    /**
     * Handler of user scratch event
     *
     * @function
     * @name buildScratcherHandle
     * @returns {undefined}
     */
    function buildScratcherHandle() {
        $('#scratchRevealer').css({'background-image': 'none'});
        $.post(config.api.scratch, {
            panel: game,
            gametype: gameType,
            playerObject: playerObject,
            screenid: ui.currentBoard
        }, scratchRequestHandler, 'json');
    }

    /**
     * Function sends request to the server after user has scratched game panel
     *
     * @function
     * @name scratchRequestHandler
     * @param {Object} data
     */
    function scratchRequestHandler(data) {
        var $scratchDone = $('#scratchDone');

        if (data.message !== null) {
            alert(data.message);
        }

        playsRemain = data.plays_remain;
        $('.plays_remain').text(playsRemain);
        $scratchDone.removeAttr('data-board-swap').attr('data-event', 'unzoomBoard');

        if (data.game_state === true) {
            $scratchDone.attr('data-board-swap', '#winBoard');
        }

        if ((data.game_state === false) && (parseInt(playsRemain) === 0)) {
            $scratchDone.attr('data-board-swap', '#lossBoard');
        }

        if ((data.game_state === false) && (parseInt(playsRemain) !== 0)) {
            $('#tryAgain').find('[data-event="enterGame"]').attr('data-playfor', gameType);
            $scratchDone.attr('data-board-swap', '#tryAgain');
        }

        $('#scratchRevealer').css({'background-image': 'url(' + data.reveal + ')'});
        $('.gameClick[data-game="' + game + '"]')
            .css({'background-image': 'url(' + data.reveal + ')'})
            .attr('data-revealed', 'true');
    }

    /**
     * Handler of application load
     */
    ui.events.on('uiloaded', function () {
        console.log('uiloaded');
        IntroAnimation();

        $.get('termsNSW.html', function (d) {
            $('#termsNSW').html(d);
        });
        $.get('termsQLD.html', function (d) {
            $('#termsQLD').html(d);
        });

        if (localStorage.getItem('_playerObject_') !== null) {
            playerObject = JSON.parse(localStorage.getItem('_playerObject_'));
        }

        playerObject.sys = '';
        playerObject.password = '';

        $('.gameClick').on('mouseup', gameClickHandler);

        $('input,select').on('change', function () {
            var $this = $(this),
                fieldName = $this.attr('name');

            playerObject[fieldName] = $this.val();

            try {
                localStorage.setItem('_playerObject_', JSON.stringify(playerObject));
            } catch (error) {
            }

            checkValid();
        });

        checkValid();
    });

    /**
     * Handler of click event on button 'Play for $250'
     */
    ui.events.on('enterGame', function (event, ret) {
        $('#scratchDone').removeAttr('data-board-swap');

        ui.showLoad(true);
        buildScratcher('#scratcher1', '/assets/images/panels/Panel_1.png', '200', '#scratchRevealer');
        gameType = $(ret.element).attr('data-playfor');

        $.post(config.api.gameboard, {
            playerObject: playerObject,
            gametype: gameType,
            screenid: ui.currentBoard
        }, function (gamedata) {
            var panels,
                panelName;

            if (gamedata.message !== null) {
                alert(gamedata.message);
                return false;
            }

            ui.swapBoard('#game-board');
            panels = gamedata.panels;
            $('#gametitle').text(gamedata.gametitle);

            for (panelName in panels) {
                if (panels.hasOwnProperty(panelName)) {
                    $('.gameClick[data-game="' + panels[panelName].panel_number + '"]')
                        .css({'background-image': 'url(' + panels[panelName].image + ')'})
                        .attr('data-revealed', panels[panelName].isRevealed);
                }
            }

        }, 'json').always(function (e, s, d) {
            console.log(d);
            ui.showLoad(false);
        });
    });

    ui.events.on('tattsJoin', function () {
        $.post(config.api.register, {playerObject: playerObject, screenid: ui.currentBoard}, function (join) {
            if (join.registered === true) {
                ui.swapBoard('#member-play');
            } else {
                alert(join.message);
            }
        }, 'json');
    });

    ui.events.on('claimWin', function () {
        $.post(config.api.claim, {
            playerObject: playerObject,
            screenid: ui.currentBoard,
            gametype: gameType
        }, function (claim) {
            if (claim.message !== null) {
                alert(claim.message);
            }

            if (claim.claim == true) {
                alert('You will now receive an email with instructions on how to complete your prize claim.');
                ui.swapBoard('#firstBoard');
            }
        }, 'json');
    });

    /**
     * Handler of user login
     */
    ui.events.on('memberLogin', function () {
        ui.swapBoard('#member-play');
        $.post(config.api.member_auth, {
            playerObject: playerObject,
            screenid: ui.currentBoard
        }, function (auth) {
            if (auth.auth === true) {
                ui.swapBoard('#member-play');
            } else {
                alert('Member not found');
            }
        }, 'json');
    });

    ui.events.on('unzoomBoard', function (event) {
        $('#boardImage').removeClass('zoomed');
        $('#scratcher1').addClass('no-event');

        $boardImage.velocity({
            translateZ: 1,
            translateX: '0.00001%',
            translateY: '0.00001%',
            scale: [1, 7.5]
        }, {
            duration: 700, complete: function () {
                $('.gameClick').removeClass('hide');
            }
        });
    });

    ui.events.on('termsNSW', function (event, element) {
        var $termsNSW = $('#termsNSW');

        $termsNSW.hide();
        $('#termsQLD').hide();
        $termsNSW.show();

        $('.terms-swap').removeClass('gold-text');
        $(element.element).addClass('gold-text');
    });

    ui.events.on('termsQLD', function (event, element) {
        var $termsQLD = $('#termsQLD');
        $('#termsNSW').hide();
        $termsQLD.hide();
        $termsQLD.show();

        $('.terms-swap').removeClass('gold-text');
        $(element.element).addClass('gold-text');
    });

    /**
     * Function starts intro
     *
     * @function
     * @name IntroAnimation
     * @returns {undefined}
     */
    function IntroAnimation() {
        var $howToPlayBox = $('.how-to-play-box .hand');

        //init intro animation
        $('#firstBoard .how-to-play-box .rotator').cycle({
            fx: 'scrollHorz',
            timeoutFn: function (currSlideElement, nextSlideElement, options) {
                if (options.currSlide == 4) {
                    return 5500;
                } else {
                    return 3000;
                }
            },
            before: function (currSlideElement, nextSlideElement, options) {
                if ($('.slide-text:visible').length === 0) {
                    $('.slide-text').eq(0).fadeIn();
                } else {
                    var nextSlide = options.nextSlide;
                    $('.slide-text:visible').stop().fadeOut(function () {
                        $('.slide-text').eq(nextSlide).fadeIn();
                    });
                }
                if (options.nextSlide === 4) {
                    $('.how-to-play-box .hand').css({
                        left: '-5%',
                        bottom: '-19%',
                        opacity: 0
                    });
                    $('.how-to-play-box .left, .how-to-play-box .right').css({opacity: 1});
                }
            },
            after: function (currSlideElement, nextSlideElement, options) {
                var $playBoxLeft1 = $('.how-to-play-box .left1'),
                    $playBoxLeft2 = $('.how-to-play-box .left2'),
                    $playBoxLeft3 = $('.how-to-play-box .left3');

                if (options.currSlide == 4) {
                    //hand movement
                    setTimeout(function () {
                        $howToPlayBox.animate({opacity: 1, left: '+=15%', bottom: '+=12%'}, 400);
                    }, 0);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '+=15%', bottom: '+=25%'}, 400);
                    }, 400);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '-=4%', bottom: '-=25%'}, 400);
                    }, 800);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '+=15%', bottom: '+=25%'}, 400);
                    }, 1200);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '-=4%', bottom: '-=25%'}, 400);
                    }, 1600);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '+=21%'}, 600);
                    }, 2000);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '+=15%', bottom: '+=25%'}, 400);
                    }, 2600);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '-=4%', bottom: '-=25%'}, 400);
                    }, 3000);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '+=15%', bottom: '+=25%'}, 400);
                    }, 3400);
                    setTimeout(function () {
                        $howToPlayBox.animate({left: '-=4%', bottom: '-=25%'}, 400);
                    }, 3800);
                    setTimeout(function () {
                        $howToPlayBox.animate({opacity: 0, left: '+=13%', bottom: '-=12%'}, 400);
                    }, 4400);

                    //scratch off boxes
                    setTimeout(function () {
                        $playBoxLeft1.animate({opacity: 0}, 400);
                    }, 500);
                    setTimeout(function () {
                        $playBoxLeft2.animate({opacity: 0}, 400);
                    }, 1000);
                    setTimeout(function () {
                        $playBoxLeft3.animate({opacity: 0}, 400);
                    }, 1600);
                    setTimeout(function () {
                        $playBoxLeft1.animate({opacity: 0}, 400);
                    }, 2700);
                    setTimeout(function () {
                        $playBoxLeft2.animate({opacity: 0}, 400);
                    }, 3200);
                    setTimeout(function () {
                        $playBoxLeft3.animate({opacity: 0}, 400);
                    }, 3800);
                }
            }
        });
    }
})();