
// Library
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// Allocate the JSON document
//
// Inside the brackets, 200 is the capacity of the memory pool in bytes.
// Don't forget to change this value to match your JSON document.
// Use arduinojson.org/v6/assistant to compute the capacity.
StaticJsonDocument<200> doc;

// Your WiFi credentials.
// Set password to "" for open networks.
const char* ssid = "VM2753751_EXT";
const char* password = "Kn6pksyx4Kym";
// const char* ssid = "BTHub6-QT2N";
// const char* password = "4hfLFWqFAFn9";


// HTTP Request details
//Your Domain name with URL path or IP address with path
String serverName = "https://jsr5lmq5mbecclc5pvxugxafwe0zxbsi.lambda-url.eu-central-1.on.aws/";
// the following variables are unsigned longs because the time, measured in
// milliseconds, will quickly become a bigger number than can be stored in an int.
unsigned long lastTime = 0;
// Timer set to 10 minutes (600000)
//unsigned long timerDelay = 600000;
// Set timer to 5 seconds (5000)
unsigned long timerDelay = 5000;

int color;
int days;


////////
// Seven segment LED display
int a = 12;
int b = 14;
int c = 4;
int d = 15;
int e = 2;
int f = 13;
int g = 0;
//display number 1
void display1(void) {
  digitalWrite(b, HIGH);
  digitalWrite(c, HIGH);
}
//display number2
void display2(void) {
  digitalWrite(a, HIGH);
  digitalWrite(b, HIGH);
  digitalWrite(g, HIGH);
  digitalWrite(e, HIGH);
  digitalWrite(d, HIGH);
}
// display number3
void display3(void) {
  digitalWrite(a, HIGH);
  digitalWrite(b, HIGH);
  digitalWrite(c, HIGH);
  digitalWrite(d, HIGH);
  digitalWrite(g, HIGH);
}
// display number4
void display4(void) {
  digitalWrite(f, HIGH);
  digitalWrite(b, HIGH);
  digitalWrite(g, HIGH);
  digitalWrite(c, HIGH);
}
// display number5
void display5(void) {
  digitalWrite(a, HIGH);
  digitalWrite(f, HIGH);
  digitalWrite(g, HIGH);
  digitalWrite(c, HIGH);
  digitalWrite(d, HIGH);
}
// display number6
void display6(void) {
  digitalWrite(a, HIGH);
  digitalWrite(f, HIGH);
  digitalWrite(g, HIGH);
  digitalWrite(c, HIGH);
  digitalWrite(d, HIGH);
  digitalWrite(e, HIGH);
}
// display number7
void display7(void) {
  digitalWrite(a, HIGH);
  digitalWrite(b, HIGH);
  digitalWrite(c, HIGH);
}
// display number8
void display8(void) {
  digitalWrite(a, HIGH);
  digitalWrite(b, HIGH);
  digitalWrite(g, HIGH);
  digitalWrite(c, HIGH);
  digitalWrite(d, HIGH);
  digitalWrite(e, HIGH);
  digitalWrite(f, HIGH);
}
void clearDisplay(void) {
  digitalWrite(a, LOW);
  digitalWrite(b, LOW);
  digitalWrite(g, LOW);
  digitalWrite(c, LOW);
  digitalWrite(d, LOW);
  digitalWrite(e, LOW);
  digitalWrite(f, LOW);
}
void display9(void) {
  digitalWrite(a, HIGH);
  digitalWrite(b, HIGH);
  digitalWrite(g, HIGH);
  digitalWrite(c, HIGH);
  digitalWrite(d, HIGH);
  digitalWrite(f, HIGH);
}
void display0(void) {
  digitalWrite(a, HIGH);
  digitalWrite(b, HIGH);
  digitalWrite(c, HIGH);
  digitalWrite(d, HIGH);
  digitalWrite(e, HIGH);
  digitalWrite(f, HIGH);
}


///////////

// Define pins 5,4 14, 12, 13, 0, 2, 15
int red = 16;
int green = 5;

void setup() {
  // Start the Serial communication to send messages to the computer
  Serial.begin(115200);
  delay(10);
  Serial.println('\n');

  pinMode(a, OUTPUT);
  pinMode(b, OUTPUT);
  pinMode(c, OUTPUT);
  pinMode(d, OUTPUT);
  pinMode(e, OUTPUT);
  pinMode(f, OUTPUT);
  pinMode(g, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(red, OUTPUT);
  digitalWrite(a, LOW);
  digitalWrite(b, LOW);
  digitalWrite(c, LOW);
  digitalWrite(d, LOW);
  digitalWrite(e, LOW);
  digitalWrite(f, LOW);
  digitalWrite(g, LOW);
  digitalWrite(green, LOW);
  digitalWrite(red, LOW);
  return;
}

// Update the color and days via API
void updateData() {
  WiFi.begin(ssid, password);  // Connect to the network
  Serial.print("Connecting to ");
  Serial.print(ssid);
  Serial.println(" ...");

  int i = 0;
  while (WiFi.status() != WL_CONNECTED) {  // Wait for the Wi-Fi to connect
    delay(1000);
    Serial.print(++i);
    Serial.print(' ');
  }

  Serial.println('\n');
  Serial.println("Connection established!");
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  String serverPath = serverName;

  // Your Domain name with URL path or IP address with path
  http.begin(client, serverPath.c_str());

  // Send HTTP GET request
  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    String payload = http.getString();
    Serial.println(payload);
    // Deserialize the JSON document
    DeserializationError error = deserializeJson(doc, payload);

    // Test if parsing succeeds.
    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
      return;
    }

    // Fetch values.
    //
    // Most of the time, you can rely on the implicit casts.
    // In other case, you can do doc["time"].as<long>();
    color = doc["color"];
    days = doc["days"];

    // Print values.
    Serial.println(color);
    Serial.println(days);

    // Free resources
    Serial.println("End http");
    Serial.println("End WiFi");
    http.end();
    WiFi.disconnect();
    return;

  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  Serial.println("End http");
  Serial.println("End WiFi");
  http.end();
  WiFi.disconnect();
  return;
}

void loop() {
  // put your main code here, to run repeatedly:
  Serial.println("Now in Loop");

  delay(1000);

  Serial.println("Updating color and day via API...");
  updateData();

  Serial.println(color);
  Serial.println(days);
  clearDisplay();
  switch (days) {
    case 0: display0(); break;
    case 1: display1(); break;
    case 2: display2(); break;
    case 3: display3(); break;
    case 4: display4(); break;
    case 5: display5(); break;
    case 6: display6(); break;
    case 7: display7(); break;
    case 8: display8(); break;
    case 9: display9(); break;
    default: display9(); break;
  }

  Serial.println("Now sleep for 2 hours before repeating...");
  delay(1000 * 60 * 60 * 2);
}