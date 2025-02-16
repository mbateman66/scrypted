import { StorageSettings } from "@scrypted/common/src/settings";
import { SettingsMixinDeviceBase } from "@scrypted/common/src/settings-mixin";
import sdk, { ScryptedInterface, SettingValue } from "@scrypted/sdk";
import crypto from 'crypto';
const { log } = sdk;

export const HOMEKIT_MIXIN = 'mixin:@scrypted/homekit';

export class HomekitMixin<T> extends SettingsMixinDeviceBase<T> {
    storageSettings = new StorageSettings(this, {
        resetAccessory: {
            title: 'Reset Pairing',
            description: 'Resetting the pairing will resync it to HomeKit as a new device. Bridged devices will automatically relink as a new device. Accessory devices must be manually removed from the Home app and re-paired. Enter RESET to reset the pairing.',
            placeholder: 'RESET',
            mapPut: (oldValue, newValue) => {
                if (newValue === 'RESET') {
                    this.storage.removeItem('mac');
                    this.alertReload();
                    // generate a new reset accessory random value.
                    return crypto.randomBytes(8).toString('hex');
                }
                throw new Error('HomeKit Accessory Reset cancelled.');
            },
            mapGet: () => '',
        },
        standalone: {
            title: 'Standalone Accessory',
            description: 'Experimental: Advertise this to HomeKit as a standalone accessory rather than through the Scrypted HomeKit bridge. Enabling this option will remove it from the bridge, and the accessory will then need to be re-paired to HomeKit.'
                + (this.interfaces.includes(ScryptedInterface.VideoCamera)
                    ? ' Cameras running in accessory mode with Rebroadcast Prebuffers will send a notification when the stream becomes unavailable.'
                    : ''),
            type: 'boolean',
            onPut: () => this.alertReload(),
        },
    });

    alertReload() {
        log.a(`You must reload the HomeKit plugin for the changes to ${this.name} to take effect.`);
    }

    async getMixinSettings() {
        return this.storageSettings.getSettings();
    }

    async putMixinSetting(key: string, value: SettingValue) {
        this.storageSettings.putSetting(key, value);
    }
}
