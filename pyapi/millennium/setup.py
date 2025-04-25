import json
from setuptools import setup, find_packages

with open('../package.json', 'r') as f:
    package_info = json.load(f)

setup(
    name='millennium',
    version=package_info.get('version'),
    author='Steam Client Homebrew',
    description='A support library for creating plugins with Millennium.',
    long_description=open('../README.md').read(),
    long_description_content_type='text/markdown',
    url='https://github.com/SteamClientHomebrew/PluginComponents',
    packages=find_packages(),
    classifiers=[
        'Intended Audience :: Developers',
        'License :: OSI Approved :: GNU Lesser General Public License v2 or later (LGPLv2+)',
        'Programming Language :: Python :: 3.11',
    ],
    python_requires='>=3.11.8'
)