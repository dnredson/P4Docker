const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();  // Make sure this line is before any app.use() calls

// Add other required modules
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

// LiveReload configuration
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(__dirname + "/public");

const liveReloadMiddleware = connectLivereload();
app.use(liveReloadMiddleware); // Now 'app' is defined before use
app.use(express.json());
// Express app configuration
const port = 3000;
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/compiler', (req, res) => {
  res.sendFile(__dirname + '/public/compiler.html'); // Adjust the file path as necessary
});

app.post('/compiler', (req, res) => {
  const title = req.body.title;
  const code = req.body.code;

  fs.writeFileSync(`/var/lib/docker/volumes/shared/_data/${title}.p4`, code);

  exec(`docker exec compiler p4c-bm2-ss ${title}.p4 -o ${title}.json`, (error, stdout, stderr) => {
      if (error || stderr) {
          res.json({
              success: false,
              error: error?.message || stderr,
              title: title,
              code: code
          });
      } else {
          res.json({
              success: true,
              output: stdout,
              title: title,
              code: code
          });
      }
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
