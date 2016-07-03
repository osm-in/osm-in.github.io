---
layout: map
map: gl
title: OpenStreetMap India - WebGL Demo
permalink: /demo/
---

<style>
    #languages {
        position: fixed;
        list-style-type: none;
        left: 0px;
        bottom: 0px;
        cursor: pointer;
    }

    #languages li {
        color: #fff;
        margin: 3px;
        float: left;
        background-color: green;
        padding: 7px;
        cursor: pointer;
        font-size: 14px;
        opacity: 0.5;
    }

    #languages li:hover {
      color: white;
      background-color: black;
      opacity: 1;
    }

    #languages li.activeLanguage {
        background-color: black;
        color: white;
        opacity: 1;
    }

    #languages em {
        font-weight: bold;
        color: #fff;
        float: left;
        margin-right: 5px;
        display: block;
    }

    #toggle {
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: rgba(255, 255, 255, 0.7);
        padding: 5px;
    }
    #toggle span {
        margin-left: 5px;
    }
</style>

<section class="map-container {{page.map}}">

  <div id='map'></div>
  <ul id='languages'></ul>

</section>


<script>
mapboxgl.accessToken = 'pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/planemad/cilnsr08d004ic4kn5wc4sikn', //stylesheet location
    center: [81, 23.1], // starting position
    zoom: 3.9, // starting zoom
    hash: true
});

// Define a layer collection for easy styling
var mapLayerCollection = {
    'mbx-place-label': ['country-label-xl', 'country-label-lg', 'country-label-md', 'country-label-sm'],
    'osm-place-label': ['osm-country-label', 'osm-state-label', 'osm-city-label', 'osm-city-capital-label', 'osm-city-capital-label left', 'osm-city-capital-label right', 'osm-town-label', 'osm-suburb-label']
};

var languages = {
    en: 'English',
    ml: 'Malayalam',
    kn: 'Kannada',
    te: 'Telugu',
    ta: 'Tamil',
    hi: 'Hindi',
    bn: 'Bengali'
};

function addButton(lang, label, langValue, c) {
    var elem = document.createElement('li');
    if (c) elem.className = c;
    var em = document.createElement('em');
    em.innerText = lang;
    elem.appendChild(em);
    elem.appendChild(document.createTextNode(label));
    elem.addEventListener('click', setLanguage.bind(elem, langValue), false);
    document.getElementById('languages').appendChild(elem);
}

addButton('xx', 'Default', null, 'activeLanguage');
Object.keys(languages).forEach(function(lang) {
    addButton(lang, languages[lang], lang);
});


// Switch the language field for the target layer
function setLanguage(language) {
    if (language === null)
        language = 'name';
    else
        language = 'name_' + language;

    setGroupLayoutProperty('osm-place-label', 'text-field', '{' + language + '}');

    // Highlight active language
    var activeElems = document.getElementsByClassName('activeLanguage');
    for(var i = 0; i < activeElems.length; i++)
        activeElems[i].className = '';
    this.className = 'activeLanguage';
}

</script>
