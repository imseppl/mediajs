// usage
// var mediaManager = new MediaManager("filename.ogg", "https://breve.me/upload", "filedata", audioVis, uploadProg);
// mediaManager.startRecording();
// mediaManager.stopRecording();
//

'use strict';
let mediaRecorder;
let audioFileName;
let urlToSave;
let formDataName;
let audioStream;
//visuals
let audioCtx;
let canvasCtx;
let canvas;
let progressBar;

//saveUrl: breve/store/wav/nomsg or breve/audio
//formDataName: filedata (save data) or audiodata (message)
//audioFileName: getRandomString(8) + '.ogg'
var MediaManager = function (audioFile, urlSave, dataName, audioCanvasObj, progressObj) {
	audioFileName = audioFile;
	urlToSave = urlSave;
	formDataName = dataName; //the form data name attribute when uploading to the server used in FormData.append()
	canvas = audioCanvasObj;
	if(canvas != null){
		canvasCtx = canvas.getContext("2d");
	}
	progressBar = progressObj;
};

MediaManager.prototype.setAudioFileName = function (fileName) {
	audioFileName = fileName;
};

MediaManager.prototype.setAudioFileUrl = function (url) {
	urlToSave = url;
};

MediaManager.prototype.setAudioDataName = function (name) {
	formDataName = name;
};

MediaManager.prototype.setVisualizerCanvas = function (canv) {
	canvas = canv;
	canvasCtx = canvas.getContext("2d");
};

MediaManager.prototype.setProgress = function (progress) {
	progressBar = progress;
};


MediaManager.prototype.startRecording = function () {
	if (navigator.mediaDevices.getUserMedia) {
		console.log('getUserMedia supported.');
		let chunks = [];
		const constraints = { audio: true };

		let onSuccess = function(stream) {
			audioStream = stream;
			if(canvas != null){
				canvas.style.display = "block";
			}
			try {
				mediaRecorder = new MediaRecorder(stream);
			}
			catch(e) {
				console.log('Exception while creating mediaRecorder:', e);
				return;
			}
			
			visualize(stream); //apply stream to canvas
			
			mediaRecorder.onstop = function(e) {
				console.log("mediaRecorder stopped.");
				if(canvas != null){
					canvas.style.display = "none";
				}
				const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
		  
				//upload blob
				const audioURL = window.URL.createObjectURL(blob);
				let xhr = new XMLHttpRequest();
			
				xhr.addEventListener('progress', function(e) {
					if (e.lengthComputable) {
						if(progressBar != null){
							progressBar.value = e.loaded;
							progressBar.max = e.total;
						}
					}
				} , false);

				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if(progressBar != null){
							progressBar.style.display = "none";
						}
					}
				}
				
				var fd = new FormData();
				fd.append(formDataName, blob, audioFileName);
				console.log(blob);
				xhr.open("POST", urlToSave, true);
				xhr.send(fd);

				chunks = [];
				
				if (audioStream) {
					//stop the audio stream
					audioStream.getTracks().forEach(function (track) {
						track.stop();
					});
				}
				console.log("recorder stopped");
				
			}

			mediaRecorder.ondataavailable = function(e) {
				chunks.push(e.data);
			}
			mediaRecorder.start();
		}

		let onError = function(err) {
			console.log('The following error occured: ' + err);
		}

		navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

	} else {
		console.log('getUserMedia not supported on your browser!');
	}
    return;
};

//stops the recording and sends it to the server
MediaManager.prototype.stopRecording = function () {
	if(mediaRecorder){
		mediaRecorder.stop();
	}
	else{
		console.log("Stop recording: media recorder is null");
	}
};

MediaManager.prototype.stopAudioStream = function () {
	if (audioStream) {
		//stop the audio stream
		audioStream.getTracks().forEach(function (track) {
			track.stop();
		});
	}
};

function visualize(stream) {
	if(!audioCtx) {
		audioCtx = new AudioContext();
	}

	const source = audioCtx.createMediaStreamSource(stream);

	const analyser = audioCtx.createAnalyser();
	analyser.fftSize = 2048;
	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);

	source.connect(analyser);
	//analyser.connect(audioCtx.destination);

	draw();

	function draw() {
		const WIDTH = canvas.width
		const HEIGHT = canvas.height;

		requestAnimationFrame(draw);

		analyser.getByteTimeDomainData(dataArray);

		//canvasCtx.fillStyle = 'rgb(200, 200, 200)';
		canvasCtx.fillStyle = 'rgb(255, 255, 255)';
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		canvasCtx.lineWidth = 2;
		canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

		canvasCtx.beginPath();

		let sliceWidth = WIDTH * 1.0 / bufferLength;
		let x = 0;


		for(let i = 0; i < bufferLength; i++) {

			let v = dataArray[i] / 128.0;
			let y = v * HEIGHT/2;

			if(i === 0) {
				canvasCtx.moveTo(x, y);
			} else {
				canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		canvasCtx.lineTo(canvas.width, canvas.height/2);
		canvasCtx.stroke();
	}
}
