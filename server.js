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

const getVisits = () => {
    const query = datastore
        .createQuery('Car')
        .order('TankCap', {descending: true})
        .limit(10);

    return datastore.runQuery(query);
};

app.get('/getCars', async (req, res, next) => {
    try {
        const [entities] = await getVisits();
        res.send(entities);
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
    console.log("New user: "+{
        name: req.body.name,
        mpg: req.body.mpg,
        description: req.body.description
    });
    res.send('Thanks for adding '+req.body.name+'!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});