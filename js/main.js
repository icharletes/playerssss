const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const volumeBtn = document.getElementById('volumeBtn');
const progress = document.getElementById('progress');
const time = document.getElementById('time');
const volumeRange = document.getElementById('volumeRange');
const volumePercent = document.getElementById('volumePercent');

const playIcon  = 'img/play.svg';
const pauseIcon = 'img/pause.svg';
const volIcon   = 'img/vol.svg';
const muteIcon  = 'img/mute.svg';
const settingsIcon = 'img/settings.svg';
const closeIcon = 'img/close.svg';

const moreOptionBtn = document.querySelector('.more-option-btn');
const settingsPanel = document.querySelector('.settings');

/* ===== INIT ===== */
const savedVolume = localStorage.getItem('playerVolume');
audio.volume = savedVolume !== null ? savedVolume : 1;
volumeRange.value = audio.volume;
updateVolumeUI();

/* ===== PLAY / PAUSE ===== */
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.querySelector('img').src = pauseIcon;
    } else {
        audio.pause();
        playBtn.querySelector('img').src = playIcon;
    }
});

/* ===== PROGRESS ===== */
audio.addEventListener('timeupdate', () => {
    progress.max = audio.duration || 0;
    progress.value = audio.currentTime;
    time.textContent = formatTime(audio.currentTime);
});

progress.addEventListener('input', () => {
    audio.currentTime = progress.value;
});

/* ===== VOLUME ===== */
volumeRange.addEventListener('input', () => {
    audio.volume = volumeRange.value;
    audio.muted = audio.volume === 0;
    saveVolume();
    updateVolumeUI();
});

volumeBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;

    if (audio.muted) {
        volumeRange.value = 0;
    } else {
        volumeRange.value = audio.volume || 1;
    }

    saveVolume();
    updateVolumeUI();
});

function updateVolumeUI() {
    const percent = Math.round(audio.volume * 100);
    volumePercent.textContent = `${percent}%`;

    volumeBtn.querySelector('img').src =
        audio.muted || audio.volume === 0 ? muteIcon : volIcon;
}

/* ===== MORE / SETTINGS TOGGLE ===== */
if (moreOptionBtn && settingsPanel) {
    // ensure hidden initial state (use display:none after transition)
    settingsPanel.classList.remove('open');
    settingsPanel.style.display = 'none';
    moreOptionBtn.setAttribute('aria-expanded', 'false');

    function hidePanelWithDisplayNone(el) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none') return;
        el.classList.remove('open');
        const onEnd = (e) => {
            if (e.propertyName === 'max-height' || e.propertyName === 'opacity') {
                el.style.display = 'none';
                el.removeEventListener('transitionend', onEnd);
            }
        };
        el.addEventListener('transitionend', onEnd);
    }

    function showPanelWithDisplayBlock(el) {
        const cs = getComputedStyle(el);
        if (cs.display !== 'none' && el.classList.contains('open')) return;
        el.style.display = 'block';
        // force reflow so transition runs
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.classList.add('open');
    }

    moreOptionBtn.addEventListener('click', () => {
        const isHidden = getComputedStyle(settingsPanel).display === 'none';
        const img = moreOptionBtn.querySelector('img');

        if (isHidden) {
            // show immediately and switch icon to close
            showPanelWithDisplayBlock(settingsPanel);
            moreOptionBtn.setAttribute('aria-expanded', 'true');
            if (img) img.src = closeIcon;
        } else {
            // switch icon immediately (fallback) and hide; transition callback still runs if needed
            moreOptionBtn.setAttribute('aria-expanded', 'false');
            if (img) img.src = settingsIcon;
            hidePanelWithDisplayNone(settingsPanel);
        }
    });
}

function saveVolume() {
    localStorage.setItem('playerVolume', audio.volume);
}

/* ===== SETTINGS ITEMS (show/hide cover & song info) ===== */
const eyeOn = 'img/eye-on.svg';
const eyeOff = 'img/eye-off.svg';

const settingsList = document.querySelector('.settings');

function getTargetElementByName(name) {
    return document.querySelector(`.${name}`);
}

function refreshSettingUI(item) {
    const targetName = item.dataset.target;
    const displayName = item.dataset.name || targetName;
    const iconImg = item.querySelector('img');
    const labelSpan = item.querySelector('.setting-label');
    const targetEl = getTargetElementByName(targetName);
    if (!targetEl) return;
    const isHidden = getComputedStyle(targetEl).display === 'none';
    if (iconImg) iconImg.src = isHidden ? eyeOn : eyeOff;
    if (labelSpan) labelSpan.textContent = isHidden ? `Show ${displayName}` : `Hide ${displayName}`;
}

function hideWithDisplayNone(el, cb) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') {
        if (typeof cb === 'function') cb();
        return;
    }
    el.classList.add('hidden');
    const onEnd = (e) => {
        if (e.propertyName === 'max-height' || e.propertyName === 'opacity') {
            el.style.display = 'none';
            el.removeEventListener('transitionend', onEnd);
            if (typeof cb === 'function') cb();
        }
    };
    el.addEventListener('transitionend', onEnd);
}

function showWithDisplayBlock(el) {
    const cs = getComputedStyle(el);
    if (cs.display !== 'none' && !el.classList.contains('hidden')) return;
    el.style.display = 'block';
    // force reflow
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.classList.remove('hidden');
}

// initialize UI for all items
if (settingsList) {
    const items = settingsList.querySelectorAll('.setting-item');
    items.forEach(refreshSettingUI);

    settingsList.addEventListener('click', (e) => {
        const item = e.target.closest('.setting-item');
        if (!item) return;
        const targetName = item.dataset.target;
        const targetEl = getTargetElementByName(targetName);
        if (!targetEl) return;
        const nowHidden = getComputedStyle(targetEl).display === 'none';
        if (nowHidden) {
            showWithDisplayBlock(targetEl);
            setTimeout(() => refreshSettingUI(item), 20);
        } else {
            hideWithDisplayNone(targetEl, () => refreshSettingUI(item));
        }
    });
}

/* ===== UTIL ===== */
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
