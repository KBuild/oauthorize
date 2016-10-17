'use strict';

const express = require('express');
const passport = require('passport');

let app = express();

app.get("/login", (req, res) => {
    res.render("views/loginform");
});

app.post("/login", (req, res) => {

});

app.get("/oauth/request_token", (req, res) => {

});

app.get("/oauth/authorize", (req, res) => {
});

app.post("/oauth/authenticate", (req, res) => {
});

app.get("/oauth/access_token", (req, res) => {

});

app.listen("0.0.0.0", "80", () => {
    console.log("app start");
})
