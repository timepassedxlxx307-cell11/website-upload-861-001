(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterGrid(input, grid) {
        var query = normalizeText(input.value);
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));

        cards.forEach(function (card) {
            var haystack = normalizeText([
                card.getAttribute('data-title'),
                card.getAttribute('data-meta'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
            card.classList.toggle('is-filtered-out', query && haystack.indexOf(query) === -1);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.local-search')).forEach(function (input) {
        var section = input.closest('section') || document;
        var grid = section.querySelector('.searchable-grid') || document.querySelector('.searchable-grid');

        if (grid) {
            input.addEventListener('input', function () {
                filterGrid(input, grid);
            });
        }
    });

    var urlQuery = new URLSearchParams(window.location.search).get('q');
    var globalInput = document.querySelector('.global-search-input');
    var searchResults = document.querySelector('.search-results');

    if (globalInput && searchResults && urlQuery) {
        globalInput.value = urlQuery;
        filterGrid(globalInput, searchResults);
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-stage')).forEach(function (stage) {
        var video = stage.querySelector('video');
        var overlay = stage.querySelector('.video-overlay');
        var url = stage.getAttribute('data-video');
        var initialized = false;

        function initializeVideo() {
            if (!video || !url || initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function startVideo() {
            initializeVideo();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }
    });
})();
