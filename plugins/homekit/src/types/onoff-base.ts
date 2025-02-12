import { OnOff, ScryptedDevice, ScryptedInterface } from '@scrypted/sdk';
import { bindCharacteristic, DummyDevice, HomeKitSession } from '../common';
import { Accessory, Characteristic, CharacteristicEventTypes, CharacteristicSetCallback, CharacteristicValue, Service } from '../hap';
import { makeAccessory } from './common';

export function probe(device: DummyDevice): boolean {
    return device.interfaces.includes(ScryptedInterface.OnOff);
}

export function getAccessory(device: ScryptedDevice & OnOff, homekitSession: HomeKitSession, serviceType: any): { accessory: Accessory, service: Service } | undefined {
    const accessory = makeAccessory(device, homekitSession);

    const service = accessory.addService(serviceType, device.name);
    service.getCharacteristic(Characteristic.On)
        .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            callback();
            if (value)
                device.turnOn();
            else
                device.turnOff();
        })

    bindCharacteristic(device, ScryptedInterface.OnOff, service, Characteristic.On, () => !!device.on);

    return {
        accessory,
        service,
    };
}
