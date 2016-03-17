$(function() {

    var App = (function(){

        return {
            init : function() {
                MenuCollapse.init();
                Popups.init();
                PopupForm.init();
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

                    $callers.on('click',function(e){
                        e.preventDefault();
                        var popup = $(this).attr('href'),
                            fader = '<div class="popup__fader"></div>';

                        $(popup).fadeIn(500,function(){
                            $(this).addClass('active');
                        });

                        $('body').addClass('noscroll').append(fader);
                    });
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
            return {
                init : function() {
                    $('[js-validate]').each(function(i,form){
                        $(form).validate({
                            submitHandler: function(form) {
                                // сюда процесс сабмита вставляем
                                // $(form).ajaxSubmit();
                                var data = $(form).serialize(),
                                    email = $(form).find('[name=email]').val();
                                $.ajax({
                                    url : $(form).attr('action'),
                                    method : $(form).attr('method'),
                                    data : data,
                                    success : function(data) {

                                        if ( data.error ) {
                                            $('.reminder').fadeOut(500, function(){
                                                $(this).parents('.popup__body').append(data.errorMessage)
                                            });

                                        } else {
                                            $('.reminder').fadeOut(500, function(){
                                                $('#done-email').text(email);
                                                $('.done').fadeIn(500)
                                            });
                                        }
                                    },
                                    error : function(data) {
                                        $('.reminder').fadeOut(500, function(){
                                            $(this).parents('.popup__body').append(data.errorMessage)
                                        } );
                                    },
                                    always: function(){

                                    }
                                });

                                return false;
                            }
                        });

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
