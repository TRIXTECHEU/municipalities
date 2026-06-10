/* TrixTech s.r.o. @2026 */

(function () {
  function deepQueryAll(root, selector) {
    var found = [];
    
    try {
      var nodes = root.querySelectorAll(selector);
      found = found.concat([].slice.call(nodes));
    } catch (e) {}

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
    
    while (walker.nextNode()) {
      var node = walker.currentNode;
      
      if (node.shadowRoot) {
        found = found.concat(deepQueryAll(node.shadowRoot, selector));
      }

      if (node.tagName === 'IFRAME') {
        try {
          if (node.contentDocument) {
            found = found.concat(deepQueryAll(node.contentDocument, selector));
          }
        } catch (e) {}
      }
    }

    return found;
  }

  function setAttrIfDiff(el, name, value) {
    if (el.getAttribute(name) !== value) {
        el.setAttribute(name, value);
    }
  }

  function translateButtons() {
    var sendSelector = [
      'button[title="Send"]',
      'button[aria-label="Send"]',
      'button[title*="Send"]',
      'button[aria-label*="Send"]',
      '.vfrc-chat-input--button', 
      'button[type="submit"]'
    ].join(', ');

    var sendButtons = deepQueryAll(document, sendSelector);
    
    for (var i = 0; i < sendButtons.length; i++) {
      var btn = sendButtons[i];
      if (btn.dataset.ttTranslated === 'send') continue;
      
      var ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
      var title = (btn.getAttribute('title') || '').toLowerCase();
      var isVfrc = btn.classList.contains('vfrc-chat-input--button');
      
      if (!isVfrc && ariaLabel.indexOf('send') === -1 && title.indexOf('send') === -1 && btn.type !== 'submit') {
          continue;
      }

      btn.dataset.ttTranslated = 'send';

      if (btn.title && btn.title !== 'Odeslat') btn.title = 'Odeslat';
      setAttrIfDiff(btn, 'aria-label', 'Odeslat');
      setAttrIfDiff(btn, 'data-balloon', 'Odeslat');
      
      var icons = btn.querySelectorAll('img, svg');
      for (var k = 0; k < icons.length; k++) {
        setAttrIfDiff(icons[k], 'alt', 'Odeslat');
      }
    }

    var launcherSelector = [
      'button.vfrc-launcher',
      '.vfrc-launcher',
      'button[title*="Open chat"]',
      'button[aria-label*="Open chat"]',
      'div[role="button"][aria-label*="Open chat"]'
    ].join(', ');

    var launcherButtons = deepQueryAll(document, launcherSelector);
    
    for (var j = 0; j < launcherButtons.length; j++) {
      var lb = launcherButtons[j];
      if (lb.dataset.ttTranslated === 'launcher') continue;
      lb.dataset.ttTranslated = 'launcher';

      var label = 'Otevřít chat';
      
      if (lb.title && lb.title !== label) lb.title = label;
      setAttrIfDiff(lb, 'aria-label', label);
      setAttrIfDiff(lb, 'data-balloon', label);

      var tooltip = lb.querySelector && lb.querySelector('.vfrc-tooltip');
      if (tooltip) tooltip.textContent = label;

      if (lb.childNodes.length === 1 && lb.childNodes[0].nodeType === 3 && lb.textContent.trim() === 'Chat') {
         lb.textContent = label;
      }
    }
  }

  function run() {
    var scheduled = false;
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        translateButtons();
      });
    }

    schedule();

    var observer = new MutationObserver(function (muts) {
      var shouldUpdate = false;
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].type === 'childList') {
            shouldUpdate = true;
            break;
        }
      }
      if (shouldUpdate) schedule();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
