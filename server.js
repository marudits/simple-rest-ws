const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
var bodyParser = require('body-parser')

const app = express();
const router = express.Router();
const PORT = process.env.PORT || '8080';

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// connect the router
app.use('/', router);
app.use((req, res, next) => {
    res.status(404).send(JSON.stringify({ successful: false, payload: { message: 'NOT_FOUND' }}));
});

let messages = [];

// Static Files
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
})

// API
// Postman collection : https://www.getpostman.com/collections/5e762adabbde73dc3bbe
router.get('/status', (req, res) => {
    res.status(200).send(JSON.stringify({ successful: true, payload: { message: 'Server is running'} }));
});

router.get('/api/messages', (req, res) => {
    res.status(200).send(JSON.stringify({ successful: true, payload: messages }))
});

router.post('/api/messages', (req, res) => {
    console.log(req);
    let { message } = req.body;

    if(!message || message.trim().length === 0){
        res.status(400).send(JSON.stringify({ successful: false, payload: { message: 'INVALID_DATA' }}));
        return;
    }

    let content = { message: message.trim(), created_at: new Date() };

    messages.push(content);

    res.status(200).send(JSON.stringify({ successful: true, payload: { data: content }}))
})

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Websocket
const wss = new SocketServer({ server });

// init Websocket ws and handle incoming connect requests
wss.on('connection', function connection(ws) {
    //on connect message
    ws.on('message', function incoming(message) {
        
        let content = { message: message.trim(), created_at: new Date() };
        
        messages.push(content);
    });
    
    ws.send(JSON.stringify(messages));
});