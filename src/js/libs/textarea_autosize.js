(function (window, document) {
	'use strict';

	var ATTR = 'data-autosize';
	var SELECTOR = 'textarea[' + ATTR + ']';

	var initialized = false;

	// rAF-батчинг: множественные input-события в пределах кадра → один resize
	var pending = new Set();
	var rafId = null;

	// Уже обработанные элементы (нужно для cleanup при отключении)
	var processed = new WeakSet();

	var mutationObserver = null;

	// ---------- helpers ----------

	function parsePx(value) {
		var n = parseFloat(value);
		return isNaN(n) ? 0 : n;
	}

	function isEnabled(elem) {
		if (!elem.hasAttribute(ATTR)) return false;
		var v = elem.getAttribute(ATTR);
		// data-autosize / data-autosize="true" / data-autosize="" → включено
		// data-autosize="false" / "0" / "off" → выключено
		return v !== 'false' && v !== '0' && v !== 'off';
	}

	function getMetrics(elem) {
		var cs = getComputedStyle(elem);
		var fontSize = parseFloat(cs.fontSize) || 16;

		// line-height может быть "normal" — тогда ~1.2 от font-size
		var lineHeightPx;
		if (!cs.lineHeight || cs.lineHeight === 'normal') {
			lineHeightPx = fontSize * 1.2;
		} else {
			lineHeightPx = parseFloat(cs.lineHeight);
			if (isNaN(lineHeightPx)) lineHeightPx = fontSize * 1.2;
		}

		return {
			cs: cs,
			fontSize: fontSize,
			lineHeightPx: lineHeightPx,
			borderY: parsePx(cs.borderTopWidth) + parsePx(cs.borderBottomWidth),
			paddingY: parsePx(cs.paddingTop) + parsePx(cs.paddingBottom),
			borderBox: cs.boxSizing === 'border-box'
		};
	}

	// min-height в em: rows * line-height (+ padding/border для border-box)
	// em — относительная единица, поэтому при смене font-size минимум
	// масштабируется автоматически.
	function computeMinHeightEm(elem, m) {
		var rows = parseInt(elem.getAttribute('rows'), 10);
		if (!rows || rows < 1) rows = 2;

		var baseEm = (rows * m.lineHeightPx) / m.fontSize;

		if (m.borderBox) {
			return baseEm + (m.paddingY + m.borderY) / m.fontSize;
		}
		return baseEm;
	}

	function isVisible(elem) {
		// offsetParent === null для display:none, но также для position:fixed
		// и detached-элементов. Fixed проверяем отдельно.
		if (elem.offsetParent !== null) return true;
		var cs = getComputedStyle(elem);
		return cs.position === 'fixed' && elem.getClientRects().length > 0;
	}

	// ---------- core ----------

	function resize(elem) {
		if (!elem || elem.tagName !== 'TEXTAREA') return;

		// Отключили — подчищаем свои inline-стили
		if (!isEnabled(elem)) {
			if (processed.has(elem)) {
				elem.style.height = '';
				elem.style.minHeight = '';
				elem.style.overflowY = '';
				processed.delete(elem);
			}
			return;
		}

		// Скрытые элементы меряются как 0 — лучше пропустить.
		// Resize произойдёт, когда элемент станет видимым
		// (см. MutationObserver ниже).
		if (!isVisible(elem)) return;

		var m = getMetrics(elem);

		// 1) min-height в em — масштабируется вместе с font-size
		elem.style.minHeight = computeMinHeightEm(elem, m) + 'em';

		// 2) Сбрасываем height, чтобы scrollHeight отразил контент
		elem.style.height = 'auto';

		// 3) scrollHeight = content + padding (без border)
		//    border-box:  итоговая высота = scrollHeight + border
		//    content-box: CSS height = content only = scrollHeight - padding
		var target;
		if (m.borderBox) {
			target = elem.scrollHeight + m.borderY;
		} else {
			target = elem.scrollHeight - m.paddingY;
		}
		if (target < 0) target = 0;

		elem.style.height = target + 'px';
		elem.style.overflowY = 'hidden';

		processed.add(elem);
	}

	function scheduleResize(elem) {
		pending.add(elem);
		if (rafId !== null) return;
		rafId = window.requestAnimationFrame(function () {
			rafId = null;
			var list = Array.from(pending);
			pending.clear();
			for (var i = 0; i < list.length; i++) {
				resize(list[i]);
			}
		});
	}

	function resizeAll(scope) {
		var root = scope || document;
		var nodes = root.querySelectorAll(SELECTOR);
		for (var i = 0; i < nodes.length; i++) {
			resize(nodes[i]);
		}
	}

	// ---------- events ----------

	function isTarget(e) {
		var t = e.target;
		return t && t.tagName === 'TEXTAREA' && isEnabled(t);
	}

	function onInput(e) {
		if (isTarget(e)) scheduleResize(e.target);
	}

	// ---------- observers ----------

	function setupMutationObserver() {
		if (typeof MutationObserver === 'undefined') return;

		mutationObserver = new MutationObserver(function (mutations) {
			for (var i = 0; i < mutations.length; i++) {
				var mu = mutations[i];

				if (mu.type === 'childList') {
					for (var j = 0; j < mu.addedNodes.length; j++) {
						var node = mu.addedNodes[j];
						if (node.nodeType !== 1) continue;

						if (node.matches && node.matches(SELECTOR)) {
							resize(node);
						}
						if (node.querySelectorAll) {
							var kids = node.querySelectorAll(SELECTOR);
							for (var k = 0; k < kids.length; k++) {
								resize(kids[k]);
							}
						}
					}
				} else if (mu.type === 'attributes') {
					var target = mu.target;

					// Изменился сам textarea (rows / data-autosize / class / hidden)
					if (target.tagName === 'TEXTAREA') {
						resize(target);
					} else if (mu.attributeName === 'class' ||
						mu.attributeName === 'hidden' ||
						mu.attributeName === 'open') {
						// Предок стал видимым (например, <details open>)
						// — пробуем отресайзить вложенные textarea.
						var descendants = target.querySelectorAll(SELECTOR);
						for (var d = 0; d < descendants.length; d++) {
							resize(descendants[d]);
						}
					}
				}
			}
		});

		mutationObserver.observe(document.body || document.documentElement, {
			childList: true,
			subtree: true,
			attributes: true,
			// ВАЖНО: style НЕ наблюдаем — иначе собственные записи style
			// перезапустят observer и получится бесконечный цикл.
			// Если показываете/скрываете через inline style — вызывайте
			// textarea_autosize.resize(el) вручную после показа.
			attributeFilter: ['class', 'hidden', 'rows', 'open', ATTR]
		});
	}

	function setupWindowResize() {
		var timer = null;
		window.addEventListener('resize', function () {
			if (timer) clearTimeout(timer);
			timer = setTimeout(function () {
				resizeAll(document);
			}, 100);
		});
	}

	// ---------- public API ----------

	function init() {
		if (initialized) return;

		// Если DOM ещё парсится — подождём
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', function onReady() {
				document.removeEventListener('DOMContentLoaded', onReady);
				init();
			});
			return;
		}

		initialized = true;

		// 1) Все существующие textarea
		resizeAll(document);

		// 2) Делегированные события
		document.addEventListener('input', onInput, true);
		// change — на случай paste через контекстное меню, autofill, drag-drop
		document.addEventListener('change', onInput, true);

		// 3) Динамический DOM
		setupMutationObserver();

		// 4) Смена ширины окна → меняется перенос строк
		setupWindowResize();
	}

	function destroy() {
		if (!initialized) return;
		initialized = false;

		document.removeEventListener('input', onInput, true);
		document.removeEventListener('change', onInput, true);

		if (mutationObserver) {
			mutationObserver.disconnect();
			mutationObserver = null;
		}

		if (rafId !== null) {
			window.cancelAnimationFrame(rafId);
			rafId = null;
		}
		pending.clear();
	}

	window.textarea_autosize = {
		init: init,
		destroy: destroy,
		resize: resize,
		resizeAll: resizeAll
	};
})(window, document);