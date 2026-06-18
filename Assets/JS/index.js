const url = 'https://api.openweather.org/data/2.5/'
const apiKey = "4ac46bdfd89b2e36ee51dc0778c1f956";
const citySearch = document.getElementById('city-search');

navigator.geolocation.getCurrentPosition((position) => {
  console.log(position.coords.latitude, position.coords.longitude);
});