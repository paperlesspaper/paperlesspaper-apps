/* eslint-disable @next/next/no-img-element */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getWeatherIconConfig } from "./weatherIconMap";
import styles from "./weatherConditionIcon.module.scss";

type WeatherConditionIconProps = {
  alt?: string;
  classNameMap?: Record<string, string>;
  fontAwesomeClassName?: string;
  iconCode: string;
  iconSet?: string;
  imageClassName: string;
};

export default function WeatherConditionIcon({
  alt = "weather icon",
  classNameMap = {},
  fontAwesomeClassName,
  iconCode,
  iconSet,
  imageClassName,
}: WeatherConditionIconProps) {
  const iconConfig = getWeatherIconConfig(iconCode, iconSet);
  const themedClassNames = iconConfig.className
    .split(" ")
    .map((className) => styles[className] || classNameMap[className])
    .filter(Boolean)
    .join(" ");

  if (iconConfig.type === "fontawesome") {
    return (
      <FontAwesomeIcon
        icon={iconConfig.icon}
        className={[fontAwesomeClassName || imageClassName, styles.colored, themedClassNames]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  return (
    <img
      alt={alt}
      className={[imageClassName, themedClassNames].filter(Boolean).join(" ")}
      src={iconConfig.src}
    />
  );
}
