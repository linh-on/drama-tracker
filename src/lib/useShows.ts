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

    // Preserve keywords from the original show since PUT doesn't return them
    setShows((prev) =>
      prev.map((s) =>
        s.id === updated.id ? { ...updated, keywords: show.keywords } : s,
      ),
    );
  };

  return { shows, loading, updateShow };
}
