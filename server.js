const express = require('express');
const app = express();

app.use(express.static('./dist/backbase-peachtree-bank-demo'));

app.get('/*', (_request, response) => {
  response.sendFile('index.html', { root: 'dist/backbase-peachtree-bank-demo/' });
});

app.listen(process.env.PORT || 8080);
