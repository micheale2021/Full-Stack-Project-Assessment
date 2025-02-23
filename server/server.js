const express = require("express");
// const uuid = require("uuid");
// const videos = require("./../client/src/exampleresponse.json");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.use(bodyParser.json());

dotenv.config({ path: "../.env" });
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 6000,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/videos", (req, res) => {
  const sql = "SELECT * FROM videos";

  pool
    .query(sql)
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

// GET "/" gets all videos
// app.get("/videos", (req, res) => {
// Delete this line after you've confirmed your server is running
// res.send({ express: "Your Backend Service is Running" });
// res.send({ videos });
// });

// POST "/videos" add a video
function validateYouTubeUrl(url) {
  let regExp =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

  return url.match(regExp);
}

app.post("/videos", function (req, res) {
  // const newVideoId = videoId
  const newTitle = req.body.title;
  const newUrl = req.body.url;
  const newRating = 0;

  // INSERT INTO videos (title, url, rating) VALUES ($1, $2, $3)

  const query = `INSERT INTO videos( title, url, rating)
   values('${newTitle}', '${newUrl}', '${newRating}')`;

  if (!req.body.title || !validateYouTubeUrl(req.body.url)) {
    res.status(404).send({
      result: "failure",
      message: "Video could not be saved",
    });

    return;
  }

  pool
    .query(query)
    .then(() => res.send("Video added!"))
    .catch((error) => {
      console.error(error);
    });
});

// app.post("/videos", (req, res) => {
//   const newVideo = {
//     // id: uuid.v4(),
//     id: videos.length + 1,
//     title: req.params.title,
//     url: req.params.url,
//   };

//   if (!newVideo.title || !newVideo.url) {
//     res.status(404).send({
//       result: "failure",
//       message: "Video could not be saved",
//     });
//   }

//   videos.push(newVideo);
//   res.json({ videos });
// });

// get a single video by id
// app.get("/videos/:id", (req, res) => {
//   const found = videos.some((video) => video.id === parseInt(req.params.id));

//   if (found) {
//     res.json(videos.filter((video) => video.id === parseInt(req.params.id)));
//   } else {
//     res.status(404).json({ msg: `No video with the id of ${req.params.id}` });
//   }
// });

// Delete video by id
app.delete("/videos/:id", function (req, res) {
  const videosId = req.params.id;

  pool
    .query("DELETE FROM videos WHERE id=$1", [videosId])
    .then(() => res.send(`Video id ${videosId} deleted!`))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

// app.delete("/videos/:id", (req, res) => {
//   const found = videos.some((video) => video.id === parseInt(req.params.id));

//   if (found) {
//     res.json({
//       msg: "Booking deleted",
//       videos: videos.filter((video) => video.id !== parseInt(req.params.id)),
//     });
//   } else {
//     res
//       .status(404)
//       .json({ result: "failure", message: "Video could not be deleted" });
//   }
// });

app.listen(port, () => console.log(`Listening on port ${port}`));
