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

interface SettingsData<T> {
    metadata: Record<keyof Omit<T, 'metadata' | 'serialize'>, SettingMetadata>;
    save(): void;
    serialize(): string;
}

abstract class MillenniumModuleSettings<T extends object = any> implements SettingsData<T> {
    public metadata!: Record<keyof Omit<T, 'metadata' | 'serialize'>, SettingMetadata>;

    save(): void {
        console.error('Save not implemented. This should have been overridden by millennium.');
    }

    serialize(): string {
        return JSON.stringify(this, Object.keys(this.constructor.prototype));
    }
}

export { SettingType, SettingMetadata, SettingsData, MillenniumModuleSettings, SliderOptions };
