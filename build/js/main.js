$(function() {

    var App = (function(){

        return {
            init : function() {
                MenuCollapse.init();
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
