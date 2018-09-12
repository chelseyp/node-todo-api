const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require ('./../server/models/todo.js');
const {User} = require('./../server/models/user.js');

// var id = '5b988e157808ae27a7bbb6e8';

// if (!ObjectID.isValid(id)) {
//     console.log('Object ID is not valid');
// }

// Todo.find({
//     _id: id
// }).then(todos => {
//     console.log('Todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then(todo => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then(todo => {
//     if (!todo) {
//         console.log('Id not found');
//     }
//     console.log('Todo by ID', todo);
// }).catch(e => console.log(e));

var userID = '5b97f8274c661f91447dd458';

User.findById(userID).then(user => {
    if (!user) {
        console.log('User not found');
    }
    console.log('User', user);
}).catch(e => console.log(e));

