function initMap() {

  // define global maxZoom; maxZoom when no layer is displayed
  var globalMaxZoom = 20;

  // base google maps api options
  var opts = {
    streetViewControl: false,
    tilt: 0,
    center: new google.maps.LatLng(42, -112),
    zoom: 6,
    minZoom: 4,
    maxZoom: globalMaxZoom
  };

  // initialize map
  var map = new google.maps.Map(document.getElementById('map'), opts);

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



  // create empty object to hold tile information
  var dataTiles = {};

  // conifer data information
  dataTiles['coniferTiles'] = {

    // map bounds of data
    mapBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(36.889596, -121.724515),
      new google.maps.LatLng(46.887497, -105.554831)),

    // min and max zoom of data
    mapMinZoom: 4,
    mapMaxZoom: 17,

    // url of tiles
    url: "http://tiles.allredsgi.org/conifer/"
  };

  // rrClass information
  dataTiles['rrClassTiles'] = {

    // map bounds of data
    mapBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(36.491475, -123.462836),
      new google.maps.LatLng(48.963203, -109.089701)),

    // min and max zoom of data
    mapMinZoom: 4,
    mapMaxZoom: 13,

    // url of tiles
    url: "http://tiles.allredsgi.org/rrClass/"
  };



  // uncheck data download boxes
  $(".dataDownload").prop('checked', false);

  // uncheck reference layer boxes
  $(".refLayers").prop('checked', false);



  // which checkbox is checked upon landing
  var checkedBoxLanding = $('input:checkbox:checked').map(function() {
    return this.name;
  }).get();

  // if at least one dataTiles checkbox is checked, load it
  if (checkedBoxLanding.length != 0) {
    // create ImageMapType
    var imageMapType = new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        var proj = map.getProjection();
        var z2 = Math.pow(2, zoom);
        var tileXSize = 256 / z2;
        var tileYSize = 256 / z2;
        var tileBounds = new google.maps.LatLngBounds(
          proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
          proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
        );
        if (!dataTiles[checkedBoxLanding].mapBounds.intersects(tileBounds) || zoom < dataTiles[checkedBoxLanding].mapMinZoom || zoom > dataTiles[checkedBoxLanding].mapMaxZoom) return null;
        return dataTiles[checkedBoxLanding].url + "{z}/{x}/{y}.png".replace('{z}',zoom).replace('{x}',coord.x).replace('{y}',coord.y);
      },
      tileSize: new google.maps.Size(256, 256),
      minZoom: dataTiles[checkedBoxLanding].mapMinZoom,
      maxZoom: dataTiles[checkedBoxLanding].mapMaxZoom,
    });

    // set maxZoom
    map.setOptions({maxZoom: dataTiles[checkedBoxLanding].mapMaxZoom});

    // push imageMapType
    map.overlayMapTypes.push(imageMapType);
  }



    // listen for clicks on dataTiles layer
  $('.dataTiles').click(function () {

    // clear overlay
    map.overlayMapTypes.clear();

    // uncheck other dataTiles boxes
    $('.dataTiles').not(this).prop('checked', false);

    // clear downloadLayers
    for (var property in downloadLayers) {
      if (downloadLayers.hasOwnProperty(property)) {
        downloadLayers[property].forEach(function(feature) {
        downloadLayers[property].remove(feature)
      });
      }
    }

    // uncheck data download boxes
    $(".dataDownload").prop('checked', false);

    // get checkbox name
    var checkBoxName = $(this).attr('name');
    // parse checkbox name to data download name
    var checkBoxDownload = checkBoxName.split("Tiles")[0] + "Download";

    // if checkbox is checked, load data
    if ($(this).prop('checked')){

      // create ImageMapType
      var imageMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          var proj = map.getProjection();
          var z2 = Math.pow(2, zoom);
          var tileXSize = 256 / z2;
          var tileYSize = 256 / z2;
          var tileBounds = new google.maps.LatLngBounds(
            proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
            proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
          );
          if (!dataTiles[checkBoxName].mapBounds.intersects(tileBounds) || zoom < dataTiles[checkBoxName].mapMinZoom || zoom > dataTiles[checkBoxName].mapMaxZoom) return null;
          return dataTiles[checkBoxName].url + "{z}/{x}/{y}.png".replace('{z}',zoom).replace('{x}',coord.x).replace('{y}',coord.y);
        },
        tileSize: new google.maps.Size(256, 256),
        minZoom: dataTiles[checkBoxName].mapMinZoom,
        maxZoom: dataTiles[checkBoxName].mapMaxZoom,
      });

      // set maxZoom
      map.setOptions({maxZoom: dataTiles[checkBoxName].mapMaxZoom});

      // push imageMapType
      map.overlayMapTypes.push(imageMapType);
    }

    // if checkbox is unchecked, clear all overlays and data
    else {

      // clear overlay
      map.overlayMapTypes.clear();

      // set maxZoom to globalMaxZoom
      map.setOptions({maxZoom: globalMaxZoom});

      // if downloadLayers is not undefined, iterate over each feature and
      // remove
      if (typeof downloadLayers[checkBoxDownload] != 'undefined') {
        $('.dataDownload').prop('checked', false);
        downloadLayers[checkBoxDownload].forEach(function(feature) {
        downloadLayers[checkBoxDownload].remove(feature);
       });
      }
    }
  });



  // define object for holding downloadLayers
  var downloadLayers = {};

  // define object for holding refLayers styles
  var downloadLayersStyles = {};

  // populate styles
  downloadLayersStyles['coniferDownload'] = {
    fillColor: '#1b9e77',
    strokeColor: '#1b9e77',
    strokeWeight: 2
  };



  // listen for clicks on dataDownload layer
  $('.dataDownload').click(function () {

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

        // clear overlay
        map.overlayMapTypes.clear();

        // check box
        document.getElementsByName(checkBoxTiles)[0].checked = true;

        // create ImageMapType
        var imageMapType = new google.maps.ImageMapType({
          getTileUrl: function(coord, zoom) {
            var proj = map.getProjection();
            var z2 = Math.pow(2, zoom);
            var tileXSize = 256 / z2;
            var tileYSize = 256 / z2;
            var tileBounds = new google.maps.LatLngBounds(
              proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
              proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
            );
            if (!dataTiles[checkBoxTiles].mapBounds.intersects(tileBounds) || zoom < dataTiles[checkBoxTiles].mapMinZoom || zoom > dataTiles[checkBoxTiles].mapMaxZoom) return null;
            return dataTiles[checkBoxTiles].url + "{z}/{x}/{y}.png".replace('{z}',zoom).replace('{x}',coord.x).replace('{y}',coord.y);
          },
          tileSize: new google.maps.Size(256, 256),
          minZoom: dataTiles[checkBoxTiles].mapMinZoom,
          maxZoom: dataTiles[checkBoxTiles].mapMaxZoom,
        });

        // set maxZoom
        map.setOptions({maxZoom: dataTiles[checkBoxTiles].mapMaxZoom});

        // push imageMapType
        map.overlayMapTypes.push(imageMapType);
      }

      // initialize downloadLayers object to hold data
      downloadLayers[checkBoxName] = new google.maps.Data();

      // load topojson; use clientside topojson api to convert to geojson
      $.getJSON('data/' + checkBoxName + 'Topo.json', function(data){
            geoJsonObject = topojson.feature(data, eval("data.objects." +
              checkBoxName))
            downloadLayers[checkBoxName].addGeoJson(geoJsonObject);
          });

      // set style
      downloadLayers[checkBoxName].setStyle( {
        fillColor: downloadLayersStyles[checkBoxName].fillColor,
        strokeColor: downloadLayersStyles[checkBoxName].strokeColor,
        strokeWeight: downloadLayersStyles[checkBoxName].strokeWeight
      });

      // open download when user clicks on county
      downloadLayers[checkBoxName].addListener('click', function(event) {
        window.open(event.feature.getProperty('s3Link'),"_self")
      });

      // bold when user hovers
      downloadLayers[checkBoxName].addListener('mouseover', function(event) {
        downloadLayers[checkBoxName].revertStyle();
        downloadLayers[checkBoxName].overrideStyle(event.feature, {strokeWeight: 8});
      });

      downloadLayers[checkBoxName].addListener('mouseout', function(event) {
        downloadLayers[checkBoxName].revertStyle();
      });

      // set layer to map
      downloadLayers[checkBoxName].setMap(map);
    }
    // if checkbox is not checked, clear data
    else {
      // iterate over each feature and remove
      downloadLayers[checkBoxName].forEach(function(feature) {
      downloadLayers[checkBoxName].remove(feature);
     });
    }
  });



  // define object for holding refLayers
  var refLayers = {};

  // define object for holding refLayers styles
  var refLayersStyles = {};

  // populate styles
  // mgmtZonesRefLayer
  refLayersStyles['mgmtZonesRefLayer'] = {
    fillColor: '#d95f02',
    strokeColor: '#d95f02',
    strokeWeight: 2
  };

  // pacRefLayer
  refLayersStyles['pacRefLayer'] = {
    fillColor: '#7570b3',
    strokeColor: '#7570b3',
    strokeWeight: 2
  };

  // define infoWindow for clicks
  var infoWindowRef = new google.maps.InfoWindow;

  // define object for holding refLayers click listeners
  var refLayersClick = {};

  // populate click listeners
  refLayersClick['mgmtZonesRefLayer'] = function(event) {
    var contentString = 'Management zone ' +
      event.feature.getProperty('zone') + '<br/>' +
      event.feature.getProperty('name');
		infoWindowRef.setContent(contentString);
    infoWindowRef.setPosition(event.latLng);
    infoWindowRef.open(map);
  };



  // listen for clicks on refLayers
  $('.refLayers').click(function () {
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

      // listen for clicks
      refLayers[checkBoxName].addListener('click',
        refLayersClick[checkBoxName]);
    }
    // if checkbox is not checked, clear data
    else {
      // iterate over each feature and remove
      refLayers[checkBoxName].forEach(function(feature) {
        refLayers[checkBoxName].remove(feature);
      });

    // close infoWindows
    infoWindowRef.close();
   }
  });

};
