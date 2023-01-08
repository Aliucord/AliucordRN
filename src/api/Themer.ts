/* eslint-disable indent */
import { Dialog } from "../metro";
import { ThemeErrors, ThemeState } from "../theme-init";
import { Logger } from "../utils";

const logger = new Logger("Themer");

export function onStartup() {
    if (ThemeState.isApplied) {
        logger.info("Theme is sucessfully applied");
        return;
    }

    if (ThemeState.applyFailed) {
        logger.error("Theme failed to apply: " + ThemeState.reason ?? "Unknown reason");
        handleErrors();

        ThemeState.errorArgs?.forEach((arg) => {
            logger.error(arg);
        });
        return;
    }

    logger.info(ThemeState);
}

function handleErrors() {
    switch (ThemeState.reason) {
        case ThemeErrors.UNKNOWN_THEME:
            showDialog(`An unknown theme was applied: ${ThemeState.currentTheme}.\nFalling back to default...`);
            window.Aliucord.settings.delete("theme");
            break;
        case ThemeErrors.UNEXPECTED_ERROR:
            showDialog(
                `An unexpected error occurred: ${ThemeState.errorArgs?.[0]?.message ?? "¯\\_(ツ)_/¯"}.\n`
                + "Falling back to default theme..."
            );
            window.Aliucord.settings.delete("theme");
            break;
    }
}

function showDialog(message: string, restart = false) {
    Dialog.show({
        title: "Failed to apply theme",
        body: message,
        confirmText: "OK"
    });
}

