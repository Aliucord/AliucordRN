# Aliucord React Native

Aliucord Rewrite for the new Discord React Native alpha. Unfinished for now, 
you should probably not install this if you don't know what you're doing.

## Build

```sh
pnpm build
```

## Install

Kinda inconvenient for now, will be improved in the future

1) Install and enable the [Xposed Module](https://github.com/Aliucord/AliucordXposed/releases/download/1.0.0/aliuxposed.apk). Make sure you check Discord in application list
2) Host the build on localhost:3000/Aliucord.js on your phone
   For example via Termux:
   ```sh
   # on PC 
   adb push dist/Aliucord.js /sdcard

   # in Termux
   mkdir ajs
   cd ajs
   mv /sdcard/Aliucord.js .
   python -m http.server 3000
   ```