const Mongo = require('mongodb');
const {MongoClient} = Mongo;

const dbName = 'todoapp';


MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
    if (err) {
        console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    const db = client.db(dbName);

    // db.collection('Todos').findOneAndUpdate({
    //     _id: Mongo.ObjectID('5b96fbd006e554199ad7ef43')
    // }, {
    //     $set: {completed: true}
    // }, {
    //     returnOriginal: false
    // }).then(result => {
    //     console.log(result);
    // });

    db.collection('Users').findOneAndUpdate({
        _id: Mongo.ObjectID('5b955fd6562d9050993157e9')
    }, {
        $set: {user: 'Chelsey'},
        $unset: {completed: false},
        $inc: {age: 1}
    }, {
        returnOriginal: false
    }).then(result => {
        console.log(result);
    })

    client.close();
});