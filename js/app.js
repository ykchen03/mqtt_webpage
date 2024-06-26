let clientId = navigator.userAgent + "_" + Math.random().toString(16).substr(2, 8);
client = new Paho.MQTT.Client("wss://mqtt.eclipseprojects.io/mqtt:443", clientId);
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

let connectingInterval;

$().ready(() => {
    client.connect({onSuccess:onConnect});
});

function ConsoleLog(message) {
    let consoleElement = $('#console');
    let currentTime = moment().format();    ;
    consoleElement.val(consoleElement.val() + message + " - " + currentTime +'\n');
    consoleElement.scrollTop(consoleElement[0].scrollHeight);
}

function onConnect() {
    ConsoleLog("Connected");
    $("#status").text("Connected").css("color", "green");
    $("#subscribe").prop("disabled", false);
    $("#publish").prop("disabled", false);
    $("#shortcut button").prop("disabled", false);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        ConsoleLog("onConnectionLost: " + responseObject.errorMessage);
        $("#status").text("Disconnected(Reload to reconnect)").css("color", "red");
    }
    $("#subscribe").prop("disabled", true);
    $("#publish").prop("disabled", true);
    $("#shortcut button").prop("disabled", true);
}

function onMessageArrived(message) {
    ConsoleLog("Message Arrived: "+message.payloadString);
}

function publish(topic, text) {
    let message = new Paho.MQTT.Message(text);
    message.destinationName = topic;
    console.log(topic)
    client.send(message);
    ConsoleLog("Published: \"" + text + "\" to " + topic);
}

$("#subscribe").click(() => {
    let topic = $("#topic").val();
    if(isSubscribed){
        client.unsubscribe(topic);
        ConsoleLog("Unsubscribed from: " + topic);
        $("#subscribe").text("Subscribe");
        $("#topic").prop("disabled", false);
        isSubscribed = false;
    }
    else {
        client.subscribe(topic);
        ConsoleLog("Subscribed to: " + topic);
        $("#subscribe").text("Unsubscribe");
        $("#topic").prop("disabled", true);
        isSubscribed = true;
    }
});

$("#publish").click(() => {
    publish($("#topic").val(), $("#message").val());
});

$("#shortcut button").click((e) => {
    if(e.target.textContent === "風"){
        publish( $("#topic").val(), "風");
    } else if(e.target.textContent === "狂風"){
        publish( $("#topic").val(), "狂風");
    } else if(e.target.textContent === "天黑"){
        publish( $("#topic").val(), "天黑");
    } else if(e.target.textContent === "彩虹"){
        publish( $("#topic").val(), "彩虹");
    } else if(e.target.textContent === "流星"){
        publish( $("#topic").val(), "流星");
    } else if(e.target.textContent === "Off"){
        publish( $("#topic").val(), "Off");
    }
});

var recognition = new (webkitSpeechRecognition || SpeechRecognition)();
recognition.lang = 'zh-TW';
recognition.continuous = true;
recognition.interimResults = true;

recognition.onstart = () => {
    ConsoleLog('Voice recognition activated. Press Mute button to stop recognition.');
}

recognition.onspeechend = () => {
    //ConsoleLog('Debug: onspeechend');
    recognition.stop();
}

recognition.onresult = (event) => {
    //ConsoleLog('Debug: onresult');
    let transcript = event.results[0][0].transcript;
    $("#message").val(transcript);
}

$("#speech").click(() => {
    if(!isRecognizing){
        recognition.start();
        $("#speech i").removeClass("fa-microphone").addClass("fa-microphone-slash");
        $("#speech").removeClass("btn-success").addClass("btn-danger");
        isRecognizing = true;
    } else {
        recognition.stop();
        $("#speech i").removeClass("fa-microphone-slash").addClass("fa-microphone");
        $("#speech").removeClass("btn-danger").addClass("btn-success");
        isRecognizing = false;
    }
});