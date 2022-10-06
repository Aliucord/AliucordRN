import { versionCode } from "aliucord/version"
import React, { Component } from "react";
import { View, StyleSheet, Button, Alert } from "react-native";
export async function checkBundle() {
  const showAlert = () =>
    Alert.alert(
      "Restart Aliucord to continue",
      "Open app info and press force stop, then come back.",
      [
        {
          text: "OK",
        },
      ],
    );

  const updaterData = await fetch("https://raw.githubusercontent.com/Aliucord/AliucordRN/main/src/utils/data.json").then(r => r.json());
  updaterData.versionCode
  if (JSON.stringify(updaterData) === JSON.stringify(versionCode)) {
    await download("https://raw.githubusercontent.com/Aliucord/AliucordRN/builds/Aliucord.js.bundle", bundlePath);
    showAlert();
}
