(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startSlider() {
      stopSlider();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopSlider() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showSlide(index);
        startSlider();
      });
    });

    slider.addEventListener('mouseenter', stopSlider);
    slider.addEventListener('mouseleave', startSlider);
    startSlider();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilters(panel) {
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var keyword = normalize(input ? input.value : '');
    var yearValue = year ? year.value : '';
    var regionValue = region ? region.value : '';
    var typeValue = type ? type.value : '';
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre')
      ].join(' '));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
      var matchedRegion = !regionValue || card.getAttribute('data-region') === regionValue;
      var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
      var visible = matchedKeyword && matchedYear && matchedRegion && matchedType;

      card.hidden = !visible;

      if (visible) {
        visibleCount += 1;
      }
    });

    var list = scope.querySelector('[data-card-list]');
    var empty = scope.querySelector('[data-empty-state]');

    if (!empty && list) {
      empty = document.createElement('div');
      empty.className = 'no-results';
      empty.setAttribute('data-empty-state', '');
      empty.textContent = '没有找到匹配的影片';
      empty.hidden = true;
      list.appendChild(empty);
    }

    if (empty) {
      empty.hidden = visibleCount !== 0;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var searchParams = new URLSearchParams(window.location.search);
    var query = searchParams.get('q');

    if (query && input) {
      input.value = query;
    }

    Array.prototype.slice.call(panel.querySelectorAll('input, select')).forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(panel);
      });

      control.addEventListener('change', function () {
        applyFilters(panel);
      });
    });

    applyFilters(panel);
  });

  Array.prototype.slice.call(document.querySelectorAll('.stream-player')).forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    function playVideo() {
      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', stream);
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (!video.getAttribute('src')) {
        playVideo();
      }
    });
  });
}());
