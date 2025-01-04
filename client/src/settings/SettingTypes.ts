import { SidebarNavigationPage } from '../components';

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

type MetaDataRecord<T, V> = Record<NonFunctionKeys<T, 'metadata'>|string, V>;

type NonFunctionKeys<T, M extends string> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof Omit<T, M>]

interface SettingsData<T> {
    metadata: MetaDataRecord<T, SettingMetadata>;
    save(): void;
    serialize(): string;
}

abstract class MillenniumModuleSettings<T extends object = any> implements SettingsData<T> {
    public metadata!: MetaDataRecord<T, SettingMetadata>;

    [key: string]: any;
    
    save(): void {
        console.error('Save not implemented. This should have been overridden by millennium.');
    }

    serialize(): string {
        return JSON.stringify(this, Object.keys(this.constructor.prototype));
    }
}

type TabMetadata = Omit<SidebarNavigationPage, 'content'>;

abstract class MillenniumSettingTabs<T extends object = any> {
    // @ts-ignore
    public metadata!: MetaDataRecord<T, TabMetadata>

    [key: string]: MillenniumModuleSettings;
}

export { SettingType, SettingMetadata, SettingsData, MillenniumModuleSettings, MillenniumSettingTabs, SliderOptions };
