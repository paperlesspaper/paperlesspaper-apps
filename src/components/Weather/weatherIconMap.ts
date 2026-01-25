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
import {
  faSun as faSunLight,
  faMoon as faMoonLight,
  faCloudSun as faCloudSunLight,
  faCloudMoon as faCloudMoonLight,
  faCloud as faCloudLight,
  faCloudSunRain as faCloudSunRainLight,
  faCloudMoonRain as faCloudMoonRainLight,
  faCloudShowersHeavy as faCloudShowersHeavyLight,
  faCloudBolt as faCloudBoltLight,
  faSnowflake as faSnowflakeLight,
  faSmog as faSmogLight,
} from "@fortawesome/pro-light-svg-icons";

export type WeatherIconConfig = {
  icon: IconDefinition;
  className: string;
};

const monochromeIconClass = "iconMonochrome";

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

export const weatherIconMapLight: Record<string, WeatherIconConfig> = {
  "01d": { icon: faSunLight, className: monochromeIconClass },
  "01n": { icon: faMoonLight, className: monochromeIconClass },
  "02d": { icon: faCloudSunLight, className: monochromeIconClass },
  "02n": { icon: faCloudMoonLight, className: monochromeIconClass },
  "03d": { icon: faCloudLight, className: monochromeIconClass },
  "03n": { icon: faCloudLight, className: monochromeIconClass },
  "04d": { icon: faCloudLight, className: monochromeIconClass },
  "04n": { icon: faCloudLight, className: monochromeIconClass },
  "09d": { icon: faCloudShowersHeavyLight, className: monochromeIconClass },
  "09n": { icon: faCloudShowersHeavyLight, className: monochromeIconClass },
  "10d": { icon: faCloudSunRainLight, className: monochromeIconClass },
  "10n": { icon: faCloudMoonRainLight, className: monochromeIconClass },
  "11d": { icon: faCloudBoltLight, className: monochromeIconClass },
  "11n": { icon: faCloudBoltLight, className: monochromeIconClass },
  "13d": { icon: faSnowflakeLight, className: monochromeIconClass },
  "13n": { icon: faSnowflakeLight, className: monochromeIconClass },
  "50d": { icon: faSmogLight, className: monochromeIconClass },
  "50n": { icon: faSmogLight, className: monochromeIconClass },
};
