"use client";
import React from "react";
import styles from "./empty.module.scss";

export default function DayCalendar() {
  return (
    <div className={styles.empty}>
      <h2>Empty page</h2>
      <p>Please select a website</p>
    </div>
  );
}
