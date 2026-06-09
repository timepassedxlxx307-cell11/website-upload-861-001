(function() {
    var menuButton = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".main-nav");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function() {
            menu.classList.toggle("is-open");
        });
    }

    var filterInput = document.querySelector("[data-filter-input]");
    if (filterInput) {
        filterInput.addEventListener("input", function() {
            var keyword = filterInput.value.trim().toLowerCase();
            var cards = document.querySelectorAll(".movie-card");
            cards.forEach(function(card) {
                var text = ((card.dataset.title || "") + " " + (card.dataset.meta || "") + " " + card.textContent).toLowerCase();
                card.style.display = text.indexOf(keyword) === -1 ? "none" : "";
            });
        });
    }

    var hero = document.querySelector("[data-hero-slider]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
            });
        }

        window.setInterval(function() {
            show(current + 1);
        }, 6200);
    }
})();
