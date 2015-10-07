const domify = require('domify');
const Webrtc2Images = require('webrtc2images');
const uuid = require('uuid');
const io = require('socket.io-client');
const messageTpl = require('./templates/message.hbs');
const usersTpl = require('./templates/users.hbs');

const socket = io.connect();
const id = uuid.v4();

const rtc = new Webrtc2Images({
	width: 200,
	height: 200,
	frames: 10,
	type: 'image/jpeg',
	quality: 0.8,
	interval: 200
});

rtc.startVideo(function (err) {

})

const messages = document.querySelector('#messages');
const form = document.querySelector('form');
const footer = document.querySelector('footer');
const btnRecord = document.querySelector('#video-preview img');

form.addEventListener('submit', function (e) {
	e.preventDefault();

	record();
	//console.log('inicio');
	btnRecord.style.display = "block";

}, false)

socket.on('conectados',function(numUsers){
	updateNumUsers(numUsers);
});
socket.on('conectadosack',function(numUsers){
	updateNumUsers(numUsers);
});

socket.on('message', addMessage);

socket.on('messageack', function (message) {
	if (message.id === id) {
		addMessage(message);
	}
})

socket.on('messages', function (messages) {
  	messages.forEach(addMessage);
})

function record () {
  	const input = document.querySelector('input[name="message"]');
	const message = input.value;
  	input.value = "";

	rtc.recordVideo(function (err, frames) {
		if (err) return logError(err)

		socket.emit('message', { id:id, message: message, frames: frames });
		//console.log('fin');
		btnRecord.style.display = "none";
	})
}

function addMessage (message) {
	const m = messageTpl(message);
	const mes = domify(m);
	messages.insertBefore(mes,messages.firstChild);
	//messages.appendChild(domify(m));
}

function updateNumUsers(numUsers){
	//console.log('numero de usuario: ' + numUsers);
	var usuarios = {numUsers};
	const u = usersTpl(usuarios);
	const old = document.querySelector('#num-users');
	if ( old !== null && typeof( old ) !== 'undefined' ) {
		old.remove();
	}
	footer.appendChild(domify(u));
}

function logError (err) {
	console.error(err);
}