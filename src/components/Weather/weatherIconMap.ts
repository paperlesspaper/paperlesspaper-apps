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
  type: "fontawesome";
  icon: IconDefinition;
  className: string;
};

export type ImageWeatherIconConfig = {
  type: "image";
  src: string;
  className: string;
};

export type ResolvedWeatherIconConfig =
  | WeatherIconConfig
  | ImageWeatherIconConfig;

const monochromeIconClass = "iconMonochrome";

// Map OpenWeather icon codes to FontAwesome equivalents with themed classes
export const weatherIconMap: Record<string, WeatherIconConfig> = {
  "01d": { type: "fontawesome", icon: faSun, className: "iconSun" },
  "01n": { type: "fontawesome", icon: faMoon, className: "iconMoon" },
  "02d": { type: "fontawesome", icon: faCloudSun, className: "iconCloudSun" },
  "02n": {
    type: "fontawesome",
    icon: faCloudMoon,
    className: "iconCloudNight",
  },
  "03d": { type: "fontawesome", icon: faCloud, className: "iconCloud" },
  "03n": { type: "fontawesome", icon: faCloud, className: "iconCloud" },
  "04d": { type: "fontawesome", icon: faCloud, className: "iconCloud" },
  "04n": { type: "fontawesome", icon: faCloud, className: "iconCloud" },
  "09d": {
    type: "fontawesome",
    icon: faCloudShowersHeavy,
    className: "iconRain",
  },
  "09n": {
    type: "fontawesome",
    icon: faCloudShowersHeavy,
    className: "iconRain",
  },
  "10d": {
    type: "fontawesome",
    icon: faCloudSunRain,
    className: "iconSunRain",
  },
  "10n": {
    type: "fontawesome",
    icon: faCloudMoonRain,
    className: "iconMoonRain",
  },
  "11d": { type: "fontawesome", icon: faCloudBolt, className: "iconThunder" },
  "11n": { type: "fontawesome", icon: faCloudBolt, className: "iconThunder" },
  "13d": { type: "fontawesome", icon: faSnowflake, className: "iconSnow" },
  "13n": { type: "fontawesome", icon: faSnowflake, className: "iconSnow" },
  "50d": { type: "fontawesome", icon: faSmog, className: "iconFog" },
  "50n": { type: "fontawesome", icon: faSmog, className: "iconFog" },
};

export const weatherIconMapLight: Record<string, WeatherIconConfig> = {
  "01d": { type: "fontawesome", icon: faSunLight, className: monochromeIconClass },
  "01n": { type: "fontawesome", icon: faMoonLight, className: monochromeIconClass },
  "02d": {
    type: "fontawesome",
    icon: faCloudSunLight,
    className: monochromeIconClass,
  },
  "02n": {
    type: "fontawesome",
    icon: faCloudMoonLight,
    className: monochromeIconClass,
  },
  "03d": {
    type: "fontawesome",
    icon: faCloudLight,
    className: monochromeIconClass,
  },
  "03n": {
    type: "fontawesome",
    icon: faCloudLight,
    className: monochromeIconClass,
  },
  "04d": {
    type: "fontawesome",
    icon: faCloudLight,
    className: monochromeIconClass,
  },
  "04n": {
    type: "fontawesome",
    icon: faCloudLight,
    className: monochromeIconClass,
  },
  "09d": {
    type: "fontawesome",
    icon: faCloudShowersHeavyLight,
    className: monochromeIconClass,
  },
  "09n": {
    type: "fontawesome",
    icon: faCloudShowersHeavyLight,
    className: monochromeIconClass,
  },
  "10d": {
    type: "fontawesome",
    icon: faCloudSunRainLight,
    className: monochromeIconClass,
  },
  "10n": {
    type: "fontawesome",
    icon: faCloudMoonRainLight,
    className: monochromeIconClass,
  },
  "11d": {
    type: "fontawesome",
    icon: faCloudBoltLight,
    className: monochromeIconClass,
  },
  "11n": {
    type: "fontawesome",
    icon: faCloudBoltLight,
    className: monochromeIconClass,
  },
  "13d": {
    type: "fontawesome",
    icon: faSnowflakeLight,
    className: monochromeIconClass,
  },
  "13n": {
    type: "fontawesome",
    icon: faSnowflakeLight,
    className: monochromeIconClass,
  },
  "50d": { type: "fontawesome", icon: faSmogLight, className: monochromeIconClass },
  "50n": { type: "fontawesome", icon: faSmogLight, className: monochromeIconClass },
};

const qweatherIconMap: Record<string, string> = {
  "01d": "100-fill",
  "01n": "150-fill",
  "02d": "102-fill",
  "02n": "152-fill",
  "03d": "101-fill",
  "03n": "151-fill",
  "04d": "104-fill",
  "04n": "104-fill",
  "09d": "300-fill",
  "09n": "300-fill",
  "10d": "306-fill",
  "10n": "306-fill",
  "11d": "302-fill",
  "11n": "302-fill",
  "13d": "400-fill",
  "13n": "400-fill",
  "50d": "501-fill",
  "50n": "501-fill",
};

const glyphsPolyIconMap: Record<string, string> = {
  "01d": "sun",
  "01n": "moon",
  "02d": "sunny-mostly",
  "02n": "cloudy-partly",
  "03d": "cloud",
  "03n": "cloud",
  "04d": "cloudy-mostly",
  "04n": "cloudy-mostly",
  "09d": "rain-1",
  "09n": "rain-1",
  "10d": "rain",
  "10n": "rain",
  "11d": "lightning",
  "11n": "lightning",
  "13d": "snow",
  "13n": "snow",
  "50d": "fog",
  "50n": "fog",
};

const notoEmojiIconMap: Record<string, string> = {
  "01d": "sun",
  "01n": "crescent-moon",
  "02d": "sun-behind-small-cloud",
  "02n": "cloud",
  "03d": "sun-behind-large-cloud",
  "03n": "cloud",
  "04d": "cloud",
  "04n": "cloud",
  "09d": "cloud-with-rain",
  "09n": "cloud-with-rain",
  "10d": "sun-behind-rain-cloud",
  "10n": "cloud-with-rain",
  "11d": "cloud-with-lightning-and-rain",
  "11n": "cloud-with-lightning-and-rain",
  "13d": "cloud-with-snow",
  "13n": "cloud-with-snow",
  "50d": "fog",
  "50n": "fog",
};

const openMojiIconMap: Record<string, string> = {
  "01d": "sun",
  "01n": "crescent-moon",
  "02d": "sun-behind-small-cloud",
  "02n": "cloud",
  "03d": "sun-behind-large-cloud",
  "03n": "cloud",
  "04d": "cloud",
  "04n": "cloud",
  "09d": "cloud-with-rain",
  "09n": "cloud-with-rain",
  "10d": "sun-behind-rain-cloud",
  "10n": "cloud-with-rain",
  "11d": "cloud-with-lightning-and-rain",
  "11n": "cloud-with-lightning-and-rain",
  "13d": "cloud-with-snow",
  "13n": "cloud-with-snow",
  "50d": "fog",
  "50n": "fog",
};

const iconifyUrl = (prefix: string, iconName: string) =>
  `https://api.iconify.design/${prefix}/${iconName}.svg`;

const openWeatherUrl = (iconCode: string) =>
  `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

const qweatherUrl = (iconName: string) =>
  `https://cdn.jsdelivr.net/npm/qweather-icons@1.8.0/icons/${iconName}.svg`;

const imageIcon = (
  iconCode: string,
  iconName: string | undefined,
  src: (iconName: string) => string,
  className = "iconExternal"
): ImageWeatherIconConfig => ({
  type: "image",
  src: src(iconName || iconCode),
  className,
});

export function getWeatherIconConfig(
  iconCode: string,
  iconSet = "normal"
): ResolvedWeatherIconConfig {
  const normalizedIconSet = iconSet.toLowerCase();

  if (["light", "fontawesome-light", "fa-light"].includes(normalizedIconSet)) {
    return weatherIconMapLight[iconCode] || weatherIconMapLight["01d"];
  }

  if (["qweather", "qweather-fill"].includes(normalizedIconSet)) {
    return imageIcon(
      iconCode,
      qweatherIconMap[iconCode],
      qweatherUrl,
      "iconExternal iconQweatherFill",
    );
  }

  if (["qweather-line", "qweather-outline"].includes(normalizedIconSet)) {
    const qweatherLineCode = qweatherIconMap[iconCode]?.replace("-fill", "");
    return imageIcon(iconCode, qweatherLineCode, qweatherUrl);
  }

  if (["glyphs-poly", "glyphspoly"].includes(normalizedIconSet)) {
    return imageIcon(iconCode, glyphsPolyIconMap[iconCode], (iconName) =>
      iconifyUrl("glyphs-poly", iconName)
    );
  }

  if (["noto-emoji", "noto", "emoji"].includes(normalizedIconSet)) {
    return imageIcon(iconCode, notoEmojiIconMap[iconCode], (iconName) =>
      iconifyUrl("noto", iconName)
    );
  }

  if (["openmoji", "open-moji"].includes(normalizedIconSet)) {
    return imageIcon(iconCode, openMojiIconMap[iconCode], (iconName) =>
      iconifyUrl("openmoji", iconName)
    );
  }

  if (["openweather", "openweathermap", "owm"].includes(normalizedIconSet)) {
    return imageIcon(iconCode, iconCode, openWeatherUrl, "iconOpenWeather");
  }

  return weatherIconMap[iconCode] || weatherIconMap["01d"];
}
