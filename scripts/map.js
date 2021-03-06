// define map
var map;

// object to hold image map type information
var imageMapType = {};

// object to hold tile information
var dataTiles = {};

// define object for holding refLayers
var refLayers = {};

// define object for holding refLayers styles
var refLayersStyles = {};

// declare eeOverlays; used for earth engine overlays;
var eeOverlays = {};

// define global maxZoom; maxZoom when no layer is displayed
var globalMaxZoom = 20;



function initMap() {

  // base google maps api options
  var opts = {
    streetViewControl: false,
    scaleControl: true,
    tilt: 0,
    center: new google.maps.LatLng(42, -110),
    zoom: 6,
    minZoom: 4,
    maxZoom: globalMaxZoom,
    zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
    }
  };

  // initialize map
   map = new google.maps.Map(document.getElementById('map'), opts);

  // set ROADMAP styles
  map.set('styles', [
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#fffefe" }
    ]
  },{
    "featureType": "poi.park",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative",
    "elementType": "geometry.fill",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi",
    "elementType": "geometry.fill",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#46bcec" }
    ]
  },{
    "featureType": "road.highway",
    "stylers": [
      { "visibility": "simplified" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "saturation": -25 }
    ]
  }
  ]);

  // set ROADMAP as the default basemap
  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);

  // set globalMapBounds; largest extent of available data
  var globalMapBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(36.889596, -121.724515),
    new google.maps.LatLng(46.887497, -105.554831));

  // populate dataTiles
  populateDataTiles();
  // populate imageMapType
  populateImageMapType();
  // populate refLayersStyles
  populateRefLayersStyles();

  // uncheck reference layer boxes
  $(".refLayers").prop('checked', false);

  // uncheck fenceCollision boxes
  $('.fenceCollision').prop('checked', false);


  // which checkbox is checked upon landing
  var checkedBoxLanding = $('input:checkbox:checked').map(function() {
    return this.name;
  }).get();

  // if at least one dataTiles checkbox is checked, load it
  if (checkedBoxLanding.length != 0) {

    // set maxZoom
    map.setOptions({maxZoom: dataTiles[checkedBoxLanding].mapMaxZoom});

    // push imageMapType
    map.overlayMapTypes.push(imageMapType[checkedBoxLanding]);
  }

  // listen for clicks on dataTiles layer
  $('.dataTiles').click(dataTilesClick);
  // listen for clicks on refLayers
  $('.refLayers').click(refLayersClick);
  // listen for clicks on fenceCollision
  $('.fenceCollision').click(fenceCollisionClick);
  // listen for clicks on calculateButton
  $('.calculateButton').click(calculateFenceLayer);
  // listen for clicks on resetButton
  $('.resetButton').click(resetFenceLayer);
  // listen for clicks on downloadButton
  $('.downloadButton').click(downloadFenceLayer);
};



// function to change opacity of ImageMapType
function changeOpacity(o, dataTilesName) {
      imageMapType[dataTilesName].setOpacity(parseFloat(o));
}

// function to change opacity of eeOverlays
function changeOpacityEEOverlays(o, dataTilesName) {
      eeOverlays[dataTilesName].setOpacity(parseFloat(o));
}


// function to change map tiles when clicked/toggled
function dataTilesClick() {

  // clear overlay
  map.overlayMapTypes.clear();

  // uncheck other dataTiles boxes
  $('.dataTiles').not(this).prop('checked', false);

  // uncheck fenceCollision boxes
  $('.fenceCollision').prop('checked', false);

  // hide fence collision buttons and inputs
  fenceCollisionButtons(calculate='add', reset='add', download='add');
  fenceCollisionInputs(shapefile='add', emailAddress='add');



  // get checkbox name
  var checkBoxName = $(this).attr('name');
  // parse checkbox name to data download name
  var checkBoxDownload = checkBoxName.split("Tiles")[0] + "Download";

  // if checkbox is checked, load data
  if ($(this).prop('checked')){

    // set maxZoom
    map.setOptions({maxZoom: dataTiles[checkBoxName].mapMaxZoom});

    // push imageMapType
    map.overlayMapTypes.push(imageMapType[checkBoxName]);
  }

  // if checkbox is unchecked, clear all overlays and data
  else {

    // clear overlay
    map.overlayMapTypes.clear();

    // set maxZoom to globalMaxZoom
    map.setOptions({maxZoom: globalMaxZoom});

  }
}



// function to change data download layers when clicked
function dataDownloadClick() {

  // get checkbox name
  var checkBoxName = $(this).attr('name');
  // parse checkbox name to tiles names
  var checkBoxTiles = checkBoxName.split("Download")[0] + "Tiles";

  // if checkbox is checked, load data and tiles
  if ($(this).prop('checked')){

    // load tile layer
    if (document.getElementsByName(checkBoxTiles)[0].checked) {
      // do nothing
    }
    else {
      // uncheck other dataTiles boxes
      $('.dataTiles').not(this).prop('checked', false);

      // uncheck fenceCollision boxes
      $('.fenceCollision').prop('checked', false);

      // hide fence collision buttons and inputs
      fenceCollisionButtons(calculate='add', reset='add', download='add');
      fenceCollisionInputs(shapefile='add', emailAddress='add');

      // clear overlay
      map.overlayMapTypes.clear();

      // check box
      document.getElementsByName(checkBoxTiles)[0].checked = true;

      // set maxZoom
      map.setOptions({maxZoom: dataTiles[checkBoxTiles].mapMaxZoom});

      // push imageMapType
      map.overlayMapTypes.push(imageMapType[checkBoxTiles]);
    }

  }
}



// function to change refLayers when clicked
function refLayersClick() {
  // get checkbox name
  var checkBoxName = $(this).attr('name');

  // if checkbox is checked, load data and tiles
  if ($(this).prop('checked')){

    // initialize refLayers object to hold data
    refLayers[checkBoxName] = new google.maps.Data();

    // load topojson; use clientside topojson api to convert to geojson
    $.getJSON('data/' + checkBoxName + 'Topo.json', function(data){
          geoJsonObject = topojson.feature(data, eval("data.objects." +
            checkBoxName))
          refLayers[checkBoxName].addGeoJson(geoJsonObject);
        });

    // set style
    refLayers[checkBoxName].setStyle(refLayersStyles[checkBoxName]);

    // set layer to map
    refLayers[checkBoxName].setMap(map);
  }
  // if checkbox is not checked, clear data
  else {
    // iterate over each feature and remove
    refLayers[checkBoxName].forEach(function(feature) {
      refLayers[checkBoxName].remove(feature);
    });
 }
}



// populate dataTiles info
function populateDataTiles() {

  // conifer data information
  dataTiles['coniferTiles'] = {

    // map bounds of data
    mapBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(37.080811971218324, -121.48486346426932),
      new google.maps.LatLng(46.66783578261317,  -105.5363872355259)),

    // min and max zoom of data
    mapMinZoom: 4,
    mapMaxZoom: 17,

    // opacity
    opacity: parseFloat(document.getElementById('opacitySliderConifer').value),

    // url of tiles
    url: "https://storage.googleapis.com/sgi-tiles-conifer/conifer/"
  };

  // rrClass information
  dataTiles['rrClassTiles'] = {

    // map bounds of data
    mapBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(33.92018755581908, -127.9936902490509),
      new google.maps.LatLng(51.43280397622856, -101.56942709957356)),

    // min and max zoom of data
    mapMinZoom: 4,
    mapMaxZoom: 14,

    // opacity
    opacity: parseFloat(document.getElementById('opacitySliderRRClass').value),

    // url of tiles
    url: "https://storage.googleapis.com/sgi-tiles-rr/rr/"
  };

  // cultivation risk information
  dataTiles['cultivationRiskTiles'] = {

    // map bounds of data
    mapBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(36.445781903810214, -116.28572909212242),
      new google.maps.LatLng(50.00996879293587, -96.43150811991941)),

    // min and max zoom of data
    mapMinZoom: 4,
    mapMaxZoom: 13,

    // opacity
    opacity: parseFloat(document.getElementById('opacitySliderCultivationRisk').value),

    // url of tiles
    url: "https://storage.googleapis.com/sgi-tiles-cultivation/cultivation/"
  };
}



// populate imageMapType information
function populateImageMapType() {

  // coniferTiles
  imageMapType['coniferTiles'] = new google.maps.ImageMapType({
   getTileUrl: function(coord, zoom) {
     var proj = map.getProjection();
     var z2 = Math.pow(2, zoom);
     var tileXSize = 256 / z2;
     var tileYSize = 256 / z2;
     var tileBounds = new google.maps.LatLngBounds(
       proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
       proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
     );
     if (!dataTiles['coniferTiles'].mapBounds.intersects(tileBounds) || zoom < dataTiles['coniferTiles'].mapMinZoom || zoom > dataTiles['coniferTiles'].mapMaxZoom) return null;
     return dataTiles['coniferTiles'].url + "{z}/{x}/{y}.png".replace('{z}',zoom).replace('{x}',coord.x).replace('{y}',coord.y);
   },
   tileSize: new google.maps.Size(256, 256),
   minZoom: dataTiles['coniferTiles'].mapMinZoom,
   maxZoom: dataTiles['coniferTiles'].mapMaxZoom,
   opacity: dataTiles['coniferTiles'].opacity
  });

  // rrClassTiles
  imageMapType['rrClassTiles'] = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      var proj = map.getProjection();
      var z2 = Math.pow(2, zoom);
      var tileXSize = 256 / z2;
      var tileYSize = 256 / z2;
      var tileBounds = new google.maps.LatLngBounds(
        proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
        proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
      );
      if (!dataTiles['rrClassTiles'].mapBounds.intersects(tileBounds) || zoom < dataTiles['rrClassTiles'].mapMinZoom || zoom > dataTiles['rrClassTiles'].mapMaxZoom) return null;
      return dataTiles['rrClassTiles'].url + "{z}/{x}/{y}.png".replace('{z}',zoom).replace('{x}',coord.x).replace('{y}',coord.y);
    },
    tileSize: new google.maps.Size(256, 256),
    minZoom: dataTiles['rrClassTiles'].mapMinZoom,
    maxZoom: dataTiles['rrClassTiles'].mapMaxZoom,
    opacity: dataTiles['rrClassTiles'].opacity
  });

  // cultivationRiskTiles
  imageMapType['cultivationRiskTiles'] = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      var proj = map.getProjection();
      var z2 = Math.pow(2, zoom);
      var tileXSize = 256 / z2;
      var tileYSize = 256 / z2;
      var tileBounds = new google.maps.LatLngBounds(
        proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
        proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
      );
      if (!dataTiles['cultivationRiskTiles'].mapBounds.intersects(tileBounds) || zoom < dataTiles['cultivationRiskTiles'].mapMinZoom || zoom > dataTiles['cultivationRiskTiles'].mapMaxZoom) return null;
      return dataTiles['cultivationRiskTiles'].url + "{z}/{x}/{y}.png".replace('{z}',zoom).replace('{x}',coord.x).replace('{y}',coord.y);
    },
    tileSize: new google.maps.Size(256, 256),
    minZoom: dataTiles['cultivationRiskTiles'].mapMinZoom,
    maxZoom: dataTiles['cultivationRiskTiles'].mapMaxZoom,
    opacity: dataTiles['cultivationRiskTiles'].opacity
  });
}






// populate refLayersStyles
function populateRefLayersStyles() {
  // mgmtZonesRefLayer
  refLayersStyles['mgmtZonesRefLayer'] = {
    fillColor: '#d95f02',
    fillOpacity: 0,
    strokeColor: '#d95f02',
    strokeWeight: 2
  };

  // pacRefLayer
  refLayersStyles['pacRefLayer'] = {
    fillColor: '#7570b3',
    fillOpacity: 0,
    strokeColor: '#7570b3',
    strokeWeight: 2
  };
}
