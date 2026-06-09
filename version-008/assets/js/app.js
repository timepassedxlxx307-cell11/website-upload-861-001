document.addEventListener('DOMContentLoaded', function () {
    var body = document.body;
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });

        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                body.classList.remove('nav-open');
            });
        });
    }

    document.querySelectorAll('[data-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
        var prev = slider.querySelector('[data-slide-prev]');
        var next = slider.querySelector('[data-slide-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.querySelector('[data-search-input]');
    var clearButton = document.querySelector('[data-clear-search]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

    function applySearch(value) {
        var term = (value || '').trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var matched = !term || haystack.indexOf(term) !== -1;
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (searchInput) {
        searchInput.value = query;
        applySearch(query);
        searchInput.addEventListener('input', function () {
            applySearch(searchInput.value);
        });
    }

    if (clearButton && searchInput) {
        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            applySearch('');
            searchInput.focus();
        });
    }

    document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
        var buttons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter-value]'));
        var grid = bar.closest('section').nextElementSibling;
        var localCards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter-value');
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                localCards.forEach(function (card) {
                    var type = card.getAttribute('data-type');
                    card.classList.toggle('is-hidden', value !== 'all' && type !== value);
                });
            });
        });
    });
});
