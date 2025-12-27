import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faSun,
  faMoon,
  faCloudSun,
  faCloudMoon,
  faCloud,
  faCloudSunRain,
  faCloudMoonRain,
  // faCloudRain,
  faCloudShowersHeavy,
  faCloudBolt,
  faSnowflake,
  faSmog,
} from "@fortawesome/pro-duotone-svg-icons";

export type WeatherIconConfig = {
  icon: IconDefinition;
  className: string;
};

// Map OpenWeather icon codes to FontAwesome equivalents with themed classes
export const weatherIconMap: Record<string, WeatherIconConfig> = {
  "01d": { icon: faSun, className: "iconSun" },
  "01n": { icon: faMoon, className: "iconMoon" },
  "02d": { icon: faCloudSun, className: "iconCloud" },
  "02n": { icon: faCloudMoon, className: "iconCloudNight" },
  "03d": { icon: faCloud, className: "iconCloud" },
  "03n": { icon: faCloud, className: "iconCloud" },
  "04d": { icon: faCloud, className: "iconCloud" },
  "04n": { icon: faCloud, className: "iconCloud" },
  "09d": { icon: faCloudShowersHeavy, className: "iconRain" },
  "09n": { icon: faCloudShowersHeavy, className: "iconRain" },
  "10d": { icon: faCloudSunRain, className: "iconSunRain" },
  "10n": { icon: faCloudMoonRain, className: "iconRain" },
  "11d": { icon: faCloudBolt, className: "iconThunder" },
  "11n": { icon: faCloudBolt, className: "iconThunder" },
  "13d": { icon: faSnowflake, className: "iconSnow" },
  "13n": { icon: faSnowflake, className: "iconSnow" },
  "50d": { icon: faSmog, className: "iconFog" },
  "50n": { icon: faSmog, className: "iconFog" },
};
