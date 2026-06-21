/* Goals and todos 
[x] Grab urls and api key and save them to variables
[x] Grab city search value and save it to a variable
[x] Create funtion for creating the weather cards
[] Create function to call weather data and render it to the page
[] Save searched citys to local storage
[] Create function to render searched citys from local storage to the page
*/

// Global variables
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const apiKey = '67e11f9d494c16ce26c1e7eb214d3c7a';
let currentWeatherData;
let forecastWeatherData;
let savedCities = [];
// DOM Elements
const citySearch = document.getElementById('city-search');
const searchButton = document.getElementById('search-button');
const currentWeatherContainer = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastWeather');
const recentSearches = document.getElementById('recentSearches');
const date = new Date().toLocaleDateString();

function createWeatherCard(type, cityorDate, icon, date, temp, humidity, wind) {
	if (!cityorDate || !icon || !date || !temp || !humidity || !wind) {
		console.error(
			'Missing required parameters for createWeatherCard function',
		);
		return '';
	}
	const weatherCard = `
  <div class="d-flex flex-row justify-content-around p-4 border-bottom">
    <div>
      <div class="d-flex flex-row align-items-center gap-2">
        <h3 class="mb-2 fs-1 fw-bold text-center">${cityorDate}</h3>
        <p class="mx-3">${date}</p>
        <img src="https://openweathermap.org/payload/api/media/file/${icon}.png"
        </div>
    </div>
    <div class="d-flex flex-column align-items-center gap-2">
      <div>Temp: ${temp} Farenheit</div>
      <div>Humidity: ${humidity}%</div>
      <div>Wind: ${wind} MPH</div>
    </div>
  </div>`;

	const currentWeatherCard = `
  <div class="todayWeather w-100 border-bottom">
    <p class="fs-3 fw-bold text-center">Current Weather</p>
    ${weatherCard}
  </div>`;

	const forecastWeatherCard = weatherCard;

	if (type === 'current') {
		return currentWeatherCard;
	} else if (type === 'forecast') {
		return forecastWeatherCard;
	} else {
		console.error('Invalid type parameter for createWeatherCard function');
		return '';
	}
}

function getWeatherData(city) {
	if (!city) {
		console.error('City parameter is required for getWeatherData function');
		return;
	}

	let lon;
	let lat;

	const currentWeatherCall = async () => {
		const response = await fetch(
			`${weatherUrl}?q=${city}&appid=${apiKey}&units=imperial`,
		);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const weatherData = await response.json();
		currentWeatherData = await weatherData;
	};

	const forecastWeatherCall = async () => {
		const response = await fetch(
			`${forecastUrl}?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}&units=imperial`,
		);
		if (!response.ok) {
			console.error('Network response was not ok');
		}
		const forecastData = await response.json();
		forecastWeatherData = await forecastData;
	};

	return currentWeatherCall()
		.then(() => {
			lon = currentWeatherData.coord.lon;
			lat = currentWeatherData.coord.lat;
			// console.log(currentWeatherData)
			// console.log(lat, lon);
		})
		.then(() => {
			return forecastWeatherCall()
				.then(() => {
					// console.log(forecastWeatherData);
				})
				.catch((error) => {
					console.log('Error fetching weather data:', error);
				});
		})
		.catch((error) => {
			console.error('Error fetching weather data:', error);
		});
}

async function render() {
	if (
		currentWeatherContainer.childElementCount > 0 ||
		forecastContainer.childElementCount > 0
	) {
		forecastContainer.innerHTML = '';
		currentWeatherContainer.innerHTML = '';
	}

	const currentWeatherCard = createWeatherCard(
		'current',
		currentWeatherData.name,
		currentWeatherData.weather[0].icon,
		date,
		currentWeatherData.main.temp,
		currentWeatherData.main.humidity,
		currentWeatherData.wind.speed,
	);

	const forecastCards = [];

	for (let i = 0; i < 40; i += 8) {
		const forecastData = forecastWeatherData.list[i];
		const unixTime = forecastWeatherData.list[i].dt;
		const weatherDay = new Date(unixTime * 1000);

		const forecastCard = createWeatherCard(
			'forecast',
			weatherDay.toLocaleDateString('en-us', { weekday: 'long' }),
			forecastData.weather[0].icon,
			weatherDay.toLocaleDateString(),
			forecastData.main.temp,
			forecastData.main.humidity,
			forecastData.wind.speed,
		);

		forecastCards.push(forecastCard);
	}

	currentWeatherContainer.innerHTML = currentWeatherCard;

	forecastContainer.innerHTML =
		'<h3 id="forecastHeader" class="fs-3 text-center mt-5 fw-bolder">5 Day Forecast</h3>';
	forecastCards.forEach((forecastCard) => {
		forecastContainer.insertAdjacentHTML('beforeend', forecastCard);
	});
}

function renderSavedCities() {
	// Clear existing content first
	recentSearches.innerHTML = '';

	if (savedCities.length > 0) {
		savedCities.forEach((city) => {
			let recentCityCard = `<p class="text-black border rounded-pill p-2">${city}</p>`;
			recentSearches.insertAdjacentHTML('beforeend', recentCityCard);
		});

		const cityElements = recentSearches.querySelectorAll('p');
		cityElements.forEach((element, index) => {
			element.addEventListener('click', (e) => {
				getWeatherData(savedCities[index]).then(() => {
					render();
				});
			});
		});
	}
}

function saveState() {
	localStorage.setItem('savedCities', JSON.stringify(savedCities));
}

// Render and initalize the page
savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
renderSavedCities();
searchButton.addEventListener('click', (e) => {
	e.preventDefault();
	if (e.target) {
		console.log(citySearch.value);
		getWeatherData(citySearch.value)
			.then(() => {
				render();
				if (!savedCities.includes(citySearch.value)) {
					savedCities.push(citySearch.value);
				}
				saveState();
				renderSavedCities();
				console.log(savedCities);
				citySearch.value = '';
			})
			.catch((error) => {
				console.log(error);
			});
	}
});
