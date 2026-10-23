/**
 * Frame wiring for a page that embeds an Amche Atlas.
 *
 * Boilerplate - a community adopting this copies it unchanged and edits
 * config/index.atlas.json instead. This page reads two keys of that config's
 * `site` block:
 *
 *   site.instance   the Amche instance to embed
 *   site.params     URL-API parameters with no atlas-config equivalent
 *                   (renderer, terrain, lang - see docs/API.md)
 *
 * Everything else in `site` is read by the atlas itself, which draws it in
 * its own chrome (see js/site-brand.js):
 *
 *   site.brand      logo, name and tagline - on the splash card, the main
 *                   menu's header and the menu button above the console
 *   site.actions    buttons at the top of the main menu
 *   site.menu       [{ title, items: [{ label, href, note }] }] sections below them
 *   site.footer     small print links after those
 *
 * Any href may contain {zoom}, {lat} and {lng}. They are substituted with
 * wherever the map is currently pointed, so "Edit the map" opens the OSM
 * editor on the view the visitor is actually looking at.
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

// #zoom/lat/lng[/bearing/pitch] - the hash Mapbox GL JS writes.
function parseHash(hash) {
    const [zoom, lat, lng] = (hash || '').replace(/^#/, '').split('/');
    return (zoom && lat && lng) ? { zoom, lat, lng } : null;
}

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
    // A camera hash or `zoomTo` in this page's URL is the visitor's explicit
    // choice of where to look; the site's default `geolocate` would otherwise
    // hand the camera to GPS - prompting for location and holding the map's
    // startup until it answers - only to fly away from that choice.
    const pageParams = new URLSearchParams(location.search);
    const hasCamera = !!parseHash(location.hash) || pageParams.has('zoomTo');
    for (const [key, value] of Object.entries(site.params || {})) {
        if (key === 'geolocate' && hasCamera) continue;
        src.searchParams.set(key, value);
    }
    for (const [key, value] of pageParams) src.searchParams.set(key, value);
    src.hash = location.hash || defaultHash();
    return src.toString();
}

const frame = document.getElementById('atlas');

// Tell the atlas where it is embedded, so the links it offers visitors point
// back at this page, and so its splash card leaves this site out of the
// projects it lists.
frame.addEventListener('load', () => {
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
    // `lang` that the atlas deliberately leaves readable. Also drops any
    // site.params key still at its configured default value - buildSrc()
    // always passes those into the frame so it can read them (e.g.
    // window.amche.RENDERER parses `?renderer=` off the frame's own URL),
    // but echoing them back here would make the address bar show
    // `?renderer=maplibre` forever even though that's just this site's
    // default, not a visitor override.
    const params = mapUrl.search.slice(1).split('&').filter(p => {
        if (!p || p.startsWith('atlas=')) return false;
        const eq = p.indexOf('=');
        const key = decodeURIComponent(eq === -1 ? p : p.slice(0, eq));
        if (!(key in (site.params || {}))) return true;
        const value = eq === -1 ? '' : decodeURIComponent(p.slice(eq + 1));
        return value !== String(site.params[key]);
    });
    const search = params.length ? '?' + params.join('&') : '';
    history.replaceState(null, '', location.pathname + search + mapUrl.hash);
});

frame.src = buildSrc();

if (brand.name) document.title = brand.name;
if (brand.logo) {
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.href = new URL(brand.logo, CONFIG_URL).href;
    document.head.append(icon);
}
