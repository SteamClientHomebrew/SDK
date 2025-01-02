import { SettingsData, SettingType, SliderOptions } from './SettingTypes';

function resolveSettingType(type: any): SettingType {
    switch (type) {
        case Number:
            return SettingType.NumberInput;
        case String:
            return SettingType.TextInput;
        case Boolean:
            return SettingType.Toggle;
        default:
            return SettingType.Unknown;
    }
}

export function DefineSetting<T>(name: string, description: string|null, type: T) {
    return function (target: SettingsData<any>, propertyKey: string) {
        if (!target.metadata) {
            target.metadata = {};
        }

        target.metadata[propertyKey] = {
            name,
            description,
            type: resolveSettingType(type),
            options: {},
        };

        // Define getter function for backend
        const getterName = `get${propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)}`;
        if (!(getterName in target)) {
            Object.defineProperty(target, getterName, {
                value() {
                    return this[propertyKey];
                },
                configurable: true,
                enumerable: false,
                writable: true,
            });
        }

        // Define setter function for backend
        const setterName = `set${propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)}`;
        if (!(setterName in target)) {
            Object.defineProperty(target, setterName, {
                value(value: any) {
                    this[propertyKey] = value;
                },
                configurable: true,
                enumerable: false,
                writable: true,
            });
        }

        // Define actual setter that triggers a save on set
        Object.defineProperty(target, propertyKey, {
            set(value: any) {
                const calledFromConstructor = !this.hasOwnProperty(`#${propertyKey}`);
                this[`#${propertyKey}`] = value;

                if (!calledFromConstructor) {
                    target.save();
                }
            },
            get() {
                return this[`#${propertyKey}`];
            },
            configurable: true,
            enumerable: true,
        });
    };
}

export function SettingRange(options: SliderOptions) {
    return function (target: SettingsData<any>, propertyKey: string) {
        const metadata = target.metadata[propertyKey];
        metadata.options = {...metadata.options, ...options};
    };
}
