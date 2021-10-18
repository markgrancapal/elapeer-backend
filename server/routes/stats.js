const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000',
}

const userRoutes = (app, fs) => {
    // variables
    const statsPath = 'server/data/stats.json';
    const citiesNodesPath = 'server/data/citynodescount.json';
  
    // READ
    app.get('/stats', cors(corsOptions), (req, res) => {
      fs.readFile(statsPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });

    app.get('/cities', cors(corsOptions), (req, res) => {
      fs.readFile(citiesNodesPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });
  };
  
  module.exports = userRoutes;