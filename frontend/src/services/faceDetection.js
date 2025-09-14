import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

let model;
let video;
let canvas;
let ctx;

const setupCamera = async () => {
    video = document.createElement('video');
    video.width = 640;
    video.height = 480;

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
};

const loadModel = async () => {
    model = await blazeface.load();
};

const detectFaces = async () => {
    const predictions = await model.estimateFaces(video, false);
    return predictions;
};

const drawPredictions = (predictions) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    predictions.forEach((prediction) => {
        const start = prediction.topLeft;
        const end = prediction.bottomRight;
        ctx.beginPath();
        ctx.rect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.stroke();
    });
};

const startProctoring = async () => {
    await setupCamera();
    await loadModel();

    canvas = document.createElement('canvas');
    canvas.width = video.width;
    canvas.height = video.height;
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    video.play();
    const detect = async () => {
        const predictions = await detectFaces();
        drawPredictions(predictions);
        requestAnimationFrame(detect);
    };
    detect();
};

const stopProctoring = () => {
    video.pause();
    video.srcObject.getTracks().forEach(track => track.stop());
    canvas.remove();
};

export { startProctoring, stopProctoring };
