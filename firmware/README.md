# Hive Firmware

Fork of https://github.com/78/xiaozhi-esp32

## Setup

```bash
git clone https://github.com/78/xiaozhi-esp32 hive-esp32-firmware
cd hive-esp32-firmware
```

Then apply the patches in `patches/` or make the changes below manually.

## Required Changes

### sdkconfig.defaults.esp32s3

```
CONFIG_XIAOZHI_SERVER_URL="wss://api.wifiwatch.net/ws"
CONFIG_OTA_SERVER_URL="https://api.wifiwatch.net/ota/latest"
CONFIG_BOARD_TYPE_LAFVIN_AICHATBOT=y
CONFIG_DEFAULT_LANGUAGE_EN=y
CONFIG_SR_WN_WN9_HIJASON_TTS2=y
```

## Build

Requires ESP-IDF v5.5.x

```bash
idf.py set-target esp32s3
idf.py build
idf.py -p /dev/ttyUSB0 flash
```

## Merged Binary (for web flasher)

```bash
esptool.py --chip esp32s3 merge_bin -o hive-merged.bin \
  --flash_mode dio --flash_size 16MB \
  0x0 build/bootloader/bootloader.bin \
  0x8000 build/partition_table/partition-table.bin \
  0x10000 build/xiaozhi.bin
```

Upload `hive-merged.bin` to the backend via POST /ota/upload with `set_latest=true`.
