const express = require('express');
const config = require('./mysql/config');
const app = express();
const queries = require("./mysql/queries");
const mysql = require("./mysql/config");
const { querySql } = require('./mysql/queries');

app.set('view engine', 'ejs');
app.listen(3000);

app.get('/', function (request, response) {
  response.render('index', { title: 'Airbnb Search App' });
});

app.get("/states", (request, response) => {
  let con = mysql.getCon();

  con.connect();
  con.query("SELECT * FROM states ORDER BY name", (error, result) => {
    response.json(result);
  });
  con.end();
});

app.get("/cities", (request, response) => {
  let con = mysql.getCon();

  con.connect();
  con.query("SELECT * FROM cities WHERE state_id = '"
    + request.query.state + "' ORDER BY name", (error, result) => {
      response.json(result);
    });
  con.end();
});

app.get('/airbnb', (request, response) => {
  response.render('airbnb', { title: 'AirBnb' });
});

app.get('/airbnb/find-one', (request, response) => {
  let number_rooms = request.query.bedrooms;
  let number_guests = request.query.guests;
  let prices = request.query.price;
  let amenities = request.query.amenities;

  queries.findListing(
    {
      number_rooms: number_rooms,
      max_guest: number_guests,
      price_by_night: prices,
      amenities: amenities
    }).then(oneListing => {
      if (oneListing.length === 0) {
        response.render("listingNoData");
      } else {
        queries.findAmenity({ amenityID: oneListing[0].id }).then(amenityListing => {
          response.render("listing", {
            listing: oneListing[0],
            amenities: amenityListing
          });
        })
      }
    })
});

app.get("/airbnb/find-many", async (request, response) => {
  let number_rooms = request.query.bedrooms;
  let statesName = request.query.states;
  let cityName = request.query.cities;
  queries.findListings(
    {
      number_rooms: number_rooms,
      nameState: statesName,
      nameCity: cityName
    }).then(result => {
      if (result.length === 0) {
        response.render("listingNoData");
      } else {
        response.render("listings", {
          listings: result,
        });
      }
    });
});

app.get("/airbnb/:id", (request, responde) => {
  let placeID = request.params.id;
  queries.findPlaceID({ place_id: placeID }).then(result => {
    queries.findAmenity({ amenityID: placeID }).then(amenityListing => {
      responde.render("listing", {
        listing: result[0],
        amenities: amenityListing
      });
    })
  })
});

