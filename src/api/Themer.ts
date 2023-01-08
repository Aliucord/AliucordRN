/* eslint-disable indent */
import { Theme } from "../entities";
import { Dialog, ReactNative, Toasts } from "../metro";
import { invalidThemes, ThemeErrors, themeState } from "../themer/themerInit";
import { Logger } from "../utils";

const logger = new Logger("Themer");

export function setTheme(theme: Theme | null) {
    if (!theme) {
        window.Aliucord.settings.delete("theme");
    } else {
        window.Aliucord.settings.set("theme", theme.name);
    }

    Dialog.show({
        title: "Restart to apply",
        body: `Restart is required to apply the ${theme ? "new" : "default"} theme.`,
        confirmText: "Restart",
        isDismissable: false,
        onConfirm: ReactNative.NativeModules.BundleUpdaterManager.reload
    });
}

export function onStartup() {
    if (themeState.isApplied) {
        logger.info("Theme is sucessfully applied");
    }

    if (themeState.applyFailed) {
        logger.error("Theme failed to apply: " + themeState.reason ?? "Unknown reason");
        handleErrors();

        themeState.errorArgs?.forEach((arg) => {
            logger.error(arg);
        });
        return;
    }

    if (invalidThemes.duplicatedThemes.length) {
        for (const theme of invalidThemes.duplicatedThemes) {
            logger.warn(`Theme duplicate: ${theme} already existed.`);
            Toasts.open({ content: "Duplicated themes found, check log." });
        }
    }

    if (invalidThemes.invalidThemes.length) {
        for (const theme of invalidThemes.invalidThemes) {
            logger.error(`The theme "${theme}" is invalid.`);
            Toasts.open({ content: `Invalid theme(s): ${theme}` });
        }
    }

    logger.info(themeState);
}

function handleErrors() {
    switch (themeState.reason) {
        case ThemeErrors.UNKNOWN_THEME:
            showFailDialog(`An unknown theme was applied: ${themeState.currentTheme}.\nFalling back to default...`);
            window.Aliucord.settings.delete("theme");
            break;
        case ThemeErrors.UNEXPECTED_ERROR:
            showFailDialog(
                `An unexpected error occurred: ${themeState.errorArgs?.[0]?.message ?? "¯\\_(ツ)_/¯"}.\n`
                + "Falling back to default theme..."
            );
            window.Aliucord.settings.delete("theme");
            break;
    }
}

function showFailDialog(message: string) {
    Dialog.show({
        title: "Failed to apply theme",
        body: message,
        confirmText: "OK"
    });
}

