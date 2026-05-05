import React, { useState, useEffect, useCallback } from "react";
import HistoryCard from "../components/history/HistoryCard";
import HistoryDetails from "../components/history/HistoryDetails";
import { getHistory, getHistoryItem, deleteHistory } from "../api/historyApi";

export default function HistoryPage() {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [detailLoad, setDetailLoad] = useState(false);
  const [error,      setError]      = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHistory();
      setItems(data);
    } catch (e) {
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  async function handleView(item) {
    setSelected(item);
    setDetail(null);
    setDetailLoad(true);
    try {
      const data = await getHistoryItem(item.file_hash);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoad(false);
    }
  }

  async function handleDelete(hash) {
    if (!window.confirm("Delete this file from history?")) return;
    try {
      await deleteHistory(hash);
      setItems(prev => prev.filter(i => i.file_hash !== hash));
      if (selected?.file_hash === hash) { setSelected(null); setDetail(null); }
    } catch {
      alert("Failed to delete.");
    }
  }

  return (
    <div style={{ background: "#f0ede6", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>🕐 History</h1>
          <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Previously analyzed contracts</p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#7f1d1d", marginBottom: 16 }}>
            ❌ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>⏳ Loading history...</div>
        )}

        {!loading && items.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: 48,
            textAlign: "center", border: "1.5px solid #e0d8cc",
          }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>No history yet</p>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>Upload a contract to get started</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16, alignItems: "start" }}>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                {items.length} file{items.length !== 1 ? "s" : ""} in history
              </p>
              {items.map(item => (
                <HistoryCard
                  key={item.file_hash}
                  item={item}
                  selected={selected?.file_hash === item.file_hash}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Detail Panel */}
            {selected && (
              <HistoryDetails
                item={selected}
                detail={detail}
                loading={detailLoad}
                onClose={() => { setSelected(null); setDetail(null); }}
                onUpdate={(updatedItem) => {
                  setItems(prev => prev.map(i => i.file_hash === updatedItem.file_hash ? { ...i, risk_level: updatedItem.risk_level } : i));
                  setSelected(prev => ({ ...prev, risk_level: updatedItem.risk_level }));
                }}
              />
            )}

          </div>
        )}

      </div>
    </div>
  );
}