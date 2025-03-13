// ==UserScript==
// @name         Button for assigning people with auto go to next vehicle, and Personal Assignment (Final)
// @namespace    empty
// @version      1.0
// @description  Assign people with a button push, confirm, and return to overview. Adds hotkeys for navigation, personal assignment, and return to the current building.
// @author       by FWMTJ
// @match        https://www.leitstellenspiel.de/vehicles/*/zuweisung
// @match        https://www.leitstellenspiel.de/buildings/*
// @match        https://polizei.leitstellenspiel.de/buildings/*
// @match        https://www.meldkamerspel.com/buildings/*
// @match        https://politie.meldkamerspel.com/buildings/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leitstellenspiel.de
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    //------- You can change these variables -------
    var list = [
["12","GW-Messtechnik",3],
["27","GW-Gefahrgut",3],
["28","",2],
["29","Notarzt",1],
["30","GW-Wasserrettung",6],
["32","",2],
["33","Höhenrettung",9],
["35","Zugführer (leBefKw)",1],
["36","GW-Wasserrettung",9],
["40","Zugtrupp",4],
["42","Fachgruppe Räumen",3],
["45","Fachgruppe Räumen",6],
["50","",1],
["51","Hundertschaftsführer (FüKW)",1],
["52","",2],
["53","Dekon-P",6],
["55","LNA",1],
["56","OrgL",1],
["57","Feuerwehrkran",2],
["58","",2],
["59","Einsatzleitung (SEG)",2],
["60","GW-San",6],
["61","Polizeihubschrauber",1],
["63","GW-Taucher",2],
["64","GW-Wasserrettung",6],
["69","Fachgruppe Bergungstaucher",2],
["72","Wasserwerfer",5],
["73","Notarzt",2],
["74","Notarzt",1],
["75","Flugfeldlöschfahrzeug",3],
["76","Rettungstreppe",2],
["79","SEK",4],
["80","SEK",9],
["81","MEK",4],
["82","MEK",9],
["83","Werkfeuerwehr",9],
["84","Werkfeuerwehr",3],
["85","Werkfeuerwehr",3],
["86","Werkfeuerwehr",3],
["91","Rettungshundeführer",5],
["93","Fachgruppe Rettungshundeführer",5],
["94","Hundeführer (Schutzhund)",1],
["95","Motorradstaffel",1],
["97", "Intensivpflege",2],
["98","Kriminalpolizist",1],
["99","Fachgruppe Wasserschaden/Pumpen",3],
["100","Fachgruppe Wasserschaden/Pumpen",7],
["103","Dienstgruppenleitung",2],
["109","FGr SB",9],
["122","FGr E",3],
["123","Fachgruppe Wasserschaden/Pumpen",3],
["125","Tr UL",4],
["127","Drohnenoperator",4],
["129","ELW 2, Drohnen-Schulung",6],
["131","Betreuungshelfer",9],
["133","Betreuungshelfer",1],
["133","Verpflegungshelfer",2],
["134","Reiterstaffel",4],
["135","Reiterstaffel",2],
["137","Reiterstaffel",6],
["144","Führung und Kommunikation",4],
["145","Führung und Kommunikation",7],
["147","Führung und Kommunikation",7],
["148","Führung und Kommunikation",4],
["151","Einsatzleiter Bergrettung",3],
["149","Drohnenoperator",4],
["153","Hundeführer",5],
["156","Höhenretter",5],
["165","Lautsprecheroperator",5],
];

    var pressDelay = 750; // Delay between button presses in milliseconds
    const buildingSwitchDelay = 3000; // 3 Sekunden Pause zwischen Gebäudewechseln

    //------- Hotkey Configuration -------
    const hotkeysEnabled = true; // Set to false to disable hotkeys
    const hotkeyNextBuilding = "d"; // Key to navigate to the next building
    const hotkeyPrevBuilding = "a"; // Key to navigate to the previous building
    const hotkeyCurrentBuilding = "w"; // Key to refresh the current building
    const hotkeyNewVehicle = "s"; // Key to open the new vehicle page
    const hotkeyPersonalAssignment = "p"; // Key to open the personal assignment page
    const hotkeyReturnToBuilding = "r"; // Key to return to the current building

    //------- After here, change only if you know what you're doing -------

    // Funktion zum Erkennen des Gebäudewechsels und automatischen Öffnen der Personalzuweisung
    function checkBuildingChangeAndOpenAssignment() {
        const currentBuildingId = window.location.href.split("/buildings/")[1].split("/")[0];
        const lastBuildingId = sessionStorage.getItem("lastBuildingId");

        if (currentBuildingId !== lastBuildingId) {
            // Gebäude-ID hat sich geändert
            sessionStorage.setItem("lastBuildingId", currentBuildingId);

            // Simuliere den Hotkey "p" nach einer kurzen Verzögerung
            setTimeout(() => {
                simulateHotkey(hotkeyPersonalAssignment);
            }, buildingSwitchDelay);
        }
    }

    // Check if we are on the vehicle assignment page
    if (window.location.href.includes("/vehicles/") && window.location.href.includes("/zuweisung")) {
        var vehicleID = window.location.href.split("/").slice(-2, -1)[0];

        var vehicle = await $.getJSON('/api/v2/vehicles/' + vehicleID);
        vehicle = vehicle.result;

        var personGoal = list.filter(b => b[0] == vehicle.vehicle_type);

        if (vehicleID && vehicle && personGoal.length > 0) {
            var allMsg = Array.prototype.slice.call(document.getElementsByClassName("vehicles-education-filter-box"))[0];

            var newWindow = document.createElement("div");
            newWindow.innerHTML = `
                <a id="btnAssign" class="btn btn-success">Auswählen</a>
            `;

            newWindow.innerHTML += `<div><p id="msgToPlayer" style="display: inline-block">`;
            for (var n = 0; n < personGoal.length; n++) {
                newWindow.innerHTML += `Anzahl Personen: ` + personGoal[n][2] + `   Lehrgang: ` + personGoal[n][1] + `</br>`;
            }
            newWindow.innerHTML += `</p></div>`;

            newWindow.setAttribute("class", "navbar-text");
            newWindow.setAttribute("style", "width:100%;");

            allMsg.parentNode.insertBefore(newWindow, allMsg);

            $('#btnAssign').on('click', async function () {
                var allPeople = Array.prototype.slice.call($('#personal_table')[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr"));

                var curSelected = Array(personGoal.length).fill(0);
                for (let i = 0; i < allPeople.length; i++) {
                    let index = GetIndexOfRelevantTraining(allPeople[i]);
                    if (IsPeopleAssignedToThisVeh(allPeople[i])) {
                        curSelected[index] += 1;
                    }

                    if (IsPeopleAssignedToThisVeh(allPeople[i]) && !HasRelevantTraining(allPeople[i])) {
                        await UnselectPeople(allPeople[i]);
                        curSelected[index] -= 1;
                    }
                }

                var maxPerVehicle = personGoal.map(e => e[2]);

                for (let i = 0; i < allPeople.length; i++) {
                    var index = GetIndexOfRelevantTraining(allPeople[i]);
                    if (curSelected[index] < maxPerVehicle[index] && HasRelevantTraining(allPeople[i]) && IsPeopleFreeToAssigne(allPeople[i])) {
                        await SelectPeople(allPeople[i]);
                        curSelected[index] += 1;
                    }

                    if (curSelected[index] > maxPerVehicle[index] && IsPeopleAssignedToThisVeh(allPeople[i])) {
                        await UnselectPeople(allPeople[i]);
                        curSelected[index] -= 1;
                    }
                }

                $('#msgToPlayer')[0].innerHTML = "";
                var peopleMissing = false;

                for (let i = 0; i < curSelected.length; i++) {
                    if (curSelected[i] != maxPerVehicle[i]) {
                        peopleMissing = true;
                    }
                }

                if (peopleMissing) {
                    $('#msgToPlayer')[0].innerHTML = "Leute fehlen!";
                } else {
                    $('#msgToPlayer')[0].innerHTML = "Done";
                    // Automatically click the confirmation button (glyphicon-arrow-right)
                    await delay(pressDelay);
                    document.querySelector('span.glyphicon.glyphicon-arrow-right').closest('a').click();
                    await delay(pressDelay);
                    goToNextVehicle(); // Wechsle zum nächsten Fahrzeug oder zurück zur Gebäudeübersicht
                }
            });

            await delay(500);
            $('#btnAssign').click();
        }

        // Hotkey functionality for vehicle assignment page
        if (hotkeysEnabled) {
            const buildingId = vehicle.building_id;

            document.addEventListener("keydown", function (event) {
                const activeElement = document.activeElement;
                if (activeElement.tagName.toLowerCase() === "input" && activeElement.type.toLowerCase() === "text") {
                    return;
                }

                if (event.key === hotkeyReturnToBuilding || event.key === "R") {
                    window.location.href = `/buildings/${buildingId}`;
                }
            });
        }
    }

    // Hotkey functionality for building navigation, personal assignment, and return to building
    if (hotkeysEnabled && window.location.href.includes("/buildings/")) {
        // Add buttons for personal assignment
        addButtonToNewVehiclesAlert();
        addButtonToVehiclesOnBuildingPage();

        // Check for building change and open personal assignment
        checkBuildingChangeAndOpenAssignment();

        // Get the current building ID from the URL
        const currentBuildingId = window.location.href.split("/buildings/")[1].split("/")[0];

        // Hotkey event listener
        document.addEventListener("keydown", function (event) {
            const activeElement = document.activeElement;
            if (activeElement.tagName.toLowerCase() === "input" && activeElement.type.toLowerCase() === "text") {
                return;
            }

            if (event.key === hotkeyPrevBuilding) {
                document.getElementById("building-navigation-container").children[0].click();
            }

            if (event.key === hotkeyNextBuilding) {
                document.getElementById("building-navigation-container").children[2].click();
            }

            if (event.key === hotkeyCurrentBuilding) {
                document.getElementById("building-navigation-container").children[1].click();
            }

            if (event.key === hotkeyNewVehicle) {
                window.open(window.location.href + "/vehicles/new", "_self").focus();
            }

            if (event.key === hotkeyPersonalAssignment || event.key === "P") {
                openAssignmentPage();
            }

            if (event.key === hotkeyReturnToBuilding || event.key === "R") {
                window.location.href = `/buildings/${currentBuildingId}`;
            }
        });

        // Automatically simulate the "d" hotkey if coming from the assignment page
        if (sessionStorage.getItem("fromAssignmentPage") === "true") {
            sessionStorage.removeItem("fromAssignmentPage"); // Reset the flag
            await delay(buildingSwitchDelay); // 3 Sekunden Pause
            simulateHotkey(hotkeyNextBuilding);
        }
    }

    // Helper functions for personal assignment
    function addButtonToNewVehiclesAlert() {
        const buttonGroup = document.querySelector(
            "div.alert.fade.in.alert-success > div.btn-group"
        );

        if (buttonGroup === null) {
            return;
        }

        const vehicleUrl = buttonGroup.children[0].href;

        const userIconSpan = document.createElement("span");
        userIconSpan.className = "glyphicon glyphicon-user";

        const button = document.createElement("a");
        button.className = "btn btn-default";
        button.href = vehicleUrl + "/zuweisung";
        button.appendChild(userIconSpan);

        buttonGroup.appendChild(button);
    }

    function addButtonToVehiclesOnBuildingPage() {
        const vehicleEditButtons = document.querySelectorAll(
            "a.btn.btn-default.btn-xs[href^='/vehicles/'][href$='/edit']"
        );

        vehicleEditButtons.forEach((vehicleEditButton) => {
            const vehicleUrl = vehicleEditButton.href;
            const vehicleId = vehicleUrl.split("/")[4];

            const userIconSpan = document.createElement("span");
            userIconSpan.className = "glyphicon glyphicon-user";

            const button = document.createElement("a");
            button.className = "btn btn-default btn-xs";
            button.href = `/vehicles/${vehicleId}/zuweisung`;
            button.appendChild(userIconSpan);

            vehicleEditButton.parentElement.appendChild(button);
        });
    }

    function openAssignmentPage() {
        const button = document.querySelector("a[href$='/zuweisung']");
        if (button) {
            window.location.href = button.href;
        }
    }

    // Helper functions for vehicle assignment
    function HasRelevantTraining(entry) {
        for (var n = 0; n < personGoal.length; n++) {
            if ((personGoal[n][1] != "" && GetTraining(entry).indexOf(personGoal[n][1]) >= 0 || personGoal[n][1] == "" && GetTraining(entry) == "")) {
                return true;
            }
        }
        return false;
    }

    function GetIndexOfRelevantTraining(entry) {
        for (var n = 0; n < personGoal.length; n++) {
            if ((personGoal[n][1] != "" && GetTraining(entry).indexOf(personGoal[n][1]) >= 0 || personGoal[n][1] == "" && GetTraining(entry) == "")) {
                return n;
            }
        }
        return -1;
    }

    function IsPeopleAssignedToThisVeh(entry) {
        return entry.getElementsByTagName("td")[3].getElementsByClassName("btn btn-default btn-assigned").length > 0;
    }

    function IsPeopleFreeToAssigne(entry) {
        return entry.getElementsByTagName("td")[3].getElementsByClassName("btn btn-success").length > 0 && entry.getElementsByTagName("td")[2].innerText.indexOf("Im Unterricht") == -1;
    }

    async function SelectPeople(entry) {
        await delay(pressDelay);
        return entry.getElementsByTagName("td")[3].getElementsByClassName("btn btn-success")[0].click();
    }

    async function UnselectPeople(entry) {
        await delay(pressDelay);
        entry.getElementsByTagName("td")[3].getElementsByClassName("btn btn-default btn-assigned")[0].click();
    }

    function GetTraining(entry) {
        return new String(entry.getElementsByTagName("td")[1].innerHTML).valueOf().trim();
    }

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    // Funktion zum Weiterschalten zum nächsten Fahrzeug oder zurück zur Gebäudeübersicht
    async function goToNextVehicle() {
        const nextVehicleButton = document.querySelector('a[title="Nächstes Fahrzeug"]');
        if (nextVehicleButton) {
            await delay(pressDelay);
            nextVehicleButton.click();
        } else {
            // Kein weiteres Fahrzeug gefunden, gehe zurück zur Gebäudeübersicht
            console.log("Kein weiteres Fahrzeug gefunden. Gehe zurück zur Gebäudeübersicht.");
            sessionStorage.setItem("fromAssignmentPage", "true"); // Setze den Flag
            window.location.href = `/buildings/${vehicle.building_id}`;
        }
    }

    // Funktion zum Simulieren eines Hotkeys
    function simulateHotkey(key) {
        const event = new KeyboardEvent("keydown", {
            key: key,
            code: `Key${key.toUpperCase()}`,
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(event);
    }
})();