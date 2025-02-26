// ==UserScript==
// @name         LSS AAO Buttons mit Auswahlfenster
// @namespace    www.leitstellenspiel.de
// @version      1.2
// @description  Fügt ein Auswahlfenster mit AAO-Buttons in die Navbar ein.
// @author       FWMTJ
// @match        https://www.leitstellenspiel.de/missions/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Hier könnt Ihr die Buttons konfigurieren! dangerButton =rot warningButton =orange successButton = grün und primaryButton = blau   bei 10000000 muss Eure AAO ID rein!
    let dangerButtons = [

        //ACHTUNG! Hier können Buttons erzeugt werden aus allen 3 Kategorien!
        createButton('Text alamieren', 'fa-solid', 10000000, 'alarm', 'btn-danger'),

        createButton('Text alamieren und weiter', 'fa-solid', 10000000, 'alarm_next', 'btn-danger'),

        createButton('Text im Verband teilen', 'fa-solid', 10000000, 'alarm_next_alliance', 'btn-danger')
    ];

    let warningButtons = [
       //Hier können Buttons erzeugt werden Alamieren und Einsatz schließen!
        createButton('Text alamieren', 'fa-solid', 10000000, 'alarm', 'btn-warning'),

        //Hier können Buttons erzeugt werden Alamieren und zum nächsten Einsatz! im Beispiel meine AAO Ids
        createButton('RTW','fa-solid', 56674133, 'alarm_next', 'btn-warning'),
        createButton('ITW','fa-solid', 56879183, 'alarm_next', 'btn-warning'),
    ];

    let successButtons = [
       //Hier können Buttons erzeugt werden die Ihr selber zufahren wollt ohne zu teilen.
        createButton('Text alamieren und weiter', 'fa-solid', 10000000, 'alarm_next', 'btn-success'),
    ];

    let primaryButtons = [
        //Hier können Buttons erzeugt werden um Einsätze im Verband zu teilen.
        createButton('Text im Verband teilen', 'fa-solid', 10000000, 'alarm_next_alliance', 'btn-primary')
    ];

    // Function to create a button
    function createButton(text, iconClass, aaoId, action, buttonClass) {
        let button = $('<button></button>').addClass('btn btn-sm ' + buttonClass + ' m-1') // btn-sm für kleinere Buttons
                                  .text(text)
                                  .attr('title', text)
                                  .attr('data-aao-id', aaoId)
                                  .attr('data-action', action);
        if (iconClass) {
            button.prepend($('<i></i>').addClass('fas ' + iconClass + ' mr-1'));
        }
        return button;
    }

    // Function to create the modal
    function createModal() {
        let modal = $('<div></div>').addClass('modal fade')
                                    .attr('id', 'customButtonsModal')
                                    .attr('tabindex', '-1')
                                    .attr('role', 'dialog')
                                    .attr('aria-labelledby', 'customButtonsModalLabel')
                                    .attr('aria-hidden', 'true');

        let modalDialog = $('<div></div>').addClass('modal-dialog')
                                          .attr('role', 'document');

        let modalContent = $('<div></div>').addClass('modal-content');

        let modalHeader = $('<div></div>').addClass('modal-header')
                                          .append($('<h5></h5>').addClass('modal-title').attr('id', 'customButtonsModalLabel').text('AAO-Buttons'));

        let modalBody = $('<div></div>').addClass('modal-body');

        // (Hier könnt Ihr die Überschriften ändern Bsp. 'Rettungseinsätze' oder 'Eigene Einsätze selber zufahren' bitte nur den Text in der Klammer ändern mit ''!!!

        if (dangerButtons.length > 0) {
            modalBody.append($('<h6></h6>').text('Text').addClass('mt-2'));
            dangerButtons.forEach(button => modalBody.append(button));
        }
        if (warningButtons.length > 0) {
            modalBody.append($('<h6></h6>').text('Rettungseinsätze').addClass('mt-2'));
            warningButtons.forEach(button => modalBody.append(button));
        }
        if (successButtons.length > 0) {
            modalBody.append($('<h6></h6>').text('Eigene Einsätze selber zufahren').addClass('mt-2'));
            successButtons.forEach(button => modalBody.append(button));
        }
        if (primaryButtons.length > 0) {
            modalBody.append($('<h6></h6>').text('Einsätze teilen im Verband').addClass('mt-2'));
            primaryButtons.forEach(button => modalBody.append(button));
        }

        let modalFooter = $('<div></div>').addClass('modal-footer')
                                           .append($('<button></button>').addClass('btn btn-secondary').attr('type', 'button').attr('data-dismiss', 'modal').text('Schließen'));

        modalContent.append(modalHeader, modalBody, modalFooter);
        modalDialog.append(modalContent);
        modal.append(modalDialog);

        return modal;
    }

    // Add custom CSS for the modal
    $('head').append(`
        <style>
            .btn-group-sm .btn {
                padding: 0.25rem 0.5rem; /* Kleineres Padding */
                font-size: 0.875rem;     /* Kleinere Schriftgröße */
                line-height: 1.5;       /* Angepasste Zeilenhöhe */
            }
            .btn-group-sm .btn i {
                margin-right: 0.25rem;   /* Kleinerer Abstand zwischen Icon und Text */
            }
            .modal-body h6 {
                font-size: 1rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
        </style>
    `);

    // Add the modal to the page
    $('body').append(createModal());

    // Add a button to open the modal
    let openModalButton = $('<button></button>').addClass('btn btn-sm btn-info mr-2')
                                               .text('AAO-Buttons')
                                               .attr('title', 'AAO-Buttons öffnen')
                                               .attr('data-toggle', 'modal')
                                               .attr('data-target', '#customButtonsModal');
    $('#navbar-alarm-spacer').before(openModalButton);

    // Event listener for button clicks inside the modal
    $(document).on('click', '#customButtonsModal .btn', function(e) {
        e.preventDefault();
        let aaoId = $(this).data('aao-id');
        let action = $(this).data('action');
        if (aaoId && action) {
            $('#aao_' + aaoId).click();
            switch (action) {
                case 'alarm':
                    $('#mission_alarm_btn').click();
                    break;
                case 'alarm_next':
                    $('.alert_next').click();
                    break;
                case 'alarm_next_alliance':
                    $('.alert_next_alliance').click();
                    break;
            }
            $('#customButtonsModal').modal('hide'); // Close the modal after clicking a button
        }
    });
})();