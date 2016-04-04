$(function() {

    var App = (function(){

        return {
            init : function() {
                MenuCollapse.init();
                Quiz.init();
                PopupForm.init();
                Player.init();
                BtnFilter.init();
                Popups.init();
                FlexFallback.init();
            }
        }
    })()

    ,Timer = function(){
        this.timer = null;
        this.amount = 20;
        this.started = false;
        this.cacheElements = function() {
            this.$ = {};
            this.$.instance = $(".question__time");
            this.$.label = $("#timer_label");
            this.$.value = $("#timer_val");
        };
        this.set = function(amount) {
            // на будущее данная функция работает 
            // с числами больше 20
            this.$.value.text(amount);

            var lastDigit = (amount % 10);
            var label = '';
            if (lastDigit <= 0) {
                label = 'секунд';
            } else if (lastDigit <= 1) {
                label = 'секунда';
            } else if ( lastDigit <= 4 ) {
                label = 'секунды';
            } else {
                label = 'секунд';
            }

            // исключение (11-14) секунд а не секунда/секунды
            if ( ( amount>=11 ) && (amount<=14) ) {
                label = 'секунд';
            }

            this.$.label.text(label);
        }

        this.start = function() {
            var self = this;
            this.cacheElements(); // one more time (template was redrawn)
            this.loadAmount();
            
            if (this.amount <= 0) {
                Quiz.timeout();
                this.stop();
                return;
            }
            
            this.timer = window.setInterval(function(){
                self.set(--self.amount);
                if (self.amount <= 0) {
                    Quiz.timeout();
                    self.stop();
                }
            }, 1000);
            this.started = true;
            this.paused = false;
        }
        
        this.loadAmount = function() {
            var now = Math.round((new Date().getTime()) / 1000);
                
            if (!Quiz.stmp) {
                Quiz.stmp = now;
                Quiz.saveState();
            }
            else {
                var stmpEnd = Math.max(Quiz.stmp + this.amount - now, 0);
                this.amount = Math.min(this.amount, stmpEnd);
                this.set(this.amount);
            }
        }

        this.resume = function( amount ){
            this.amount = amount ? amount : 20;
            this.start();
        }

        this.pause = function(){
            clearTimeout(this.timer);
            this.started = false;
            this.paused = true;
        }

        this.stop = function() {
            this.pause();
            this.paused = false;
            this.amount = 20;
        }

        this.init = function() {
            this.cacheElements();
            this.bindEvents();
        };
    }



    

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

    ,Quiz = (function(){
            
        var QP = {};

        QP.stmp = null;
        QP.currentQuestion = 0;
        QP.location = null;
        QP.quizId = null;
        QP.localStorageName = 'story_of_god_gamedata';
        QP.mode = null;
        QP.Timer = {};

        QP.cacheElements = function() {
            QP.$ = {};
            QP.$.popup = $("#question_popup");
            QP.$.popupStart = QP.$.popup.find('.question.question--start');
            QP.$.popupQuiz = QP.$.popup.find('.question.question--go');
            QP.$.popupImage = QP.$.popup.find('[data-question-image]');
            QP.$.popupShare = QP.$.popup.find('.question.question--share');
            QP.$.callers = $('.popup__caller[data-quiz-caller]');
            QP.$.questionTemplate = $("#question_popup_tmpl");
            QP.$.startTemplate = $("#start_popup_tmpl");
            QP.$.popupImageTemplate = $("#question_img_tmpl");
            QP.$.sharingTemplate = $('#share_popup_tmpl');
            QP.$.btnStart = $("#popup_btn_start");
            QP.$.timeoutMessage = $(".question__timeout-label");
            QP.$.message = $(".question__message");
            QP.$.beforeAnswer = $(".question__before-answer");
            QP.$.afterAnswer = $(".question__after-answer");
            QP.$.btnNext = $("#question_btn_next");
        };

        QP.resetState = function() {
            QP.stmp = null;
            QP.currentQuestion = 0;
            QP.mode = null;
            QP.quizId = null;
            QP.location = null;
        }
        
        QP.loadState = function() {
            var statesStr = localStorage[QP.localStorageName];
            if ( statesStr ) {
                states = $.parseJSON(statesStr);
                if (states && states[QP.quizId]) {
                    QP.currentQuestion = states[QP.quizId].currentQuestion;
                    QP.stmp = states[QP.quizId].stmp;
                }
            }
        }

        QP.saveState = function() {
            var statesStr = localStorage[QP.localStorageName],
                states = {};
            if (statesStr)
                states = $.parseJSON(statesStr);
            states[QP.quizId] = {
                currentQuestion: QP.currentQuestion,
                stmp: QP.stmp
            };
            localStorage[QP.localStorageName] = JSON.stringify(states);
        }
        
        QP.next = function(){
            QP.currentQuestion++;
            QP.showQuestion();
            QP.saveState();
        };

        QP.timeout = function() {
            QP.setMode('timeout');
            QP.location.questions[QP.currentQuestion].userAnswerStatus = 'timeout';

            $.ajax({
                url     : ApiUrl.userAnswer,
                method  : 'POST',
                data    : {
                    locationId: QP.location.locationId,
                    questionType: QP.location.questions[QP.currentQuestion].type,
                    userAnswerStatus: 'timeout'
                }
            });
            
        }

        QP.setMode = function(mode) {
            QP.mode = mode;
            switch(mode) {
                case 'start':
                    QP.$.popup
                        .addClass('popup-question--start')
                        .removeClass('popup-question--go')
                        .removeClass('popup-question--share');
                    QP.$.popup.find('.share-text').hide();
                    QP.$.popup.find('.question__timeout-label').addClass('invisible');
                    QP.$.popup.find('.popup__body').removeClass('beeline natgeo share');
                    QP.$.popup.find('.question__img.common').show();
                    break;
                case 'quiz':
                    
                    QP.$.popup.find('.share-text').hide();

                    $('.popup-question--start')
                        .removeClass('popup-question--start')
                        .addClass('popup-question--go');
                    // reset answered style
                    QP.$.popupQuiz
                        .removeClass('question--answered-wrong')
                        .removeClass('question--answered');
                        
                    QP.$.beforeAnswer.addClass('visible');
                    QP.$.afterAnswer.removeClass('visible');
                    
                    QP.$.popup.find('.question__timeout-label').addClass('invisible');
                    
                    break;
                case 'correct':
                    $('.popup-question--start')
                        .removeClass('popup-question--start')
                        .addClass('popup-question--go');
                    var $answerLabel = QP.$.popupQuiz.find('.question__opts input[name=opt]:checked').next();
                    $answerLabel.addClass('answer-ok');
                    
                    QP.$.popup.find('.share-text').hide();
                    
                    QP.$.popupQuiz
                        .removeClass('question--answered-wrong')
                        .addClass('question--answered');
                    
                    QP.$.beforeAnswer.removeClass('visible');
                    QP.$.afterAnswer.addClass('visible');
                    
                    QP.$.popup.find('.question__timeout-label').addClass('invisible');
                    QP.stmp = 0;
                    Quiz.saveState();
                    Quiz.syncQuestions();
                    break;
                case 'incorrect':
                    $('.popup-question--start')
                        .removeClass('popup-question--start')
                        .addClass('popup-question--go');
                    var $answerLabel = QP.$.popupQuiz.find('.question__opts input[name=opt]:checked').next();
                    $answerLabel.addClass('answer-wrong');
                    
                    QP.$.popup.find('.share-text').hide();

                    QP.$.popupQuiz.addClass('question--answered question--answered-wrong');
                    
                    QP.$.beforeAnswer.removeClass('visible');
                    QP.$.afterAnswer.addClass('visible');
                    
                    QP.$.popup.find('.question__timeout-label').addClass('invisible');
                    QP.stmp = 0;
                    Quiz.saveState();
                    Quiz.syncQuestions();
                    break;
                case 'timeout':
                    $('.popup-question--start')
                        .removeClass('popup-question--start')
                        .addClass('popup-question--go');
                        
                    QP.$.popupQuiz.addClass('question--answered');

                    QP.$.popup.find('.share-text').hide();
                    QP.$.timeoutMessage.addClass('visible');
                    QP.$.popupQuiz.find('.question__opts input[name=opt]').prop('disabled', true);

                    QP.$.beforeAnswer.removeClass('visible');
                    QP.$.afterAnswer.addClass('visible');
                    
                    QP.$.popup.find('.question__timeout-label').removeClass('invisible');
                    QP.stmp = 0;
                    Quiz.saveState();
                    Quiz.syncQuestions();
                    break;
                case 'final':
                    QP.$.popup
                        .removeClass('popup-question--go')
                        .removeClass('popup-question--start')
                        .addClass('popup-question--share')
                        .find('.popup__body')
                            .addClass('share');
                    QP.$.popup.find('.popup__body').removeClass('beeline natgeo');
                    QP.$.popup.find('.question__img.common').hide();
                    QP.$.popup.find('.share-text').show();
                    QP.stmp = 0;
                    Quiz.saveState();
                    break;
            }
            QP.actualizeQuestionStyleByType();
            QP.actualizeActiveQuestionHighlight();
        }
        
        QP.checkAnswer = function() {
            var dd = $.Deferred();
            var answer = QP.$.popupQuiz.find('.question__opts input[name=opt]:checked').val();
            $.ajax({
                url     : ApiUrl.userAnswer,
                method  : 'POST',
                data    : {
                    locationId: QP.location.locationId,
                    questionType: QP.location.questions[QP.currentQuestion].type,
                    answer: answer
                },
                dataType : 'json',
                success  : function(data){
                    if (data.success) {
                        dd.resolve(data.userAnswerStatus);                     
                    }
                    else {
                        dd.reject(data.errorState);
                    }
                },
                error : function(data){
                    dd.reject(data.errorState);
                }
            });
            return dd.promise();
        }
        
        QP.answerHandle = function(status) {
            switch(status){
                case 'correct':
                    QP.answerWasCorrect();
                    break;
                case 'incorrect':
                    QP.answerWasInCorrect();
                    break;
            }
        }

        QP.sayError = function(error) {
            var errorPlaceholder = QP.$.popupQuiz.find('.question__add');
            var defaultMsg = 'Викторина не может быть продолжена. Пожалуйста, обновите страницу';
            var error = error ? (error + defaultMsg) : ('Произошла ошибка. '+ defaultMsg);
            var $error = $('#plxerr').length ? $('#plxerr').text(error) : '<div id="plxerr">'+ error +'</div>';
            errorPlaceholder.after($error);
        }

        QP.answerWasCorrect = function() {
            QP.setMode('correct');
            QP.$.afterAnswer.find('.question__var').text('+' + QP.location.questions[QP.currentQuestion].points + ' ' + QP.pointUnitsHelper(QP.location.questions[QP.currentQuestion].points));
            QP.location.questions[QP.currentQuestion].userAnswerStatus = 'correct';
            QP.location.questions[QP.currentQuestion].userAnswerVariant = QP.$.popupQuiz.find('.question__opts input[name=opt]:checked').val();
        }
        
        QP.answerWasInCorrect = function() {
            QP.$.afterAnswer.find('.question__var').text('0 баллов');
            QP.setMode('incorrect');
            QP.location.questions[QP.currentQuestion].userAnswerStatus = 'incorrect';
            QP.location.questions[QP.currentQuestion].userAnswerVariant = QP.$.popupQuiz.find('.question__opts input[name=opt]:checked').val();
        }

        QP.showQuestion = function() {
            QP.redrawQuestionsTemplate();
            QP.setMode('quiz');
            if (QP.currentQuestion == 2) {
                $('#question_btn_next').text($('#question_btn_next').data('end'));
            }
            else {
                $('#question_btn_next').text($('#question_btn_next').data('next'));                        
            }
            QP.Timer[QP.quizId].start();
        };
        
        QP.actualizeQuestionStyleByType = function() {
            // Change question style by its type
            QP.$.popupQuiz.parent().removeClass('beeline natgeo');
            var cssClass;
            switch(QP.location.questions[QP.currentQuestion].type) {
                case 'fromBeeline':
                    cssClass = 'beeline';
                    break;
                case 'fromNatgeo':
                    cssClass = 'natgeo';
                    break;
            }
            QP.$.popupQuiz.parent().addClass(cssClass);
        }
        
        QP.actualizeActiveQuestionHighlight = function() {
            QP.$.popupQuiz.find('.question__state').show().find('li').eq(QP.currentQuestion).addClass('active');
        }
        
        QP.showState = function(question) {
            QP.currentQuestion = question;
            
            var question = QP.location.questions[QP.currentQuestion];
            if (question.userAnswerVariant) {
                QP.$.popupQuiz.find('.question__opts  input[name=opt]').eq(parseInt(question.userAnswerVariant) - 1)
                    .prop('checked', 'checked')
                    .prop('disabled', true);
                QP.setMode('quiz');
            }
            switch (question.userAnswerStatus) {
                case 'correct':
                    QP.answerWasCorrect();
                    break;
                case 'incorrect':
                    QP.answerWasInCorrect();
                    break;
                case 'timeout':
                    QP.setMode('timeout');
                    break;
            }
        };

        QP.pointUnitsHelper = function(points) {
            // тут больше 10 баллов наврядли будет за вопрос
            // поэтому делаем очень просто
            if (points == 0 )     return 'баллов';
            else if (points == 1) return 'балл';
            else if (points <= 4) return 'балла';
            else                  return 'баллов';
        }

        QP.getQuestionAuthor = function(type) {
            return type == 'fromMorgan' ? 'Морган Фриман' : '';
        };

        QP.showFinalScreen = function() {
            QP.setMode('final');

            Ya.share2(document.getElementById('my-share'), {
                content: QP.location.sharing
            });

            QP.$.popup.find('.share-text').show();
        };
        
        QP.getTemplateData = function() {
            var currentQuestionNumber = QP.currentQuestion,
                currentQuestion = QP.location.questions[currentQuestionNumber];
            return {
                pic:            QP.location.episodePic,
                video:          QP.location.episodeVideo,
                authorName:     QP.getQuestionAuthor(currentQuestion.type),
                questionType:   currentQuestion.type,
                points:         currentQuestion.points,
                pointUnits:     QP.pointUnitsHelper(currentQuestion.points),
                question:       currentQuestion.title,
                answers:        currentQuestion.answers,
                onCompleteText: QP.location.onCompleteText,
                sharing:        QP.location.sharing,
            };
        }
        
        QP.redrawAllTemplates = function() {
            var tmpl = QP.$.popupImageTemplate.html();
            QP.$.popupImage.html(_.template(tmpl)(QP.getTemplateData()));
            
            var tmpl = QP.$.startTemplate.html();
            QP.$.popupStart.html(_.template(tmpl)(QP.getTemplateData()));

            var tmpl = QP.$.sharingTemplate.html();
            QP.$.popupShare.html(_.template(tmpl)(QP.getTemplateData()));
            
            QP.redrawQuestionsTemplate();
            QP.cacheElements();
        }
        
        QP.redrawQuestionsTemplate = function() {
            var tmpl = QP.$.questionTemplate.html();
            QP.$.popupQuiz.html(_.template(tmpl)(QP.getTemplateData()));
            QP.cacheElements();
        }
        
        QP.syncQuestions = function () {
            QUESTIONS[QP.quizId] = QP.location;
        }
        
        QP.openPopup = function($caller) {

            QP.resetState();
            
            QP.quizId = $caller.data('location');
            QP.location = QUESTIONS[QP.quizId];
            QP.Timer[QP.quizId] = new Timer();
            
            QP.loadState();
            
            QP.redrawAllTemplates();

            QP.setMode('start');

            QP.checkStates();
            
            QP.$.popup.fadeIn(250, function() {
                $(this).addClass('active');
                if ($caller.attr('data-active')) { // for social authorise popup only
                    var item = $caller.attr('data-active');
                    QP.$.popup.find('.active').removeClass('active');
                    QP.$.popup.find(item).addClass('active');
                }
            });
            var fader = '<div class="popup__fader"></div>';
            $('body').addClass('noscroll').append(fader);
        }
        
        QP.getLastAnsweredQuestion = function() {
            var lastAnsweredQuestion = null;
            for (i in QP.location.questions) {
                var question = QP.location.questions[i].userAnswerStatus;
                if (question) {
                    lastAnsweredQuestion = i;
                }
            }
            return lastAnsweredQuestion;
        }
        
        QP.checkStates = function() {
            if (QP.stmp) {
                QP.showQuestion();
                return;
            }

            var lastAnsweredQuestion = QP.getLastAnsweredQuestion();
            if (!lastAnsweredQuestion)
                return;
            
            lastAnsweredQuestion = parseInt(lastAnsweredQuestion);
            switch (lastAnsweredQuestion) {
                case 0:
                case 1:
                    QP.showState(lastAnsweredQuestion);
                    break;
                case 2:
                    QP.showFinalScreen();
                    break;
            }
        }
        
        QP.closePopup = function() {
            $('.popup.active').fadeOut(200,function(){
                $(this).removeClass('active');
                $('body').removeClass('noscroll');
                if ($('.popup__fader').length){
                    $('.popup__fader').remove();
                }
            });            
        }

        QP.bindEvents = function() {

            if ( !QP.$.callers.length ) return;
            
            QP.$.callers.on('click',function(e){
                e.preventDefault();
                if (!$(this).hasClass('inactive')) {
                    QP.openPopup($(this));
                }
            });

            // Close popup
            $(document).on('click', "[popup-closer], .popup__fader", function(e){
                e.preventDefault();
                QP.closePopup();
            });

           
            $(document).on('click', '#question_btn_answer', function(){
                QP.Timer[QP.quizId].stop();

                QP.answer = $(this);
                
                $.when(QP.checkAnswer())
                    .done(QP.answerHandle)
                    .fail(QP.sayError);

                return false;
            });

            $(document).on("click", "#question_btn_next", function(){
                if (QP.currentQuestion < 2) {
                    QP.next();
                } else {
                    QP.showFinalScreen();
                }
                return false;
            });

            // enable button when click on radio button
            $(document).on('click', '.question__opts input', function(){
                $("#question_btn_answer").prop('disabled', false);
            });

            $(document).on('click', '#popup_btn_start', function() {
                QP.showQuestion();
                return false;
            });
        };
        
        QP.init = function() {
            if (typeof QUESTIONS == 'undefined' || typeof BX_USER_ID == 'undefined') {
                return;
            }
            QP.localStorageName += BX_USER_ID;
            QP.cacheElements();
            QP.bindEvents();
        };

        return QP;
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
            var $mainContent = $('.layout-main'),
                ph = $(window).height() - 70,
                ww = $(window).width();
            $mainContent.find('.container').css('height','auto');
            if ($mainContent.length) {
                if ($('body').hasClass('page-about')) {
                    //$mainContent.find('.fullscreen-section').removeAttr('style');
                    if (ww > 1023) {

                        $mainContent.find('.fullscreen-section:not(.custom-height)').css('height', ph);

                    } else {
                        $mainContent.find('.fullscreen-section:not(.custom-height)').removeAttr('style');
                    }
                }

                var ch = ph - 70;
                cnth = $mainContent.find('.container').outerHeight();
                if (ch > cnth) {
                    $mainContent.find('.container').css('height', ch);
                } else {
                    $mainContent.find('.container').css('height', 'auto');
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
                        $('[data-episode]').not('[data-episode="' + id + '"]').fadeOut();
                    }
                    $('[data-id]').fadeOut();
                    $('[data-id="' + id + '"]').fadeIn(500);
                });
            }
        }
    })(),

    Popups = (function(){
        return {
            callerPopupIdAttribute: 'caller-popup-id',
            lastPopupCookieName: 'story_of_god_last_popup',

            init: function(){
                this.bindEvents();
                this.checkLastPopup();
            },
            
            bindEvents: function() {
                var self = this,
                    $callers = $('.popup__caller');
                    
                $callers.on('click',function(e){
                    e.preventDefault();
                    if (($(this).attr('href')) &&
                        (typeof($(this).attr('data-quiz-caller')) == 'undefined') ){
                        var popup = $(this).attr('href'),
                            fader = '<div class="popup__fader"></div>',
                            $caller = $(this);
                        if (popup.length){
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
                    }
                    
                    if (typeof $(this).data(self.callerPopupIdAttribute) != 'undefined') {
                        Cookies.set(self.lastPopupCookieName, $(this).data(self.callerPopupIdAttribute));
                    }
                    else {
                        Cookies.remove(self.lastPopupCookieName);
                    }
                });
                $(document).on('click', "[popup-closer], .popup__fader", function(e){
                    e.preventDefault();

                    $('.popup.active').fadeOut(500,function(){
                        $(this).removeClass('active');
                        var $videoplayer = $(this).find('.popup-video__iframe');
                        if ( $videoplayer.length ){
                            //stop video when close
                            $videoplayer[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
                        }
                        $('body').removeClass('noscroll');
                        if ($('.popup__fader').length){
                            $('.popup__fader').remove();
                        }
                    });

                    Cookies.remove(self.lastPopupCookieName);
                });
            },
            
            checkLastPopup: function() {
                var lastPopupId = Cookies.get(this.lastPopupCookieName);
                if (lastPopupId){
                    $('[data-' + this.callerPopupIdAttribute + '="' + lastPopupId + '"]').click();
                }
            }
        }
    })()
        ,FlexFallback = (function(){
            return {
                init : function() {
                    if (!Modernizr.flexbox) {
                        $('body').addClass('no-flex')
                    }
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
