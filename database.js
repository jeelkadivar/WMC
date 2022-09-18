const { json } = require('express');
const mongoose = require('mongoose');

// require('dotenv').config();

const conn = "mongodb://127.0.0.1:27017/todo";

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    name: String,
    password: String,
    todolist: [{
        Date: String,
        list: Array,
    }],
});

const User = connection.model('userData', UserSchema, 'userData');

module.exports = connection;