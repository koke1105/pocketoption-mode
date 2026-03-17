(function() {
  var BLOCKS = ['currency', 'cryptocurrency', 'commodity', 'stock'];

  function isListOpen() {
    return !!document.querySelector('.currencies-block__in.active');
  }

  function closeList() {
    var el = document.elementFromPoint(800, 400);
    if (!el) return;
    el.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window}));
    el.dispatchEvent(new MouseEvent('mouseup',   {bubbles: true, cancelable: true, view: window}));
    el.dispatchEvent(new MouseEvent('click',     {bubbles: true, cancelable: true, view: window}));
  }

  function getItems() {
    return Array.from(document.querySelectorAll('.alist__item')).filter(function(el) {
      return !el.classList.contains('alist__item--no-active');
    });
  }

  function getActiveBlock() {
    var active = document.querySelector('.assets-block__nav-item--active');
    if (!active) return 0;
    for (var i = 0; i < BLOCKS.length; i++) {
      if (active.classList.contains('assets-block__nav-item--' + BLOCKS[i])) return i;
    }
    return 0;
  }

  function waitForItems(cb) {
    var a = 0;
    var t = setInterval(function() {
      var i = getItems();
      a++;
      if (i.length > 0) { clearInterval(t); cb(i); }
      else if (a > 30)  { clearInterval(t); }
    }, 100);
  }

  function switchBlock(b, cb) {
    document.querySelector('.assets-block__nav-item--' + BLOCKS[b]).click();
    if (cb) waitForItems(cb);
  }

  function getTime() {
    var now = new Date(Date.now() + 2 * 3600000);
    var h = String(now.getUTCHours()).padStart(2, '0');
    var m = String(now.getUTCMinutes()).padStart(2, '0');
    var s = String(now.getUTCSeconds()).padStart(2, '0');
    return h + ':' + m + ':' + s + ' UTC+2';
  }

  function getLabel(item) {
    var name   = item.querySelector('.alist__label');
    var payout = item.querySelector('.alist__payout span');
    return (name ? name.textContent.trim() : '') +
           (payout ? ' ' + payout.textContent.trim() : '');
  }

  function getPayoutColor(item) {
    var payout = item.querySelector('.alist__payout span');
    if (!payout) return 'rgba(255,255,255,0.2)';
    var val = parseInt(payout.textContent.replace(/[^0-9]/g, ''));
    return val >= 80 ? '#00e676' : '#ff1744';
  }

  function showToast(text, color) {
    var t = document.getElementById('po-nav-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'po-nav-toast';
      Object.assign(t.style, {
        position:     'fixed',
        top:          '18px',
        left:         '50%',
        transform:    'translateX(-50%)',
        background:   'rgba(10,10,18,0.92)',
        color:        '#fff',
        fontFamily:   'monospace',
        fontSize:     '20px',
        fontWeight:   'bold',
        padding:      '14px 36px',
        borderRadius: '12px',
        zIndex:       '999999',
        pointerEvents:'none',
        backdropFilter:'blur(6px)',
        whiteSpace:   'nowrap',
        textAlign:    'center',
        lineHeight:   '1.5'
      });
      document.body.appendChild(t);
    }
    t.style.border = '2px solid ' + (color || 'rgba(255,255,255,0.2)');
    t.innerHTML = text;
    if (t._clock) clearInterval(t._clock);
    t._clock = setInterval(function() {
      var timeEl = document.getElementById('po-nav-time');
      if (timeEl) timeEl.textContent = getTime();
    }, 1000);
  }

  function makeToastHtml(label) {
    return label + '<br><span id="po-nav-time" style="font-size:20px;opacity:0.85">' + getTime() + '</span>';
  }

  function doSwitch(dir) {
    var wo = isListOpen();
    if (!wo) document.querySelector('.pair,[class*="current-symbol"]').click();

    waitForItems(function(items) {
      var bi  = getActiveBlock();
      var idx = items.findIndex(function(el) { return el.classList.contains('alist__item--active'); });
      if (idx === -1) idx = 0;

      if (dir === 'down' && idx === items.length - 1) {
        switchBlock((bi + 1) % BLOCKS.length, function(ni) {
          ni[0].querySelector('.alist__link,a').click();
          showToast(makeToastHtml(getLabel(ni[0])), getPayoutColor(ni[0]));
          if (!wo) setTimeout(closeList, 100);
        });
      } else if (dir === 'up' && idx === 0) {
        switchBlock((bi - 1 + BLOCKS.length) % BLOCKS.length, function(ni) {
          ni[ni.length - 1].querySelector('.alist__link,a').click();
          showToast(makeToastHtml(getLabel(ni[ni.length - 1])), getPayoutColor(ni[ni.length - 1]));
          if (!wo) setTimeout(closeList, 100);
        });
      } else {
        var ni = dir === 'up' ? (idx - 1 + items.length) % items.length : (idx + 1) % items.length;
        items[ni].querySelector('.alist__link,a').click();
        showToast(makeToastHtml(getLabel(items[ni])), getPayoutColor(items[ni]));
        if (!wo) setTimeout(closeList, 100);
      }
    });
  }
//hui//
  function doSwitchBlock(dir) {
    var wo = isListOpen();
    if (!wo) document.querySelector('.pair,[class*="current-symbol"]').click();
    setTimeout(function() {
      var bi     = getActiveBlock();
      var nextBi = dir === 'next' ? (bi + 1) % BLOCKS.length : (bi - 1 + BLOCKS.length) % BLOCKS.length;
      switchBlock(nextBi, function(ni) {
        var idx = ni.findIndex(function(el) { return el.classList.contains('alist__item--active'); });
        if (idx === -1) idx = 0;
        ni[idx].querySelector('.alist__link,a').click();
        showToast(makeToastHtml('📂 ' + BLOCKS[nextBi].toUpperCase() + ' ' + getLabel(ni[idx])), getPayoutColor(ni[idx]));
        if (!wo) setTimeout(closeList, 100);
      });
    }, wo ? 0 : 300);
  }

  window._poNav && document.removeEventListener('keydown', window._poNav, true);

  window._poNav = function(e) {
    var tag = document.activeElement && document.activeElement.tagName.toLowerCase();
    if (['input', 'textarea', 'select'].indexOf(tag) > -1) return;

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      doSwitch(e.key === 'ArrowUp' ? 'up' : 'down');
    } else if (e.code === 'Comma') {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      doSwitchBlock('prev');
    } else if (e.code === 'Period') {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      doSwitchBlock('next');
    }
  };

  document.addEventListener('keydown', window._poNav, true);
  alert('✅ МОД УВІМКНЕНО!');
})();