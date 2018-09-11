const Canvas = require("canvas");
const req = require("request-promise");
const debug = require("debug");

function paletteColors(palette) {
	return palette.map(color => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
		const rgb = {
			red: parseInt(result[1], 16),
			green: parseInt(result[2], 16),
			blue: parseInt(result[3], 16),
		};
		return 0xff000000 | rgb.blue << 16 | rgb.green << 8 | rgb.red;
	});
}

async function makeSnapshot(opts = {}) {
	const base = opts.base === undefined ? "https://pxls.space/" : opts.base;

	const info = JSON.parse(await req(base + "info"));
	debug("fetched board info");

	const width = opts.width === undefined ? info.width : opts.width;
	const height = opts.width === undefined ? info.height : opts.height;

	const palette = opts.palette === undefined ? paletteColors(info.palette) : opts.palette;

	const can = new Canvas(width, height);
	const ctx = can.getContext("2d");

	const imgData = ctx.getImageData(0, 0, width, height);

	const board = await req(base + "boarddata");
	debug("fetched board data");
	
	const data = new Uint8Array(Buffer.from(board));

	const intView = new Uint32Array(imgData.data.buffer);

	for (let index = 0; index < width * height; index++) {
		if (data[index] == 0xFF) {
			intView[index] = 0x00000000;
		} else {
			intView[index] = palette[data[index]];
		}
	}

	ctx.putImageData(imgData, 0, 0);

	return can.pngStream();
}
module.exports = makeSnapshot;
