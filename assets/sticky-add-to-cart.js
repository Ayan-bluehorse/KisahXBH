
// (function () {
//     "use strict";
//     const $ = (s, c = document) => c.querySelector(s);
//     const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
//     const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
//     const txt = (el) => (el ? (el.textContent || "").trim() : "");
//     const fire = (el, types = ["input", "change"]) => el && types.forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));

//     const picker = $('variant-picker');
//     const atcBtn = $('.add-to-cart, [name="add"], button[type="submit"].product-form__cart-submit');
//     const titleNode = $('h1.product-title, .product-single__title, .product-title, [itemprop="name"]');
//     const priceFinder = () => $('.price .price-item, .price .money, [data-product-price], .product__price .money');
//     const imgNode = $('.product__media img, .product-single__media img, .product-gallery img, .product__image img');
//     const productForm = atcBtn ? atcBtn.closest('form') : $('.product-form, form[action*="/cart/add"]');

//     if (!picker || !productForm || !atcBtn) return;

//     //parse variant data
//     let variants = [];
//     const pickerJSON = $('script[type="application/json"]', picker);
//     if (pickerJSON) {
//         try { variants = (JSON.parse(pickerJSON.textContent).variants || []); } catch (e) { }
//     }
//     const getCheckedSize = () => {
//         const checked = $('input.opt-btn:checked', picker);
//         return checked ? checked.value : null;
//     };
//     const variantBySize = (s) => variants.find(v => String(v.option1) === String(s));

//     //build sticky bar 
// let bar = $('#cpStickyBar');
// if (!bar) {
//     // grab prices separately
//     const currentPriceNode = document.querySelector('.price__default .price__current, .price-item--regular, .price .money');
//     const comparePriceNode = document.querySelector('.price__default .price__was, .price-item--sale, .price__compare, .price__was');

//     // grab first main product image
//     const mainImgNode = document.querySelector('.media-gallery__inner .main-image img, .product__media img, .product-single__media img, .product-gallery img, .product__image img');

//     bar = document.createElement('div');
//     bar.id = 'cpStickyBar';
//     bar.innerHTML = `
//       <div class="cp-wrap">
//         <div class="cp-left">
//           <div class="cp-thumb">
//             ${mainImgNode ? `<img alt="" src="${mainImgNode.currentSrc || mainImgNode.src}">` : ''}
//           </div>
//           <div class="cp-meta">
//             <div class="cp-title">${titleNode ? txt(titleNode) : ''}</div>
//             <div class="cp-price">
//               ${currentPriceNode ? `<span class="cp-price--current">${txt(currentPriceNode)}</span>` : ''}
//               ${comparePriceNode ? `<span class="cp-price--compare" style="text-decoration: line-through; opacity: .7; margin-left:6px;">${txt(comparePriceNode)}</span>` : ''}
//             </div>
//           </div>
//         </div>

//         <div class="cp-actions">
//           <!-- SIZE drop-up -->
//           <div class="cp-size cp-drop">
//             <button type="button" class="cp-drop__toggle" aria-haspopup="listbox" aria-expanded="false">
//               <span class="cp-drop__label">${getCheckedSize() || 'Select size'}</span>
//             </button>
//             <ul class="cp-drop__menu" role="listbox" aria-label="Select size"></ul>
//           </div>

//           <button type="button" class="cp-btn cp-btn--wish" aria-label="Wishlist">
//             <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-7.5-4.35-9.5-8.5C.76 9.36 2.42 6 5.5 6c1.9 0 3.04 1.06 3.94 2.2L12 9.9l2.56-1.7C15.46 7.06 16.6 6 18.5 6c3.08 0 4.74 3.36 3 6.5C19.5 16.65 12 21 12 21z" stroke="currentColor" stroke-width="1.6"/></svg>
//             <span>Wishlist</span>
//           </button>

//           <button type="button" class="cp-btn cp-btn--atc">Add To Bag</button>
//         </div>
//       </div>
//     `;
//     document.body.appendChild(bar);
// }


//     const styleId = 'cpStickyBarStyles';
//     if (!$('#' + styleId)) {
//         const style = document.createElement('style');
//         style.id = styleId;
//         style.textContent = `
// #cpStickyBar {
//     position: fixed;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     z-index: 9999;
//     background: #263644;
//     color: #fff;
//     box-shadow: 0 -6px 16px rgba(0, 0, 0, .24);
//     transform: translateY(110%);
//     transition: transform .25s ease
// }

// #cpStickyBar.cp--show {
//     transform: translateY(0)
// }
// #cpStickyBar .cp-wrap {
//     display: flex;
//     gap: 12px;
//     align-items: center;
//     justify-content: space-between;
//     max-width: 1440px;
//     margin: 0 auto;
//     padding: 10px 12px;
// }
// #cpStickyBar .cp-left {
//     display: flex;
//     gap: 10px;
//     align-items: center;
//     min-width: 0
// }

// #cpStickyBar .cp-thumb {
//     width: 40px;
//     height: 40px;
//     border-radius: 6px;
//     overflow: hidden;
//     background: #33424d;
//     flex: 0 0 auto
// }

// #cpStickyBar .cp-thumb img {
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//     display: block
// }

// #cpStickyBar .cp-meta {
//     min-width: 0
// }

// #cpStickyBar .cp-title {
//     font-size: 13px;
//     line-height: 1.2;
//     white-space: nowrap;
//     overflow: hidden;
//     text-overflow: ellipsis;
//     opacity: .95
// }

// #cpStickyBar .cp-price {
//     font-size: 14px;
//     font-weight: 600;
//     margin-top: 3px;
//     white-space: nowrap
// }

// #cpStickyBar .cp-actions {
//     display: flex;
//     gap: 10px;
//     flex: 0 0 auto
// }

// #cpStickyBar .cp-btn {
//     appearance: none;
//     border: 0;
//     border-radius: 8px;
//     padding: 10px 14px;
//     font-size: 14px;
//     line-height: 1;
//     cursor: pointer;
//     white-space: nowrap
// }

// #cpStickyBar .cp-btn:disabled {
//     opacity: .6;
//     cursor: not-allowed
// }

// #cpStickyBar .cp-btn--atc {
//     background: var(--cp-atc-bg, #cab243ff);
//     color: #0b1631;
//     font-weight: 600;
//     min-width: 140px !important;
// }

// #cpStickyBar .cp-btn--wish {
//     background: #263644;
//     color: #cab243ff;
//     border: 1px solid #cab243ff;
//     display: flex;
//     align-items: center;
//     gap: 8px
// }

// #cpStickyBar .cp-btn--wish svg {
//     width: 18px;
//     height: 18px
// }

// #cpStickyBar .cp-drop {
//     position: relative
// }

// #cpStickyBar .cp-drop__toggle {
//     height: 38px;
//     padding: 0 46px 0 12px;
//     border-radius: 8px;
//     border: 1px solid #485864;
//     background: #263644;
//     color: #fff;
//     font-size: 14px;
//     cursor: pointer;
//     position: relative
// }

// #cpStickyBar .cp-drop__toggle:after {
//     content: "";
//     position: absolute;
//     right: 12px;
//     top: 50%;
//     width: 8px;
//     height: 8px;
//     border-right: 2px solid #cbd5df;
//     border-bottom: 2px solid #cbd5df;
//     transform: translateY(-60%) rotate(45deg);
//     pointer-events: none
// }

// #cpStickyBar .cp-drop__menu {
//     position: absolute;
//     bottom: 42px;
//     left: 0;
//     right: 0;
//     background: #263644;
//     border: 1px solid #485864;
//     border-radius: 10px;
//     padding: 6px;
//     display: none;
//     max-height: 220px;
//     overflow: auto;
//     z-index: 2;
//     box-shadow: 0 10px 24px rgba(0, 0, 0, .35);
//     transform-origin: bottom
// }

// #cpStickyBar .cp-drop__menu.cp-open {
//     display: block;
//     animation: cpUp .14s ease
// }

// #cpStickyBar .cp-option {
//     list-style: none;
//     margin: 0;
//     padding: 8px 10px;
//     border-radius: 8px;
//     cursor: pointer;
//     font-size: 14px;
//     text-align: center;
//     color: white;
// }

// #cpStickyBar .cp-option[aria-selected="true"],
// #cpStickyBar .cp-option:hover {
//     background: #263644;
//     color: white;
// }

// #cpStickyBar .cp-option[aria-disabled="true"] {
//     opacity: .45;
//     cursor: not-allowed
// }

// @keyframes cpUp {
//     from {
//         opacity: 0;
//         transform: translateY(6px)
//     }

//     to {
//         opacity: 1;
//         transform: translateY(0)
//     }
// }

// @media (max-width: 767px) {
//     #cpStickyBar .cp-left {
//         display: none
//     }

//     #cpStickyBar .cp-wrap {
//         padding: 10px 12px
//     }

//     #cpStickyBar .cp-btn--atc {
//         flex: 1;
//         min-width: auto
//     }
//     #cpStickyBar .cp-wrap {
//     justify-content: center;
// }
//     body #sy-whatshelp {
//     bottom: 70px;
//     }
// }

//     `;
//         document.head.appendChild(style);
//     }

//     // size menu 
//     const sizeToggle = $('.cp-size .cp-drop__toggle', bar);
//     const sizeLabel = $('.cp-size .cp-drop__label', bar);
//     const sizeMenu = $('.cp-size .cp-drop__menu', bar);

//     function renderSizes() {
//         const current = getCheckedSize();
//         sizeMenu.innerHTML = '';
//         if (!variants.length) {
//             // If no variants, hide the size control
//             $('.cp-size', bar).style.display = 'none';
//             return;
//         }
//         variants.forEach(v => {
//             const li = document.createElement('li');
//             li.className = 'cp-option';
//             li.setAttribute('role', 'option');
//             li.dataset.size = v.option1;
//             li.dataset.vid = v.id;
//             if (v.available === false) li.setAttribute('aria-disabled', 'true');
//             if (String(v.option1) === String(current)) li.setAttribute('aria-selected', 'true');
//             li.textContent = v.available === false ? `${v.option1}` : `${v.option1}`;
//             on(li, 'click', () => {
//                 if (v.available === false) return;
//                 const input = $$('input.opt-btn', picker).find(i => String(i.value) === String(v.option1));
//                 if (input) {
//                     input.checked = true;
//                     fire(input);
//                     sizeLabel.textContent = v.option1;
//                     $$('.cp-option', sizeMenu).forEach(o => o.removeAttribute('aria-selected'));
//                     li.setAttribute('aria-selected', 'true');
//                     reflectATCDisabled();
//                     setTimeout(() => {
//                         const pn = priceFinder();
//                         if (pn) $('.cp-price', bar).textContent = txt(pn);
//                     }, 60);
//                 }
//                 closeMenus();
//             });
//             sizeMenu.appendChild(li);
//         });
//         if (current) sizeLabel.textContent = current;
//     }

//     // sync when native radios change
//     on(picker, 'change', e => {
//         if (e.target && e.target.matches('input.opt-btn')) {
//             const val = e.target.value;
//             sizeLabel.textContent = val;
//             $$('.cp-option', sizeMenu).forEach(o => {
//                 o.removeAttribute('aria-selected');
//                 if (o.dataset.size == val) o.setAttribute('aria-selected', 'true');
//             });
//             reflectATCDisabled();
//             setTimeout(() => {
//                 const pn = priceFinder();
//                 if (pn) $('.cp-price', bar).textContent = txt(pn);
//             }, 60);
//         }
//     });

//     // menus open/close
//     function openMenu(listEl, toggleBtn) { listEl.classList.add('cp-open'); toggleBtn.setAttribute('aria-expanded', 'true'); }
//     function closeMenu(listEl, toggleBtn) { listEl.classList.remove('cp-open'); toggleBtn.setAttribute('aria-expanded', 'false'); }
//     function closeMenus() { closeMenu(sizeMenu, sizeToggle); }
//     on(sizeToggle, 'click', e => { e.stopPropagation(); (sizeMenu.classList.contains('cp-open') ? closeMenu : openMenu)(sizeMenu, sizeToggle); });
//     on(document, 'click', e => { if (!bar.contains(e.target)) closeMenus(); });

//     // actions
//     const atcSticky = $('.cp-btn--atc', bar);
//     const wishSticky = $('.cp-btn--wish', bar);
//     on(atcSticky, 'click', () => { atcBtn.click(); });
//     on(wishSticky, 'click', () => { 
//         $('#wishlist-hero-product-page-button button, .wishlisthero-product-page-button-container button').click(); });

//     function reflectATCDisabled() {
//         const size = getCheckedSize();
//         const v = size ? variantBySize(size) : null;
//         const nativeDisabled = !!(atcBtn.disabled || atcBtn.getAttribute('aria-disabled') === 'true');
//         atcSticky.disabled = nativeDisabled || (v && v.available === false);
//     }

//     // show/hide when native section leaves viewport 
//     let io, target;
//     function findTarget() {
//         return $('.quantity-submit-row') || $('form[action*="/cart/add"]') || $('.product-form') || productForm;
//     }
//     function attachObserver() {
//         const newTarget = findTarget();
//         if (!newTarget) return;
//         if (target === newTarget) return;
//         target = newTarget;
//         if (io) io.disconnect();
//         io = new IntersectionObserver(([entry]) => {
//             if (!entry) return;
//             if (entry.isIntersecting) bar.classList.remove('cp--show');
//             else bar.classList.add('cp--show');
//         }, { threshold: 0 });
//         io.observe(target);
//     }
//     attachObserver();
//     const mo = new MutationObserver(() => {
//         const pn = priceFinder();
//         if (pn) $('.cp-price', bar).textContent = txt(pn);
//         const im = $('.product__media img, .product-single__media img, .product-gallery img, .product__image img');
//         if (im && $('.cp-thumb img', bar)) $('.cp-thumb img', bar).src = im.currentSrc || im.src;
//         attachObserver();
//     });
//     mo.observe(document.body, { subtree: true, childList: true });

//     renderSizes();
//     reflectATCDisabled();

// })();


(function () {
  function initializeStickyAddToBag() {
    const originalButton = document.querySelector('.btn--large.add-to-cart');
    if (!originalButton) return;

    const priceElement = document.querySelector('.price__current');
    const priceText = priceElement ? priceElement.textContent.trim() : '₹ 6,499';

    const stickyContainer = document.createElement('div');
    stickyContainer.className = 'sticky-add-to-cart-container';

    const stickyInner = document.createElement('div');
    stickyInner.className = 'sticky-inner-wrapper';

    const stickyPrice = document.createElement('span');
    stickyPrice.className = 'sticky-add-to-cart-price';
    stickyPrice.textContent = priceText;

    const stickyButton = document.createElement('button');
    stickyButton.className = 'btn btn--large sticky-add-to-cart';
    stickyButton.type = 'submit';
    stickyButton.name = 'add';
    stickyButton.innerHTML = `
      Add To Bag
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" class="add-to-cart-bag" style="margin-left:10px">
        <path d="M21 6H18C18 4.4 17.4 2.9 16.2 1.8S13.6 0 12 0s-3.1.6-4.2 1.8S6 4.4 6 6H3C2.2 6 1.4 6.3.9 6.9.3 7.4 0 8.2 0 9v10c0 1.3.5 2.6 1.5 3.5S3.7 24 5 24h14c1.3 0 2.6-.5 3.5-1.5S24 20.3 24 19V9c0-.8-.3-1.6-.9-2.1S21.8 6 21 6zM8 6c0-1.1.4-2.1 1.2-2.8S10.9 2 12 2s2.1.4 2.8 1.2S16 4.9 16 6H8zm14 13c0 .5-.2 1-.6 1.4-.4.4-.9.6-1.4.6H5c-.5 0-1-.2-1.4-.6C3.2 20 3 19.5 3 19V9c0-.3.1-.5.3-.7S3.7 8 4 8h2v2c0 .3.1.5.3.7S6.7 11 7 11s.5-.1.7-.3S8 10.3 8 10V8h8v2c0 .3.1.5.3.7s.4.3.7.3.5-.1.7-.3S18 10.3 18 10V8h3c.3 0 .5.1.7.3s.3.4.3.7v10z" fill="#ffffff"></path>
      </svg>
    `;

    stickyInner.appendChild(stickyPrice);
    stickyInner.appendChild(stickyButton);
    stickyContainer.appendChild(stickyInner);

    const style = document.createElement('style');
    style.textContent = `
      .sticky-add-to-cart-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        z-index: 40;
        background: white;
        padding: 13px 17px !important;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        display: none;
      }
      .sticky-inner-wrapper {
        max-width: 600px;
        margin: 0 auto;
        background: #201847;
        height: 40px !important;
        border-radius: 50px !important;
        background-color: #201747 !important;
        box-shadow: 0px 4px 8px 3px #00000026 !important;
        width: 100% !important;
        display: flex !important;
        padding: 0 31px !important;
        align-items: center !important;
        justify-content: space-between !important;
        cursor: pointer;
      }
      .sticky-add-to-cart-price {
        color: #ffffff !important;
        font-weight: 400 !important;
        font-size: 18px !important;
        font-family: "Generis Sans W01 Bold" !important;
      }
      .sticky-add-to-cart {
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: #ffffff !important;
        text-transform: capitalize !important;
        font-weight: 400 !important;
        font-size: 18px !important;
        font-family: "Generis Sans W01 Bold" !important;
        padding: 0;
        letter-spacing: normal;
      }
      .sticky-add-to-cart .add-to-cart-bag {
        width: 20px !important;
        height: 21px !important;
        margin-left: 0 !important;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(stickyContainer);

    function isOutOfView(el) {
      const rect = el.getBoundingClientRect();
      return rect.bottom < 0 || rect.top > window.innerHeight;
    }

    function handleScroll() {
      stickyContainer.style.display = isOutOfView(originalButton) ? 'block' : 'none';
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    stickyInner.addEventListener('click', (e) => {
      e.preventDefault();
      originalButton.click();
    });
  }

  document.addEventListener('DOMContentLoaded', initializeStickyAddToBag);
})();
