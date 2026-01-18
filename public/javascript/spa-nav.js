(function ($) {
    "use strict";

    function reinitPlugins() {
        console.log("Re-initializing plugins...");

        // ==========================================================================
        // RE-INIT ISOTOPE (from main.js)
        // ==========================================================================
        var $topeContainer = $('.isotope-grid');
        var $filter = $('.filter-tope-group');

        if ($topeContainer.length > 0) {
            // filter items on button click
            $filter.each(function () {
                $filter.on('click', 'button', function () {
                    var filterValue = $(this).attr('data-filter');
                    $topeContainer.isotope({
                        filter: filterValue
                    });
                });
            });

            // init Isotope
            $topeContainer.imagesLoaded(function () {
                $topeContainer.isotope({
                    itemSelector: '.isotope-item',
                    layoutMode: 'fitRows',
                    percentPosition: true,
                    animationEngine: 'best-available',
                    masonry: {
                        columnWidth: '.isotope-item'
                    }
                });
            });

            var isotopeButton = $('.filter-tope-group button');
            $(isotopeButton).each(function () {
                $(this).on('click', function () {
                    for (var i = 0; i < isotopeButton.length; i++) {
                        $(isotopeButton[i]).removeClass('how-active1');
                    }
                    $(this).addClass('how-active1');
                });
            });
        }

        // ==========================================================================
        // RE-INIT SLICK 1 (Hero Slider)
        // ==========================================================================
        $('.wrap-slick1').each(function () {
            var wrapSlick1 = $(this);
            var slick1 = $(this).find('.slick1');
            var itemSlick1 = $(slick1).find('.item-slick1');
            var layerSlick1 = $(slick1).find('.layer-slick1');
            var actionSlick1 = [];

            $(slick1).on('init', function () {
                var layerCurrentItem = $(itemSlick1[0]).find('.layer-slick1');
                for (var i = 0; i < actionSlick1.length; i++) clearTimeout(actionSlick1[i]);
                $(layerSlick1).each(function () { $(this).removeClass($(this).data('appear') + ' visible-true'); });
                for (var i = 0; i < layerCurrentItem.length; i++) {
                    actionSlick1[i] = setTimeout(function (index) {
                        $(layerCurrentItem[index]).addClass($(layerCurrentItem[index]).data('appear') + ' visible-true');
                    }, $(layerCurrentItem[i]).data('delay'), i);
                }
            });

            var showDot = false;
            if ($(wrapSlick1).find('.wrap-slick1-dots').length > 0) showDot = true;

            if (!$(slick1).hasClass('slick-initialized')) {
                $(slick1).slick({
                    pauseOnFocus: false,
                    pauseOnHover: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    fade: true,
                    speed: 1000,
                    infinite: true,
                    autoplay: true,
                    autoplaySpeed: 6000,
                    arrows: true,
                    appendArrows: $(wrapSlick1),
                    prevArrow: '<button class="arrow-slick1 prev-slick1"><i class="zmdi zmdi-caret-left"></i></button>',
                    nextArrow: '<button class="arrow-slick1 next-slick1"><i class="zmdi zmdi-caret-right"></i></button>',
                    dots: showDot,
                    appendDots: $(wrapSlick1).find('.wrap-slick1-dots'),
                    dotsClass: 'slick1-dots',
                    customPaging: function (slick, index) {
                        var linkThumb = $(slick.$slides[index]).data('thumb');
                        var caption = $(slick.$slides[index]).data('caption');
                        return '<img src="' + linkThumb + '">' + '<span class="caption-dots-slick1">' + caption + '</span>';
                    },
                });
            }

            $(slick1).on('afterChange', function (event, slick, currentSlide) {
                var layerCurrentItem = $(itemSlick1[currentSlide]).find('.layer-slick1');
                for (var i = 0; i < actionSlick1.length; i++) clearTimeout(actionSlick1[i]);
                $(layerSlick1).each(function () { $(this).removeClass($(this).data('appear') + ' visible-true'); });
                for (var i = 0; i < layerCurrentItem.length; i++) {
                    actionSlick1[i] = setTimeout(function (index) {
                        $(layerCurrentItem[index]).addClass($(layerCurrentItem[index]).data('appear') + ' visible-true');
                    }, $(layerCurrentItem[i]).data('delay'), i);
                }
            });
        });

        // ==========================================================================
        // RE-INIT SLICK 2 (Carousel)
        // ==========================================================================
        $('.wrap-slick2').each(function () {
            if (!$(this).find('.slick2').hasClass('slick-initialized')) {
                $(this).find('.slick2').slick({
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    infinite: false,
                    autoplay: false,
                    autoplaySpeed: 6000,
                    arrows: true,
                    appendArrows: $(this),
                    prevArrow: '<button class="arrow-slick2 prev-slick2"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
                    nextArrow: '<button class="arrow-slick2 next-slick2"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
                    responsive: [{ breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 4 } }, { breakpoint: 992, settings: { slidesToShow: 3, slidesToScroll: 3 } }, { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } }, { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } }]
                });
            }
        });

        // ==========================================================================
        // RE-INIT SLICK 3 (Product Detail)
        // ==========================================================================
        $('.wrap-slick3').each(function () {
            if (!$(this).find('.slick3').hasClass('slick-initialized')) {
                $(this).find('.slick3').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    fade: true,
                    infinite: true,
                    autoplay: false,
                    autoplaySpeed: 6000,
                    arrows: true,
                    appendArrows: $(this).find('.wrap-slick3-arrows'),
                    prevArrow: '<button class="arrow-slick3 prev-slick3"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
                    nextArrow: '<button class="arrow-slick3 next-slick3"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
                    dots: true,
                    appendDots: $(this).find('.wrap-slick3-dots'),
                    dotsClass: 'slick3-dots',
                    customPaging: function (slick, index) {
                        var portrait = $(slick.$slides[index]).data('thumb');
                        return '<img src=" ' + portrait + ' "/><div class="slick3-dot-overlay"></div>';
                    },
                });
            }
        });

        // ==========================================================================
        // RE-BIND Product Quantity Buttons
        // ==========================================================================
        $('.btn-num-product-down').off('click').on('click', function () {
            var numProduct = Number($(this).next().val());
            if (numProduct > 0) $(this).next().val(numProduct - 1);
        });

        $('.btn-num-product-up').off('click').on('click', function () {
            var numProduct = Number($(this).prev().val());
            $(this).prev().val(numProduct + 1);
        });

        // Re-bind Filter/Search Panels
        $('.js-show-filter').off('click').on('click', function () {
            $(this).toggleClass('show-filter');
            $('.panel-filter').slideToggle(400);

            if ($('.js-show-search').hasClass('show-search')) {
                $('.js-show-search').removeClass('show-search');
                $('.panel-search').slideUp(400);
            }
        });

        $('.js-show-search').off('click').on('click', function () {
            $(this).toggleClass('show-search');
            $('.panel-search').slideToggle(400);

            if ($('.js-show-filter').hasClass('show-filter')) {
                $('.js-show-filter').removeClass('show-filter');
                $('.panel-filter').slideUp(400);
            }
        });
    }

    $(document).ready(function () {
        // Target Main Menu Links
        const navLinks = '.main-menu a, .logo a, .logo-mobile a';

        // Expose Navigation Logic
        window.spaNavigate = function (href) {
            // Visual feedback (Loader)
            $('.animsition-loading-1').show();

            fetch(href)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    // Find content wrapper
                    const newContent = doc.querySelector('#spa-content');
                    const oldContent = document.querySelector('#spa-content');

                    if (newContent && oldContent) {
                        // Replace content
                        oldContent.innerHTML = newContent.innerHTML;

                        // Execute Scripts in the new content
                        const scripts = newContent.querySelectorAll('script');
                        scripts.forEach(oldScript => {
                            const newScript = document.createElement('script');
                            // Copy attributes
                            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                            // Copy content
                            newScript.textContent = oldScript.textContent;
                            // Append to body to execute
                            document.body.appendChild(newScript);
                            // Optional: Remove after execution to keep DOM clean, or leave it. 
                            // Usually leaving it is fine or removing it immediately.
                            // document.body.removeChild(newScript); 
                        });

                        // Update title
                        document.title = doc.title;

                        // Push State
                        window.history.pushState({ path: href }, '', href);

                        // Scroll to top
                        $('html, body').animate({ scrollTop: 0 }, 100);

                        // Re-initialize plugins
                        setTimeout(function () {
                            reinitPlugins();
                            $('body').css('opacity', '1');
                            $('.animsition-loading-1').hide();

                            // Specific fix for Shop Page loader
                            $('#loader').fadeOut();
                        }, 100);

                        // Update Active State in Navbar
                        $('.main-menu li').removeClass('active-menu');
                        $('.main-menu a').each(function () {
                            if ($(this).attr('href') === href) {
                                $(this).parent().addClass('active-menu');
                            }
                        });

                    } else {
                        // Fallback if id not found
                        window.location.href = href;
                    }
                })
                .catch(err => {
                    console.log('Nav Error:', err);
                    window.location.href = href;
                });
        };

        $(document).on('click', navLinks, function (e) {
            const href = $(this).attr('href');

            // Ignore logic
            if (!href || href === '#' || href.startsWith('javascript') || href.includes('logout')) return;

            // Allow ctrl+click
            if (e.metaKey || e.ctrlKey) return;

            e.preventDefault();
            window.spaNavigate(href);
        });

        window.addEventListener('popstate', function () {
            window.location.reload(); // Simple Reload on Back for now to avoid state issues
        });
    });

})(jQuery);
