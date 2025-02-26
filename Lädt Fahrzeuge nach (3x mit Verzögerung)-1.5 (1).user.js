// ==UserScript==
// @name Lädt Fahrzeuge nach (3x mit Verzögerung)
// @version 1.5
// @author NoOne
// @include *://www.leitstellenspiel.de/missions/*
// @grant none
// ==/UserScript==
/* global $ */

(function() {
    // Funktion zum Nachladen der Fahrzeuge
    function loadVehicles() {
        if ($(".missing_vehicles_load").hasClass("btn-warning")) {
            $(".missing_vehicles_load").html(I18n.t("common.loading"));
            $(".missing_vehicles_load").removeClass("btn-warning");

            $.get($(".missing_vehicles_load").attr("href"), function(data) {
                $(".missing_vehicles_load").hide();
                $("#vehicle_show_table_body_all").append(data);

                $('#tabs a:first').tab('show');
                aaoCheckAvailable();
            });
        }
    }

    // Nachladevorgang 4 Mal mit 1,5 Sekunde Verzögerung ausführen
    for (let i = 0; i < 4; i++) {
        setTimeout(loadVehicles, i * 1000); // 1,5 Sekunde Verzögerung zwischen den Anfragen
    }
})();