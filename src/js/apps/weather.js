/**
 * FlowWeather App for Flowway TV OS
 * A weather app using OpenWeatherMap API
 */
const FlowWeather = {
  appId: 'weather',
  apiKey: '4d8fb5b93d4af21d66a2948710284366', // Demo API key for OpenWeatherMap
  currentCity: null,
  weatherData: null,
  
  /**
   * Initialize the app
   */
  init() {
    // Load last viewed city from storage
    this.currentCity = FlowStorage.get('weatherCity', 'London');
  },
  
  /**
   * Open the app
   */
  open() {
    // Check if window already exists
    if (FlowWindows.exists(this.appId)) {
      FlowWindows.bringToFront(this.appId);
      return;
    }
    
    // Get content template
    const template = document.getElementById('weather-app-template');
    if (!template) return;
    
    // Clone template content
    const content = template.content.cloneNode(true);
    
    // Create window
    const window = FlowWindows.create(this.appId, 'FlowWeather', content, {
      width: 800,
      height: 600
    });
    
    // Set up app events
    this.setupEvents(window);
    
    // Load weather for last city
    if (this.currentCity) {
      this.getWeather(this.currentCity);
    }
  },
  
  /**
   * Set up app event listeners
   * @param {HTMLElement} windowElement - The app window element
   */
  setupEvents(windowElement) {
    if (!windowElement) return;
    
    // Search button
    const searchInput = windowElement.querySelector('.weather-search input');
    const searchButton = windowElement.querySelector('.weather-search button');
    
    if (searchInput && searchButton) {
      // Search on button click
      searchButton.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
          this.getWeather(city);
        }
      });
      
      // Search on Enter key
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const city = searchInput.value.trim();
          if (city) {
            this.getWeather(city);
          }
        }
      });
      
      // Set initial search value to current city
      if (this.currentCity) {
        searchInput.value = this.currentCity;
      }
    }
  },
  
  /**
   * Get weather data for a city
   * @param {string} city - The city name
   */
  getWeather(city) {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    // Show loading state
    window.querySelector('.weather-current .city-name').textContent = 'Loading...';
    window.querySelector('.weather-current .weather-temp').textContent = '--°';
    window.querySelector('.weather-current .weather-desc').textContent = '--';
    window.querySelector('.weather-current .humidity').textContent = '--%';
    window.querySelector('.weather-current .wind').textContent = '-- km/h';
    window.querySelector('.weather-current .feels-like').textContent = '--°';
    
    // Clear forecast
    window.querySelector('.forecast-items').innerHTML = '';
    
    // Fetch current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('City not found');
        }
        return response.json();
      })
      .then(data => {
        // Save current city
        this.currentCity = city;
        FlowStorage.set('weatherCity', city);
        
        // Update UI with weather data
        this.updateWeatherUI(data);
        
        // Fetch forecast
        return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.apiKey}`);
      })
      .then(response => response.json())
      .then(data => {
        // Update forecast UI
        this.updateForecastUI(data);
      })
      .catch(error => {
        console.error('Weather error:', error);
        FlowUI.showNotification(`Error: ${error.message}`, 'error');
      });
  },
  
  /**
   * Update UI with current weather data
   * @param {Object} data - Weather data from API
   */
  updateWeatherUI(data) {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    // Save weather data
    this.weatherData = data;
    
    // Update city and date
    window.querySelector('.city-name').textContent = data.name;
    window.querySelector('.current-date').textContent = FlowUI.formatDate(new Date(), 'date');
    
    // Update temperature and description
    const temp = Math.round(data.main.temp);
    window.querySelector('.weather-temp').textContent = `${temp}°C`;
    
    const desc = data.weather[0].description;
    window.querySelector('.weather-desc').textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    
    // Update details
    window.querySelector('.humidity').textContent = `${data.main.humidity}%`;
    window.querySelector('.wind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    window.querySelector('.feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    
    // Update weather icon
    const iconEl = window.querySelector('.weather-icon');
    const weatherCode = data.weather[0].id;
    const isDay = this.isDay(data.sys.sunrise, data.sys.sunset, data.dt);
    
    iconEl.innerHTML = this.getWeatherIcon(weatherCode, isDay);
    
    // Update weather background
    const weatherContainer = window.querySelector('.weather-current');
    weatherContainer.className = 'weather-current';
    
    if (weatherCode >= 200 && weatherCode < 300) {
      weatherContainer.classList.add('thunderstorm');
    } else if (weatherCode >= 300 && weatherCode < 600) {
      weatherContainer.classList.add('rain');
    } else if (weatherCode >= 600 && weatherCode < 700) {
      weatherContainer.classList.add('snow');
    } else if (weatherCode >= 700 && weatherCode < 800) {
      weatherContainer.classList.add('atmosphere');
    } else if (weatherCode === 800) {
      weatherContainer.classList.add('clear');
    } else if (weatherCode > 800) {
      weatherContainer.classList.add('clouds');
    }
  },
  
  /**
   * Update UI with forecast data
   * @param {Object} data - Forecast data from API
   */
  updateForecastUI(data) {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const forecastItems = window.querySelector('.forecast-items');
    forecastItems.innerHTML = '';
    
    // Get one forecast per day (excluding today)
    const dailyForecasts = [];
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Group forecasts by day
    const forecastsByDay = {};
    
    data.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const day = date.setHours(0, 0, 0, 0);
      
      if (day > today) {
        if (!forecastsByDay[day]) {
          forecastsByDay[day] = [];
        }
        
        forecastsByDay[day].push(forecast);
      }
    });
    
    // Get middle forecast for each day
    for (const day in forecastsByDay) {
      const forecasts = forecastsByDay[day];
      const midIndex = Math.floor(forecasts.length / 2);
      dailyForecasts.push(forecasts[midIndex]);
      
      // Limit to 5 days
      if (dailyForecasts.length >= 5) break;
    }
    
    // Create forecast items
    dailyForecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
      const dateStr = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      
      const item = document.createElement('div');
      item.className = 'forecast-item';
      
      const forecastDate = document.createElement('div');
      forecastDate.className = 'forecast-date';
      forecastDate.textContent = `${dayName}, ${dateStr}`;
      
      const forecastIcon = document.createElement('div');
      forecastIcon.className = 'forecast-icon';
      forecastIcon.innerHTML = this.getWeatherIcon(forecast.weather[0].id, true);
      
      const forecastTemp = document.createElement('div');
      forecastTemp.className = 'forecast-temp';
      
      const maxTemp = document.createElement('div');
      maxTemp.className = 'forecast-temp-max';
      maxTemp.textContent = `${Math.round(forecast.main.temp_max)}°`;
      
      const minTemp = document.createElement('div');
      minTemp.className = 'forecast-temp-min';
      minTemp.textContent = `${Math.round(forecast.main.temp_min)}°`;
      
      forecastTemp.appendChild(maxTemp);
      forecastTemp.appendChild(minTemp);
      
      item.appendChild(forecastDate);
      item.appendChild(forecastIcon);
      item.appendChild(forecastTemp);
      
      forecastItems.appendChild(item);
    });
  },
  
  /**
   * Check if it's day or night
   * @param {number} sunrise - Sunrise timestamp
   * @param {number} sunset - Sunset timestamp
   * @param {number} current - Current timestamp
   * @returns {boolean} - True if it's day, false if night
   */
  isDay(sunrise, sunset, current) {
    return current >= sunrise && current < sunset;
  },
  
  /**
   * Get weather icon based on weather code
   * @param {number} code - Weather code
   * @param {boolean} isDay - Whether it's day or night
   * @returns {string} - Icon HTML
   */
  getWeatherIcon(code, isDay) {
    // Simple icon set
    if (code >= 200 && code < 300) {
      return '⛈️'; // Thunderstorm
    } else if (code >= 300 && code < 400) {
      return '🌧️'; // Drizzle
    } else if (code >= 500 && code < 600) {
      return '🌧️'; // Rain
    } else if (code >= 600 && code < 700) {
      return '❄️'; // Snow
    } else if (code >= 700 && code < 800) {
      return '🌫️'; // Atmosphere (fog, mist, etc.)
    } else if (code === 800) {
      return isDay ? '☀️' : '🌙'; // Clear
    } else if (code === 801) {
      return isDay ? '🌤️' : '☁️'; // Few clouds
    } else if (code === 802) {
      return isDay ? '⛅' : '☁️'; // Scattered clouds
    } else if (code === 803 || code === 804) {
      return '☁️'; // Broken or overcast clouds
    }
    
    return '❓'; // Unknown
  }
};