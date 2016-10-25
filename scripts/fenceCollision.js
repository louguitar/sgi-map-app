// objects and functions necessary for fence collision functionality

// object to store lek geojson data; will be sent to the earth engine backend
var leksGeojson = {};

// declare leksData; used for google.maps.Data()
var leksData = {};

// declare downloadSubmitted to track if download has been submitted
var downloadSubmitted = false;


function fenceCollisionClick() {

  // uncheck all dataTiles boxes
  $('.dataTiles').prop('checked', false);

  // remove any download layers
  for (var property in downloadLayers) {
    if (downloadLayers.hasOwnProperty(property)) {
      downloadLayers[property].forEach(function(feature) {
      downloadLayers[property].remove(feature)
      });
    }
  }

  // uncheck all dataDownload boxes
  $('.dataDownload').prop('checked', false);

  if ($(this).prop('checked')) {
    // google maps data layer for lek data
    leksData = map.data;

    // if previous layer exists, push it
    if (!($.isEmptyObject(eeOverlays['fenceCollision']))) {
      // clear overlay
      map.overlayMapTypes.clear();

      // set maxZoom to 13 for most accurate visualization
      map.setOptions({maxZoom: 13});

      // push previous calculated layer
      map.overlayMapTypes.push(eeOverlays['fenceCollision']);

      // show appropriate buttons
      if (downloadSubmitted) {
        fenceCollisionButtons(calculate='add', reset='remove', download='add');
      }
      else {
        fenceCollisionButtons(calculate='add', reset='remove',
          download='remove');
        fenceCollisionInputs(shapefile='add', emailAddress='remove');
      }
    }

    else {
      // clear overlay
      map.overlayMapTypes.clear();

      // set data controls
      leksData.setMap(map);
      leksData.setControls(['Point', 'Polygon']);
      map.data.setDrawingMode('Point');
      leksData.setStyle({
        editable: true,
        draggable: true
      });

      // set maxZoom to 13 for most accurate visualization
      map.setOptions({maxZoom: 13});

      // add feature listener to leksData
      addFeatureListener(leksData);

      fenceCollisionInputs(shapefile='remove', emailAddress='add');
    }
  }

  else {
    // clear overlay
    map.overlayMapTypes.clear();

    // set maxZoom to globalMaxZoom
    map.setOptions({maxZoom: globalMaxZoom});

    // if downloadLayers is not undefined, iterate over each feature and
    // remove
    if ((typeof checkBoxDownload != 'undefined') &&
        (typeof downloadLayers[checkBoxDownload] != 'undefined')) {
      $('.dataDownload').prop('checked', false);
      downloadLayers[checkBoxDownload].forEach(function(feature) {
      downloadLayers[checkBoxDownload].remove(feature);
     });
    }

    // remove features and leks
    leksData.forEach(function(feature) {
      leksData.remove(feature);
    });

    // disable controls and remove markers
    // use setMap(null) is quicker
    leksData.setMap(null);
    leksData.setControls(null);
    leksData.setDrawingMode(null);

    // manipulate buttons and inputs
    fenceCollisionButtons(calculate='add', reset='add', download='add');
    fenceCollisionInputs(shapefile='add', emailAddress='add');

  }
}

// function to add feature listener
function addFeatureListener(dataLayer) {
  // when feature is added, manipulate buttons
  dataLayer.addListener('addfeature', function() {
    fenceCollisionButtons(calculate='remove', reset='remove', download='add');
    fenceCollisionInputs(shapefile='add', emailAddress='add');
  });
}

// function to manipulate fence collision buttons
function fenceCollisionButtons(calculate, reset, download) {
  // defaults to adding hidden class
  if (calculate == 'remove') $('.calculateButton').removeClass('hidden');
  else $('.calculateButton').addClass('hidden');

  if (reset == 'remove') $('.resetButton').removeClass('hidden');
  else $('.resetButton').addClass('hidden');

  if (download == 'remove') $('.downloadButton').removeClass('hidden');
  else $('.downloadButton').addClass('hidden');
}

// function to manipulate fence collision inputs
function fenceCollisionInputs(shapefile, emailAddress) {
  // defaults to adding hidden class
  if (shapefile == 'remove') $('.shapefile').removeClass('hidden');
  else $('.shapefile').addClass('hidden');

  if (emailAddress == 'remove') $('.emailAddress').removeClass('hidden');
  else $('.emailAddress').addClass('hidden');
}

// function to remove feature listeners
function removeFeatureListener(dataLayer) {
  map.clearInstanceListeners(dataLayer);
}

// function to process zipped shapefile
function processFile(files) {

  var reader = new FileReader();
  reader.onload = function(e) {
    shp(e.target.result).then(function(geojson) {
      loadGeoJsonString(geojson);
    });
  };
  reader.onerror = function(e) {
    console.error('reading failed');
  };

  reader.readAsArrayBuffer(files[0]);

  return false;
}

// function to add geojson
function loadGeoJsonString(geojson) {
  leksData.addGeoJson(geojson);
  zoom(map);
}

// function to zoom to added geojson
function zoom(map) {
  var bounds = new google.maps.LatLngBounds();
  leksData.forEach(function(feature) {
    processPoints(feature.getGeometry(), bounds.extend, bounds);
  });
  map.fitBounds(bounds);
}

// function to process each point in geometry
function processPoints(geometry, callback, thisArg) {
  if (geometry instanceof google.maps.LatLng) {
    callback.call(thisArg, geometry);
  } else if (geometry instanceof google.maps.Data.Point) {
    callback.call(thisArg, geometry.get());
  } else {
    geometry.getArray().forEach(function(g) {
      processPoints(g, callback, thisArg);
    });
  }
}

// function to filter a geojson by geometry type
function filterShape(geometryTypeOne, geometryTypeTwo) {
   return function(el) {
      var r = el.geometry;
      return r.type == geometryTypeOne || r.type == geometryTypeTwo;
   }
}

// function to calculate fence collision risk from earth engine backend
// retrieves a mapid and token
function calculateFenceLayer() {

  // copy geojson to leks
  leksData.toGeoJson(function(geoJson) {
    leksGeojson = geoJson;
  });

  // show loading text
  $('.tiles-loading').text(' Loading... ');

  // onError for ajax post
  var onError = (function(error) {
    $('.tiles-loading').text(' Error, try again. ');
  });

  // onDone for ajax post
  var onDone = (function(data) {
    // Create the layer.
    eeOverlays['fenceCollision'] = new ee.MapLayerOverlay('https://earthengine.googleapis.com/map',
      data.mapid, data.token, {});

    // callback for tile load
    eeOverlays['fenceCollision'].addTileCallback(function(event) {
      $('.tiles-loading').text(' Loading... ');
      if (event.count === 0) {
        $('.tiles-loading').empty();
      }
    });

    // clear any layers
    map.overlayMapTypes.clear();

    // push eeOverays['fenceCollision']
    map.overlayMapTypes.push(eeOverlays['fenceCollision']);
  });


  // filter points and lines
  // only do points for now
  var pointsLines = leksGeojson.features.filter(filterShape('MultiPoint',
    'Point'));
  // filter polygons
  var polygons = leksGeojson.features.filter(filterShape('MultiPolygon',
    'Polygon'));

  // object for both polygons and points
  var pointsPolygons = {};
  pointsPolygons.pointsLines = pointsLines;
  pointsPolygons.polygons = polygons;

  // get map id and token
  var newMapId = handleRequest($.post('https://sgi-web-app.appspot.com/fenceImage',
    JSON.stringify(pointsPolygons), 'json'), onDone, onError);


  // disable controls and remove markers
  // use setMap(null) is quicker
  leksData.setMap(null);
  leksData.setControls(null);
  leksData.setDrawingMode(null);

  // manipulate buttons and inputs
  fenceCollisionButtons(calculate='add', reset='remove', download='remove');
  fenceCollisionInputs(shapefile='add', emailAddress='remove');
}

// function to reset layer
function resetFenceLayer() {

  // clear shapefile input
  document.getElementById('shapefile').value = "";

  // clear overlay
  map.overlayMapTypes.clear();

  // clear eeOverlays['fenceCollision']
  eeOverlays['fenceCollision'] = {};

  // remove features and leks
  leksData.forEach(function(feature) {
    leksData.remove(feature);
  });

  leksGeojson = {};

  // manipulate buttons and inputs
  fenceCollisionButtons(calculate='add', reset='add', download='add');
  fenceCollisionInputs(shapefile='remove', emailAddress='add');

  // remove any error text
  $('.tiles-loading').empty();

  // remove any download text
  $('.downloadConfirmed').empty();

  // put controls back
  leksData.setControls(['Point', 'Polygon']);
  map.data.setDrawingMode('Point');
  leksData.setMap(map);
  leksData.setStyle({
    editable: true,
    draggable: true,
    visible: true
  });

  // add listeners
  addFeatureListener(leksData);
}

// function to download layer
function downloadFenceLayer() {

  // onError for ajax post
  var onError = (function(error) {
    $('downloadConfirmed').text('Error in download request, try again.');
  });

  // onDone for ajax post
  var onDone = (function(data) {
    // manipulate buttons and inputs
    fenceCollisionButtons(calculate='add', reset='remove', download='add');
    fenceCollisionInputs(shapefile='add', emailAddress='add');

    // change downloadSubmitted to true
    downloadSubmitted = true;

    // display text of download confirmation
    $('.downloadConfirmed').text('Download request submitted (task: '
      + data.taskId + '). You will be notified via email when it is ready.');
  });

  // filter points and lines
  // only do points for now
  var pointsLines = leksGeojson.features.filter(filterShape('MultiPoint',
    'Point'));
  // filter polygons
  var polygons = leksGeojson.features.filter(filterShape('MultiPolygon',
    'Polygon'));

  // object for both polygons and points
  var pointsPolygons = {};
  pointsPolygons.pointsLines = pointsLines;
  pointsPolygons.polygons = polygons;
  pointsPolygons.email = document.getElementById('emailAddress').value

  // request download
  var requestDownload = handleRequest($.post('https://sgi-web-app.appspot.com/fenceImageExport',
    JSON.stringify(pointsPolygons), 'json'), onDone, onError);
}

function handleRequest(request, onDone, onError) {
  request.done(function(data) {
    if (data && data.error) {
      onError(data.error);
    } else {
      if (onDone) onDone(data);
    }
  }).fail(function(_, textStatus) {
    onError(textStatus);
  });
  return request;
}
