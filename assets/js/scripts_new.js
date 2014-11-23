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
        playsRemain;

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
            game,
            $boardImage;

        console.log('clicked panel');

        if ($(this).attr('data-revealed') != 'false') {
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
            function () {
                var $scratchDone = $('#scratchDone');

                $('#scratchRevealer').css({'background-image': 'none'});
                $.post(config.api.scratch, {
                    panel: game,
                    gametype: gameType,
                    playerObject: playerObject,
                    screenid: ui.currentBoard
                }, function (data) {
                    if (data.message !== null) {
                        alert(data.message);
                    }

                    playsRemain = data.plays_remain;
                    $('.plays_remain').text(plays_remain);
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
                }, 'json');
            }
        );
    }

    /**
     * Handler of application load
     */
    ui.events.on('uiloaded', function () {
        console.log('uiloaded');
        //IntroAnimation();

        $.get('termsNSW.html', function (d) {
            $('#termsNSW').html(d);
        });
        $.get('termsQLD.html', function (d) {
            $('#termsQLD').html(d);
        });

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

    ui.events.on('tattsJoin', function (event) {
        debugger;
    });

    ui.events.on('claimWin', function (event) {
        debugger;
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
        debugger;
    });

    ui.events.on('termsNSW', function (event) {
        debugger;
    });

    ui.events.on('termsQLD', function (event) {
        debugger;

    });
})();