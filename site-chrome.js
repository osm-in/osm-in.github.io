/**
 * Site chrome for a page that embeds an Amche Atlas.
 *
 * Boilerplate - a community adopting this copies it unchanged and edits
 * config/index.atlas.json instead. Everything below is driven by the `site`
 * block of that config (Amche itself ignores the block), plus the `name`,
 * `color` and `description` Amche already reads:
 *
 *   site.instance   the Amche instance to embed
 *   site.params     URL-API parameters with no atlas-config equivalent
 *                   (renderer, terrain, lang - see docs/API.md)
 *   site.brand      logo, name, tagline, where the logo links to
 *   site.bar        the one-word links shown in the top-right bar itself
 *   site.actions    the primary buttons at the top of the menu panel
 *   site.menu       [{ title, items: [{ label, href, note }] }] sections
 *   site.about      a paragraph of HTML shown below the sections
 *   site.footer     small print links
 *
 * Any href may contain {zoom}, {lat} and {lng}. They are substituted with
 * wherever the map is currently pointed, so "Edit the map" opens the OSM
 * editor on the view the visitor is actually looking at.
 *
 * The bar deliberately sits at top/right at exactly the height of the
 * embedded atlas's own header (21px including its border), covering the
 * amche.in brand and menu button with this community's. It stops there
 * because the map's own controls - compass, terrain, time - live directly
 * below it on the right edge.
 */

const CONFIG_URL = new URL('config/index.atlas.json', location.href).href;
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

const config = await fetch(CONFIG_URL)
    .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
    .catch(error => {
        console.warn('[site-chrome] Could not load', CONFIG_URL, error);
        return {};
    });

const site = config.site || {};
const brand = site.brand || {};

// A browser won't let an https atlas read a config from http://localhost, so
// while this page is served from a local amche-atlas checkout (npm start)
// embed that same checkout: same origin, config loads, nothing to deploy
// first. Everywhere else, the instance named in the config.
const atlasUrl = LOCAL_HOSTS.includes(location.hostname)
    ? new URL('../../../', location.href).href
    : (site.instance || 'https://amche.in');
const atlasOrigin = new URL(atlasUrl, location.href).origin;

/* ------------------------------------------------------------------ frame */

// The opening camera, as the #zoom/lat/lng/bearing/pitch hash the map reads,
// built from the config's own `map` block. Handing it over as a hash rather
// than leaving the frame to read `map` itself is what preserves an authored
// bearing and pitch: an atlas opened without a hash flies to a standard
// head-on camera instead (see js/map-init.js).
function defaultHash() {
    const { center, zoom, bearing, pitch } = config.map || {};
    if (!center || zoom === undefined) return '';
    const view = `#${zoom}/${center[1]}/${center[0]}`;
    return (bearing === undefined && pitch === undefined)
        ? view
        : `${view}/${bearing || 0}/${pitch || 0}`;
}

function buildSrc() {
    const src = new URL(atlasUrl, location.href);
    src.searchParams.set('atlas', CONFIG_URL);
    for (const [key, value] of Object.entries(site.params || {})) src.searchParams.set(key, value);
    for (const [key, value] of new URLSearchParams(location.search)) src.searchParams.set(key, value);
    src.hash = location.hash || defaultHash();
    return src.toString();
}

const frame = document.getElementById('atlas');

frame.addEventListener('load', () => {
    document.getElementById('placeholder')?.remove();
    // Tell the atlas where it is embedded, so the links it offers visitors
    // point back at this page.
    frame.contentWindow.postMessage({ type: 'amche:embed', href: location.href }, atlasOrigin);
});

// Mirror the map's own URL onto this page, so the address bar always
// describes what the visitor is looking at. `atlas` is dropped: it is this
// page's own default (buildSrc puts it back), so showing it would only
// expose plumbing and let a shared link pin a stale config.
window.addEventListener('message', (event) => {
    if (event.origin !== atlasOrigin) return;
    if (event.data?.type !== 'url' || typeof event.data.href !== 'string') return;

    const mapUrl = new URL(event.data.href);
    // Dropped by hand rather than through searchParams.delete(), which would
    // re-serialize the rest and percent-encode the commas in `layers` and
    // `lang` that the atlas deliberately leaves readable.
    const params = mapUrl.search.slice(1).split('&').filter(p => p && !p.startsWith('atlas='));
    const search = params.length ? '?' + params.join('&') : '';
    history.replaceState(null, '', location.pathname + search + mapUrl.hash);
    setView(mapUrl.hash);
});

frame.src = buildSrc();

/* ------------------------------------------------------- live map position */

// #zoom/lat/lng[/bearing/pitch] - the hash Mapbox GL JS writes.
function parseHash(hash) {
    const [zoom, lat, lng] = (hash || '').replace(/^#/, '').split('/');
    return (zoom && lat && lng) ? { zoom, lat, lng } : null;
}

const templatedLinks = [];
let view = parseHash(location.hash) || parseHash(defaultHash()) || { zoom: 4, lat: 0, lng: 0 };

function setView(hash) {
    view = parseHash(hash) || view;
    for (const [anchor, template] of templatedLinks) anchor.href = fillView(template);
}

function fillView(href) {
    return href
        .replace('{zoom}', view.zoom)
        .replace('{lat}', view.lat)
        .replace('{lng}', view.lng);
}

/* ----------------------------------------------------------------- drawing */

function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (value === undefined || value === null) continue;
        if (key === 'html') node.innerHTML = value;
        else if (key === 'text') node.textContent = value;
        else node.setAttribute(key, value);
    }
    for (const child of [].concat(children)) if (child) node.append(child);
    return node;
}

function link(item, className) {
    const anchor = el('a', { class: className, href: fillView(item.href) }, [
        el('span', { class: 'site-label', text: item.label }),
        item.note ? el('span', { class: 'site-note', text: item.note }) : null
    ]);
    if (/^https?:/i.test(item.href) && new URL(item.href).origin !== location.origin) {
        anchor.target = '_blank';
        anchor.rel = 'noopener';
    }
    if (item.href.includes('{')) templatedLinks.push([anchor, item.href]);
    anchor.addEventListener('click', closePanel);
    return anchor;
}

function brandMark(className) {
    return el('a', { class: className, href: brand.href || './' }, [
        brand.name ? el('span', { class: 'site-name', text: brand.name }) : null,
        brand.logo ? el('img', { src: brand.logo, alt: brand.name || '' }) : null
    ]);
}

const burger = el('button', {
    class: 'site-burger',
    type: 'button',
    'aria-label': 'Open menu',
    'aria-expanded': 'false',
    'aria-controls': 'site-panel',
    html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/>' +
        '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
});

const bar = el('div', { class: 'site-bar' }, [
    el('nav', { class: 'site-bar-links' }, (site.bar || []).map(item => link(item, 'site-bar-link'))),
    brandMark('site-brand'),
    burger
]);

const closeButton = el('button', {
    class: 'site-close', type: 'button', 'aria-label': 'Close menu', text: '×'
});

const panel = el('aside', { class: 'site-panel', id: 'site-panel', hidden: '', 'aria-label': 'Site menu' }, [
    el('header', { class: 'site-panel-head' }, [brandMark('site-panel-brand'), closeButton]),
    el('div', { class: 'site-panel-body' }, [
        brand.tagline ? el('p', { class: 'site-tagline', text: brand.tagline }) : null,
        (site.actions || []).length
            ? el('div', { class: 'site-actions' }, site.actions.map(item => link(item, 'site-action')))
            : null,
        ...(site.menu || []).map(section => el('section', { class: 'site-section' }, [
            el('h2', { text: section.title }),
            el('ul', {}, (section.items || []).map(item => el('li', {}, link(item, 'site-item'))))
        ])),
        site.about ? el('div', { class: 'site-about', html: site.about }) : null,
        el('footer', { class: 'site-foot' }, [
            (site.footer || []).length
                ? el('nav', { class: 'site-foot-links' }, site.footer.map(item => link(item, 'site-foot-link')))
                : null,
            config.description ? el('p', { class: 'site-credit', html: config.description }) : null
        ])
    ])
]);

const backdrop = el('div', { class: 'site-backdrop', hidden: '' });

/* ------------------------------------------------------------------ panel */

function openPanel() {
    panel.hidden = false;
    backdrop.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    closeButton.focus();
}

function closePanel() {
    panel.hidden = true;
    backdrop.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
}

burger.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
closeButton.addEventListener('click', closePanel);
backdrop.addEventListener('click', closePanel);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePanel(); });

if (config.color) document.documentElement.style.setProperty('--site-accent', config.color);
if (brand.name) document.title = brand.name;
if (brand.logo) document.head.append(el('link', { rel: 'icon', href: brand.logo }));

document.body.append(backdrop, panel, bar);
