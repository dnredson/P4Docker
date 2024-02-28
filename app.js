const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();



app.use(express.json());

const port = 3000;
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/compiler', (req, res) => {
  res.sendFile(__dirname + '/public/compiler.html'); 
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
app.get('/download', (req, res) => {
    const title = req.query.title; 
    if (!title) {
        return res.status(400).send("File not specified.");
    }
  const filePath = `/var/lib/docker/volumes/shared/_data/${title}.json`; 
  console.log(filePath);
  res.download(filePath, `${title}.json`, (err) => {
      if (err) {
          
          res.status(500).send("Error trying to Download the file");
      }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
