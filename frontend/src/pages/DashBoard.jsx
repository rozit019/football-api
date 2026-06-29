import React, { useState, useEffect } from "react";
import GameCard from "../components/GameCard";
import {
  fetchGames,
  fetchTodayGames,
  fetchLiveGames,
} from "../services/gameService";
import "./DashBoard.css";

function Dashboard() {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [sportFilter, setSportFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nepaliTime, setNepaliTime] = useState(getNepaliTime());

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNepaliTime(getNepaliTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadGames();
  }, [filter, sportFilter]);

  function getNepaliTime() {
    return new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kathmandu",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  const loadGames = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (filter === "today") {
        response = await fetchTodayGames();
      } else if (filter === "live") {
        response = await fetchLiveGames();
      } else {
        const params = {};
        if (sportFilter !== "all") params.sport = sportFilter;
        response = await fetchGames(params);
      }

      if (response.success && Array.isArray(response.data)) {
        setGames(response.data);
      } else if (Array.isArray(response)) {
        setGames(response);
      } else {
        setGames([]);
      }
    } catch (err) {
      setError(err.message);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilterLabel = () => {
    switch (filter) {
      case "today":
        return "Today's Games";
      case "live":
        return "Live Now";
      case "all":
        return "All Games";
      default:
        return "Upcoming Games";
    }
  };

  const getGameCount = () => {
    if (games.length === 0) return "No games found";
    if (games.length === 1) return "1 game";
    return `${games.length} games`;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="flag">🇳🇵</span>
            <div>
              <h1>Nepali Game Time</h1>
              <p>All your favorite games in Nepal Standard Time</p>
            </div>
          </div>
          <div className="header-time">
            <svg
              className="clock-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{nepaliTime}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="controls-bar">
          <div className="filter-tabs">
            {[
              { key: "upcoming", label: "Upcoming", icon: "📅" },
              { key: "today", label: "Today", icon: "📆" },
              { key: "live", label: "Live", icon: "🔴" },
              { key: "all", label: "All", icon: "🎯" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`filter-tab ${filter === f.key ? "active" : ""}`}
              >
                <span className="tab-icon">{f.icon}</span>
                <span className="tab-label">{f.label}</span>
                {f.key === "live" && <span className="live-indicator"></span>}
              </button>
            ))}
          </div>

          <div className="sport-dropdown">
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
            >
              <option value="all">All Sports</option>
              <option value="football">⚽ Football</option>
              <option value="f1">🏎️ Formula 1</option>
            </select>
            <svg
              className="dropdown-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="results-header">
          <h2>{getFilterLabel()}</h2>
          <span className="game-count">{getGameCount()}</span>
        </div>

        {error && (
          <div className="error-toast">
            <svg
              className="error-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <span>{error}</span>
            <button onClick={loadGames} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p>Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">🏟️</div>
            <h3>No games found</h3>
            <p>
              {error
                ? "Something went wrong. Please try again."
                : "Check back later or try different filters."}
            </p>
          </div>
        ) : (
          <div className="games-grid">
            {games.map((game, index) => (
              <GameCard
                key={game._id || game.externalId || index}
                game={game}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
