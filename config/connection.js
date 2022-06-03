const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

var state
const dbname = 'shopping'
    // you can replace test with any database name that you want
const connect = (cb) => {
        MongoClient.connect('mongodb://127.0.0.1:27017/test')
            .then((client) => {
                state = client.db(dbname);
                cb()
                console.log('Connected to MongoDb');
            }).catch((err) => {
                console.log(err);
            });
    }
    //after your server started you can use getDb to access mongo Database
const getDb = () => {
    if (state) return state;
    throw 'No database found';
}

exports.connect = connect;
exports.getDb = getDb;