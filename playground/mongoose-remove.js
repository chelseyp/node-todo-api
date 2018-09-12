const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require ('./../server/models/todo.js');
const {User} = require('./../server/models/user.js');

// Todo.deleteMany({}).then(res => console.log(res), err => console.log(err));

//Todo.findOneAndRemove
//Todo.findByIdAndRemove

Todo.findOneAndDelete('5b99935c16868e306d330cf5').then(todo => {
    console.log(todo);
});