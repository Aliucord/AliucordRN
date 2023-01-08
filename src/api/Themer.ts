/* eslint-disable indent */
import { Theme } from "../entities";
import { Dialog, ReactNative, Toasts } from "../metro";
import { ThemeErrors, ThemeState } from "../theme-init";
import { Logger } from "../utils";

const logger = new Logger("Themer");

export function setTheme(theme: Theme | null) {
    if (!theme) {
        window.Aliucord.settings.delete("theme");
    } else {
        window.Aliucord.settings.set("theme", theme.name);
    }

    Dialog.show({
        title: "Theme changed",
        body: "Restart Aliucord to apply the new theme.",
        confirmText: "OK",
        isDismissable: false,
        onConfirm: ReactNative.NativeModules.BundleUpdaterManager.reload
    });
}

export function onStartup() {
    if (ThemeState.isApplied) {
        logger.info("Theme is sucessfully applied");
    }

    if (ThemeState.applyFailed) {
        logger.error("Theme failed to apply: " + ThemeState.reason ?? "Unknown reason");
        handleErrors();

        ThemeState.errorArgs?.forEach((arg) => {
            logger.error(arg);
        });
        return;
    }

    if (ThemeState.duplicatedThemes?.length) {
        for (const theme of ThemeState.duplicatedThemes) {
            logger.warn("Duplicated themes found, check the log");
            Toasts.open({ content: `Duplicated theme: ${theme}` });
        }
    }

    if (ThemeState.invalidThemes?.length) {
        for (const theme of ThemeState.invalidThemes) {
            logger.warn("Invalid theme(s) found, check the log");
            Toasts.open({ content: `Invalid theme: ${theme}` });
        }
    }

    logger.info(ThemeState);
}

function handleErrors() {
    switch (ThemeState.reason) {
        case ThemeErrors.UNKNOWN_THEME:
            showFailDialog(`An unknown theme was applied: ${ThemeState.currentTheme}.\nFalling back to default...`);
            window.Aliucord.settings.delete("theme");
            break;
        case ThemeErrors.UNEXPECTED_ERROR:
            showFailDialog(
                `An unexpected error occurred: ${ThemeState.errorArgs?.[0]?.message ?? "¯\\_(ツ)_/¯"}.\n`
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

