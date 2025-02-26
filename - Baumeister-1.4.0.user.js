// ==UserScript==
// @name        * Baumeister
// @namespace   bos-ernie.leitstellenspiel.de
// @version     1.4.0
// @license     BSD-3-Clause
// @author      BOS-Ernie
// @description Fügt einen Präfix zum Namen neuer Gebäude hinzu, wählt die nächste Integrierte Leitstelle aus und selektiert das Startfahrzeug für Feuerwachen aus. Zudem erstellt es über einen separaten Button eine Rettungswache (Klein) und SEG am aktuellen Standort.
// @match       https://www.leitstellenspiel.de/
// @match       https://polizei.leitstellenspiel.de/
// @icon        https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @run-at      document-idle
// @grant       none
// @downloadURL https://update.greasyfork.org/scripts/483985/%2A%20Baumeister.user.js
// @updateURL https://update.greasyfork.org/scripts/483985/%2A%20Baumeister.meta.js
// ==/UserScript==

/* global building_new_marker, building_new_dragend */

(function () {
  "use strict";

  const buildingImages = [
    {
      buildingTypeId: 7,
      caption: "Leitstelle",
      image: "/images/building_leitstelle.png",
    },
    {
      buildingTypeId: 0,
      caption: "Feuerwache",
      image: "/images/building_fire.png",
    },
    {
      buildingTypeId: 18,
      caption: "Feuerwache (Kleinwache)",
      image: "/images/building_fire.png",
    },
    {
      buildingTypeId: 1,
      caption: "Feuerwehrschule",
      image: "/images/building_fireschool.png",
    },
    {
      buildingTypeId: 2,
      caption: "Rettungswache",
      image: "/images/building_rescue_station.png",
    },
    {
      buildingTypeId: 20,
      caption: "Rettungswache (Kleinwache)",
      image: "/images/building_rescue_station.png",
    },
    {
      buildingTypeId: 3,
      caption: "Rettungsschule",
      image: "/images/building_rettungsschule.png",
    },
    {
      buildingTypeId: 4,
      caption: "Krankenhaus",
      image: "/images/building_hospital.png",
    },
    {
      buildingTypeId: 5,
      caption: "Rettungshubschrauber-Station",
      image: null,
    },
    {
      buildingTypeId: 12,
      caption: "Schnelleinsatzgruppe (SEG)",
      image: "/images/building_seg.png",
    },
    {
      buildingTypeId: 6,
      caption: "Polizeiwache",
      image: "/images/building_polizeiwache.png",
    },
    {
      buildingTypeId: 19,
      caption: "Polizeiwache (Kleinwache)",
      image: "/images/building_polizeiwache.png",
    },
    {
      buildingTypeId: 11,
      caption: "Bereitschaftspolizei",
      image: "/images/building_bereitschaftspolizei.png",
    },
    {
      buildingTypeId: 17,
      caption: "Polizei-Sondereinheiten",
      image: null,
    },
    {
      buildingTypeId: 13,
      caption: "Polizeihubschrauberstation",
      image: "/images/building_helipad_polizei.png",
    },
    {
      buildingTypeId: 8,
      caption: "Polizeischule",
      image: "/images/building_polizeischule.png",
    },
    {
      buildingTypeId: 9,
      caption: "THW",
      image: "/images/building_thw.png",
    },
    {
      buildingTypeId: 10,
      caption: "THW Bundesschule",
      image: "/images/building_thw_school.png",
    },
    {
      buildingTypeId: 14,
      caption: "Bereitstellungsraum",
      image: null,
    },
    {
      buildingTypeId: 15,
      caption: "Wasserrettung",
      image: "/images/building_wasserwacht.png",
    },
    {
      buildingTypeId: 21,
      caption: "Rettungshundestaffel",
      image: "/images/building_rescue_dog_unit.png",
    },
  ];

  class Coordinate {
    constructor(latitude, longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
    }
  }

  let controlCenters = [];

  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");

  const prefixes = {
    7: "ILS",
    0: "Feuerwehrstützpunkt ",
    18: "Feuerwache ",
    1: "FWS",
    2: "Rettungswache ",
    20: "Rettungswache ",
    3: "Rettungsschule ",
    4: "KH",
    5: "Christoph",
    12: "SEG ",
    6: "Polizeipräsidium ",
    19: "Polizeiwache ",
    11: "BRP ",
    17: "Polizei-Sondereinheiten",
    13: "Bussard",
    8: "Bundespolizeischule ",
    9: "THW ",
    10: "TS",
    14: "BSR",
    15: "Neptun " + date,
    21: "Antonius " + date,
    16: "Polizeizellen",
  };

  const createdBuildingsListId = "created-buildings-list";

  async function getBuildings() {
    if (
      !sessionStorage.aBuildings ||
      JSON.parse(sessionStorage.aBuildings).lastUpdate < new Date().getTime() - 5 * 1000 * 60
    ) {
      const buildings = await fetch("/api/buildings.json").then(response => response.json());

      try {
        sessionStorage.setItem("aBuildings", JSON.stringify({ lastUpdate: new Date().getTime(), value: buildings }));
      } catch (e) {
        return buildings;
      }
    }

    return JSON.parse(sessionStorage.aBuildings).value;
  }

  async function initControlCenters() {
    const buildings = await getBuildings();

    controlCenters = buildings.filter(building => building.building_type === 7);
  }

  function calculateDistanceInKm(coordinateA, coordinateB) {
    const R = 6371;
    const dLat = deg2rad(coordinateB.latitude - coordinateA.latitude);
    const dLon = deg2rad(coordinateB.longitude - coordinateA.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(coordinateA.latitude)) *
        Math.cos(deg2rad(coordinateB.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function getIdOfClosestControlCenter(coordinate) {
    let localControlCenters = controlCenters.map(controlCenter => {
      const distance = calculateDistanceInKm(
        coordinate,
        new Coordinate(controlCenter.latitude, controlCenter.longitude),
      );
      return {
        id: controlCenter.id,
        caption: controlCenter.caption,
        distance: distance,
      };
    });

    localControlCenters.sort((a, b) => a.distance - b.distance);

    return localControlCenters[0].id;
  }

  function getCurrentCity() {
    const address = document.getElementById("building_address").value;

    return address
      .substring(address.lastIndexOf(",") + 1)
      .trim()
      .replace(/\d+/g, "")
      .trim();
  }

  function updateBuildingName(buildingType) {
    let buildingName = "";

    const prefix = prefixes[buildingType];
    if (prefix) {
      buildingName = prefix + " ";
    }

    document.getElementById("building_name").value = buildingName + getCurrentCity();
  }

  function buildingTypeChangeEvent(event) {
    const buildingType = event.target.value;
    updateBuildingName(buildingType);

    if (buildingType === "0") {
      document.getElementById("building_start_vehicle_feuerwache").value = 30;
    }
    if (buildingType === "18") {
      document.getElementById("building_start_vehicle_feuerwache_kleinwache").value = 30;
    }
  }

  function selectClosestControlCenter(coordinate) {
    document.getElementById("building_leitstelle_building_id").value = getIdOfClosestControlCenter(coordinate);
  }

  function overwriteDrangEndListener() {
    let latitude = null;
    let longitude = null;
    const buildingNewDragendOriginal = building_new_dragend;
    building_new_dragend = function () {
      let coordinates = building_new_marker.getLatLng();

      let coordinatesChanged = false;
      if (latitude !== coordinates.lat) {
        latitude = coordinates.lat;
        coordinatesChanged = true;
      }

      if (longitude !== coordinates.lng) {
        longitude = coordinates.lng;
        coordinatesChanged = true;
      }

      if (coordinatesChanged) {
        selectClosestControlCenter(new Coordinate(latitude, longitude));
      }

      buildingNewDragendOriginal();

      setTimeout(() => {
        updateBuildingName(document.getElementById("building_building_type").value);
      }, 250);
    };
  }

  function selectBuildingType(id) {
    const buildingType = document.getElementById("building_building_type");

    for (let i = 0; i < buildingType.options.length; i++) {
      if (buildingType.options[i].value === id) {
        buildingType.selectedIndex = i;
        buildingType.dispatchEvent(new Event("change"));
        break;
      }
    }

    console.warn("[Baumeister] Failed to select building type");
  }

  function getImageUrlByBuildingTypeId(buildingTypeId) {
    const buildingImage = buildingImages.find(
      buildingImage => buildingImage.buildingTypeId === parseInt(buildingTypeId),
    );
    if (buildingImage) {
      return buildingImage.image;
    }

    return null;
  }

  async function createBuilding() {
    const coordinate = building_new_marker.getLatLng();

    const form = document.getElementById("new_building");
    const formData = new FormData(form);

    const response = await fetch("https://www.leitstellenspiel.de/buildings", {
      headers: {
        "x-csrf-token": document.querySelector('meta[name="csrf-token"]'),
        "x-requested-with": "XMLHttpRequest",
      },
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    const parser = new DOMParser();
    const responseParser = parser.parseFromString(responseText, "text/html");
    const alerts = responseParser.querySelectorAll("span.label-danger");

    if (alerts.length > 0) {
      alerts.forEach(alert => {
        const message = alert.innerText;

        const alertElement = document.createElement("div");
        alertElement.className = "alert alert-danger";
        alertElement.innerText = message;

        document.getElementById("detail_16").parentElement.insertAdjacentElement("beforeend", alertElement);
      });

      return;
    }

    const buildingId = responseText.match(/\/buildings\/(\d+)/)[1];

    const buildingName = document.getElementById("building_name").value;

    const createdBuildingsListItem = document.createElement("li");
    createdBuildingsListItem.innerHTML = `<a href="/buildings/${buildingId}" target="_blank" class="text-success">${buildingName}</a>`;
    document.getElementById(createdBuildingsListId).appendChild(createdBuildingsListItem);

    const iconUrl = getImageUrlByBuildingTypeId(formData.get("building[building_type]"));

    if (iconUrl) {
      const markerOptions = {
        icon: L.icon({
          iconUrl: iconUrl,
          iconSize: [32, 37],
          iconAnchor: [16, 37],
          popupAnchor: [0, -37],
        }),
      };
      L.marker([coordinate.lat, coordinate.lng], markerOptions).addTo(map);
    } else {
      L.marker([coordinate.lat, coordinate.lng]).addTo(map);
    }
  }

  async function rescueBuildingsButtonClickEvent(event) {
    event.preventDefault();

    const buildButton = event.target.closest("button");
    buildButton.disabled = true;

    // Create rescue station building
    selectBuildingType("20");
    await createBuilding();

    // Create rapid response team building
    selectBuildingType("12");
    await createBuilding();

    buildButton.disabled = false;
  }

  function addRescueBuildingsButton() {
    const buttonId = "rescue-buildings-button";

    if (document.getElementById(buttonId)) {
      return;
    }

    const rescueBuildingsButton = document.createElement("button");
    rescueBuildingsButton.id = buttonId;
    rescueBuildingsButton.type = "button";
    rescueBuildingsButton.className = "btn btn-default";
    rescueBuildingsButton.innerHTML = "🚑";
    rescueBuildingsButton.addEventListener("click", rescueBuildingsButtonClickEvent);

    document.getElementById("detail_16").parentElement.insertAdjacentElement("beforeend", rescueBuildingsButton);
  }

  function addOrderedList() {
    const orderedList = document.createElement("ol");
    orderedList.id = createdBuildingsListId;

    document.getElementById("detail_16").parentElement.insertAdjacentElement("beforeend", orderedList);
  }

  async function buildButtonClickEvent(event) {
    event.preventDefault();

    const buildButton = event.target;

    buildButton.disabled = true;

    await createBuilding();

    buildButton.disabled = false;
  }

  function addEventListeners() {
    const buildButtons = document.querySelectorAll("input[type=submit].build_with_credits_step");

    for (let i = 0; i < buildButtons.length; i++) {
      buildButtons[i].addEventListener("click", buildButtonClickEvent);
    }
  }

  async function main() {
    await initControlCenters();

    const observer = new MutationObserver(mutationRecords => {
      mutationRecords.forEach(mutation => {
        if (!mutation.target.querySelector("#new_building")) {
          return;
        }

        addEventListeners();
        addRescueBuildingsButton();
        addOrderedList();

        document.getElementById("building_building_type").addEventListener("change", buildingTypeChangeEvent);

        overwriteDrangEndListener();

        updateBuildingName();

        const element = document.getElementById("building_new_info_message");
        if (element) {
          element.remove();
        }
      });
    });

    observer.observe(document.getElementById("buildings"), {
      childList: true,
    });
  }

  main();
})();
