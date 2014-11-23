'use strict';

(function () {
    var f = {x: 0, y: 0},
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
        plays_remain;

    if (localStorage.getItem('_playerObject_') !== null) {
        playerObject = JSON.parse(localStorage.getItem('_playerObject_'));
    }

    playerObject.sys = '';
    playerObject.password = '';

    ui.events.on('uiloaded', function () {
        var $boardImage;

        IntroAnimation();

        //$.get('termsNSW.html', function (d) {
        //    $('#termsNSW').html(d);
        //});
        //$.get('termsQLD.html', function (d) {
        //    $('#termsQLD').html(d);
        //});

        $boardImage = $('#boardImage img.playImage');

        $('.gameClick').on('mouseup', function () {
            console.log('clicked panel');

            if ($(this).attr('data-revealed') != 'false') {
                console.log('blocked');
                return true;
            }

            var zoomto = $(this).attr('data-zoom').split(',');
            var game = $(this).attr('data-game').split(',');

            f = {
                x: parseFloat(zoomto[0]),
                y: parseFloat(zoomto[1])
            };
            console.log(f);
            $('.gameClick').addClass('hide');

            // console.log('start zoom animation');
            ui.blockPointer(200);

            $boardImage.velocity({
                scale: [7.5, 1],
                translateZ: [1, 1],
                translateX: [zoomto[0] + '%', '0%'],
                translateY: [zoomto[1] + '%', '0%']
            }, {
                duration: 700, mobileHA: false, complete: function () {
                    $('#scratcher1').removeClass('no-event');
                    $('#boardImage').addClass('zoomed');
                }
            });

            // console.log('Build scratch Panel');
            buildScratcher('#scratcher1', 'assets/images/panels/Panel_' + game + '.svg', '200', '#scratchRevealer',
                function () {
                    $('#scratchRevealer').css({'background-image': 'none'});
                    $.post(config.api.scratch, {
                        panel: game,
                        gametype: gameType,
                        playerObject: playerObject,
                        screenid: ui.currentBoard
                    }, function (data) {
                        if (data.message !== null) alert(data.message);
                        plays_remain = data.plays_remain;
                        $('.plays_remain').text(plays_remain);
                        $('#scratchDone').removeAttr('data-board-swap').attr('data-event', 'unzoomBoard');
                        if (data.game_state === true) {
                            $('#scratchDone').attr('data-board-swap', '#winBoard');
                        }
                        if ((data.game_state === false) && (parseInt(plays_remain) === 0)) {
                            $('#scratchDone').attr('data-board-swap', '#lossBoard');
                        }
                        if ((data.game_state === false) && (parseInt(plays_remain) !== 0)) {
                            $('#tryAgain').find('[data-event="enterGame"]').attr('data-playfor', gameType);
                            $('#scratchDone').attr('data-board-swap', '#tryAgain');
                        }

                        $('#scratchRevealer').css({'background-image': 'url(' + data.reveal + ')'});
                        $('.gameClick[data-game="' + game + '"]')
                            .css({'background-image': 'url(' + data.reveal + ')'})
                            .attr('data-revealed', 'true');
                    }, 'json');
                }
            );
        });

        $('input,select').on('change', function () {
            var p = $(this).attr('name'),
                v = $(this).val();

            playerObject[p] = v;

            try {
                localStorage.setItem('_playerObject_', JSON.stringify(playerObject));
            } catch (error) {
            }

            checkValid();
        });

        checkValid();

    });


// set fields from player playerObject


// event binding for game panel

    ui.events.on('enterGame', function (e, ret) {
        $('#scratchDone').removeAttr('data-board-swap');

        console.log('entering game');

        ui.showLoad(true);
        setTimeout(function () {
            buildScratcher('#scratcher1', 'assets/images/panels/Panel_1.png', '200', '#scratchRevealer', function () {
            });
        }, 400);

        gameType = $(ret.element).attr('data-playfor');

        $.post(config.api.gameboard, {
            playerObject: playerObject,
            gametype: gameType,
            screenid: ui.currentBoard
        }, function (gamedata) {
            if (gamedata.message !== null) {
                alert(gamedata.message);
                return false;
            }
            ui.swapBoard('#game-board');
            var panels = gamedata.panels;
            $('#gametitle').text(gamedata.gametitle);
            for (var n in panels) {
                $('.gameClick[data-game="' + panels[n].panel_number + '"]')
                    .css({'background-image': 'url(' + panels[n].image + ')'})
                    .attr('data-revealed', panels[n].isRevealed);
            }
        }, 'json').always(function (e, s, d) {
            console.log(d);
            ui.showLoad(false);
        });
    });

    ui.events.on('tattsJoin', function () {
        $.post(config.api.register, {playerObject: playerObject, screenid: ui.currentBoard}, function (join) {
            if (join.registered == true) {
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
            if (claim.message !== null) alert(claim.message);
            if (claim.claim == true) {
                alert('You will now receive an email with instructions on how to complete your prize claim.');
                ui.swapBoard('#firstBoard');
            }
        }, 'json');
    });

    ui.events.on('memberLogin', function (e, elem) {
        $.post(config.api.member_auth, {playerObject: playerObject, screenid: ui.currentBoard}, function (auth) {
            console.log(auth);
            if (auth.auth == true) {
                ui.swapBoard('#member-play');
            } else {
                alert('Member not found');
            }
        }, 'json');
    });

    ui.events.on('unzoomBoard', function () {
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

    ui.events.on('termsNSW', function (e, elem) {
        $('#termsNSW').hide();
        $('#termsQLD').hide();
        $('#termsNSW').show(); //here

        $('.terms-swap').removeClass('gold-text');
        $(elem.element).addClass('gold-text');
    });

    ui.events.on('termsQLD', function (e, elem) {
        $('#termsNSW').hide();
        $('#termsQLD').hide();
        $('#termsQLD').show(); //here

        $('.terms-swap').removeClass('gold-text');
        $(elem.element).addClass('gold-text');
    });


    function checkValid() {

        for (var p in playerObject) {
            $('[name="' + p + '"]').val(playerObject[p]);
        }

        $('[data-valid]').each(function () {
            var check = $(this).attr('data-valid').split(',');
            var ret = true;
            for (var v in check) {
                if (check[v] == 'email') {
                    if (playerObject.email.indexOf('@') < 0)
                        ret = false;
                }
                if (check[v] == 'fname') {
                    if (playerObject.fname.length < 1)
                        ret = false;
                }
                if (check[v] == 'password') {
                    if (playerObject.password.length < 1)
                        ret = false;
                }
                if (check[v] == 'lname') {
                    if (playerObject.lname.length < 1)
                        ret = false;
                }
                if (check[v] == 'mobile') {
                    if (!playerObject.mobile.match(/^\d{10}$/))
                        ret = false;
                }
                if (check[v] == 'postcode') {
                    if (parseInt(playerObject.postcode).toString().length < 3)
                        ret = false;
                }
                if (check[v] == 'sys') {
                    if (playerObject.sys.length != 10)
                        ret = false;
                }
            }
            if (!ret) {
                $(this).addClass('disabled');
            } else {
                $(this).removeClass('disabled');
            }
        });
    }

    function IntroAnimation() {
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
                if ($('.slide-text:visible').length == 0) {
                    $('.slide-text').eq(0).fadeIn();
                } else {
                    var nextSlide = options.nextSlide;
                    $('.slide-text:visible').stop().fadeOut(function () {
                        $('.slide-text').eq(nextSlide).fadeIn();
                    });
                }
                if (options.nextSlide == 4) {
                    $('.how-to-play-box .hand').css({
                        left: '-5%',
                        bottom: '-19%',
                        opacity: 0
                    });
                    $('.how-to-play-box .left, .how-to-play-box .right').css({opacity: 1});
                }
            },
            after: function (currSlideElement, nextSlideElement, options) {
                if (options.currSlide == 4) {
                    //hand movement
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({opacity: 1, left: '+=15%', bottom: '+=12%'}, 400);
                    }, 0);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '+=15%', bottom: '+=25%'}, 400);
                    }, 400);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '-=4%', bottom: '-=25%'}, 400);
                    }, 800);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '+=15%', bottom: '+=25%'}, 400);
                    }, 1200);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '-=4%', bottom: '-=25%'}, 400);
                    }, 1600);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '+=21%'}, 600);
                    }, 2000);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '+=15%', bottom: '+=25%'}, 400);
                    }, 2600);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '-=4%', bottom: '-=25%'}, 400);
                    }, 3000);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '+=15%', bottom: '+=25%'}, 400);
                    }, 3400);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({left: '-=4%', bottom: '-=25%'}, 400);
                    }, 3800);
                    setTimeout(function () {
                        $('.how-to-play-box .hand').animate({opacity: 0, left: '+=13%', bottom: '-=12%'}, 400);
                    }, 4400);

                    //scratch off boxes
                    setTimeout(function () {
                        $('.how-to-play-box .left1').animate({opacity: 0}, 400);
                    }, 500);
                    setTimeout(function () {
                        $('.how-to-play-box .left2').animate({opacity: 0}, 400);
                    }, 1000);
                    setTimeout(function () {
                        $('.how-to-play-box .left3').animate({opacity: 0}, 400);
                    }, 1600);
                    setTimeout(function () {
                        $('.how-to-play-box .right1').animate({opacity: 0}, 400);
                    }, 2700);
                    setTimeout(function () {
                        $('.how-to-play-box .right2').animate({opacity: 0}, 400);
                    }, 3200);
                    setTimeout(function () {
                        $('.how-to-play-box .right3').animate({opacity: 0}, 400);
                    }, 3800);
                }
            }
        });
    }
})();