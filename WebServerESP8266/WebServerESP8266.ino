#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsServer.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ArduinoJson.h>
#include "webpage.h"

#define USE_SERIAL Serial

// List of inputs
const byte inputs[] = { D5, D6, D7 };
const char inLabels[][5] = {"LED1", "LED2", "LED3"};

// List of outputs
// Usually LED_BUILTIN turn on with level LOW on pin D4
const byte outputs[] = { D3, LED_BUILTIN };
const char outLabels[][5] = {"OUT1", "OUT2"};

const char* ssid     = "ttttttttT";
const char* password = "xcxxxxccc";

// WebSocket server
WebSocketsServer webSocket = WebSocketsServer(81);
// HTTP server
ESP8266WebServer server(80);

// Web server handlers
void handleNotFound() {
    String msg = server.uri();
    msg += " not found.";
    server.send(404, "text/plain", msg);    
}

// Send homepage (loaded from flash memory) to client
void handleHomePage() {
  server.sendHeader(F("Content-Encoding"), "gzip");
  server.send(200, "text/html", WEBPAGE_HTML, WEBPAGE_HTML_SIZE);
}

// Send updated gpio list to websocket clients
void updateGpioList(){
    int arrayItem = sizeof(inputs) + sizeof(outputs);
    const int capacity = JSON_ARRAY_SIZE(arrayItem) + 8*JSON_OBJECT_SIZE(4);    
    DynamicJsonDocument doc(capacity);
    JsonArray gpios = doc.createNestedArray("gpios");
    for(int i=0; i< sizeof(inputs); i++) {
        JsonObject gpio = gpios.createNestedObject();
        gpio["pin"] = inputs[i];
        gpio["label"] = inLabels[i];
        gpio["type"] = "input";
        gpio["level"] = digitalRead(inputs[i]) ? true : false;
    }
    for(int i=0; i< sizeof(outputs); i++) {
        JsonObject gpio = gpios.createNestedObject();
        gpio["pin"] = outputs[i];
        gpio["label"] = outLabels[i];
        gpio["type"] = "output";
        gpio["level"] = digitalRead(outputs[i]) ? true : false;
    }
    String msg;
    serializeJson(doc, msg);        
    webSocket.broadcastTXT(msg);
    //USE_SERIAL.println(msg);    
}


void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            USE_SERIAL.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED:
            {
                IPAddress ip = webSocket.remoteIP(num);
                USE_SERIAL.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);                
                // send message to client
                webSocket.sendTXT(num, "Connected");
                updateGpioList();
            }
            break;
        case WStype_TEXT:
            {
                USE_SERIAL.printf("[%u] get Text: %s\n", num, payload);                     
                DynamicJsonDocument doc(128);
                deserializeJson(doc, payload, length);
                serializeJson(doc, Serial);
                String cmd = doc["cmd"].as<String>();
                if(cmd.equals("writeOut")) {
                    Serial.println("Set output level");
                    int pin = doc["pin"];
                    int level = doc["level"];
                    digitalWrite(pin, level);                       
                }
            }
            break;
        case WStype_BIN:
            break;
    }
}


void setup() {    
    for(int i=0; i<sizeof(inputs); i++)    
        pinMode(inputs[i], INPUT_PULLUP);
    for(int i=0; i<sizeof(outputs); i++)
        pinMode(outputs[i], OUTPUT);
  
    USE_SERIAL.begin(115200);
    USE_SERIAL.setDebugOutput(true);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      USE_SERIAL.print(".");
    }
    USE_SERIAL.println();
    
    // MDNS INIT
    if (MDNS.begin("mywebserver")) {
        MDNS.addService("http", "tcp", 80);
        USE_SERIAL.print(F("Open http://mywebserver.local/"));        
    }
  
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
    USE_SERIAL.print("\nConnected! IP address: ");
    USE_SERIAL.println(WiFi.localIP());

    server.on("/", HTTP_GET, handleHomePage);
    server.onNotFound(handleNotFound);
    server.begin();

    updateGpioList();
}

void loop() {
    webSocket.loop();
    server.handleClient();
    MDNS.update();
    
    static uint32_t blinkTime;    
    if(millis() - blinkTime > 1000) {
        blinkTime = millis();        
        digitalWrite(D3, !digitalRead(D3));
        updateGpioList();
    }
}
