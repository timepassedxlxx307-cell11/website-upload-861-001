(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const slider = document.querySelector('.hero-slider');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dots button'));
        const prev = slider.querySelector('.hero-prev');
        const next = slider.querySelector('.hero-next');
        let current = 0;
        let timer = null;

        const show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };

        const start = function () {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        };

        const stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    const filterInput = document.querySelector('.page-filter-input');
    const sortSelect = document.querySelector('.page-sort-select');
    const grid = document.querySelector('.filterable-grid');

    if (grid && (filterInput || sortSelect)) {
        const cards = Array.from(grid.querySelectorAll('.movie-card'));
        const apply = function () {
            const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
            const sortValue = sortSelect ? sortSelect.value : 'default';
            let visible = cards.slice();

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre
                ].join(' ').toLowerCase();
                const matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
            });

            visible = visible.filter(function (card) {
                return card.style.display !== 'none';
            });

            visible.sort(function (a, b) {
                if (sortValue === 'year-desc') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (sortValue === 'year-asc') {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                }
                if (sortValue === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
                }
                return 0;
            });

            visible.forEach(function (card) {
                grid.appendChild(card);
            });
        };

        if (filterInput) {
            filterInput.addEventListener('input', apply);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', apply);
        }
        apply();
    }
})();

window.setupPlayer = function (videoId, buttonId, url) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    let prepared = false;
    let hls = null;

    if (!video || !button || !url) {
        return;
    }

    const prepare = function () {
        if (prepared) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }

        prepared = true;
    };

    const play = function () {
        prepare();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        const action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    };

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (!prepared || video.paused) {
            play();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
};

(function () {
    const results = document.querySelector('.search-results');
    const form = document.querySelector('.search-page-form');
    const input = document.querySelector('.search-page-input');

    if (!results || !window.movieIndex) {
        return;
    }

    const escapeHtml = function (value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const card = function (movie) {
        return '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.url) + '" class="movie-thumb" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
            '<span class="play-float">▶</span>' +
            '<span class="thumb-copy">' + escapeHtml(movie.oneLine) + '</span>' +
            '</a>' +
            '<div class="movie-info">' +
            '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
            '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row"><span class="tag">' + escapeHtml(movie.genre) + '</span></div>' +
            '</div>' +
            '</article>';
    };

    const render = function (keyword) {
        const q = String(keyword || '').trim().toLowerCase();
        const matched = window.movieIndex.filter(function (movie) {
            const haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(' ').toLowerCase();
            return !q || haystack.indexOf(q) !== -1;
        }).slice(0, 160);

        if (!matched.length) {
            results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
            return;
        }

        results.innerHTML = matched.map(card).join('');
    };

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';

    if (input) {
        input.value = q;
    }

    render(q);

    if (form && input) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const nextQuery = input.value.trim();
            const url = nextQuery ? './search.html?q=' + encodeURIComponent(nextQuery) : './search.html';
            window.history.replaceState(null, '', url);
            render(nextQuery);
        });
    }
})();
