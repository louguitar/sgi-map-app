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
      "featureType": "landscape.natural.landcover",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "landscape.natural.terrain",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "poi.park",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#B3E2FF" }
      ]
    },{
      "featureType": "landscape.natural",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#fffefe" }
      ]
    },{
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
            return "http://conifertiles.allredbw.com/conifer/{z}/{x}/{y}.png".replace('{z}',z).replace('{x}',x).replace('{y}',y); },
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

      // iterate over each feature and remove
      map.data.forEach(function(feature) {
      map.data.remove(feature);
     });
    }
  });



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

      // load topojson; use clientside topojson api to convert to geojson
      $.getJSON('data/' + checkBoxName + 'Topo.json', function(data){
            geoJsonObject = topojson.feature(data, data.objects.counties)
            map.data.addGeoJson(geoJsonObject);
          });

      // set style
      map.data.setStyle( {
          fillColor: 'red',
          strokeColor: 'red',
          strokeWeight: 2
        })

      // open download when user clicks on county
      map.data.addListener('click', function(event) {
        window.open(event.feature.getProperty('s3Link'),"_self")
      });

      // bold when user hovers
      map.data.addListener('mouseover', function(event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {strokeWeight: 8});
      });

      map.data.addListener('mouseout', function(event) {
        map.data.revertStyle();
      });
    }
    // if checkbox is not checked, clear data
    else {
      // iterate over each feature and remove
      map.data.forEach(function(feature) {
      map.data.remove(feature);
     });
    }
  });

}
