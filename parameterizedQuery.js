require('dotenv').config()
var pg = require('pg');
var fetch = require("node-fetch");

var conString = process.env.RDS_CONNECTION_STRING;
var client = new pg.Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

client.connect();

// TODO: next step - deploy to lambda
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

    const indeed = await fetch('http://api.indeed.com/ads/apisearch?publisher=' + process.env.INDEED_PUBLISHER_KEY + '&q=javascript&l=boston&sort=&radius=&st=&jt=&start=1&limit=10&fromage=&filter=&latlong=1&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2&format=json')
    const json = await indeed.json();
    const count = await json.results.length;
    console.log(count);

    try {
        for (i = 0; i < count; i++) {
            var jobtitle = json.results[i].jobtitle;
            var company = json.results[i].company;
            var city = json.results[i].city;
            var state = json.results[i].state;
            var formatted_location = json.results[i].formattedLocation;
            var source = json.results[i].source;
            var date = json.results[i].date;
            var snippet = json.results[i].snippet;
            var url = json.results[i].url;
            var latitude = json.results[i].latitude;
            var longitude = json.results[i].longitude;
            var jobKeyValue = json.results[i].jobkey;
            console.log(jobKeyValue);
            await writeToDb(jobtitle, company, city, state, formatted_location, source, date, snippet, url, latitude, longitude, jobKeyValue);
        }
    }
    catch (err) {
        console.log(err.stack);
    }

}

getJobKey();
