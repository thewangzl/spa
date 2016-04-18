/*
*	spa.avatar.js
*	Avatar feature module
*/
/* jslink			browser: true,		continue:true,
	devel: true,	indent:2,			maxerr : 50,
	newcap: true,	nomen: true,		plusplus: true,
	regexp: true,	sloppy: true,		vars : false,
	white : true
*/
/* global $, spa */
spa.avtr = (function(){
	'use strict';
	//-------------------------Begin module scope variables------------
	var 
		configMap = {
			chat_model		: null,
			people_model	: null,

			settable_map	: {
				chat_model	: true,
				people_model: true
			}
		},
		stateMap = {
			drag_map		: null,
			$drag_target	: null,
			drag_bg_color	: undefined
		},
		jqueryMap ={},

		getRandRgb, setJqueryMap,
		updateAvatar, onTapNav,
		onHeldstartNav, onHeldmoveNav,
		onHeldendNav, onSetchatee,
		onListchange, onLogout,
		configModule, initModule;
	//-------------------------End module scope variables------------
	//-------------------------Begin utility methods------------
	getRandRgb = function(){
		var i, rgb_list = [];
		for(i = 0; i < 3; i++){
			rgb_list.push(Math.floor(Math.random() * 128) + 128);
		}
		return 'rgb(' + rgb_list.join(',') + ')';
	};
	//-------------------------End utility methods------------
	//-------------------------Begin DOM methods------------
	setJqueryMap = function($container){
		jqueryMap = {$container : $container};
	};
	updateAvatar = function($target){
		var css_map, person_id;
		css_map = {
			'top'	: parseInt($target.css('top'), 10),
			'left'	: parseInt($target.css('left'), 10),
			'background-color' : $target.css('background-color')
		};
		person_id = $target.attr('data-id');

		configMap.chat_model.update_avatar({
			person_id : person_id,
			css_map		:css_map
		});
	};
	//-------------------------End DOM methods------------
	//-------------------------Begin event methods------------

	onTapNav = function(event){
		var css_map,
			$target = $(event.target).closest('.spa-avtr-box');

		if($target.length === 0){
			return false;
		}
		$target.css({
			'background-color'	: getRandRgb()
		});
		updateAvatar($target);
	};
	onHeldstartNav = function(event){
		var offset_target_map,
			$target = $(event.target).closest('.spa-avtr-box');
			
		if($target.length === 0){
			return false;
		}
		stateMap.$drag_target = $target;
		offset_target_map = {};
		offset_target_map.top = event.pageY - parseInt($target.css('top'));
		offset_target_map.left = event.pageX - parseInt($target.css('left'));
		stateMap.drag_map = offset_target_map;
		stateMap.drag_bg_color = $target.css('background-color');

		$target.addClass('spa-x-is-drag')
				.css('background-color','');
		return true;
	};
	onHeldmoveNav = function(event){
		var left,right,
			drag_map = stateMap.drag_map;
		if(!drag_map || !stateMap.$drag_target){
			return false;
		}
		var top = event.pageY - drag_map.top;
		var left= event.pageX - drag_map.left;
		$(".spa-shell-foot").text('(' + left + ',' +  top + ')');
		stateMap.$drag_target.css({
			top : top,
			left : left
		});
		return true;
	};
	onHeldendNav = function(event){
		var $drag_target = stateMap.$drag_target;
		if(!$drag_target){
			return false;
		}
		$drag_target.removeClass('spa-x-is-drag')
					.css('background-color' , stateMap.drag_bg_color);

		stateMap.drag_bg_color = undefined;
		stateMap.$drag_target = null;
		stateMap.drag_map = null;
		updateAvatar($drag_target);
		return true;
	};
	onSetchatee = function(event, arg_map){
		var
			$nav		= $(this),
			new_chatee	= arg_map.new_chatee,
			old_chatee	= arg_map.old_chatee;

		// Use this to highlight avatar of user in nav area
		// See new_chatee.name, old_chatee.name, etc.

		// remove highlight from old_chatee avatar here
		if(old_chatee){
			$nav.find('.spa-avtr-box[data-id='+ old_chatee.id + ']')
				.removeClass('.spa-x-is-chatee');
		}
		// add highlight to new_chatee avatar here
		if(new_chatee){
			$nav.find('.spa-avtr-box[data-id='+ new_chatee.id + ']')
				.addClass('.spa-x-is-chatee');
		}
	};
	onListchange = function(event){
		var 
			$nav = $(this),
			people_db = configMap.people_model.get_db(),
			user	  = configMap.people_model.get_user(),
			chatee    = configMap.chat_model.get_chatee() || {},
			$box;

		$nav.empty();
		//if the user is logged out, do not render
		if(user.get_is_anon()){
			return false;
		}
		people_db().each(function(person, idx){
			var class_list;
			if(person.get_is_anon()){
				return true;
			}
			class_list = ['spa-avtr-box'];
			if(person.id === chatee.id){
				class_list.push('spa-x-is-chatee');
			}
			if(person.get_is_user()){
				class_list.push('spa-x-is-user');
			}
			$box = $('<div/>')
					.addClass(class_list.join(' '))
					.css(person.css_map)
					.attr('data-id', String(person.id))
					.prop('title',spa.util_b.encodeHtml(person.name))
					.text(person.name)
					.appendTo($nav);
		});
	};
	onLogout = function(event){
		jqueryMap.$container.empty();
	};
	//-------------------------End event methods------------

	//-------------------------Begin public methods------------
	configModule = function(input_map){
		spa.util.setConfigMap({
			input_map	: input_map,
			settable_map: configMap.settable_map,
			config_map	: configMap
		});
		return true;
	};
	initModule = function($container){
		setJqueryMap($container);

		//bind model global events
		$.gevent.subscribe($container, 'spa-setchatee', onSetchatee);
		$.gevent.subscribe($container, 'spa-listchange', onListchange);
		$.gevent.subscribe($container, 'spa-logout', onLogout);

		//bind actions
		$container.bind('click',		onTapNav)
					.bind('mousedown', onHeldstartNav)
					.bind('mousemove', onHeldmoveNav)
					.bind('mouseup', onHeldendNav);
		return true;
	}
	//-------------------------End public methods------------
	//
	return {
		configModule : configModule,
		initModule	 : initModule
	}

}());