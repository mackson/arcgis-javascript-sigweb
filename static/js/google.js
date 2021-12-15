/**
 * Development: Mackson Araujo
 * Arcgis SigWeb
 */
function initMap() {
    var panorama;
    var element_msg = document.getElementById('not_panorama');
    //Get the values in URI
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var lat = Number(urlParams.get('lat'));
    var lng = Number(urlParams.get('lng'));

    panorama = new google.maps.StreetViewPanorama(
        document.getElementById("street-view"),
        {
            position: { lat, lng },
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
        }
    );

    var sv = new google.maps.StreetViewService();
    sv.getPanorama({ location: { lat, lng }, radius: 50 }, function (data, status) {
        if (status !== 'OK') {
            element_msg.classList.add('message-error--show');
            document.getElementById("street-view").style.display = "none";
            return;
        }
        element_msg.classList.remove('message-error--show');
        document.getElementById("street-view").style.display = "block";
    });

    panorama.addListener("position_changed", function () {
        var lat = panorama.getPosition().lat();
        var lng = panorama.getPosition().lng();
        window.opener.postMessage([lat, lng], "*");
    });
}