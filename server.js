const url = require('url');
const express = require('express');

const app = express();
app.use((req, res, next) => {
  const path = url.parse(req.url).path;
  console.log(path);
});

const port = 3000;
app.listen(port, console.log(`Listening on port ${port}.`));