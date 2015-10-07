'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const async = require('async');
const uuid = require('uuid');
const dataURIBuffer = require('data-uri-to-buffer');
const EventEmitter = require('events').EventEmitter;
const concat = require('concat-stream');
const listFiles = require('./list');
const ffmpeg = require('./ffmpeg');
const ffmpegGif = require('./ffmpegGif');

module.exports = function (images) {
	let events = new EventEmitter();
	let count = 0;
	let baseName = uuid.v4();
	let tmpDir = os.tmpDir();
	let video;
	let gif;


	async.series([
		decodeImages,
		//createVideo,
		createGif,
		encodeGif,
		//encodeVideo
		cleanup
	], convertFinished );

	function decodeImages (done) {
		async.eachSeries(images, decodeImage, done);
	}

	function decodeImage(image, done) {
		let fileName = `${baseName}-${count++}.jpg`;
		let buffer = dataURIBuffer(image);
		let ws = fs.createWriteStream(path.join(tmpDir, fileName));

		ws.on('error', done)
		  .end(buffer, done);

		events.emit('log', `Converting ${fileName}` );
	}

	// function createVideo(done) {
	// 	ffmpeg({
	// 		baseName: baseName,
	// 		folder: tmpDir
	// 	}, done)
	// }
	function createGif(done) {
		ffmpegGif({
			baseName: baseName,
			folder: tmpDir
		}, done)
	}

	// function encodeVideo(done) {
	// 	let fileName = `${baseName}.webm`;
	// 	let rs = fs.createReadStream(path.join(tmpDir, fileName));

	// 	rs.pipe(concat(function (videoBuffer) {
	// 		video = `data:video/webm;base64,${videoBuffer.toString('base64')}`;
	// 		done();
	// 	}))

	// 	rs.on('error', done);
	// }
	function encodeGif(done) {
		let fileName = `${baseName}.gif`;
		let rs = fs.createReadStream(path.join(tmpDir, fileName));

		rs.pipe(concat(function (gifBuffer) {
			gif = `data:image/gif;base64,${gifBuffer.toString('base64')}`;
			done();
		}))

		rs.on('error', done);
	}

	function cleanup(done) {
		events.emit('log', 'Cleaning up');

		listFiles(tmpDir, baseName, function (err, files) {
			if (err) return done(err)

			deleteFiles(files, done);
		})
	}

	function deleteFiles(files, done) {
		async.each(files, deleteFile, done);
	}

	function deleteFile(file, done) {
		events.emit('log', `Deleting ${file}`)

		fs.unlink(path.join(tmpDir, file), function (err) {
			//ignore error
			done();
		})
	}

	function convertFinished(err) {
		if (err) return events.emit('error', err)

		//events.emit('video', video);
		events.emit('gif', gif);
	}

	return events;
}