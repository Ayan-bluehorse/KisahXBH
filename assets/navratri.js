window.kisahWhenJQueryReady(function(jQuery) {
  if (window.jQuery && jQuery.fn.slick) {
    jQuery(".cp-carousel").slick({
      dots: true,
      arrows: false,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 2000,
      speed: 600,
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: true
    });
  } else {
    console.error("jQuery or Slick not loaded");
  }
});


window.kisahWhenJQueryReady(function(jQuery) {
  if (window.jQuery && jQuery.fn.slick) {
    jQuery(".cp-customer-review-slider").slick({
      //infinite: true,
      //slidesToShow: 3,
      //slidesToScroll: 1,
      centerMode: true,
      variableWidth: true,
      arrows: true,
      dots: false,
      prevArrow: ".cp-review-nav-buttons .slick-prev",
      nextArrow: ".cp-review-nav-buttons .slick-next",
    });
  } else {
    console.error("jQuery or Slick not loaded");
  }
});





document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".cp-color-card");

  const revealOnScroll = () => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        card.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();
});
