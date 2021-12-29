const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + ".ogg"); //Appending extension
  },
});

const upload = multer({ storage });
const speech = require("@google-cloud/speech");
const express = require("express");
const app = express();
const port = 8080;
const fs = require("fs");
var cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);
app.use(cors());

app.post("/", upload.single("file"), (req, res) => {
  gettranscript(req.file, (transcription) => {
    res.json({ transcription });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Creates a client
const client = new speech.SpeechClient();

const config = {
  encoding: "FLAC",
  sampleRateHertz: 48000,
  languageCode: "en-US",
  audioChannelCount: 2,
};

async function gettranscript(file, onSuccess) {
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const diskFileName = "uploads/" + file.filename;
  const convertedFileName = "uploads/" + file.filename.split(".")[0] + ".flac";
  ffmpeg(diskFileName)
    .output(convertedFileName)
    .on("end", async function () {
      const audio = {
        content: fs.readFileSync(convertedFileName).toString("base64"),
      };

      const request = {
        audio: audio,
        config: config,
      };

      // Detects speech in the audio file
      const [response] = await client.recognize(request);
      console.log(response.results.alternatives);
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");
      console.log(`Transcription: ${transcription}`);
      onSuccess(transcription);
    })
    .on("error", function (err) {
      console.log(err);
    })
    .audioChannels(2)
    .audioFrequency(48000)
    .run();
}
