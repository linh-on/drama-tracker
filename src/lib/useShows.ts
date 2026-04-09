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
        setShows(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const updateShow = async (show: Show) => {
    const res = await fetch(`/api/shows/${show.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(show),
    });
    const updated = await res.json();
    setShows((prev) =>
      prev.map((s) =>
        s.id === updated.id ? { ...updated, keywords: show.keywords } : s,
      ),
    );
  };

  const deleteShow = async (id: number) => {
    await fetch(`/api/shows/${id}`, { method: "DELETE" });
    setShows((prev) => prev.filter((s) => s.id !== id));
  };

  return { shows, loading, updateShow, deleteShow, refreshShows: fetchShows };
}
