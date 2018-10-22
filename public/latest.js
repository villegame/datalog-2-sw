var socket = io();

var LatestGraph = function () {

    var placement = '';

    this.init = function (options) {
        placement = options.placement;
        $.get('/values/latest', function (data) {
            try {
                var initData = JSON.parse(data);

                var container = document.getElementById(placement);
                var cardDeck = document.createElement("div");
                cardDeck.className = "card-deck justify-content-center";

                initData.forEach(function (sensor) {
                    var card = document.createElement("div");
                    card.className = "card m-1 latest-value col-md-2";

                    var button = document.createElement("button");
                    button.className = "btn btn-primary";

                    var buttonType = document.createAttribute("type");
                    buttonType.value = "button";
                    button.setAttributeNode(buttonType);

                    var sensorTextName = document.createTextNode(sensor.name);
                    button.appendChild(sensorTextName);

                    if (sensor.hasOwnProperty('temperature')) {
                        var br = document.createElement("br");
                        button.appendChild(br);

                        var sensorTextTemp = document.createTextNode("temp ");
                        button.appendChild(sensorTextTemp);

                        var tSpan = document.createElement("span");
                        tSpan.className = "badge badge-light";
                        var tSpanType = document.createAttribute("id");
                        tSpanType.value = "t"+sensor.id;
                        tSpan.setAttributeNode(tSpanType);

                        var sensorTextTValue = document.createTextNode(sensor.temperature.toFixed(2));
                        tSpan.appendChild(sensorTextTValue);
                        button.appendChild(tSpan);
                    }

                    if (sensor.hasOwnProperty('humidity')) {
                        var br = document.createElement("br");
                        button.appendChild(br);

                        var sensorTextHum = document.createTextNode("hum ");
                        button.appendChild(sensorTextHum);

                        var hSpan = document.createElement("span");
                        hSpan.className = "badge badge-light";
                        var hSpanType = document.createAttribute("id");
                        hSpanType.value = "h"+sensor.id;
                        hSpan.setAttributeNode(hSpanType);

                        var sensorTextHValue = document.createTextNode(sensor.humidity.toFixed(2));
                        hSpan.appendChild(sensorTextHValue);
                        button.appendChild(hSpan);
                    }

                    if (sensor.hasOwnProperty('pressure')) {
                        var br = document.createElement("br");
                        button.appendChild(br);

                        var sensorTextPres = document.createTextNode("pres ");
                        button.appendChild(sensorTextPres);

                        var pSpan = document.createElement("span");
                        pSpan.className = "badge badge-light";
                        var pSpanType = document.createAttribute("id");
                        pSpanType.value = "p"+sensor.id;
                        pSpan.setAttributeNode(pSpanType);

                        var sensorTextPValue = document.createTextNode(sensor.pressure.toFixed(2));
                        pSpan.appendChild(sensorTextPValue);
                        button.appendChild(pSpan);
                    }

                    card.appendChild(button);
                    cardDeck.appendChild(card);
                });
                container.appendChild(cardDeck);
            } catch (e) {
                console.log("ERROR FETCHING INITIAL DATA ", e);
            }
        });
    };

    socket.on('sensor-data', function (data) {
        if (data.hasOwnProperty("temperature")) {
            var tElement = document.getElementById("t"+data.id);
            if (tElement !== null) {
                tElement.innerHTML = data.temperature.toFixed(2);
            }
        }
        if (data.hasOwnProperty("humidity")) {
            var hElement = document.getElementById("h"+data.id);
            if (hElement !== null) {
                hElement.innerHTML = data.humidity.toFixed(2);
            }
        }
        if (data.hasOwnProperty("pressure")) {
            var pElement = document.getElementById("p"+data.id);
            if (pElement !== null) {
                pElement.innerHTML = data.pressure.toFixed(2);
            }
        }
    });

};

