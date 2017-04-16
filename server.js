const express = require('express');
const hbs = require('hbs');
const fs = require('fs');

// This allows for us to run the app on heroku.com, a web hosting site for web apps
// It uses the environment variables set by heroku to dynamically set the port through
// which to access our app
const port = process.env.PORT || 3000;

// Initialize express library
var app = express();

// tell Handlebars to allow the use of partials 
hbs.registerPartials(__dirname + "/views/partials");

// configure express to use handlebars as our render engine
app.set("view engine", "hbs");


// *-----------------*
// express middleware is executed in the order it is written. The maintenance middleware that we created below
// will not work on anything created in the public folder due to the static webpage middleware that was written
// above the maintenance middleware.

// configure a static web server that hosts all files included in the /public folder
// this is called express Middleware
// app.use(express.static(__dirname + "/public"));

// I have commented it out and moved it below the maintenance middleware so that it will function as expected.
// *-----------------*

// creates new express middleware that creates or appends to a serverlog file
app.use((request, response, next) => {
    var now = new Date().toString();

    // demonstrates some of the values that are available from the passed in parameters
    var log = `#${now}: ${request.method} ${request.url}`

    fs.appendFile(`server.log`, log + '\n', (err) => {
        if (err) {
            console.log('Unable to append to file');
        }
    });

    // this progresses the express library. without calling this, the website may never finish loading.
    next();
});

// this shows what happens when you don't use next, although this is pretty useful as it demonstrates
// how to create a maintenance page
// app.use( (request, response, next) => {
//     response.render('maintenance.hbs');
// });

app.use(express.static(__dirname + "/public"));

// creates a Handlebars helper function that allows us to get the current year for the copyright message
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

// another helper that capitalizes all text passed to it
hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
})

// tell express to host the main page at localhost:3000/
app.get('/', (request, response) => {
    // the most basic express command to return some HTML
    // response.send("<h1>Hello, Express!</h1>");

    // uses the handlebars render engine and passes an object full of data that handlebars pages can access
    response.render("home.hbs", {
        pageTitle: "Home",
        welcomeMessage: "Welcome Dude!"
    });
});

// tells express to host the About page at localhost:3000/about
app.get('/about', (request, response) => {
    response.render('about.hbs', {
        pageTitle: "About",
    });
});

app.get('/projects', (request, response) => {
    response.render('projects.hbs', {
        pageTitle: "Projects"
    });
});

// tells express to host the Bad page at localhost:3000/bad
app.get('/bad', (request, response) => {
    // demonstrates that express can send JSON data
    response.send({
        errorMessage: "Error!"
    });
});

// tells express to host this server at port 3000
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});