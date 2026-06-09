(function () {
    function prepareVideo(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }

        video.src = source;
    }

    window.initMoviePlayer = function (playerId, source) {
        const root = document.getElementById(playerId);
        if (!root) {
            return;
        }

        const video = root.querySelector("video");
        const overlay = root.querySelector(".player-overlay");

        if (!video || !overlay) {
            return;
        }

        let ready = false;

        function play() {
            if (!ready) {
                prepareVideo(video, source);
                ready = true;
            }

            overlay.classList.add("hidden");
            video.controls = true;
            const promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.classList.remove("hidden");
                });
            }
        }

        overlay.addEventListener("click", play);
        overlay.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                play();
            }
        });
    };
})();
