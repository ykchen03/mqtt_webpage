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

$("#speech").click(() => {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';

    recognition.onstart = () => {
        ConsoleLog('Voice recognition activated. Try speaking into the microphone.');
    }
    
    recognition.onspeechend = () => {
        ConsoleLog('You were quiet for a while so voice recognition turned itself off.');
    }

    recognition.onerror = (event) => {
        if(event.error == 'no-speech') {
            ConsoleLog('No speech was detected. Try again.');  
        }
    }

    recognition.onresult = (event) => {
        let current = event.resultIndex;
        let transcript = event.results[current][0].transcript;
        $("#message").val(transcript);
    }
    
    recognition.start();
});