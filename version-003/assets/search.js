(function() {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");
    var results = document.getElementById("searchResults");

    if (input) {
        input.value = keyword;
    }

    function card(movie) {
        return [
            "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-meta=\"" + escapeHtml(movie.keywords) + "\">",
            "<a class=\"poster\" href=\"" + escapeHtml(movie.url) + "\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.style.visibility='hidden'\">",
            "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
            "</a>",
            "<div class=\"card-body\">",
            "<div class=\"tag-line\"><span>" + escapeHtml(movie.category) + "</span></div>",
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.summary) + "</p>",
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function render() {
        var list = Array.isArray(SEARCH_DATA) ? SEARCH_DATA : [];
        var normalized = keyword.toLowerCase();
        var filtered = normalized ? list.filter(function(movie) {
            return String(movie.keywords || "").toLowerCase().indexOf(normalized) !== -1;
        }) : list.slice(0, 48);

        if (title) {
            title.textContent = keyword ? "搜索结果" : "精选结果";
        }

        if (!results) {
            return;
        }

        if (!filtered.length) {
            results.innerHTML = "<div class=\"no-results\">没有找到匹配内容</div>";
            return;
        }

        results.innerHTML = filtered.slice(0, 120).map(card).join("");
    }

    render();
})();
