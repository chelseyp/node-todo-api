const Mongo = require('mongodb');
const {MongoClient} = Mongo;

const dbName = 'todoapp';


MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
    if (err) {
        console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    const db = client.db(dbName);

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    // find all users not named 'Chelsey'
    db.collection('Users').find({
        user: {$ne: "Chelsey"}
    }).toArray().then((docs) => {
        console.log('Users');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('Unable to fetch users', err);
    });

    client.close();
});