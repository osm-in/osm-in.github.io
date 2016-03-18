// Mapbox GL JS functions for layer collections
// The collection must be defined as a mapLayerCollection

var defaultStyle = {};
var defaultOpacity = {};
var defaultFilter = {};

// Highlight a layer collection
function mapHighlight(item) {

  var collectionName = $(item).data('map-layer');
  var color = $(item).data('map-layer-highlight');

  // Loop through collection and store defaults before changing them
  for (var i = 0; i < mapLayerCollection[collectionName].length; i++) {

    var obj = mapLayerCollection[collectionName][i];

    // Choose an appropriate property to change
    if (map.getLayer(obj).type == 'raster')
      prop = 'raster-opacity';
    if (map.getLayer(obj).type == 'fill')
      prop = 'fill-color';
    if (map.getLayer(obj).type == 'line')
      prop = 'line-color';
    if (map.getLayer(obj).type == 'circle')
      prop = 'circle-color';

    // Backup the value before changing it
    var propObj = {};
    propObj[prop] = map.getPaintProperty(obj, prop);

    defaultStyle[obj] = propObj;
    map.setPaintProperty(obj, prop, color);

  }

};

// Reset style of a collection to default
function mapHighlightReset() {

  for (var collectionName in mapLayerCollection) {
    // Loop through collection and and reset properties to stored defaults
    for (var i = 0; i < mapLayerCollection[collectionName].length; i++) {

      var obj = mapLayerCollection[collectionName][i];
      var prop;

      // Choose an appropriate property to change
      if (map.getLayer(obj).type == 'fill')
        prop = 'fill-color';
      if (map.getLayer(obj).type == 'line')
        prop = 'line-color';
      if (map.getLayer(obj).type == 'circle')
        prop = 'circle-color';

      // Revert to default style if known
      try {
        if (defaultStyle[obj][prop])
          map.setPaintProperty(obj, prop, defaultStyle[obj][prop]);
      } catch (e) {}

    }
  }

};

// Toggle visibility of a layer collection using opacity
function mapToggle(item) {

  var collectionName = $(item).data('map-layer');

  // Loop through collection and toggle visibility
  for (var i = 0; i < mapLayerCollection[collectionName].length; i++) {

    var obj = mapLayerCollection[collectionName][i];
    var prop;

    // Choose an appropriate property to change
    if (map.getLayer(obj).type == 'raster')
      prop = 'raster-opacity';
    if (map.getLayer(obj).type == 'fill')
      prop = 'fill-opacity';
    if (map.getLayer(obj).type == 'line')
      prop = 'line-opacity';
    if (map.getLayer(obj).type == 'circle')
      prop = 'circle-opacity';

    // Apply original opacity if existing is 0, else make a backup and set to 0
    if (!map.getPaintProperty(obj, prop)) {
      try {
        map.setPaintProperty(obj, prop, defaultOpacity[obj][prop]);
      } catch (e) {
        // The original must have been 0
      }
    } else {
      var propObj = {};
      propObj[prop] = map.getPaintProperty(obj, prop);

      defaultOpacity[obj] = propObj;
      map.setPaintProperty(obj, prop, 0);
    }
  }

};

// Change the layout propert for a layer collection
function setGroupLayoutProperty(group, property, value) {

  // Loop through collection and toggle visibility
  for (var i = 0; i < mapLayerCollection[group].length; i++) {

    var layer = mapLayerCollection[group][i];

    try{
      map.setLayoutProperty(layer, property, value);
    }
    catch(e) {
      console.log("Cannot find layer "+layer);
    }

  }

};

// Change the filter values of set of layers
function mapFilter(item){
  var layer = $(item).data('map-layer');
  var filter = $(item).data('map-layer-filter');
  map.setFilter(layer, filter);
}
