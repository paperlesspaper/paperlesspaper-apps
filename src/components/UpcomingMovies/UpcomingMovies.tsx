"use client";
import React, { useEffect, useState } from "react";
import { LoadingProvider } from "@/helpers/Loading";
import styles from "./upcomingMovies.module.scss";
import { useSearchParams } from "next/navigation";
import useTranslationFromUrl from "@/i18n/useTranslationFromUrl";
import classNames from "classnames";

interface Movie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string;
}

interface UpcomingMoviesProps {
  count: number;
  language?: string;
}

const languageLookup: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
};

export async function fetchUpcomingMovies({
  count = 5,
  language = "en",
}: UpcomingMoviesProps) {
  try {
    const languageWithCountry = languageLookup[language] || "en-US";
    const response = await fetch(
      `/api/upcomingmovies?limit=${count}&language=${languageWithCountry}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch upcoming movies");
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default function UpcomingMovies() {
  return (
    <LoadingProvider finishedLoading>
      <UpcomingMoviesScreen />
    </LoadingProvider>
  );
}

const UpcomingMoviesScreen: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const count = searchParams.get("count") || 5;
  const color = searchParams.get("color") || "dark";
  const accent = searchParams.get("accent") || "primary";
  const { language } = useTranslationFromUrl();
  console.log("UpcomingMoviesScreen language:", language);

  useEffect(() => {
    const getUpcomingMovies = async () => {
      try {
        const data = await fetchUpcomingMovies({
          count: Number(count),
          language: language,
        });
        console.log("Upcoming movies data:", data);

        setMovies(data.slice(0, count));
      } catch (err) {
        console.log("err", err);
        setError("Failed to fetch upcoming movies.");
      } finally {
        setLoading(false);
      }
    };

    getUpcomingMovies();
  }, [count]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const classes = classNames({
    [styles.upcomingMovies]: true,
    [styles[color]]: color,
    // [styles[kind]]: kind,
    [color]: color,
    [accent]: accent,
  });

  return (
    <div className={classes}>
      {movies.map((movie) => (
        <div key={movie.id} className={styles.movieCard}>
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className={styles.poster}
          />
          <p className={styles.releaseDate}>{movie.release_date}</p>
          <h3 className={styles.movieTitle}>{movie.title}</h3>

          <p className={styles.overview}>{movie.overview}</p>
        </div>
      ))}
    </div>
  );
};
