'use strict'

import StylesControl from 'mapbox-gl-controls/lib/styles';
import InspectControl from 'mapbox-gl-controls/lib/inspect';
import bboxPolygon from '@turf/bbox-polygon';

let parseString = require('xml2js').parseString;
let Parser = require('rss-parser');
let parser = new Parser();

var changesetsGeojson = ({
    "type": "FeatureCollection",
    "features": []
})



//
// Create OpenStreetMap Map using Mapbox GL vector tiles 
// https://docs.mapbox.com/vector-tiles/reference/mapbox-streets-v8/
//

mapboxgl.accessToken = 'pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/planemad/ckf4xcet7231819mm2e8njlca',
    center: [82, 22], // Centre position of India
    zoom: 5,
    hash: true
});

//
// Map controls
//

// Style controls
map.addControl(new StylesControl({
    styles: [{
            label: 'Streets',
            styleName: 'Streets India',
            styleUrl: 'mapbox://styles/planemad/ckf4xcet7231819mm2e8njlca',
        },
        {
            label: 'Railways',
            styleName: 'Rail World',
            styleUrl: 'mapbox://styles/planemad/ck7p3wxmp0q571imu99elwqs1',
        }, {
            label: 'Waterways',
            styleName: 'Water Flow',
            styleUrl: 'mapbox://styles/planemad/ckd42fwa20n531iqrewerwla1',
        }, {
            label: 'Satellite',
            styleName: 'Satellite',
            styleUrl: 'mapbox://styles/mapbox/satellite-streets-v10',
        },
    ],
    onChange: (style) => filterBoundaries(),
}), 'top-left');

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

// Add geolocate control to the map.
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }),
    'bottom-right'
);

// Add Mapbox Geocoder
// https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: "IN"
    })
);




// Resize map to fit all of India within the screen
map.fitBounds([
    [67, 7],
    [97, 37]
]);

// Edit the OSM map at the location
document.getElementById('edit-map').onclick = function () {
    window.open(`https://www.openstreetmap.org/edit?editor=id#map=${map.getZoom()}/${map.getCenter().lngLat.lat}/${map.getCenter().lngLat.lng}`)
}

//
//  Map logic
//

map.on('load', function () {

    // Show country boundaries as per Government of India
    filterBoundaries();

    // Add custom layers
    loadMapLayers();

});

//
// Map functions
//

function loadMapLayers() {

    // Map data sources

    map.addSource('changesets', {
        type: "geojson",
        generateId: true,
        data: changesetsGeojson
    });


    // Map layers

    map.addLayer({
        id: 'changesets',
        type: "line",
        source: 'changesets',
        paint: {
            "line-color": "red",
            "line-width": 2
        }
    });

}

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

// Fetch OSM data

(async () => {

    let feed = await parser.parseURL('https://osmcha.org/api/v1/aoi/a4b27b2f-cec7-4291-afa2-38e77c863944/changesets/feed/');
    console.log(feed);

    feed.items.forEach(item => {
        const changesetId = item.link.split('/')[4];

        fetch(`https://api.openstreetmap.org/api/0.6/changeset/${changesetId}?include_discussion=true`).then(response => response.text())
            .then(str => {
                parseString(str, function (err, result) {

                    const changesetMetadata = result.osm.changeset[0].$
                    const poly = bboxPolygon([changesetMetadata.min_lon, changesetMetadata.min_lat, changesetMetadata.max_lon, changesetMetadata.max_lat])

                    poly.properties = result.osm.changeset[0];

                    changesetsGeojson.features.push(poly);
                    map.getSource('changesets').setData(changesetsGeojson);


                });
            })
    });

})();