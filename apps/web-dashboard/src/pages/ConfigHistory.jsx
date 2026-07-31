import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
    History, Shield, Globe, Key, Users, Database, Server,
    ToggleLeft, ToggleRight, Mail, FileText, ChevronLeft,
    ChevronRight, Filter, RefreshCw, AlertCircle
} from "lucide-react";

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORIES = [
    { value: "", label: "All Categories" },
    { value: "project_info",     label: "Project Info" },
    { value: "api_key",          label: "API Key" },
    { value: "auth",             label: "Authentication" },
    { value: "public_signup",    label: "Public Signup" },
    { value: "auth_providers",   label: "OAuth Providers" },
    { value: "allowed_domains",  label: "Allowed Domains" },
    { value: "byod_db",          label: "External Database" },
    { value: "byod_storage",     label: "External Storage" },
    { value: "collection_schema","label": "Collection Schema" },
    { value: "collection_rls",   label: "RLS Settings" },
    { value: "mail_template",    label: "Mail Template" },
    { value: "resend",           label: "Resend / Mail" },
    { value: "member",           label: "Team Member" },
];

const CATEGORY_META = {
    project_info:     { icon: FileText,   color: "#7c8cf8" },
    api_key:          { icon: Key,        color: "#f59e0b" },
    auth:             { icon: Shield,     color: "#3ecf8e" },
    public_signup:    { icon: ToggleRight,color: "#3ecf8e" },
    auth_providers:   { icon: ToggleLeft, color: "#8b5cf6" },
    allowed_domains:  { icon: Globe,      color: "#06b6d4" },
    byod_db:          { icon: Database,   color: "#f97316" },
    byod_storage:     { icon: Server,     color: "#f97316" },
    collection_schema:{ icon: FileText,   color: "#7c8cf8" },
    collection_rls:   { icon: Shield,     color: "#ec4899" },
    mail_template:    { icon: Mail,       color: "#3ecf8e" },
    resend:           { icon: Mail,       color: "#f59e0b" },
    member:           { icon: Users,      color: "#8b5cf6" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }) {
    const meta = CATEGORY_META[category] || { icon: History, color: "#6b7280" };
    const Icon = meta.icon;
    const label = CATEGORIES.find(c => c.value === category)?.label || category;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "2px 8px", borderRadius: "999px", fontSize: "0.68rem",
            fontWeight: 600, letterSpacing: "0.02em",
            background: `${meta.color}18`, color: meta.color,
            border: `1px solid ${meta.color}30`,
        }}>
            <Icon size={10} />
            {label}
        </span>
    );
}

function DiffTable({ diff }) {
    if (!diff || !Array.isArray(diff) || diff.length === 0) return null;
    return (
        <div style={{
            marginTop: "10px", borderRadius: "6px",
            border: "1px solid var(--color-border)",
            overflow: "hidden", fontSize: "0.72rem",
        }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                        <th style={{ padding: "6px 10px", textAlign: "left", color: "var(--color-text-muted)", fontWeight: 500 }}>Field</th>
                        <th style={{ padding: "6px 10px", textAlign: "left", color: "var(--color-text-muted)", fontWeight: 500 }}>New Value</th>
                    </tr>
                </thead>
                <tbody>
                    {diff.map((d, i) => (
                        <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
                            <td style={{ padding: "6px 10px", color: "var(--color-text-muted)", fontFamily: "monospace" }}>{d.field}</td>
                            <td style={{ padding: "6px 10px", color: "#fff", fontFamily: "monospace", wordBreak: "break-all" }}>
                                {typeof d.to === "boolean"
                                    ? <span style={{ color: d.to ? "#3ecf8e" : "#ef4444" }}>{String(d.to)}</span>
                                    : Array.isArray(d.to)
                                        ? d.to.join(", ") || <em style={{ color: "var(--color-text-muted)" }}>empty</em>
                                        : d.to ?? <em style={{ color: "var(--color-text-muted)" }}>—</em>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function LogRow({ log }) {
    const [expanded, setExpanded] = useState(false);
    const meta = CATEGORY_META[log.category] || { icon: History, color: "#6b7280" };
    const Icon = meta.icon;

    return (
        <div
            style={{
                borderBottom: "1px solid var(--color-border)",
                padding: "14px 16px",
                transition: "background 0.15s",
                cursor: log.diff ? "pointer" : "default",
            }}
            onClick={() => log.diff && setExpanded(p => !p)}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {/* Icon dot */}
                <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: `${meta.color}15`, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    border: `1px solid ${meta.color}25`,
                    marginTop: 2,
                }}>
                    <Icon size={13} color={meta.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <CategoryBadge category={log.category} />
                        <span style={{ fontSize: "0.78rem", color: "#fff", fontWeight: 500 }}>
                            {log.label}
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                            by <strong style={{ color: "var(--color-text-main)" }}>{log.changedByEmail || "Unknown"}</strong>
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>·</span>
                        <span
                            title={formatTime(log.changedAt)}
                            style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}
                        >
                            {timeAgo(log.changedAt)}
                        </span>
                    </div>

                    {expanded && <DiffTable diff={log.diff} />}
                </div>

                {log.diff && log.diff.length > 0 && (
                    <span style={{
                        fontSize: "0.65rem", color: "var(--color-text-muted)",
                        flexShrink: 0, paddingTop: 6,
                    }}>
                        {expanded ? "▲" : "▼"}
                    </span>
                )}
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "12px" }}>
                    <div className="skeleton" style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ width: "40%", height: 14, borderRadius: 4, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: "25%", height: 11, borderRadius: 4 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConfigHistory() {
    const { projectId } = useParams();

    const [logs, setLogs]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [page, setPage]             = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [category, setCategory]     = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const LIMIT = 20;

    const fetchLogs = useCallback(async (pg = page, cat = category, showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const params = { page: pg, limit: LIMIT };
            if (cat) params.category = cat;
            const res = await api.get(`/api/projects/${projectId}/config-logs`, { params });
            setLogs(res.data.data.logs);
            setPagination(res.data.data.pagination);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to load config history";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [projectId, page, category]);

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const params = { page: 1, limit: LIMIT };
                if (category) params.category = category;
                const res = await api.get(`/api/projects/${projectId}/config-logs`, { params });
                if (isMounted) {
                    setLogs(res.data.data.logs);
                    setPagination(res.data.data.pagination);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || "Failed to load config history");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, projectId]);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setPage(1);
    };

    const handlePageChange = (p) => {
        setPage(p);
        fetchLogs(p, category);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div style={{ maxWidth: 780, margin: "0 auto", paddingBottom: "3rem" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: "rgba(124,140,248,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(124,140,248,0.2)",
                }}>
                    <History size={15} color="#7c8cf8" />
                </div>
                <div>
                    <h1 style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                        Config History
                    </h1>
                    <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                        Audit trail of all project configuration changes
                    </p>
                </div>

                {/* Refresh button */}
                <button
                    onClick={() => fetchLogs(page, category, true)}
                    disabled={refreshing || loading}
                    style={{
                        marginLeft: "auto", background: "transparent", border: "1px solid var(--color-border)",
                        borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5,
                        color: "var(--color-text-muted)", fontSize: "0.72rem",
                    }}
                >
                    <RefreshCw size={12} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
                    Refresh
                </button>
            </div>

            {/* Filter bar */}
            <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
            }}>
                <Filter size={13} color="var(--color-text-muted)" />
                <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginRight: 4 }}>Filter:</span>
                <select
                    value={category}
                    onChange={handleCategoryChange}
                    style={{
                        background: "var(--color-bg-input)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 4, color: "#fff",
                        fontSize: "0.75rem", padding: "4px 8px", cursor: "pointer",
                    }}
                >
                    {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>

                {pagination.total > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                        {pagination.total} event{pagination.total !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Log list */}
            <div style={{
                border: "1px solid var(--color-border)",
                borderRadius: 8, overflow: "hidden",
                background: "rgba(255,255,255,0.01)",
            }}>
                {loading ? (
                    <Skeleton />
                ) : error ? (
                    <div style={{
                        padding: "2.5rem", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 10, color: "#ef4444",
                    }}>
                        <AlertCircle size={28} />
                        <p style={{ fontSize: "0.8rem" }}>{error}</p>
                        <button
                            onClick={() => fetchLogs(page, category)}
                            style={{
                                padding: "6px 14px", fontSize: "0.75rem", borderRadius: 5,
                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                                color: "#ef4444", cursor: "pointer",
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{
                        padding: "3rem", textAlign: "center",
                        color: "var(--color-text-muted)",
                    }}>
                        <History size={32} style={{ opacity: 0.25, marginBottom: 10 }} />
                        <p style={{ fontSize: "0.8rem" }}>
                            {category ? "No events for this category yet." : "No configuration changes recorded yet."}
                        </p>
                    </div>
                ) : (
                    logs.map(log => <LogRow key={log._id} log={log} />)
                )}
            </div>

            {/* Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: "1rem",
                }}>
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "6px 12px", borderRadius: 6, fontSize: "0.75rem",
                            background: "transparent", border: "1px solid var(--color-border)",
                            color: page <= 1 ? "var(--color-text-muted)" : "#fff",
                            cursor: page <= 1 ? "not-allowed" : "pointer",
                        }}
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>

                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                        Page {page} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= pagination.totalPages}
                        style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "6px 12px", borderRadius: 6, fontSize: "0.75rem",
                            background: "transparent", border: "1px solid var(--color-border)",
                            color: page >= pagination.totalPages ? "var(--color-text-muted)" : "#fff",
                            cursor: page >= pagination.totalPages ? "not-allowed" : "pointer",
                        }}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
