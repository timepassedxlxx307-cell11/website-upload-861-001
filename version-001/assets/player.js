(function() {
  var hlsLoader = null;

  function loadHls() {
    if (!hlsLoader) {
      hlsLoader = import("./hls-vendor-dru42stk.js").then(function(module) {
        return module.H;
      }).catch(function() {
        return null;
      });
    }

    return hlsLoader;
  }

  function activatePlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var stream = video ? video.getAttribute("data-stream") : "";
    var ready = false;
    var hls = null;

    function attachStream() {
      if (!video || !stream) {
        return Promise.resolve();
      }

      if (ready) {
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        ready = true;
        return Promise.resolve();
      }

      return loadHls().then(function(Hls) {
        if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          ready = true;
          return;
        }

        video.src = stream;
        ready = true;
      });
    }

    function startPlayback() {
      attachStream().then(function() {
        if (button) {
          button.classList.add("is-hidden");
        }

        if (video) {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function() {
              if (button) {
                button.classList.remove("is-hidden");
              }
            });
          }
        }
      });
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function() {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener("play", function() {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("ended", function() {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function() {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(activatePlayer);
})();
