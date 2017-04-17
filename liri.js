var inquirer = require("inquirer");
var twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var myKeys = require("./keys.js")
var moment = require("moment");

var client = new twitter (myKeys.twitterKeys);
var userCommand = process.argv[2];

switch (userCommand) {
    case "my-tweets":
        myTweetsFunc();
        break;
    case "spotify-this-song":
        spotifyThisSongFunc();
        break;
    case "movie-this":
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
}

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
            	var tweetDate = tweets[i].created_at.slice(0, 11)+tweets[i].created_at.slice(-4)+tweets[i].created_at.slice(10,26)
            	
            	console.log("Date: "+moment(tweetDate, ["ddd MMM DD YYYY HH:mm:ss Z"]).format('LLL'))
            	console.log("Status: "+tweets[i].text);
            	console.log("");
            	console.log("-------------------------------");
            	console.log("");
            }
        } else {
        	console.log("Twitter err")
        	console.log(error)
        }
    });
}
