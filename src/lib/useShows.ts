"use client";
import { useState, useEffect } from "react";
import { Show } from "./types";

export function useShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shows")
      .then((res) => res.json())
      .then((data) => {
        setShows(data);
        setLoading(false);
      });
  }, []);

  const updateShow = async (show: Show) => {
    const res = await fetch(`/api/shows/${show.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(show),
    });
    const updated = await res.json();
    setShows((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return { shows, loading, updateShow };
}
