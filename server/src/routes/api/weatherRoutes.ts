import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
const getWeatherData = async (req: Request, res: Response) => {
  console.log('Request body:', req.body);
  const cityName = req.body.cityName;
  if (!cityName) {
    console.log('City name is missing in the request body');
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    console.log('Fetching weather data for city:', cityName);
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    console.log('Weather data retrieved:', weatherData);

    // Assuming weatherData is an array of weather objects
    const formattedWeatherData = weatherData.map((data: any) => ({
      city: cityName,
      date: new Date().toLocaleDateString(), // Add the date property
      temperature: data.temperature,
      humidity: data.humidity,
      description: data.description,
      wind: data.wind, // Add wind data
    }));

    await HistoryService.addCity(cityName); 
    console.log('City added to history:', cityName);
    return res.json(formattedWeatherData);
  } catch (error) {
    console.error('Error retrieving weather data:', error);
    return res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
};
router.post('/', getWeatherData);

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    console.log('Request received for search history:', req.method, req.url);
    const history = await HistoryService.getCities();
    return res.json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    return res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const cityId = parseInt(req.params.id, 10);
  if (isNaN(cityId)) {
    return res.status(400).json({ error: 'City ID is required and must be a number' });
  }

  try {
    await HistoryService.removeCity(cityId);
    return res.json({ message: 'City deleted from search history' });
  } catch (error) {
    console.error('Error deleting City from search history:', error);
    return res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
