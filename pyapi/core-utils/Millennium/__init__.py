from typing import Union

def ready() -> bool: pass
def get_user_settings() -> dict: pass
def set_user_settings_key(key: str, value: str) -> None: pass
def version() -> str: pass
def steam_path() -> str: pass
def add_browser_css(css_relative_path: str) -> int: pass
def add_browser_js(js_relative_path: str) -> int: pass
def remove_browser_module(id: int) -> None: pass
def call_frontend_method(method_name: str, params: Union[str, int, bool]): pass

import json, os

def __get_plugin_settings_store__():

    if not os.path.exists('settings.json'):
        with open('settings.json', 'w') as file:
            json.dump({}, file)

    with open('settings.json', 'r') as file:
        return json.load(file)
    
def __set_plugin_settings_store__(data):
    with open('settings.json', 'w') as file:
        json.dump(data, file, indent=4)


class CheckBox:
    type = bool
    def __init__(self, checked):
        self.checked = checked

    def verify(self):
        return isinstance(self.checked, bool)


class DropDown:
    type = list
    def __init__(self, selected):
        self.selected = selected

    @classmethod
    def __class_getitem__(cls, params):
        return (cls, list(params.__args__))
    
    def verify(self, *args, **kwds):
        return self.selected in args


class TextInput:
    type = str
    def __init__(self, value, type):
        self.value = value
        self.type = type

    def verify(self):
        return isinstance(self.value, self.type)
    

class NumberTextInput(TextInput):
    type = int
    def __init__(self, value):
        super().__init__(value, NumberTextInput.type)


class StringTextInput(TextInput):
    type = str
    def __init__(self, value):
        super().__init__(value, StringTextInput.type)


class FloatTextInput(TextInput):
    type = float
    def __init__(self, value):
        super().__init__(value, FloatTextInput.type)


def __validate_value__(__type__, _type_name, _new_value_):
    if callable(__type__):
        _is_value_valid_ = __type__(_new_value_).verify()

        if not _is_value_valid_:
            return False, (f"Invalid value for '{_type_name}'. {__type__.__name__} expected type [{__type__.type.__name__}], but got [{type(_new_value_).__name__}]")
        
    elif type(__type__) == tuple:
        _is_value_valid_ = __type__[0](_new_value_).verify(*__type__[1])

        if not _is_value_valid_:
            return False, (f"Invalid value for '{_type_name}'. {__type__[0].__name__} expected ones of the items {__type__[1]}, but got [{_new_value_}]")
        
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


    def __getattribute__(self, name, *args, **kwargs):
        __attr_value__ = super().__getattribute__(name)
    
        if callable(__attr_value__) and hasattr(__attr_value__, '_metadata'):
            # Return a callable attribute (custom behavior for user-defined methods)
            return __attr_value__(self)
        
        return __attr_value__

    
    def __setattr__(self, _target_, _new_value_):

        for __attribute_name__ in dir(self):
            __attribute_ptr__ = super().__getattribute__(__attribute_name__)

            # If the attribute is a user-defined setting, just update its stored value as DefaultSettings.__call__ dynamically handles the rest
            if callable(__attribute_ptr__) and __attribute_name__ == _target_ and hasattr(__attribute_ptr__, '_metadata'):
                _success, _msg = __validate_value__(__attribute_ptr__._metadata["type"], __attribute_ptr__._metadata["name"], _new_value_)

                if not _success:
                    raise ValueError(_msg)

                _settings_data_ = __get_plugin_settings_store__()
                _settings_data_[_target_] = _new_value_
                __set_plugin_settings_store__(_settings_data_)
                return 

        return super().__setattr__(_target_, _new_value_)


class DefineSetting:
    def __init__(self, name, description, style):
        self.name = name
        self.desc = description
        self.type = style

    def _get_info(self):
        return (self.name, self.desc, self.type)

    def __call__(self, __orig_fn__):

        def __hooked_call__(_, *args, **kwargs): 

            _settings_data_  = __get_plugin_settings_store__()
            __hooked_value__ = _settings_data_.get(__orig_fn__.__name__) if __orig_fn__.__name__ in _settings_data_ else __orig_fn__(self, *args, **kwargs)
            _success, _msg   = __validate_value__(self.type, self.name, __hooked_value__)

            if not _success:
                raise ValueError(_msg)

            return __hooked_value__
            
        __hooked_call__._metadata = {
            "name": self.name,
            "desc": self.desc,
            "type": self.type
        }

        return __hooked_call__
    
exec('''
def __millennium_plugin_settings_parser__():
    settings = []
    __instance__ = __builtins__.__millennium_plugin_settings_do_not_use__
    for attr_name in dir(__instance__):
        attr = getattr(__instance__, attr_name)
        if callable(attr) and hasattr(attr, "_metadata"):
            setting = {
                "name": attr._metadata["name"],
                "desc": attr._metadata["desc"],
                "value": attr()
            }
            if isinstance(attr._metadata["type"], tuple) and issubclass(attr._metadata["type"][0], DropDown):
                setting["options"] = attr._metadata["type"][1]
                setting["type"] = attr._metadata["type"][0].__name__
            else:
                setting["type"] = attr._metadata["type"].__name__
            settings.append(setting)
    return settings
''', globals())

__builtins__["__millennium_plugin_settings_parser__"] = globals()["__millennium_plugin_settings_parser__"]
del globals()["__millennium_plugin_settings_parser__"]



