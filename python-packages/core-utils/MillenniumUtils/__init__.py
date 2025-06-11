
import json, os
import Millennium # type: ignore[import]
import builtins
import enum

config_path = os.path.join(os.getenv("MILLENNIUM__CONFIG_PATH"), "plugins.json")

def SetupConfig():
    if not os.path.exists(config_path):
        with open(config_path, 'w') as file:
            json.dump({}, file)
    
    # Check if the json is invalid format
    try:
        with open(config_path, 'r') as file:
            json.load(file)
    except json.JSONDecodeError:
        with open(config_path, 'w') as file:
            json.dump({}, file)

def GetPluginSettingsStore():
    SetupConfig()
    with open(config_path, 'r') as file:
        return json.load(file).get(MILLENNIUM_PLUGIN_SECRET_NAME, {})
    
def SetPluginSettingsStore(data):
    SetupConfig()
    with open(config_path, 'r') as file:
        all_data = json.load(file)
        
    all_data[MILLENNIUM_PLUGIN_SECRET_NAME] = data
    with open(config_path, 'w') as file:
        json.dump(all_data, file, indent=4)


class NumberSlider():
    def __init__(self, range, step=1):
        self.type = int
        self.range = range
        self.step = step

    def verify(self, value):
        return isinstance(value, self.type) and self.range[0] <= value <= self.range[1]


class FloatSlider():
    def __init__(self, range, step=1):
        self.type = float
        self.range = range
        self.step = step

    def verify(self, value):
        return isinstance(value, self.type) and self.range[0] <= value <= self.range[1]


class CheckBox:
    type = bool
    def __init__(self):
        pass 

    def verify(self, value):
        return isinstance(value, bool)


class DropDown:
    type = list
    def __init__(self, items):
        self.items = items

    def verify(self, value):
        return value in self.items


class NumberTextInput():
    def __init__(self, range):
        self.type = int
        self.range = range

    def verify(self, value):
        return isinstance(value, self.type) and self.range[0] <= self.value <= self.range[1]


class StringTextInput():
    def __init__(self):
        self.type = str

    def verify(self, value):
        return isinstance(value, self.type)


class FloatTextInput():
    def __init__(self, range):
        self.type = float
        self.range = range

    def verify(self, value):
        return isinstance(value, self.type) and self.range[0] <= self.value <= self.range[1]
    

def validateValue(typeInstance, settingName, value):
    if callable(typeInstance):
        isValid = typeInstance.verify(value)

        if not isValid:
            return False, (f"Invalid value for '{settingName}'. {typeInstance.__name__} expected type [{typeInstance.type.__name__}], but got [{type(value).__name__}]")
        
    elif type(typeInstance) == tuple:
        isValid = typeInstance[0].verify(*typeInstance[1])

        if not isValid:
            return False, (f"Invalid value for '{settingName}'. {typeInstance[0].__name__} expected ones of the items {typeInstance[1]}, but got [{value}]")
        
    return True, None


class Settings(type):
    def __init__(cls, name, bases, class_dict):
        super().__init__(name, bases, class_dict)
        # Automatically create an instance of the class
        cls._instance = cls()

        if "__millennium_plugin_settings_do_not_use__" not in __builtins__:
            __builtins__["__millennium_plugin_settings_do_not_use__"] = cls._instance
        else:
            raise Exception("Millennium only allows one instance of plugin settings.")

    def __get_raw__(self, name):
        return super().__getattribute__(name)

    def __getattribute__(self, name, *args, **kwargs):
        attributeValue = super().__getattribute__(name)
        returnValue = None
    
        if callable(attributeValue) and hasattr(attributeValue, '_metadata'):
            # Return a callable attribute (custom behavior for user-defined methods)
            returnValue = attributeValue(self)
        else: 
            returnValue = attributeValue

        return returnValue

    def __setattr__(self, targetKey, newValue):
        for settingName in dir(self):
            setting = super().__getattribute__(settingName)

            # If the attribute is a user-defined setting, just update its stored value as DefaultSettings.__call__ dynamically handles the rest
            if callable(setting) and settingName == targetKey and hasattr(setting, '_metadata'):
                isValid, errorMessage = validateValue(setting._metadata["instance"], setting._metadata["name"], newValue)

                if not isValid:
                    raise ValueError(errorMessage)

                settingsData = GetPluginSettingsStore()
                settingsData[targetKey] = newValue
                SetPluginSettingsStore(settingsData)
                return 

        return super().__setattr__(targetKey, newValue)


class CallbackLocation(enum.Enum):
    LOCAL = "local"
    EXTERNAL = "external"

class OnAfterChangeCallback:
    def __init__(self, func):
        self.func = func

    def __call__(self, *args, **kwargs):
        print("Before the function call")
        result = self.func(*args, **kwargs)
        print("After the function call")
        return result

class DefineSetting:
    def __init__(self, name, style, default, description=None, configurable=None, step=None, range=None):
        self.name = name
        self.desc = description or "No description yet."
        self.type = type(style)
        self.instance = style
        self.default = default
        self.configurable = configurable or True

    def _get_info(self):
        return (self.name, self.desc, self.type, self.range)

    def __call__(self, originalFn):

        def hookedFunction(_, *args, **kwargs): 

            settingsStore = GetPluginSettingsStore()
            settingData = settingsStore.get(originalFn.__name__) if originalFn.__name__ in settingsStore else self.default 
            isValid, errorMessage = validateValue(self.instance, self.name, settingData)

            if not isValid:
                raise ValueError(errorMessage)

            settingsStore[originalFn.__name__] = settingData
            
            try:
                import Millennium # type: ignore[import]
                settingType = self.type[0] if type(self.type) == tuple else self.type
                Millennium.call_frontend_method("__internal_on_plugin_settings_change__", params=[str(self.name), str(settingType), settingData])
            
            except (ConnectionError, RuntimeError) as error:
                pass # Happens if the frontend isn't loaded. In our case, this doesn't matter as if the frontend isn't loaded, we don't need to delegate the setting change. 

            SetPluginSettingsStore(settingsStore)
            return settingData
            
        hookedFunction._metadata = {
            "name": self.name,
            "desc": self.desc,
            "type": self.type,
            "default": self.default,
            "instance": self.instance,
            "configurable": self.configurable,
        }

        return hookedFunction
    



def UpdateSettingsValue(name, value):
    previousValue = getattr(__builtins__["__millennium_plugin_settings_do_not_use__"], name)()

    def InvokeOnCallback():
        pluginSettings = __builtins__["__millennium_plugin_settings_do_not_use__"]

        for func_name in dir(pluginSettings):
            func = getattr(pluginSettings, func_name)

            if func.__class__ == OnAfterChangeCallback:
                func(pluginSettings, name, value, previousValue, CallbackLocation.LOCAL)

    settingsStore = GetPluginSettingsStore()
    settingsStore[name] = value
    SetPluginSettingsStore(settingsStore)

    InvokeOnCallback()

builtins.__update_settings_value__ = UpdateSettingsValue
     
def ParsePluginSettings():

    settings = []
    settingsInstance = __builtins__["__millennium_plugin_settings_do_not_use__"]

    for attributeName in dir(settingsInstance):
        attribute = getattr(settingsInstance, attributeName)
        
        if callable(attribute) and hasattr(attribute, "_metadata"):
            setting = {
                "name": attribute._metadata["name"],
                "desc": attribute._metadata["desc"],
                "value": attribute(),
                "functionName": attributeName,
                "configurable": attribute._metadata["configurable"],
            }

            if issubclass(attribute._metadata["type"], DropDown):
                setting["options"] = attribute._metadata["instance"].items
                setting["type"] = attribute._metadata["type"].__name__

            elif issubclass(attribute._metadata["type"], (NumberTextInput, FloatTextInput)):
                setting["range"] = attribute._metadata["instance"].range
                setting["type"] = attribute._metadata["type"].__name__

            elif issubclass(attribute._metadata["type"], (NumberSlider, FloatSlider)):
                setting["range"] = attribute._metadata["instance"].range
                setting["type"] = attribute._metadata["type"].__name__
                setting["step"] = attribute._metadata["instance"].step
                
            else:
                setting["type"] = attribute._metadata["type"].__name__

            setting["defaultValue"] = attribute._metadata["default"]
            settings.append(setting)

    return json.dumps(settings)

builtins.__millennium_plugin_settings_parser__ = ParsePluginSettings