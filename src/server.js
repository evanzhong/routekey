const express = require('express');
const path = require('path');
const parse = require('body-parser');

const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.use(parse.json());

app.get('/', (req, res) => {
    const home = path.join(__dirname, 'public', 'index.html');
    res.sendFile(home);
});

app.post('/new-route', (req, res) => {
    console.log(req.body);
});

app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running at PORT ${server.address().port}`);
});
