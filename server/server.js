var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {User} = require('./models/user.js');
var {Todo} = require('./models/todo.js');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        completed: req.body.completed
    });
    
    todo.save().then(doc => {
        res.send(doc);
    }, err => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, e => {
        res.send(e);
    });
})

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    Todo.findById(id)
    .then(todo => {
        if (!todo) {
            res.status(404).send();
        }
        res.send({todo});
    }, e => res.send(e))
    .catch(e => {
        res.status(400).send();
    });
})

// prevent tests from "listening" twice
if (!module.parent) {
    app.listen(port, () => {
        console.log(`Started on port ${port}`);
    });
}

module.exports = {app};