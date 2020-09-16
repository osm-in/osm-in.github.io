# OpenStreetMap of India

Homepage for the publicly edited street map of India using the [OpenStreetMap project](https://www.openstreetmap.org/#map=5/21.923/79.937).

## Using the map

**with [Mapbox](https://www.mapbox.com/)**

The India data in the [mapbox-streets](https://docs.mapbox.com/vector-tiles/reference/mapbox-streets-v8/#data-sources--updates) vector tiles (except boundaries) is sourced from OpenStreetMap data. It can take [a couple of weeks](https://stackoverflow.com/a/619621160) for an OSM change to reflect in the vector tiles.

You can use map style [`planemad/ckf4xcet7231819mm2e8njlca`](https://api.mapbox.com/styles/v1/planemad/ckf4xcet7231819mm2e8njlca.html?fresh=true&title=copy&access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ) for a ready to use OSM base map of India with the corrected borders.

## Map data

**Live qury**

You can use [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) to make specific data queries to the live map database (`.osm.xml` `.geojson` `.gpx` `.kml` and `.csv` formats). Example: [City locations in North India](http://overpass-turbo.eu/s/Y39).

**Download extracts**

- Map data of India updated daily (`.osm.pbf` and `.shp` format): https://download.geofabrik.de/asia/india.html
- Map data of the world updated daily + minutely (`.osm.pbf` format): https://planet.openstreetmap.org/
- `.osm.pbf` 

Also see [OSM wiki:Planet.osm#Country_and_area_extracts](https://wiki.openstreetmap.org/wiki/Planet.osm#Country_and_area_extracts)