(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('.mobile-menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                var open = mobileNav.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        var carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
            var prev = carousel.querySelector('[data-hero-prev]');
            var next = carousel.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restart();
                });
            });
            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    restart();
                });
            }
            restart();
        }

        var categoryPage = document.querySelector('[data-category-page]');
        if (categoryPage) {
            var input = categoryPage.querySelector('.filter-input');
            var filters = Array.prototype.slice.call(categoryPage.querySelectorAll('.genre-filter'));
            var cards = Array.prototype.slice.call(categoryPage.querySelectorAll('.movie-card'));
            var activeFilter = 'all';

            function applyFilters() {
                var query = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-year') || ''
                    ].join(' ').toLowerCase();
                    var matchText = !query || haystack.indexOf(query) !== -1;
                    var matchFilter = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                    card.classList.toggle('is-filtered-hidden', !(matchText && matchFilter));
                });
            }

            if (input) {
                input.addEventListener('input', applyFilters);
            }
            filters.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeFilter = button.getAttribute('data-filter') || 'all';
                    filters.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    applyFilters();
                });
            });
        }

        var searchPage = document.querySelector('[data-search-page]');
        if (searchPage && window.SEARCH_MOVIES) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get('q') || '';
            var inputBox = document.getElementById('searchPageInput');
            var title = document.getElementById('searchResultTitle');
            var text = document.getElementById('searchResultText');
            var results = document.getElementById('searchResults');
            if (inputBox) {
                inputBox.value = queryValue;
            }

            function renderCard(item) {
                return [
                    '<article class="video-card movie-card">',
                    '<a class="video-card-link" href="./' + item.file + '">',
                    '<div class="video-cover">',
                    '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
                    '<span class="cover-gradient"></span>',
                    '<span class="play-mark" aria-hidden="true"></span>',
                    '<span class="card-category">' + item.category + '</span>',
                    '<span class="card-duration">' + item.duration + '</span>',
                    '</div>',
                    '<div class="video-body">',
                    '<h3>' + item.title + '</h3>',
                    '<p>' + item.description + '</p>',
                    '<div class="video-meta"><span>' + item.region + '</span><span>' + item.year + '</span><span>' + item.type + '</span></div>',
                    '<div class="video-tags">' + item.genres.slice(0, 3).map(function (tag) { return '<span class="tag-pill">' + tag + '</span>'; }).join('') + '</div>',
                    '</div>',
                    '</a>',
                    '</article>'
                ].join('');
            }

            function performSearch(value) {
                var keyword = value.trim().toLowerCase();
                if (!keyword) {
                    if (title) {
                        title.textContent = '输入关键词开始搜索';
                    }
                    if (text) {
                        text.textContent = '可从标题、标签、地区与简介中查找相关影片。';
                    }
                    if (results) {
                        results.innerHTML = '';
                    }
                    return;
                }
                var matched = window.SEARCH_MOVIES.filter(function (item) {
                    return item.search.indexOf(keyword) !== -1;
                }).slice(0, 120);
                if (title) {
                    title.textContent = '“' + value.trim() + '”的相关影片';
                }
                if (text) {
                    text.textContent = matched.length ? '已为你筛选出匹配内容。' : '没有找到匹配内容，可以换个关键词。';
                }
                if (results) {
                    results.innerHTML = matched.map(renderCard).join('');
                }
            }

            performSearch(queryValue);
            if (inputBox) {
                inputBox.addEventListener('input', function () {
                    performSearch(inputBox.value);
                });
            }
        }
    });
}());
