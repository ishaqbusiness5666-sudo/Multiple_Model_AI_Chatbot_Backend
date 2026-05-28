const express = require("express");
const cors = require("cors");

const App = express();

App.use(cors());
App.use(express.json());


module.exports = { App };