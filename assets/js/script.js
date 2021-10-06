var searchHistory = [];

var apiKey = 'cbefe53efd326cfe40ecc5414fa89b29';
var rootUrl = 'https://api.openweathermap.org';

var currentWeather = document.querySelector('#current-day');
var futureWeather = document.querySelector('#future-days');
var futureCards = document.querySelector('#future-day-cards')
var historyList = document.querySelector('#history');
var city = "";

function getLatLong(data) {
    console.log(data);
    
    var coordinatesUrl = `${rootUrl}/geo/1.0/direct?q=${data}&limit=5&appid=${apiKey}`;

    historyObj = {
        savedCity: data,
        savedUrl: coordinatesUrl
    };

    for (var index = 0; index < searchHistory.length; index++) {
        if (searchHistory[index].savedCity == data) {
            searchHistory.splice(index, 1);
        };
    };

    searchHistory.push(historyObj);
    localStorage.setItem("cityStorage", JSON.stringify(searchHistory));

    loadHistory();
    
    fetch(coordinatesUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            getWeather(data[0].lat, data[0].lon);
        });
}

function getWeather(lat, lon) {
    var weatherUrl = `${rootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`

    fetch (weatherUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            displayWeather(data);
        })
}

function displayWeather(url) {
    $(currentWeather).addClass("card")
    var currentDate = moment.unix(url.current.dt).format("(MM/DD/YYYY)");
    $(currentWeather).children("h3").text(city + " " + currentDate);

    var currentIcon = url.current.weather[0].icon;
    currentIcon = `https://openweathermap.org/img/wn/${currentIcon}.png`;
    var currentImg = $(`<img alt="Current Weather Icon" src="${currentIcon}" height="40px" width="40px">`)
    $(currentWeather).children("h3").append(currentImg);

    var currentTemp = url.current.temp;
    $(currentWeather).children("#current-temp").text("Temp: " + currentTemp + "°F");
    var currentWind = url.current.wind_speed;
    $(currentWeather).children("#current-wind").text("Wind: " + currentWind + " MPH");
    var currentHumidity = url.current.humidity;
    $(currentWeather).children("#current-humidity").text("Humidity: " + currentHumidity + "%");
    var currentUvi = url.current.uvi;
    $(currentWeather).children("#current-uv").text("UV Index: " + currentUvi);
    if (currentUvi <= 2) {
        $("#current-uv").addClass("low");
    } else if (currentUvi <= 7) {
        $("#current-uv").addClass("moderate");
    } else {
        $("#current-uv").addClass("high");
    }

    $(futureWeather).children("h3").text("5-Day Forecast:")

    if (!$(futureCards).children("div").text()) {
        for (let index = 1; index < 6; index++) {
            var futureDay = url.daily[index];
            var futureDiv = $(`<div class="col-2 col-md-2" id="${futureDay.dt}">`);
            $(futureCards).append(futureDiv);
            var divTitle = $(`<h3>`);
            $(`#${futureDay.dt}`).append(divTitle);
            var futureDate = moment.unix(futureDay.dt).format("MM/DD/YYYY");
            $(futureDiv).children("h3").text(futureDate);

            var futureIcon = futureDay.weather[0].icon;
            futureIcon = `https://openweathermap.org/img/wn/${futureIcon}.png`;
            var futureImg = $(`<img alt="Future Weather Icon" src="${futureIcon}" height="40px" width="40px">`);
            $(`#${futureDay.dt}`).append(futureImg);

            var futureTemp = futureDay.temp.day;
            var tempEl = $("<p id='future-temp'>");
            $(`#${futureDay.dt}`).append(tempEl);
            $(`#${futureDay.dt}`).children("#future-temp").text("Temp: " + futureTemp + "°F");
            var futureWind = futureDay.wind_speed;
            var windEl = $("<p id='future-wind'>");
            $(`#${futureDay.dt}`).append(windEl);
            $(`#${futureDay.dt}`).children("#future-wind").text("Wind: " + futureWind + " MPH");
            var futureHumidity = futureDay.humidity;
            var humidityEl = $("<p id='future-humidity'>");
            $(`#${futureDay.dt}`).append(humidityEl);
            $(`#${futureDay.dt}`).children("#future-humidity").text("Humidity: " + futureHumidity + "%");
        };
    };
    city = "";
}

function loadHistory() {

    searchHistory = JSON.parse(localStorage.getItem("cityStorage"));

    if (!searchHistory) {
        searchHistory = [];
    }

    while (historyList.firstChild) {
        historyList.removeChild(historyList.firstChild);
    }

    for (var index = 0; index < searchHistory.length; index++) {
        var cityList = document.createElement("button");
        cityList.setAttribute("id", searchHistory[index].savedCity);
        cityList.setAttribute("class", "history-button");

        cityList.textContent = searchHistory[index].savedCity;
        historyList.appendChild(cityList);
    };

    console.log(historyList.childNodes);
}

loadHistory();

$("#city-form").on('submit', function(event) {
    event.preventDefault();
    city = $("#city-input").val();
    getLatLong(city);
});

$("#history").children("button").on('click', function(event) {
    city = $(this).text();
    getLatLong(city);
});
