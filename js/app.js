client = new Paho.MQTT.Client("mqtt.eclipseprojects.io/mqtt", 443, "clientId");
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

let connectingInterval;

$().ready(() => {
    client.connect({onSuccess:onConnect});

    let dotCount = 0;

    connectingInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4; // Cycle dotCount between 0 and 3
        let dots = '.'.repeat(dotCount); // Create a string with dotCount dots
        $('#status').text('Connecting' + dots);
    }, 500); // Update every 500 milliseconds
});

function ConsoleLog(message) {
    let consoleElement = $('#console');
    let currentTime = moment().format();    ;
    consoleElement.val(consoleElement.val() + message + " - " + currentTime +'\n'); // Append the text to the console
    consoleElement.scrollTop(consoleElement[0].scrollHeight);
}

function onConnect() {
    console.log("onConnect");
    ConsoleLog("Connected");
    clearInterval(connectingInterval);
    $("#status").text("Connected").css("color", "green");
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        ConsoleLog("onConnectionLost:"+responseObject.errorMessage);
        $("#status").text("Disconnected").css("color", "red");
        clearInterval(connectingInterval);
    }
}

function onMessageArrived(message) {
    ConsoleLog("Message Arrived: "+message.payloadString);
}

$("#subscribe").click(() => {
    let topic = $("#topic").val();
    client.subscribe(topic);
    ConsoleLog("Subscribed to: " + topic);
    $("#subscribe").prop("disabled", true);
    $("#unsubscribe").prop("disabled", false);
});

$("#unsubscribe").click(() => {
    let topic = $("#topic").val();
    client.unsubscribe(topic);
    ConsoleLog("Unsubscribed from: " + topic);
    $("#subscribe").prop("disabled", false);
    $("#unsubscribe").prop("disabled", true);
});

$("#publish").click(() => {
    let text = $("#message").val(), topic = $("#topic").val();
    message = new Paho.MQTT.Message(text);
    message.destinationName = topic;
    client.send(message);
    ConsoleLog("Published: " + text + " to " + topic);
});