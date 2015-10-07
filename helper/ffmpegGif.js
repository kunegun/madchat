'use strict';

const os = require('os');
const path = require('path');
const spawn = require('child_process').spawn;

module.exports = function (options, callback) {


	if (!options.baseName) return callback(new TypeError('You must specify a baseName'))

	let folder = options.folder || os.tmpDir()
	let baseName = options.baseName;
	let fileSrc = path.join(folder, `${baseName}-%d.jpg`)
	let videoSrc = path.join(folder, `${baseName}.webm`)
	let gifDest = path.join(folder, `${baseName}.gif` )

	// ffmpeg -i video.avi -pix_fmt rgb24 -loop_output 0 out.gif

	// let ffmpegGif = spawn('ffmpeg', [
	// 	'-i',
	// 	videoSrc,
	// 	'-pix_fmt',
	// 	'rgb24',
	// 	gifDest
	// ])

	let ffmpegGif = spawn('ffmpeg', [
		'-f',
		'image2',
		'-framerate',
		9,
		'-i',
		fileSrc,
		gifDest
	])

	ffmpegGif.stdout.on('close', function (code) {
		if (!code) return callback(null)

		callback(new Error(`ffmpeg exited with code ${code}`))
	})
}