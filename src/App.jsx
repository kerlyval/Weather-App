import { useState, useEffect } from 'react';
import axios from 'axios';
import {
	thunderstormSvg,
	drizzleSvg,
	rainSvg,
	snowSvg,
	atmosphereSvg,
	clearSvg,
	cloudSvg,
} from './assets/images';
import './App.css';
import Loading from './components/Loading'; // Importa el componente Loading

const key = '1bba36751fd24ae6bca3361af02034f9';
const url = 'https://api.openweathermap.org/data/2.5/weather';

const initialState = {
	latitude: 0,
	longitude: 0,
};

const conditionCodes = {
	thunderstorm: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
	drizzle: [300, 301, 302, 310, 311, 312, 313, 314, 321],
	rain: [500, 501, 502, 503, 504, 511, 520, 521, 522, 531],
	snow: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
	atmosphere: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
	clear: [800],
	clouds: [801, 802, 803, 804],
};

const icons = {
	thunderstorm: thunderstormSvg,
	drizzle: drizzleSvg,
	rain: rainSvg,
	snow: snowSvg,
	atmosphere: atmosphereSvg,
	clear: clearSvg,
	clouds: cloudSvg,
};

function App() {
	const [coords, setCoords] = useState(initialState);
	const [weather, setWeather] = useState({});
	const [toggle, setToggle] = useState(false);
	const [location, setLocation] = useState('');
	const [data, setData] = useState({});
	const [isLoading, setIsLoading] = useState(true); // Estado de carga

	// Función para obtener el clima por coordenadas
	const fetchWeatherByCoords = () => {
		setIsLoading(true); // Inicia la carga
		axios
			.get(`${url}?lat=${coords.latitude}&lon=${coords.longitude}&appid=${key}`)
			.then((res) => {
				updateWeatherData(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// Función para obtener el clima por ubicación
	const fetchWeatherByLocation = () => {
		setIsLoading(true); // Inicia la carga
		axios
			.get(`${url}?q=${location}&appid=${key}`)
			.then((response) => {
				setData(response.data);
				updateWeatherData(response.data);
				setLocation('');
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// Función para actualizar los datos del clima
	const updateWeatherData = (data) => {
		const keys = Object.keys(conditionCodes);
		const iconName = keys.find((key) =>
			conditionCodes[key].includes(data?.weather[0]?.id),
		);

		setWeather({
			city: data?.name,
			country: data?.sys?.country,
			icon: icons[iconName],
			main: data?.weather[0]?.main,
			wind: data?.wind?.speed,
			clouds: data?.clouds?.all,
			pressure: data?.main?.pressure,
			temperature: Math.floor(data?.main?.temp - 273.15),
			feels: Math.floor(data?.main?.feels_like - 273.15),
		});
	};

	// Función para buscar la ubicación cuando se presiona Enter
	const searchLocation = (e) => {
		if (e.key === 'Enter') {
			fetchWeatherByLocation();
		}
	};

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setCoords({ latitude, longitude });
			},
			(error) => {
				console.log('No aceptaste la ubicación');
			},
		);
	}, []);

	useEffect(() => {
		if (coords.latitude !== 0 && coords.longitude !== 0) {
			fetchWeatherByCoords();
		}
	}, [coords]);

	const temp = toggle
		? parseInt((weather.temperature * 9) / 5 + 32)
		: weather.temperature;
	const tempFeels = toggle
		? parseInt((weather.feels * 9) / 5 + 32)
		: weather.feels;

	// UseEffect para simular un retraso mínimo de 3 segundos y cargar los datos
	useEffect(() => {
		const fakeDataFetch = () => {
			setTimeout(() => {
				setIsLoading(false);
			}, 3000); // Espera 3 segundos antes de marcar como "no cargando"
		};

		fakeDataFetch();
	}, [weather]);

	// Mostrar el loader mientras `isLoading` es true
	return isLoading ? (
		<Loading />
	) : (
		<div className="card">
			<div className="app">
				<div className="search">
					<input
						type="text"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						onKeyDown={searchLocation}
						placeholder="Enter location"
					/>
				</div>

				<h1 className="card__title">Weather Forecasting</h1>
				<h2 className="card__subtitle">
					{weather.city}, {weather.country}
				</h2>

				<div className="card__body">
					<div className="card__icon-container">
						<img
							src={weather.icon}
							alt={weather.main}
							width={150}
							className="card__icon"
						/>
						<h3 className="card__main-condition">{weather.main}</h3>
					</div>

					<div className="card__temp-container">
						<h2 className="card__temperature">
							{temp} {toggle ? '°F' : '°C'}
						</h2>
						<p className="card__temp-feels">
							Feels like: {tempFeels} {toggle ? '°F' : '°C'}
						</p>
						<button onClick={() => setToggle(!toggle)} className="card__button">
							Change to {!toggle ? '°F' : '°C'}
						</button>
					</div>
				</div>

				<div className="card__info">
					<div className="card__info-box">
						<i className="bx bx-wind"></i>
						<p className="card__wind-speed">
							<b>WIND</b> <br /> {weather.wind} m/s
						</p>
					</div>
					<div className="card__info-box">
						<i className="bx bx-cloud"></i>
						<p className="card__clouds">
							<b>CLOUDS</b> {weather.clouds}%
						</p>
					</div>
					<div className="card__info-box">
						<i className="bx bx-stopwatch"></i>
						<p className="card__pressure">
							<b>PRESSURE</b> {weather.pressure} hPa
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
