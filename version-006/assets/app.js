(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filterCards(input, titleNode) {
        var keyword = normalize(input.value);
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-no-results]');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search') || card.textContent);
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }

        if (titleNode) {
            titleNode.textContent = keyword ? '搜索结果' : '全部影片';
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');

    if (filterInput) {
        filterInput.addEventListener('input', function () {
            filterCards(filterInput);
        });
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchTitle = document.querySelector('[data-search-title]');

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('q') || '';
        searchInput.value = keyword;
        filterCards(searchInput, searchTitle);
        searchInput.addEventListener('input', function () {
            filterCards(searchInput, searchTitle);
        });
    }
}());
