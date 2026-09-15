(function () {
  'use strict';

  const BUCKETS = {
    'Paid Ads': {
      mode: 'full',
      sources: {
        facebook: { mediums: ['paid_social'] },
        google: { mediums: ['cpc', 'display'] },
        twitter: { mediums: ['paid_social', 'cpc', 'cpm', 'cpa'] },
        snapchat: { mediums: ['paid_social', 'cpc', 'cpm', 'cpa'] },
        reddit: { mediums: ['paid_social', 'cpc', 'cpm', 'cpa'] },
        pinterest: { mediums: ['paid_social', 'cpc', 'cpm', 'cpa'] },
      },
      campaignTypes: {
        facebook: [
          'asc',
          'manual-auction',
          'catalog-sales',
          'click-to-whatsapp',
          'influencer-whitelisting',
          'retargeting',
          'lead-gen',
          'video-views',
          'reach',
        ],
        google: ['pmax', 'search', 'shopping', 'yt-video', 'display', 'demand-gen', 'app', 'retargeting'],
        twitter: ['promoted-tweets', 'follower-ads', 'trend-takeover', 'amplify', 'retargeting'],
        snapchat: ['snap-ads', 'collection-ads', 'story-ads', 'dynamic-ads', 'ar-lens', 'retargeting'],
        reddit: ['promoted-post', 'conversation-placement', 'takeover', 'retargeting'],
        pinterest: ['standard-pin', 'shopping-ads', 'carousel', 'video-pin', 'collections', 'retargeting'],
      },
    },
    Organic: {
      mode: 'full',
      sources: {
        google: { mediums: ['organic'] },
        chatgpt: { mediums: ['organic'] },
        claude: { mediums: ['organic'] },
        gemini: { mediums: ['organic'] },
        perplexity: { mediums: ['organic'] },
        partner_name: { mediums: ['referral', 'affiliate'] },
      },
      campaignTypes: {
        google: ['seo-blog', 'product-page', 'collection-page', 'featured-snippet'],
        chatgpt: ['ai-overview', 'brand-mention', 'product-recommendation'],
        claude: ['ai-overview', 'brand-mention', 'product-recommendation'],
        gemini: ['ai-overview', 'brand-mention', 'product-recommendation'],
        perplexity: ['ai-overview', 'brand-mention', 'product-recommendation'],
        partner_name: [
          'affiliate-link',
          'editorial-mention',
          'blogger-review',
          'pr-feature',
          'coupon-site',
        ],
      },
    },
    'Google Business/Maps': {
      mode: 'fixed',
      fixedCampaign: 'google_business_profile',
      sources: {
        google: { mediums: ['organic'] },
      },
    },
    Social: {
      mode: 'social',
      sources: {
        instagram: { mediums: ['social'] },
        youtube: { mediums: ['social'] },
        facebook: { mediums: ['social'] },
        pinterest: { mediums: ['social'] },
        twitter: { mediums: ['social'] },
        reddit: { mediums: ['social'] },
      },
      campaignTypes: {
        instagram: [
          'feed-post',
          'reel',
          'story',
          'carousel',
          'collab-post',
          'link-in-bio',
          'influencer-post',
        ],
        youtube: ['long-form', 'short', 'community-post', 'live', 'influencer-collab'],
        facebook: ['feed-post', 'reel', 'story', 'group-post', 'live'],
        pinterest: ['static-pin', 'idea-pin', 'video-pin', 'board'],
        twitter: ['tweet', 'thread', 'space'],
        reddit: ['community-post', 'ama', 'link-post'],
      },
    },
    Website: {
      mode: 'website',
      sources: {
        'pdp-share': { mediums: ['referral', 'social'] },
      },
      websiteCampaigns: [
        'web-pdp-share',
        'web-homepage',
        'web-collection-page',
        'web-blog',
        'web-search',
      ],
    },
    Bot: {
      mode: 'bot',
      sources: {
        bot: { mediums: ['whatsapp', 'sms', 'email', 'instagram'] },
      },
    },
    Retention: {
      mode: 'full',
      sources: {
        retention_automation: { mediums: ['whatsapp', 'sms', 'email'] },
        retention_campaign: { mediums: ['whatsapp', 'sms', 'email'] },
        utility: { mediums: ['whatsapp', 'sms', 'email'] },
      },
      campaignTypes: {
        retention_automation: [
          'abandoned-cart',
          'browse-abandon',
          'welcome-flow',
          'post-purchase',
          'win-back',
          'cod-to-prepaid',
          'review-request',
        ],
        retention_campaign: [
          'broadcast',
          'promotional',
          'festive-sale',
          'product-launch',
          'restock-alert',
          'loyalty-offer',
        ],
        utility: [
          'order-confirmation',
          'shipping-update',
          'delivery-confirmation',
          'return-update',
          'payment-link',
        ],
      },
    },
    Support: {
      mode: 'support',
      sources: {
        'support-agent': { mediums: ['whatsapp', 'sms', 'email', 'instagram', 'facebook'] },
      },
    },
  };

  const OBJECTIVES = [
    { value: 'purchase', label: 'purchase — Sales/Conversion' },
    { value: 'engagement', label: 'engagement — Engagement/Traffic' },
    { value: 'retargeting', label: 'retargeting — Retargeting' },
    { value: 'transactional', label: 'transactional — Transactional' },
    { value: 'traffic', label: 'traffic — Traffic' },
  ];

  const CONTENT_BUCKETS = ['styling', 'garment-focus', 'aspirational', 'ecom', 'education'];
  const PERSONAE = ['self-bold-aspirational', 'self-bold-classy', 'partner-influenced'];
  const MEDIA_TYPES = ['static', 'video', 'gif', 'text', 'carousel'];

  const SOCIAL_PLACEMENTS = [
    'ig-reels',
    'fb-feed',
    'ig-stories',
    'yt-desc',
    'link-in-bio',
    'yt-shorts',
    'pinterest-feed',
    'twitter-feed',
    'reddit-feed',
  ];

  const FULL_PLACEMENTS = [
    'ig-reels',
    'fb-feed',
    'ig-stories',
    'yt-desc',
    'link-in-bio',
    'search-ad',
    'pmax-asset-group',
    'abandoned-cart-wa',
    'welcome-sms',
    'agent-chat',
  ];

  function validate(val, label) {
    if (!val) return [];
    const e = [];
    if (/[A-Z]/.test(val)) e.push(`${label}: lowercase only`);
    if (/\s/.test(val)) e.push(`${label}: no spaces — use hyphens`);
    if (/[&()+/|%,?"<>=]/.test(val)) e.push(`${label}: remove special chars`);
    return e;
  }

  function slug(str) {
    return (str || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '');
  }

  function fmtDate(d) {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day, 10)}${months[parseInt(m, 10) - 1]}${y}`;
  }

  function buildUrl(base, params) {
    const f = Object.entries(params).filter(([, v]) => v);
    if (!f.length) return base || '';
    return (
      base +
      ((base || '').includes('?') ? '&' : '?') +
      f.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fillSelect(select, options, placeholder, value) {
    if (!select) return;
    select.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = placeholder || 'Select…';
    select.appendChild(ph);
    options.forEach((o) => {
      const opt = document.createElement('option');
      const val = typeof o === 'object' ? o.value : o;
      const lbl = typeof o === 'object' ? o.label : o;
      opt.value = val;
      opt.textContent = lbl;
      if (val === value) opt.selected = true;
      select.appendChild(opt);
    });
    select.value = value || '';
  }

  function renderTags(parts, green) {
    if (!parts.length) return '';
    return parts
      .map(
        (p, i) =>
          `${i > 0 ? '<span class="utmb-tag-sep">_</span>' : ''}<span class="utmb-tag ${green ? 'utmb-tag--content' : 'utmb-tag--campaign'}">${escapeHtml(p)}</span>`
      )
      .join('');
  }

  function renderPreview(parts, green, previewKey) {
    if (!parts.length) return '';
    const joined = parts.join('_');
    const keyAttr = previewKey ? ` data-dynamic-preview="${previewKey}"` : '';
    return `<div class="utmb-name-preview"${keyAttr}>
      <div class="utmb-name-preview__label">${green ? 'Content' : 'Campaign'} name preview</div>
      <div class="utmb-name-preview__tags">${renderTags(parts, green)}</div>
      <code class="utmb-name-preview__code ${green ? 'utmb-name-preview__code--content' : 'utmb-name-preview__code--campaign'}">${escapeHtml(joined)}</code>
    </div>`;
  }

  function renderErrorList(errors, errorKey) {
    if (!errors.length) return '';
    const keyAttr = errorKey ? ` data-dynamic-errors="${errorKey}"` : '';
    return `<div class="utmb-error-list"${keyAttr}>
      <div class="utmb-error-list__title">⚠ Naming Errors</div>
      ${errors.map((e) => `<div class="utmb-error-list__item">· ${escapeHtml(e)}</div>`).join('')}
    </div>`;
  }

  function fieldHtml(label, hint, required, inner, error) {
    return `<div class="utmb-field">
      <label class="utmb-field__label${required ? ' utmb-field__label--required' : ''}">${escapeHtml(label)}</label>
      ${hint ? `<p class="utmb-field__hint">${escapeHtml(hint)}</p>` : ''}
      ${inner}
      ${error ? `<div class="utmb-field-error">⚠ ${escapeHtml(error)}</div>` : ''}
    </div>`;
  }

  function selectHtml(id, value, disabled, hasError) {
    return `<select class="utmb-select${hasError ? ' utmb-input--error' : ''}" data-field="${id}"${disabled ? ' disabled' : ''}></select>`;
  }

  function inputHtml(id, value, placeholder, hasError, mono) {
    return `<input type="text" class="utmb-input${hasError ? ' utmb-input--error' : ''}${mono ? ' utmb-input--mono' : ''}" data-field="${id}" placeholder="${escapeHtml(placeholder || '')}" value="${escapeHtml(value || '')}" />`;
  }

  function dateHtml(id, value) {
    return `<input type="date" class="utmb-input" data-field="${id}" value="${escapeHtml(value || '')}" />`;
  }

  function otherSelHtml(id, otherId, value, otherValue, options, placeholder, disabled) {
    const err = validate(otherValue, 'Value');
    return `<div data-other-sel="${id}">
      ${selectHtml(id, value, disabled, false)}
      <div class="utmb-field-sub" data-other-wrap="${id}"${value === '__other__' ? '' : ' hidden'}>
        ${inputHtml(otherId, otherValue, 'Type here…', err.length && otherValue)}
        ${err[0] && otherValue ? `<div class="utmb-field-error">⚠ ${escapeHtml(err[0])}</div>` : ''}
      </div>
    </div>`;
  }

  function sectionHead(title, icon, badge) {
    return `<div class="utmb-card__head">
      <span class="utmb-card__icon" aria-hidden="true">${icon}</span>
      <h2 class="utmb-card__title">${escapeHtml(title)}</h2>
      ${badge ? `<span class="utmb-card__badge">${escapeHtml(badge)}</span>` : ''}
    </div>`;
  }

  function autoNotice(html) {
    return `<div class="utmb-auto-notice">${html}</div>`;
  }

  function initUtmBuilder(root) {
    const defaultUrl = root.dataset.defaultUrl || 'https://kisah.in';

    const state = {
      url: defaultUrl,
      bucket: '',
      source: '',
      sourceOther: '',
      medium: '',
      mediumOther: '',
      cpProduct: '',
      cpObjective: '',
      cpObjOther: '',
      cpType: '',
      cpTypeOther: '',
      cpAudience: '',
      cpDate: '',
      socProduct: '',
      socType: '',
      socTypeOther: '',
      webCampaign: '',
      webCampOther: '',
      ctHook: '',
      ctInfluencer: '',
      ctCategory: '',
      ctBucket: '',
      ctBucketOther: '',
      ctPersonae: '',
      ctPersonaeOther: '',
      ctMedia: '',
      ctMediaOther: '',
      ctDate: '',
      ctPlacement: '',
      ctPlacementOther: '',
      copied: false,
      touched: {},
    };

    const els = {
      url: root.querySelector('[data-field="url"]'),
      bucket: root.querySelector('[data-field="bucket"]'),
      sourceMount: root.querySelector('[data-mount="source-other"]'),
      mediumMount: root.querySelector('[data-mount="medium"]'),
      sourceMediumPreview: root.querySelector('[data-preview="source-medium"]'),
      campaignMount: root.querySelector('[data-mount="campaign"]'),
      contentMount: root.querySelector('[data-mount="content"]'),
      finalPanel: root.querySelector('[data-panel="final"]'),
      finalTitle: root.querySelector('[data-final="title"]'),
      finalUrl: root.querySelector('[data-final="url"]'),
      copyBtn: root.querySelector('[data-action="copy"]'),
      finalParams: root.querySelector('[data-final="params"]'),
      resetBtn: root.querySelector('[data-action="reset"]'),
    };

    function mark(key) {
      state.touched[key] = true;
    }

    function getComputed() {
      const bd = state.bucket ? BUCKETS[state.bucket] : null;
      const mode = bd?.mode || '';
      const srcList = bd ? Object.keys(bd.sources) : [];
      const srcEff = state.source === '__other__' ? slug(state.sourceOther) : state.source;
      const medList =
        state.source && state.source !== '__other__' && bd?.sources[state.source]?.mediums
          ? bd.sources[state.source].mediums
          : [];
      const medEff = state.medium === '__other__' ? slug(state.mediumOther) : state.medium;
      const campTypeList = bd?.campaignTypes?.[state.source] || [];

      let campaignName = '';
      if (mode === 'fixed') {
        campaignName = bd.fixedCampaign;
      } else if (mode === 'bot') {
        const s = srcEff || 'bot';
        campaignName = medEff ? `${s}_${medEff}` : s;
      } else if (mode === 'support') {
        const s = srcEff || 'support-agent';
        campaignName = medEff ? `${s}-${medEff}` : s;
      } else if (mode === 'social') {
        const p = slug(state.socProduct);
        const t = state.socType === '__other__' ? slug(state.socTypeOther) : state.socType;
        campaignName = [p, t].filter(Boolean).join('_');
      } else if (mode === 'website') {
        campaignName =
          state.webCampaign === '__other__' ? slug(state.webCampOther) : state.webCampaign;
      } else if (mode === 'full') {
        const p = slug(state.cpProduct);
        const ob = state.cpObjective === '__other__' ? slug(state.cpObjOther) : state.cpObjective;
        const ct = state.cpType === '__other__' ? slug(state.cpTypeOther) : state.cpType;
        const au = slug(state.cpAudience);
        const dt = fmtDate(state.cpDate);
        campaignName =
          state.bucket === 'Retention'
            ? [p, ob, au, dt].filter(Boolean).join('_')
            : [p, ob, ct, au, dt].filter(Boolean).join('_');
      }

      const ctBucketEff =
        state.ctBucket === '__other__' ? slug(state.ctBucketOther) : state.ctBucket;
      const ctPersonaeEff =
        state.ctPersonae === 'na'
          ? ''
          : state.ctPersonae === '__other__'
            ? slug(state.ctPersonaeOther)
            : state.ctPersonae;
      const ctMediaEff = state.ctMedia === '__other__' ? slug(state.ctMediaOther) : state.ctMedia;
      const ctPlacEff =
        state.ctPlacement === '__other__' ? slug(state.ctPlacementOther) : state.ctPlacement;

      const contentParts =
        mode === 'social'
          ? [ctPlacEff].filter(Boolean)
          : state.bucket === 'Retention'
            ? [
                slug(state.ctHook),
                slug(state.ctInfluencer),
                slug(state.ctCategory),
                ctBucketEff,
                ctMediaEff,
                fmtDate(state.ctDate),
              ].filter(Boolean)
            : [
                slug(state.ctHook),
                slug(state.ctInfluencer),
                slug(state.ctCategory),
                ctBucketEff,
                ctPersonaeEff,
                ctMediaEff,
                fmtDate(state.ctDate),
                ctPlacEff,
              ].filter(Boolean);

      const contentName = contentParts.join('_');

      const campErrors =
        mode === 'full'
          ? [
              ...validate(state.cpProduct, 'Product/Collection'),
              ...validate(state.cpAudience, 'Target Audience'),
              ...(state.cpType === '__other__' ? validate(state.cpTypeOther, 'Campaign Type') : []),
              ...(state.cpObjective === '__other__' ? validate(state.cpObjOther, 'Objective') : []),
            ]
          : mode === 'social'
            ? [
                ...validate(state.socProduct, 'Product/Collection'),
                ...(state.socType === '__other__'
                  ? validate(state.socTypeOther, 'Campaign Type')
                  : []),
              ]
            : [];

      const contentErrors = [
        ...(mode !== 'social' ? validate(state.ctHook, 'Creative Hook') : []),
        ...(mode !== 'social' ? validate(state.ctInfluencer, 'Influencer') : []),
        ...(mode !== 'social' ? validate(state.ctCategory, 'Category') : []),
        ...(mode !== 'social' && state.ctBucket === '__other__'
          ? validate(state.ctBucketOther, 'Content Bucket')
          : []),
        ...(mode === 'full' &&
        state.bucket !== 'Retention' &&
        state.ctPersonae === '__other__'
          ? validate(state.ctPersonaeOther, 'Personae')
          : []),
        ...(mode !== 'social' && state.ctMedia === '__other__'
          ? validate(state.ctMediaOther, 'Media Type')
          : []),
        ...(state.bucket !== 'Retention' && state.ctPlacement === '__other__'
          ? validate(state.ctPlacementOther, 'Placement')
          : []),
      ];

      const allErrors = [...campErrors, ...contentErrors];
      const finalUrl = buildUrl(state.url, {
        utm_source: srcEff,
        utm_medium: medEff,
        utm_campaign: campaignName,
        utm_content: contentName || undefined,
      });
      const isComplete = !!(srcEff && medEff && campaignName && !allErrors.length);

      return {
        bd,
        mode,
        srcList,
        srcEff,
        medList,
        medEff,
        campTypeList,
        campaignName,
        contentParts,
        contentName,
        campErrors,
        contentErrors,
        allErrors,
        finalUrl,
        isComplete,
      };
    }

    const FIELD_MAP = {
      source: 'source',
      medium: 'medium',
      'source-other': 'sourceOther',
      'medium-other': 'mediumOther',
      'medium-text': 'medium',
      'cp-product': 'cpProduct',
      'cp-objective': 'cpObjective',
      'cp-obj-other': 'cpObjOther',
      'cp-type': 'cpType',
      'cp-type-other': 'cpTypeOther',
      'cp-type-text': 'cpType',
      'cp-audience': 'cpAudience',
      'cp-date': 'cpDate',
      'soc-product': 'socProduct',
      'soc-type': 'socType',
      'soc-type-other': 'socTypeOther',
      'soc-type-text': 'socType',
      'web-campaign': 'webCampaign',
      'web-camp-other': 'webCampOther',
      'ct-hook': 'ctHook',
      'ct-influencer': 'ctInfluencer',
      'ct-category': 'ctCategory',
      'ct-bucket': 'ctBucket',
      'ct-bucket-other': 'ctBucketOther',
      'ct-personae': 'ctPersonae',
      'ct-personae-other': 'ctPersonaeOther',
      'ct-media': 'ctMedia',
      'ct-media-other': 'ctMediaOther',
      'ct-date': 'ctDate',
      'ct-placement': 'ctPlacement',
      'ct-placement-other': 'ctPlacementOther',
    };

    const TOUCH_MAP = {
      'cp-product': 'cpProduct',
      'cp-audience': 'cpAudience',
      'cp-type-other': 'cpTypeOther',
      'soc-product': 'socProduct',
      'soc-type-other': 'socTypeOther',
      'ct-hook': 'ctHook',
      'ct-influencer': 'ctInfl',
      'ct-category': 'ctCat',
      'ct-bucket-other': 'ctBucketOther',
      'ct-personae-other': 'ctPerOther',
      'ct-placement-other': 'ctPlac',
    };

    const OTHER_CLEAR = {
      source: 'sourceOther',
      medium: 'mediumOther',
      'cp-objective': 'cpObjOther',
      'cp-type': 'cpTypeOther',
      'soc-type': 'socTypeOther',
      'web-campaign': 'webCampOther',
      'ct-bucket': 'ctBucketOther',
      'ct-personae': 'ctPersonaeOther',
      'ct-media': 'ctMediaOther',
      'ct-placement': 'ctPlacementOther',
    };

    function withOtherOption(options) {
      return [
        ...options.map((o) => (typeof o === 'object' ? o : { value: o, label: o })),
        { value: '__other__', label: 'Other — specify below' },
      ];
    }

    function populateOtherSelects(c) {
      const fills = [
        ['source', c.srcList.map((s) => ({ value: s, label: s })), state.bucket ? 'Select source…' : 'Pick bucket first', state.source, !state.bucket],
        ['medium', c.medList.map((m) => ({ value: m, label: m })), 'Select medium…', state.medium, false],
        ['web-campaign', c.bd?.websiteCampaigns || [], 'Select campaign…', state.webCampaign, false],
        ['soc-type', c.campTypeList, 'Select type…', state.socType, !state.source],
        ['cp-objective', OBJECTIVES, 'Select objective…', state.cpObjective, false],
        ['cp-type', c.campTypeList, 'Select type…', state.cpType, false],
        ['ct-bucket', CONTENT_BUCKETS, 'Select content bucket…', state.ctBucket, false],
        ['ct-personae', [...PERSONAE.map((p) => ({ value: p, label: p })), { value: 'na', label: 'NA — not applicable' }], 'Select personae…', state.ctPersonae, false],
        ['ct-media', MEDIA_TYPES, 'Select media type…', state.ctMedia, false],
        ['ct-placement', c.mode === 'social' ? SOCIAL_PLACEMENTS : FULL_PLACEMENTS, c.mode === 'social' ? 'Select placement…' : 'Select or pick Other…', state.ctPlacement, false],
      ];

      fills.forEach(([id, options, placeholder, value, disabled]) => {
        const sel = root.querySelector(`[data-field="${id}"]`);
        if (!sel || sel.tagName !== 'SELECT') return;
        fillSelect(sel, withOtherOption(options), placeholder, value);
        if (disabled) sel.disabled = true;
      });
    }

    const FULL_RENDER_ON_CHANGE = new Set(['source']);

    function toggleOtherWrap(field, value) {
      const wrap = root.querySelector(`[data-other-sel="${field}"]`);
      if (!wrap) return;
      const otherWrap = wrap.querySelector(`[data-other-wrap="${field}"]`);
      if (otherWrap) otherWrap.hidden = value !== '__other__';
    }

    function upsertPreview(mount, key, parts, green) {
      if (!mount) return;
      const section = mount.querySelector('.utmb-card') || mount;
      let el = section.querySelector(`[data-dynamic-preview="${key}"]`);
      if (!parts.length) {
        if (el) el.remove();
        return;
      }
      const html = renderPreview(parts, green, key);
      if (el) el.outerHTML = html;
      else section.insertAdjacentHTML('beforeend', html);
    }

    function upsertErrors(mount, key, errors) {
      if (!mount) return;
      const section = mount.querySelector('.utmb-card') || mount;
      let el = section.querySelector(`[data-dynamic-errors="${key}"]`);
      const html = renderErrorList(errors, key);
      if (!html) {
        if (el) el.remove();
        return;
      }
      if (el) el.outerHTML = html;
      else {
        const preview = section.querySelector(`[data-dynamic-preview="${key}"]`);
        if (preview) preview.insertAdjacentHTML('beforebegin', html);
        else section.insertAdjacentHTML('beforeend', html);
      }
    }

    function updateDerivedSections(c) {
      if (els.sourceMediumPreview) {
        if (c.srcEff && c.medEff) {
          els.sourceMediumPreview.hidden = false;
          els.sourceMediumPreview.innerHTML = `✓ <strong>source</strong> = <code>${escapeHtml(c.srcEff)}</code> &nbsp;·&nbsp; <strong>medium</strong> = <code>${escapeHtml(c.medEff)}</code>`;
        } else {
          els.sourceMediumPreview.hidden = true;
        }
      }

      const autoCode = els.campaignMount?.querySelector('.utmb-auto-notice code');
      if (autoCode) autoCode.textContent = c.campaignName || '—';

      if (c.campaignName) {
        upsertPreview(
          els.campaignMount,
          'campaign',
          c.mode === 'website' ? [c.campaignName] : c.campaignName.split('_'),
          false
        );
      } else {
        upsertPreview(els.campaignMount, 'campaign', [], false);
      }
      upsertErrors(els.campaignMount, 'campaign', c.campErrors);

      if (c.mode === 'social' || c.mode === 'full') {
        upsertPreview(els.contentMount, 'content', c.contentParts, true);
        upsertErrors(els.contentMount, 'content', c.contentErrors);

        const personaeNa = els.contentMount?.querySelector('.utmb-personae-na');
        if (personaeNa) personaeNa.hidden = state.ctPersonae !== 'na';
      }
    }

    function handleFieldChange(field, value, isChange) {
      const key = FIELD_MAP[field];
      if (!key) return;
      state[key] = value;
      if (TOUCH_MAP[field]) mark(TOUCH_MAP[field]);

      if (isChange && OTHER_CLEAR[field]) {
        if (value !== '__other__') state[OTHER_CLEAR[field]] = '';
        toggleOtherWrap(field, value);
      }

      if (isChange && field === 'source') {
        state.medium = '';
        state.mediumOther = '';
        state.cpType = '';
        state.cpTypeOther = '';
        state.socType = '';
        state.socTypeOther = '';
      }

      if (isChange && FULL_RENDER_ON_CHANGE.has(field)) {
        render({ full: true });
      } else {
        render({ full: false });
      }
    }

    function resetBucketFields() {
      state.source = '';
      state.sourceOther = '';
      state.medium = '';
      state.mediumOther = '';
      state.cpProduct = '';
      state.cpObjective = '';
      state.cpObjOther = '';
      state.cpType = '';
      state.cpTypeOther = '';
      state.cpAudience = '';
      state.cpDate = '';
      state.socProduct = '';
      state.socType = '';
      state.socTypeOther = '';
      state.webCampaign = '';
      state.webCampOther = '';
    }

    function renderSourceMedium(c) {
      fillSelect(els.bucket, Object.keys(BUCKETS), 'Select bucket…', state.bucket);

      if (els.sourceMount) {
        els.sourceMount.innerHTML = otherSelHtml(
          'source',
          'source-other',
          state.source,
          state.sourceOther,
          c.srcList,
          state.bucket ? 'Select source…' : 'Pick bucket first',
          !state.bucket
        );
        const srcSel = els.sourceMount.querySelector('[data-field="source"]');
        fillSelect(
          srcSel,
          [
            ...c.srcList.map((s) => ({ value: s, label: s })),
            { value: '__other__', label: 'Other — specify below' },
          ],
          state.bucket ? 'Select source…' : 'Pick bucket first',
          state.source
        );
        srcSel.disabled = !state.bucket;
      }

      if (els.mediumMount) {
        let html = '';
        if (state.source && state.source !== '__other__' && c.medList.length > 0) {
          html = otherSelHtml(
            'medium',
            'medium-other',
            state.medium,
            state.mediumOther,
            c.medList,
            'Select medium…',
            false
          );
        } else if (state.source) {
          html = inputHtml('medium-text', state.medium, 'e.g. whatsapp, email…', false);
        } else {
          html = selectHtml('medium', '', true, false);
        }
        els.mediumMount.innerHTML = html;

        if (state.source && state.source !== '__other__' && c.medList.length > 0) {
          const medSel = els.mediumMount.querySelector('[data-field="medium"]');
          fillSelect(
            medSel,
            [
              ...c.medList.map((m) => ({ value: m, label: m })),
              { value: '__other__', label: 'Other — specify below' },
            ],
            'Select medium…',
            state.medium
          );
        } else if (state.source) {
          /* medium-text handled via delegation */
        } else {
          const medSel = els.mediumMount.querySelector('[data-field="medium"]');
          fillSelect(medSel, [], 'Pick source first', '');
        }
      }

      if (els.sourceMediumPreview) {
        if (c.srcEff && c.medEff) {
          els.sourceMediumPreview.hidden = false;
          els.sourceMediumPreview.innerHTML = `✓ <strong>source</strong> = <code>${escapeHtml(c.srcEff)}</code> &nbsp;·&nbsp; <strong>medium</strong> = <code>${escapeHtml(c.medEff)}</code>`;
        } else {
          els.sourceMediumPreview.hidden = true;
        }
      }
    }

    function renderCampaign(c) {
      if (!els.campaignMount) return;
      let html = '';

      if (c.mode === 'fixed') {
        html = `<section class="utmb-card">${sectionHead('Campaign Name (utm_campaign)', '🎯', 'AUTO')}
          ${autoNotice(`⚡ Fixed for this bucket: <code>${escapeHtml(c.bd.fixedCampaign)}</code>`)}
        </section>`;
      } else if (c.mode === 'bot') {
        html = `<section class="utmb-card">${sectionHead('Campaign Name (utm_campaign)', '🎯', 'AUTO')}
          ${autoNotice(`⚡ Auto-built from source + medium: <code>${escapeHtml(c.campaignName || '—')}</code>
            <div class="utmb-auto-notice__hint">Format: bot_medium (e.g. bot_whatsapp, bot_instagram)</div>`)}
        </section>`;
      } else if (c.mode === 'support') {
        html = `<section class="utmb-card">${sectionHead('Campaign Name (utm_campaign)', '🎯', 'AUTO')}
          ${autoNotice(`⚡ Auto-built from source + medium: <code>${escapeHtml(c.campaignName || '—')}</code>
            <div class="utmb-auto-notice__hint">Format: support-agent-medium (e.g. support-agent-whatsapp)</div>`)}
        </section>`;
      } else if (c.mode === 'website') {
        html = `<section class="utmb-card">${sectionHead('Campaign Name (utm_campaign)', '🎯', '')}
          ${fieldHtml(
            'Campaign',
            'Select the campaign for this website link',
            true,
            otherSelHtml(
              'web-campaign',
              'web-camp-other',
              state.webCampaign,
              state.webCampOther,
              c.bd.websiteCampaigns,
              'Select campaign…',
              false
            )
          )}
          ${c.campaignName ? renderPreview([c.campaignName], false, 'campaign') : ''}
        </section>`;
      } else if (c.mode === 'social') {
        const socProdErr = state.touched.socProduct
          ? validate(state.socProduct, 'Product/Collection')[0]
          : '';
        html = `<section class="utmb-card">${sectionHead('Campaign Name (utm_campaign)', '🎯', '')}
          <div class="utmb-grid-2">
            ${fieldHtml(
              'Product / Collection',
              'Optional — e.g. sherwani, short-kurta, festive-all',
              false,
              inputHtml(
                'soc-product',
                state.socProduct,
                'sherwani (optional)',
                state.touched.socProduct && !!validate(state.socProduct, 'x').length
              ),
              socProdErr
            )}
            ${fieldHtml(
              'Campaign Type',
              state.source ? `Types for ${state.source}` : 'Select source first',
              true,
              c.campTypeList.length > 0
                ? otherSelHtml(
                    'soc-type',
                    'soc-type-other',
                    state.socType,
                    state.socTypeOther,
                    c.campTypeList,
                    'Select type…',
                    !state.source
                  )
                : inputHtml('soc-type-text', state.socType, 'Type campaign type…', false)
            )}
          </div>
          ${renderErrorList(c.campErrors, 'campaign')}
          ${c.campaignName ? renderPreview(c.campaignName.split('_'), false, 'campaign') : ''}
        </section>`;
      } else if (c.mode === 'full' && state.bucket === 'Retention') {
        const cpProdErr = state.touched.cpProduct
          ? validate(state.cpProduct, 'Product/Collection')[0]
          : '';
        const cpAudErr = state.touched.cpAudience
          ? validate(state.cpAudience, 'Target Audience')[0]
          : '';
        html = `<section class="utmb-card">${sectionHead('Campaign Name (utm_campaign)', '🎯', '')}
          <div class="utmb-grid-2">
            ${fieldHtml(
              'Product / Collection',
              'e.g. sherwani, short-kurta, festive-all',
              true,
              inputHtml(
                'cp-product',
                state.cpProduct,
                'sherwani',
                state.touched.cpProduct && !!validate(state.cpProduct, 'x').length
              ),
              cpProdErr
            )}
            ${fieldHtml(
              'Objective',
              '',
              true,
              otherSelHtml(
                'cp-objective',
                'cp-obj-other',
                state.cpObjective,
                state.cpObjOther,
                OBJECTIVES,
                'Select objective…',
                false
              )
            )}
            ${fieldHtml(
              'Target Audience / Season',
              'e.g. new, cart-abandon-60d, wedding-season',
              false,
              inputHtml(
                'cp-audience',
                state.cpAudience,
                'new',
                state.touched.cpAudience && !!validate(state.cpAudience, 'x').length
              ),
              cpAudErr
            )}
            ${fieldHtml('Date', 'DDMMMYYYY e.g. 05May2026', true, dateHtml('cp-date', state.cpDate))}
          </div>
          ${renderErrorList(c.campErrors, 'campaign')}
          ${c.campaignName ? renderPreview(c.campaignName.split('_'), false, 'campaign') : ''}
        </section>`;
      } else if (c.mode === 'full' && state.bucket !== 'Retention') {
        const cpProdErr = state.touched.cpProduct
          ? validate(state.cpProduct, 'Product/Collection')[0]
          : '';
        const cpAudErr = state.touched.cpAudience
          ? validate(state.cpAudience, 'Target Audience')[0]
          : '';
        html = `<section class="utmb-card">${sectionHead('Campaign Name (utm_campaign)', '🎯', '')}
          <div class="utmb-grid-2">
            ${fieldHtml(
              'Product / Collection',
              'e.g. sherwani, short-kurta, festive-all',
              true,
              inputHtml(
                'cp-product',
                state.cpProduct,
                'sherwani',
                state.touched.cpProduct && !!validate(state.cpProduct, 'x').length
              ),
              cpProdErr
            )}
            ${fieldHtml(
              'Objective',
              '',
              true,
              otherSelHtml(
                'cp-objective',
                'cp-obj-other',
                state.cpObjective,
                state.cpObjOther,
                OBJECTIVES,
                'Select objective…',
                false
              )
            )}
            ${fieldHtml(
              'Campaign Type',
              state.source && c.campTypeList.length
                ? `Types for ${state.source}`
                : 'Select source for smart suggestions',
              true,
              c.campTypeList.length > 0
                ? otherSelHtml(
                    'cp-type',
                    'cp-type-other',
                    state.cpType,
                    state.cpTypeOther,
                    c.campTypeList,
                    'Select type…',
                    false
                  )
                : inputHtml('cp-type-text', state.cpType, 'e.g. broadcast, abandoned-cart…', false)
            )}
            ${fieldHtml(
              'Target Audience / Season',
              'e.g. new, cart-abandon-60d, wedding-season',
              false,
              inputHtml(
                'cp-audience',
                state.cpAudience,
                'new',
                state.touched.cpAudience && !!validate(state.cpAudience, 'x').length
              ),
              cpAudErr
            )}
            ${fieldHtml('Date', 'DDMMMYYYY e.g. 05May2026', true, dateHtml('cp-date', state.cpDate))}
          </div>
          ${renderErrorList(c.campErrors, 'campaign')}
          ${c.campaignName ? renderPreview(c.campaignName.split('_'), false, 'campaign') : ''}
        </section>`;
      }

      els.campaignMount.innerHTML = html;
    }

    function renderContent(c) {
      if (!els.contentMount) return;
      let html = '';

      if (c.mode === 'social') {
        const placErr = state.touched.ctPlac ? validate(state.ctPlacement, 'Placement')[0] : '';
        html = `<section class="utmb-card">${sectionHead('Ad / Content Name (utm_content)', '🎨', '')}
          ${fieldHtml(
            'Placement / Trigger',
            'e.g. ig-reels, fb-feed, ig-stories, link-in-bio, yt-desc',
            false,
            otherSelHtml(
              'ct-placement',
              'ct-placement-other',
              state.ctPlacement,
              state.ctPlacementOther,
              SOCIAL_PLACEMENTS,
              'Select placement…',
              false
            ),
            placErr
          )}
          ${renderErrorList(c.contentErrors, 'content')}
          ${c.contentName ? renderPreview(c.contentParts, true, 'content') : ''}
        </section>`;
      } else if (c.mode === 'full' && state.bucket === 'Retention') {
        html = `<section class="utmb-card">${sectionHead('Ad / Content Name (utm_content)', '🎨', '')}
          <div class="utmb-grid-2">
            ${fieldHtml(
              'Creative Hook / Message',
              'e.g. reminder-1, offer-unlock, cod-to-prepaid',
              false,
              inputHtml(
                'ct-hook',
                state.ctHook,
                'reminder-1',
                state.touched.ctHook && !!validate(state.ctHook, 'x').length
              ),
              state.touched.ctHook ? validate(state.ctHook, 'Creative Hook')[0] : ''
            )}
            ${fieldHtml(
              'Influencer / Identifier',
              'Optional',
              false,
              inputHtml(
                'ct-influencer',
                state.ctInfluencer,
                'optional',
                state.touched.ctInfl && !!validate(state.ctInfluencer, 'x').length
              ),
              state.touched.ctInfl ? validate(state.ctInfluencer, 'Influencer')[0] : ''
            )}
            ${fieldHtml(
              'Category / Collection',
              'e.g. summer, kurta-sets, short-kurta',
              false,
              inputHtml(
                'ct-category',
                state.ctCategory,
                'summer',
                state.touched.ctCat && !!validate(state.ctCategory, 'x').length
              ),
              state.touched.ctCat ? validate(state.ctCategory, 'Category')[0] : ''
            )}
            ${fieldHtml(
              'Content Bucket',
              '',
              false,
              otherSelHtml(
                'ct-bucket',
                'ct-bucket-other',
                state.ctBucket,
                state.ctBucketOther,
                CONTENT_BUCKETS,
                'Select content bucket…',
                false
              )
            )}
            ${fieldHtml(
              'Media Type',
              '',
              false,
              otherSelHtml(
                'ct-media',
                'ct-media-other',
                state.ctMedia,
                state.ctMediaOther,
                MEDIA_TYPES,
                'Select media type…',
                false
              )
            )}
            ${fieldHtml('Date', 'DDMMMYYYY e.g. 05May2026', false, dateHtml('ct-date', state.ctDate))}
          </div>
          ${renderErrorList(c.contentErrors, 'content')}
          ${c.contentName ? renderPreview(c.contentParts, true, 'content') : ''}
        </section>`;
      } else if (c.mode === 'full' && state.bucket !== 'Retention') {
        html = `<section class="utmb-card">${sectionHead('Ad / Content Name (utm_content)', '🎨', '')}
          <div class="utmb-grid-2">
            ${fieldHtml(
              'Creative Hook / Message',
              'e.g. grwm, fabric-closeup, discount-20',
              false,
              inputHtml(
                'ct-hook',
                state.ctHook,
                'grwm',
                state.touched.ctHook && !!validate(state.ctHook, 'x').length
              ),
              state.touched.ctHook ? validate(state.ctHook, 'Creative Hook')[0] : ''
            )}
            ${fieldHtml(
              'Influencer / Identifier',
              'e.g. roop-kumar (optional)',
              false,
              inputHtml(
                'ct-influencer',
                state.ctInfluencer,
                'roop-kumar',
                state.touched.ctInfl && !!validate(state.ctInfluencer, 'x').length
              ),
              state.touched.ctInfl ? validate(state.ctInfluencer, 'Influencer')[0] : ''
            )}
            ${fieldHtml(
              'Category / Collection',
              'e.g. summer, kurta-sets, short-kurta',
              false,
              inputHtml(
                'ct-category',
                state.ctCategory,
                'summer',
                state.touched.ctCat && !!validate(state.ctCategory, 'x').length
              ),
              state.touched.ctCat ? validate(state.ctCategory, 'Category')[0] : ''
            )}
            ${fieldHtml(
              'Content Bucket',
              '',
              false,
              otherSelHtml(
                'ct-bucket',
                'ct-bucket-other',
                state.ctBucket,
                state.ctBucketOther,
                CONTENT_BUCKETS,
                'Select content bucket…',
                false
              )
            )}
            ${fieldHtml(
              'Personae',
              state.ctPersonae === 'na' ? 'NA — will be skipped in the URL' : '',
              false,
              `<div data-personae-wrap>
                ${otherSelHtml(
                  'ct-personae',
                  'ct-personae-other',
                  state.ctPersonae,
                  state.ctPersonaeOther,
                  [...PERSONAE.map((p) => ({ value: p, label: p })), { value: 'na', label: 'NA — not applicable' }],
                  'Select personae…',
                  false
                )}
                ${state.ctPersonae === 'na' ? '<div class="utmb-personae-na">✓ Personae will be skipped</div>' : ''}
              </div>`
            )}
            ${fieldHtml(
              'Media Type',
              '',
              false,
              otherSelHtml(
                'ct-media',
                'ct-media-other',
                state.ctMedia,
                state.ctMediaOther,
                MEDIA_TYPES,
                'Select media type…',
                false
              )
            )}
            ${fieldHtml('Date', 'DDMMMYYYY e.g. 05May2026', false, dateHtml('ct-date', state.ctDate))}
            ${fieldHtml(
              'Placement / Trigger',
              'e.g. ig-reels, fb-feed, abandoned-cart-wa',
              false,
              otherSelHtml(
                'ct-placement',
                'ct-placement-other',
                state.ctPlacement,
                state.ctPlacementOther,
                FULL_PLACEMENTS,
                'Select or pick Other…',
                false
              ),
              state.touched.ctPlac ? validate(state.ctPlacement, 'Placement')[0] : ''
            )}
          </div>
          ${renderErrorList(c.contentErrors, 'content')}
          ${c.contentName ? renderPreview(c.contentParts, true, 'content') : ''}
        </section>`;
      }

      els.contentMount.innerHTML = html;
    }

    function renderFinal(c) {
      if (els.url && document.activeElement !== els.url) {
        els.url.value = state.url;
      }

      if (els.finalPanel) {
        els.finalPanel.classList.toggle('utmb-final--complete', c.isComplete);
        els.finalPanel.classList.toggle('utmb-final--error', c.allErrors.length > 0);
      }

      if (els.finalTitle) {
        if (c.isComplete) els.finalTitle.textContent = '✅ Final UTM URL';
        else if (c.allErrors.length) els.finalTitle.textContent = '⛔ Fix errors above first';
        else els.finalTitle.textContent = '⏳ Fill required fields above';
      }

      if (els.finalUrl) {
        els.finalUrl.textContent = c.finalUrl || 'Your UTM URL will appear here…';
        els.finalUrl.classList.toggle('utmb-final-url--active', c.isComplete);
      }

      if (els.copyBtn) {
        els.copyBtn.hidden = !c.isComplete;
        els.copyBtn.textContent = state.copied ? '✓ Copied!' : '📋 Copy URL';
        els.copyBtn.classList.toggle('utmb-btn-copy--copied', state.copied);
      }

      if (els.finalParams) {
        if (c.isComplete) {
          els.finalParams.hidden = false;
          const params = [
            ['utm_source', c.srcEff],
            ['utm_medium', c.medEff],
            ['utm_campaign', c.campaignName],
            ['utm_content', c.contentName],
          ].filter(([, v]) => v);
          els.finalParams.innerHTML = params
            .map(
              ([k, v]) =>
                `<div class="utmb-param-card">
                  <div class="utmb-param-card__key">${escapeHtml(k)}</div>
                  <code class="utmb-param-card__val">${escapeHtml(v)}</code>
                </div>`
            )
            .join('');
        } else {
          els.finalParams.hidden = true;
        }
      }
    }

    function render(options) {
      const full = options?.full !== false;
      const c = getComputed();
      if (full) {
        renderSourceMedium(c);
        renderCampaign(c);
        if (c.mode === 'social' || c.mode === 'full') {
          renderContent(c);
        } else if (els.contentMount) {
          els.contentMount.innerHTML = '';
        }
        populateOtherSelects(c);
      } else {
        updateDerivedSections(c);
      }
      renderFinal(c);
    }

    root.addEventListener('change', (e) => {
      const field = e.target.dataset?.field;
      if (!field || field === 'url') return;
      if (field === 'bucket') {
        state.bucket = e.target.value;
        resetBucketFields();
        state.ctHook = '';
        state.ctInfluencer = '';
        state.ctCategory = '';
        state.ctBucket = '';
        state.ctBucketOther = '';
        state.ctPersonae = '';
        state.ctPersonaeOther = '';
        state.ctMedia = '';
        state.ctMediaOther = '';
        state.ctDate = '';
        state.ctPlacement = '';
        state.ctPlacementOther = '';
        render({ full: true });
        return;
      }
      handleFieldChange(field, e.target.value, true);
    });

    root.addEventListener('input', (e) => {
      const field = e.target.dataset?.field;
      if (!field) return;
      if (field === 'url') {
        state.url = e.target.value;
        renderFinal(getComputed());
        return;
      }
      if (e.target.tagName === 'SELECT') return;
      handleFieldChange(field, e.target.value, false);
    });

    if (els.resetBtn) {
      els.resetBtn.addEventListener('click', () => {
        Object.assign(state, {
          url: defaultUrl,
          bucket: '',
          source: '',
          sourceOther: '',
          medium: '',
          mediumOther: '',
          cpProduct: '',
          cpObjective: '',
          cpObjOther: '',
          cpType: '',
          cpTypeOther: '',
          cpAudience: '',
          cpDate: '',
          socProduct: '',
          socType: '',
          socTypeOther: '',
          webCampaign: '',
          webCampOther: '',
          ctHook: '',
          ctInfluencer: '',
          ctCategory: '',
          ctBucket: '',
          ctBucketOther: '',
          ctPersonae: '',
          ctPersonaeOther: '',
          ctMedia: '',
          ctMediaOther: '',
          ctDate: '',
          ctPlacement: '',
          ctPlacementOther: '',
          copied: false,
          touched: {},
        });
        render({ full: true });
      });
    }

    if (els.copyBtn) {
      els.copyBtn.addEventListener('click', () => {
        const c = getComputed();
        if (!c.isComplete) return;
        navigator.clipboard.writeText(c.finalUrl).then(() => {
          state.copied = true;
          renderFinal(getComputed());
          setTimeout(() => {
            state.copied = false;
            renderFinal(getComputed());
          }, 2000);
        });
      });
    }

    render({ full: true });
  }

  function boot() {
    document.querySelectorAll('[data-utm-builder]').forEach(initUtmBuilder);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', (e) => {
    const root = e.target.querySelector('[data-utm-builder]');
    if (root) initUtmBuilder(root);
  });
})();
