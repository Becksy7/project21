$(function() {

    var App = (function(){

        return {
            init : function() {
                MenuCollapse.init();
                Popups.init();
                PopupForm.init();
                Player.init();
                BtnFilter.init();
            }
        }
    })()

    ,MenuCollapse = (function(){
        return {
            init : function() {
                $('#toggle-menu').on('click',function(){
                    $(this).toggleClass('cross');
                    $('#nav').toggleClass('open');
                });
            }
        }
    })()

    ,Popups = (function(){

        return {
            init : function() {

                var $callers = $('.popup__caller');
                if (!$callers.length) return;

                $callers.on('click',function(e){
                    e.preventDefault();
                    var popup = $(this).attr('href'),
                        fader = '<div class="popup__fader"></div>',
                        $caller = $(this);
                    if ($(popup).length){
                        $(popup).fadeIn(500,function(){
                            $(this).addClass('active');
                            if ($caller.attr('data-active')){ // for social authorise popup only
                                var item = $caller.attr('data-active');
                                $(popup).find('.active').removeClass('active');
                                $(popup).find(item).addClass('active');
                            }
                        });

                        $('body').addClass('noscroll').append(fader);
                    }
                });

                // Close popup
                $(document).on('click', "[popup-closer], .popup__fader", function(e){
                    e.preventDefault();

                    $('.popup.active').fadeOut(500,function(){
                        $(this).removeClass('active');
                        $('body').removeClass('noscroll');
                        if ($('.popup__fader').length){
                            $('.popup__fader').remove();
                        }
                    });
                });
            }
        }
    })()

    ,PopupForm = (function(){
        var PF = {};

        PF.email = '';
        PF.HTML = {
            err : '<div class="err"><div class="h1">Произошла ошибка</div></div>',
            btn : '<button class="btn visible" id="show-again">Попробовать еще раз</button>'
        }
        PF.errorMessage = 'Произошла ошибка. Пожалуйста, попробуйте еще раз.';

        PF.success = function(data){
            if ( data.error ) {
                var errorHTML = '<p>'+(data.errorMessage ? data.errorMessage : errorMsg) + '</p>';
                $('.reminder').fadeOut(500, function(){
                    $(this).parents('.popup__body')
                        .append( $(PF.HTML.err).append(errorHTML) )
                        .append( PF.HTML.btn );
                });
            } else {
                $('.reminder').fadeOut(500, function(){
                    $('#done-email').text(PF.email);
                    $('.done').fadeIn(500)
                });
            }
        };
        PF.error = function(data) {
            var errorHTML = '<p>'+(data.errorMessage ? data.errorMessage : errorMsg) + '</p>';
            $('.reminder').fadeOut(500, function(){
                $(this).parents('.popup__body')
                    .append( $(PF.HTML.err).append(errorHTML) )
                    .append( PF.HTML.btn );
            });
        }

        PF.init = function() {

            $('[js-validate]').each(function(i,form){
                $(form).validate({
                    submitHandler: function(form) {
                        PF.email = $(form).find('[name=email]').val();
                        var data = $(form).serialize();

                        $.ajax({
                            url     : $(form).attr('action'),
                            method  : $(form).attr('method'),
                            data    : data,
                            success : PF.success,
                            error   : PF.error
                        });

                        return false;
                    }
                });
            });

            $(document).on('click', '#show-again', function(e){
                e.preventDefault();

                $('.popup__body').find('.err, #show-again').fadeOut(500,function(){
                    $('.reminder').fadeIn(500);
                });
            });
        }

        return PF;
    })()

    ,Player = (function(){
        var PL = {};
        PL.fitContainerHeight = function(){
            var $mainContent = $('.layout-main');
            $mainContent.find('.container').css('height','auto');
            if ($mainContent.length){
                var ch = $mainContent.height(),
                    cnth = $mainContent.find('.container').outerHeight();
                if (ch > cnth){
                    $mainContent.find('.container').css('height',ch);
                } else {
                    $mainContent.find('.container').css('height','auto');
                }
            }
            if ($mainContent.hasClass('.page-about')){
                if ($('.about-img-wrap').css('display') == "block"){
                    var h = $('.about-img-wrap').css('height') + 70;
                    $(".player").css('height', h);
                } else {
                    $(".player").css('height', "100%");
                }
            }
        };
        PL.init = function() {

            $(window).on('resize load',PL.fitContainerHeight);

            if (!isMobile.any) {
                if (typeof $.fn.mb_YTPlayer != "undefined") {
                    $(".player").mb_YTPlayer({
                        onError: function(){
                            $('body').addClass('no-video');
                            if ($('.about-img-wrap').length) {
                                $('.about-img-wrap').removeClass('transparent');
                            }
                        }
                    });
                    $(".player").on("YTPEnd", function(e) {
                        $(this).YTPPlay();
                    });
                    $(".player").on("YTPReady", function(e) {
                        if ($('.about-img-wrap').length) {
                            $('.about-img-wrap').addClass('transparent');
                        }
                    });
                } else {
                    $('body').addClass('no-video');
                    if ($('.about-img-wrap').length) {
                        $('.about-img-wrap').removeClass('transparent');
                    }
                }
            } else { //mobile phone detect
                $('body').addClass('no-video');
                if ($('.about-img-wrap').length) {
                    $('.about-img-wrap').removeClass('transparent');
                }
            }
        }

        return PL;
    })()

    ,BtnFilter = (function(){
        return {
            init : function() {
                $btns = $('.btn-filter .btn:not(.inactive)');
                if (!$btns.length) return false;
                
                $btns.on('click',function(e){
                    e.preventDefault();
                    $btns.removeClass('active');
                    $(this).addClass('active');

                    var id = $(this).attr('id');

                    if (id == 'all'){
                        $('[data-episode]').fadeIn();

                    } else {
                        $('[data-episode]').fadeOut();
                        $('[data-episode="' + id + '"]').fadeIn(500);
                    }
                    $('[data-id]').fadeOut();
                    $('[data-id="' + id + '"]').fadeIn(500);
                });
            }
        }
    })()

    /**
     * Dummy Module Example
     */
    ,DummyModule = (function(){
        return {
            init : function() {
                // do something
            }
        }
    })()

    ;App.init();

});
