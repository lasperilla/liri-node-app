var inquirer = require("inquirer");
var twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var myKeys = require("./keys.js")
var moment = require("moment");
var fs = require('fs');
var util = require('util');

//change console.log to output to both terminal and in log.txt
var log_file = fs.createWriteStream(__dirname + '/log.txt', { flags: 'a' });
var log_stdout = process.stdout;
console.log = function(arguments) { //
    log_file.write(util.format(arguments) + '\n');
    log_stdout.write(util.format(arguments) + '\n');
};

var client = new twitter(myKeys.twitterKeys);
var userCommand = process.argv[2];

// log user command and timestamp in log.txt as header
fs.appendFileSync('log.txt', "/////////////////////////////// " + '\n');
fs.appendFileSync('log.txt', process.argv.slice(2).join(" ") + '\n');
fs.appendFileSync('log.txt', moment().format('LLLL') + '\n');
fs.appendFileSync('log.txt', "///////////////////////////////" + '\n');

switch (userCommand) {
    case "my-tweets":
        myTweetsFunc();
        break;
    case "spotify-this-song":
        var userQuery = process.argv.slice(3).join(" ");
        spotifyThisSongFunc();
        break;
    case "movie-this":
        var userQuery = process.argv.slice(3).join("+");
        movieThisFunc();
        break;
    case "do-what-it-says":
        doWhatItSaysFunc();
        break;
    case "prompt":
        promptFunc();
        break;
    default:
        // promptFunc();
        console.log("-1")
        break;
};

function myTweetsFunc() {
    var params = { screen_name: 'LawrenceCirilo' };
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error && response.statusCode === 200) {
            console.log("===============================");
            console.log("Lastest 20 Tweets:");
            console.log("===============================");
            console.log("");

            for (var i = 0; i < 20; i++) {
                // console.log(tweets)
                /*because twitter doesn't like to follow RFC/IETF standards and separates YYYY from MM/DD
                throwing moment.js errors. moves YYYY from end of str to middle, after DD*/
                var tweetDate = tweets[i].created_at.slice(0, 11) + tweets[i].created_at.slice(-4) + tweets[i].created_at.slice(10, 26)

                console.log("Date: " + moment(tweetDate, ["ddd MMM DD YYYY HH:mm:ss Z"]).format('LLL'));
                console.log("Status: " + tweets[i].text);
                console.log("");
                console.log("-------------------------------");
                console.log("");
            }
        } else {
            console.log("Twitter err")
            console.log(error)
        };
    });
}; //end myTweetsFunc

function spotifyThisSongFunc() {
    if (userQuery === "") {
        userQuery = "The Sign Ace of Base";
    };

    spotify.search({ type: 'track', query: userQuery }, function(error, data) {
        if (!error) {
            console.log("Track Name: " + data.tracks.items[0].name);
            console.log("Artist: " + data.tracks.items[0].artists[0].name);
            console.log("Album: " + data.tracks.items[0].album.name);
            console.log("Preview: " + data.tracks.items[0].preview_url);
            console.log("");
        } else {
            console.log('Error occurred: ' + err);
            return;
        };
    });
}; // end spotifyThisSongFunc

function movieThisFunc() {
    if (userQuery === "") {
        userQuery = "Mr. Nobody";
    };
    request("http://www.omdbapi.com/?t=" + userQuery + "&plot=full", function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var movie = JSON.parse(body);
            console.log("Title: " + movie.Title);
            console.log("Year: " + movie.Year);
            console.log("Rated: " + movie.Rated);
            console.log("Plot: " + movie.Plot);
            console.log("-------------------------------");
            console.log("Starring: " + movie.Actors);
            console.log("Country: " + movie.Country);
            console.log("Language: " + movie.Language);
            console.log("Rotten Tomatoes: " + movie.Ratings[1].Value);
            console.log("IMDB Rating: " + movie.Ratings[0].Value);
            console.log("IMDB Link: http://www.imdb.com/title/" + movie.imdbID + "/");
            console.log("");

        } else {
            console.log("Movie err")
            console.log(error)
        };
    });
}; //end movieThisFunc

function doWhatItSaysFunc() {
    fs.readFile('random.txt', 'utf-8', (error, data) => {
        if (!error) {
            // console.log(data)
            var random = data.split(",");
            userQuery = random[1];
            userCommand = random[0];
            switch (userCommand) {
                case "my-tweets":
                    myTweetsFunc();
                    break;
                case "spotify-this-song":
                    var userQuery = process.argv.slice(3).join(" ");
                    spotifyThisSongFunc();
                    break;
                case "movie-this":
                    var userQuery = process.argv.slice(3).join("+");
                    movieThisFunc();
                    break;
                case "do-what-it-says":
                    doWhatItSaysFunc();
                    break;
                case "prompt":
                    promptFunc();
                    break;
                default:
                    // promptFunc();
                    console.log("-1")
                    break;
            };
        } else {
            throw error;
        }
    });
}; //end doWhatItSaysFunc

fs.appendFileSync('log.txt', '\n \n');
