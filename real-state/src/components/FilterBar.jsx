import React from "react";
import { Search, Calendar, Share2, Home, ArrowUpDown, Building } from "lucide-react";

export default function FilterBar({
  dateFilter, setDateFilter,
  sourceFilter, setSourceFilter,
  serviceFilter, setServiceFilter,
  bhkFilter, setBhkFilter,
  sortFilter, setSortFilter,
  orderFilter, setOrderFilter,
  search, setSearch,
  showPriorityPills = false,
  priorityFilter, setPriorityFilter
}) {
  return (
    <div className="modern-filter-bar">
      {/* Search Input Bar */}
      <div className="modern-search-wrapper">
        <Search size={16} className="modern-search-icon" />
        <input
          type="text"
          className="modern-search-input"
          placeholder="Search Lead ID, BHK, Property, Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="clear-search-btn" onClick={() => setSearch("")}>×</button>
        )}
      </div>

      {/* Priority Filter Pills if enabled */}
      {showPriorityPills && (
        <div className="priority-pill-row">
          <button
            className={`priority-chip hot ${priorityFilter === "HOT" ? "active" : ""}`}
            onClick={() => setPriorityFilter(priorityFilter === "HOT" ? null : "HOT")}
          >
            🔴 Hot
          </button>
          <button
            className={`priority-chip warm ${priorityFilter === "WARM" ? "active" : ""}`}
            onClick={() => setPriorityFilter(priorityFilter === "WARM" ? null : "WARM")}
          >
            🟠 Warm
          </button>
          <button
            className={`priority-chip cold ${priorityFilter === "COLD" ? "active" : ""}`}
            onClick={() => setPriorityFilter(priorityFilter === "COLD" ? null : "COLD")}
          >
            🔵 Cold
          </button>
        </div>
      )}

      {/* Horizontal Scrollable Pill Selectors */}
      <div className="horizontal-filter-scroll">
        {/* Real Estate Property & Service Type Selector Pill */}
        {setServiceFilter && (
          <div className="pill-select-wrapper">
            <Home size={13} className="pill-select-icon" />
            <select
              className="pill-select"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{ borderColor: serviceFilter && serviceFilter !== "All Services" ? "#2563eb" : "#cbd5e1" }}
            >
              <option value="All Services">All Services</option>
              <option value="Home Buying">Home Buying</option>
              <option value="Site Visit Booking">Site Visit Booking</option>
              <option value="Property Valuation">Property Valuation</option>
              <option value="Builder Project Booking">Builder Project Booking</option>
            </select>
          </div>
        )}

        {/* BHK Type Selector Pill */}
        {setBhkFilter && (
          <div className="pill-select-wrapper">
            <Building size={13} className="pill-select-icon" />
            <select
              className="pill-select"
              value={bhkFilter || "All BHK Types"}
              onChange={(e) => setBhkFilter(e.target.value)}
              style={{ borderColor: bhkFilter && bhkFilter !== "All BHK Types" ? "#2563eb" : "#cbd5e1" }}
            >
              <option value="All BHK Types">All BHK Types</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="Penthouse / Villa">Penthouse / Villa</option>
              <option value="Plot">Commercial Plot</option>
            </select>
          </div>
        )}

        <div className="pill-select-wrapper">
          <Calendar size={13} className="pill-select-icon" />
          <select
            className="pill-select"
            value={dateFilter}
            onChange={(e) => setDateFilter && setDateFilter(e.target.value)}
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        {setSourceFilter && (
          <div className="pill-select-wrapper">
            <Share2 size={13} className="pill-select-icon" />
            <select
              className="pill-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="All Sources">All Sources</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Facebook Ads">Facebook Ads</option>
              <option value="Instagram Ads">Instagram Ads</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
            </select>
          </div>
        )}

        {setOrderFilter && (
          <div className="pill-select-wrapper">
            <ArrowUpDown size={13} className="pill-select-icon" />
            <select
              className="pill-select"
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
            >
              <option value="Freshest First">Freshest First</option>
              <option value="Oldest First">Oldest First</option>
              <option value="Callback Time">Callback Time</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
