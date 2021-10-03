# rbx-physics
Roblox physics playground made with roblox-ts, rbxts-knit and more.
This repository makes use of tags with Knit (see https://developer.roblox.com/en-us/api-reference/class/CollectionService).
Tags are useful for binding object related scripts (mainly physics for Parts in this case).

## Installation
### Prerequisites
* Rojo (see https://rojo.space/) for Roblox Studio and editor
* An editor (Visual Studio Code for instance)
* Foreman CLI (see https://github.com/Roblox/foreman)

### Setup
1. Clone the repository
2. Open a terminal in the project
3. Install the node modules with `npm install` or `yarn` if you prefer to use yarn
4. Install Foreman dependencies with `foreman install`

### Development
1. Run the roblox-ts compiler with `rbxtsc -w`
2. Run Rojo with `rojo serve`
3. Open a project in Roblox Studio
3. Start Rojo in Roblox Studio

## Demo
There is a demo place here: https://www.roblox.com/games/7512716569/Physics-Playground.
It showcases a rocket that has a low tensile strength and an airplane that drops into the void.
