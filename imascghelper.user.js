// ==UserScript==
// @name IM@S CG Helper (Tentative name)
// @author sunokonoyakma
// @version 2013.10.28.57
// @description The script to be somewhat comfortable to the IDOLM@STER CINDERELLA GIRLS.
// @include http://sp.pf.mbga.jp/12008305
// @include http://sp.pf.mbga.jp/12008305?*
// @include http://sp.pf.mbga.jp/12008305/*
// ==/UserScript==

(function() {
	// =========================================================================
	// メイン処理
	// =========================================================================

	var _doc = document;
	var _root = _doc.documentElement;
	var _body = _doc.body;
	var _location = location;
	var _param = _location.search.substring(1);

	var $id = function(a){return _doc.getElementById(a)};
	var $addClass=function(d,b){if(d&&b){var e=b.split(' ')||[];var f=d.className.split(' ')||[];for(var c=0,a=e.length;c<a;c++){if(f.indexOf(e[c])==-1){f.push(e[c])}}d.className=f.join(' ')}};
	var $removeClass=function(a,e){if(a&&e){var b=e.split(' ')||[];var d=a.className.split(' ')||[];var c=d.filter(function(g,j){for(var h=0,f=b.length;h<f;h++){if(g===b[h]){return false}}return true});a.className=c.join(' ')}};
	var $hasClass=function(a,d){var b=false;if(a&&d){var c=d.split(' ')||[];var e=a.className.split(/\s+/)||[];e.forEach(function(h){for(var g=0,f=c.length;g<f;g++){if(h.indexOf(d)!=-1){b=true;break}}})}return b};
	var $toggleClass=function(a,c){var b=false;if(a&&c){if($hasClass(a,c)){$removeClass(a,c)}else{$addClass(a,c)}}};
	var $create = function(a){return _doc.createElement(a)};
	var $bind = function(a,b,c){if(!a){return}a.addEventListener(b,c,false)};
	var $unbind = function(a,b,c){if(!a){return}a.removeEventListener(b,c,false)};

	var getValue = function (a){var b=localStorage.getItem(a);return(b)?JSON.parse(b):null};
	var setValue = function(a,b){localStorage.setItem(a,JSON.stringify(b))};
	var deleteValue = function(a){localStorage.removeItem(a)};
	var isNumeric = function(a){if(Number.isFinite){return Number.isFinite(a)}else{return(typeof a==='number')&&isFinite(a)}};
	var	round = function(a,b){var c=Math.pow(10,b);return Math.round(a*c)/c};
	var trim = function(a){return(a)?a.replace(/^[\s　]+|[\s　]+$/g,''):null};

	var _topURL = 'http://sp.pf.mbga.jp/12008305/?guid=ON';
	var _baseURL = _topURL + '&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2F';
	var _content = $id('headerAcdPanel');

	// ユーザー設定を読み込む
	var _settings = loadSettings();

	// -------------------------------------------------------------------------
	// 簡易多重実行防止っぽい感じ
	// -------------------------------------------------------------------------
	var _isExecuted = false;
	(function() {
		var cghpExecuted = $id('cghpExecuted');
		if (cghpExecuted) {
			_isExecuted = true;
		} else {
			var span = $create('span');
			span.id = 'cghpExecuted';
			span.style.display = 'none';
			_body.appendChild(span);
		}
	})();
	if (_isExecuted) return;

	// -------------------------------------------------------------------------
	// 画面を一旦非表示にする
	// -------------------------------------------------------------------------
	(function() {
		var pageArea = $id('pageArea');
		if (pageArea) {
			pageArea.style.display = 'none';
		}
	})();

	// -------------------------------------------------------------------------
	// スタイルの設定
	// -------------------------------------------------------------------------
	(function() {
		// スタイルは極力ここで書いておく。
		var css = (function() {/*

		.a_link,
		label {
			cursor:pointer;
		}
		.mbga-pf-footer-container {
			width:300px !important;
		}
		.title_sub_blue,
		.title_sub_gray {
			margin:0 0 5px 0;
			padding:5px 0;
			line-height:1.4;
		}
		.title_sub_blue img[src="http://ava-a.mbga.jp/i/dot.gif"],
		.title_sub_gray img[src="http://ava-a.mbga.jp/i/dot.gif"] {
			height:0 !important;
		}
		body {
			margin:0 auto;
			padding:0;
		}
		input[type="checkbox"],
		input[type="radio"] {
			vertical-align: 0;
			margin: 3px 8px;
		}

		#cghpCustomMenu {
			margin:0 auto;
			padding:2px 0;
			width:320px;
			background-color:#1d1d1d;
			text-align:center;
		}
		#cghpCustomMenuHelp {
			position:relative;
			margin:10px auto 0 auto;
			padding:0;
			width:300px;
			-webkit-border-radius:5px;
			background:#333333;
			border:1px solid #444444;
		}
		#cghpCustomMenuHelp:after,
		#cghpCustomMenuHelp:before {
			position:absolute;
			bottom:100%;
			height:0;
			width:0;
			border:solid transparent;
			content:" ";
			pointer-events:none;
		}
		#cghpCustomMenuHelp:after {
			right:15%;
			margin-left:-10px;
			border-color:rgba(51, 51, 51, 0);
			border-bottom-color:#333333;
			border-width:10px;
		}
		#cghpCustomMenuHelp:before {
			right:15%;
			margin-left:-11px;
			border-color:rgba(68, 68, 68, 0);
			border-bottom-color:#444444;
			border-width:11px;
		}
		#cghpExpInfo {
			text-align:left;
			white-space:nowrap;
		}
		#cghpFlashMenu {
			margin:0 auto;
			padding:2px 0;
			width:320px;
			background-color:#1d1d1d;
			text-align:center;
		}
		#cghpCharOverlay,
		#cghpLoadingCharOverlay,
		#cghpSettingOverlay {
			position:absolute;
			top:0;
			left:0;
			margin:0;
			padding:0;
			z-index:100;
			width:100%;
			height:3000px;
			background-color:rgba(0, 0, 0, 0.85);
			color:#ffffff;
		}
		#cghpCharArea,
		#cghpLoadingCharArea {
			position:absolute;
			left:0;
			top:0;
			margin:0;
			padding:10px 0 0 0;
			width:100%;
			text-align:center;
		}
		#cghpCharArea .cghp_gray_area {
			display:block;
			margin:0 auto 10px auto;
			width:320px;
			text-decoration:none;
			color:#ffffff;
		}
		#cghpCharImg1,
		#cghpCharImg2 {
			min-width:320px;
			max-width:100%;
		}
		#cghpSettingOverlay input[type="text"] {
			-webkit-box-sizing:border-box;
			-moz-box-sizing:border-box;
			box-sizing:border-box;
			width:300px;
			-ms-box-sizing:border-box;
			ime-mode:disabled;
		}
		#cghpSettingArea {
			-webkit-box-sizing:border-box;
			-moz-box-sizing:border-box;
			box-sizing:border-box;
			margin:0 auto;
			padding:10px;
			width:320px;
			-ms-box-sizing:border-box;
		}
		#cghpSettingArea h2 {
			font-size:1.4rem;
		}
		#cghpSettingArea p {
			margin-top:5px;
		}
		#cghpSettingArea section {
			width:100%;
		}
		#cghpSettingButton {
			background:-moz-linear-gradient(top, #993333 0%, #661d1d 50%, #993333 100%);
			background:-webkit-gradient(linear, left top, left bottom, color-stop(0%, #993333), color-stop(50%, #661d1d), color-stop(100%, #993333));
		}
		#cghpSettingButton:hover {
			background:-moz-linear-gradient(top, #cc6666 0%, #993333 50%, #cc6666 100%);
			background:-webkit-gradient(linear, left top, left bottom, color-stop(0%, #cc6666), color-stop(50%, #993333), color-stop(100%, #cc6666));
		}
		#cghpSettingLink {
			display:block;
			cursor:pointer;
		}
		#cghpResetArea {
			padding-top:150%;
		}
		.cghp_center {
			margin-right:auto !important;
			margin-left:auto !important;
			text-align:center !important;
		}
		.cghp_cm_help_link {
			margin:0;
			color:#ffffff;
			line-height:1;
		}
		.cghp_cm_help_list {
			margin:0;
			padding:5px;
		}
		.cghp_cm_help_list a {
			display:block;
			margin:2px;
			padding:5px;
			color:#ffffff;
			font-size:8pt;
			border:1px;
		}
		.cghp_cm_help_list a:active,
		.cghp_cm_help_list a:hover {
			background-color:#666666;
		}
		.cghp_cm_help_list li {
			display:inline-block;
			-webkit-box-sizing:border-box;
			-moz-box-sizing:border-box;
			box-sizing:border-box;
			margin:0;
			padding:0;
			width:96px;
			-ms-box-sizing:border-box;
		}
		.cghp_font_120pct {
			font-size:120% !important;
		}
		.cghp_gray_area {
			-webkit-box-sizing:border-box;
			-moz-box-sizing:border-box;
			box-sizing:border-box;
			margin:0 10px;
			padding:5px 10px;
			width:300px;
			-ms-box-sizing:border-box;
			border:1px solid #444444;
			-webkit-border-radius:5px;
			background-color:#333333;
			line-height:1.4;
		}
		.cghp_hide {
			display:none !important;
		}
		.cghp_ime_disabled {
			ime-mode:disabled !important;
		}
		.cghp_icon {
			font-size:15px;
		}
		.cghp_icon_area {
			margin:0 auto;
			padding-top:5px;
			padding-bottom:3px;
			height:15px;
		}
		.cghp_idol_table {
			border-collapse:separate !important;
			border-spacing:0px !important;
			border-color:gray !important;
			line-height:1.4 !important;
		}
		.cghp_idol_table td:first-child,
		.cghp_idol_table td:first-child > img {
			width:75px !important;
		}
		.cghp_idol_table td:nth-of-type(2) > img {
			vertical-align:top !important;
		}
		.cghp_idol_table ~ div:first-child {
			line-height:1.4 !important;
		}
		.cghp_idol_table + img[src="http://ava-a.mbga.jp/i/dot.gif"] {
			height:0 !important;
		}
		.cghp_link {
			cursor:pointer;
		}
		.cghp_margin_b0 {
			margin-bottom:0 !important;
		}
		.cghp_margin_b10 {
			margin-bottom:10px !important;
		}
		.cghp_margin_b15 {
			margin-bottom:15px !important;
		}
		.cghp_margin_b20 {
			margin-bottom:20px !important;
		}
		.cghp_margin_b5 {
			margin-bottom:5px !important;
		}
		.cghp_margin_t0 {
			margin-top:0 !important;
		}
		.cghp_margin_t10 {
			margin-top:10px !important;
		}
		.cghp_margin_t15 {
			margin-top:15px !important;
		}
		.cghp_margin_t20 {
			margin-top:20px !important;
		}
		.cghp_margin_t5 {
			margin-top:5px !important;
		}
		.cghp_menu_list {
			display:-moz-box;
			display:-webkit-box;
			margin:0;
			padding:0;
			width:320px;
		}
		.cghp_menu_list a {
			display:block;
			border:1px solid #444444;
			-webkit-border-radius:5px;
			background-color:#333333;
			color:#ffffff;
			text-align:center;
			text-decoration:none;
			text-shadow:0 0 2px #533713, 1px 1px 1px #1d1d1d;
		}
		.cghp_menu_list a:active,
		.cghp_menu_list a:hover {
			background-color:#666666;
		}
		.cghp_menu_list li {
			overflow:hidden;
			-webkit-box-sizing:border-box;
			-moz-box-sizing:border-box;
			box-sizing:border-box;
			margin:1px;
			padding:0;
			width:320px;
			-moz-box-flex:1;
			-ms-box-sizing:border-box;
			-webkit-box-flex:1;
			font-weight:bold;
			font-size:8pt !important;
			line-height:1 !important;
		}
		.cghp_menu_list li:first-child {
			margin-left:0;
		}
		.cghp_menu_list li:last-child {
			margin-right:0;
		}
		.cghp_name_area {
			padding-bottom:5px;
		}
		.cghp_no_icon {
			padding:8px 0;
		}
		.cghp_idol_detail_td {
			vertical-align:top;
		}
		.cghp_idol_detail_div {
			position:relative;
		}
		.cghp_idol_detail_div > .cghp_gray_area {
			display:block;
			position:absolute;
			top:0;
			right:0;
			margin:0;
			padding:5px;
			width:110px;
			color:#ffffff;
			text-align:left;
			text-decoration:none;
			border-right:none;
			-webkit-border-top-right-radius:0;
			-webkit-border-bottom-right-radius:0;
			line-height:1.2;
		}
		.cghp_overlay a,
		.cghp_overlay input,
		.cghp_overlay select {
			visibility:hidden !important;
		}
		.cghp_show {
			display:"" !important;
		}
		.cghp_star_gray::after {
			content:"★";
			font-size:10px;
			color:#666666;
			text-shadow:0 0 2px #533713, 1px 1px 1px #1d1d1d;
			font-style:normal;
		}
		.cghp_star_yellow::after {
			content:"★";
			font-size:10px;
			color:#ffcc00;
			text-shadow:0 0 2px #533713, 1px 1px 1px #1d1d1d;
		}
		.cghp_strike {
			text-decoration:line-through;
		}
		.cghp_width160 {
			width:160px !important;
		}
		.cghp_width240 {
			width:240px !important;
		}
		.cghp_width300 {
			width:300px !important;
		}
		.cghp_width320 {
			width:320px !important;
		}
		.menu_colse #cghpCustomMenu {
			display:none;
		}
		.menu_open #cghpCustomMenu {
			display:"";
		}

		*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

		var style = $create('style');
		style.type = 'text/css';
		style.innerHTML = css;
		insertToHead(style);
	})();

	// -------------------------------------------------------------------------
	// アイコン用CSS読み込み
	// -------------------------------------------------------------------------
	(function() {
		if (_settings.customMenuIcon) {
			// Font Awesome (http://fortawesome.github.com/Font-Awesome/)
			var link = $create('link');
			link.href = '//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css';
			link.rel = 'stylesheet';
			insertToHead(link);
		}
	})();

	// -------------------------------------------------------------------------
	// メニュー内のバナーを非表示にする
	// -------------------------------------------------------------------------
	(function() {
		if (_settings.hideBannerInMenu) {
			var headerAccordion = $id('headerAccordion');
			if (headerAccordion) {
				var bannerDiv = headerAccordion.querySelector('div.bannerArea2');
				if (bannerDiv) {
					bannerDiv.style.display = 'none';
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// カスタムメニュー生成
	// -------------------------------------------------------------------------
	var _customMenu = [];
	_customMenu[1] = { 'fullName': 'ショップ', 'shortName': 'ｼｮｯﾌﾟ', 'icon': 'icon-shopping-cart', 'url': _baseURL + 'shop%2Findex' };
	_customMenu[2] = { 'fullName': 'アイテム', 'shortName': 'ｱｲﾃﾑ', 'icon': 'icon-coffee', 'url': _baseURL + 'item%2Findex' };
	_customMenu[3] = { 'fullName': '贈り物', 'shortName': '贈り物', 'icon': 'icon-gift', 'url': _baseURL + 'present%2Frecieve%2F%3Fview_auth_type%3D1' };
	_customMenu[4] = { 'fullName': 'ｱｲﾄﾞﾙ一覧', 'shortName': '一　覧', 'icon': 'icon-list-alt', 'url': _baseURL + 'card_list%2Findex' };
	_customMenu[5] = { 'fullName': 'トレード', 'shortName': 'ﾄﾚｰﾄﾞ', 'icon': 'icon-refresh', 'url': _baseURL + 'trade_response%2Ftrade_list_advance' };
	_customMenu[6] = { 'fullName': '編　成', 'shortName': '編　成', 'icon': 'icon-group', 'url': _baseURL + 'deck%2Findex' };
	_customMenu[7] = { 'fullName': 'メダル交換', 'shortName': '交　換', 'icon': 'icon-exchange', 'url': _baseURL + 'exchange%2Fmedal_list%2F999999' };
	_customMenu[8] = { 'fullName': '女子寮', 'shortName': '女子寮', 'icon': 'icon-home', 'url': _baseURL + 'card_storage%2Findex' };
	_customMenu[9] = { 'fullName': '衣　装', 'shortName': '衣　装', 'icon': 'icon-female', 'url': _baseURL + 'rareparts%2Findex' };
	_customMenu[10] = { 'fullName': 'お気に入り', 'shortName': 'ｵｷﾆｲﾘ', 'icon': 'icon-heart', 'url': _baseURL + 'friend%2Findex' };
	_customMenu[11] = { 'fullName': 'ホシイモノ', 'shortName': 'ﾎｼｲﾓﾉ', 'icon': 'icon-tags', 'url': _baseURL + 'wish%2Findex' };
	_customMenu[12] = { 'fullName': 'アルバム', 'shortName': 'ｱﾙﾊﾞﾑ', 'icon': 'icon-book', 'url': _baseURL + 'archive%2Findex' };
	_customMenu[13] = { 'fullName': 'PRA', 'shortName': 'PRA', 'icon': 'icon-trophy', 'url': _baseURL + 'p_ranking_award' };
	_customMenu[14] = { 'fullName': 'PRA(個人)', 'shortName': 'PRA個', 'icon': 'icon-trophy', 'url': _baseURL + 'p_ranking_award%2Franking_for_user%2F0%2F1' };
	_customMenu[15] = { 'fullName': 'PRA(プロ)', 'shortName': 'PRAプ', 'icon': 'icon-trophy', 'url': _baseURL + 'p_ranking_award%2Franking_for_production%2F0%2F1' };
	_customMenu[16] = { 'fullName': '設　定', 'shortName': '設　定', 'icon': 'icon-cog', 'url': _baseURL + 'personal_option' };
	_customMenu[17] = { 'fullName': 'ヘルプ', 'shortName': 'ヘルプ', 'icon': 'icon-question-sign', 'url': _baseURL + 'advise%2Findex%2Ftop' };
	_customMenu[18] = { 'fullName': 'トップ', 'shortName': 'トップ', 'icon': 'icon-star', 'url': _topURL };
	_customMenu[19] = { 'fullName': '特　訓', 'shortName': '特　訓', 'icon': 'icon-music', 'url': _baseURL + 'card_union%3Fl_frm%3DMypage_2%26' };
	_customMenu[20] = { 'fullName': '移　籍', 'shortName': '移　籍', 'icon': 'icon-remove', 'url': _baseURL + 'card_sale%2Findex' };
	_customMenu[21] = { 'fullName': 'お仕事', 'shortName': 'お仕事', 'icon': 'icon-calendar', 'url': _baseURL + 'quests' };
	_customMenu[22] = { 'fullName': 'LIVEバトル', 'shortName': 'LIVE', 'icon': 'icon-bolt', 'url': _baseURL + 'battle' };
	_customMenu[23] = { 'fullName': 'ﾌﾟﾛﾀﾞｸｼｮﾝ', 'shortName': 'プ　ロ', 'icon': 'icon-building', 'url': _baseURL + 'knights%2Fknights_top_for_member' };
	_customMenu[24] = { 'fullName': 'プロ掲示板', 'shortName': '掲示板', 'icon': 'icon-comments', 'url': _baseURL + 'knights%2Fbbs' };
	_customMenu[25] = { 'fullName': 'イベント', 'shortName': 'ｲﾍﾞﾝﾄ', 'icon': 'icon-flag', 'url': _settings.eventURL };
	_customMenu[26] = { 'fullName': '道　場', 'shortName': '道　場', 'icon': 'icon-list-ol', 'url': _settings.dojoURL };
	_customMenu[101] = { 'fullName': 'カスタム1', 'shortName': 'ｶｽﾀﾑ1', 'icon': 'icon-cogs', 'url': _settings.customURL1 };
	_customMenu[102] = { 'fullName': 'カスタム2', 'shortName': 'ｶｽﾀﾑ2', 'icon': 'icon-cogs', 'url': _settings.customURL2 };
	_customMenu[103] = { 'fullName': 'カスタム3', 'shortName': 'ｶｽﾀﾑ3', 'icon': 'icon-cogs', 'url': _settings.customURL3 };
	_customMenu[104] = { 'fullName': 'カスタム4', 'shortName': 'ｶｽﾀﾑ4', 'icon': 'icon-cogs', 'url': _settings.customURL4 };
	_customMenu[105] = { 'fullName': 'カスタム5', 'shortName': 'ｶｽﾀﾑ5', 'icon': 'icon-cogs', 'url': _settings.customURL5 };

	(function() {
		var headerNavi = $id('headerNavi');
		if (headerNavi) {
			var customMenu = [];
			var customMenu1Len = _settings.customMenu1.length||0;
			if (0 < customMenu1Len) {
				customMenu.push('<ul id="cghpCustomMenuList1" class="cghp_menu_list">');
				for (var i = 0; i < customMenu1Len; i++) {
					var menuIndex = _settings.customMenu1[i];
					customMenu.push('<li>');
					if (_customMenu[menuIndex]) {
						var menu = _customMenu[menuIndex];
						var name = (customMenu1Len < 6) ? menu.fullName : menu.shortName;
						if (_settings.customMenuIcon) {
							customMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' cghp_icon"></i></div><div class="cghp_name_area">' + name + '</div></a>');
						} else {
							customMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + name + '</a>');
						}
					}
					customMenu.push('</li>');
				}
				customMenu.push('</ul>');
			}

			var customMenu2Len = _settings.customMenu2.length||0;
			if (0 < customMenu2Len) {
				customMenu.push('<ul id="cghpCustomMenuList2" class="cghp_menu_list">');
				for (var i = 0; i < customMenu2Len; i++) {
					var menuIndex = _settings.customMenu2[i];
					customMenu.push('<li>');
					if (_customMenu[menuIndex]) {
						var menu = _customMenu[menuIndex];
						var name = (customMenu2Len < 6) ? menu.fullName : menu.shortName;
						if (_settings.customMenuIcon) {
							customMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' cghp_icon"></i></div><div class="cghp_name_area">' + name + '</div></a>');
						} else {
							customMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + name + '</a>');
						}
					}
					customMenu.push('</li>');
				}
				customMenu.push('</ul>');
			}

			var customMenu3Len = _settings.customMenu3.length||0;
			if (0 < customMenu3Len) {
				customMenu.push('<ul id="cghpCustomMenuList3" class="cghp_menu_list">');
				for (var i = 0; i < customMenu3Len; i++) {
					var menuIndex = _settings.customMenu3[i];
					customMenu.push('<li>');
					if (_customMenu[menuIndex]) {
						var menu = _customMenu[menuIndex];
						var name = (customMenu3Len < 6) ? menu.fullName : menu.shortName;
						if (_settings.customMenuIcon) {
							customMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' cghp_icon"></i></div><div class="cghp_name_area">' + name + '</div></a>');
						} else {
							customMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + name + '</a>');
						}
					}
					customMenu.push('</li>');
				}
				customMenu.push('</ul>');
			}

			var customMenuDiv = $create('div');
			customMenuDiv.id = 'cghpCustomMenu';
			customMenuDiv.innerHTML = customMenu.join('');

			headerNavi.parentElement.insertBefore(customMenuDiv, headerNavi.nextSibling);
		}
	})();

	// -------------------------------------------------------------------------
	// 贈り物拡張
	// -------------------------------------------------------------------------
	(function() {
		if (/%2Fpresent%2Frecieve%2F/.test(_param)) {
			// 贈り物のチェックを外す
			if (_settings.uncheckedGift = 1) {
				var checkLink = $id('chks_change');
				if (checkLink) {
					dispatchClick(checkLink);
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// フロントメンバー編成拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fdeck%2Fdeck_edit_top%3F/).test(_param)) {
			// 編成リンク追加
			var atkFormationLink = $create('a');
			atkFormationLink.className = 'a_link';
			atkFormationLink.href = _baseURL + 'deck%2Fdeck_modify_card%3Fno%3D1%26type%3D0';
			atkFormationLink.innerHTML = '攻ﾌﾛﾝﾄ追加';

			var defFormationLink = $create('a');
			defFormationLink.className = 'a_link';
			defFormationLink.href = _baseURL + 'deck%2Fdeck_modify_card%3Fno%3D1%26type%3D1';
			defFormationLink.innerHTML = '守ﾌﾛﾝﾄ追加';

			var space1 = _doc.createTextNode(' ');
			var space2 = _doc.createTextNode(' ');

			var targetLink = _content.querySelectorAll('a.a_link');
			var targetLinkLen = targetLink.length||0;
			for (var i = 0; i < targetLinkLen; i++) {
				var link = targetLink[i];
				var linkHTML = link.innerHTML;
				if ((/攻編成/).test(linkHTML)) {
					link.parentElement.insertBefore(atkFormationLink, link);
					link.parentElement.insertBefore(space1, link);
				} else if ((/守編成/).test(linkHTML)) {
					link.parentElement.insertBefore(defFormationLink, link.nextSibling);
					link.parentElement.insertBefore(space2, link.nextSibling);
				}
			}

			var targetSpan = _content.querySelectorAll('span.a_link');
			var targetSpanLen = targetSpan.length||0;
			for (var i = 0; i < targetSpanLen; i++) {
				var span = targetSpan[i];
				var spanHTML = span.innerHTML;
				if ((/攻編成/).test(spanHTML)) {
					span.parentElement.insertBefore(atkFormationLink, span);
					span.parentElement.insertBefore(space1, span);
				} else if ((/守編成/).test(spanHTML)) {
					span.parentElement.insertBefore(defFormationLink, span.nextSibling);
					span.parentElement.insertBefore(space2, span.nextSibling);
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 所属アイドル一覧拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fcard_list(?:%2F|%3F)/).test(_param) || (/%2Fdeck%2Fdeck_modify_card(?:%2F|%3F)/).test(_param)) {
			// 編成リンク追加
			var actionLink = [];
			actionLink.push('<a href="' + _baseURL + 'deck%2Fdeck_modify_card%3Fno%3D1%26type%3D0" class="a_link">攻ﾌﾛﾝﾄ追加</a>');
			actionLink.push('<a href="' + _baseURL + 'deck%2Fdeck_edit_top%3Ftype%3D0" class="a_link">攻編成</a>');
			actionLink.push('<a href="' + _baseURL + 'deck%2Fdeck_edit_top%3Ftype%3D1" class="a_link">守編成</a>');
			actionLink.push('<a href="' + _baseURL + 'deck%2Fdeck_modify_card%3Fno%3D1%26type%3D1" class="a_link">守ﾌﾛﾝﾄ追加</a>');

			var targetDiv1 = _content.querySelector('ul.tab_link');
			if (targetDiv1) {
				var formationDiv = $create('div');
				formationDiv.className = 'cghp_center';
				formationDiv.innerHTML = actionLink.join(' ');
				targetDiv1.parentElement.insertBefore(formationDiv, targetDiv1.nextSibling);
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 各種アイドル一覧拡張
	// @note 所属アイドル一覧、移籍、女子寮、レッスン、特訓、フリートレード、
	//       メダル交換、各種ユニット編成画面
	// -------------------------------------------------------------------------
	(function() {
		if ((/(?:%2F|%3F)(:?card_(?:list|sale|storage|str|union)|auction|exchange|deck)(?:%2F|%3F)/).test(_param) && _content) {
			// 発揮値（コスト比）の表示や各種リンクの追加
			var extractNum = function (val) {
				return (val) ? parseInt(val.replace(/[^0-9]/, '')) : null;
			};
			// アイドルを取得（アイドル名のブロックを基準とする）
			var targetDiv = _content.querySelectorAll('div.title_sub_blue, div.title_sub_gray, div[style*="background-color:#333333;"]');
			var targetDivLen = targetDiv.length||0;
			var idolCount = 0;
			for (var i = 0; i < targetDivLen; i++) {
				var nameDiv = targetDiv[i];
				var idol = { 'id': null, 'name': null, 'attribute': null, 'rarity': null, 'cost': null, 'attack': null, 'defense': null, 'skilLv': null };

				// IDの取得
				var nameAreaElement = nameDiv;
				var nameDivParent = nameDiv.parentNode;
				if (nameDivParent && nameDivParent.tagName == 'A') {
					nameAreaElement = nameDivParent;
					idol.id = (nameDivParent.href.match(/%2Fcard_list%2Fdesc%2F(\d+)/)||[])[1]||null;
				}
				// 名前、属性、レアリティの取得（名前ブロックから）
				var nameElements = (nameDiv.textContent.match(/(ﾊﾟｯｼｮﾝ|ｷｭｰﾄ|ｸｰﾙ)[\s\t\r\n]+([^\s\t\r\n]+)[\s\t\r\n]+(\([^\s\t\r\n]+\))/)||null);
				if (nameElements && nameElements.length == 4) {
					idol.attribute = nameElements[1];
					idol.name = nameElements[2];
					idol.rarity = nameElements[3];
				} else {
					// 上記が取得出来ない場合は大概失敗なので飛ばす
					continue;
				}
				// 各種情報を取得する基準としてクラス名を付ける（Android2系への暫定対応）
				// コスト、攻発揮値、守発揮値の取得（名前ブロックの次のテーブル）
				var statusTable = nameAreaElement.nextElementSibling;
				if (statusTable && statusTable.tagName == 'TABLE') {
					var statusTableLabel = statusTable.querySelectorAll('span.blue');
					var statusTableLabelLen = statusTableLabel.length||0;
					for (var j = 0; j < statusTableLabelLen; j++) {
						var label = statusTableLabel[j];
						var labelText = label.textContent;
						if ((/ｺｽﾄ:/).test(labelText)) {
							idol.cost = extractNum(label.nextSibling.textContent);
						} else if ((/攻:/).test(labelText)) {
							idol.attack = extractNum(label.nextSibling.textContent);
						} else if ((/守:/).test(labelText)) {
							idol.defense = extractNum(label.nextSibling.textContent);
						}
					}
				}
				// 特技Lvの取得（ステータステーブルの次のDIV）
				var statusDiv = statusTable.nextElementSibling;
				// 余白用の画像と改行がある場合はその分飛ばす
				if (statusDiv && statusDiv.tagName == 'IMG' && statusDiv.src == 'http://ava-a.mbga.jp/i/dot.gif') {
					statusDiv = statusDiv.nextElementSibling.nextElementSibling; // br -> div
				}
				if (statusDiv && statusDiv.tagName == 'DIV') {
					var statusDivLabel = statusDiv.querySelectorAll('span.blue');
					var statusDivLabelLen = statusDivLabel.length||0;
					for (var j = 0; j < statusDivLabelLen; j++) {
						var label = statusDivLabel[j];
						var labelText = label.textContent;
						if ((/特技Lv:/).test(labelText)) {
							idol.skilLv = extractNum(label.nextSibling.textContent);
							break;
						}
					}
				} else {
					statusDiv = null;
				}
				// コストあたりの発揮値、特技レベルの表示、相場リンク追加
				if (statusTable && isNumeric(idol.cost) && isNumeric(idol.attack) && isNumeric(idol.defense)) {
					var targetTr = statusTable.querySelector('tr');
					if (targetTr) {
						// 発揮値計算
						var attackRatio = round(idol.attack / idol.cost, 1);
						var defenseRatio = round(idol.defense / idol.cost, 1);
						// 特技レベル
						var abilityText = '';
						var ability = idol.skilLv||0;
						for (var j = 0; j < 10; j++) {
							if (j < ability) {
								abilityText += '<i class="cghp_star_yellow"></i>';
							} else {
								abilityText += '<i class="cghp_star_gray"></i>';
							}
						}
						// 相場リンク
						var marketPriceUrl = 'javascript:void(0);';
						if (idol.name && idol.attribute && idol.rarity) {
							var encName = encodeURIComponent(idol.name);
							var attribute = { 'ｷｭｰﾄ': '1', 'ｸｰﾙ': '2', 'ﾊﾟｯｼｮﾝ': '3' };
							var attributeId = (idol.attribute in attribute) ? attribute[idol.attribute] : '';
							var rarity = { '(ﾉｰﾏﾙ)': '1', '(ﾉｰﾏﾙ+)': '2', '(ﾚｱ)': '3', '(ﾚｱ+)': '4', '(Sﾚｱ)': '5', '(Sﾚｱ+)': '6' };
							var rarityId = (idol.rarity in rarity) ? rarity[idol.rarity] : '';
							var marketPriceUrl = 'http://mobile-trade.jp/fun/idolmaster/bazaar.php?' +
								'_name=' + encName + '&' +
								'attribute=' + attributeId + '&' +
								'rarity=' + rarityId + '&' +
								'cost_min=' + idol.cost + '&' +
								'cost_max=' + idol.cost;
						}
						// 要素の生成
						var ratioTd = $create('td');
						ratioTd.className = 'cghp_idol_detail_td';
						var ratioDiv = ratioTd.appendChild($create('div'));
						ratioDiv.className = 'cghp_idol_detail_div';
						var marketPriceLink = ratioDiv.appendChild($create('a'));
						marketPriceLink.className = 'cghp_gray_area';
						marketPriceLink.target = '_blank';
						marketPriceLink.href = marketPriceUrl;
						marketPriceLink.innerHTML = '<span class="blue">攻比:</span>' + attackRatio + '<br />' +
							'<span class="blue">守比:</span>' + defenseRatio + '<br />' + abilityText;
						targetTr.appendChild(ratioTd);
					}
				}
				// リーダー選択リンク追加＠所属アイドル一覧
				if ((/%2Fcard_list(?:%2F|%3F)/).test(_param) || (/%2Fdeck%2Fdeck_modify_card(?:%2F|%3F)/).test(_param)) {
					if (idol.id && !$hasClass(nameDiv, 'title_sub_blue')) {
						var targetElement = (statusDiv||statusTable).nextSibling;
						if (targetElement) {
							var setLeaderDiv = $create('div');
							setLeaderDiv.className = 'moreButton right_float cghp_margin_t10';
							setLeaderDiv.innerHTML = ('<a href="' + _baseURL + 'card_list%2Fset_leader%2F' + idol.id + '">ﾘｰﾀﾞｰにする</a>');
							targetElement.parentElement.insertBefore(setLeaderDiv, targetElement);
						}
					}
				}

				// 画面レイアウトの調整
				$addClass(statusTable, 'cghp_margin_b5 cghp_idol_table');
				if ((/%2F(?:card_storage|auction|exchange)(?:%2F|%3F)/).test(_param)) {
					// 女子寮、トレード、メダル交換画面
					$addClass(nameDiv, 'title_sub_gray');
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// アイドル詳細拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fcard_list%2Fdesc%2F/).test(_param)) {
			// 親愛度MAX演出再生
			var idolID = (_param.match(/%2Fcard_list%2Fdesc%2F(\d+)/)||[])[1]||null;
			if (idolID != null) {
				var targetDiv = _content.querySelectorAll('div.status');
				var targetDivLen = targetDiv.length||0;
				for (var i = 0; i < targetDivLen; i++) {
					var statusArea = targetDiv[i];
					var isLoveMax = false;
					var statusName = statusArea.querySelectorAll('span.blue');
					var statusNameLen = statusName.length||0;
					for (var i = 0; i < statusNameLen; i++) {
						var name = statusName[i];
						if ((/親愛度/).test(name.textContent)) {
							var intimacyText = name.nextSibling.nodeValue;
							if (intimacyText) {
								var intimacy = intimacyText.split('/');
								if (1 < intimacy.length && intimacy[0] === intimacy[1]) {
									isLoveMax = true;
									break;
								}
							}
						}
					}
					if (isLoveMax) {
						var loveFlashURL = _baseURL + 'love%2Fflash%2F' + idolID;
						var loveFlashArea = $create('p');
						loveFlashArea.className = 'start_button cghp_width300 cghp_font_120pct cghp_margin_b10';
						loveFlashArea.style = 'width:300px; font-size:120%;';
						loveFlashArea.innerHTML = '<a href="' + loveFlashURL + '">親愛度MAX演出再生</a>';
						statusArea.parentElement.insertBefore(loveFlashArea, statusArea.nextSibling);
						break;
					}
				}
			}

			// 移籍ボタンを無効化
			var targetLink = _content.querySelectorAll('a.grayButton300');
			var targetLinkLen = targetLink.length||0;
			for (var i = 0; i < targetLinkLen; i++) {
				var link = targetLink[i];
				if ((/このｱｲﾄﾞﾙを移籍/).test(link.textContent)) {
					link.style.display = 'none';
					break;
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 女子寮拡張＠入寮
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fcard_storage%2Fpush_index%2F/).test(_param)) {
			var targetDiv = _content.querySelector('div.title_hanyo.area_name');
			if (targetDiv) {
				var storageNo = (_param.match(/%2Fpush_index%2F(?:\d+)%2F(?:\d+)%2F(?:\d+)%2F(?:\d+)%2F(\d+)/)||[])[1]||null;
				var button = $create('input');
				button.className = 'cghp_margin_b5';
				button.type = 'submit';
				button.value =  '第' + storageNo + '女子寮に一括で入寮させる';
				$bind(button, 'click', function() {
					var targetForm = _content.querySelector('form[name="sell_form"]');
					if (targetForm) {
						targetForm.submit();
					}
					return false;
				});
				targetDiv.parentElement.insertBefore(button, targetDiv);
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 女子寮拡張＠呼び出し
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fcard_storage%2Fpop_index%2F/).test(_param)) {
			var targetDiv = _content.querySelector('div.title_hanyo.area_name');
			if (targetDiv) {
				var button = $create('input');
				button.className = 'cghp_margin_b5';
				button.type = 'submit';
				button.value =  '一括で呼び戻す';
				$bind(button, 'click', function() {
					targetForm = _content.querySelector('form[name="sell_form"]');
					if (targetForm) {
						targetForm.submit();
					}
					return false;
				});
				targetDiv.parentElement.insertBefore(button, targetDiv);
			}
		}
	})();

	// -------------------------------------------------------------------------
	// レッスン拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fcard_str%2Fflash%3F/).test(_param)) {
			var flashMenuList = [
				{ 'name': 'マイスタジオ', 'icon': 'icon-headphones', 'url': _baseURL + 'mypage' },
				{ 'name': 'ｱｲﾄﾞﾙ一覧', 'icon': 'icon-list-alt', 'url': _baseURL + 'card_list%2Findex' },
				{ 'name': '女子寮', 'icon': 'icon-home', 'url': _baseURL + 'card_storage%2Findex' },
				{ 'name': '戻　る', 'icon': 'icon-undo', 'url': _baseURL + 'card_str' }
			];

			var flashMenu = [];

			flashMenu.push('<ul class="cghp_menu_list">');
			var flashMenuListLen = flashMenuList.length||0;
			for (var i = 0; i < flashMenuListLen; i++) {
				var menu = flashMenuList[i];
				flashMenu.push('<li>');
				if (_settings.customMenuIcon) {
					flashMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' cghp_icon"></i></div><div class="cghp_name_area">' + menu.name + '</div></a>');
				} else {
					flashMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + menu.name + '</a>');
				}
				flashMenu.push('</li>');
			}
			flashMenu.push('</ul>');

			var menu = $create('div');
			menu.id = 'cghpFlashMenu';
			menu.innerHTML = flashMenu.join('');
			_body.insertBefore(menu, _body.firstChild);
		}
	})();

	// -------------------------------------------------------------------------
	// Liveバトル拡張＠Live前
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fbattles%2Fbattle_check%2F/).test(_param)) {
			// LIVE消費攻コスト上限
			var targetDiv = _content.querySelectorAll('div');
			var targetDivLen = targetDiv.length||0;
			for (var i = 0; i < targetDivLen; i++) {
				var div = targetDiv[i];
				var divText = div.textContent;
				var matches = divText.match(/攻ｺｽﾄ:(\d+)\s*⇒\s*(\d+)/);
				if (matches) {
					var setAttackCostLimitArea = $create('div');
					setAttackCostLimitArea.className = 'cghp_center cghp_gray_area cghp_margin_t10 cghp_margin_b10';
					var setAttackCostLimit = [];
					setAttackCostLimit.push('消費攻ｺｽﾄ上限値：');
					setAttackCostLimit.push('<input id="cghpAttackCostLimit" type="text" size="4" maxlength="4" value="' + _settings.attackCostLimit + '" />');
					setAttackCostLimit.push('&nbsp;&nbsp;');
					setAttackCostLimit.push('<a id="cghpSetAttackCostLimit" class="a_link cghp_margin_t0 cghp_margin_b0">O K</a>');
					setAttackCostLimitArea.innerHTML = setAttackCostLimit.join('');
					div.parentElement.insertBefore(setAttackCostLimitArea, div.nextSibling);

					var setAttackCostButton = $id('cghpSetAttackCostLimit');
					$bind(setAttackCostButton, 'click', function() {
						var limit = $id('cghpAttackCostLimit');
						if (limit) {
							var value = parseInt(limit.value);
							if (isNumeric(value) && (/\d+/).test(value)) {
								setValue('cghp_atack_cost_limit', value);
								_location.reload();
							} else {
								alert('整数を入力してください。');
							}
						}
					});

					if (0 < _settings.attackCostLimit) {
						var beforeCost = parseInt(matches[1] || 0);
						var afterCost = parseInt(matches[2] || 0);
						if (isNumeric(beforeCost) && isNumeric(afterCost)) {
							var cost = beforeCost - afterCost;
							if (_settings.attackCostLimit < cost) {
								var targetButton = _content.querySelectorAll('input[type="submit"]');
								var targetButtonLen = targetButton.length||0;
								for (var i = 0; i < targetButtonLen; i++) {
									var button = targetButton[i];
									if ((/(?:LIVEﾊﾞﾄﾙ|ﾘﾊｰｻﾙ)開始/).test(button.value)) {
										var form = button.parentNode;
										form.style.display = 'none';
										var disabledMessage = $create('div');
										disabledMessage.className = 'gray cghp_center cghp_margin_t20 cghp_margin_b20';
										disabledMessage.innerHTML = 'LIVEﾊﾞﾄﾙとかむーりぃー…';
										form.parentElement.insertBefore(disabledMessage, form);
									}
								}
							}
						}
						break;
					}
				}
			}

			// リンク追加
			var enemyID = (_param.match(/%2Fbattles%2Fbattle_check%2F(\d+)/)||[])[1]||null;
			if (enemyID != null) {
				var cheerLink = $create('a');
				cheerLink.className = 'a_link';
				cheerLink.href = _baseURL + 'cheer%2Findex%2F' + enemyID + '%2F1';
				cheerLink.innerHTML = '応　援';

				var closeTabLink = $create('a');
				closeTabLink.id = 'cghpCloseTab';
				closeTabLink.className = 'a_link';
				closeTabLink.innerHTML = '閉じる';
				$bind(closeTabLink, 'click', function() {
					(open('', '_self').opener = top).close();
				});

				var space1 = _doc.createTextNode(' ');
				var space2 = _doc.createTextNode(' ');

				var targetLink = _content.querySelectorAll('a.a_link');
				var targetLinkLen = targetLink.length||0;
				for (var i = 0; i < targetLinkLen; i++) {
					var link = targetLink[i];
					var linkText = link.textContent;
					if ((/ｽﾃｰｼﾞ衣装を狙う/).test(linkText)) {
						link.parentElement.insertBefore(cheerLink, link);
						link.parentElement.insertBefore(space1, link);
						link.parentElement.insertBefore(closeTabLink, link.nextSibling);
						link.parentElement.insertBefore(space2, link.nextSibling);
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// Liveバトル拡張＠Live中
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fbattles%2F(?:battle_processing|flash|win_or_lose)(?:%2F|%3F)/).test(_param)) {
			var enemyId = (_param.match(/(?:%3F|%26)(?:rnd|enemy_id)%3D(\d+)/)||[])[1]||null;
			if (enemyId != null) {

				var flashMenuList = [
					{ 'name': 'ﾏｲｽﾀｼﾞｵ', 'icon': 'icon-headphones', 'url': _baseURL + 'mypage' },
					{ 'name': '相手ﾌﾟﾛﾌ', 'icon': 'icon-user', 'url': _baseURL + 'profile%2Fshow%2F' + enemyId },
					{ 'name': '道　場', 'icon': 'icon-list-ol', 'url': _settings.dojoURL },
					{ 'name': '戻　る', 'icon': 'icon-undo', 'url': _baseURL + 'battles%2Fbattle_check%2F' + enemyId }
				];

				var flashMenu = [];

				flashMenu.push('<ul class="cghp_menu_list">');
				var flashMenuListLen = flashMenuList.length||0;
				for (var i = 0; i < flashMenuListLen; i++) {
					var menu = flashMenuList[i];
					flashMenu.push('<li>');
					if (_settings.customMenuIcon) {
						flashMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' cghp_icon"></i></div><div class="cghp_name_area">' + menu.name + '</div></a>');
					} else {
						flashMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + menu.name + '</a>');
					}
					flashMenu.push('</li>');
				}
				flashMenu.push('<li>');
				if (_settings.customMenuIcon) {
					flashMenu.push('<a id="cghpCloseTab" class="cghp_link"><div class="cghp_icon_area"><i class="icon-remove cghp_icon"></i></div><div class="cghp_name_area">閉じる</div></a>');
				} else {
					flashMenu.push('<a id="cghpCloseTab" class="cghp_no_icon cghp_link">閉じる</a>');
				}
				flashMenu.push('</li>');
				flashMenu.push('</ul>');

				var menu = $create('div');
				menu.id = 'cghpFlashMenu';
				menu.innerHTML = flashMenu.join('');
				_body.insertBefore(menu, _body.firstChild);

				var cghpCloseTab = $id('cghpCloseTab');
				if (cghpCloseTab) {
					$bind(cghpCloseTab, 'click', function() {
						(open('', '_self').opener = top).close();
					});
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// レベルアップ計算＠通常お仕事(演出OFF)
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fquests%3Frnd%3D/).test(_param) || (/%2Fquests%2F(?:mission_list|get_\w+)(?:%2F|%3F)/).test(_param)) {
			var status = getWorkStatus(0);
			if (status) {
				var insertTarget = _content.querySelector('form[name="quest_form"]').nextSibling;
				var expInfoDiv = getExpInfo(status.currentHP, status.maxHP, status.currentExp, status.maxExp);
				if (expInfoDiv != null && insertTarget != null) {
					expInfoDiv.className = 'cghp_margin_t10 cghp_gray_area';
					insertTarget.parentElement.insertBefore(expInfoDiv, insertTarget);
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// レベルアップ計算＠各種イベント時お仕事(演出OFF)
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fevent_\w+%2F(?:mission_list|get_\w+)(?:%2F|%3F)/).test(_param)) {
			var status = getWorkStatus(0);
			if (status) {
				// 後方一致だとファイル名の後にゴミが付いていて拾えないからここだけ部分一致
				var insertTarget = _content.querySelector('img[src*="%2Fline_hoshi.jpg"]');
				var expInfoDiv = getExpInfo(status.currentHP, status.maxHP, status.currentExp, status.maxExp);
				if (expInfoDiv != null && insertTarget != null) {
					expInfoDiv.className = 'cghp_margin_t10 cghp_margin_b10 cghp_gray_area';
					insertTarget.parentElement.insertBefore(expInfoDiv, insertTarget);
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// レベルアップ計算＠お仕事全般(演出ON)
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2F(?:quests|event_\w+)%2Fwork(?:%2F|%3F)/).test(_param)) {
			var status = getWorkStatus(1);
			if (status) {
				var insertTarget = $id('play_area').nextSibling;
				var expInfoDiv = getExpInfo(status.currentHP, status.maxHP, status.currentExp, status.maxExp);
				if (expInfoDiv != null && insertTarget != null) {
					expInfoDiv.className = 'cghp_margin_b10 cghp_gray_area';
					insertTarget.parentElement.insertBefore(expInfoDiv, insertTarget);
				}
				// ステータス変化時に表示を更新
				var timer = 0;
				var targetArea = $id('get_condition');
				if (targetArea) {
					$bind(targetArea, 'DOMSubtreeModified', function() {
						if (timer) return;
						timer = setTimeout(function() {
							var status = getWorkStatus(1);
							if (status) {
								updateExpInfo(status.currentHP, status.maxHP, status.currentExp, status.maxExp);
							}
							timer = 0;
						}, 30);
					});
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// ステータスポイント振り分けフィルタ＠ポイント振り分けページ
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fbonus_point/).test(_param)) {
			var disabledMessage = '<div class="gray">振り分け無効</div>';

			if (!_settings.pointFilterHP) {
				$id('add_hp').parentNode.innerHTML = disabledMessage;
			}
			if (!_settings.pointFilterAtk) {
				$id('add_atk').parentNode.innerHTML = disabledMessage;
			}
			if (!_settings.pointFilterDef) {
				$id('add_def').parentNode.innerHTML = disabledMessage;
			}
			if (!_settings.pointFilterAuto) {
				var targetLink = _content.querySelectorAll('a.a_link');
				var targetLinkLen = targetLink.length||0;
				for (var i = 0; i < targetLinkLen; i++) {
					var link = targetLink[i];
					if ((/自動で割り振る/).test(link.innerHTML)) {
						link.parentNode.innerHTML = '<div class="gray">自動振り分け無効</div>';
						break;
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// ステータスポイント振り分けフィルタ＠通常お仕事
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fquests(?:$|%3Fl_frm%3D|%3Frnd%3D|%2Fmission_list(?:%2F|%3F))/).test(_param)) {
			if (!_settings.pointFilterAuto) {
				var targetLink = _content.querySelectorAll('a');
				var targetLinkLen = targetLink.length||0;
				for (var i = 0; i < targetLinkLen; i++) {
					var link = targetLink[i];
					if ((/↑自動で割り振る↑/).test(link.textContent)) {
						link.style.display = 'none';

						var div = $create('div');
						div.className = 'gray';
						div.textContent =  '自動振り分け無効';
						link.parentElement.insertBefore(div, link);
						break;
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// ランキング閲覧リンク生成＠各種イベント
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fevent_ranking%2Franking_top%3F/).test(_param)) {
			var targetLink =  _content.querySelectorAll('a');
			var targetLinkLen = targetLink.length||0;
			for (var i = 0; i < targetLinkLen; i++) {
				var link = targetLink[i];
				var linkHTML = link.innerHTML;
				if ((/個人順位確認/).test(linkHTML)) {
					var baseLink1 = link.href;
					var rankingList1 = [200, 1000, 2000, 4000, 7000];
					var rankingList1Len= rankingList1.length||0;
					var rankingLink1 = [];
					for (var j = 0; j < rankingList1Len; j++) {
						var rank1 = rankingList1[j];
						rankingLink1.push('<p class="frequentsButton eventFBColor_assault"><a href="');
						rankingLink1.push(baseLink1.replace('ranking_for_user%2F%3F', 'ranking_for_user%2F0%2F' + (rank1 - 3) + '%3F'));
						rankingLink1.push('"><span class="bgArrow">' + rank1 + '位ボーダー</span></a></p>');
					}
					rankingLink1.push('<p class="frequentsButton eventFBColor_assault"><a href="');
					rankingLink1.push(baseLink1.replace('ranking_for_user%2F%3F', 'ranking_for_user%2F2%3F'));
					rankingLink1.push('"><span class="bgArrow">プロダクション内個人順位</span></a></p>');

					rankingLink1.push('<div class="cghp_center cghp_gray_area cghp_margin_t10">指定順位表示：');
					rankingLink1.push('<input id="kojinRankInput" type="text" size="8" maxlength="8" style="width:70px;" /> 位 ');
					rankingLink1.push('<a id="kojinRankButton" class="a_link cghp_margin_t0 cghp_margin_b0">表示</a></div>');

					var div = $create('div');
					div.innerHTML = rankingLink1.join('');
					var linkParent = link.parentElement;
					linkParent.parentElement.insertBefore(div, linkParent.nextSibling);

					var kojinRankButton =$id('kojinRankButton');
					if (kojinRankButton) {
						$bind(kojinRankButton, 'click', function() {
							var kojinRankInput =$id('kojinRankInput');
							if (kojinRankInput) {
								var targetRank = parseInt(kojinRankInput.value);
								if (isNumeric(targetRank)) {
									var link = baseLink1.replace('ranking_for_user%2F%3F', 'ranking_for_user%2F0%2F' + (targetRank - 3) + '%3F');
									_location.href = link;
								}
							}
							return false;
						});
					}
				}
				if ((/ﾌﾟﾛﾀﾞｸｼｮﾝ順位確認/).test(linkHTML)) {
					var baseLink2 = link.href;
					var rankingList2 = [10, 50, 200, 500, 1000];
					var rankingList2Len= rankingList2.length||0;
					var rankingLink2 = [];
					for (var j = 0; j < rankingList2Len; j++) {
						var rank2 = rankingList2[j];
						rankingLink2.push('<p class="frequentsButton eventFBColor_assault"><a href="');
						rankingLink2.push(baseLink2.replace('ranking_for_production%2F%3F', 'ranking_for_production%2F0%2F' + (rank2 - 3) + '%3F'));
						rankingLink2.push('"><span class="bgArrow">' + rank2 + '位ボーダー</span></a></p>');
					}
					rankingLink2.push('<p class="frequentsButton eventFBColor_assault"><a href="');
					rankingLink2.push(baseLink2.replace('ranking_for_production%2F', 'ranking_for_production%2F1%2F'));
					rankingLink2.push('"><span class="bgArrow">所属プロダクション順位</span></a></p>');

					rankingLink2.push('<div class="cghp_center cghp_gray_area cghp_margin_t10">指定順位表示：');
					rankingLink2.push('<input id="proRankInput" type="text" size="8" maxlength="8" style="width:70px;" /> 位 ');
					rankingLink2.push('<a id="proRankButton" class="a_link cghp_margin_t0 cghp_margin_b0">表示</a></div>');

					var div = $create('div');
					div.innerHTML = rankingLink2.join('');
					var linkParent = link.parentElement;
					linkParent.parentElement.insertBefore(div, linkParent.nextSibling);

					var proRankButton =$id('proRankButton');
					if (proRankButton) {
						$bind(proRankButton, 'click', function() {
							var proRankInput =$id('proRankInput');
							if (proRankInput) {
								var targetRank = parseInt(proRankInput.value);
								if (isNumeric(targetRank)) {
									var link = baseLink2.replace('ranking_for_production%2F%3F', 'ranking_for_production%2F0%2F' + (targetRank - 3) + '%3F');
									_location.href = link;
								}
							}
							return false;
						});
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// メンバー編成＠アイドルLIVEツアー
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fevent_assault%2Fevent_deck_edit%3F/).test(_param)) {
			var unitNo = (_param.match(/(?:%3F|%26)type%3D(\d+)/)||[])[1]||null;
			if (unitNo != null) {
			var targetButton = _content.querySelectorAll('a.grayButton260');
			var targetButtonLen = targetButton.length||0;
				for (var i = 0; i < targetButtonLen; i++) {
					var button = targetButton[i];
					if ((/ﾕﾆｯﾄﾘｰﾀﾞｰ以外を解散/).test(button.textContent)) {
						var link = $create('a');
						link.className = 'grayButton260';
						link.href = _baseURL + 'event_assault%2Fdeck_modify_card%3Fno%3D%26type%3D' + unitNo;
						link.innerHTML = 'ﾒﾝﾊﾞｰを追加する';
						button.parentElement.insertBefore(link, button.nextSibling);
						break;
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// メンバー編成＠ドリームLIVEフェスティバル
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fevent_dream%2Fevent_deck_edit%3F/).test(_param)) {
			var targetButton = _content.querySelectorAll('a.grayButton300');
			var targetButtonLen = targetButton.length||0;
			for (var i = 0; i < targetButtonLen; i++) {
				var button = targetButton[i];
				if ((/ﾘｰﾀﾞｰ以外を解散/).test(button.textContent)) {
					var link = $create('a');
					link.className = 'grayButton300';
					link.href = _baseURL + 'event_dream%2Fdeck_modify_card%3Fdeck%3D1';
					link.innerHTML = 'ﾒﾝﾊﾞｰを追加する';
					button.parentElement.insertBefore(link, button.nextSibling);
					break;
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// ユーザー設定画面の拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fpersonal_option(?:%3F|$)/).test(_param)) {
			// 設定画面準備
			var settingMenu = [];
			settingMenu.push('<div id="cghpSettingArea">');
			settingMenu.push('<h2>IM@S CG Helper(仮) 設定</h2>');

			settingMenu.push('<section>');
			var hideBannerInMenuChecked = (_settings.hideBannerInMenu) ? 'checked="checked"' : '';
			settingMenu.push('<h3><label>');
			settingMenu.push('<input id="cghpSetHideBannerInMenu" type="checkbox" ' + hideBannerInMenuChecked + ' /> ');
			settingMenu.push('メニュー内のバナーを消す');
			settingMenu.push('</label></h3>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			var customMenuIconChecked = (_settings.customMenuIcon) ? 'checked="checked"' : '';
			settingMenu.push('<h3><label>');
			settingMenu.push('<input id="cghpSetCustomMenuIcon" type="checkbox" ' + customMenuIconChecked + ' /> ');
			settingMenu.push('カスタムメニューにアイコンを表示');
			settingMenu.push('</label></h3>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>カスタムメニュー1（0～8個まで）');
			settingMenu.push('<a id="cghpHelpCustomMenu1" class="a_link cghp_cm_help_link">...</a>：</h3>');
			settingMenu.push('<p><input id="cghpSetCustomMenu1" type="text" value="' + _settings.customMenu1.join(',') + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>カスタムメニュー2（0～8個まで）');
			settingMenu.push('<a id="cghpHelpCustomMenu2" class="a_link cghp_cm_help_link">...</a>：</h3>');
			settingMenu.push('<p><input id="cghpSetCustomMenu2" type="text" value="' + _settings.customMenu2.join(',') + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>カスタムメニュー3（0～8個まで）');
			settingMenu.push('<a id="cghpHelpCustomMenu3" class="a_link cghp_cm_help_link">...</a>：</h3>');
			settingMenu.push('<p><input id="cghpSetCustomMenu3" type="text" value="' + _settings.customMenu3.join(',') + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>道場URL：</h3>');
			settingMenu.push('<p><input id="cghpSetDojoURL" type="text" value="' + _settings.dojoURL + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>カスタムURL1：</h3>');
			settingMenu.push('<p><input id="cghpSetCustomURL1" type="text" value="' + _settings.customURL1 + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>カスタムURL2：</h3>');
			settingMenu.push('<p><input id="cghpSetCustomURL2" type="text" value="' + _settings.customURL2 + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>カスタムURL3：</h3>');
			settingMenu.push('<p><input id="cghpSetCustomURL3" type="text" value="' + _settings.customURL3 + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>カスタムURL4：</h3>');
			settingMenu.push('<p><input id="cghpSetCustomURL4" type="text" value="' + _settings.customURL4 + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>カスタムURL5：</h3>');
			settingMenu.push('<p><input id="cghpSetCustomURL5" type="text" value="' + _settings.customURL5 + '" /></p>');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>ポイント振り分けフィルタ：</h3>');
			var pointFilterHPChecked = (_settings.pointFilterHP) ? 'checked="checked"' : '';
			settingMenu.push('<label>');
			settingMenu.push('<input id="cghpPointFilterHP" type="checkbox" ' + pointFilterHPChecked + ' /> ');
			settingMenu.push('スタミナ');
			settingMenu.push('</label><br />');
			var pointFilterAtkChecked = (_settings.pointFilterAtk) ? 'checked="checked"' : '';
			settingMenu.push('<label>');
			settingMenu.push('<input id="cghpPointFilterAtk" type="checkbox" ' + pointFilterAtkChecked + ' /> ');
			settingMenu.push('攻コスト');
			settingMenu.push('</label><br />');
			var pointFilterDefChecked = (_settings.pointFilterDef) ? 'checked="checked"' : '';
			settingMenu.push('<label>');
			settingMenu.push('<input id="cghpPointFilterDef" type="checkbox" ' + pointFilterDefChecked + ' /> ');
			settingMenu.push('守コスト');
			settingMenu.push('</label><br />');
			var pointFilterAutoChecked = (_settings.pointFilterAuto) ? 'checked="checked"' : '';
			settingMenu.push('<label>');
			settingMenu.push('<input id="cghpPointFilterAuto" type="checkbox" ' + pointFilterAutoChecked + ' /> ');
			settingMenu.push('自動振り分け');
			settingMenu.push('</label><br />');
			settingMenu.push('</section>');

			settingMenu.push('<section>');
			settingMenu.push('<h3>');
			settingMenu.push('LIVEバトル時の消費コスト上限値：');
			settingMenu.push('<p><input id="cghpSetAttackCostLimit" type="text" maxlength="4" value="' + _settings.attackCostLimit + '" /></p>');
			settingMenu.push('</h3>');
			settingMenu.push('</section>');

			/* 通常使用しないので隠しておく
			settingMenu.push('<section>');
			settingMenu.push('<h3>FLASHページのメニュー拡大率：</h3>');
			settingMenu.push('<p><input id="cghpSetSwfZoom" type="text" value="' + _settings.swfZoom + '" /></p>');
			settingMenu.push('</section>');
			*/

			settingMenu.push('<p class="cghp_center cghp_margin_t20">');
			settingMenu.push('<input id="cghpOkButton" class="home" type="button" value="OK" />');
			settingMenu.push('&nbsp;&nbsp;&nbsp;&nbsp;');
			settingMenu.push('<input id="cghpCancelButton" class="double" type="button" value="キャンセル" />');
			settingMenu.push('</p>');
			settingMenu.push('<p id="cghpResetArea">');
			settingMenu.push('<input id="cghpResetButton" class="home grayButton300" type="button" value="設定を初期化" />');
			settingMenu.push('</p>');
			settingMenu.push('</div>');

			var overlay = $create('div');
			overlay.id = 'cghpSettingOverlay';
			overlay.className = 'cghp_hide';
			overlay.innerHTML = settingMenu.join('');
			_body.insertBefore(overlay, _body.firstChild);

			// カスタムメニューのヘルプを作成
			var customMenus = ['1', '2', '3'];
			for (var i = 0; i < 3; i++) {
				var help = $id('cghpHelpCustomMenu' + customMenus[i]);
				var text = $id('cghpSetCustomMenu' + customMenus[i]);
				if (help && text) {
					help.visible = false;
					// ヘルプのトグル表示関数
					var toggleHelp = (function(element) {
						return function() {
							var helpArea = $id('cghpCustomMenuHelp');
							if (helpArea) {
								helpArea.parentElement.removeChild(helpArea);
							} else {
								var helpArea = element.parentElement.insertBefore($create('div'), element.nextSibling);
								helpArea.id = 'cghpCustomMenuHelp';
								var helpList = helpArea.appendChild($create('ul'));
								helpList.className = 'cghp_cm_help_list';
								_customMenu.forEach(function(value, index, array) {
									var helpItem = helpList.appendChild($create('li'));
									var helpLink = helpItem.appendChild($create('a'));
									helpLink.className = 'cghp_link';
									helpLink.innerHTML = index + "：" + value.fullName;
									$bind(helpLink, 'click', function() {
										element.value += (element.value === '') ? index : ',' + index;
									});
								});
							}
							help.visible = !help.visible;
						};
					})(text);
					$bind(help, 'click', toggleHelp);
				}
			};

			// OKボタン クリックイベント
			var okButton = $id('cghpOkButton');
			if (okButton) {
				$bind(okButton, 'click', function() {
					var urlPattern = /^s?https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:@&=+$,%#]+$/;

					var hideBannerInMenu = $id('cghpSetHideBannerInMenu');
					if (hideBannerInMenu) {
						_settings.hideBannerInMenu = hideBannerInMenu.checked;
					}

					var customMenuIcon = $id('cghpSetCustomMenuIcon');
					if (customMenuIcon) {
						_settings.customMenuIcon = customMenuIcon.checked;
					}

					var customMenu1 = $id('cghpSetCustomMenu1');
					if (customMenu1) {
						var customMenu1List = customMenu1.value.split(',');
						var customMenu1ListLen = customMenu1List.length||0;
						var menu1 = [];
						for (var i = 0; i < customMenu1ListLen; i++) {
							var value = parseInt(trim((customMenu1List[i]).toString()));
							if (isNumeric(value) && (/^\d+/).test(value)) {
								menu1.push(value);
							}
						}
						if (menu1.length <= 8) {
							_settings.customMenu1 = menu1;
						}
					}

					var customMenu2 = $id('cghpSetCustomMenu2');
					if (customMenu2) {
					var customMenu2List = customMenu2.value.split(',');
					var customMenu2ListLen = customMenu2List.length||0;
						var manu2 = [];
						for (var i = 0; i < customMenu2ListLen; i++) {
							var value = parseInt(trim((customMenu2List[i]).toString()));
							if (isNumeric(value) && (/^\d+/).test(value)) {
								manu2.push(value);
							}
						}
						if (manu2.length <= 8) {
							_settings.customMenu2 = manu2;
						}
					}

					var customMenu3 = $id('cghpSetCustomMenu3');
					if (customMenu3) {
						var customMenu3List = customMenu3.value.split(',');
						var customMenu3ListLen = customMenu3List.length||0;
						var manu3 = [];
						for (var i = 0; i < customMenu3ListLen; i++) {
							var value = parseInt(trim((customMenu3List[i]).toString()));
							if (isNumeric(value) && (/^\d+/).test(value)) {
								manu3.push(value);
							}
						}
						if (manu3.length <= 8) {
							_settings.customMenu3 = manu3;
						}
					}

					var dojoURL = $id('cghpSetDojoURL');
					if (dojoURL) {
						var value = trim(dojoURL.value);
						if (urlPattern.test(value)) {
							_settings.dojoURL = value;
						}
					}

					var customURL1 = $id('cghpSetCustomURL1');
					if (customURL1) {
						var value = trim(customURL1.value);
						if (urlPattern.test(value)) {
							_settings.customURL1 = value;
						}
					}

					var customURL2 = $id('cghpSetCustomURL2');
					if (customURL2) {
						var value = trim(customURL2.value);
						if (urlPattern.test(value)) {
							_settings.customURL2 = value;
						}
					}

					var customURL3 = $id('cghpSetCustomURL3');
					if (customURL3) {
						var value = trim(customURL3.value);
						if (urlPattern.test(value)) {
							_settings.customURL3 = value;
						}
					}

					var customURL4 = $id('cghpSetCustomURL4');
					if (customURL4) {
						var value = trim(customURL4.value);
						if (urlPattern.test(value)) {
							_settings.customURL4 = value;
						}
					}

					var customURL5 = $id('cghpSetCustomURL5');
					if (customURL5) {
						var value = trim(customURL5.value);
						if (urlPattern.test(value)) {
							_settings.customURL5 = value;
						}
					}

					var pointFilterHP = $id('cghpPointFilterHP');
					if (pointFilterHP) {
						_settings.pointFilterHP = pointFilterHP.checked;
					}

					var pointFilterAtk = $id('cghpPointFilterAtk');
					if (pointFilterAtk) {
						_settings.pointFilterAtk = pointFilterAtk.checked;
					}

					var pointFilterDef = $id('cghpPointFilterDef');
					if (pointFilterDef) {
						_settings.pointFilterDef = pointFilterDef.checked;
					}

					var pointFilterAuto = $id('cghpPointFilterAuto');
					if (pointFilterAuto) {
						_settings.pointFilterAuto = pointFilterAuto.checked;
					}

					var attackCostLimit = $id('cghpSetAttackCostLimit');
					if (attackCostLimit) {
						var value = parseInt(attackCostLimit.value);
						if (isNumeric(value) && (/\d+/).test(value)) {
							_settings.attackCostLimit = value;
						}
					}

					/* 通常使用しないので隠しておく
					var swfZoom = $id('cghpSetSwfZoom');
					if (swfZoom) {
						var value = parseFloat(swfZoom.value);
						if (isNumeric(value) && 1 < value) {
							_settings.swfZoom = value;
						}
					}
					*/

					saveSettings();
					_location.reload();
					return false;
				});
			}
			// キャンセルボタン クリックイベント
			var cancelButton = $id('cghpCancelButton');
			if (cancelButton) {
				$bind(cancelButton, 'click', function() {
					// 非表示にしていた下位レイヤーの要素を表示する
					var pageArea = $id('pageArea');
					if (pageArea) {
						$removeClass(pageArea, 'cghp_overlay');
					}
					$addClass($id('cghpSettingOverlay'), 'cghp_hide');
				});
			}
			// 初期化ボタン クリックイベント
			var resetButton = $id('cghpResetButton');
			if (resetButton) {
				$bind(resetButton, 'click', function() {
					if (confirm('設定を初期化します。よろしいですか？')) {
						deleteSettings();
						_location.reload();
					}
				});
			}
			// 本スクリプトの設定画面呼び出しボタンを追加
			var settingLink = $create('a');
			settingLink.id = 'cghpSettingLink';
			settingLink.innerHTML = '<div id="cghpSettingButton" class="nextLink">IM@S CG Helper(仮)設定</div>';
			// リンクがクリックされたら設定画面を出して、閉じたときに有効な値だけを保存
			$bind(settingLink, 'click', function() {
				$removeClass($id('cghpSettingOverlay'), 'cghp_hide');
				// オーバーレイ表示中は下位レイヤーの邪魔な要素を非表示にする
				var pageArea = $id('pageArea');
				if (pageArea) {
					$addClass(pageArea, 'cghp_overlay');
				}
				return false;
			});
			var targetDiv = _content.querySelector('div.nextLink');
			if (targetDiv) {
				var targetLink = targetDiv.parentElement;
				targetLink.parentElement.insertBefore(settingLink, targetLink);
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 画面表示を再開する
	// -------------------------------------------------------------------------
	(function() {
		var pageArea = $id('pageArea');
		if (pageArea) {
			pageArea.style.display = '';
		}
	})();

	// -------------------------------------------------------------------------
	// FLASH画面用メニューの拡大率を変更する
	// -------------------------------------------------------------------------
	(function() {
		var embed = _doc.querySelector('embed');
		var flashMenu = $id('cghpFlashMenu');
		if (embed && flashMenu) {
			var displaySet = getValue('DisplayPositionSet');

			// 拡大表示設定
			if (flashMenu) {
				if (displaySet == 1 && navigator.userAgent.indexOf('Android') > 0) {
					$bind(window, 'resize', function() {
						flashMenu.style.zoom = innerWidth / 320 * _settings.swfZoom;
					});
					var event = _doc.createEvent('UIEvent');
					event.initEvent('resize', false, true);
					dispatchEvent(event);
				} else {
					flashMenu.style.zoom = _settings.swfZoom;
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 肩書画像をクリックでローディングキャラを表示
	// -------------------------------------------------------------------------
	(function() {
		// 肩書画像を取得
		var exists = false;
		var targetImage = _doc.querySelectorAll('img[src*="%2Fimage_sp%2Fui%2Ftrophy%2Ftitle_charge_"]');
		var targetImageLen = targetImage.length||0;
		for (var i = 0; i < targetImageLen; i++) {
			var image = targetImage[i];
			var imageFile = (image.src.match(/%2Fimage_sp%2Fui%2Ftrophy%2Ftitle_charge_(\d+)/)||[])[1]||null;
			if (imageFile) {
				// ローディングキャラ表示関数
				var showImage = (function(imageFile) {
					return function(e) {
						// スクロール位置に画像を移動
						// ページを拡大or縮小していると座標がずれるので計算にいれる
						var scrollTop = (_root.scrollTop || _body.scrollTop || pageYOffset);
						var zoom = _root.style.zoom||1;
						$id('cghpLoadingCharArea').style.top = (scrollTop / zoom) + 'px';

						// 肩書画像IDが3桁なら先頭に5を付与、それ以外はそのまま
						imageFile = (imageFile.length == 3) ? '5' + imageFile : imageFile;
						$id('cghpLoadingCharImg').src = _baseURL + 'image_sp%2Fui%2Frich%2Fquest%2Floading%2F' + imageFile + '.gif';
						$removeClass($id('cghpLoadingCharOverlay'), 'cghp_hide');

						// オーバーレイ表示中は下位レイヤーの邪魔な要素を非表示にする
						var pageArea = $id('pageArea');
						if (pageArea) {
							$addClass(pageArea, 'cghp_overlay');
						}
						e.stopPropagation();
					};
				})(imageFile);
				$addClass(image, 'cghp_link');
				$bind(image, 'click', showImage);
				exists = true;
			}
		}

		// 肩書き画像が見つかった場合はローディングキャラ表示用の要素を追加
		if (exists) {
			// ローディングキャラ非表示関数
			var hideImage = function(e) {
				// 非表示にしていた下位レイヤーの要素を表示する
				var pageArea = $id('pageArea');
				if (pageArea) {
					$removeClass(pageArea, 'cghp_overlay');
				}
				$addClass($id('cghpLoadingCharOverlay'), 'cghp_hide');
				$id('cghpLoadingCharArea').style.top = 0;
				e.stopPropagation();
			};

			var overlay = $create('div');
			overlay.id = 'cghpLoadingCharOverlay';
			overlay.className = 'cghp_link cghp_hide';
			$bind(overlay, 'click', hideImage);

			var imageArea = overlay.appendChild($create('div'));
			imageArea.id = 'cghpLoadingCharArea';

			var loadingImage = imageArea.appendChild($create('img'));
			loadingImage.id = 'cghpLoadingCharImg';

			_body.insertBefore(overlay, _body.firstChild);
		}
	})();

	// -------------------------------------------------------------------------
	// アイドル画像をクリックでズーム表示
	// -------------------------------------------------------------------------
	(function() {
		if (!(/%2Farchive%2F/).test(_param)) {
			// アイドル画像を取得
			var exists = false;
			var imageBaseURL = 'http://sp.pf-img-a.mbga.jp/12008305?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2F';
			var framePath = 'image_sp%2Fcard%2Fl%2F';
			var noFramePath = 'image_sp%2Fcard%2Fl_noframe%2F';
			var targetImage = _doc.querySelectorAll('img[src*="%2Fimage_sp%2Fcard%2F"]');
			var targetImageLen = targetImage.length||0;
			for (var i = 0; i < targetImageLen; i++) {
				var image = targetImage[i];
				var imageFile = (image.src.match(/%2Fimage_sp%2Fcard%2F(?:\w+)%2F(\w+\.jpg)/)||[])[1]||null;
				if (imageFile) {
					// アイドル画像(大)表示関数
					var showImage = (function(imageFile) {
						return function(e) {
							// スクロール位置に画像を移動
							// ページを拡大or縮小していると座標がずれるので計算にいれる
							var scrollTop = (_root.scrollTop || _body.scrollTop || pageYOffset);
							var zoom = _root.style.zoom||1;
							$id('cghpCharArea').style.top = (scrollTop / zoom) + 'px';

							$id('cghpCharImg1').src = imageBaseURL + framePath + imageFile;
							$id('cghpCharImg2').src = imageBaseURL + noFramePath + imageFile;
							$removeClass($id('cghpCharOverlay'), 'cghp_hide');

							// オーバーレイ表示中は下位レイヤーの邪魔な要素を非表示にする
							var pageArea = $id('pageArea');
							if (pageArea) {
								$addClass(pageArea, 'cghp_overlay');
							}
							e.stopPropagation();
						};
					})(imageFile);
					$addClass(image, 'cghp_link');
					$bind(image, 'click', showImage);
					exists = true;
				}
			}

			// アイドル画像が見つかった場合はアイドル画像(大)表示用の要素を追加
			if (exists) {
				// アイドル画像(大)非表示関数
				var hideImage = function(e) {
					// 非表示にしていた下位レイヤーの要素を表示する
					var pageArea = $id('pageArea');
					if (pageArea) {
						$removeClass(pageArea, 'cghp_overlay');
					}
					$addClass($id('cghpCharOverlay'), 'cghp_hide');
					$removeClass($id('cghpCharImg1'), 'cghp_hide');
					$addClass($id('cghpCharImg2'), 'cghp_hide');
					e.stopPropagation();
				};
				// アイドル画像(大)切替関数
				var toggleImage = function(e) {
					$toggleClass($id('cghpCharImg1'), 'cghp_hide');
					$toggleClass($id('cghpCharImg2'), 'cghp_hide');
					e.stopPropagation();
				};

				var overlay = $create('div');
				overlay.id = 'cghpCharOverlay';
				overlay.className = 'cghp_link cghp_hide';
				$bind(overlay, 'click', hideImage);

				var imageArea = overlay.appendChild($create('div'));
				imageArea.id = 'cghpCharArea';

				var switchImageLink = imageArea.appendChild($create('a'));
				switchImageLink.className = 'cghp_gray_area';
				switchImageLink.innerHTML = '画像切り替え(Sﾚｱ, Sﾚｱ+のみ)';
				$bind(switchImageLink, 'click', toggleImage);

				var charImage1 = imageArea.appendChild($create('img'));
				charImage1.id = 'cghpCharImg1';

				var charImage2 = imageArea.appendChild($create('img'));
				charImage2.id = 'cghpCharImg2';
				charImage2.className = 'cghp_hide';

				_body.insertBefore(overlay, _body.firstChild);
			}
		}
	})();

	// =========================================================================
	// 関数
	// =========================================================================

	/**
	 * お仕事ページのスタミナと経験値情報を取得する
	 *
	 * @param workType 0:演出OFF、1:演出ON
	 * @return ステータスを格納した連想配列。
	 */
	function getWorkStatus(workType) {
		var hpText = null;
		var expText = null;
		if (workType == 0) {
			// 演出OFF
			var targetArea = _content.querySelectorAll('span.blue_st');
			var targetAreaLen = targetArea.length||0;
			for (var i = 0; i < targetAreaLen; i++) {
				var span = targetArea[i];
				if ((/ｽﾀﾐﾅ:/).test(span.textContent)) {
					var targetTd = span.parentElement.nextSibling.nextSibling; // #parent -> td
					if (targetTd && targetTd.tagName == 'TD') {
						hpText = targetTd.textContent;
					}
				} else if ((/Ex:/).test(span.textContent)) {
					var targetTd = span.parentElement.nextSibling.nextSibling; // #parent -> td
					if (targetTd) {
						expText = targetTd.textContent;
					}
				}
			}
		} else if (workType == 1) {
			// 演出ON
			var targetArea = $id('get_condition');
			if (targetArea) {
				var hpDiv = $id('hp');
				if (hpDiv) {
					hpText = hpDiv.textContent;
				}
				var expDiv = $id('exp');
				if (expDiv) {
					expText = expDiv.textContent;
				}
			}
		}

		if (hpText == null || expText == null) {
			return null;
		}
		var status = {};
		var hpTextArray = (hpText.match(/(\d+)\/(\d+)/)||[]);
		if (hpTextArray.length == 3) {
			status.currentHP = hpTextArray[1];
			status.maxHP = hpTextArray[2];
		} else {
			return null;
		}
		var expTextArray = (expText.match(/(\d+)\/(\d+)/)||[]);
		if (expTextArray.length == 3) {
			status.currentExp = expTextArray[1];
			status.maxExp = expTextArray[2];
		} else {
			return null;
		}
		return status;
	}

	/**
	 * 次のレベルアップまでの必要コストを取得する
	 *
	 * @param currentHP スタミナの現在値
	 * @param maxHP スタミナの最大値
	 * @param currentExp 経験値の現在値
	 * @param maxExp 経験値の最大値
	 * @return 経験値の計算結果を格納したElement。
	 */
	function getExpInfo(currentHP, maxHP, currentExp, maxExp) {
		// 引数チェック
		if (currentHP == null || maxHP == null || currentExp == null || maxExp == null) {
			return null;
		}
		try {
			currentHP = parseInt(currentHP);
			maxHP = parseInt(maxHP);
			currentExp = parseInt(currentExp);
			maxExp = parseInt(maxExp);
		} catch (e) {
			return null;
		}

		// レベルアップに必要な経験値の算出
		var restExp = maxExp - currentExp;
		if (restExp < 1) {
			return null;
		}

		// 必要コストの算出とElementの作成
		setValue('cghp_recovery100', maxHP);
		setValue('cghp_recovery50', Math.ceil(maxHP / 2));
		setValue('cghp_recovery20', Math.ceil(maxHP / 5));

		var expInfoDiv = $create('div');
		expInfoDiv.id = 'cghpExpInfo';

		var div1 = expInfoDiv.appendChild($create('div'));
		div1.innerHTML = '次のLvupまでに必要なEx：<span class="yellow">' + restExp + '</span>';
		var div2 = expInfoDiv.appendChild($create('div'));
		div2.innerHTML = '現在のスタミナ：<span class="yellow">' + currentHP + '</span>';
		expInfoDiv.appendChild($create('hr'));

		if (restExp <= currentHP) {
			var divError = expInfoDiv.appendChild($create('div'));
			divError.innerHTML = '<span class="red">スタミナが溢れています。<br />至急Lvupしましょう！</span>';
		} else {
			// 計算結果を時間(文字列)に変換
			var minutesToString = function(minutes) {
				var d = 0;
				var h = 0;
				var m = minutes;
				var result = '';
				if (60 <= m) {
					h = Math.floor(m / 60);
					m = m % 60;
				}
				if (24 <= h) {
					d = Math.floor(h / 24);
					h = h % 24;
				}
				if (0 < d) {
					result += d + '日';
					if (0 < h || 0 < m) {
						result += 'と';
					}
				}
				if (0 < h) {
					result += h + '時間';
				}
				if (0 < m) {
					result += m + '分';
				}
				return result;
			};

			// 計算処理
			var expCalc = function(restExp) {
				var result = {};

				var restExpTemp = restExp;
				restExpTemp -= currentHP;
				// 自然回復のみ
				result.recoveryNaturalOnlyTime = minutesToString(restExpTemp * 3);
				result.recoveryNaturalOnlyCost = restExpTemp;
				// 100%回復アイテム
				if (_settings.expCalcRecovery100) {
					result.recovery100Count = Math.floor(restExpTemp / _settings.recovery100);
					result.recovery100Cost = _settings.recovery100 * result.recovery100Count;
					restExpTemp -= result.recovery100Cost;
				} else {
					result.recovery100Count = 0;
					result.recovery100Cost = 0;
				}
				// 50%回復アイテム
				if (_settings.expCalcRecovery50) {
					result.recovery50Count = Math.floor(restExpTemp / _settings.recovery50);
					result.recovery50Cost = _settings.recovery50 * result.recovery50Count;
					restExpTemp -= result.recovery50Cost;
				} else {
					result.recovery50Count = 0;
					result.recovery50Cost = 0;
				}
				// 20%回復アイテム
				if (_settings.expCalcRecovery20) {
					result.recovery20Count = Math.floor(restExpTemp / _settings.recovery20);
					result.recovery20Cost = _settings.recovery20 * result.recovery20Count;
					restExpTemp -= result.recovery20Cost;
				} else {
					result.recovery20Count = 0;
					result.recovery20Cost = 0;
				}
				// 自然回復
				result.recoveryNaturalTime = minutesToString(restExpTemp * 3);
				result.recoveryNaturalCost = restExpTemp;

				return result;
			};

			var exp = expCalc(restExp);
			var divRecovery100 = expInfoDiv.appendChild($create('div'));
			divRecovery100.className = (_settings.expCalcRecovery100) ? 'cghp_link' : 'cghp_link cghp_strike';
			divRecovery100.innerHTML = '100%回復アイテム (' + _settings.recovery100 + ')：<span class="yellow">' + exp.recovery100Count + '個 (' + exp.recovery100Cost + ')</span>';
			$bind(divRecovery100, 'click', function() {
				_settings.expCalcRecovery100 = !_settings.expCalcRecovery100;
				setValue('cghp_exp_calc_recovery100', _settings.expCalcRecovery100);
				updateExpInfo(currentHP, maxHP, currentExp, maxExp);
			});
			var divRecovery50 = expInfoDiv.appendChild($create('div'));
			divRecovery50.className = (_settings.expCalcRecovery50) ? 'cghp_link' : 'cghp_link cghp_strike';
			divRecovery50.innerHTML = '50%回復アイテム (' + _settings.recovery50 + ')：<span class="yellow">' + exp.recovery50Count + '個 (' + exp.recovery50Cost + ')</span>';
			$bind(divRecovery50, 'click', function() {
				_settings.expCalcRecovery50 = !_settings.expCalcRecovery50;
				setValue('cghp_exp_calc_recovery50', _settings.expCalcRecovery50);
				updateExpInfo(currentHP, maxHP, currentExp, maxExp);
			});
			var divRecovery20 = expInfoDiv.appendChild($create('div'));
			divRecovery20.className = (_settings.expCalcRecovery20) ? 'cghp_link' : 'cghp_link cghp_strike';
			divRecovery20.innerHTML = '20%回復アイテム (' + _settings.recovery20 + ')：<span class="yellow">' + exp.recovery20Count + '個 (' + exp.recovery20Cost + ')</span>';
			$bind(divRecovery20, 'click', function() {
				_settings.expCalcRecovery20 = !_settings.expCalcRecovery20;
				setValue('cghp_exp_calc_recovery20', _settings.expCalcRecovery20);
				updateExpInfo(currentHP, maxHP, currentExp, maxExp);
			});
			var divRecoveryNatural = expInfoDiv.appendChild($create('div'));
			divRecoveryNatural.innerHTML = '自然回復：<span class="yellow">' + exp.recoveryNaturalTime + ' (' + exp.recoveryNaturalCost + ')</span>';
			expInfoDiv.appendChild($create('hr'));
			var divRecoveryNatural = expInfoDiv.appendChild($create('div'));
			divRecoveryNatural.innerHTML = '自然回復のみ：<span class="yellow">' + exp.recoveryNaturalOnlyTime + ' (' + exp.recoveryNaturalOnlyCost + ')</span>';
		}

		return expInfoDiv;
	}

	/**
	 * 次のレベルアップまでの必要コストを更新する
	 *
	 * @param currentHP スタミナの現在値
	 * @param maxHP スタミナの最大値
	 * @param currentExp 経験値の現在値
	 * @param maxExp 経験値の最大値
	 * @return 経験値の計算結果を格納したDOM。
	 */
	function updateExpInfo(currentHP, maxHP, currentExp, maxExp) {
		var cghpExpInfo = $id('cghpExpInfo');
		if (cghpExpInfo) {
			var expInfoDiv = getExpInfo(currentHP, maxHP, currentExp, maxExp);
			if (expInfoDiv) {
				var parentElement = cghpExpInfo.parentElement;
				expInfoDiv.className = cghpExpInfo.className;
				parentElement.replaceChild(expInfoDiv, cghpExpInfo);
			}
		}
	}

	/**
	 * クリック(タップ)イベントを発生させる
	 *
	 * @param element イベントを発生させる対象の要素
	 */
	function dispatchClick(element) {
		if (window.start && window.start == 'touchstart') {
			// タップイベント (touchstart → touchend → click)
			var event_start = _doc.createEvent('TouchEvent');
			var event_end = _doc.createEvent('TouchEvent');
			var event_click = _doc.createEvent('MouseEvent');
			var touch = _doc.createTouch(window, element, 0, 0, 0, 0, 0);
			var touches = _doc.createTouchList(touch);

			if (navigator.userAgent.indexOf('Android') > 0) {
				// Android
				event_start.initTouchEvent(touches, touches, touches, 'touchstart', window, 0, 0, 0, 0, false, false, false, false);
				event_end.initTouchEvent(touches, touches, touches, 'touchend', window, 0, 0, 0, 0, false, false, false, false);
			} else {
				// iOS
				event_start.initTouchEvent('touchstart', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, touches, touches, touches,1, 0);
				event_end.initTouchEvent('touchend', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, touches, touches, touches,1, 0);
			}
			event_click.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, 0, false, false, false, false, null);

			element.dispatchEvent(event_start);
			element.dispatchEvent(event_end);
			element.dispatchEvent(event_click);
		} else {
			// クリックイベント (mousedown → mouseup → click)
			var event_down = _doc.createEvent('MouseEvent');
			var event_up = _doc.createEvent('MouseEvent');
			var event_click = _doc.createEvent('MouseEvent');

			event_down.initMouseEvent('mousedown', true, true, window, 0, 0, 0, 0, 0, 0, false, false, false, false, null);
			event_up.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, 0, false, false, false, false, null);
			event_click.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, 0, false, false, false, false, null);

			element.dispatchEvent(event_down);
			element.dispatchEvent(event_up);
			element.dispatchEvent(event_click);
		}
	}

	/**
	 * headタグの先頭に要素を挿入する
	 *
	 * @param element 挿入する要素
	 * @note headタグがない場合は、headタグを作成して要素を追加する。
	 */
	function insertToHead(element) {
		if (element instanceof Node || element instanceof Element) {
			var head = _doc.querySelector('head');
			if (head) {
				head.appendChild(element);
			} else {
				head = $create('head');
				head.appendChild(element);
				_root.insertBefore(element, _root.firstChild);
			}
		}
	}

	/**
	 * ユーザー設定を読み込む
	 *
	 * @note 初期値の設定もここで行う。
	 *       (現状はイベントURLはマイスタジオ表示時に取得。失敗時は仕事のURLが設定される。)
	 * @return 設定の連想配列。
	 */
	function loadSettings() {
		var settings = {};

		if (/%2Fmypage(?:%2F|%3F)?/.test(_param)) {
			var headerAccordion = $id('headerAccordion');
			if (headerAccordion) {
				var eventLink = headerAccordion.querySelector('div.bannerArea2 a');
				if (eventLink && eventLink.href != settings.eventURL) {
					settings.eventURL = eventLink.href;
					setValue('cghp_event_url', settings.eventURL);
				}
			}
		} else {
			settings.eventURL = getValue('cghp_event_url');
		}
		if (settings.eventURL == null) {
			settings.eventURL = _baseURL + 'quests';
			setValue('cghp_event_url', settings.eventURL);
		}
		settings.hideBannerInMenu = getValue('cghp_hide_banner_in_menu');
		if (settings.hideBannerInMenu == null) {
			settings.hideBannerInMenu = true;
			setValue('cghp_hide_banner_in_menu', settings.hideBannerInMenu);
		}
		settings.customMenuIcon = getValue('cghp_custom_menu_icon');
		if (settings.customMenuIcon == null) {
			settings.customMenuIcon = true;
			setValue('cghp_custom_menu_icon', settings.customMenuIcon);
		}
		settings.customMenu1 = getValue('cghp_custom_menu1');
		if (settings.customMenu1 == null) {
			settings.customMenu1 = [3, 2, 10, 14, 26, 16];
			setValue('cghp_custom_menu1', settings.customMenu1);
		}
		settings.customMenu2 = getValue('cghp_custom_menu2');
		if (settings.customMenu2 == null) {
			settings.customMenu2 = [4, 6, 8, 25, 24];
			setValue('cghp_custom_menu2', settings.customMenu2);
		}
		settings.customMenu3 = getValue('cghp_custom_menu3');
		if (settings.customMenu3 == null) {
			settings.customMenu3 = [];
			setValue('cghp_custom_menu3', settings.customMenu3);
		}
		settings.dojoURL = getValue('cghp_dojo_url');
		if (settings.dojoURL == null) {
			settings.dojoURL = 'http://saasan.github.io/mobamas-dojo/lv.html';
			setValue('cghp_dojo_url', settings.dojoURL);
		}
		settings.customURL1 = getValue('cghp_custom_url1');
		if (settings.customURL1 == null) {
			settings.customURL1 = _topURL;
			setValue('cghp_custom_url1', settings.customURL1);
		}
		settings.customURL2 = getValue('cghp_custom_url2');
		if (settings.customURL2 == null) {
			settings.customURL2 = _topURL;
			setValue('cghp_custom_url2', settings.customURL2);
		}
		settings.customURL3 = getValue('cghp_custom_url3');
		if (settings.customURL3 == null) {
			settings.customURL3 = _topURL;
			setValue('cghp_custom_url3', settings.customURL3);
		}
		settings.customURL4 = getValue('cghp_custom_url4');
		if (settings.customURL4 == null) {
			settings.customURL4 = _topURL;
			setValue('cghp_custom_url4', settings.customURL4);
		}
		settings.customURL5 = getValue('cghp_custom_url5');
		if (settings.customURL5 == null) {
			settings.customURL5 = _topURL;
			setValue('cghp_custom_url5', settings.customURL5);
		}
		settings.uncheckedGift = getValue('cghp_unchecked_gift');
		if (settings.uncheckedGift == null) {
			settings.uncheckedGift = 1;
			setValue('cghp_unchecked_gift', settings.uncheckedGift);
		}
		settings.pointFilterHP = getValue('cghp_point_filter_hp');
		if (settings.pointFilterHP == null) {
			settings.pointFilterHP = true;
			setValue('cghp_point_filter_hp', settings.pointFilterHP);
		}
		settings.pointFilterAtk = getValue('cghp_point_filter_atk');
		if (settings.pointFilterAtk == null) {
			settings.pointFilterAtk = true;
			setValue('cghp_point_filter_atk', settings.pointFilterAtk);
		}
		settings.pointFilterDef = getValue('cghp_point_filter_def');
		if (settings.pointFilterDef == null) {
			settings.pointFilterDef = false;
			setValue('cghp_point_filter_def', settings.pointFilterDef);
		}
		settings.pointFilterAuto = getValue('cghp_point_filter_auto');
		if (settings.pointFilterAuto == null) {
			settings.pointFilterAuto = false;
			setValue('cghp_point_filter_auto', settings.pointFilterAuto);
		}
		settings.attackCostLimit = getValue('cghp_atack_cost_limit');
		if (settings.attackCostLimit == null) {
			settings.attackCostLimit = 5;
			setValue('cghp_atack_cost_limit', settings.attackCostLimit);
		}
		settings.recovery100 = getValue('cghp_recovery100');
		if (settings.recovery100 == null) {
			settings.recovery100 = 0;
			setValue('cghp_recovery100', settings.recovery100);
		}
		settings.recovery50 = getValue('cghp_recovery50');
		if (settings.recovery50 == null) {
			settings.recovery50 = 0;
			setValue('cghp_recovery50', settings.recovery50);
		}
		settings.recovery20 = getValue('cghp_recovery20');
		if (settings.recovery20 == null) {
			settings.recovery20 = 0;
			setValue('cghp_recovery20', settings.recovery20);
		}
		settings.expCalcRecovery100 = getValue('cghp_exp_calc_recovery100');
		if (settings.expCalcRecovery100 == null) {
			settings.expCalcRecovery100 = true;
			setValue('cghp_exp_calc_recovery100', settings.expCalcRecovery100);
		}
		settings.expCalcRecovery50 = getValue('cghp_exp_calc_recovery50');
		if (settings.expCalcRecovery50 == null) {
			settings.expCalcRecovery50 = true;
			setValue('cghp_exp_calc_recovery50', settings.expCalcRecovery50);
		}
		settings.expCalcRecovery20 = getValue('cghp_exp_calc_recovery20');
		if (settings.expCalcRecovery20 == null) {
			settings.expCalcRecovery20 = false;
			setValue('cghp_exp_calc_recovery20', settings.expCalcRecovery20);
		}
		settings.swfZoom = getValue('cghp_swf_zoom');
		if (settings.swfZoom == null) {
			settings.swfZoom = 1.0;
			setValue('cghp_swf_zoom', settings.swfZoom);
		}

		return settings;
	}

	/**
	 * ユーザー設定を書き込む
	 *
	 */
	function saveSettings() {
		setValue('cghp_event_url', _settings.eventURL);
		setValue('cghp_hide_banner_in_menu', _settings.hideBannerInMenu);
		setValue('cghp_custom_menu_icon', _settings.customMenuIcon);
		setValue('cghp_custom_menu1', _settings.customMenu1);
		setValue('cghp_custom_menu2', _settings.customMenu2);
		setValue('cghp_custom_menu3', _settings.customMenu3);
		setValue('cghp_dojo_url', _settings.dojoURL);
		setValue('cghp_custom_url1', _settings.customURL1);
		setValue('cghp_custom_url2', _settings.customURL2);
		setValue('cghp_custom_url3', _settings.customURL3);
		setValue('cghp_custom_url4', _settings.customURL4);
		setValue('cghp_custom_url5', _settings.customURL5);
		setValue('cghp_unchecked_gift', _settings.uncheckedGift);
		setValue('cghp_point_filter_hp', _settings.pointFilterHP);
		setValue('cghp_point_filter_atk', _settings.pointFilterAtk);
		setValue('cghp_point_filter_def', _settings.pointFilterDef);
		setValue('cghp_point_filter_auto', _settings.pointFilterAuto);
		setValue('cghp_atack_cost_limit', _settings.attackCostLimit);
		setValue('cghp_recovery100', _settings.recovery100);
		setValue('cghp_recovery50', _settings.recovery50);
		setValue('cghp_recovery20', _settings.recovery20);
		setValue('cghp_exp_calc_recovery100', _settings.expCalcRecovery100);
		setValue('cghp_exp_calc_recovery50', _settings.expCalcRecovery50);
		setValue('cghp_exp_calc_recovery20', _settings.expCalcRecovery20);
		setValue('cghp_swf_zoom', _settings.swfZoom);
	}

	/**
	 * ユーザー設定を削除する
	 *
	 */
	function deleteSettings() {
		deleteValue('cghp_event_url');
		deleteValue('cghp_hide_banner_in_menu');
		deleteValue('cghp_custom_menu_icon');
		deleteValue('cghp_custom_menu1');
		deleteValue('cghp_custom_menu2');
		deleteValue('cghp_custom_menu3');
		deleteValue('cghp_dojo_url');
		deleteValue('cghp_custom_url1');
		deleteValue('cghp_custom_url2');
		deleteValue('cghp_custom_url3');
		deleteValue('cghp_custom_url4');
		deleteValue('cghp_custom_url5');
		deleteValue('cghp_unchecked_gift');
		deleteValue('cghp_point_filter_hp');
		deleteValue('cghp_point_filter_atk');
		deleteValue('cghp_point_filter_def');
		deleteValue('cghp_point_filter_auto');
		deleteValue('cghp_atack_cost_limit');
		deleteValue('cghp_swf_zoom');
	}

})();
