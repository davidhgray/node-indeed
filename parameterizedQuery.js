require('dotenv').config()
var pg = require('pg');
var Client = require('node-rest-client').Client;
var fetch = require("node-fetch");

var restClient = new Client();
var conString = process.env.CONNECTION_STRING;
var client = new pg.Client(conString);
client.connect();
console.log(process.env.INDEED_PUBLISHER_KEY);

async function writeToDb(jobtitle, company, city, state, formatted_location, source, date, snippet, url, latitude, longitude, jobKeyValue) {
    const text = 'INSERT INTO jobs(jobtitle, company, city, state, formatted_location, source, date, snippet, url, latitude, longitude, jobKey) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';
    const values = [jobtitle, company, city, state, formatted_location, source, date, snippet, url, latitude, longitude, jobKeyValue];
    try {
        const res = await client.query(text, values);
        console.log(res.rows[0]);
    }
    catch (err) {
        console.log(err.stack);
    }
}

async function getJobKey() {

    const indeed = await fetch('http://api.indeed.com/ads/apisearch?publisher=' + process.env.INDEED_PUBLISHER_KEY + '&q=javascript&l=seattle&sort=&radius=&st=&jt=&start=859&limit=10&fromage=&filter=&latlong=1&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2&format=json')
    const json = await indeed.json();
    const count = await json.results.length;
    console.log(count);

    try {
        for (i = 0; i < count; i++) {
            var jobtitle = await json.results[i].jobtitle;
            var company = await json.results[i].company;
            var city = await json.results[i].city;
            var state = await json.results[i].state;
            var formatted_location = await json.results[i].formattedLocation;
            var source = await json.results[i].source;
            var date = await json.results[i].date;
            var snippet = await json.results[i].snippet;
            var url = await json.results[i].url;
            var latitude = await json.results[i].latitude;
            var longitude = await json.results[i].longitude;
            var jobKeyValue = await json.results[i].jobkey;
            await console.log(jobKeyValue);
            await writeToDb(jobtitle, company, city, state, formatted_location, source, date, snippet, url, latitude, longitude, jobKeyValue);
        }
    }
    catch (err) {
        console.log(err.stack);
    }

}

getJobKey();
