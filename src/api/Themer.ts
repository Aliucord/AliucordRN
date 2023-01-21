/* eslint-disable indent */
import { Theme } from "../entities";
import { Dialog, ReactNative, Toasts } from "../metro";
import { excludedThemes, ThemeErrors, themeState } from "../themerInit";
import { getAssetId, Logger } from "../utils";

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
        logger.info("Theme has been successfully applied");
    } else if (themeState.anError) {
        logger.error("Failed to apply theme: " + themeState.reason ?? "Unknown reason");
        handleErrors();

        themeState.errorArgs?.forEach((arg) => {
            logger.error(arg);
        });
        return;
    } else if (themeState.reason) {
        logger.info("Theme was not applied: " + themeState.reason);
    }

    for (const theme of excludedThemes.invalidThemes) {
        logger.error(`The theme "${theme.name}" is invalid: ${theme.reason}`);
        Toasts.open({ content: `Invalid theme(s): ${theme.name}, check theme settings.`, source: getAssetId("Small") });
    }

    for (const theme of excludedThemes.duplicatedThemes) {
        logger.warn(`A theme named "${theme}" already existed.`);
        Toasts.open({ content: "Duplicated themes found, check theme settings.", source: getAssetId("Small") });
    }

    logger.info(themeState);
}

function handleErrors() {
    if (themeState.isApplied) return;

    switch (themeState.reason) {
        case ThemeErrors.UNKNOWN_THEME:
            showFailDialog(`An unknown theme was applied: ${themeState.currentTheme}.\nFalling back to default theme...`);
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

