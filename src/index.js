'use strict'

import StylesControl from 'mapbox-gl-controls/lib/styles';
import InspectControl from 'mapbox-gl-controls/lib/inspect';

mapboxgl.accessToken =
'pk.eyJ1Ijoib3NtLWluIiwiYSI6ImNqcnVxMTNrNTJwbHc0M250anUyOW81MjgifQ.cZnvZEyWT5AzNeO3ajg5tg';

var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/planemad/ckf4xcet7231819mm2e8njlca',
center: [82, 22], // Centre position of India
zoom: 5,
hash: true
});

map.addControl(
    new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
    })
    );

// with custom styles:
map.addControl(new StylesControl({
  styles: [
    {
      label: 'Streets India',
      styleName: 'Mapbox Streets',
      styleUrl: 'mapbox://styles/planemad/ckf4xcet7231819mm2e8njlca',
    }, {
      label: 'Satellite',
      styleName: 'Satellite',
      styleUrl: 'mapbox://styles/mapbox/satellite-streets-v10',
    },
  ],
  onChange: (style) => filterBoundaries(),
}), 'top-right');

map.addControl(new InspectControl(), 'bottom-right');


// Resize map to fit all of India within the screen
map.fitBounds([
[67, 7],
[97, 37]
]);

map.on('load', function () {
    // Show country boundaries as per Government of India
    filterBoundaries();
});

function filterBoundaries() {
// Apply an Indian worldview filter to the boundary map layers
// https://docs.mapbox.com/mapbox-gl-js/example/toggle-worldviews/
['admin-0-boundary-bg', 'admin-0-boundary', 'admin-0-boundary-disputed', 'admin-1-boundary'].forEach(
  layer => {
    let layerFilter = map.getFilter(layer);
    layerFilter[layerFilter.length - 1] = ['match', ['get', 'worldview'],
      ['all', 'IN'], true, false
    ]
    map.setFilter(layer, layerFilter)
  })
}