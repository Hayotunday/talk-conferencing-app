"use client";

import React, { useEffect, useState } from "react";

interface ClockProps {
  variant: "time" | "day";
  initial: number;
}

const Clock = ({ variant, initial }: ClockProps) => {
  const [date, setDate] = useState(new Date(initial));

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <>
      {variant === "time" &&
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      {variant === "day" &&
        date.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
    </>
  );
};

export default Clock;
