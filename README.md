# mediajs
Record audio using your web browser and save the .ogg files to the server.

Recorder.js is no longer maintained by the creator and web browsers have implemented built-in audio and video recording. I created mediajs to record audio into ogg format and send the file blob to a nodejs (or other) server.

Include the media.js file into your client HTML project and look at the index.html file for how to record audio from your web browser to send to a server.

# Usage
In your index.html file, create your recording buttons including the audio feedback visualization and the upload progress elements.

```
	<button class="record">Record</button>
	<button class="stop">Stop</button>
	<canvas class="visualizer" height="60px"></canvas>
	<progress class="prog"></progress>
```

In the same index.html file, create the mediaManager and button even listeners.

```
		var record = document.querySelector('.record');
		var stop = document.querySelector('.stop');
		var audioVis = document.querySelector('.visualizer');
		var uploadProg = document.querySelector('.prog');
		audioVis.style.display = "none";
		stop.disabled = true;
		//var mediaManager = new MediaManager("filename.ogg", "store/wav/nomsg", "filedata", audioVis, uploadProg);
		var mediaManager = new MediaManager("filename.ogg", "store/wav/nomsg", "filedata", null, null);
		mediaManager.setVisualizerCanvas(audioVis);
		mediaManager.setProgress(uploadProg);
		
		record.addEventListener('click', () => {
			mediaManager.startRecording();
			record.disabled = true;
			stop.disabled = false;
		});
		
		stop.addEventListener('click', () => {
			mediaManager.stopRecording();
			record.disabled = false;
			stop.disabled = true;
		});
```

The MediaManager constructor takes the following arguments:

MediaManager(FileName, UploadLocation, FileDataName, AudioVisual, UploadProg);

FileName: the name of the .ogg file
example: "filename.ogg"

UploadLocation: HTTP POST server location (must be on the same server as the Node application)
example: "store/wav/nomsg"

FileDataName: The Form Data name send with the HTTP POST request.
example: "filedata"

AudioVisual: The HTML canvas object for the sound levels visual

UploadProg: The HTML progress object for the upload progress

# Try it out
Download index.html and media.js to the same folder and give it a try!
