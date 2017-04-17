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
if (process.argv.length < 3) {
    fs.appendFileSync('log.txt', "Prompt" + '\n');
} else {
    fs.appendFileSync('log.txt', process.argv.slice(2).join(" ") + '\n');
};
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
        console.log("Please choose a command.");
        promptFunc();
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
            if (movie.Ratings !== undefined && movie.Ratings[1] !== undefined) {
                console.log("Rotten Tomatoes: " + movie.Ratings[1].Value);
            };
            if (movie.Ratings !== undefined && movie.Ratings[0] !== undefined) {
                console.log("IMDB Rating: " + movie.Ratings[0].Value);
            };
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
                    console.log("Please choose a command.")
                    promptFunc();
                    break;
            };
        } else {
            throw error;
        }
    });
}; //end doWhatItSaysFunc

function promptFunc() {
    inquirer.prompt([{
        type: "list",
        message: "Select a command. Hit Enter to confirm your selection.",
        choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says", ">Exit"],
        name: "selectedCommand"
    }]).then(function(answers) {
        fs.appendFileSync('log.txt', "Selected Command: " + answers.selectedCommand + '\n');
        switch (answers.selectedCommand) {
            case "my-tweets":
                myTweetsFunc();
                break;
            case "spotify-this-song":
                inquirer.prompt([{
                    type: "input",
                    message: "Please enter a song title:",
                    name: "userSong"
                }]).then(function(answers) {
                    userQuery = answers.userSong;
                    fs.appendFileSync('log.txt', "Song Searched: " + userQuery + '\n');
                    fs.appendFileSync('log.txt', "-----Output Below-----"+'\n');
                    spotifyThisSongFunc();
                });
                break;
            case "movie-this":
                inquirer.prompt([{
                    type: "input",
                    message: "Please enter a movie title:",
                    name: "userMovie"
                }]).then(function(answers) {
                    userQuery = answers.userMovie;
                    fs.appendFileSync('log.txt', "Movie Searched: " + userQuery + '\n');
                    fs.appendFileSync('log.txt', "-----Output Below-----"+'\n');
                    movieThisFunc();
                });
                break;
            case "do-what-it-says":
                doWhatItSaysFunc();
                break;
            case ">Exit":
                console.log("Thank you, come again.")
                break;
            default:
                console.log("Sorry, try again.")
                promptFunc();
                break;
        };

    });
}; //end of promptFunc

fs.appendFileSync('log.txt', '\n \n');
