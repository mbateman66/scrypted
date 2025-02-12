import { Dock, ScryptedDevice, ScryptedDeviceType, ScryptedInterface, StartStop } from '@scrypted/sdk';
import { addSupportedType, bindCharacteristic, DummyDevice, HomeKitSession } from '../common';
import { Characteristic, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue, Service } from '../hap';
import { makeAccessory } from './common';

addSupportedType({
    type: ScryptedDeviceType.Vacuum,
    probe(device: DummyDevice): boolean {
        return device.interfaces.includes(ScryptedInterface.StartStop);
    },
    getAccessory: async (device: ScryptedDevice & StartStop & Dock, homekitSession: HomeKitSession) => {
        const accessory = makeAccessory(device, homekitSession);

        const service = accessory.addService(Service.Outlet, device.name);
        service.getCharacteristic(Characteristic.On)
        .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            callback();
            if (value)
                device.start();
            else if (device.interfaces.includes(ScryptedInterface.Dock))
                device.dock();
            else
                device.stop();
        });
        bindCharacteristic(device, ScryptedInterface.StartStop, service, Characteristic.On, () =>  !!device.running);

        return accessory;
    }
});
