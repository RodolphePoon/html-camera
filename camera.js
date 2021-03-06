feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const screenshotImage = document.querySelector('img');
const caracteristiques = document.querySelector('.caracteristiques');

const buttons = [...controls.querySelectorAll('button')];
let streamStarted = false;

const [play, pause, screenshot, back] = buttons;

if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {

  const ded = navigator.mediaDevices.getSupportedConstraints()
  alert(ded.torch ? 'torch=true' : 'torch=false')

  const constraints = Object.entries(ded).map(([key, value]) => `<div>${key}:${value}</div>`)
  caracteristiques.innerHTML = constraints.join('');
}

const constraints = {
  video: {
    width: {
      min: 1280,
      ideal: 1920,
      max: 2560,
    },
    height: {
      min: 720,
      ideal: 1080,
      max: 1440
    },
  }
};

cameraOptions.onchange = () => {
  const updatedConstraints = {
    ...constraints,
    deviceId: {
      exact: cameraOptions.value
    }
  };

  startStream(updatedConstraints);
};

play.onclick = () => {
  if (streamStarted) {
    video.play();
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    back.classList.remove('d-none');

    return;
  }
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {

    const updatedConstraints = {
      ...constraints,
      deviceId: {
        exact: cameraOptions.value
      }
    };
    startStream(updatedConstraints);
  }
};



const pauseStream = () => {
  video.pause();
  play.classList.remove('d-none');
  pause.classList.add('d-none');
  back.classList.add('d-none');

};

const doScreenshot = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  screenshotImage.src = canvas.toDataURL('image/webp');
  screenshotImage.classList.remove('d-none');
};

const backCamera = () => {
  if (streamStarted) {
    video.play();
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    back.classList.remove('d-none');

    return;
  }
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {

    const updatedConstraints = {
      ...constraints,
      deviceId: {
        exact: cameraOptions.value
      }
    };
    updatedConstraints.video.facingMode = 'environment'
    startStream(updatedConstraints).then(stream => {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities()
      if (capabilities.torch) {
        track.applyConstraints({
          advanced: [{ torch: true }]
        })
          .catch(e => console.log(e));
      }
    });
  }

}

pause.onclick = pauseStream;
screenshot.onclick = doScreenshot;
back.onclick = backCamera;

const startStream = async (constraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  handleStream(stream);
  return stream
};


const handleStream = (stream) => {
  video.srcObject = stream;
  play.classList.add('d-none');
  pause.classList.remove('d-none');
  screenshot.classList.remove('d-none');
  back.classList.remove('d-none');


};


const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  console.log({ videoDevices })

  const options = videoDevices.map(videoDevice => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join('');
};

getCameraSelection();