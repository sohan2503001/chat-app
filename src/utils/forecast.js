const request = require("request");

const forecast = (latitude, longitude, callback) => {
    const url = 'http://api.weatherstack.com/current?access_key=733d154e5afc9b22ac319f3074fba99c&query=' + encodeURIComponent(latitude) + ',' + encodeURIComponent(longitude) + ''

    request({
        url,
        json: true,
    }, (error, {body} = {}) => {
        if (error) {
            callback("Unable to connect to weather service", undefined);
        } else if (body.error) {
            callback("Unable to find location", undefined);
        } else {
            callback(
                undefined, `${body.current.weather_descriptions[0]} It is currently ${body.current.temperature} degree out. But it feels like ${body.current.feelslike}`
            );
        }
    })
}

module.exports = forecast