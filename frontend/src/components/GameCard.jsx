import React from "react";
import "./GameCard.css";

function GameCard({ game }) {
  const formatNepaliTime = (utcDate) => {
    if (!utcDate) return "Time TBD";
    try {
      const date = new Date(utcDate);
      if (isNaN(date.getTime())) return "Invalid Time";
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kathmandu",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return "Invalid Time";
    }
  };

  const getSportIcon = (sport) => {
    switch (sport) {
      case "football":
        return "⚽";
      case "f1":
        return "🏎️";
      default:
        return "🎮";
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "live":
        return { class: "live", label: "LIVE", dot: true };
      case "finished":
        return { class: "finished", label: "FINISHED", dot: false };
      case "postponed":
        return { class: "postponed", label: "POSTPONED", dot: false };
      default:
        return { class: "scheduled", label: "UPCOMING", dot: false };
    }
  };

  const homeTeam = game.homeTeam || "TBD";
  const awayTeam = game.awayTeam || "TBD";
  const league = game.league || "Unknown League";
  const sport = game.sport || "unknown";
  const status = game.status || "scheduled";
  const venue = game.venue || "TBD";
  const statusConfig = getStatusConfig(status);

  const isF1 = sport === "f1";

  return (
    <div className="game-card">
      <div className="card-top">
        <div className="sport-tag">
          <span className="sport-icon">{getSportIcon(sport)}</span>
          <span className="sport-name">{sport.toUpperCase()}</span>
        </div>
        <div className={`status-pill ${statusConfig.class}`}>
          {statusConfig.dot && <span className="live-dot"></span>}
          {statusConfig.label}
        </div>
      </div>

      <div className="card-body">
        {isF1 ? (
          <div className="f1-layout">
            <div className="f1-session">{homeTeam}</div>
            <div className="f1-grand-prix">{awayTeam}</div>
            <div className="f1-league">{league}</div>
          </div>
        ) : (
          <div className="matchup-layout">
            <div className="team-side">
              <h3 className="team-name">{homeTeam}</h3>
              {game.homeScore !== null && game.homeScore !== undefined && (
                <span className="team-score">{game.homeScore}</span>
              )}
            </div>

            <div className="vs-divider">
              <span className="vs-text">VS</span>
            </div>

            <div className="team-side">
              <h3 className="team-name">{awayTeam}</h3>
              {game.awayScore !== null && game.awayScore !== undefined && (
                <span className="team-score">{game.awayScore}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="time-info">
          <svg
            className="time-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>{formatNepaliTime(game.utcDateTime)} NPT</span>
        </div>
        <div className="venue-info">
          <svg
            className="venue-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{venue}</span>
        </div>
      </div>
    </div>
  );
}

export default GameCard;
