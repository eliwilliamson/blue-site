/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );


 
    
    /**
     * @author  Mudit Ameta
     * @license https://github.com/zeusdeux/isInViewport/blob/master/license.md MIT
     */
    (function($, window) {

      // polyfilling trim for ie < 9. sigh ;-;
      if (!String.prototype.hasOwnProperty('trim')) {
        String.prototype.trim = function() {
          return this.replace(/^\s*(.*?)\s*$/, '$1');
        };
      }


      // lets you chain any arbitrary function or an array of functions and returns a jquery object
      var run = function(args) {
        if (arguments.length === 1 && typeof args === 'function')
          args = [args];

        if (!(args instanceof Array))
          throw new SyntaxError('isInViewport: Argument(s) passed to .do/.run should be a function or an array of functions');

        for (var i = 0; i < args.length; i++) {
          if (typeof args[i] !== 'function') {
            console.warn('isInViewport: Argument(s) passed to .do/.run should be a function or an array of functions');
            console.warn('isInViewport: Ignoring non-function values in array and moving on');
            continue;
          }
          for (var j = 0; j < this.length; j++)
            args[i].call($(this[j]));
        }
        return this;
      };


      // do is a reserved word and hence using it as a property throws on some browsers
      // it is now aliased as $.fn.run
      // deprecate $.fn.do (2.3.0)
      $.fn['do'] = function(args) {
        console.warn('isInViewport: .do is deprecated as it causes issues in IE and some browsers since it\'s a reserved word. Use $.fn.run instead i.e., $(el).run(fn).');
        return run(args);
      };
      $.fn.run = run;


      // gets the width of the scrollbar
      function getScrollbarWidth(viewport) {
        var scrollBarWidth;

        // append a div that has 100% width to get true width of viewport
        var el = $('<div></div>').css({
          'width': '100%'
        });
        viewport.append(el);

        // subtract true width from the viewport width which is inclusive
        // of scrollbar by default
        scrollBarWidth = viewport.width() - el.width();

        // remove our element from DOM
        el.remove();
        return scrollBarWidth;
      }


      // Returns true if DOM element `element` is in viewport
      function isInViewport(element, options) {
        var boundingRect  = element.getBoundingClientRect();
        var top           = boundingRect.top;
        var bottom        = boundingRect.bottom;
        var left          = boundingRect.left;
        var right         = boundingRect.right;
        var settings      = $.extend({
          'tolerance': 0,
          'viewport': window
        }, options);
        var isVisibleFlag = false;
        var $viewport     = settings.viewport.jquery ? settings.viewport : $(settings.viewport);

        if (!$viewport.length) {
          console.warn('isInViewport: The viewport selector you have provided matches no element on page.');
          console.warn('isInViewport: Defaulting to viewport as window');
          $viewport = $(window);
        }

        var $viewportHeight = $viewport.height();
        var $viewportWidth  = $viewport.width();
        var typeofViewport  = $viewport[0].toString();

        // if the viewport is other than window recalculate the top,
        // bottom,left and right wrt the new viewport
        // the [object DOMWindow] check is for window object type in PhantomJS
        if ($viewport[0] !== window && typeofViewport !== '[object Window]' && typeofViewport !== '[object DOMWindow]') {
          // Use getBoundingClientRect() instead of $.Offset()
          // since the original top/bottom positions are calculated relative to browser viewport and not document
          var viewportRect = $viewport[0].getBoundingClientRect();

          // recalculate these relative to viewport
          top    = top - viewportRect.top;
          bottom = bottom - viewportRect.top;
          left   = left - viewportRect.left;
          right  = right - viewportRect.left;

          // get the scrollbar width from cache or calculate it
          isInViewport.scrollBarWidth = isInViewport.scrollBarWidth || getScrollbarWidth($viewport);

          // remove the width of the scrollbar from the viewport width
          $viewportWidth -= isInViewport.scrollBarWidth;
        }

        // handle falsy, non-number and non-integer tolerance value
        // same as checking using isNaN and then setting to 0
        // bitwise operators deserve some love too you know
        settings.tolerance = ~~Math.round(parseFloat(settings.tolerance));

        if (settings.tolerance < 0)
          settings.tolerance = $viewportHeight + settings.tolerance; // viewport height - tol

        // the element is NOT in viewport iff it is completely out of
        // viewport laterally or if it is completely out of the tolerance
        // region. Therefore, if it is partially in view then it is considered
        // to be in the viewport and hence true is returned. Because we have adjusted
        // the left/right positions relative to the viewport, we should check the
        // element's right against the viewport's 0 (left side), and the element's
        // left against the viewport's width to see if it is outside of the viewport.

        if (right <= 0 || left >= $viewportWidth)
          return isVisibleFlag;

        // if the element is bound to some tolerance
        isVisibleFlag = settings.tolerance ? top <= settings.tolerance && bottom >= settings.tolerance : bottom > 0 && top <= $viewportHeight;

        return isVisibleFlag;
      }


      // get the selector args from the args string proved by Sizzle
      var getSelectorArgs = function(argsString) {
        if (argsString) {
          var args = argsString.split(',');

          // when user only gives viewport and no tolerance
          if (args.length === 1 && isNaN(args[0])) {
            args[1] = args[0];
            args[0] = void 0;
          }

          return {
            tolerance: args[0] ? args[0].trim() : void 0,
            viewport: args[1] ? $(args[1].trim()) : void 0
          };
        }
        return {};
      };


      // expose isInViewport as a custom pseudo-selector
      $.extend($.expr[':'], {
        // if $.expr.createPseudo is available, use it
        'in-viewport': $.expr.createPseudo ?
          $.expr.createPseudo(function(argsString) {
            return function(currElement) {
              return isInViewport(currElement, getSelectorArgs(argsString));
            };
          }) :
        function(currObj, index, meta) {
          return isInViewport(currObj, getSelectorArgs(meta[3]));
        }
      });


      // expose isInViewport as a function too
      // this lets folks pass around actual objects as options (like custom viewport)
      // and doesn't tie 'em down to strings. It also prevents isInViewport from
      // having to look up and wrap the dom element corresponding to the viewport selector
      $.fn.isInViewport = function(options) {
        return this.filter(function(i, el) {
          return isInViewport(el, options);
        });
      };

    })(jQuery, window);

        var videos = [];

    function checkVideoStatus () {
        videos.each(function(){
            if ($(this).is(":in-viewport( -400 )") || $(this).is(":in-viewport( 400 )")) {
                $(this)[0].play();
            } else {
                $(this)[0].pause();
            }
        });
    }

    $(function() {
        videos = $('video')

        window.addEventListener('scroll', checkVideoStatus, false);
        window.addEventListener('resize', checkVideoStatus, false);
        checkVideoStatus()
    });(function() {
	var triggerBttn = document.getElementById( 'trigger-overlay' ),
		overlay = document.querySelector( 'div.overlay' ),
		closeBttn = overlay.querySelector( 'button.overlay-close' );
		transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	function toggleOverlay() {
		if( classie.has( overlay, 'open' ) ) {
			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
			var onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					if( ev.propertyName !== 'visibility' ) return;
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				classie.remove( overlay, 'close' );
			};
			if( support.transitions ) {
				overlay.addEventListener( transEndEventName, onEndTransitionFn );
			}
			else {
				onEndTransitionFn();
			}
		}
		else if( !classie.has( overlay, 'close' ) ) {
			classie.add( overlay, 'open' );
		}
	}

	triggerBttn.addEventListener( 'click', toggleOverlay );
	closeBttn.addEventListener( 'click', toggleOverlay );
})();

$testimonials = $(".js-testimonials"), 
this.t_offset = 0
this.t_count = 0,

this.rotateTestimonial = function(n) {
    return function() {
        n.t_count++
        n.t_count === n.$testimonials.children().length ? (n.t_offset = 0, n.t_count = 0) : n.t_offset += 320
        n.$testimonials.css({
            // webkitTransform: "translateX(-" + n.t_offset + "px)",
            // MozTransform: "translateX(-" + n.t_offset + "px)",
            // transform: "translateX(-" + n.t_offset + "px)"
            'margin-left': "-" + n.t_offset + "px"
        })

        setTimeout(function(){
            // $('.testimonial').css({
            //     width : 320
            // })
        }, 200)

        // $('.testimonial').css({
        //     width : 321
        // })
        
        setTimeout(function() {
        	return n.rotateTestimonial()
        }, 4000)
    }
}(this)

this.rotateTestimonial()

$(function(){

	function resetSwitcher(type) {
		$('.switcher-'+type+'-images img').addClass('faded')
		$('.switcher-'+type).removeClass('active')
	}

	$('#switcher-inbox-1').click(function(){
		resetSwitcher('inbox')

		$('.switcher-inbox-images img.first').removeClass('faded')

		$(this).addClass('active')
	})

	$('#switcher-inbox-2').click(function(){
		resetSwitcher('inbox')

		$('.switcher-inbox-images img.second').removeClass('faded')
		$(this).addClass('active')
	})

	$('#switcher-monitoring-1').click(function(){
		resetSwitcher('monitoring')

		$('.switcher-monitoring-images img.first').removeClass('faded')

		$(this).addClass('active')
	})

	$('#switcher-monitoring-2').click(function(){
		resetSwitcher('monitoring')

		$('.switcher-monitoring-images img.second').removeClass('faded')
		$(this).addClass('active')
	})
})






/*
     FILE ARCHIVED ON 21:20:45 May 5, 2016 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 12:56:33 Dec 8, 2016.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
// The MIT License (MIT)

// Typed.js | Copyright (c) 2014 Matt Boldt | www.mattboldt.com

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.




! function($) {

    "use strict";

    var Typed = function(el, options) {

        // chosen element to manipulate text
        this.el = $(el);

        // options
        this.options = $.extend({}, $.fn.typed.defaults, options);

        // attribute to type into
        this.isInput = this.el.is('input');
        this.attr = this.options.attr;

        // show cursor
        this.showCursor = this.isInput ? false : this.options.showCursor;

        // text content of element
        this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text()

        // html or plain text
        this.contentType = this.options.contentType;

        // typing speed
        this.typeSpeed = this.options.typeSpeed;

        // add a delay before typing starts
        this.startDelay = this.options.startDelay;

        // backspacing speed
        this.backSpeed = this.options.backSpeed;

        // amount of time to wait before backspacing
        this.backDelay = this.options.backDelay;

        // input strings of text
        this.strings = this.options.strings;

        // character number position of current string
        this.strPos = 0;

        // current array position
        this.arrayPos = 0;

        // number to stop backspacing on.
        // default 0, can change depending on how many chars
        // you want to remove at the time
        this.stopNum = 0;

        // Looping logic
        this.loop = this.options.loop;
        this.loopCount = this.options.loopCount;
        this.curLoop = 0;

        // for stopping
        this.stop = false;

        // custom cursor
        this.cursorChar = this.options.cursorChar;

        // shuffle the strings
        this.shuffle = this.options.shuffle;
        // the order of strings
        this.sequence = [];

        // All systems go!
        this.build();
    };

    Typed.prototype = {

        constructor: Typed

        ,
        init: function() {
            // begin the loop w/ first current string (global self.string)
            // current string will be passed as an argument each time after this
            var self = this;
            self.timeout = setTimeout(function() {
                for (var i=0;i<self.strings.length;++i) self.sequence[i]=i;

                // shuffle the array if true
                if(self.shuffle) self.sequence = self.shuffleArray(self.sequence);

                // Start typing
                self.typewrite(self.strings[self.sequence[self.arrayPos]], self.strPos);
            }, self.startDelay);
        }

        ,
        build: function() {
            // Insert cursor
            if (this.showCursor === true) {
                this.cursor = $("<span class=\"typed-cursor\">" + this.cursorChar + "</span>");
                this.el.after(this.cursor);
            }
            this.init();
        }

        // pass current string state to each function, types 1 char per call
        ,
        typewrite: function(curString, curStrPos) {
            // exit when stopped
            if (this.stop === true) {
                return;
            }

            // varying values for setTimeout during typing
            // can't be global since number changes each time loop is executed
            var humanize = Math.round(Math.random() * (100 - 30)) + this.typeSpeed;
            var self = this;

            // ------------- optional ------------- //
            // backpaces a certain string faster
            // ------------------------------------ //
            // if (self.arrayPos == 1){
            //  self.backDelay = 50;
            // }
            // else{ self.backDelay = 500; }

            // contain typing function in a timeout humanize'd delay
            self.timeout = setTimeout(function() {
                // check for an escape character before a pause value
                // format: \^\d+ .. eg: ^1000 .. should be able to print the ^ too using ^^
                // single ^ are removed from string
                var charPause = 0;
                var substr = curString.substr(curStrPos);
                if (substr.charAt(0) === '^') {
                    var skip = 1; // skip atleast 1
                    if (/^\^\d+/.test(substr)) {
                        substr = /\d+/.exec(substr)[0];
                        skip += substr.length;
                        charPause = parseInt(substr);
                    }

                    // strip out the escape character and pause value so they're not printed
                    curString = curString.substring(0, curStrPos) + curString.substring(curStrPos + skip);
                }

                if (self.contentType === 'html') {
                    // skip over html tags while typing
                    var curChar = curString.substr(curStrPos).charAt(0)
                    if (curChar === '<' || curChar === '&') {
                        var tag = '';
                        var endTag = '';
                        if (curChar === '<') {
                            endTag = '>'
                        } else {
                            endTag = ';'
                        }
                        while (curString.substr(curStrPos).charAt(0) !== endTag) {
                            tag += curString.substr(curStrPos).charAt(0);
                            curStrPos++;
                        }
                        curStrPos++;
                        tag += endTag;
                    }
                }

                // timeout for any pause after a character
                self.timeout = setTimeout(function() {
                    if (curStrPos === curString.length) {
                        // fires callback function
                        self.options.onStringTyped(self.arrayPos);

                        // is this the final string
                        if (self.arrayPos === self.strings.length - 1) {
                            // animation that occurs on the last typed string
                            self.options.callback();

                            self.curLoop++;

                            // quit if we wont loop back
                            if (self.loop === false || self.curLoop === self.loopCount)
                                return;
                        }

                        self.timeout = setTimeout(function() {
                            self.backspace(curString, curStrPos);
                        }, self.backDelay);
                    } else {

                        /* call before functions if applicable */
                        if (curStrPos === 0)
                            self.options.preStringTyped(self.arrayPos);

                        // start typing each new char into existing string
                        // curString: arg, self.el.html: original text inside element
                        var nextString = curString.substr(0, curStrPos + 1);
                        if (self.attr) {
                            self.el.attr(self.attr, nextString);
                        } else {
                            if (self.isInput) {
                                self.el.val(nextString);
                            } else if (self.contentType === 'html') {
                                self.el.html(nextString);
                            } else {
                                self.el.text(nextString);
                            }
                        }

                        // add characters one by one
                        curStrPos++;
                        // loop the function
                        self.typewrite(curString, curStrPos);
                    }
                    // end of character pause
                }, charPause);

                // humanized value for typing
            }, humanize);

        }

        ,
        backspace: function(curString, curStrPos) {
            // exit when stopped
            if (this.stop === true) {
                return;
            }

            // varying values for setTimeout during typing
            // can't be global since number changes each time loop is executed
            var humanize = Math.round(Math.random() * (100 - 30)) + this.backSpeed;
            var self = this;

            self.timeout = setTimeout(function() {

                // ----- this part is optional ----- //
                // check string array position
                // on the first string, only delete one word
                // the stopNum actually represents the amount of chars to
                // keep in the current string. In my case it's 14.
                // if (self.arrayPos == 1){
                //  self.stopNum = 14;
                // }
                //every other time, delete the whole typed string
                // else{
                //  self.stopNum = 0;
                // }

                if (self.contentType === 'html') {
                    // skip over html tags while backspacing
                    if (curString.substr(curStrPos).charAt(0) === '>') {
                        var tag = '';
                        while (curString.substr(curStrPos).charAt(0) !== '<') {
                            tag -= curString.substr(curStrPos).charAt(0);
                            curStrPos--;
                        }
                        curStrPos--;
                        tag += '<';
                    }
                }

                // ----- continue important stuff ----- //
                // replace text with base text + typed characters
                var nextString = curString.substr(0, curStrPos);
                if (self.attr) {
                    self.el.attr(self.attr, nextString);
                } else {
                    if (self.isInput) {
                        self.el.val(nextString);
                    } else if (self.contentType === 'html') {
                        self.el.html(nextString);
                    } else {
                        self.el.text(nextString);
                    }
                }

                // if the number (id of character in current string) is
                // less than the stop number, keep going
                if (curStrPos > self.stopNum) {
                    // subtract characters one by one
                    curStrPos--;
                    // loop the function
                    self.backspace(curString, curStrPos);
                }
                // if the stop number has been reached, increase
                // array position to next string
                else if (curStrPos <= self.stopNum) {
                    self.arrayPos++;

                    if (self.arrayPos === self.strings.length) {
                        self.arrayPos = 0;

                        // Shuffle sequence again
                        if(self.shuffle) self.sequence = self.shuffleArray(self.sequence);

                        self.init();
                    } else
                        self.typewrite(self.strings[self.sequence[self.arrayPos]], curStrPos);
                }

                // humanized value for typing
            }, humanize);

        }
        /**
         * Shuffles the numbers in the given array.
         * @param {Array} array
         * @returns {Array}
         */
        ,shuffleArray: function(array) {
            var tmp, current, top = array.length;
            if(top) while(--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = array[current];
                array[current] = array[top];
                array[top] = tmp;
            }
            return array;
        }

        // Start & Stop currently not working

        // , stop: function() {
        //     var self = this;

        //     self.stop = true;
        //     clearInterval(self.timeout);
        // }

        // , start: function() {
        //     var self = this;
        //     if(self.stop === false)
        //        return;

        //     this.stop = false;
        //     this.init();
        // }

        // Reset and rebuild the element
        ,
        reset: function() {
            var self = this;
            clearInterval(self.timeout);
            var id = this.el.attr('id');
            this.el.after('<span id="' + id + '"/>')
            this.el.remove();
            if (typeof this.cursor !== 'undefined') {
                this.cursor.remove();
            }
            // Send the callback
            self.options.resetCallback();
        }

    };

    $.fn.typed = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('typed'),
                options = typeof option == 'object' && option;
            if (!data) $this.data('typed', (data = new Typed(this, options)));
            if (typeof option == 'string') data[option]();
        });
    };

    $.fn.typed.defaults = {
        strings: ["These are the default values...", "You know what you should do?", "Use your own!", "Have a great day!"],
        // typing speed
        typeSpeed: 0,
        // time before typing starts
        startDelay: 0,
        // backspacing speed
        backSpeed: 0,
        // shuffle the strings
        shuffle: false,
        // time before backspacing
        backDelay: 500,
        // loop
        loop: false,
        // false = infinite
        loopCount: false,
        // show cursor
        showCursor: true,
        // character for cursor
        cursorChar: "|",
        // attribute to type (null == text)
        attr: null,
        // either html or text
        contentType: 'html',
        // call when done callback function
        callback: function() {},
        // starting callback function before each string
        preStringTyped: function() {},
        //callback for every typed string
        onStringTyped: function() {},
        // callback for reset
        resetCallback: function() {}
    };


}(window.jQuery);