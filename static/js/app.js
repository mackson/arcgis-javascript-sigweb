/**
 * Development: Mackson Araujo
 * Arcgis SigWeb
 */
require([
    "esri/WebMap",
    "esri/widgets/Search",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/widgets/LayerList",
    "esri/widgets/Home",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/ScaleBar",
    "esri/widgets/Fullscreen",
    "esri/widgets/Print",
    "esri/widgets/Measurement",
    "esri/widgets/CoordinateConversion",
    "esri/core/watchUtils",
    "esri/Graphic"
    ], function (WebMap, Search, MapView, SceneView, LayerList, Home, BasemapGallery, Legend, Expand, ScaleBar, Fullscreen, Print, Measurement, CoordinateConversion, watchUtils, Graphic) {

    const switchButton = document.getElementById("sigweb__switch-btn");
    const distanceButton = document.getElementById("sigweb__distance");
    const areaButton = document.getElementById("sigweb__area");
    const clearButton = document.getElementById("sigweb__clear");

    var viewDiv = document.getElementById("sigweb__viewDiv");
    var streetViewWindow = document.getElementById("streetViewWindow");
    var startWidget = document.getElementById("startWidget");
    var enableEndpointView = false;
    var existsPoint = false;
    var pointGraphic;
    var streetMapGooglePopup;

    const webmap = new WebMap({
        portalItem: {
          // autocasts as new PortalItem()
          id: "ea59225e90e34924a4e593269de347af"
        }
      });
            

    //Init 2D Map
    switchView(null);
    
    // switch the view between 2D and 3D each time the button is clicked
    switchButton.addEventListener("click", function () {
        switchView(this.value);
    });

    // Switches the view from 2D to 3D and vice versa
    function switchView(val) {

        if (val === "3D") {
            var webmap3d = new SceneView({
                zoom: 12,
                map: webmap,
                container: "sigweb__viewDiv",
                starsEnabled: false,
                atmosphereEnabled: false,
                popup: {
                    defaultPopupTemplateEnabled: true,
                    dockEnabled: false,
                    dockOptions: {
                        buttonEnabled: false,
                        breakpoint: false
                    }
                },
                navigation: {
                    momentumEnabled: false
                },
            });

            switchButton.value = "2D";

            LoadingView(webmap3d)
        } else {

            var webmap2d = new MapView({
                zoom: 12,
                map: webmap,
                container: "sigweb__viewDiv",
                popup: {
                    defaultPopupTemplateEnabled: true,
                    dockEnabled: false,
                    dockOptions: {
                        buttonEnabled: false,
                        breakpoint: false
                    }
                },
                navigation: {
                    momentumEnabled: false
                },
            });

            switchButton.value = "3D";

            LoadingView(webmap2d)
        }
    }

    //Loading View
    function LoadingView(view) {

        view.when(function () {

            // Display the loading indicator when the view is updating
            watchUtils.whenTrueOnce(view, "updating", function(evt) {
                document.querySelector(".sigweb__centered").style.display = "block";
            });

            // Hide the loading indicator when the view stops updating
            watchUtils.whenFalseOnce(view, "updating", function(evt) {
                document.querySelector(".sigweb__centered").style.display = "none";
            });

            //Display the loading indicator when the view is updating
            watchUtils.whenTrue(view, "updating", function(evt) {
                document.querySelector("#sigweb__loadingMap").style.display = "block";
                view.ui.add("sigweb__loadingMap", "top-left");
            });

            // Hide the loading indicator when the view stops updating
            watchUtils.whenFalse(view, "updating", function(evt) {
                document.querySelector("#sigweb__loadingMap").style.display = "none";
            });

            view.ui.components = [ "zoom", "compass", "navigation-toggle" ];

            //Layers List Widget
            var layerList = new LayerList({
                view: view
            });


            //Search Widget
            var searchWidget = new Search({
                view: view
            });


            // add legend, layerlist and basemapGallery widgets
            view.ui.add(
            [
                new Home({
                    view: view
                }),
                new Expand({
                    content: new Legend({
                    view: view,
                    //style: "card"
                }),
                    view: view,
                    group: "top-right"
                }),
                new Expand({
                    content: layerList,
                    view: view,
                    expanded:true,
                    group: "top-right"
                }),
                new Expand({
                    content: new BasemapGallery({
                        view: view
                    }),
                    view: view,
                    expandIconClass: "esri-icon-basemap",
                    group: "top-right"
                }),
                new Expand({
                    content: new CoordinateConversion({
                        view: view
                    }),
                    view: view,
                    expandIconClass: "esri-icon-map-pin",
                    group: "top-right"
                }),
                new Expand({
                    content: new Print({
                        view: view,
                        printServiceUrl:"https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
                    }),
                    view: view,
                    expandIconClass: "esri-icon-printer",
                    group: "top-right"
                }),
                new Expand({
                    expandIconClass: "esri-icon-maps",
                    view: view,
                    content: streetViewWindow,
                    group: "top-right"
                })

            ],
            "top-right"
            );

            view.ui.add(
                new Fullscreen({
                    view: view,
                }),
                "top-right"
            );

            var scaleBar = new ScaleBar({
                view: view,
                unit: "dual" // The scale bar displays both metric and non-metric units.
            });

            // Add the widget to the bottom left corner of the view
            view.ui.add(scaleBar, {
                position: "bottom-left"
            });

            //Main Logo
            view.ui.add("sigweb__logoDiv", "top-left");
            view.ui.add(searchWidget, {
                position: "top-left"
            });

            view.ui.add("sigweb__buttonChangeView", "top-right");
            view.ui.add("sigweb__logosigwebDiv", "bottom-right");

            // Add the appropriate measurement UI to the bottom-right when activated
            // Create new instance of the Measurement widget
            const measurement = new Measurement();
            view.ui.add("sigweb__distance", "top-right");
            view.ui.add("sigweb__area", "top-right");
            view.ui.add("sigweb__clear", "top-right");
            view.ui.add(measurement, "bottom-right");
            measurement.view = view;


            /*
                Measurements
            */
            distanceButton.addEventListener("click", function () {
                distanceMeasurement();
            });
            areaButton.addEventListener("click", function () {
                areaMeasurement();
            });
            clearButton.addEventListener("click", function () {
                clearMeasurements();
            });

            // Call the appropriate DistanceMeasurement2D or DirectLineMeasurement3D
            function distanceMeasurement() {
                const type = view.type;
                measurement.activeTool = type.toUpperCase() === "2D" ? "distance" : "direct-line";
                distanceButton.classList.add("active");
                areaButton.classList.remove("active");
            }
  
            // Call the appropriate AreaMeasurement2D or AreaMeasurement3D
            function areaMeasurement() {
                measurement.activeTool = "area";
                distanceButton.classList.remove("active");
                areaButton.classList.add("active");
            }
  
            // Clears all measurements
            function clearMeasurements() {
                distanceButton.classList.remove("active");
                areaButton.classList.remove("active");
                measurement.clear();
            }

            /**
             * 
             * Google Street View Widget for Arcgis
             */

              function changerCursor(isCrosshair) {
                viewDiv.style.cursor = isCrosshair ? "crosshair" : "default";
              }
      
              function changerColorButton() {
                startWidget.classList.toggle('green');
              }
      
              function changerLatAndLng(lat, lng) {
                streetMapGooglePopup.location.search = "?lat=" + lat + "&lng=" + lng;
              }
      
              function changerGeometryOfMap(point) {
                pointGraphic.geometry = point;
              }
      
              function createWindowPopup(lat, lng) {
                var option = "toolbar=yes,scrollbars=yes,resizable=yes, type=fullWindow, fullscreen, top=0,left=0,width=500,height=400"
                streetMapGooglePopup = window.open(`./streetview.html?lat=${lat}&lng=${lng}`, "_blank", option);
              }
      
              function getCordanation(event) {
                // Get the coordinates of the click on the view
                var lat = event.mapPoint.latitude;
                var lng = event.mapPoint.longitude;
                return [lat, lng];
              }
      
              function createPoint(lat, lng) {
                var point = {
                  type: "point", // autocasts as new Point()
                  longitude: lng,
                  latitude: lat
                };
      
                var markerSymbol = {
                  type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
                  url: "./static/images/graySVM.png",
                  width: "50px",
                  height: "50px"
                };
      
                // Create a graphic and add the geometry and symbol to it
                pointGraphic = new Graphic({
                  geometry: point,
                  symbol: markerSymbol
                });
      
                return pointGraphic;
              }
      
              function handleClickButton() {
                
                changerColorButton();
                enableEndpointView = !enableEndpointView;
                changerCursor(enableEndpointView);
      
                if (enableEndpointView === false) {
                    
                    if(streetMapGooglePopup){
                        streetMapGooglePopup.close();
                        //document.querySelector('.esri-popup').style.display = 'block'; 
                    }
                    ExistPoint = false;
                    if(pointGraphic){
                        pointGraphic.visible = false;
                    }
                    
                }
              }
      
              function handleWindowMessage(event) {
                var lat = event.data[0];
                var lng = event.data[1];
      
                var point = {
                  type: "point", // autocasts as new Point()
                  longitude: lng,
                  latitude: lat
                };
                pointGraphic.geometry = point;
              }
      
              function handleViewClick(event) {
                
                if (!enableEndpointView) {
                  return;
                }
                var latAndLng = getCordanation(event);
                var lat = latAndLng[0];
                var lng = latAndLng[1];
      
                if (!existsPoint) {
                  pointGraphic = createPoint(lat, lng);
                  view.graphics.add(pointGraphic);
                  createWindowPopup(lat, lng);
                  existsPoint = true;
                  pointGraphic.visible = true;
                  //document.querySelector('.esri-popup').style.display = 'none';
                } else {
                    pointGraphic.visible = true;
                    //document.querySelector('.esri-popup').style.display = 'none';
                  var point = {
                    type: "point", // autocasts as new Point()
                    longitude: lng,
                    latitude: lat
                  };
                  changerGeometryOfMap(point);
      
                  streetMapGooglePopup.closed ?
                    createWindowPopup(lat, lng) :
                    changerLatAndLng(lat, lng);
      
                  streetMapGooglePopup.focus();
                }
              }
      
              startWidget.addEventListener("click", handleClickButton);
              window.addEventListener('message', handleWindowMessage, false);
              view.on("click", handleViewClick);

        }, function(error){
            console.log(error)
        });
    }

});
