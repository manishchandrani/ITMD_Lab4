const appModule = (function () {
    const updateWeatherInfo = (data, date) => {
        const sunriseKey = date === 'today' ? 'todaySunrise' : 'tomorrowSunrise';
        const sunsetKey = date === 'today' ? 'todaySunset' : 'tomorrowSunset';
        const dawnKey = date === 'today' ? 'todayDawn' : 'tomorrowDawn';
        const duskKey = date === 'today' ? 'todayDusk' : 'tomorrowDusk';
        const dayLengthKey = date === 'today' ? 'todayDayLength' : 'tomorrowDayLength';
        const solarNoonKey = date === 'today' ? 'todaySolarNoon' : 'tomorrowSolarNoon';
        const timeZoneKey = date === 'today' ? 'todayTimeZone' : 'tomorrowTimeZone';

        document.getElementById(sunriseKey).innerHTML = ` ${data.results.sunrise}`;
        document.getElementById(sunsetKey).innerHTML = `${data.results.sunset}`;
        document.getElementById(dawnKey).innerHTML = `${data.results.dawn}`;
        document.getElementById(duskKey).innerHTML = `${data.results.dusk}`;
        document.getElementById(dayLengthKey).innerHTML = `${data.results.day_length} hours`;
        document.getElementById(solarNoonKey).innerHTML = `${data.results.solar_noon}`;

        const timeZoneElement = document.getElementById(timeZoneKey);
        if (data.results.timezone) {
            timeZoneElement.innerHTML = ` ${data.results.timezone}`;
        } else {
            timeZoneElement.innerHTML = 'Not available';
        }
    };
    const showResultSections = () => {
        document.getElementById('todaySection').style.display = 'block';
        document.getElementById('tomorrowSection').style.display = 'block';
    };
    const resetErrorMessage = () => {
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    };
    const hideResultSections = () => {
        document.getElementById('todaySection').style.display = 'none';
        document.getElementById('tomorrowSection').style.display = 'none';
    };

    const fetchWeatherData = async (latitude, longitude, date) => {
        try {
            resetErrorMessage();
            const url = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&date=${date}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            updateWeatherInfo(data, date);
            showResultSections();
            
        } catch (error) {
            console.error('Error:', error);
            hideResultSections(); // Hide sections in case of an error
            resetErrorMessage(); // Clear any previous error messages
            const errorMessageElement = document.getElementById('error-message');
            errorMessageElement.textContent = `Error: ${error.message}`;
            errorMessageElement.style.display = 'block';
        }
    };

    const getLocationAndTimings = async () => {
        try {
            resetErrorMessage();
            const userLocation = document.getElementById('userLocation').value;
            const errorMessageElement = document.getElementById('error-message');

            if (userLocation && userLocation.length > 0) {
                const geoUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(userLocation)}`;

                const response = await fetch(geoUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const firstMatch = data[0];

                if (firstMatch) {
                    const locationName = firstMatch.display_name;
                    const latitude = firstMatch.lat;
                    const longitude = firstMatch.lon;

                    await fetchWeatherData(latitude, longitude, 'today');
                    await fetchWeatherData(latitude, longitude, 'tomorrow');
                } else {                    
                    errorMessageElement.textContent = 'Error: No matching location found.';
                    errorMessageElement.style.display = 'block';
                    hideResultSections();
                    
                }
            } else {                
                errorMessageElement.textContent = 'Error: Please enter a valid location.';
                errorMessageElement.style.display = 'block';
                hideResultSections();
            }
        } catch (error) {            
            const errorMessageElement = document.getElementById('error-message');
            errorMessageElement.textContent = `Error: ${error.message}`;
            errorMessageElement.style.display = 'block';
            hideResultSections();
        }
    };

    const getCurrentLocation = () => {
        const handleError = (errorMessage) => {
            const errorMessageElement = document.getElementById('error-message');
            errorMessageElement.textContent = errorMessage;
            errorMessageElement.style.display = 'block';
            hideResultSections();
        };
        resetErrorMessage();
    
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
    
                    await fetchWeatherData(latitude, longitude, 'today');
                    await fetchWeatherData(latitude, longitude, 'tomorrow');
                },
                (error) => {
                    handleError('Error getting current location: ' + error.message);
                }
            );
        } else {
            handleError('Geolocation is not supported by this browser.');
        }
    };
    


    return {
        getLocationAndTimings: getLocationAndTimings,
        getCurrentLocation:getCurrentLocation,
    };
})();
