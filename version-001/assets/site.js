(function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var forms = document.querySelectorAll("[data-search-form]");

  forms.forEach(function(form) {
    form.addEventListener("submit", function(event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });

  var hero = document.querySelector("[data-hero-slider]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector("[data-live-search]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var activeField = "";
  var activeValue = "all";

  function normalize(value) {
    return (value || "").toString().toLowerCase();
  }

  function applyFilters() {
    var query = searchInput ? normalize(searchInput.value.trim()) : "";

    cards.forEach(function(card) {
      var text = normalize(card.getAttribute("data-search"));
      var textMatch = !query || text.indexOf(query) !== -1;
      var fieldMatch = true;

      if (activeValue !== "all" && activeField) {
        var fieldValue = normalize(card.getAttribute(activeField));
        fieldMatch = fieldValue.indexOf(normalize(activeValue)) !== -1;
      }

      card.classList.toggle("is-hidden", !(textMatch && fieldMatch));
    });
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q");

    if (keyword) {
      searchInput.value = keyword;
    }

    searchInput.addEventListener("input", applyFilters);
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));

  filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      filterButtons.forEach(function(item) {
        item.classList.remove("is-active");
      });

      button.classList.add("is-active");
      activeValue = button.getAttribute("data-filter-value") || "all";
      activeField = button.getAttribute("data-filter-field") || "";
      applyFilters();
    });
  });

  applyFilters();
})();
