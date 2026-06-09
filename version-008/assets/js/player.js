document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.js-player').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-overlay');
        var status = shell.querySelector('.player-status');
        var stream = shell.getAttribute('data-stream');
        var hlsInstance = null;
        var prepared = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function prepare() {
            if (!video || !stream || prepared) {
                return Promise.resolve();
            }
            prepared = true;
            setStatus('正在加载影片...');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return Promise.resolve();
            }

            setStatus('播放暂时不可用');
            return Promise.reject(new Error('hls unavailable'));
        }

        function startPlayback() {
            prepare()
                .then(function () {
                    var result = video.play();
                    shell.classList.add('is-playing');
                    if (result && typeof result.then === 'function') {
                        result
                            .then(function () {
                                setStatus('');
                            })
                            .catch(function () {
                                shell.classList.remove('is-playing');
                                setStatus('点击播放按钮继续');
                            });
                    } else {
                        setStatus('');
                    }
                })
                .catch(function () {
                    shell.classList.remove('is-playing');
                });
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
                setStatus('');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            video.addEventListener('error', function () {
                shell.classList.remove('is-playing');
                setStatus('播放暂时不可用');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
});
