enum SettingType {
    Unknown = 'Unknown',
    NumberInput = 'NumberInput',
    TextInput = 'TextInput',
    Dropdown = 'Dropdown',
    Toggle = 'Toggle',
    Slider = 'Slider',
    Color = 'Color'
}

type SliderOptions = {
    min: number;
    max: number;
}

type SettingMetadata = {
    name: string;
    description: string | null;
    type: SettingType;
    options: Partial<SliderOptions>;
}

type MetaDataRecord<T> = Record<NonFunctionKeys<T, 'metadata'>|string, SettingMetadata>;

type NonFunctionKeys<T, M extends string> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof Omit<T, M>]

interface SettingsData<T> {
    metadata: MetaDataRecord<T>;
    save(): void;
    serialize(): string;
}

abstract class MillenniumModuleSettings<T extends object = any> implements SettingsData<T> {
    public metadata!: MetaDataRecord<T>;

    save(): void {
        console.error('Save not implemented. This should have been overridden by millennium.');
    }

    serialize(): string {
        return JSON.stringify(this, Object.keys(this.constructor.prototype));
    }
}

export { SettingType, SettingMetadata, SettingsData, MillenniumModuleSettings, SliderOptions };
