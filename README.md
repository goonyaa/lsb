# lsb

lsb stands for "live stream browser"

Based on [this gist](https://gist.github.com/goonyaa/4c0bd377e43c0905039e).

After using [livestreamer](http://docs.livestreamer.io/) I've become a bit lazy to open browser and look at [twitch.tv](http://www.twitch.tv) for stream to watch, then past stream link to console to open it. And somehow
inspired by [this module](https://github.com/elzii/twitch-cli) I built a simple cli python app with [click](http://click.pocoo.org) that will load top twitch streams to allow easily run them in livestreamer.

## Possible dependencies

```pip install click```

```pip install livestreamer``` it's pointless to use this script without livestreamer
