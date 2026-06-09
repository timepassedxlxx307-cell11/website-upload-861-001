(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = form.querySelector("input");
            const query = input ? input.value.trim() : "";
            if (query) {
                window.location.href = "search.html?q=" + encodeURIComponent(query);
            }
        });
    });

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let currentSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    function startHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    const listSearch = document.querySelector("[data-list-search]");
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const chips = Array.from(document.querySelectorAll("[data-filter-value]"));
    let activeFilter = "all";

    function applyListFilter() {
        const keyword = listSearch ? listSearch.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
            const haystack = [
                card.dataset.title,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.year,
                card.dataset.region,
                card.dataset.section
            ].join(" ").toLowerCase();
            const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            const filterMatch = activeFilter === "all" || card.dataset.section === activeFilter;
            card.classList.toggle("hidden", !(keywordMatch && filterMatch));
        });
    }

    if (listSearch) {
        listSearch.addEventListener("input", applyListFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeFilter = chip.dataset.filterValue || "all";
            chips.forEach(function (item) {
                item.classList.toggle("active", item === chip);
            });
            applyListFilter();
        });
    });

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSearchCard(movie) {
        return "" +
            "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<img class=\"movie-poster\" src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
            "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"card-tags\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "</div>" +
            "</article>";
    }

    const searchRoot = document.querySelector("[data-search-results]");
    const searchInput = document.querySelector("[data-search-input]");

    function renderSearchPage() {
        if (!searchRoot || !window.SEARCH_INDEX) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        if (searchInput && !searchInput.value) {
            searchInput.value = initialQuery;
        }
        const query = searchInput ? searchInput.value.trim().toLowerCase() : initialQuery.trim().toLowerCase();
        const pool = window.SEARCH_INDEX;
        const results = query
            ? pool.filter(function (movie) {
                return [movie.title, movie.genre, movie.tags, movie.region, movie.year, movie.category].join(" ").toLowerCase().indexOf(query) !== -1;
            }).slice(0, 160)
            : pool.slice(0, 80);
        if (!results.length) {
            searchRoot.innerHTML = "<div class=\"empty-state\">没有找到相关影片，请换一个关键词试试。</div>";
            return;
        }
        searchRoot.innerHTML = results.map(renderSearchCard).join("");
    }

    if (searchRoot) {
        renderSearchPage();
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderSearchPage);
    }
})();
