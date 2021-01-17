#include "esp_log.h"
//Display
#include <TFT_eSPI.h>
#include <SPI.h>
TFT_eSPI tft = TFT_eSPI();

//A2DP
#include <BluetoothA2DPSink.h>
#include <SoundData.h>
BluetoothA2DPSink a2dp_receiver;

//AVRCP
#include "esp_avrc_api.h"

//Touch Controls
int pressedBtnId;
bool isButtonPressed = false;
int playBtnId = 12;
int nextBtnId = 14;
int prevBtnId = 27;
int highThreshold = 30;

//Metadata
char title[264];
char artist[264];
char album[264];


void setup() {
  Serial.begin(115200);
  Serial.println("Starting Prototype1!");

  //initialize Display
  tft.init();
  tft.setRotation(1);

  //initialize AVRCP controller
  //According to documentation it is necessary to initialize AVRC before A2DP
  esp_avrc_ct_init();

  //Initialize A2DP Receiver/Sink
  a2dp_receiver.start("CarMusic");
  //Includes sending received data to standard I2S pins:
  //bck_io_num = GPIO26
  //ws_io_num = GPIO25
  //data_out_num = GPIO22

  esp_avrc_ct_register_callback(manageEvent);
}

void manageEvent(esp_avrc_ct_cb_event_t event, esp_avrc_ct_cb_param_t *param) {
  switch (event) {
    case ESP_AVRC_CT_METADATA_RSP_EVT:
          Serial.println("METADATA_RSP_EVT");
          InitMetadata(param);
          break;
    case ESP_AVRC_CT_CONNECTION_STATE_EVT:
          Serial.println("CONNECTION_STATE_EVT");
          esp_avrc_ct_send_register_notification_cmd(2,ESP_AVRC_RN_PLAY_STATUS_CHANGE,0);
          //Fall through...
    case ESP_AVRC_CT_PASSTHROUGH_RSP_EVT:
          Serial.println("PASSTHROUGH_RSP_EVT");
    case ESP_AVRC_CT_PLAY_STATUS_RSP_EVT :
          Serial.println("PLAY_STATUS_RSP_EVT");
    case ESP_AVRC_CT_CHANGE_NOTIFY_EVT :
          Serial.println("CHANGE_NOTIFY_EVT");   
          CheckNotifyEvent(param);
    case ESP_AVRC_CT_REMOTE_FEATURES_EVT: 
          Serial.println("REMOTE_FEATURES_EVT");     
    default:
          ESP_LOGE(BT_RC_CT_TAG, "Invalid AVRC event: %d", event);
      break;
  }
}


void CheckNotifyEvent(esp_avrc_ct_cb_param_t *param) {
  esp_avrc_ct_cb_param_t *rc = (esp_avrc_ct_cb_param_t *)(param);
    
  switch (rc->change_ntf.event_id) {
    case ESP_AVRC_RN_PLAY_STATUS_CHANGE:
          Serial.println("PLAY_STATUS_CHANGE");
          RequestMetadata(); 
          break;
    case ESP_AVRC_RN_TRACK_CHANGE:
          Serial.println("TRACK_CHANGE");
          break;
    case ESP_AVRC_RN_TRACK_REACHED_END:
          Serial.println("TRACK_REACHED_END");
          break;
    case ESP_AVRC_RN_TRACK_REACHED_START :
          Serial.println("TRACK_REACHED_START");
          break;
    case ESP_AVRC_RN_SYSTEM_STATUS_CHANGE :
          Serial.println("SYSTEM_STATUS_CHANGE");  
          break;        
    case ESP_AVRC_RN_APP_SETTING_CHANGE:
          Serial.println("SETTING_CHANGE");
          break;
    default:
          Serial.println("Notify Default");
          break; 
  }
}

void InitMetadata(esp_avrc_ct_cb_param_t *param)
{
  esp_avrc_ct_cb_param_t *rc = (esp_avrc_ct_cb_param_t *)(param);

  switch (rc->meta_rsp.attr_id) {
    case ESP_AVRC_MD_ATTR_TITLE:
          Serial.println("Title");
          sprintf(title, "%s", rc->meta_rsp.attr_text);
          Serial.println(title);
          break;
    case ESP_AVRC_MD_ATTR_ARTIST:
          Serial.println("Artist");
          sprintf(artist, "%s", rc->meta_rsp.attr_text);
          Serial.println(artist);
          break;
    case ESP_AVRC_MD_ATTR_ALBUM:
          Serial.println("Album");
          sprintf(album, "%s", rc->meta_rsp.attr_text);
          Serial.println(album);
          DrawDisplay();
          break;
    case ESP_AVRC_MD_ATTR_TRACK_NUM :
          Serial.println("Track Num");
          break;
    case ESP_AVRC_MD_ATTR_NUM_TRACKS :
          Serial.println("Num of tracks");  
          break;        
    case ESP_AVRC_MD_ATTR_GENRE:
          Serial.println("Genre");
          break;
    case ESP_AVRC_MD_ATTR_PLAYING_TIME: 
          Serial.println("Playing Time");
          break;
    default:
          Serial.println("Default");
          break; 
  }
}

void RequestMetadata() {
  delay(300);
  esp_avrc_ct_send_metadata_cmd(0, ESP_AVRC_MD_ATTR_TITLE | ESP_AVRC_MD_ATTR_ARTIST | ESP_AVRC_MD_ATTR_ALBUM | ESP_AVRC_MD_ATTR_GENRE); 
}

void loop() {

  int a = touchRead(playBtnId);
  int b = touchRead(nextBtnId);
  int c = touchRead(prevBtnId);

  if (a < highThreshold && a == touchRead(playBtnId)) {
    HoldButton(playBtnId);
  }
  else if (b < highThreshold && b == touchRead(nextBtnId)) {
    HoldButton(nextBtnId);
  }
  else if (c < highThreshold && c == touchRead(prevBtnId)) {
    HoldButton(prevBtnId);
  }
  else if (isButtonPressed == true && touchRead(pressedBtnId) > highThreshold) {
    Serial.println("Released");
    isButtonPressed = false;
  } 
  delay(100);
}

void DrawDisplay() {
  tft.setTextFont(2);
  tft.fillScreen(TFT_BLACK);
  tft.setCursor(0, 0, 2);
  tft.setTextColor(TFT_WHITE,TFT_BLACK);  
  tft.setTextSize(3);
  tft.println(title);
  tft.setTextSize(2);
  tft.println(artist);
  tft.setTextSize(2);
  tft.println(album);
}


void HoldButton(int _pinID) {
  if (isButtonPressed == false) {
    Serial.println("Pressed");
    isButtonPressed = true;
    pressedBtnId = _pinID;
    ExecuteBtnAction(_pinID);
  }
}

void ExecuteBtnAction(int _pinID) {
  if (playBtnId == _pinID) {
    //Serial.println(esp_avrc_ct_send_register_notification_cmd(1,ESP_AVRC_RN_TRACK_CHANGE,3 ));
    if (a2dp_receiver.get_audio_state() == 0) {
      //a2dp_receiver.get_audio_state used to check for active playback in order to correctly
      //synchronize play and stop commands. So if a song is already playing upon connection, we
      //dont accidentally send the play command again
      //Disadvantage: Has slight delay in terms of when a song stopps playing
      Serial.println("Sending Play Key...");
      esp_avrc_ct_send_passthrough_cmd(1, ESP_AVRC_PT_CMD_PLAY, ESP_AVRC_PT_CMD_STATE_PRESSED);
    }
    else {
      Serial.println("Sending Stop Key...");
      esp_avrc_ct_send_passthrough_cmd(1, ESP_AVRC_PT_CMD_STOP, ESP_AVRC_PT_CMD_STATE_PRESSED);
    }
  }
  else if (nextBtnId == _pinID) {
    Serial.println("Sending Next Song Key...");
    esp_avrc_ct_send_passthrough_cmd(1, ESP_AVRC_PT_CMD_FORWARD, ESP_AVRC_PT_CMD_STATE_PRESSED);
  }
  else if (prevBtnId == _pinID) {
    Serial.println("Sending Previous Song Key...");
    esp_avrc_ct_send_passthrough_cmd(1, ESP_AVRC_PT_CMD_BACKWARD, ESP_AVRC_PT_CMD_STATE_PRESSED);
  }
}
