import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Trash2, User, Search, Mail, UserPlus, Key, X, AlertCircle, Edit2, Save, Settings } from 'lucide-react';
import { API_URL } from '../config';

// --- Dynamic Form Component ---
// Defined outside to prevent focus loss on re-renders
const DynamicUserForm = ({ schema, formData, onChange, isEdit = false }) => {
    if (!schema) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {schema.map((field) => {
                // Skip password in edit mode (we have a separate reset)
                if (isEdit && field.key === 'password') return null;
                // Skip internal fields if any
                if (field.key === '_id' || field.key === 'createdAt' || field.key === 'updatedAt' || field.key === 'emailVerified') return null;

                return (
                    <div key={field.key} className="input-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                            {field.key.charAt(0).toUpperCase() + field.key.slice(1)} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        {field.type === 'Boolean' ? (
                            <select 
                                className="input-field"
                                value={formData[field.key] || false}
                                onChange={(e) => onChange(field.key, e.target.value === 'true')}
                            >
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        ) : field.type === 'Number' ? (
                            <input
                                type="number"
                                className="input-field"
                                required={field.required}
                                value={formData[field.key] || ''}
                                onChange={(e) => onChange(field.key, Number(e.target.value))}
                            />
                        ) : field.type === 'Date' ? (
                            <input
                                type="date"
                                className="input-field"
                                required={field.required}
                                value={formData[field.key] ? new Date(formData[field.key]).toISOString().split('T')[0] : ''}
                                onChange={(e) => onChange(field.key, e.target.value)}
                            />
                        ) : (
                            <input
                                type={field.key === 'password' ? 'password' : 'text'}
                                className="input-field"
                                required={field.required}
                                placeholder={field.key === 'password' ? 'Min 6 characters' : `Enter ${field.key}`}
                                value={formData[field.key] || ''}
                                onChange={(e) => onChange(field.key, e.target.value)}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default function Auth() {
    const { projectId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [project, setProject] = useState(null);
    const [isEnabling, setIsEnabling] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Add User Form State
    const [addFormData, setAddFormData] = useState({ email: '', password: '', username: '' });
    const [isAdding, setIsAdding] = useState(false);

    // User Editing State
    const [editingUser, setEditingUser] = useState(null); // Full user object from admin endpoint
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [resetUserId, setResetUserId] = useState(null);

    const usersCollection = project?.collections?.find(c => c.name === 'users');
    const hasUserCollection = !!usersCollection;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch project details to check isAuthEnabled
                const projRes = await axios.get(`${API_URL}/api/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setProject(projRes.data);

                // 2. Fetch users ONLY if auth is enabled
                if (projRes.data.isAuthEnabled) {
                    try {
                        const usersRes = await axios.get(
                            `${API_URL}/api/projects/${projectId}/collections/users/data`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setUsers(usersRes.data);
                    } catch {
                         // If users collection doesn't exist yet but auth is enabled, just show empty
                         setUsers([ ]);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [projectId, token]);

    const handleEnableAuth = async () => {
        setIsEnabling(true);
        try {
            const res = await axios.patch(
                `${API_URL}/api/projects/${projectId}/auth/toggle`,
                { enable: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setProject(res.data.project);
            toast.success("Authentication enabled for this project!");
            
            // Re-fetch users (should be empty now)
            try {
                const usersRes = await axios.get(
                    `${API_URL}/api/projects/${projectId}/collections/users/data`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUsers(usersRes.data);
            } catch {
                 setUsers([]);
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to enable authentication");
        } finally {
            setIsEnabling(false);
        }
    };

    // Handle Add User
    const handleAddUser = async (e) => {
        if (e) e.preventDefault();
        setIsAdding(true);
        try {
            const res = await axios.post(
                `${API_URL}/api/projects/${projectId}/admin/users`,
                addFormData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers([res.data.user, ...users]);
            setIsAddModalOpen(false);
            setAddFormData({ email: '', password: '' });
            toast.success("User created successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to create user");
        } finally {
            setIsAdding(false);
        }
    };

    // Handle Reset Password
    const handleResetPassword = async (userId) => {
        const newPassword = prompt("Enter new password for this user (min 6 characters):");
        if (!newPassword) return;
        if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");

        setResetUserId(userId);
        try {
            await axios.patch(
                `${API_URL}/api/projects/${projectId}/admin/users/${userId}/password`,
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Password reset successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to reset password");
        } finally {
            setResetUserId(null);
        }
    };

    // Handle Fetch User for Editing
    const handleEditClick = async (userId) => {
        try {
            const res = await axios.get(
                `${API_URL}/api/projects/${projectId}/admin/users/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingUser(res.data);
            // Convert everything except core fields to form data
            const customFields = { ...res.data };
            ['_id', 'email', 'password', 'emailVerified', 'createdAt', 'updatedAt'].forEach(key => delete customFields[key]);
            setEditFormData(customFields);
        } catch {
            toast.error("Failed to fetch user details");
        }
    };

    const handleUpdateUser = async () => {
        setIsUpdatingUser(true);
        try {
            await axios.put(
                `${API_URL}/api/projects/${projectId}/admin/users/${editingUser._id}`,
                editFormData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.success("User updated successfully!");
            setEditingUser(null);
            
            // Refresh list
            const usersRes = await axios.get(
                `${API_URL}/api/projects/${projectId}/collections/users/data`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(usersRes.data);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update user");
        } finally {
            setIsUpdatingUser(false);
        }
    };

    // 2. Delete User
    const handleDelete = async (id) => {
        if (!confirm("Delete this user permanently? They won't be able to login.")) return;

        try {
            await axios.delete(
                `${API_URL}/api/projects/${projectId}/collections/users/data/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.filter(user => user._id !== id));
            toast.success("User deleted");
        } catch {
            toast.error("Failed to delete user");
        }
    };

    // Filter Users
    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="container">Loading Users...</div>;

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '2.5rem', borderBottom: 'none' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={28} color="var(--color-primary)" /> Authentication
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Manage users who have signed up for your project.</p>
                </div>
                {/* Search Bar & Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by email or ID"
                            className="input-field"
                            style={{ paddingLeft: '40px', background: 'var(--color-bg-input)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {project?.isAuthEnabled && hasUserCollection && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                className="btn btn-secondary" 
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontWeight: 500, borderColor: 'var(--color-border)' }}
                                onClick={() => navigate(`/project/${projectId}/database?collection=users`)}
                            >
                                <Settings size={18} /> Configure Fields
                            </button>
                            <button 
                                className="btn btn-primary" 
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontWeight: 500 }}
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <UserPlus size={18} /> Add User
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Schema Missing Warning */}
            {project?.isAuthEnabled && !hasUserCollection && (
                <div style={{ 
                    background: 'rgba(255, 189, 46, 0.1)', 
                    border: '1px solid rgba(255, 189, 46, 0.2)', 
                    borderRadius: '12px', 
                    padding: '1.5rem', 
                    marginBottom: '2rem', 
                    display: 'flex', 
                    gap: '1rem', 
                    alignItems: 'center' 
                }}>
                    <AlertCircle color="#FFBD2E" size={24} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#FFBD2E', margin: '0 0 5px 0', fontSize: '1rem', fontWeight: 600 }}>User Schema Required</h4>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                            Auth is enabled, but you haven't defined a <strong>"users"</strong> collection. Your Auth API will return errors until you create this collection in the Dashboard to define your user fields.
                        </p>
                        <button 
                            className="btn btn-primary" 
                            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                            onClick={() => navigate(`/project/${projectId}/create-collection?name=users`)}
                        >
                            Create "users" collection now
                        </button>
                    </div>
                </div>
            )}

            {/* Users Table or Enable UI */}
            {!project?.isAuthEnabled ? (
                <div className="card" style={{ padding: '6rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(62, 207, 142, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(62, 207, 142, 0.2)' }}>
                        <Shield size={40} color="var(--color-primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Enable Authentication</h2>
                    <p style={{ maxWidth: '400px', margin: '0 auto 2rem auto', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                        Activate the built-in authentication system to manage users, handle signups, and securely generate JWT tokens via your API.
                    </p>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleEnableAuth} 
                        disabled={isEnabling}
                        style={{ padding: '12px 24px', fontSize: '1rem' }}
                    >
                        {isEnabling ? 'Enabling...' : 'Enable Authentication Now'}
                    </button>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
                    {users.length === 0 ? (
                        <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--color-bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                                <Shield size={32} style={{ opacity: 0.5, color: 'var(--color-text-muted)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>No users found</h3>
                            <p style={{ maxWidth: '300px', margin: '0 auto' }}>Users will appear here once they register via your API.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--color-bg-input)', borderBottom: '1px solid var(--color-border)' }}>
                                        <th style={{ padding: '16px', textAlign: 'center', width: '60px' }}></th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Email</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>User ID</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Created At</th>
                                        <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="user-row" style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #333, #111)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid var(--color-border)' }}>
                                                    <User size={16} color="#aaa" />
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 500, color: 'var(--color-text-main)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Mail size={14} color="var(--color-text-muted)" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-input)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                                    {user._id}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleEditClick(user._id)}
                                                    className="btn btn-ghost"
                                                    style={{ color: 'var(--color-text-muted)', padding: '8px', borderRadius: '6px', marginRight: '4px' }}
                                                    title="Edit Custom Fields"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(user._id)}
                                                    className="btn btn-ghost"
                                                    style={{ color: 'var(--color-primary)', padding: '8px', borderRadius: '6px', marginRight: '4px' }}
                                                    title="Reset Password"
                                                    disabled={resetUserId === user._id}
                                                >
                                                    <Key size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="btn btn-ghost"
                                                    style={{ color: '#ef4444', padding: '8px', borderRadius: '6px' }}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsAddModalOpen(false)}>
                    <div className="card modal-content" style={{ width: '100%', maxWidth: '450px', position: 'relative', animation: 'fadeInUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={() => setIsAddModalOpen(false)}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserPlus size={24} color="var(--color-primary)" /> Add User
                        </h2>
                        <form onSubmit={handleAddUser}>
                            <DynamicUserForm 
                                schema={usersCollection?.model} 
                                formData={addFormData} 
                                onChange={(key, val) => setAddFormData({ ...addFormData, [key]: val })} 
                            />
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isAdding}>
                                    {isAdding ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingUser(null)}>
                    <div className="card modal-content" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={() => setEditingUser(null)}>
                            <X size={20} />
                        </button>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Edit2 size={24} color="var(--color-primary)" /> Edit User Data
                            </h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Modifying profile for: <strong>{editingUser.email}</strong></p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <DynamicUserForm 
                                isEdit={true}
                                schema={usersCollection?.model}
                                formData={editFormData}
                                onChange={(key, val) => setEditFormData({ ...editFormData, [key]: val })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingUser(null)}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                                onClick={handleUpdateUser}
                                disabled={isUpdatingUser}
                            >
                                <Save size={18} /> {isUpdatingUser ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .user-row:hover {
                    background-color: var(--color-bg-input);
                }
                .user-row:last-child {
                    border-bottom: none;
                }
            `}</style>
        </div>
    );
}