'use strict';

const socketio = require('socket.io');
const database = require('../database');
const helper = require('../helper');

module.exports = function (server) {
	const db = database();
	const io = socketio(server, {'pingTimeout':4000, 'pingInterval':2000});
	let numUsers = 0;

	io.on('connection', onConnection);

	function onConnection (socket) {
		//console.log(`Client connected ${socket.id}`);
		numUsers ++;
		//console.log('el numero de usuarios es: '+ numUsers);
		socket.broadcast.emit('conectados',numUsers);
		socket.emit('conectadosack',numUsers);

		db.list(function (err, messages) {
	      if (err) return console.error(err)

	      socket.emit('messages', messages)
	    })


		socket.on('message', function (message) {
			const converter = helper.convertVideo(message.frames);

			converter.on('gif', function (gif) {
				delete message.frames;
				message.gif = gif;

				db.save(message, function (err) {});

				// Send video to everyone
				socket.broadcast.emit('message', message);

				// Send video to sender
				socket.emit('messageack', message);
			})
		})

		socket.on('disconnect', function() {
			numUsers --;
			socket.broadcast.emit('conectados',numUsers);
			//console.log(`Client disconnected ${socket.id}`);
		});
	}
}