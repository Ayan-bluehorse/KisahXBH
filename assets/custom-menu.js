(function () {
  // mobile-only guard
  if (window.innerWidth >= 768) return;

  /* ===================== INLINE CSS (full, unprefixed) ===================== */
  const style = document.createElement("style");
  style.textContent = `
.mobile-navigation-drawer {
  display: flex !important;
  flex-direction: column !important;
}
.mobile-navigation-drawer .navigation__mobile-header {
  border-bottom: none !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mobile-navigation-drawer .mobile-nav-toggle {
  width: auto !important;
}
.mobile-navigation-drawer .kisah-header-logo {
  height: 36px;
  margin-left: 18px;
}
.mobile-navigation-drawer #custom-main-menu .menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 20px;
  padding: 10px 20px 10px 10px;
}
.mobile-navigation-drawer .menu-h1 {
  padding-left: 20px;
  margin-top: 15px;
}
.mobile-navigation-drawer .menu-h1 h1 {
  font-size: 16px;
  margin-bottom: 0px;
  font-weight: 500;
  color: #2c2c48;
  font-family: "Gabarito";
}
.mobile-navigation-drawer #custom-main-menu .menu-grid a {
  text-align: center;
}
.mobile-navigation-drawer #custom-main-menu .menu-grid img {
  width: 84px;
  border-radius: 1px;
}
.mobile-navigation-drawer #custom-main-menu .menu-grid .menu-label {
  margin-top: 0px;
  font-weight: 400;
  color: #363636;
  font-family: Amiri !important;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
}
.mobile-navigation-drawer #custom-main-menu .menu-grid .menu-label.wide {
  margin-top: 0px;
  color: #363636;
  font-family: Amiri !important;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
}
.mobile-navigation-drawer #custom-main-menu .info-links {
  display: flex;
  gap:7px;
  flex-wrap: wrap;
  align-items: center;
  margin: 20px 10px;
}
.mobile-navigation-drawer #custom-main-menu .info-links a {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #ededed;
  border-radius: 32px;
}
.mobile-navigation-drawer #custom-main-menu .info-links img {
  width: 20px;
  margin-right: 10px;
  border-radius: 0px;
}
.mobile-navigation-drawer #custom-sub-menu {
  padding: 0 16px;
}
.mobile-navigation-drawer #custom-sub-menu a {
  display: block;
  padding: 5px 0;
  margin-bottom: 8px;
  font-weight: 500;
  color: black;
}
.mobile-navigation-drawer #custom-sub-menu .submenu-header {
  margin: 20px 0px 20px 4px;
  display: flex;
  align-items: center;
}
.mobile-navigation-drawer #submenu-back span {
  display: flex;
  align-items: center;
  color: #363636;
  font-size: 16px;
  font-weight: 500;
  font-family: "Gabarito";
}
.mobile-navigation-drawer #custom-sub-menu .submenu-header a {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.mobile-navigation-drawer .info-links span {
  color: #363636;
  text-align: center;
  font-family: "Gabarito";
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: 19px;
  text-transform: uppercase;
}
.mobile-navigation-drawer .social.inline-flex.flex-wrap {
  height: auto !important;
  margin-block: 20px;
  flex-grow: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 20px;
  margin:0px;
}

/* Reviews */
.mobile-navigation-drawer .review-slider-wrapper {
  padding: 20px 16px;
}
.mobile-navigation-drawer .review-slider {
  display: flex;
  position: relative;
  height: auto;
}
.mobile-navigation-drawer .review-card {
  min-width: 100%;
  transition: transform 0.5s ease;
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  transform: translateX(100%);
  padding: 16px;
  box-sizing: border-box;
  border-radius: 2px;
  background: #fff;
  box-shadow: 0px 1px 2px 0px rgba(95, 93, 93, 0.3);
}
.mobile-navigation-drawer .review-card.active {
  opacity: 1;
  transform: translateX(0%);
  position: relative;
}
.mobile-navigation-drawer .review-header {
  display: flex;
  justify-content: space-between;
}
.mobile-navigation-drawer .review-left {
  display: flex;
  align-items: center;
}
.mobile-navigation-drawer .review-initials {
  width: 40px;
  height: 40px;
  background: #b88a44;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-right: 12px;
  font-family: "Gabarito" !important;
}
.mobile-navigation-drawer .review-meta {
  font-size: 13px;
  font-family: "Gabarito" !important;
}
.mobile-navigation-drawer .review-name {
  font-weight: bold;
  color: #333;
  font-family: "Gabarito" !important;
}
.mobile-navigation-drawer .review-date {
  color: #777;
  font-size: 12px;
  font-family: "Gabarito" !important;
}
.mobile-navigation-drawer .review-stars {
  color: #000;
  font-size: 16px;
}
.mobile-navigation-drawer .review-text {
  margin-top: 10px;
  font-size: 14px;
  color: #333;
  font-family: "Gabarito" !important;
}
.mobile-navigation-drawer .review-dots {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 6px;
}
.mobile-navigation-drawer .review-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  transition: background 0.3s;
  cursor: pointer;
}
.mobile-navigation-drawer .review-dot.active {
  background: #1e1233;
}
.mobile-navigation-drawer .trust-icons_container {
  display: flex;
}

/* // new section css */
.mobile-navigation-drawer .CP_KI_Sitewide_14_social_inject {
  margin-top: 40px;
  margin-inline: 10px;
}
.mobile-navigation-drawer .cp-usps-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0px 1px 2px rgba(95, 93, 93, 0.3);
  padding: 12px;
  gap: 5px;
  flex-wrap: wrap;
}
.mobile-navigation-drawer .cp-usp-item {
  flex: 1 1 22%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-size: 13px;
  line-height: 1.4;
  color: #000;
  border-right: 1px solid #e0c199;
  padding: 0 5px;
}
.mobile-navigation-drawer .cp-usp-item:last-child {
  border-right: none;
}
.mobile-navigation-drawer .cp-usp-item img {
  width: 32px;
  height: 32px;
  margin-bottom: 6px;
}
.mobile-navigation-drawer .cp-usp-item p {
  font-size: 12px;
  font-weight: 400;
  font-family: "Generis Sans W01 Bold" !important;
}
.mobile-navigation-drawer .navigation {
  margin-bottom: 0px;
}

/* // submenu images css */
.mobile-navigation-drawer .cp-submenu-link {
  display: block;
  text-decoration: none;
  padding: 10px 0;
}
.mobile-navigation-drawer .cp-submenu-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  gap: 10px;
  border-radius: 8px;
  background-color: #f1f1f1;
}
.mobile-navigation-drawer .cp-submenu-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.mobile-navigation-drawer .cp-submenu-text {
  font-size: 16px;
  color: #363636;
  font-family: "GenerisSansW01-Regular" !important;
  width: 150px;
  margin-left: 10px;
  white-space: nowrap;
}
.mobile-navigation-drawer .cp-submenu-arrow1 img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.mobile-navigation-drawer .cp-submenu-content:hover {
  background: #f5f5f5;
}
.mobile-navigation-drawer .cp-submenu-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}
.mobile-navigation-drawer .menu-grid-two {
  display: grid;
  margin-block: 20px;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 15px;
  column-gap: 15px;
  padding:0px 15px;
}
.mobile-navigation-drawer .menu-item-pair {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: "GenerisSansW01-Bold";
  color: #363636;
}
.mobile-navigation-drawer .menu-item-pair img {
  width: 100px;
  height: 100px;
  border-radius: 12px;
}
// .mobile-navigation-drawer .menu-single-list img,.mobile-navigation-drawer .menu-two-list img {
//     height: 100%;
//     border-radius: 12px;
//     aspect-ratio: 16 / 9;
//     object-fit: cover;
//     width: 100%;
//     object-fit: cover;
//     object-position: center top;
// }
.mobile-navigation-drawer .menu-label {
  margin-top: 6px;
  font-size: 13px;
  font-family: "GenerisSansW01-Bold";
  font-weight: 400;
  text-align:center;
}
.mobile-navigation-drawer .menu-single-list {
  grid-template-columns: 1fr 1fr;
  display: grid;
  gap: 10px;
  padding: 20px 15px 0px 15px;
}
.mobile-navigation-drawer .menu-two-list {
    grid-template-columns: 1fr 1fr;
    display: grid;
    gap: 10px;
    padding: 0px 15px;
}
.mobile-navigation-drawer .menu-single-item .menu-text {
  text-align:center;
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
  padding-top:10px;
}
.mobile-navigation-drawer .menu-single-list img,.mobile-navigation-drawer .menu-grid-two img,.mobile-navigation-drawer .menu-two-list .image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
}
.mobile-navigation-drawer .menu-single-item {
  text-decoration: none;
  font-family: "GenerisSansW01-Bold";
  color: #363636;
}
.mobile-navigation-drawer .menu-single-item span {
  font-family: "GenerisSansW01-Bold";
  font-size: 13px;
  font-weight: 400;
  text-align:center;
}
.mobile-navigation-drawer .menu-text .arrow-icon {
  height: 12px !important;
}
@media (max-width: 373px) {
.mobile-navigation-drawer #custom-main-menu .info-links {
  gap:10px;
}
}
@media (max-width: 768px) {
.mobile-navigation-drawer .menu-two-list {
    grid-template-columns: 1fr;
}
}

.mobile-navigation-drawer .custom-announcement-bar {
  display: block;
  width: 100%;
  background-color: #201747;
  color: #ffffff;
  text-align: center;
  padding: 6px 10px;
  font-size: 14px;
  font-family: "Gabarito", sans-serif;
  text-decoration: none;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

`;
  document.head.appendChild(style);
  /* ===================== /INLINE CSS ===================== */

  // load Agbalumo font (once)
  (function loadAgbalumoFont() {
    const id = "agbalumo-google-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Agbalumo&display=swap";
      document.head.appendChild(link);
    }
  })();

  // bail if drawer not present
  const drawer = document.querySelector(".mobile-navigation-drawer .navigation__tier-1-container");
  if (!drawer) return;

  // header logo injection
  const header = document.querySelector(".mobile-navigation-drawer .navigation__mobile-header");
  if (header && !header.querySelector(".kisah-header-logo")) {
    const logo = document.createElement("img");
    logo.src = "https://kisah.in/cdn/shop/files/Group_63_1.png?v=1715841265&width=300";
    logo.alt = "logo";
    logo.className = "kisah-header-logo";
    const backBtn = header.querySelector(".mobile-nav-back");
    header.insertBefore(logo, backBtn || header.firstChild);
  }

  // wipe existing columns except first child (keeps base structure)
  while (drawer.children.length > 1) {
    drawer.removeChild(drawer.lastChild);
  }

  // wrapper & panes
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div id="custom-main-menu"></div>
    <div id="custom-sub-menu" style="display:none;"></div>
  `;
  drawer.appendChild(wrapper);

  const mainMenu = wrapper.querySelector("#custom-main-menu");
  const subMenu  = wrapper.querySelector("#custom-sub-menu");

  // images & mapping
  // const occasionImages = [
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_15.png?v=1751959609",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_16.png?v=1751959646",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_17.png?v=1751959704",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_18.png?v=1751959750",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_19.png?v=1751959782",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_20.png?v=1751959815",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_21.png?v=1751959860"
  // ];
  // const categoryImages = [
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/indowestern_bfc79303-ae18-4387-8ed1-d48d93b3e73c.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/kurta_jacket_fbfb0ffc-bf0c-4753-b75d-0a972e316d89.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/kurta_sets.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/kurta-sets-menu-sep.jpg?v=1758104596",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/jodhpuri__achkan.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/sherwani.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/nehru_jacket.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/kurta_7cf6ec9f-320e-4c95-b885-96ae172bcd4e.png?v=1753335385"
  // ];
  // const collectionImages = [
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_22.png?v=1751959923",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_23.png?v=1751959967"
  // ];
  // const subMenuByCategory = [
  //   { link: "/collections/indowestern-sets",      title: "Indowestern Sets" },
  //   { link: "/collections/jacket",                title: "Kurta Jacket Set" },
  //   { link: "/collections/kurta-sets",            title: "Kurta Sets" },
  //   { link: "/collections/short-kurta",           title: "Short Kurta" },
  //   { link: "/collections/jodhpuri-bandhgala",    title: "Jodhpuri" },
  //   { link: "/collections/sherwani-achkans",      title: "Sherwani & Achkans" },
  //   { link: "/collections/nehru-jackets",         title: "Nehru Jacket" },
  //   { link: "/collections/kurta",                 title: "Kurta" }
  // ];

    const occasionImages = [
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_15.png?v=1751959609",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_16.png?v=1751959646",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_17.png?v=1751959704",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_18.png?v=1751959750",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_19.png?v=1751959782",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_20.png?v=1751959815",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_21.png?v=1751959860"
  ];
  // const categoryImages = [
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/kurta-sets-menu-sep.jpg?v=1758104596",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/indowestern_bfc79303-ae18-4387-8ed1-d48d93b3e73c.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/kurta_jacket_fbfb0ffc-bf0c-4753-b75d-0a972e316d89.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/kurta_7cf6ec9f-320e-4c95-b885-96ae172bcd4e.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/jodhpuri__achkan.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/sherwani.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/nehru_jacket.png?v=1753335385",
  //   "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/kurta-sets-menu-sep.jpg?v=1758104596"
  // ];
  const categoryImages = [
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Kurta_Set_beba450f-de96-4d49-b86f-72a76542b43c.png?v=1772186847",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Indowestern_7f38c040-6874-4970-8b35-0acbf3e45227.png?v=1772186846",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Kurta_Jacket_Set.png?v=1772186847",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Kurta_87d44b1a-b676-4f63-b4df-3f315b0cab3e.png?v=1772186846",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Jodhpuri.png?v=1772186848",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Sherwani_f50a1d3a-515c-4778-abf4-71d3ec53823d.png?v=1772186846",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Nehru_Jacket_ed302a75-b311-409a-af38-fac220c5debd.png?v=1772186848",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Short_Kurta_08193c91-09af-48e3-955b-ec1b88d4e54a.png?v=1772186848",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Dupatta.png?v=1772186846"
  ];
  const collectionImages = [
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_22.png?v=1751959923",
    "https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_23.png?v=1751959967"
  ];
  const subMenuByCategory = [
    { link: "/collections/kurta-sets",            title: "Kurta Set" },
    { link: "/collections/indowestern-sets",      title: "Indowestern" },
    { link: "/collections/jacket",                title: "Kurta Jacket Set" },
    { link: "/collections/kurta",                 title: "Kurta" },
    { link: "/collections/jodhpuri-bandhgala",    title: "Jodhpuri" },
    { link: "/collections/sherwani-achkans",      title: "Sherwani" },
    { link: "/collections/nehru-jackets",         title: "Nehru Jacket" },
    { link: "/collections/short-kurta",           title: "Short Kurta" },
    { link: "/collections/kurta-set-with-dupatta",title: "Dupatta"}
  ];

  let categoryName;
  const subMenus = { occasion: [], category: [], collection: [] };

  // parse existing nav columns to build submenus + inject icons
  (function collectSubmenus() {
    const navColumns = document.querySelectorAll(
      "ul.navigation__tier-1 > li:first-child .navigation__tier-2.navigation__columns > .navigation__column"
    );
    navColumns.forEach((column) => {
      const title = column.querySelector(".navigation__column-title")?.textContent.trim().toLowerCase();
      let key, imageSet;
      if (!title) return;

      if (title.includes("occasion")) { key = "occasion"; imageSet = occasionImages; }
      else if (title.includes("category")) { key = "category"; imageSet = categoryImages; }
      else if (title.includes("collection")) { key = "collection"; imageSet = collectionImages; }
      else { return; }

      const links = column.querySelectorAll(
        "ul.navigation__tier-1 > li:first-child .navigation__tier-3 a.navigation__link"
      );

      if (key === "category") {
        const ul = column.querySelector("ul.navigation__tier-3");
        if (ul) {
          ul.innerHTML = "";
          subMenuByCategory.forEach((item, i) => {
            const li = document.createElement("li");
            li.className = "navigation__item";

            const a = document.createElement("a");
            a.className = "navigation__link";
            a.href = item.link;

            const img = document.createElement("img");
            img.src = categoryImages[i] || "";
            img.alt = item.title;
            img.className = "injected-submenu-icon";
            img.loading = "lazy";
            a.appendChild(img);
            a.appendChild(document.createTextNode(item.title));
            li.appendChild(a);
            ul.appendChild(li);

            subMenus[key].push({ label: item.title, link: item.link, image: categoryImages[i] || "" });
          });
        }
      } else {
        links.forEach((a, i) => {
          const label = (a.textContent || "").trim();
          const link  = a.getAttribute("href");
          const image = imageSet[i] || "";
          subMenus[key].push({ label, link, image });

          if (image) {
            const imgEl = document.createElement("img");
            imgEl.src = image;
            imgEl.alt = label;
            imgEl.className = "injected-submenu-icon";
            a.insertBefore(imgEl, a.firstChild);
          }
        });
      }
    });
  })();

  // main render — INFO-LINKS BELOW menu-single-list (as requested)
  function renderMainMenu() {
    subMenu.style.display = "none";
    mainMenu.style.display = "block";

    // show header, hide USP block in main view
    const topHeader = document.querySelector(".navigation__mobile-header");
    if (topHeader) topHeader.style.display = "flex";
    const uspSection = document.querySelector(".CP_KI_Sitewide_14_social_inject");
    if (uspSection) uspSection.style.display = "none";

    mainMenu.innerHTML = `
      <div>
        <a href="https://kisah.in/collections/website-exclusives" class="custom-announcement-bar">
          Shop website exclusives now
        </a>
        <div class='menu-h1'><h1>Shop By Category</h1></div>

        <div class="menu-grid-two">
          ${subMenus.category.map(item => `
            <a href="${item.link}" class="menu-item-pair">
              <img src="${item.image}" />
              <div class="menu-label">${item.label}</div>
            </a>`).join("")}
        </div>

        <div class="menu-two-list">
          <a href="#" class="submenu-trigger menu-single-item" data-submenu="occasion">
            <div class="image">
              <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/WhatsApp_Image_2026-02-03_at_9.57.45_AM.jpg?v=1770093660" />
            </div>
            <div class="menu-text">
              <span>By Occasion</span>
               <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/menu-arrow.png?v=1753674050" class="arrow-icon" />
            </div>
          </a>

        </div>


        <div class="menu-single-list">



                  <a href="/collections/new-arrivals" class="menu-single-item">
            <div>
               <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/New_Arrivals_f1d9edae-25c9-4f8a-b553-88542e5662ca.png?v=1772169881" />
            </div>
            <div class="menu-text">
              <span>New Arrivals</span>
            </div>
          </a>






           <a href="/collections/best-sellers" class="menu-single-item">
            <div>
              <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Trending_now.png?v=1772169881" />
            </div>
             <div class="menu-text">
                <span>Trending Now</span>
             </div>
          </a>


          
            <a href="/collections/kids" class="menu-single-item">
            <div>
              <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Kids_7be95264-57b8-48c3-8619-5887acfd1ffb.png?v=1772169881" />
            </div>
            <div class="menu-text">
              <span>Kids</span>
            </div>
          </a>
        
         
           <a href="/collections/size-inclusive" class="menu-single-item">
            <div>
              <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Plus.png?v=1772169881" />
            </div>
            <div class="menu-text">
              <span>Plus</span>
            </div>
          </a>

           
        </div>

        <!-- INFO LINKS placed BELOW menu-single-list -->
        <div class="info-links">
          <a href="https://kisah.clickpost.in">
            <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Delivery_truck.png?v=1747290526">
            <span>Track Orders</span>
          </a>
          <a href="/pages/faq-1">
            <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/question_1.png?v=1747290526">
            <span>FAQs</span>
          </a>
          <a href="/pages/contact-us">
            <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/contact-mail_1_1.png?v=1747290526">
            <span>Contact Us</span>
          </a>
        </div>
      </div>
    `;

    mainMenu.querySelectorAll(".submenu-trigger").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const type = el.getAttribute("data-submenu");
        if (type) renderSubMenu(type);
      });
    });
  }

  // submenu render
  function renderSubMenu(type) {
    categoryName = type.toUpperCase();
    let items = (subMenus[type] || []).slice();

    if (type === "occasion" && items.length > 1) {
      // special reorder for festive
      const last = items.pop();
      last.link = "/collections/festive-collection";
      items = [last, ...items];
    }

    mainMenu.style.display = "none";
    subMenu.style.display = "block";

    // hide header, show USP block in submenu view
    const topHeader = document.querySelector(".navigation__mobile-header");
    if (topHeader) topHeader.style.display = "none";
    const uspSection = document.querySelector(".CP_KI_Sitewide_14_social_inject");
    if (uspSection) uspSection.style.display = "block";

    subMenu.innerHTML = `
      <div class="submenu-header">
        <a href="#" id="submenu-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#363636"></path>
          </svg>
          <span>BY ${categoryName}</span>
        </a>
      </div>
      ${items.map(item => `
        <a href="${item.link}" class="cp-submenu-link">
          <div class="cp-submenu-content">
            <span class="cp-submenu-text">${item.label}</span>
            <span class="cp-submenu-arrow1"><img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Icon_1.png?v=1751890906" /></span>
          </div>
        </a>
      `).join("")}
    `;

    subMenu.querySelector("#submenu-back")?.addEventListener("click", (e) => {
      e.preventDefault();
      renderMainMenu();
    });
  }

  // initial main render
  renderMainMenu();

  // USPs block injection (once)
  (function insertUSPs() {
    const target = document.querySelector(".mobile-navigation-drawer .social.inline-flex.flex-wrap");
    if (!target || document.querySelector(".CP_KI_Sitewide_14_social_inject")) return;
    const newSection = document.createElement("div");
    newSection.className = "CP_KI_Sitewide_14_social_inject";
    newSection.innerHTML = `
      <div class="cp-usps-section">
        <div class="cp-usp-item">
          <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/express_1_png.png?v=1751887616" alt="Express Delivery" />
          <p>Express delivery</p>
        </div>
        <div class="cp-usp-item">
          <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/cash-on-delivery_2_png.png?v=1751888017" alt="Cash on Delivery" />
          <p>Cash on delivery</p>
        </div>
        <div class="cp-usp-item">
          <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/return-box_1_png.png?v=1751888055" alt="7 Days Return" />
          <p>7 days return & exchange</p>
        </div>
        <div class="cp-usp-item">
          <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/cashback.png_1.png?v=1751888153" alt="Money Back Guarantee" />
          <p>Money back guarantee</p>
        </div>
      </div>
    `;
    target.parentNode.insertBefore(newSection, target);
  })();

  // Replace close/hamburger button icon with X
  (function swapCloseIcon() {
    const toggleBtn = document.querySelector(".navigation__mobile-header .mobile-nav-toggle");
    if (!toggleBtn) return;
    toggleBtn.querySelector("svg")?.remove();
    toggleBtn.insertAdjacentHTML("beforeend", `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path>
      </svg>
    `);
  })();

  // When drawer closes, reset to main & hide USPs
  document.querySelectorAll(".mobile-nav-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const uspSection = document.querySelector(".CP_KI_Sitewide_14_social_inject");
      if (uspSection) uspSection.style.display = "none";
      renderMainMenu();
    });
  });
})();
