function updateTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');  // Minutes with leading zero
  const seconds = now.getSeconds().toString().padStart(2, '0');  // Seconds with leading zero

  // Determine AM or PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12;  // The hour '0' should be '12'

  const timeString = `${hours}:${minutes}:${seconds} ${period}`;

  document.getElementById('time').innerText = timeString;
}

// Call updateTime every second to keep it updated
setInterval(updateTime, 1000);

// Initial call to display time right away
updateTime();

// Wifi speeed

function updateDownloadSpeed() {
  // Check if the Network Information API is available
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    // Get the download speed (in Mbps)
    const downlink = connection.downlink; 

    // Display the download speed in Mbps
    const speedString = `Download Speed:
     ${downlink.toFixed(2)} Mbps`;
    document.getElementById('download-speed').innerText = speedString;
  } else {
    document.getElementById('download-speed').innerText = "Download speed information not available";
  }
}

// Call updateDownloadSpeed every 5 seconds to keep it updated
setInterval(updateDownloadSpeed, 5000);

// Initial call to display the download speed
updateDownloadSpeed();

// Weather

// Your OpenWeatherMap API Key (replace with your actual key)
const apiKey = '8b2110a5c77f9120234ccb4b01421d87'; // Replace with your own API key
const city = 'Kozhikode, IN'; // Replace with your desired city
const units = 'metric'; // Use 'metric' for Celsius, 'imperial' for Fahrenheit

// Function to fetch the current temperature
function updateTemperature() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Extract temperature from the data
      const temperature = data.main.temp;
      document.getElementById('temperature').innerText = `${temperature}°C`;
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      document.getElementById('temperature').innerText = 'Failed to load temperature data';
    });
}

// Call the function to fetch the temperature
updateTemperature();
