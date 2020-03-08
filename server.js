const express = require('express');
const app = express();
const path = require(`path`);
const bodyParser = require('body-parser');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '/public')));
app.use('/fa', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));
app.enable('trust proxy');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/getGasStations',  async (req, res, next) => {
    try {
        const query = datastore
            .createQuery('GasStation');
        const [results] = await datastore.runQuery(query);
        res.send(results);
    } catch (error) {
        next(error);
    }
});

app.get('/getCars', async (req, res, next) => {
    try {
        const query = datastore
            .createQuery('Car')
            .order('TankCap', {descending: true})
            .limit(10);
        const [results] = await datastore.runQuery(query);

        res.send(results);
    } catch (error) {
        next(error);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/map.html'));
});

app.get('/newUser', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/newUser.html'));
});

app.post('/submit', (req, res) => {
    console.log("New user: "+{req});
    res.send('Thanks for adding '+req.car+'!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:8080/`);
});