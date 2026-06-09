(function () {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('[data-player-overlay]');
    var meta = document.querySelector('meta[name="stream-url"]');
    var source = meta ? meta.getAttribute('content') : '';
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
        if (!video || !source || attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        if (!video) {
            return;
        }

        attachSource();
        video.controls = true;

        var playPromise = video.play();

        if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(function () {
                if (overlay) {
                    overlay.hidden = true;
                }
            }).catch(function () {
                if (overlay) {
                    overlay.hidden = false;
                }
            });
        } else if (overlay) {
            overlay.hidden = true;
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.hidden = true;
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.hidden = false;
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}());
