import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  icon: string; // Add icon property
  date: string; // Add date property

  constructor(temperature: number, humidity: number, description: string, windSpeed: number, icon?: string, date?: string) {
    this.temperature = temperature;
    this.humidity = humidity;
    this.description = description;
    this.windSpeed = windSpeed;
    this.icon = icon || ''; // Initialize icon with default value
    this.date = date || ''; // Initialize date with default value
  }
}

// Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private geocodeBaseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.geocodeBaseURL = process.env.GEOCODE_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }
  
  // Create fetchLocationData method
  private async fetchLocationData(cityName: string): Promise<any> {
    const response = await fetch(this.buildGeocodeQuery(cityName));
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates');
    }
    const data = await response.json();
    console.log('Geocode API response:', data); // Log the response for debugging
    if (data.length === 0) {
      throw new Error('No coordinates found for the specified city');
    }
    return data;
  }

  // Create buildGeocodeQuery method
  private buildGeocodeQuery(cityName: string): string {
    return `${this.geocodeBaseURL}?q=${cityName}&appid=${this.apiKey}`;
  }

  // Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(cityName: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(cityName);
    return this.destructureLocationData(locationData);
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) {
      throw new Error('Failed to get weather data');
    }
    const data = await response.json();
    return data;
  }

  // Update destructureLocationData method to handle the provided location data structure
  private destructureLocationData(locationData: any): Coordinates {
    console.log('Location data received:', locationData); // Log the location data for debugging
    if (!locationData || locationData.length === 0 || !locationData[0].lat || !locationData[0].lon) {
      throw new Error('Invalid location data structure');
    }
    const coordinates: Coordinates = {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    };
    return coordinates;
  }

   // Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const currentWeather = response.list[0];
    const weather = new Weather(
      currentWeather.main.temp,
      currentWeather.main.humidity,
      currentWeather.weather[0].description,
      currentWeather.wind.speed,
      currentWeather.weather[0].icon // Ensure icon is assigned
    );
    return weather;
  }

  private buildForecastArray(weatherData: any[]): Weather[] {
    const forecastArray: Weather[] = weatherData.map((data, index) => {
      const forecastDate = new Date(data.dt_txt);
      forecastDate.setDate(forecastDate.getDate() + index);
      return new Weather(
        data.main.temp,
        data.main.humidity,
        data.weather[0].description,
        data.wind.speed,
        data.weather[0].icon || '', // Ensure icon is a string
        forecastDate.toLocaleDateString()
      );
    });
    return forecastArray;
  }
  // Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      this.parseCurrentWeather(weatherData);
      const forecastArray = this.buildForecastArray(weatherData.list.slice(1, 6));
      return forecastArray;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
}

export default new WeatherService();
