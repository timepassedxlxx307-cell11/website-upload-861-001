
(function () {
  var menuButton = document.getElementById("mobile-menu-button");
  var mobileNav = document.getElementById("mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    startHero();
  }

  var filterBar = document.querySelector("[data-filter-bar]");

  if (filterBar) {
    var chips = Array.prototype.slice.call(filterBar.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-filter");
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var visible = value === "all" || text.indexOf(value) !== -1;
          card.classList.toggle("is-filtered-out", !visible);
        });
      });
    });
  }

  var localInput = document.getElementById("local-filter-input");

  if (localInput) {
    var localCards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    localInput.addEventListener("input", function () {
      var query = localInput.value.trim().toLowerCase();
      localCards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-filtered-out", query && text.indexOf(query) === -1);
      });
    });
  }

  if (typeof MOVIE_INDEX !== "undefined") {
    initSearchPage();
  }
})();

function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.playButtonId);
  var started = false;
  var hls = null;

  if (!video || !button || !options.source) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(options.source);
      hls.attachMedia(video);
    } else {
      video.src = options.source;
    }
  }

  function startPlayback() {
    attachSource();
    button.classList.add("is-hidden");
    var attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", startPlayback);

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

function initSearchPage() {
  var form = document.getElementById("search-page-form");
  var queryInput = document.getElementById("search-query");
  var categorySelect = document.getElementById("search-category");
  var regionSelect = document.getElementById("search-region");
  var results = document.getElementById("search-results");
  var params = new URLSearchParams(window.location.search);

  if (!form || !queryInput || !categorySelect || !regionSelect || !results) {
    return;
  }

  queryInput.value = params.get("q") || "";

  function movieMatches(movie, query, category, region) {
    var text = (movie.keywords || "").toLowerCase();
    var byQuery = !query || text.indexOf(query) !== -1;
    var byCategory = !category || movie.category === category;
    var byRegion = !region || movie.region === region;
    return byQuery && byCategory && byRegion;
  }

  function createCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-glow"></span>',
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.summary) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '</div>'
    ].join("");
    return article;
  }

  function render() {
    var query = queryInput.value.trim().toLowerCase();
    var category = categorySelect.value;
    var region = regionSelect.value;
    var matches = MOVIE_INDEX.filter(function (movie) {
      return movieMatches(movie, query, category, region);
    }).slice(0, 160);

    results.innerHTML = "";

    matches.forEach(function (movie) {
      results.appendChild(createCard(movie));
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });

  queryInput.addEventListener("input", render);
  categorySelect.addEventListener("change", render);
  regionSelect.addEventListener("change", render);
  render();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
