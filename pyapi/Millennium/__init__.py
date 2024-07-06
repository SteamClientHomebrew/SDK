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
