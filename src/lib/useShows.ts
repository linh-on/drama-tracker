"use client";
import { useState, useEffect, useCallback } from "react";
import { Show } from "./types";

export function useShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShows = useCallback(() => {
    setLoading(true);
    fetch("/api/shows")
      .then((res) => res.json())
      .then((data) => {
        // Make sure we always set an array
        setShows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setShows([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const updateShow = async (show: Show) => {
    await fetch(`/api/shows/${show.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(show),
    });
    const res = await fetch(`/api/shows/${show.id}`);
    const updated = await res.json();
    setShows((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteShow = async (id: number) => {
    await fetch(`/api/shows/${id}`, { method: "DELETE" });
    setShows((prev) => prev.filter((s) => s.id !== id));
  };

  return { shows, loading, updateShow, deleteShow, refreshShows: fetchShows };
}
