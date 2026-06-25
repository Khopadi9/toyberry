const { MongoStore } = require('connect-mongo');
console.log('MongoStore keys:', Object.keys(MongoStore));
console.log('MongoStore.create typeof:', typeof MongoStore.create);

const MongoStoreDefault = require('connect-mongo').default;
console.log('default keys:', Object.keys(MongoStoreDefault));
console.log('default.create typeof:', typeof MongoStoreDefault.create);
