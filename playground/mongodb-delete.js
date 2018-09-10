const Mongo = require('mongodb');
const {MongoClient} = Mongo;

const dbName = 'todoapp';


MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
    if (err) {
        console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    const db = client.db(dbName);
    const users = db.collection('Users');

    // db.collection('Todos').deleteMany({
    //     test: 'Eat lunch'
    // }).then((result) => {
    //     console.log('result');
    // });

    // db.collection('Todos').deleteOne({
    //     test: 'Eat lunch'
    // }).then((result) => {
    //     console.log(result);
    // })

    // db.collection('Todos').findOneAndDelete({
    //     completed: false
    // }).then((result) => {
    //     console.log(result);
    // });

    // db.collection('Users').findOneAndDelete({
    //     _id: Mongo.ObjectID("5b95618968e4955370789706")
    // }).then((result) => {
    //     console.log(result);
    // })

    var removeIds = [];

    db.collection('Users').aggregate([
    {
        $group: { 
            _id: {user : "$user"},
            uniqueIds: {$addToSet: "$_id"},
            count: {$sum: 1}
        }
    },
    { 
        $match: { 
            count: {"$gt" : 1}
        }
    }
    ]).toArray().then(result => {
        result.forEach ((value) => {
            value.uniqueIds.forEach(id => {
                var length = value.uniqueIds.length;
                console.log(`id ${id}\n`);
                console.log(`length ${value.uniqueIds.length}\n`);
                if (length > 1) {
                    db.collection('Users').findOneAndDelete({
                        _id: Mongo.ObjectID(id)
                    }).then(result => {
                        console.log('Added', result);
                    }, error => {
                        console.log('Error', error);
                    });
                }
            });
            
        });
    });


    

    // db.collection('Users').find({}).toArray().then(result => {
    //     console.log(result);
    // })

    client.close();
});