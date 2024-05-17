# Millennium Plugin Components
[![Discord][discord-badge]][discord-link] [![Website][website-badge]][website-link] [![Docs][docs-badge]][docs-link]

[downloads-badge]: https://img.shields.io/github/downloads/shadowmonster99/millennium-steam-binaries/total?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjI1IDM4LjVIMzUuNzVDMzYuNzE2NSAzOC41IDM3LjUgMzkuMjgzNSAzNy41IDQwLjI1QzM3LjUgNDEuMTY4MiAzNi43OTI5IDQxLjkyMTIgMzUuODkzNSA0MS45OTQyTDM1Ljc1IDQySDEyLjI1QzExLjI4MzUgNDIgMTAuNSA0MS4yMTY1IDEwLjUgNDAuMjVDMTAuNSAzOS4zMzE4IDExLjIwNzEgMzguNTc4OCAxMi4xMDY1IDM4LjUwNThMMTIuMjUgMzguNUgzNS43NUgxMi4yNVpNMjMuNjA2NSA2LjI1NThMMjMuNzUgNi4yNUMyNC42NjgyIDYuMjUgMjUuNDIxMiA2Ljk1NzExIDI1LjQ5NDIgNy44NTY0N0wyNS41IDhWMjkuMzMzTDMwLjI5MzEgMjQuNTQwN0MzMC45NzY1IDIzLjg1NzMgMzIuMDg0NiAyMy44NTczIDMyLjc2OCAyNC41NDA3QzMzLjQ1MTQgMjUuMjI0MiAzMy40NTE0IDI2LjMzMjIgMzIuNzY4IDI3LjAxNTZMMjQuOTg5OCAzNC43OTM4QzI0LjMwNjQgMzUuNDc3MiAyMy4xOTg0IDM1LjQ3NzIgMjIuNTE1IDM0Ljc5MzhMMTQuNzM2OCAyNy4wMTU2QzE0LjA1MzQgMjYuMzMyMiAxNC4wNTM0IDI1LjIyNDIgMTQuNzM2OCAyNC41NDA3QzE1LjQyMDIgMjMuODU3MyAxNi41MjgyIDIzLjg1NzMgMTcuMjExNyAyNC41NDA3TDIyIDI5LjMyOVY4QzIyIDcuMDgxODMgMjIuNzA3MSA2LjMyODgxIDIzLjYwNjUgNi4yNTU4TDIzLjc1IDYuMjVMMjMuNjA2NSA2LjI1NThaIiBmaWxsPSIjM2E3MWMxIi8+Cjwvc3ZnPgo=
[downloads-link]: #automatic-installation-recommended

[discord-badge]: https://img.shields.io/badge/discord-green?labelColor=0c0d10&color=7289da&style=for-the-badge&logo=discord&logoColor=7289da
[discord-link]: https://millennium.web.app/discord

[website-badge]: https://img.shields.io/badge/website-green?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=firefoxbrowser&logoColor=3a71c1
[website-link]: https://millennium.web.app/

[docs-badge]: https://img.shields.io/badge/wiki-green?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=readthedocs&logoColor=3a71c1
[docs-link]: https://github.com/SteamClientHomebrew/Millennium/wiki

## Introduction

This library is used to develop plugins used for use with [Millennium](https://github.com/SteamClientHomebrew/Millennium).


This repository is a optimistic fork from [Decky Loader's](https://github.com/SteamDeckHomebrew/decky-loader) frontend library for developing plugins ([decky-frontend-lib](https://github.com/SteamDeckHomebrew/decky-frontend-lib)). Decky loader is a plugin loader for the Steam Deck similar to this project. Millennium's plugin loader portion was heavily inspired by decky, and it will hopefully serve to extend decky's existing library, and add functionality to portions of the Steam Client that weren't previously supported.

With that being said, any issues you encounter while developing should be fowarded here, and not the Decky developers.

## Developers and Contributors

This library is focused on usage by developers to provide custom React components based on those found in the Steam Client's React UI.  
This method allows developers to add UI elements and code without clobbering the existing UI of the client in order to do so.  
This library can also theoretically be used to extend existing UI elements of the Steam Client UI but this has not been tested extensively.

### Getting Started (Contributors)

1. Clone the repository to your preferred location
2. If you wish to add features such as new UI components, please create a feature branch to PR to the original repo.
3. Bug/hotfixes are acceptable on the main branch,

### Getting Started (Developers)

If you would like a feature added to library, please request it via a Github issue.  
