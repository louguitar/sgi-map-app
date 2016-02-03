function initMap() {

  // base google maps api options
  var opts = {
    streetViewControl: false,
    tilt: 0,
    center: new google.maps.LatLng(42, -113),
    zoom: 6,
    minZoom: 4,
    maxZoom: 18
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

  // fill with conifer data information
  dataTiles['coniferTiles'] = {
    // function that returns url of tile location
    function: function(x,y,z) {
            return "http://tiles.allredsgi.org/conifer/{z}/{x}/{y}.png".replace('{z}',z).replace('{x}',x).replace('{y}',y); },
    // map bounds of data
    mapBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(36.889596, -121.724515),
      new google.maps.LatLng(46.887497, -105.554831)),
    // min and max zoom of data
    mapMinZoom: 4,
    mapMaxZoom: 17
  };



  // uncheck data download boxes
  $(".dataDownload").prop('checked', false);

  // uncheck reference layer boxes
  $(".refLayers").prop('checked', false);



  // define landing layers, layers that will be loaded upon landing
  var landing = 'conifer';
  var landingTiles = landing + 'Tiles';

  // load landing layer first
  // if checkbox is checked, load data
  if (document.getElementsByName(landingTiles)[0].checked) {
    // add data overlay; use klokantech script
    var overlay = new klokantech.MapTilerMapType(map,
      dataTiles[landingTiles].function,
      dataTiles[landingTiles].mapBounds,
      dataTiles[landingTiles].mapMinZoom,
      dataTiles[landingTiles].mapMaxZoom);

    // add opacity control
    // var opacitycontrol = new klokantech.OpacityControl(map, overlay);
  }
  // if checkbox is not checked, clear all overlays and data
  else {
    // clear overlay
    map.overlayMapTypes.clear();
  };



  // listen for clicks on dataTiles layer
  $('.dataTiles').click(function () {

    // get checkbox name
    var checkBoxName = $(this).attr('name');
    // parse checkbox name to data download name
    var checkBoxDownload = checkBoxName.split("Tiles")[0] + "Download";

    // if checkbox is checked, load data
    if ($(this).prop('checked')){

      // add data overlay; use klokantech script
      var overlay = new klokantech.MapTilerMapType(map,
        dataTiles[checkBoxName].function,
        dataTiles[checkBoxName].mapBounds,
        dataTiles[checkBoxName].mapMinZoom,
        dataTiles[checkBoxName].mapMaxZoom);

      // add opacity control
      // var opacitycontrol = new klokantech.OpacityControl(map, overlay);
    }
    // if checkbox is not checked, clear all overlays and data
    else {
      // clear overlay
      map.overlayMapTypes.clear();

      // uncheck data box
      document.getElementsByName(checkBoxDownload)[0].checked = false;

      // if downloadLayers is not undefined, iterate over each feature and
      // remove
      if (typeof downloadLayers[checkBoxDownload] != 'undefined') {
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
  }



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
        // check box
        document.getElementsByName(checkBoxTiles)[0].checked = true;

        // load tiles
        // add data overlay; use klokantech script
        var overlay = new klokantech.MapTilerMapType(map,
          dataTiles[checkBoxTiles].function,
          dataTiles[checkBoxTiles].mapBounds,
          dataTiles[checkBoxTiles].mapMinZoom,
          dataTiles[checkBoxTiles].mapMaxZoom);

        // add opacity control
        // var opacitycontrol = new klokantech.OpacityControl(map, overlay);
      }

      // initialize refLayers object to hold data
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
  }

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
  }



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
   };
  });

};
