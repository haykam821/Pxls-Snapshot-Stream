# Pxls Snapshot Stream

A simple tool to get a stream for the current canvas on [pxls.space](https://pxls.space/).

## Installation

Install it from NPM:

    npm install pxls-snapshot-stream

## Usage

The module returns a PNG stream, which you can pipe to a writeable stream with `fs`:

```js
const pss = require("pxls-snapshot-stream");

const fs = require("fs");
const streamOut = fs.createWriteStream("./image.png");

pss().pipe(streamOut);
```