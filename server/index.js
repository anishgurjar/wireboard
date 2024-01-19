const app = require('./app');

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Wireboard server on http://localhost:${PORT}`));
