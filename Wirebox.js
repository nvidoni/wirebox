/*
 * Wirebox - jQuery Plugin
 *
 * Author: Nicolas Turlais, June 2012, nicolas-at-insipi.de
 * Modified: Nikola Vidoni, April 2013
 * 
 * Version: 0.3.1
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
			displayAsLink:				false,
			linkImages:					true,
			linksContainer:				'wireboxLinksContainer',				
			overlayOpacity:				0.9,
			overlayColor:				'#000',
			overlayClose:				true,
			fadeInOverlayduration:		200,
			fadeInImageduration:		200,
			fadeOutImageduration:		200,		
			name: 						"Image ",
			separator: 					" / ",
			currentImage:				0,
			setIndex:					0,
			setTitle:					'',
			lastImage:					0
		},settings);
		
		calls++;
		settings.setIndex = calls;
		images[settings.setIndex] = [];
		
		//images:
		this.each(function(index){
			if(index == 0 && settings.linkImages && settings.setTitle == ''){
				settings.setTitle = isSet($(this).attr('rel'), ' ');
			}
			$(this).each(function() {
				images[settings.setIndex]['displayAsLink'] = settings.displayAsLink;
				images[settings.setIndex][index] = [];
				images[settings.setIndex][index]['location'] = isSet($(this).attr('href'), ' ');
				images[settings.setIndex][index]['caption'] = isSet($(this).attr('title'), ' ');
				if(!settings.displayAsLink){
					$(this).unbind('click').bind('click', {id: settings.setIndex, nom : settings.setTitle, i : index}, _initialise);
				}
			})
		});
		
		//setIndex:
		for(var i = 0; i < images[settings.setIndex].length; i++)
		{
			if(images[settings.setIndex]['displayAsLink']){
				if($('#'+settings.linksContainer).size() == 0){
					this.filter(":first").before('<ul id="'+settings.linksContainer+'"></ul>');
				}
				$('#'+settings.linksContainer).append('<li><a href="#" id="wireboxNumSetIndex_'+settings.setIndex+'" class="wireboxLink">'+settings.setTitle+'</a></li>');
				e = this.parent();
				$(this).remove();
				if($.trim(e.html()) == ""){//If parent empty : remove it
					e.remove();
				}
				return $('#wireboxNumSetIndex_'+settings.setIndex).unbind('click').bind('click', {id: settings.setIndex, nom : settings.setTitle, i : settings.currentImage}, _initialise);
			}
		}
		
		function _initialise(event) {
			
			settings.currentImage = event.data.i;
			settings.setIndex = event.data.id;
			settings.setTitle = event.data.nom;
			settings.lastImage = images[settings.setIndex].length - 1;
			showWirebox();
			return false;
		}
		function _interface(){
			//html
			clear();
			settings.container.append('<div id="wireboxOverlay"></div><div id="wireboxContent"><div id="wireboxClose"></div><div id="wireboxLoading"></div><div id="wireboxContainer"><img id="wireboxImage" src="" /></div><div id="wireboxDescription"><span id="wireboxTitle"></span><span id="wireboxCounter"></span></div><div id="wireboxLeft" class="wireboxArrows"></div><div id="wireboxRight" class="wireboxArrows"></div></div>');
			if(settings.container.get(0).nodeName.toLowerCase() !== 'body'){
				settings.container.css({'position':'relative','overflow':'hidden','line-height':'normal'});
				$('#wireboxContent').css('position','relative');
				$('#wireboxOverlay').css('position', 'absolute');
			}
			//events
			$(document).unbind('keydown').bind('keydown', function(e){
				switch(e.keyCode){
					case 37:
						changePageWirebox(-1);
						break;
					case 39:
						changePageWirebox(1);
						break;
					case 27:
						close();
						break;
				};
			});
			if(settings.overlayClose){
				$('#wireboxOverlay').click(function(){
					close();
					return false;
				});
			}
			$('#wireboxLeft').unbind().bind('click', function(){
				changePageWirebox(-1);
				return false;
			});
			$('#wireboxRight').unbind().bind('click', function(){
				changePageWirebox(1);
				return false;
			});
			$('#wireboxClose').unbind().bind('click', function(){
				close();
				return false;
			});
			$(window).resize(function() {
				load(settings.currentImage,true);
			});
	
		}
		function showWirebox(){	
			_interface();
			load(settings.currentImage, false);
			$('#wireboxOverlay').css({'background-color' : settings.overlayColor, 'opacity' : settings.overlayOpacity}).fadeIn(settings.fadeInOverlayduration);
			$('#wireboxContent').fadeIn(settings.fadeInImageduration,function(){});
			
		}
		function load(image,resize){
			settings.currentImage = image;
			$('#wireboxLoading').fadeIn(settings.fadeInImageduration);
			var imgPreloader = new Image();
			imgPreloader.onload = function(){
				$('#wireboxImage').attr('src',images[settings.setIndex][settings.currentImage]['location']);
				var adjust = iWantThePerfectImageSize(imgPreloader.height,imgPreloader.width);
				Wirebox(adjust['height'],adjust['width'],resize);
				$('#wireboxLoading').stop().fadeOut(settings.fadeOutImageduration);
			};
			imgPreloader.src = images[settings.setIndex][settings.currentImage]['location'];
			preload();
			upadteDescription();
		}
		function changePageWirebox(signe){
			if(!settings.linkImages || (settings.currentImage == 0 && signe == -1) || (settings.currentImage == settings.lastImage && signe == 1))
			{
				return false;
			}
			else{
				$('#wireboxDescription').css('visibility','hidden');
				$('#wireboxImage').fadeTo(settings.fadeOutImageduration, 0, function(){
					load(settings.currentImage + parseInt(signe), false);
				});
			}
		}
		function Wirebox(height,width,resize){

			if(resize){
				$('#wireboxContainer, #wireboxContent, #wireboxImage').stop(true,false).css({'overflow':'visible'});
				$('#wireboxImage').animate({
					'height' : height+'px',
					'width' : width+'px'
				},settings.fadeInImageduration);
			}
			$('#wireboxContainer').animate({
					'height' : height,
					'width' : width
			},settings.fadeInImageduration);
			$('#wireboxContent').animate({
				'height' : height,
				'width' : width,
				'marginLeft' : -width/2,
				'marginTop' : -(height)/2
			},settings.fadeInImageduration, 'swing', function(){
				$('#wireboxImage').fadeTo(settings.fadeInImageduration, 1).height(height).width(width);
				if(!resize)
				{
					arrowsManaging();
					//$('#wireboxDescription').fadeTo(settings.fadeInImageduration,1); making a weird bug with firefox 17
					$('#wireboxDescription').css('visibility','visible');
					$('#wireboxClose').fadeIn(settings.fadeInImageduration);
				}
			}).
			css('overflow', 'visible');
		}
		function arrowsManaging(){
			if(settings.linkImages){
				var what = ['wireboxRight','wireboxLeft'];
				for(var i=0; i < what.length; i++){
					hide = false;
					if(what[i] == 'wireboxRight' && settings.currentImage == settings.lastImage){
						hide = true;
						$('#'+what[i]).fadeOut(300);
					}
					else if(what[i] == 'wireboxLeft' && settings.currentImage == 0){
						hide = true;
						$('#'+what[i]).fadeOut(300);
					}
					if(!hide){
						$('#'+what[i]).fadeIn(settings.fadeOutImageduration);
					}
				}
			}
		}
		function preload(){
			if(settings.currentImage !== settings.lastImage){
				i = new Image;
				z = settings.currentImage + 1;
				i.src = images[settings.setIndex][z]['location'];
			}
		}
		function upadteDescription(){
			var current = settings.currentImage + 1;
			var last = settings.lastImage + 1;
			$('#wireboxTitle').html(images[settings.setIndex][settings.currentImage]['caption']);
			$('#wireboxCounter').html(settings.name+settings.setTitle+current+settings.separator+last);
		}
		function isSet(variable,defaultValue){
			// return variable === undefined ? defaultValue : variable; ?
			if (variable === undefined) {
				return defaultValue;
			}
			else{
				return variable;
			}
		}
		function iWantThePerfectImageSize(himg,limg){
			//28% = 14% + 14% margin
			var lblock = limg + (limg*28/100);
			var heightDescAndClose = $('#wireboxDescription').height()+$('#wireboxClose').height();
			var hblock = himg + heightDescAndClose;
			var k = limg/himg;
			var kk = himg/limg;
			if(settings.container.get(0).nodeName.toLowerCase() == 'body'){
				windowHeight = $(window).height();
				windowWidth = $(window).width();
			}
			else{
				windowHeight = settings.container.height();
				windowWidth = settings.container.width();
			}
			notFitting = true;
				while (notFitting){
				var lblock = limg + (limg*28/100);
				var hblock = himg + heightDescAndClose;
					if(lblock > windowWidth){
						limg = windowWidth*100/128;
						
						himg = kk * limg;
					}else if(hblock > windowHeight){
						himg = (windowHeight - heightDescAndClose);
						limg = k * himg;
					}else{
						notFitting = false;
					};
				};
			return {
				width:limg,
				height:himg
			};

		}
		function clear(){
			$('#wireboxOverlay').remove();
			$('#wireboxContent').remove();
		}
		function close(){
			$('#wireboxOverlay').fadeOut(500, function(){$('#wireboxOverlay').remove()});
			$('#wireboxContent').fadeOut(200, function(){$('#wireboxContent').remove()});
			settings.currentImage = 0;
		}
	
};
})(jQuery);