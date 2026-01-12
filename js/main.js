const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const volumeBtn = document.getElementById('volumeBtn');
const progress = document.getElementById('progress');
const time = document.getElementById('time');

const playIcon = 'img/play.svg';
const pauseIcon = 'img/pause.svg';
const volIcon = 'img/vol.svg';
const muteIcon = 'img/mute.svg';

/* Play / Pause */
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.querySelector('img').src = pauseIcon;
    } else {
        audio.pause();
        playBtn.querySelector('img').src = playIcon;
    }
});

/* Volumen / Mute */
volumeBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    volumeBtn.querySelector('img').src = audio.muted ? muteIcon : volIcon;
});

/* Progreso automático */
audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration)) {
        progress.max = audio.duration;
        progress.value = audio.currentTime;
        time.textContent = formatTime(audio.currentTime);
    }
});

/* Scrub manual */
progress.addEventListener('input', () => {
    audio.currentTime = progress.value;
});

/* Formato mm:ss */
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
