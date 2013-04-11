/*
 * Wirebox - jQuery Plugin
 *
 * Author: Nicolas Turlais, June 2012, nicolas-at-insipi.de
 * Modified: Nikola Vidoni, April 2013
 * 
 * Version: 1.0.5
 * 
 * Licensed under CC Attribution-ShareAlike
 *
 */
 
(function($) {
	images = [];
	var calls = 0;
	$.fn.wirebox = function(settings) {
		settings = $.extend({
			container:					$('body'),				
			overlayOpacity:				WireboxInput.overlayOpacity,
			overlayColor:				WireboxInput.overlayColor,
			overlayClose:				WireboxInput.overlayClose,
			fadeInOverlayDuration:		WireboxInput.fadeInOverlayDuration,
			fadeOutOverlayDuration:		WireboxInput.fadeOutOverlayDuration,
			fadeInImageDuration:		WireboxInput.fadeInImageDuration,
			fadeOutImageDuration:		WireboxInput.fadeOutImageDuration,
			prefix: 					WireboxInput.prefix,
			separator: 					WireboxInput.separator,
			currentImage:				0,
			setIndex:					0,
			lastImage:					0
		}, settings);
		
		calls++;
		settings.setIndex = calls;
		images[settings.setIndex] = [];
		
		//images:
		this.each(function(index) {
			$(this).each(function() {
				images[settings.setIndex][index] = [];
				images[settings.setIndex][index]['location'] = isSet($(this).attr('href'), ' ');
				images[settings.setIndex][index]['caption'] = isSet($(this).attr('title'), ' ');
					$(this).bind('click', {id: settings.setIndex, i : index}, _initialize);
			})
		});

		function _initialize(event) {
			settings.currentImage = event.data.i;
			settings.setIndex = event.data.id;
			settings.lastImage = images[settings.setIndex].length - 1;
			showWirebox();
			return false;
		}
		function _interface() {
			clear();
			settings.container.append('<div id="wireboxOverlay"></div><div id="wireboxContent"><div id="wireboxTitle"></div><div id="wireboxClose"></div><div id="wireboxLoading"></div><div id="wireboxContainer"><img id="wireboxImage" src="" /></div><div id="wireboxCounter"></div><div id="wireboxLeft" class="wireboxArrows"></div><div id="wireboxRight" class="wireboxArrows"></div></div>');
			if (settings.container.get(0).nodeName.toLowerCase() !== 'body') {
				settings.container.css({'position':'relative','overflow':'hidden','line-height':'normal'});
				$('#wireboxContent').css('position','relative');
				$('#wireboxOverlay').css('position', 'absolute');
			}
			$(document).unbind('keydown').bind('keydown', function(e) {
				switch(e.keyCode) {
					case 37:
						changePage(-1);
						break;
					case 39:
						changePage(1);
						break;
					case 27:
						close();
						break;
				};
			});
			if (settings.overlayClose) {
				$('#wireboxOverlay').click(function() {
					close();
					return false;
				});
			}
			$('#wireboxLeft').unbind().bind('click', function() {
				changePage(-1);
				return false;
			});
			$('#wireboxRight').unbind().bind('click', function() {
				changePage(1);
				return false;
			});
			$('#wireboxClose').unbind().bind('click', function() {
				close();
				return false;
			});
			$(window).resize(function() {
				load(settings.currentImage, true);
			});
	
		}
		function showWirebox(){	
			_interface();
			load(settings.currentImage, false);
			$('#wireboxOverlay').css({'background-color' : settings.overlayColor, 'opacity' : settings.overlayOpacity}).fadeIn(settings.fadeInOverlayduration);
			$('#wireboxContent').fadeIn(settings.fadeInImageduration,function(){});
			
		}
		function load(image,resize) {
			settings.currentImage = image;
			$('#wireboxLoading').fadeIn(settings.fadeInImageduration);
			var imgPreloader = new Image();
			imgPreloader.onload = function() {
				$('#wireboxImage').attr('src',images[settings.setIndex][settings.currentImage]['location']);
				var adjust = resizeImage(imgPreloader.height,imgPreloader.width);
				Wirebox(adjust['height'],adjust['width'],resize);
				$('#wireboxLoading').stop().fadeOut(settings.fadeOutImageduration);
			};
			imgPreloader.src = images[settings.setIndex][settings.currentImage]['location'];
			preload();
			description();
		}
		function changePage(index){
			if ((settings.currentImage == 0 && index == -1) || (settings.currentImage == settings.lastImage && index == 1)) {
				return false;
			} else {
				$('#wireboxTitle, #wireboxCounter').fadeOut(settings.fadeOutImageduration);
				$('#wireboxClose').fadeOut(settings.fadeOutImageduration);
				$('#wireboxImage').fadeTo(settings.fadeOutImageduration, 0, function() {
					load(settings.currentImage + parseInt(index), false);
				});
			}
		}
		function Wirebox(imgHeight, imgWidth, resize) {
			if (resize) {
				$('#wireboxContainer, #wireboxContent, #wireboxImage').stop(true,false).css({'overflow':'visible'});
				$('#wireboxImage')
					.animate({
						'height' : imgHeight + 'px',
						'width' : imgWidth + 'px'
					}, settings.fadeInImageduration);
			}
			$('#wireboxContainer')
				.animate({
					'height' : imgHeight,
					'width' : imgWidth
				}, settings.fadeInImageduration);
			$('#wireboxContent')
				.animate({
					'height' : imgHeight,
					'width' : imgWidth,
					'marginLeft' : -imgWidth / 2,
					'marginTop' : -imgHeight / 2
				}, settings.fadeInImageduration, 'swing', function() {
					$('#wireboxImage')
						.fadeTo(settings.fadeInImageduration, 1)
						.height(imgHeight)
						.width(imgWidth);
				if(!resize) {
					arrows();
					$('#wireboxTitle, #wireboxCounter').fadeIn(settings.fadeInImageduration);
					$('#wireboxClose').fadeIn(settings.fadeInImageduration);
				}
			}).css('overflow', 'visible');
		}
		function arrows(){
			var arrows = ['wireboxRight','wireboxLeft'];
			for (var i=0; i < arrows.length; i++) {
				hide = false;
				if (arrows[i] == 'wireboxRight' && settings.currentImage == settings.lastImage) {
					hide = true;
					$('#'+arrows[i]).fadeOut(300);
				} else if(arrows[i] == 'wireboxLeft' && settings.currentImage == 0) {
					hide = true;
					$('#'+arrows[i]).fadeOut(300);
				}
				if (!hide) {
					$('#'+arrows[i]).fadeIn(settings.fadeOutImageduration);
				}
			}
		}
		function preload() {
			if (settings.currentImage !== settings.lastImage) {
				image = new Image;
				advance = settings.currentImage + 1;
				image.src = images[settings.setIndex][advance]['location'];
			}
		}
		function description() {
			var current = settings.currentImage + 1;
			var last = settings.lastImage + 1;
			$('#wireboxTitle').html(images[settings.setIndex][settings.currentImage]['caption']);
			$('#wireboxCounter').html(settings.prefix + ' ' + current + ' ' + settings.separator + ' ' + last);
		}
		function isSet(variable,defaultValue) {
			if (variable === undefined) {
				return defaultValue;
			} else {
				return variable;
			}
		}
		function resizeImage(imgHeight, imgWidth){
			var widthRatio = imgWidth + (imgWidth * 28 / 100);
			var elements = $('#wireboxClose').height() + $('#wireboxCounter').height();
			var heightRatio = imgHeight + elements + 50;
			var vertical = imgWidth/imgHeight;
			var horizontal = imgHeight/imgWidth;
			if (settings.container.get(0).nodeName.toLowerCase() == 'body') {
				windowHeight = $(window).height();
				windowWidth = $(window).width();
			} else {
				windowHeight = settings.container.height();
				windowWidth = settings.container.width();
			}
			notFitting = true;
				while (notFitting) {
				var widthRatio = imgWidth + (imgWidth * 28 / 100);
				var heightRatio = imgHeight + elements + 50;
					if (widthRatio > windowWidth) {
						imgWidth = windowWidth * 100 / 128;
						imgHeight = horizontal * imgWidth;
					} else if (heightRatio > windowHeight) {
						imgHeight = windowHeight - elements - 50;
						imgWidth = vertical * imgHeight;
					} else {
						notFitting = false;
					};
				};
			return {
				width : imgWidth,
				height : imgHeight
			};

		}
		function clear() {
			$('#wireboxOverlay').remove();
			$('#wireboxContent').remove();
		}
		function close() {
			$('#wireboxOverlay').fadeOut(settings.fadeOutOverlayDuration, function(){$('#wireboxOverlay').remove()});
			$('#wireboxContent').fadeOut(settings.fadeOutOverlayDuration, function(){$('#wireboxContent').remove()});
			settings.currentImage = 0;
		}
	
};
})(jQuery);