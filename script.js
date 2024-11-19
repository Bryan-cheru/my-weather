// Weather API Configuration
const CONFIG = {
    API_KEY: '60c3ac84befc40a196671804241911',
    BASE_URL: 'https://api.weatherapi.com/v1',
    DEFAULT_CITY: 'London'
};

// Weather Assets Configuration
const weatherAssets = {
    backgrounds: {
        1000: {
            day: 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5',  // Clear sky day
            night: 'https://images.unsplash.com/photo-1532978379970-2260b27abc65'  // Clear sky night
        },
        1003: {
            day: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2',   // Partly cloudy day
            night: 'https://images.unsplash.com/photo-1534073828943-f801091bb18f'   // Partly cloudy night
        },
        1006: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda',     // Cloudy
        1009: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17',     // Overcast
        1030: 'https://images.unsplash.com/photo-1543968996-ee822b8176ba',        // Mist
        1063: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17',     // Rain
        1087: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28',     // Thunder
        1114: 'https://images.unsplash.com/photo-1547754980-3df97fed72a8',        // Snow
        1135: 'https://images.unsplash.com/photo-1543968996-ee822b8176ba',        // Fog
        1183: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17',     // Light rain
        1189: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17',     // Moderate rain
        1195: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17',     // Heavy rain
        1273: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28',     // Thunder with rain
        getBackground(code, isDay = 1) {
            const bg = this[code];
            if (bg && typeof bg === 'object') {
                return isDay ? bg.day : bg.night;
            }
            return bg || this[1006]; // Default to cloudy if code not found
        }
    }
};

// Function to update background with loading handling
function updateBackground(weatherCode, isDay) {
    const backgroundUrl = weatherAssets.backgrounds.getBackground(weatherCode, isDay);
    const img = new Image();
    img.src = backgroundUrl;
    
    // Add loading class while image is loading
    document.body.classList.add('background-loading');
    
    img.onload = () => {
        document.body.style.backgroundImage = `url(${backgroundUrl})`;
        // Remove loading class once image is loaded
        document.body.classList.remove('background-loading');
    };
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const elements = {
        cityInput: document.getElementById('cityInput'),
        weatherInfo: document.getElementById('weatherInfo'),
        errorMessage: document.getElementById('errorMessage'),
        cityName: document.getElementById('cityName'),
        localTime: document.getElementById('localTime'),
        temperature: document.getElementById('temperature'),
        weatherDescription: document.getElementById('weatherDescription'),
        weatherIcon: document.getElementById('weatherIcon'),
        feelsLike: document.getElementById('feelsLike'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('windSpeed'),
        pressure: document.getElementById('pressure'),
        uvIndex: document.getElementById('uvIndex'),
        visibility: document.getElementById('visibility'),
        sunrise: document.getElementById('sunrise'),
        sunset: document.getElementById('sunset'),
        hourlyForecast: document.getElementById('hourlyForecast'),
        dailyForecast: document.getElementById('dailyForecast'),
        recentSearches: document.getElementById('recentSearches'),
        themeToggle: document.getElementById('themeToggle')
    };

    // Theme Management
    const themeManager = {
        init() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            this.setTheme(savedTheme);
            elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
        },

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.updateThemeIcon(theme);
        },

        toggleTheme() {
            const currentTheme = localStorage.getItem('theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        },

        updateThemeIcon(theme) {
            const icon = elements.themeToggle?.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    };

    // Weather Icons Mapping
    const weatherIcons = {
        1000: 'sun', // Clear
        1003: 'cloud-sun', // Partly cloudy
        1006: 'cloud', // Cloudy
        1009: 'clouds', // Overcast
        1030: 'smog', // Mist
        1063: 'cloud-rain', // Patchy rain
        1087: 'bolt', // Thundery outbreaks
        1114: 'snowflake', // Blowing snow
        1135: 'fog', // Fog
        1183: 'cloud-showers-heavy', // Light rain
        1189: 'cloud-showers-heavy', // Moderate rain
        1195: 'cloud-showers-heavy', // Heavy rain
        1273: 'bolt', // Patchy light rain with thunder
        getIcon(code) {
            return this[code] || 'cloud';
        }
    };

    // Utility Functions
    const utils = {
        formatTemperature: temp => `${Math.round(temp)}°C`,
        formatWindSpeed: speed => `${speed.toFixed(1)} km/h`,
        formatPressure: pressure => `${pressure} hPa`,
        formatHumidity: humidity => `${humidity}%`,
        formatVisibility: visibility => `${visibility} km`,
        formatUV: uv => {
            if (uv <= 2) return `${uv} (Low)`;
            if (uv <= 5) return `${uv} (Moderate)`;
            if (uv <= 7) return `${uv} (High)`;
            return `${uv} (Very High)`;
        },
        formatTime: (time) => {
            return new Date(time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        },
        formatDate: (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // Recent Searches Management
    const recentSearchesManager = {
        getSearches() {
            return JSON.parse(localStorage.getItem('recentSearches') || '[]');
        },

        addSearch(cityName) {
            let searches = this.getSearches();
            searches = [cityName, ...searches.filter(city => city !== cityName)].slice(0, 5);
            localStorage.setItem('recentSearches', JSON.stringify(searches));
            this.displaySearches();
        },

        displaySearches() {
            if (!elements.recentSearches) return;
            
            elements.recentSearches.innerHTML = this.getSearches()
                .map(city => `
                    <div class="recent-search-item" onclick="getWeather('${city}')">
                        ${city}
                    </div>
                `).join('');
        }
    };

    // Weather Display Functions
    function updateWeatherIcon(code) {
        if (elements.weatherIcon) {
            elements.weatherIcon.className = `fas fa-${weatherIcons.getIcon(code)}`;
        }
    }

    // Update background based on weather
function updateBackground(weatherCode, isDay) {
    const backgroundUrl = weatherAssets.backgrounds.getBackground(weatherCode, isDay);
    document.body.style.backgroundImage = `url(${backgroundUrl})`;
}

function displayCurrentWeather(data) {
        if (!elements.weatherInfo) return;
        
        // Update background based on weather condition
        updateBackground(data.current.condition.code, data.current.is_day);

        elements.weatherInfo.classList.add('active');
        elements.cityName.textContent = `${data.location.name}, ${data.location.country}`;
        elements.localTime.textContent = utils.formatTime(data.location.localtime);
        elements.temperature.textContent = utils.formatTemperature(data.current.temp_c);
        elements.weatherDescription.textContent = data.current.condition.text;
        elements.feelsLike.textContent = utils.formatTemperature(data.current.feelslike_c);
        elements.humidity.textContent = utils.formatHumidity(data.current.humidity);
        elements.windSpeed.textContent = utils.formatWindSpeed(data.current.wind_kph);
        elements.pressure.textContent = utils.formatPressure(data.current.pressure_mb);
        elements.uvIndex.textContent = utils.formatUV(data.current.uv);
        elements.visibility.textContent = utils.formatVisibility(data.current.vis_km);

        updateWeatherIcon(data.current.condition.code);
    }

    function displayHourlyForecast(forecast) {
        if (!elements.hourlyForecast) return;

        elements.hourlyForecast.innerHTML = forecast.hour
            .filter((_, index) => index % 3 === 0) // Show every 3 hours
            .map(hour => `
                <div class="forecast-card">
                    <div class="forecast-time">${utils.formatTime(hour.time)}</div>
                    <i class="fas fa-${weatherIcons.getIcon(hour.condition.code)}"></i>
                    <div class="forecast-temp">${utils.formatTemperature(hour.temp_c)}</div>
                </div>
            `).join('');
    }

    function displayDailyForecast(forecast) {
        if (!elements.dailyForecast) return;

        elements.dailyForecast.innerHTML = forecast.forecastday
            .map(day => `
                <div class="forecast-card">
                    <div class="forecast-date">${utils.formatDate(day.date)}</div>
                    <i class="fas fa-${weatherIcons.getIcon(day.day.condition.code)}"></i>
                    <div class="forecast-temp-max">${utils.formatTemperature(day.day.maxtemp_c)}</div>
                    <div class="forecast-temp-min">${utils.formatTemperature(day.day.mintemp_c)}</div>
                </div>
            `).join('');
    }

    // API Functions
    async function fetchWeatherData(city) {
        try {
            const response = await fetch(
                `${CONFIG.BASE_URL}/forecast.json?key=${CONFIG.API_KEY}&q=${encodeURIComponent(city)}&days=5&aqi=no`
            );
            
            if (!response.ok) {
                throw new Error(response.status === 400 ? 'City not found' : 'Failed to fetch weather data');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Main Weather Function
    async function getWeather(city) {
        const searchCity = city || elements.cityInput?.value.trim();
        
        if (!searchCity) {
            showError('Please enter a city name');
            return;
        }

        showLoading();
        hideError();

        try {
            const data = await fetchWeatherData(searchCity);
            displayCurrentWeather(data);
            displayHourlyForecast(data.forecast.forecastday[0]);
            displayDailyForecast(data.forecast);
            recentSearchesManager.addSearch(data.location.name);
            
            if (elements.cityInput) {
                elements.cityInput.value = '';
            }
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }

    // UI State Functions
    function showLoading() {
        if (elements.cityInput) elements.cityInput.disabled = true;
        const searchButton = document.querySelector('.search-box button');
        if (searchButton) {
            searchButton.disabled = true;
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
    }

    function hideLoading() {
        if (elements.cityInput) elements.cityInput.disabled = false;
        const searchButton = document.querySelector('.search-box button');
        if (searchButton) {
            searchButton.disabled = false;
            searchButton.innerHTML = 'Search';
        }
    }

    function showError(message) {
        if (elements.errorMessage) {
            elements.errorMessage.textContent = message;
            elements.errorMessage.style.display = 'block';
        }
        if (elements.weatherInfo) {
            elements.weatherInfo.classList.remove('active');
        }
        setTimeout(hideError, 5000);
    }

    function hideError() {
        if (elements.errorMessage) {
            elements.errorMessage.style.display = 'none';
        }
    }

    // Event Listeners
    function setupEventListeners() {
        // Search input events
        elements.cityInput?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                getWeather();
            }
        });

        // Input validation
        elements.cityInput?.addEventListener('input', (event) => {
            const value = event.target.value;
            if (!/^[a-zA-Z\s\-\.',]*$/.test(value)) {
                event.target.value = value.replace(/[^a-zA-Z\s\-\.',]/g, '');
            }
        });
    }

    // Initialization
    function init() {
        themeManager.init();
        recentSearchesManager.displaySearches();
        setupEventListeners();
        
        // Load default city
        getWeather(CONFIG.DEFAULT_CITY);
    }

    // Initialize the app
    init();

    // Make getWeather function globally available
    window.getWeather = getWeather;
});
