const Canvas = require("canvas");
const req = require("request-promise");

/**
 * Converts a CSS color palette to ARGB.
 * @param {string[]} palette The palette as CSS-resolvable colors.
 * @returns {number[]} The palette in ARGB.
 */
function paletteColors(palette) {
	return palette.map(color => {
		const result = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
		const rgb = {
			blue: parseInt(result[3], 16),
			green: parseInt(result[2], 16),
			red: parseInt(result[1], 16),
		};
		return 0xFF000000 | rgb.blue << 16 | rgb.green << 8 | rgb.red;
	});
}

/**
 * @typedef {Object} SnapshotOpts
 * @property {string?} base The base URL for the API.
 * @property {number?} width An override for the canvas width.
 * @property {number?} height An override for the canvas height.
 * @property {string[] | null} palette An override for the canvas palette.
 */

/**
 * Makes a snapshot of the canvas.
 * @param {SnapshotOpts} opts Options for the snapshot.
 * @returns A stream of the canvas.
 */
async function makeSnapshot(opts = {}) {
	const base = opts.base === undefined ? "https://pxls.space/" : opts.base;

	const info = JSON.parse(await req(base + "info"));

	const width = opts.width === undefined ? info.width : opts.width;
	const height = opts.width === undefined ? info.height : opts.height;

	const palette = opts.palette === undefined ? paletteColors(info.palette) : opts.palette;

	const can = new Canvas(width, height);
	const ctx = can.getContext("2d");

	const imgData = ctx.getImageData(0, 0, width, height);

	const board = await req(base + "boarddata");
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
