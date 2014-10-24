// ==UserScript==
// @name IM@S CG Helper (Tentative name)
// @author sunokonoyama
// @version 2014.4.2.2319
// @description The script to be somewhat comfortable to the IDOLM@STER CINDERELLA GIRLS.
// @include http://sp.pf.mbga.jp/12008305
// @include http://sp.pf.mbga.jp/12008305?*
// @include http://sp.pf.mbga.jp/12008305/*
// @grant none
// ==/UserScript==

(function() {
	'use strict';

	/**
	 * レベルアップ計算を挿入する
	 *
	 * @param status getWorkStatusの戻り値
	 * @param insertTarget 挿入先のElement
	 * @param className HTMLのクラス名
	 */
	function insertExpInfo(status, insertTarget, className) {
		if (status) {
			var expInfoDiv = getExpInfo(status.currentHP, status.maxHP, status.currentExp, status.maxExp);
			if (expInfoDiv && insertTarget) {
				expInfoDiv.className = className;
				insertTarget.parentElement.insertBefore(expInfoDiv, insertTarget);
			}
		}
	}

	/**
	 * お仕事ページのスタミナと経験値情報を取得する
	 *
	 * @param workType 0:演出OFF、1:演出ON
	 * @return ステータスを格納した連想配列。
	 */
	function getWorkStatus(workType) {
		var hpText = null;
		var expText = null;
		var targetTd, targetArea;

		if (workType === 0) {
			// 演出OFF
			targetArea = _content.querySelectorAll('span.blue_st');
			var targetAreaLen = targetArea.length||0;
			for (var i = 0; i < targetAreaLen; i++) {
				var span = targetArea[i];
				if ((/ｽﾀﾐﾅ:/).test(span.textContent)) {
					targetTd = span.parentElement.nextSibling.nextSibling; // #parent -> td
					if (targetTd && targetTd.tagName === 'TD') {
						hpText = targetTd.textContent;
					}
				} else if ((/Ex:/).test(span.textContent)) {
					targetTd = span.parentElement.nextSibling.nextSibling; // #parent -> td
					if (targetTd) {
						expText = targetTd.textContent;
					}
				}
			}
		} else if (workType === 1) {
			// 演出ON
			targetArea = $id('get_condition');
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
		if (hpTextArray.length === 3) {
			status.currentHP = hpTextArray[1];
			status.maxHP = hpTextArray[2];
		} else {
			return null;
		}
		var expTextArray = (expText.match(/(\d+)\/(\d+)/)||[]);
		if (expTextArray.length === 3) {
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
		currentHP = toNumber(currentHP);
		maxHP = toNumber(maxHP);
		currentExp = toNumber(currentExp);
		maxExp = toNumber(maxExp);

		// レベルアップに必要な経験値の算出
		var restExp = maxExp - currentExp;
		if (restExp < 1) {
			return null;
		}

		// 必要コストの算出とElementの作成
		var recovery100 = maxHP;
		var recovery50 = Math.ceil(maxHP / 2);
		var recovery20 = Math.ceil(maxHP / 5);

		var expInfoDiv = $create('div');
		expInfoDiv.id = 'cghpExpInfo';

		var div1 = expInfoDiv.appendChild($create('div'));
		div1.innerHTML = '次のLvUPまでに必要なEx：<span class="yellow">' + restExp + '</span>';
		var div2 = expInfoDiv.appendChild($create('div'));
		div2.innerHTML = '現在のスタミナ：<span class="yellow">' + currentHP + '</span>';
		expInfoDiv.appendChild($create('hr'));

		if (restExp <= currentHP) {
			var divError = expInfoDiv.appendChild($create('div'));
			divError.innerHTML = '<span class="red">スタミナが溢れています。<br>至急LvUPしましょう！</span>';
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
				if (_settings.exp_calc_recovery100) {
					result.recovery100Count = Math.floor(restExpTemp / recovery100);
					result.recovery100Cost = recovery100 * result.recovery100Count;
					restExpTemp -= result.recovery100Cost;
				} else {
					result.recovery100Count = 0;
					result.recovery100Cost = 0;
				}
				// 50%回復アイテム
				if (_settings.exp_calc_recovery50) {
					result.recovery50Count = Math.floor(restExpTemp / recovery50);
					result.recovery50Cost = recovery50 * result.recovery50Count;
					restExpTemp -= result.recovery50Cost;
				} else {
					result.recovery50Count = 0;
					result.recovery50Cost = 0;
				}
				// 20%回復アイテム
				if (_settings.exp_calc_recovery20) {
					result.recovery20Count = Math.floor(restExpTemp / recovery20);
					result.recovery20Cost = recovery20 * result.recovery20Count;
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
			divRecovery100.className = (_settings.exp_calc_recovery100) ? 'cghp_link' : 'cghp_link cghp_strike';
			divRecovery100.innerHTML = '100%回復アイテム (' + recovery100 + ')：<span class="yellow">' + exp.recovery100Count + '個 (' + exp.recovery100Cost + ')</span>';
			$bind(divRecovery100, 'click', function() {
				_settings.exp_calc_recovery100 = !_settings.exp_calc_recovery100;
				saveSettings('exp_calc_recovery100');
				updateExpInfo(currentHP, maxHP, currentExp, maxExp);
			});
			var divRecovery50 = expInfoDiv.appendChild($create('div'));
			divRecovery50.className = (_settings.exp_calc_recovery50) ? 'cghp_link' : 'cghp_link cghp_strike';
			divRecovery50.innerHTML = '50%回復アイテム (' + recovery50 + ')：<span class="yellow">' + exp.recovery50Count + '個 (' + exp.recovery50Cost + ')</span>';
			$bind(divRecovery50, 'click', function() {
				_settings.exp_calc_recovery50 = !_settings.exp_calc_recovery50;
				saveSettings('exp_calc_recovery50');
				updateExpInfo(currentHP, maxHP, currentExp, maxExp);
			});
			var divRecovery20 = expInfoDiv.appendChild($create('div'));
			divRecovery20.className = (_settings.exp_calc_recovery20) ? 'cghp_link' : 'cghp_link cghp_strike';
			divRecovery20.innerHTML = '20%回復アイテム (' + recovery20 + ')：<span class="yellow">' + exp.recovery20Count + '個 (' + exp.recovery20Cost + ')</span>';
			$bind(divRecovery20, 'click', function() {
				_settings.exp_calc_recovery20 = !_settings.exp_calc_recovery20;
				saveSettings('exp_calc_recovery20');
				updateExpInfo(currentHP, maxHP, currentExp, maxExp);
			});
			var divRecoveryNatural;
			divRecoveryNatural = expInfoDiv.appendChild($create('div'));
			divRecoveryNatural.innerHTML = '自然回復：<span class="yellow">' + exp.recoveryNaturalTime + ' (' + exp.recoveryNaturalCost + ')</span>';
			expInfoDiv.appendChild($create('hr'));
			divRecoveryNatural = expInfoDiv.appendChild($create('div'));
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
		var event_click;

		if (window.start && window.start === 'touchstart') {
			// タップイベント (touchstart → touchend → click)
			var event_start = _doc.createEvent('TouchEvent');
			var event_end = _doc.createEvent('TouchEvent');
			event_click = _doc.createEvent('MouseEvent');
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
			event_click = _doc.createEvent('MouseEvent');

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
		var defaults = {
			'mobage_id': 0,
			'chat_url': _baseURL + 'knights%2Fknights_top_for_member',
			'event_url': _baseURL + 'quests',
			'hide_banner_in_menu': true,
			'custom_menu_icon': true,
			'custom_menu1': [3, 2, 10, 14, 26, 16],
			'custom_menu2': [4, 6, 8, 25, 24],
			'custom_menu3': [],
			'dojo_url': 'http://saasan.github.io/mobamas-dojo/lv.html',
			'custom_url1': _topURL,
			'custom_url2': _topURL,
			'custom_url3': _topURL,
			'custom_url4': _topURL,
			'custom_url5': _topURL,
			'point_filter_hp': true,
			'point_filter_atk': true,
			'point_filter_def': false,
			'point_filter_auto': false,
			'atack_cost_limit': 5,
			'exp_calc_recovery100': true,
			'exp_calc_recovery50': true,
			'exp_calc_recovery20': false,
			'event_assault_power_check1': 0,
			'event_assault_power_check2': 0,
			'event_assault_power_check3': 0,
			'swf_zoom': 1,
			'uncheckPresent': true
		};
		var settings = {};
		for (var key in defaults) {
			settings[key] = getValue('cghp_' + key);
			if (settings[key] == null) {
				settings[key] = defaults[key];
				setValue('cghp_' + key, settings[key]);
			}
		}
		return settings;
	}

	/**
	 * ユーザー設定を書き込む
	 *
	 */
	function saveSettings(key) {
		if (key) {
			setValue('cghp_' + key, _settings[key]);
		} else {
			for (var k in _settings) {
				setValue('cghp_' + k, _settings[k]);
			}
		}
	}

	/**
	 * ユーザー設定を削除する
	 *
	 */
	function deleteSettings() {
		for (var i = localStorage.length - 1; 0 <= i; i--) {
			var key = localStorage.key(i);
			if ((/^cghp_/).test(key)) {
				deleteValue(key);
			}
		}
	}

	// その他関数
	function $id(a){return _doc.getElementById(a);}
	function $addClass(d,b){if(d&&b){var e=b.split(' ')||[];var f=d.className.split(' ')||[];for(var c=0,a=e.length;c<a;c++){if(f.indexOf(e[c])===-1){f.push(e[c]);}}d.className=f.join(' ').trim();}}
	function $removeClass(a,e){if(a&&e){var b=e.split(' ')||[];var d=a.className.split(' ')||[];var c=d.filter(function(g){for(var h=0,f=b.length;h<f;h++){if(g===b[h]){return false;}}return true;});a.className=c.join(' ').trim();}}
	function $hasClass(f,b){var h=false;if(f&&b){var a=b.split(' ')||[];var e=f.className.split(' ')||[];for(var d=0,c=e.length;d<c;d++){for(var q=0,r=a.length;q<r;q++){if(e[d]===a[q]){h=true;break;}}}}return h;}
	function $toggleClass(a,c){/*var b=false;*/if(a&&c){if($hasClass(a,c)){$removeClass(a,c);}else{$addClass(a,c);}}}
	function $create(a){return _doc.createElement(a);}
	function $bind(a,b,c){if(!a){return;}a.addEventListener(b,c,false);}
	function getValue(a){var b=localStorage.getItem(a);return(b)?JSON.parse(b):null;}
	function setValue(a,b){localStorage.setItem(a,JSON.stringify(b));}
	function deleteValue(a){localStorage.removeItem(a);}
	function isNumeric(a){if(Number.isFinite){return Number.isFinite(a);}else{return(typeof a==='number')&&isFinite(a);}}
	function toNumber(a){if(a){return a-0;}}
	function round(a,b){var c=Math.pow(10,b);return Math.round(a*c)/c;}
	function trim(a){return(a)?a.replace(/^[\s　]+|[\s　]+$/g,''):null;}

	// =========================================================================
	// メイン処理
	// =========================================================================

	var _doc = document;
	var _root = _doc.documentElement;
	var _body = _doc.body;
	var _location = location;
	var _param = _location.search.substring(1);
	var _topURL = 'http://sp.pf.mbga.jp/12008305/?guid=ON';
	var _baseURL = _topURL + '&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2F';
	var _content = $id('headerAcdPanel')||_body;

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
	if (_isExecuted) {
		return;
	}

	// -------------------------------------------------------------------------
	// スタイルの設定
	// -------------------------------------------------------------------------
	(function() {
		// スタイルは極力ここで書いておく。
		var css = (function() {/*

		#headerAccordion {
			margin-bottom:10px;
		}
		.checkForm {
			overflow:hidden;
		}
		.a_link,
		label {
			cursor:pointer;
		}
		.mbga-pf-footer-container {
			width:300px !important;
		}
		.idolStatus .img {
			text-align:left;
		}
		.idolStatus .pr.want {
			font-size: 1rem;
		}
		body {
			margin:0 auto;
			padding:0;
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
			min-height:100%;
			background-color:rgba(0, 0, 0, 0.85);
			color:#ffffff;
			overflow:auto;
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
		#cghpCharArea .cghp_add_area_gray {
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
			background:#333333;
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
			border-bottom-color:#333333;
			border-width:10px;
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
		#chgpRecoveryTimeAria {
			-webkit-column-count: 2;
			margin:0;
			text-align:center;
			width:auto;
		}
		#cghpResetArea {
			padding-top:50em;
		}
		#cghpSettingOverlay input[type="text"],
		#cghpSettingOverlay input[type="url"],
		#cghpSettingOverlay input[type="tel"],
		#cghpSettingOverlay input[type="number"] {
			-webkit-box-sizing:border-box;
			width:300px;
			ime-mode:disabled;
		}
		#cghpSettingArea {
			-webkit-box-sizing:border-box;
			margin:0 auto;
			padding:10px;
			width:320px;
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
			background:-webkit-gradient(linear, left top, left bottom, color-stop(0%, #993333), color-stop(50%, #661d1d), color-stop(100%, #993333));
		}
		#cghpSettingButton:hover {
			background:-webkit-gradient(linear, left top, left bottom, color-stop(0%, #cc6666), color-stop(50%, #993333), color-stop(100%, #cc6666));
		}
		#cghpSettingLink {
			display:block;
			cursor:pointer;
		}
		.cghp_add_area_gray,
		.cghp_add_area_green,
		.cghp_add_area_red {
			-webkit-box-sizing:border-box;
			margin:0 10px;
			padding:5px;
			width:300px;
			background-color:#333333;
			color: #ffffff;
			text-align:center;
			line-height:1.4;
		}
		.cghp_add_area_gray > h3:first-child,
		.cghp_add_area_green > h3:first-child,
		.cghp_add_area_red > h3:first-child {
			margin:0 0 5px 0;
			background-color:#444444;
			font-size:95%;
		}
		.cghp_add_area_green {
			border:1px solid #459945 !important;
			background-color:#347034 !important;
		}
		.cghp_add_area_green > h3:first-child {
			background-color:#459945 !important;
		}
		.cghp_add_area_red {
			border:1px solid #994545 !important;
			background-color:#703434 !important;
		}
		.cghp_add_area_red > h3:first-child {
			background-color:#994545 !important;
		}
		.cghp_back_link {
			width:320px !important;
			padding:0 !important;
		}
		.cghp_back_link > a {
			width: auto !important;
			padding:13px 0 13px 25px !important;
		}
		.cghp_button {
			display:inline-block;
			margin:2px 5px;
			padding:5px;
			color:#ffffff;
			border:1px solid #666666;
		}
		.cghp_button:active,
		.cghp_button:hover {
			background-color:rgba(128,128,128,0.2);
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
		}
		.cghp_cm_help_list a:active,
		.cghp_cm_help_list a:hover {
			background-color:#666666;
		}
		.cghp_cm_help_list li {
			display:inline-block;
			-webkit-box-sizing:border-box;
			margin:0;
			padding:0;
			width:96px;
		}
		.cghp_fg_blue {
			color:#00ccff;
		}
		.cghp_fg_orange {
			color:#ff9933;
		}
		.cghp_fg_yellow {
			color:#ffcc00;
		}
		.cghp_fg_red {
			color:#ff0000;
		}
		.cghp_font_120pct {
			font-size:120% !important;
		}
		.cghp_hide {
			display:none !important;
		}
		.cghp_idol_ext_link {
			-webkit-column-count:2;
			-webkit-column-gap:0;
			margin:0;
			width:75px;
			height:15px;
			text-align:center;
		}
		.cghp_idol_ext_link.col3 {
			-webkit-column-count:3;
		}
		.cghp_idol_ext_link a {
			display:block;
			height:100%;
			text-decoration:none;
			line-height:1;
			background-color:#222222;
		}
		.cghp_idol_ext_link a:first-child {
			-webkit-border-bottom-left-radius:7px;
		}
		.cghp_idol_ext_link a:last-child {
			-webkit-border-bottom-right-radius:7px;
		}
		.cghp_idol_ext_link a:active,
		.cghp_idol_ext_link a:hover {
			background-color:#666666;
		}
		.cghp_idol_ext_link i {
			font-size:0.8em;
		}
		.cghp_icon_area {
			margin:0 auto;
			padding:7px 0 4px;
		}
		.cghp_link {
			cursor:pointer;
		}
		.cghp_market_price {
			display:block;
			-webkit-box-sizing:border-box;
			background-color:#333333;
			text-align:center;
			color:#ffffff;
		}
		.cghp_margin_b0 {
			margin-bottom:0 !important;
		}
		.cghp_margin_b5 {
			margin-bottom:5px !important;
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
		.cghp_margin_t0 {
			margin-top:0 !important;
		}
		.cghp_margin_t5 {
			margin-top:5px !important;
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
		.cghp_menu_list {
			display:-webkit-box;
			margin:0;
			padding:0;
			width:320px;
		}
		.cghp_menu_list a {
			display:block;
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
			-webkit-box-flex:1;
			margin:1px;
			padding:0;
			width:320px;
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
		.cghp_menu_list .cghp_add_area_gray {
			margin:0;
			padding:5px 0;
			width:320px;
			color:#ffffff;
			font-size:9pt;
		}
		.cghp_name_area {
			padding-bottom:5px;
		}
		.cghp_no_icon {
			padding:8px 0;
		}
		.cghp_overlay a,
		.cghp_overlay input,
		.cghp_overlay select {
			visibility:hidden !important;
		}
		.cghp_set_leader {
			text-align:right;
			margin: 6px 0;
		}
		.cghp_show {
			display:"" !important;
		}
		.cghp_star_gray::after,
		.cghp_star_orange::after,
		.cghp_star_red::after,
		.cghp_star_yellow::after {
			content:"★";
			color:#666666;
			text-shadow:0 0 2px #533713, 1px 1px 1px #1d1d1d;
			font-style:normal;
		}
		.cghp_star_orange::after {
			color:#ff6600 !important;
		}
		.cghp_star_red::after {
			color:#ff0000 !important;
		}
		.cghp_star_yellow::after {
			color:#ffcc00 !important;
		}
		.cghp_strike {
			text-decoration:line-through;
		}
		.cghp_trade_want_img {
			width:1.8rem;
			vertical-align: middle;
		}
		.cghp_trade_want_val {
			font-size:1.8rem;
			vertical-align:middle;
		}
		.menu_colse #cghpCustomMenu {
			display:none;
		}
		.menu_open #cghpCustomMenu {
			display:"";
		}

		*/}).toString().replace(/^function.+\/\*\s*|\s*\*\/\s*}$/g, '');

		var style = $create('style');
		style.type = 'text/css';
		style.innerHTML = css;
		insertToHead(style);
	})();

	// -------------------------------------------------------------------------
	// アイコン用CSS読み込み
	// -------------------------------------------------------------------------
	(function() {
		// Font Awesome (http://fortawesome.github.com/Font-Awesome/)
		var link = $create('link');
		link.href = '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css';
		link.rel = 'stylesheet';
		insertToHead(link);
	})();

	// -------------------------------------------------------------------------
	// カスタムメニュー用URL取得
	// -------------------------------------------------------------------------
	(function() {
		// 各種イベントURL (マイスタジオ or お仕事TOP)
		if (/%2Fmypage(?:%2F|%3F|$)/.test(_param) || (/%2Fquests(?:%3F|$)/).test(_param)) {
			var headerAccordion = $id('headerAccordion');
			if (headerAccordion) {
				var eventLink = headerAccordion.querySelector('div.bannerArea2 a');
				if (eventLink && eventLink.href !== _settings.event_url) {
					_settings.event_url = eventLink.href;
					saveSettings('event_url');
				}
			}
		}
		// プロダクションチャットURL (プロダクションTOP)
		if (/%2Fknights%2Fknights_top_for_member(?:%3F|$)/.test(_param)) {
			var chatDiv = _doc.querySelector('div[data-plugins-type="mbga-game-chat"]');
			if (chatDiv) {
				var talkId = chatDiv.getAttribute('data-talk-id');
				if (talkId) {
					var chatUrl = 'http://sp.mbga.jp/_chat_app?u=/talk&id=' + talkId;
					if (chatUrl !== _settings.chat_url) {
						_settings.chat_url = chatUrl;
						saveSettings('chat_url');
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// カスタムメニュー生成
	// -------------------------------------------------------------------------
	var _customMenu = [];
	_customMenu[1] = { 'fullName': 'ショップ', 'shortName': 'ｼｮｯﾌﾟ', 'icon': 'fa-shopping-cart', 'url': _baseURL + 'shop%2Findex' };
	_customMenu[2] = { 'fullName': 'アイテム', 'shortName': 'ｱｲﾃﾑ', 'icon': 'fa-archive', 'url': _baseURL + 'item%2Findex' };
	_customMenu[3] = { 'fullName': '贈り物', 'shortName': '贈り物', 'icon': 'fa-gift', 'url': _baseURL + 'present%2Frecieve%2F%3Fview_auth_type%3D1%26cache%3D1' };
	_customMenu[4] = { 'fullName': 'ｱｲﾄﾞﾙ一覧', 'shortName': '一　覧', 'icon': 'fa-list-alt', 'url': _baseURL + 'card_list%2Findex' };
	_customMenu[5] = { 'fullName': 'トレード', 'shortName': 'ﾄﾚｰﾄﾞ', 'icon': 'fa-refresh', 'url': _baseURL + 'trade_response%2Ftrade_list_advance' };
	_customMenu[6] = { 'fullName': '編　成', 'shortName': '編　成', 'icon': 'fa-group', 'url': _baseURL + 'deck%2Findex' };
	_customMenu[7] = { 'fullName': 'メダル交換', 'shortName': '交　換', 'icon': 'fa-exchange', 'url': _baseURL + 'exchange%2Fmedal_list%2F999999' };
	_customMenu[8] = { 'fullName': '女子寮', 'shortName': '女子寮', 'icon': 'fa-home', 'url': _baseURL + 'card_storage%2Findex' };
	_customMenu[9] = { 'fullName': '衣　装', 'shortName': '衣　装', 'icon': 'fa-female', 'url': _baseURL + 'rareparts%2Findex' };
	_customMenu[10] = { 'fullName': 'お気に入り', 'shortName': 'ｵｷﾆｲﾘ', 'icon': 'fa-heart', 'url': _baseURL + 'friend%2Findex' };
	_customMenu[11] = { 'fullName': 'ホシイモノ', 'shortName': 'ﾎｼｲﾓﾉ', 'icon': 'fa-tags', 'url': _baseURL + 'wish%2Findex' };
	_customMenu[12] = { 'fullName': 'アルバム', 'shortName': 'ｱﾙﾊﾞﾑ', 'icon': 'fa-book', 'url': _baseURL + 'archive%2Findex' };
	_customMenu[13] = { 'fullName': 'PRA', 'shortName': 'PRA', 'icon': 'fa-trophy', 'url': _baseURL + 'p_ranking_award' };
	_customMenu[14] = { 'fullName': 'PRA(個人)', 'shortName': 'PRA個', 'icon': 'fa-trophy', 'url': _baseURL + 'p_ranking_award%2Franking_for_user%2F0%2F1' };
	_customMenu[15] = { 'fullName': 'PRA(プロ)', 'shortName': 'PRAﾌﾟﾛ', 'icon': 'fa-trophy', 'url': _baseURL + 'p_ranking_award%2Franking_for_production%2F0%2F1' };
	_customMenu[16] = { 'fullName': '設　定', 'shortName': '設　定', 'icon': 'fa-cog', 'url': _baseURL + 'personal_option' };
	_customMenu[17] = { 'fullName': 'ヘルプ', 'shortName': 'ヘルプ', 'icon': 'fa-question', 'url': _baseURL + 'advise%2Findex%2Ftop' };
	_customMenu[18] = { 'fullName': 'トップ', 'shortName': 'トップ', 'icon': 'fa-star', 'url': _topURL };
	_customMenu[19] = { 'fullName': '特　訓', 'shortName': '特　訓', 'icon': 'fa-music', 'url': _baseURL + 'card_union' };
	_customMenu[20] = { 'fullName': '移　籍', 'shortName': '移　籍', 'icon': 'fa-truck', 'url': _baseURL + 'card_sale%2Findex' };
	_customMenu[21] = { 'fullName': 'お仕事', 'shortName': 'お仕事', 'icon': 'fa-calendar-o', 'url': _baseURL + 'quests' };
	_customMenu[22] = { 'fullName': 'LIVEバトル', 'shortName': 'LIVE', 'icon': 'fa-bolt', 'url': _baseURL + 'battle' };
	_customMenu[23] = { 'fullName': 'ﾌﾟﾛﾀﾞｸｼｮﾝ', 'shortName': 'プ　ロ', 'icon': 'fa-building-o', 'url': _baseURL + 'knights%2Fknights_top_for_member' };
	_customMenu[24] = { 'fullName': 'チャット', 'shortName': 'ﾁｬｯﾄ', 'icon': 'fa-comments', 'url': _settings.chat_url };
	_customMenu[25] = { 'fullName': 'イベント', 'shortName': 'ｲﾍﾞﾝﾄ', 'icon': 'fa-flag', 'url': _settings.event_url };
	_customMenu[26] = { 'fullName': '道　場', 'shortName': '道　場', 'icon': 'fa-list-ol', 'url': _settings.dojo_url };
	_customMenu[101] = { 'fullName': 'カスタム1', 'shortName': 'ｶｽﾀﾑ1', 'icon': 'fa-cogs', 'url': _settings.custom_url1 };
	_customMenu[102] = { 'fullName': 'カスタム2', 'shortName': 'ｶｽﾀﾑ2', 'icon': 'fa-cogs', 'url': _settings.custom_url2 };
	_customMenu[103] = { 'fullName': 'カスタム3', 'shortName': 'ｶｽﾀﾑ3', 'icon': 'fa-cogs', 'url': _settings.custom_url3 };
	_customMenu[104] = { 'fullName': 'カスタム4', 'shortName': 'ｶｽﾀﾑ4', 'icon': 'fa-cogs', 'url': _settings.custom_url4 };
	_customMenu[105] = { 'fullName': 'カスタム5', 'shortName': 'ｶｽﾀﾑ5', 'icon': 'fa-cogs', 'url': _settings.custom_url5 };

	(function() {
		var headerNavi = $id('headerNavi');
		if (headerNavi) {
			var customMenu = [];
			for (var i = 1; i <= 3; i++) {
				var key = 'custom_menu' + i;
				var menuItemLen = _settings[key].length||0;
				if (0 < menuItemLen) {
					customMenu.push('<ul id="cghpCustomMenuList' + i + '" class="cghp_menu_list">');
					for (var j = 0; j < menuItemLen; j++) {
						var menuIndex = _settings[key][j];
						customMenu.push('<li>');
						if (_customMenu[menuIndex]) {
							var menu = _customMenu[menuIndex];
							var name = (menuItemLen < 6) ? menu.fullName : menu.shortName;
							if (_settings.custom_menu_icon) {
								customMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' fa fa-lg"></i></div><div class="cghp_name_area">' + name + '</div></a>');
							} else {
								customMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + name + '</a>');
							}
						}
						customMenu.push('</li>');
					}
					customMenu.push('</ul>');
				}
			}

			var customMenuDiv = $create('div');
			customMenuDiv.id = 'cghpCustomMenu';
			customMenuDiv.innerHTML = customMenu.join('');

			headerNavi.parentElement.insertBefore(customMenuDiv, headerNavi.nextSibling);
		}
	})();

	// -------------------------------------------------------------------------
	// マイスタジオ拡張
	// -------------------------------------------------------------------------
	(function() {
		if (/%2Fmypage(?:%2F|%3F)?/.test(_param)) {
			var recoveryTimeArea = $create('section');
			recoveryTimeArea.id = 'chgpRecoveryTimeAria';

			// 回復時間表示
			var importantMenu = _content.querySelector('section.importantMenu');
			if (importantMenu) {
				var valueDiv = importantMenu.querySelectorAll('div.value')||[];
				for (var i = 0, len = valueDiv.length; i < len; i++) {
					var div = valueDiv[i];
					var matches = (div.textContent.match(/^(?:スタミナ|攻コスト)\s+(\d+)\s*\/\s*(\d+)$/)||[]);
					var cost = { 'current': null, 'max': null };
					if (matches.length === 3) {
						cost.current = toNumber(matches[1]);
						cost.max = toNumber(matches[2]);
					} else {
						continue;
					}
					var coeff = ((/^スタミナ/).test(div.textContent)) ? 3 : 1;
					var restCost = cost.max - cost.current;
					if (0 !== restCost) {
						var date = new Date();
						date.setTime(date.getTime() + (coeff * restCost * 60 * 1000));
						var recoveryTime = $create('div');
						recoveryTime.innerHTML = '(<span class="yellow">' +
							('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) +
							'</span>に全回復)';
						recoveryTimeArea.appendChild(recoveryTime);
					}
					importantMenu.insertBefore(recoveryTimeArea, importantMenu.firstChild);
				}
			}
			// ID取得
			var mobageId = null;
			var profileTagTable = _content.querySelector('section.areaLine01 table');
			if (profileTagTable) {
				var profileURL = profileTagTable.querySelector('section.areaLine01 input[type="text"]');
				if (profileURL) {
					mobageId = (profileURL.value.match(/%2Fprofile%2Fshow%2F(\d+)/)||[])[1]||null;
					if (mobageId) {
						if (_settings.mobage_id !== mobageId) {
							_settings.mobage_id = mobageId;
							saveSettings('mobage_id');
						}
						// 画面にIDを表示
						var myIdArea = $create('div');
						myIdArea.id = 'cghpMyId';
						myIdArea.className = 'cghp_margin_t10';
						myIdArea.innerHTML = 'ID：' + mobageId;
						profileTagTable.parentElement.insertBefore(myIdArea, profileTagTable.nextSibling);
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 贈り物拡張
	// -------------------------------------------------------------------------
	(function() {
		if (_settings.uncheckPresent && (/%2Fpresent%2Frecieve%2F/).test(_param)) {
			// 贈り物のチェックを外す
			var checkLink = _content.querySelector('.chks_change');
			if (checkLink) {
				dispatchClick(checkLink);
			}
		}
	})();

	// -------------------------------------------------------------------------
	// フロントメンバー編成拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fdeck%2Fdeck_edit_top%3F/).test(_param)) {
            var i;

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
			for (i = 0; i < targetLinkLen; i++) {
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
			for (i = 0; i < targetSpanLen; i++) {
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
		if ((/(?:%2F|%3F)card_(?:list|sale|storage|str|union)(?:%2F|%3F|$)/).test(_param) ||
			(/(?:%2F|%3F)deck|auction|exchange(?:%2F|%3F|$)/).test(_param) ||
			(/(?:%2F|%3F)deck_modify_card|event_deck_edit(?:%2F|%3F|$)/).test(_param)) {
			var imageBaseURL = 'http://sp.pf-img-a.mbga.jp/12008305?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2F';
			var imageURL = {
				'ｽﾀﾐﾅﾄﾞﾘﾝｸ': imageBaseURL + 'image_sp%2Fitem%2Fm%2F1.jpg',
				'ｴﾅｼﾞｰﾄﾞﾘﾝｸ': imageBaseURL + 'image_sp%2Fitem%2Fm%2F2.jpg',
				'鍵付きｸﾛｰｾﾞｯﾄ': imageBaseURL + 'image_sp%2Fitem%2Fm%2F3.jpg',
				'ﾏﾆｰ': _baseURL + 'image_sp%2Fui%2Ficon_many_m.jpg',
			};

			// アイドル情報を取得
			var targetDiv = _content.querySelectorAll('div.idolStatus')||[];
			for (var i = 0, len = targetDiv.length; i < len; i++) {
				var idolStatusDiv = targetDiv[i];
				var idol = { 'id': null, 'name': null, 'type': null, 'rarity': null, 'cost': null, 'attack': null, 'defense': null, 'skillLv': null };

				// IDの取得
				var detailLink = idolStatusDiv.querySelector('h4.nameArea > a');
				if (detailLink) {
					idol.id = (detailLink.href.match(/%2Fcard_list%2Fdesc%2F(\d+)/)||[])[1]||null;
				}
				// 名前の取得
				var nameDiv = idolStatusDiv.querySelector('div.name');
				if (nameDiv) {
					idol.name = nameDiv.textContent;
				}
				// 属性の取得
				var typeDiv = idolStatusDiv.querySelector('div.type');
				if (typeDiv) {
					idol.type = (typeDiv.className.match(/\batt_([1-3])\b/)||[])[1]||null;
				}
				// レアリティの取得
				var rarityDiv = idolStatusDiv.querySelector('div.rarity');
				if (rarityDiv) {
					idol.rarity = (rarityDiv.className.match(/\br_([1-6])\b/)||[])[1]||null;
				}
				// コストの取得
				var costDiv = idolStatusDiv.querySelector('div.title.cost ~ div.pr');
				if (costDiv) {
					idol.cost = toNumber(costDiv.textContent);
				}
				// 攻発揮値の取得
				var attackDiv = idolStatusDiv.querySelector('div.title.att ~ div.pr');
				if (attackDiv) {
					idol.attack = toNumber(attackDiv.textContent);
				}
				// 守発揮値の取得
				var defenseDiv = idolStatusDiv.querySelector('div.title.def ~ div.pr');
				if (defenseDiv) {
					idol.defense = toNumber(defenseDiv.textContent);
				}
				// 特技Lvの取得
				var skillLvDiv = idolStatusDiv.querySelector('div.title.skl_lv ~ div.pr');
				if (skillLvDiv) {
					idol.skillLv = toNumber(skillLvDiv.textContent);
				}
				// コストあたりの発揮値追加
				if (isNumeric(idol.cost) && isNumeric(idol.attack) && isNumeric(idol.defense)) {
					// 攻コスト比
					var attackRatio = round(idol.attack / idol.cost, 1);
					var attackRatioDiv = $create('div');
					attackRatioDiv.innerHTML = '(' + attackRatio + ')';
					attackDiv.appendChild(attackRatioDiv);
					// 守コスト比
					var defenseRatio = round(idol.defense / idol.cost, 1);
					var defenseRatioDiv = $create('div');
					defenseRatioDiv.innerHTML = '(' + defenseRatio + ')';
					defenseDiv.appendChild(defenseRatioDiv);
				}
				// 特技レベルアイコン追加(Lv1～9：灰色、Lv10：黄色、Lv11：橙色、Lv12：赤色)
				if (isNumeric(idol.skillLv)) {
					var skillLvIcon = 'cghp_star_gray';
					switch (idol.skillLv) {
						case 10: skillLvIcon = 'cghp_star_yellow'; break;
						case 11: skillLvIcon = 'cghp_star_orange'; break;
						case 12: skillLvIcon = 'cghp_star_red'; break;
					}
					var skillLvIconSpan = $create('span');
					skillLvIconSpan.innerHTML = '&nbsp;<i class="' + skillLvIcon + '"></i>';
					skillLvDiv.appendChild(skillLvIconSpan);
				}
				// ステータス＆トレード相場＆トレード成立履歴リンク追加
				var imgDiv = idolStatusDiv.querySelector('div.img');
				if (imgDiv) {
					var idolExtLinkSection = $create('section');
					idolExtLinkSection.className = 'cghp_idol_ext_link';
					var linkHTML = '';

					var encName;

					// ステータス
					if (idol.name) {
						encName = encodeURIComponent(idol.name);
						var statusURL = 'http://imas.cg.db.n-hokke.com/idols/' + encName;
						linkHTML += '<a href="' + statusURL + '"><i class="fa-smile-o fa cghp_fg_yellow"></i></a>';
					}
					// トレード相場
					if (idol.name && idol.type && idol.rarity && idol.cost) {
						encName = encodeURIComponent(idol.name);
						var marketPriceURL = 'http://mobile-trade.jp/mobamasu/bazaar?' +
							'lt=' + encName + '&' +
							'la%5B%5D=' + idol.type + '&' +
							'lr%5B%5D=' + idol.rarity + '&' +
							'lcl=' + idol.cost + '&' +
							'lch=' + idol.cost + '&' +
							'sort=321';
						linkHTML += '<a href="' + marketPriceURL + '"><i class="fa-jpy fa cghp_fg_red"></i></a>';
					}
					// トレード履歴＠フリートレード画面
					if ((/%2Fauction(?:%2F|%3F)/).test(_param)) {
						var idolSearchLink = idolStatusDiv.querySelector('div.grayButton80 > a');
						if (idolSearchLink) {
							var albumId = (idolSearchLink.href.match(/%2Fsearch_top%2F0%2F(\d+)/)||[])[1]||null;
							if (albumId) {
								var historyURL = _baseURL + 'auction%2Fhistory%2F' + albumId + '%3Fl_frm%3Dauction_1';
								linkHTML += '<a href="' + historyURL + '"><i class="fa-bar-chart-o fa cghp_fg_blue"></i></a>';
								$addClass(idolExtLinkSection, 'col3');
							}
						}
					}

					idolExtLinkSection.innerHTML = linkHTML;
					imgDiv.appendChild(idolExtLinkSection);
				}
				// レイアウト変更＠フリートレード画面
				if ((/%2Fauction(?:%2F|%3F)/).test(_param)) {
					// 希望品を少し見やすくする
					var wantList = idolStatusDiv.querySelectorAll('div.pr.want li')||[];
					for (var j = 0, jlen = wantList.length; j < jlen; j++) {
						var list = wantList[j];
						var itemName = null;
						var itemValue = null;

						var item;

						item = (list.textContent.match(/^(ｽﾀﾐﾅﾄﾞﾘﾝｸ|ｴﾅｼﾞｰﾄﾞﾘﾝｸ|鍵付きｸﾛｰｾﾞｯﾄ) \((\d+)\)$/)||[]);
						if (item.length === 3) {
							// アイテム
							itemName = item[1];
							itemValue = item[2];
						} else {
							item = (list.textContent.match(/^([\d,]+)(ﾏﾆｰ)$/)||[]);
							if (item.length === 3) {
								// マニー
								itemName = item[2];
								itemValue = item[1];
							}
						}
						// HTML書き換え
						if (itemName && itemValue) {
							var itemHtml = '';
							var image = (itemName in imageURL) ? imageURL[itemName] : null;
							if (image) {
								itemHtml += '<img src="' + image + '" alt="' + itemName + '" class="cghp_trade_want_img">';
							}
							itemHtml += ' ' + itemName + ' × <span class="cghp_trade_want_val cghp_fg_orange">' + itemValue + '</span>';
							list.innerHTML = itemHtml;
						}
					}
				}
				// リーダー選択リンク追加＠所属アイドル一覧
				if ((/%2Fcard_list(?:%2F|%3F)/).test(_param)) {
					// リーダー以外に適用
					var leaderDiv = idolStatusDiv.querySelector('div.leader');
					if (leaderDiv == null && idol.id) {
						var setLeaderDiv = $create('div');
						setLeaderDiv.className = 'cghp_set_leader';
						setLeaderDiv.innerHTML = '<form name="select_form" action="' +
							_baseURL + 'deck%2Fdeck_set_leader_card%3Fno%3D1%26l_frm%3DDeck_1" method="post">' +
							'<input type="submit" value="ﾘｰﾀﾞｰにする">' +
							'<input type="hidden" name="s" value="">' +
							'<input type="hidden" name="type" value="">' +
							'<input type="hidden" name="sleeve" value="' + idol.id + '">' +
							'</form>';
						idolStatusDiv.appendChild(setLeaderDiv);
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// アイドル詳細拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fcard_list%2Fdesc%2F/).test(_param)) {
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
	// 女子寮拡張
	// -------------------------------------------------------------------------
	(function() {
		// 入寮・退寮ボタンを画面上部に複製
		if ((/%2Fcard_storage%2F(?:push|pop)_index%2F/).test(_param)) {
			var targetForm = _content.querySelector('form[name="sell_form"]');
			if (targetForm) {
				var submitButton = targetForm.querySelector('input[type="submit"]');
				var submitButton2 = submitButton.cloneNode(false);
				submitButton2.className = 'cghp_margin_t10 cghp_margin_b15';
				$bind(submitButton2, 'click', function() {
					targetForm.submit();
				});
				targetForm.parentElement.insertBefore(submitButton2, targetForm);
			}
		}
	})();

	// -------------------------------------------------------------------------
	// レッスン拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fcard_str(%2Fflash|SsSsflash)%3F/).test(_param)) {
			// 追加メニュー表示
			var flashMenuList = [
				{ 'name': 'マイスタジオ', 'icon': 'fa-headphones', 'url': _baseURL + 'mypage' },
				{ 'name': 'レッスン画面に戻る', 'icon': 'fa-undo', 'url': _baseURL + 'card_str' }
			];

			var flashMenu = [];
			var menu;

			flashMenu.push('<ul class="cghp_menu_list">');
			for (var i = 0, len = flashMenuList.length; i < len; i++) {
				menu = flashMenuList[i];
				flashMenu.push('<li>');
				if (_settings.custom_menu_icon) {
					flashMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' fa fa-lg"></i></div><div class="cghp_name_area">' + menu.name + '</div></a>');
				} else {
					flashMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + menu.name + '</a>');
				}
				flashMenu.push('</li>');
			}
			flashMenu.push('</ul>');

			// レッスン情報表示
			var pattern = /(?:%3F|%26)(\w+)%3D(\w+)/g;
			var match = [];
			var qs = {};
			while (match = pattern.exec(_param)) {
				qs[match[1]] = match[2];
			}
			flashMenu.push('<ul class="cghp_menu_list"><li>');
			flashMenu.push('<div class="cghp_add_area_gray">');
			// 成長度
			var grow_prm = toNumber(qs.fix_prm) - toNumber(qs.now_prm);
			flashMenu.push('Ex：<span class="cghp_fg_orange">' + grow_prm + '%</span>');
			// レベル
			var grow_lv = Math.floor(toNumber(qs.fix_prm) / 100) - Math.floor(toNumber(qs.now_prm) / 100);
			var now_lv = toNumber(qs.bef_lv) + grow_lv;
			flashMenu.push(' Lv：<span class="cghp_fg_orange">' + now_lv + ' (+' + grow_lv + ')' + '</span>');
			// 特技レベル
			if (toNumber(qs.skill_lv_up) === 1) {
				var aft_mys = toNumber(qs.aft_mys);
				var bef_mys = qs.aft_mys - 1;
				flashMenu.push(' <span class="cghp_fg_blue">特技LvUP! (' + bef_mys + ' → ' + aft_mys + ')</span>');
			}
			flashMenu.push('</div>');
			flashMenu.push('</li></ul>');

			menu = $create('div');
			menu.id = 'cghpFlashMenu';
			menu.innerHTML = flashMenu.join('');
			_body.insertBefore(menu, _body.firstChild);
		}
	})();

	// -------------------------------------------------------------------------
	// 特訓拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fcard_union(%2Fflush|SsSsflush)%3F/).test(_param)) {
			// 追加メニュー表示
			var flashMenuList = [
				{ 'name': 'マイスタジオ', 'icon': 'fa-headphones', 'url': _baseURL + 'mypage' },
				{ 'name': '別のｱｲﾄﾞﾙを特訓させる', 'icon': 'fa-music', 'url': _baseURL + 'card_union' }
			];

			var flashMenu = [];
			var menu;

			flashMenu.push('<ul class="cghp_menu_list">');
			var flashMenuListLen = flashMenuList.length||0;
			for (var i = 0; i < flashMenuListLen; i++) {
				menu = flashMenuList[i];
				flashMenu.push('<li>');
				if (_settings.custom_menu_icon) {
					flashMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' fa fa-lg"></i></div><div class="cghp_name_area">' + menu.name + '</div></a>');
				} else {
					flashMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + menu.name + '</a>');
				}
				flashMenu.push('</li>');
			}
			flashMenu.push('</ul>');

			menu = $create('div');
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
			var targetDiv = _content.querySelector('div.m-Btm5.t-Cnt');
			if (targetDiv) {
				var divText = targetDiv.textContent;
				var matches = divText.match(/攻ｺｽﾄ:(\d+)\s*⇒\s*(\d+)/);
				if (matches) {
					var setAttackCostLimitArea = $create('div');
					setAttackCostLimitArea.className = 'cghp_center cghp_add_area_gray cghp_margin_t10 cghp_margin_b10';
					var setAttackCostLimit = [];
					setAttackCostLimit.push('消費攻ｺｽﾄ上限値：');
					setAttackCostLimit.push('<input id="cghpAttackCostLimit" type="tel" size="4" value="' + _settings.atack_cost_limit + '">');
					setAttackCostLimit.push('<a id="cghpSetAttackCostLimit" class="cghp_button cghp_margin_t0">O K</a>');
					setAttackCostLimit.push('<div class="yellow">0を設定すると機能が無効になります</div>');
					setAttackCostLimitArea.innerHTML = setAttackCostLimit.join('');
					targetDiv.parentElement.insertBefore(setAttackCostLimitArea, targetDiv.nextSibling);

					var setAttackCostButton = $id('cghpSetAttackCostLimit');
					$bind(setAttackCostButton, 'click', function() {
						var limit = $id('cghpAttackCostLimit');
						if (limit) {
							var value = toNumber(limit.value);
							if (isNumeric(value) && (/\d+/).test(value)) {
								_settings.atack_cost_limit = value;
								saveSettings('atack_cost_limit');
								_location.replace(_location.href);
							} else {
								window.alert('整数を入力してください。');
							}
						}
					});

					if (0 < _settings.atack_cost_limit) {
						var beforeCost = toNumber(matches[1]);
						var afterCost = toNumber(matches[2]);
						if (isNumeric(beforeCost) && isNumeric(afterCost)) {
							var cost = beforeCost - afterCost;
							if (_settings.atack_cost_limit < cost) {
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
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// Liveバトル拡張＠Live中
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fbattles%2F(?:battle_processing|flash|win_or_lose)(?:%2F|%3F)/).test(_param) ||
			(/%2FbattlesSsSs(flash|win_or_loseSsSs)(?:%2F|%3F)/).test(_param)) {
			var enemyId = (_param.match(/(?:%3F|%26)(?:rnd|enemy_id)%3D(\d+)/)||[])[1]||null;
			if (enemyId != null) {

				var flashMenuList = [
					{ 'name': 'ﾏｲｽﾀｼﾞｵ', 'icon': 'fa-headphones', 'url': _baseURL + 'mypage' },
					{ 'name': '応　援', 'icon': 'fa-user', 'url': _baseURL + 'cheer%2Findex%2F' + enemyId + '%2F1' },
					{ 'name': '道　場', 'icon': 'fa-list-ol', 'url': _settings.dojo_url },
					{ 'name': '戻　る', 'icon': 'fa-undo', 'url': _baseURL + 'battles%2Fbattle_check%2F' + enemyId }
				];

				var flashMenu = [];
				var menu;

				flashMenu.push('<ul class="cghp_menu_list">');
				var flashMenuListLen = flashMenuList.length||0;
				for (var i = 0; i < flashMenuListLen; i++) {
					menu = flashMenuList[i];
					flashMenu.push('<li>');
					if (_settings.custom_menu_icon) {
						flashMenu.push('<a href="' + menu.url + '"><div class="cghp_icon_area"><i class="' + menu.icon + ' fa fa-lg"></i></div><div class="cghp_name_area">' + menu.name + '</div></a>');
					} else {
						flashMenu.push('<a href="' + menu.url + '" class="cghp_no_icon">' + menu.name + '</a>');
					}
					flashMenu.push('</li>');
				}
				flashMenu.push('</ul>');

				menu = $create('div');
				menu.id = 'cghpFlashMenu';
				menu.innerHTML = flashMenu.join('');
				_body.insertBefore(menu, _body.firstChild);
			}
		}
	})();


	// -------------------------------------------------------------------------
	// レベルアップ計算＠通常お仕事(演出OFF)
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fquests%2Fget_\w+(?:%2F|%3F)/).test(_param)) {
			var status = getWorkStatus(0);
			var insertTarget = _content.querySelector('form[name="quest_form"]').nextSibling;
			insertExpInfo(status, insertTarget, 'cghp_margin_t10 cghp_add_area_gray');
		}
	})();

	// -------------------------------------------------------------------------
	// レベルアップ計算＠各種イベント時お仕事(演出OFF)
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fevent_\w+%2F(?:mission_list|get_\w+)(?:%2F|%3F)/).test(_param)) {
			var status = getWorkStatus(0);
			// 後方一致だとファイル名の後にゴミが付いていて拾えないからここだけ部分一致
			var insertTarget = _content.querySelector('img[src*="%2Fline_hoshi.jpg"]');
			insertExpInfo(status, insertTarget, 'cghp_margin_t10 cghp_margin_b10 cghp_add_area_gray');
		}
	})();

	// -------------------------------------------------------------------------
	// レベルアップ計算＠お仕事全般(演出ON)
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2F(?:quests|event_\w+)%2Fwork(?:%2F|%3F)/).test(_param)) {
			var status = getWorkStatus(1);
			var insertTarget = $id('play_area').nextSibling;
			insertExpInfo(status, insertTarget, 'cghp_margin_b10 cghp_add_area_gray');

			if (status) {
				// ステータス変化時に表示を更新
				var timer = 0;
				var targetArea = $id('get_condition');
				if (targetArea) {
					$bind(targetArea, 'DOMSubtreeModified', function() {
						if (timer) {
							return;
						}
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

			if (!_settings.point_filter_hp) {
				$id('add_hp').parentNode.innerHTML = disabledMessage;
			}
			if (!_settings.point_filter_atk) {
				$id('add_atk').parentNode.innerHTML = disabledMessage;
			}
			if (!_settings.point_filter_def) {
				$id('add_def').parentNode.innerHTML = disabledMessage;
			}
			if (!_settings.point_filter_auto) {
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
			if (!_settings.point_filter_auto) {
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


	/**
	 * 指定順位表示ボタンクリック時のイベント
	 *
	 * @param id ボタンのid
	 * @param baseUrl 元々あるランキングのURL
	 * @param replaceUrl URLの置換する部分
	 */
	function onclickRankButton(id, baseUrl, replaceUrl) {
		var rankInput =$id(id);
		if (rankInput) {
			var targetRank = toNumber(rankInput.value);
			if (isNumeric(targetRank)) {
				var url = baseUrl.replace(replaceUrl + '%2F%3F', replaceUrl + '%2F0%2F' + (targetRank - 3) + '%3F');
				_location.assign(url);
			}
		}
	}

	/**
	 * ランキングのボタンを作成する
	 *
	 * @param baseLink 元々あるランキングのリンク
	 * @param options 作成するボタンの情報
	 */
	function generateRankingButtons(baseLink, options) {
		var i, rankingHtml = '', div, parent;
		var baseUrl = baseLink.href;

		// ボーダー
		for (i = 0; i < options.rankList.length; i++) {
			var rank = options.rankList[i];
			rankingHtml +=
				'<p class="frequentsButton eventFBColor_assault"><a href="' +
				baseUrl.replace(options.rankingType + options.borderUrl.src, options.rankingType + options.borderUrl.dest + (rank - 3) + '%3F') +
				'"><span class="bgArrow">' + rank + '位ボーダー</span></a></p>';
		}

		// プロダクション内個人順位/所属プロダクション順位
		rankingHtml +=
			'<p class="frequentsButton eventFBColor_assault"><a href="' +
			baseUrl.replace(options.rankingType + options.specialRanking.src, options.rankingType + options.specialRanking.dest) +
			'"><span class="bgArrow">' + options.specialRanking.name + '</span></a></p>';

		// 指定順位表示
		rankingHtml +=
			'<div class="cghp_center cghp_add_area_gray cghp_margin_t10">指定順位表示：' +
			'<input id="' + options.inputId + '" type="tel" size="8" maxlength="8"> 位 ' +
			'<a id="' + options.buttonId + '" class="cghp_button cghp_margin_t0 cghp_margin_b0">表示</a></div>';

		div = $create('div');
		div.innerHTML = rankingHtml;
		parent = baseLink.parentElement;
		parent.parentElement.insertBefore(div, parent.nextSibling);

		var rankButton = $id(options.buttonId);
		if (rankButton) {
			$bind(rankButton, 'click', onclickRankButton.bind(null, options.inputId, baseUrl, options.rankingType));
		}
	}

	// -------------------------------------------------------------------------
	// ランキング閲覧リンク生成＠各種イベント
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Fevent_ranking%2Franking_top%3F/).test(_param)) {
			var targetLink =  _content.querySelectorAll('a');
			var i, j;

			var rankingOptions = [
				{
					regExp: /個人順位確認/,
					generateOptions: {
						rankingType: 'ranking_for_user',
						rankList: [200, 1000, 2000, 4000, 7000],
						borderUrl: {
							src: '%2F%3F',
							dest: '%2F0%2F'
						},
						specialRanking: {
							name: 'プロダクション内個人順位',
							src: '%2F%3F',
							dest: '%2F2%3F'
						},
						inputId: 'kojinRankInput',
						buttonId: 'kojinRankButton'
					}
				},
				{
					regExp: /ﾌﾟﾛﾀﾞｸｼｮﾝ順位確認/,
					generateOptions: {
						rankingType: 'ranking_for_production',
						rankList: [10, 50, 200, 500, 1000],
						borderUrl: {
							src: '%2F%3F',
							dest: '%2F0%2F'
						},
						specialRanking: {
							name: '所属プロダクション順位',
							src: '%2F',
							dest: '%2F1%2F'
						},
						inputId: 'proRankInput',
						buttonId: 'proRankButton'
					}
				}
			];

			for (i = 0; i < targetLink.length; i++) {
				var link = targetLink[i];
				var linkHTML = link.innerHTML;

				for (j = 0; j < rankingOptions.length; j++) {
					if (rankingOptions[j].regExp.test(linkHTML)) {
						generateRankingButtons(link, rankingOptions[j].generateOptions);
					}
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 発揮値チェック＠アイドルLIVEツアー系
	// -------------------------------------------------------------------------
	(function() {
		var i, len, h3, span, button;

		if ((/%2Fevent_assault%2F(?:get_raid_boss|raid_lose)(?:%2F|%3F)/).test(_param)) {
			// ユニットNoを取得
			var unitNo = null;
			var h3Title = _content.querySelectorAll('h3.event_assault')||[];
			for (i = 0, len = h3Title.length; i < len; i++) {
				h3 = h3Title[i];
				var match = null;
				if (match = h3.textContent.match(/ﾕﾆｯﾄ(\d)/)) {
					unitNo = toNumber(match[1]);
					break;
				}
			}
			// 予想最大攻を取得
			var attackPower = null;
			var spanBlue = _content.querySelectorAll('span.blue')||[];
			for (i = 0, len = spanBlue.length; i < len; i++) {
				span = spanBlue[i];
				if ((/予想攻発揮値\(消費LP1\)\s*:/).test(span.textContent)) {
					attackPower = (span.nextSibling.textContent.match(/(\d+)/)||[])[1]||null;
					if (!attackPower) {
						attackPower = (span.nextElementSibling.textContent.match(/(\d+)/)||[])[1]||null;
						break;
					}
				}
			}
			if (!unitNo || !attackPower) {
				return;
			}
			var powerCheckKey = 'event_assault_power_check' + unitNo;
			// 設定した発揮値と予想最大攻が一致しない場合は、LIVE用のボタンを消す
			if (attackPower) {
				attackPower = toNumber(attackPower);
				var compPower = _settings[powerCheckKey];
				var attackButton = _content.querySelector('.assaultArea_02');
				if (attackButton) {
					var alertArea = $create('div');
					var alertClass = ['cghp_margin_b10', 'cghp_margin_t10'];
					var alertHtml = ['<h3>発揮値ﾁｪｯｸ (ﾕﾆｯﾄ' + unitNo + ')</h3>'];
					alertHtml.push('<span class="blue">設定値：</span>' + compPower);
					alertHtml.push('&nbsp;&nbsp;&nbsp;&nbsp;');
					alertHtml.push('<span class="blue">発揮値：</span>' + attackPower);
					alertHtml.push('&nbsp;&nbsp;&nbsp;&nbsp;');
					if (compPower <= 0) {
						// 無効
						alertClass.push('cghp_add_area_gray');
						alertHtml.push('<span class="yellow">無効</span>');
					} else if (compPower === attackPower) {
						// 一致
						alertClass.push('cghp_add_area_green');
						alertHtml.push('<span class="yellow">一致</span>');
					} else {
						// 不一致
						alertClass.push('cghp_add_area_red');
						alertClass.push('cghp_link');
						alertHtml.push('<span class="yellow">不一致</span>');
						alertHtml.push('<br>');
						alertHtml.push('<span class="yellow">ｸﾘｯｸすると一時的にLIVEボタンを表示</span>');
						$bind(alertArea, 'click', function() {
							$toggleClass(attackButton.querySelector('form'), 'cghp_hide');
						});
						// LIVEボタンを消す
						$addClass(attackButton.querySelector('form'), 'cghp_hide');
					}
					alertArea.className = alertClass.join(' ');
					alertArea.innerHTML = alertHtml.join('');
					attackButton.parentElement.insertBefore(alertArea, attackButton);
				}
			}
			// 発揮値設定フォームをページ下部に表示
			var setFunc = function(value) {
				var v = toNumber(value);
				if (isNumeric(v) && (/\d+/).test(v)) {
					_settings[powerCheckKey] = v;
					saveSettings(powerCheckKey);
					_location.replace(_location.href);
				} else {
					window.alert(unitNo + '整数を入力してください。');
				}
			};
			var frequentsButton = _content.querySelectorAll('.frequentsButton')||[];
			for (i = 0, len = frequentsButton.length; i < len; i++) {
				button = frequentsButton[i];
				if ((/ﾕﾆｯﾄﾒﾝﾊﾞｰ編成/).test(button.textContent)) {
					// ユニット編成リンクを現在選択中のユニット用のリンクにする
					var editLink = button.querySelector('a');
					if (editLink) {
						editLink.href += '%26type%3D' + unitNo;
					}
					var settingArea = $create('div');
					settingArea.className = 'cghp_add_area_gray cghp_center cghp_margin_t10';
					var settingForm = ['<h3>発揮値ﾁｪｯｸ設定 (ﾕﾆｯﾄ' + unitNo + ')</h3>'];
					settingForm.push('予想攻発揮値(消費LP1)：');
					settingForm.push('<input id="cghpAssaultPowerCheck" type="tel" size="8" value="' + _settings[powerCheckKey] + '">');
					settingForm.push('<br>');
					settingForm.push('<a id="cghpSetAssaultPowerCheckButton1" class="cghp_button cghp_margin_t10">入力値を設定</a>');
					settingForm.push('<a id="cghpSetAssaultPowerCheckButton2" class="cghp_button cghp_margin_t10">現在の発揮値を設定</a>');
					settingForm.push('<div class="yellow">ﾊﾟﾜｰ発揮後の発揮値を入力してください<br>0を設定すると機能が無効になります</div>');
					settingArea.innerHTML = settingForm.join('');
					button.parentElement.insertBefore(settingArea, button.nextSibling);

					var setButton1 = $id('cghpSetAssaultPowerCheckButton1');
					$bind(setButton1, 'click', setFunc.bind(null, $id('cghpAssaultPowerCheck').value));
					var setButton2 = $id('cghpSetAssaultPowerCheckButton2');
					$bind(setButton2, 'click', setFunc.bind(null, attackPower));
					break;
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// アルバム画面拡張
	// -------------------------------------------------------------------------
	(function() {
		if ((/%2Farchive%2Fview%2F/).test(_param)) {
			var albumId = (_param.match(/%2Fview%2F(\d+)/)||[])[1]||null;
			if (albumId) {
				var idolStatus = _content.querySelector('section.idolStatus.deck');
				if (idolStatus) {
					var div = $create('div');
					div.className = 't-Cnt';

					var searchURL = _baseURL + 'auction%2F2Fsearch_top%2F' + albumId + '%3Fl_frm%3Dauction_1';
					var link = div.appendChild($create('a'));
					link.innerHTML = '<a href="' + searchURL + '" class="grayButton300">' +
						'このｱｲﾄﾞﾙのでﾄﾚｰﾄﾞ検索</a>';

					var historyURL = _baseURL + 'auction%2Fhistory%2F' + albumId + '%3Fl_frm%3Dauction_1';
					link = div.appendChild($create('a'));
					link.innerHTML = '<a href="' + historyURL + '" class="grayButton300">' +
						'このｱｲﾄﾞﾙのﾄﾚｰﾄﾞ成立履歴</a>';

					idolStatus.parentElement.insertBefore(div, idolStatus.nextSibling);
				}
			}
		}
	})();

	// -------------------------------------------------------------------------
	// ユーザー設定画面
	// -------------------------------------------------------------------------
	(function() {
		var i, value;

		if ((/%2Fpersonal_option(?:%3F|&|$)/).test(_param)) {
			// 設定画面準備
			var settingMenu = [];
			settingMenu.push('<div id="cghpSettingArea">');
			settingMenu.push('<h2>IM@S CG Helper(仮) 設定</h2>');

			var hideBannerInMenuChecked = (_settings.hide_banner_in_menu) ? 'checked="checked"' : '';
			settingMenu.push('<section>');
			settingMenu.push('<h3><label>');
			settingMenu.push('<input id="cghpSetHideBannerInMenu" type="checkbox" ' + hideBannerInMenuChecked + '> ');
			settingMenu.push('メニュー内のバナーを消す');
			settingMenu.push('</label></h3>');
			settingMenu.push('</section>');
			var customMenuIconChecked = (_settings.custom_menu_icon) ? 'checked="checked"' : '';
			settingMenu.push('<section>');
			settingMenu.push('<h3><label>');
			settingMenu.push('<input id="cghpSetCustomMenuIcon" type="checkbox" ' + customMenuIconChecked + '> ');
			settingMenu.push('カスタムメニューにアイコンを表示');
			settingMenu.push('</label></h3>');
			settingMenu.push('</section>');
			for (i = 1; i <= 3; i++) {
				settingMenu.push('<section>');
				settingMenu.push('<h3>カスタムメニュー' + i + '（0～8個まで）');
				settingMenu.push('<a id="cghpHelpCustomMenu' + i + '" class="a_link cghp_cm_help_link">...</a>：</h3>');
				settingMenu.push('<p><input id="cghpSetCustomMenu' + i + '" type="text" pattern="^(?:\\d+(?:,\\s*\\d+){0,7})?$" value="' + _settings['custom_menu' + i].join(',') + '"></p>');
				settingMenu.push('</section>');
			}
			settingMenu.push('<section>');
			settingMenu.push('<h3>道場URL：</h3>');
			settingMenu.push('<p><input id="cghpSetDojoURL" type="url" value="' + _settings.dojo_url + '"></p>');
			settingMenu.push('</section>');
			for (i = 1; i <= 5; i++) {
				settingMenu.push('<section>');
				settingMenu.push('<h3>カスタムURL' + i + '：</h3>');
				settingMenu.push('<p><input id="cghpSetCustomURL' + i + '" type="url" value="' + _settings['custom_url' + i] + '"></p>');
				settingMenu.push('</section>');
			}
			settingMenu.push('<section>');
			settingMenu.push('<h3>ポイント振り分けフィルタ：</h3>');
			var pointFilterHPChecked = (_settings.point_filter_hp) ? 'checked="checked"' : '';
			settingMenu.push('<label>');
			settingMenu.push('<input id="cghpPointFilterHP" type="checkbox" ' + pointFilterHPChecked + '> ');
			settingMenu.push('スタミナ');
			settingMenu.push('</label><br>');
			var pointFilterAtkChecked = (_settings.point_filter_atk) ? 'checked="checked"' : '';
			settingMenu.push('<label>');
			settingMenu.push('<input id="cghpPointFilterAtk" type="checkbox" ' + pointFilterAtkChecked + '> ');
			settingMenu.push('攻コスト');
			settingMenu.push('</label><br>');
			var pointFilterDefChecked = (_settings.point_filter_def) ? 'checked="checked"' : '';
			settingMenu.push('<label>');
			settingMenu.push('<input id="cghpPointFilterDef" type="checkbox" ' + pointFilterDefChecked + '> ');
			settingMenu.push('守コスト');
			settingMenu.push('</label><br>');
			var pointFilterAutoChecked = (_settings.point_filter_auto) ? 'checked="checked"' : '';
			settingMenu.push('<label>');
			settingMenu.push('<input id="cghpPointFilterAuto" type="checkbox" ' + pointFilterAutoChecked + '> ');
			settingMenu.push('自動振り分け');
			settingMenu.push('</label><br>');
			settingMenu.push('</section>');
			settingMenu.push('<section>');
			settingMenu.push('<h3>');
			settingMenu.push('LIVEバトル時の消費コスト上限値：');
			settingMenu.push('<p><input id="cghpSetAttackCostLimit" type="tel" value="' + _settings.atack_cost_limit + '"></p>');
			settingMenu.push('</h3>');
			settingMenu.push('</section>');
			settingMenu.push('<section>');
			settingMenu.push('<h3>Flash画面の追加メニュー表示倍率：</h3>');
			settingMenu.push('<p><input id="cghpSetSwfZoom" type="number" min="0.05" step="0.05" value="' + _settings.swf_zoom + '"></p>');
			settingMenu.push('</section>');
			var uncheckPresentChecked = (_settings.uncheckPresent) ? 'checked="checked"' : '';
			settingMenu.push('<section>');
			settingMenu.push('<h3><label>');
			settingMenu.push('<input id="cghpSetUncheckPresent" type="checkbox" ' + uncheckPresentChecked + '> ');
			settingMenu.push('贈り物のチェックをはずす');
			settingMenu.push('</label></h3>');
			settingMenu.push('</section>');

			settingMenu.push('<p class="cghp_center cghp_margin_t20">');
			settingMenu.push('<input id="cghpOkButton" class="home" type="button" value="OK">');
			settingMenu.push('&nbsp;&nbsp;&nbsp;&nbsp;');
			settingMenu.push('<input id="cghpCancelButton" class="double" type="button" value="キャンセル">');
			settingMenu.push('</p>');
			settingMenu.push('<p id="cghpResetArea">');
			settingMenu.push('<input id="cghpResetButton" class="home grayButton300" type="button" value="設定を初期化">');
			settingMenu.push('</p>');
			settingMenu.push('</div>');

			var overlay = $create('div');
			overlay.id = 'cghpSettingOverlay';
			overlay.className = 'cghp_hide';
			overlay.innerHTML = settingMenu.join('');
			_body.insertBefore(overlay, _body.firstChild);

			// カスタムメニューのヘルプを作成
			var generateToggleHelp = function(element) {
				return function() {
					var helpArea;
					helpArea = $id('cghpCustomMenuHelp');
					if (helpArea) {
						helpArea.parentElement.removeChild(helpArea);
					} else {
						helpArea = element.parentElement.insertBefore($create('div'), element.nextSibling);
						helpArea.id = 'cghpCustomMenuHelp';
						var helpList = helpArea.appendChild($create('ul'));
						helpList.className = 'cghp_cm_help_list';
						_customMenu.forEach(function(value, index) {
							var helpItem = helpList.appendChild($create('li'));
							var helpLink = helpItem.appendChild($create('a'));
							helpLink.className = 'cghp_link';
							helpLink.innerHTML = index + '：' + value.fullName;
							$bind(helpLink, 'click', function() {
								element.value += (element.value === '') ? index : ',' + index;
							});
						});
					}
					help.visible = !help.visible;
				};
			};
			for (i = 1; i <= 3; i++) {
				var help = $id('cghpHelpCustomMenu' + i);
				var text = $id('cghpSetCustomMenu' + i);
				if (help && text) {
					help.visible = false;
					// ヘルプのトグル表示関数
					var toggleHelp = generateToggleHelp(text);
					$bind(help, 'click', toggleHelp);
				}
			}

			// OKボタン クリックイベント
			var okButton = $id('cghpOkButton');
			if (okButton) {
				$bind(okButton, 'click', function() {
					var urlPattern = /^s?https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:@&=+$,%#]+$/;

					var hideBannerInMenu = $id('cghpSetHideBannerInMenu');
					if (hideBannerInMenu) {
						_settings.hide_banner_in_menu = hideBannerInMenu.checked;
					}
					var customMenuIcon = $id('cghpSetCustomMenuIcon');
					if (customMenuIcon) {
						_settings.custom_menu_icon = customMenuIcon.checked;
					}
					for (var i = 1; i <= 3; i++) {
						var customMenu = $id('cghpSetCustomMenu' + i);
						if (customMenu) {
							var menuItem = [];
							var customMenuList = customMenu.value.split(',')||[];
							for (var j = 0, len = customMenuList.length; j < len; j++) {
								value = toNumber(trim((customMenuList[j]).toString()));
								if (isNumeric(value) && (/^\d+/).test(value)) {
									menuItem.push(value);
								}
							}
							if (menuItem.length <= 8) {
								_settings['custom_menu' + i] = menuItem;
							}
						}
					}
					var dojoURL = $id('cghpSetDojoURL');
					if (dojoURL) {
						value = trim(dojoURL.value);
						if (urlPattern.test(value)) {
							_settings.dojo_url = value;
						}
					}
					for (i = 1; i <= 5; i++) {
						var customURL = $id('cghpSetCustomURL' + i);
						if (customURL) {
							value = trim(customURL.value);
							if (urlPattern.test(value)) {
								_settings['custom_url' + i] = value;
							}
						}
					}
					var pointFilterHP = $id('cghpPointFilterHP');
					if (pointFilterHP) {
						_settings.point_filter_hp = pointFilterHP.checked;
					}
					var pointFilterAtk = $id('cghpPointFilterAtk');
					if (pointFilterAtk) {
						_settings.point_filter_atk = pointFilterAtk.checked;
					}
					var pointFilterDef = $id('cghpPointFilterDef');
					if (pointFilterDef) {
						_settings.point_filter_def = pointFilterDef.checked;
					}
					var pointFilterAuto = $id('cghpPointFilterAuto');
					if (pointFilterAuto) {
						_settings.point_filter_auto = pointFilterAuto.checked;
					}
					var attackCostLimit = $id('cghpSetAttackCostLimit');
					if (attackCostLimit) {
						value = toNumber(attackCostLimit.value);
						if (isNumeric(value) && (/\d+/).test(value)) {
							_settings.atack_cost_limit = value;
						}
					}
					var swfZoom = $id('cghpSetSwfZoom');
					if (swfZoom) {
						value = toNumber(swfZoom.value);
						if (isNumeric(value) && 1 < value) {
							_settings.swf_zoom = value;
						}
					}
					var uncheckPresent = $id('cghpSetUncheckPresent');
					if (uncheckPresent) {
						_settings.uncheckPresent = uncheckPresent.checked;
					}

					saveSettings();
					_location.replace(_location.href);
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
					if (window.confirm('設定を初期化します。よろしいですか？')) {
						deleteSettings();
						_location.replace(_location.href);
					}
				});
			}
			// 本スクリプトの設定画面呼び出しボタンを追加
			var settingLink = $create('a');
			settingLink.id = 'cghpSettingLink';
			settingLink.innerHTML = '<div id="cghpSettingButton" class="nextLink">IM@S CG Helper(仮)設定</div>';
			// リンクがクリックされたら設定画面を出して、閉じたときに有効な値だけを保存
			$bind(settingLink, 'click', function() {
				// オーバーレイ表示
				var overlay = $id('cghpSettingOverlay');
				if (overlay) {
					var zoom = _root.style.zoom||1;
					overlay.style.minHeight = (_body.scrollHeight / zoom) + 'px';
					$removeClass(overlay, 'cghp_hide');
				}
				// オーバーレイ表示中は下位レイヤーの邪魔な要素を非表示にする
				var pageArea = $id('pageArea');
				if (pageArea) {
					$addClass(pageArea, 'cghp_overlay');
				}
			});
			var targetDiv = _content.querySelector('div.nextLink');
			if (targetDiv) {
				var targetLink = targetDiv.parentElement;
				targetLink.parentElement.insertBefore(settingLink, targetLink);
			}
		}
	})();

	// -------------------------------------------------------------------------
	// アコーディオンメニュー拡張
	// -------------------------------------------------------------------------
	(function() {
		var headerAccordion = $id('headerAccordion');
		if (headerAccordion) {
			// イベントバナーを非表示にする
			if (_settings.hide_banner_in_menu) {
				var bannerArea2 = headerAccordion.querySelector('div.bannerArea2');
				$addClass(bannerArea2, 'cghp_hide');
			}
			// IDジャンプ用フォーム追加
			var acSubMenu = $id('acSubMenu');
			if (acSubMenu) {
				var idJumpArea = $create('div');
				idJumpArea.id = 'cghpIdJumpArea';
				idJumpArea.className = 'cghp_add_area_gray cghp_margin_t10';
				var idJumpHtml = ['<h3>指定したIDのﾌﾟﾛﾌｨｰﾙﾍﾟｰｼに移動</h3>'];
				idJumpHtml.push('ID：<input id="cghpIdJumpTarget" type="tel" size="14" min="0">');
				idJumpHtml.push('<a id="cghpIdJumpButton" class="cghp_button cghp_margin_t0 cghp_margin_b0">O K</a>');
				idJumpArea.innerHTML = idJumpHtml.join('');
				acSubMenu.parentElement.insertBefore(idJumpArea, acSubMenu.nextSibling);
				var idJumpButton = $id('cghpIdJumpButton');
				$bind(idJumpButton, 'click', function() {
					var targetId = $id('cghpIdJumpTarget');
					if (targetId) {
						var id = toNumber(targetId.value);
						if (isNumeric(id) && (/\d+/).test(id)) {
							var profileURL = _baseURL + 'profile%2Fshow%2F' + id + '%3Fl_frm%3DMypage_1';
							_location.assign(profileURL);
						} else {
							window.alert('整数を入力してください。');
						}
					}
				});
			}
		}
	})();

	// -------------------------------------------------------------------------
	// 肩書画像をクリックでローディングキャラを表示
	// -------------------------------------------------------------------------
	(function() {
		// 肩書画像を取得
		var exists = false;
		var targetImage = _content.querySelectorAll('img[src*="%2Fimage_sp%2Fui%2Ftrophy%2Ftitle_charge_"]');
		var targetImageLen = targetImage.length||0;
		var generateShowImage = function(imageFile) {
			return function(e) {
				$id('cghpLoadingCharImg').src = _baseURL + 'image_sp%2Fui%2Frich%2Fquest%2Floading%2F' + imageFile + '.gif';
				// スクロール位置に画像を移動
				// ページを拡大or縮小していると座標がずれるので計算にいれる
				var zoom = _root.style.zoom||1;
				var scrollTop = (_root.scrollTop || _body.scrollTop || window.pageYOffset);
				$id('cghpLoadingCharArea').style.top = (scrollTop / zoom) + 'px';
				// オーバーレイ表示
				var overlay = $id('cghpLoadingCharOverlay');
				if (overlay) {
					overlay.style.minHeight = (_body.scrollHeight / zoom) + 'px';
					$removeClass(overlay, 'cghp_hide');
				}
				// オーバーレイ表示中は下位レイヤーの邪魔な要素を非表示にする
				var pageArea = $id('pageArea');
				if (pageArea) {
					$addClass(pageArea, 'cghp_overlay');
				}
				e.preventDefault();
				e.stopPropagation();
			};
		};

		for (var i = 0; i < targetImageLen; i++) {
			var image = targetImage[i];
			var imageFile = (image.src.match(/%2Fimage_sp%2Fui%2Ftrophy%2Ftitle_charge_(\d+)/)||[])[1]||null;
			// 肩書画像IDが3桁なら先頭に5を付与、それ以外はそのまま
			imageFile = (imageFile.length === 3) ? '5' + imageFile : imageFile;
			if (imageFile) {
				// ローディングキャラ表示関数
				var showImage = generateShowImage(imageFile);
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
				e.preventDefault();
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
			loadingImage.src = 'http://ava-a.mbga.jp/i/dot.gif';

			_body.insertBefore(overlay, _body.firstChild);
		}
	})();

	// -------------------------------------------------------------------------
	// アイドル画像をクリックでズーム表示
	// -------------------------------------------------------------------------
	(function() {
		// アイドル画像を取得
		var exists = false;
		var imageBaseURL = 'http://sp.pf-img-a.mbga.jp/12008305?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2F';
		var framePath = 'image_sp%2Fcard%2Fl%2F';
		var noFramePath = 'image_sp%2Fcard%2Fl_noframe%2F';
		var targetImage = _content.querySelectorAll('img[src*="%2Fimage_sp%2Fcard%2F"]');
		var targetImageLen = targetImage.length||0;
		var generateShowImage =  function(imageFile) {
			return function(e) {
				$id('cghpCharImg1').src = imageBaseURL + framePath + imageFile;
				$id('cghpCharImg2').src = imageBaseURL + noFramePath + imageFile;
				// スクロール位置に画像を移動
				// ページを拡大or縮小していると座標がずれるので計算にいれる
				var zoom = _root.style.zoom||1;
				var scrollTop = (_root.scrollTop || _body.scrollTop || window.pageYOffset);
				$id('cghpCharArea').style.top = (scrollTop / zoom) + 'px';
				// オーバーレイ表示
				var overlay = $id('cghpCharOverlay');
				if (overlay) {
					overlay.style.minHeight = (_body.scrollHeight / zoom) + 'px';
					$removeClass(overlay, 'cghp_hide');
				}
				// オーバーレイ表示中は下位レイヤーの邪魔な要素を非表示にする
				var pageArea = $id('pageArea');
				if (pageArea) {
					$addClass(pageArea, 'cghp_overlay');
				}
				e.preventDefault();
				e.stopPropagation();
			};
		};

		for (var i = 0; i < targetImageLen; i++) {
			var image = targetImage[i];
			var parent = image.parentElement;
			if (parent.tagName === 'A' || parent.id === 'idol_view' || $hasClass(image, 'chk_img')) {
				continue;
			}
			var imageFile = (image.src.match(/%2Fimage_sp%2Fcard%2F(?:\w+)%2F(\w+\.jpg)/)||[])[1]||null;
			if (imageFile) {
				// アイドル画像(大)表示関数
				var showImage = generateShowImage(imageFile);
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
				e.preventDefault();
				e.stopPropagation();
			};
			// アイドル画像(大)切替関数
			var toggleImage = function(e) {
				$toggleClass($id('cghpCharImg1'), 'cghp_hide');
				$toggleClass($id('cghpCharImg2'), 'cghp_hide');
				e.preventDefault();
				e.stopPropagation();
			};

			var overlay = $create('div');
			overlay.id = 'cghpCharOverlay';
			overlay.className = 'cghp_link cghp_hide';
			$bind(overlay, 'click', hideImage);

			var imageArea = overlay.appendChild($create('div'));
			imageArea.id = 'cghpCharArea';

			var switchImageLink = imageArea.appendChild($create('a'));
			switchImageLink.className = 'cghp_add_area_gray';
			switchImageLink.innerHTML = '画像切り替え(Sﾚｱ, Sﾚｱ+のみ)';
			$bind(switchImageLink, 'click', toggleImage);

			var charImage1 = imageArea.appendChild($create('img'));
			charImage1.id = 'cghpCharImg1';
			charImage1.src = 'http://ava-a.mbga.jp/i/dot.gif';

			var charImage2 = imageArea.appendChild($create('img'));
			charImage2.id = 'cghpCharImg2';
			charImage2.className = 'cghp_hide';
			charImage2.src = 'http://ava-a.mbga.jp/i/dot.gif';

			_body.insertBefore(overlay, _body.firstChild);
		}
	})();

	// -------------------------------------------------------------------------
	// 一部のリンクが押しづらいのを修正
	// -------------------------------------------------------------------------
	(function() {
		var backLink = _content.querySelectorAll('div.backLink > a')||[];
		for (var i = 0, len = backLink.length; i < len; i++) {
			$addClass(backLink[i].parentElement, 'cghp_back_link');
		}
	})();

	// -------------------------------------------------------------------------
	// Flash画面用メニューの表示倍率を変更する
	// -------------------------------------------------------------------------
	(function() {
		var flashMenu = $id('cghpFlashMenu');
		if (flashMenu) {
			var ua = navigator.userAgent;
			if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPod') > -1 || ua.indexOf('iPad') > -1 || ua.indexOf('Android') > -1) {
				$bind(window, 'resize', function() {
					flashMenu.style.zoom = window.innerWidth / 320 * _settings.swf_zoom;
				});
				var event = _doc.createEvent('UIEvent');
				event.initEvent('resize', false, true);
				window.dispatchEvent(event);
			} else {
				flashMenu.style.zoom = _settings.swf_zoom;
			}
		}
	})();

	// -------------------------------------------------------------------------
	// キーボードショートカット拡張
	// -------------------------------------------------------------------------
	(function() {
		$bind(window, 'keydown', function(e) {
			var node = e.target.nodeName;
			var type = e.target.type;
			var key = e.keyIdentifier;

			// テキスト入力欄の時は除外
			if (node === 'INPUT' && (type === 'text' || type === 'tel' || type === 'number' || type === 'url')) {
				return;
			}
			// F5キー押下時にデータの再送信をしない
			if (key === 'F5') {
				_location.replace(_location.href);
				e.preventDefault();
				e.stopPropagation();
			}
		});
	})();

})();
