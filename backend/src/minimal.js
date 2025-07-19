const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(5001, () => {
  console.log('Server running on port 5001');
}); 