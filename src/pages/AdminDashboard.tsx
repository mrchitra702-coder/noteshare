import React, { useState, useEffect } from 'react';
import { Users, FileText, Download, Trash2, PieChart, LayoutDashboard, Search, AlertCircle } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { motion } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'notes'>('stats');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, u, n] = await Promise.all([
        fetchApi('/admin/stats'),
        fetchApi('/admin/users'),
        fetchApi('/notes')
      ]);
      setStats(s);
      setUsers(u);
      setNotes(n);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await fetchApi(`/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 space-y-4 md:space-y-0">
          <div>
             <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center">
               <LayoutDashboard className="h-8 w-8 mr-3 text-indigo-600" />
               Admin Console
             </h1>
             <p className="text-gray-500 mt-2 font-medium">Manage platform health and user safety.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
             <button 
               onClick={() => setActiveTab('stats')}
               className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
             >
                <PieChart className="h-4 w-4" />
                <span>Stats</span>
             </button>
             <button 
               onClick={() => setActiveTab('users')}
               className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
             >
                <Users className="h-4 w-4" />
                <span>Users</span>
             </button>
             <button 
               onClick={() => setActiveTab('notes')}
               className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}`}
             >
                <FileText className="h-4 w-4" />
                <span>Notes</span>
             </button>
          </div>
        </header>

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                  <p className="text-4xl font-black text-gray-900">{stats.totalUsers}</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Notes</p>
                  <p className="text-4xl font-black text-gray-900">{stats.totalNotes}</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-orange-50 p-8 rounded-3xl border border-orange-100 shadow-sm">
                  <div className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                    <Download className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-1">Total Downloads</p>
                  <p className="text-4xl font-black text-orange-900">{stats.totalDownloads}</p>
               </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                         <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                         <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                         <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                         <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                           <td className="px-8 py-5">
                              <p className="font-bold text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                           </td>
                           <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                {user.role}
                              </span>
                           </td>
                           <td className="px-8 py-5 text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                           </td>
                           <td className="px-8 py-5 text-right">
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-gray-300 hover:text-red-600 transition-colors"
                              >
                                 <Trash2 className="h-5 w-5" />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                         <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Note</th>
                         <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Course</th>
                         <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Stats</th>
                         <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {notes.map(note => (
                        <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                           <td className="px-8 py-5">
                              <p className="font-bold text-gray-900">{note.title}</p>
                              <p className="text-sm text-gray-500">{note.uploader_name}</p>
                           </td>
                           <td className="px-8 py-5">
                              <p className="text-sm font-bold text-gray-700">{note.course}</p>
                              <p className="text-xs text-gray-400 uppercase tracking-widest">{note.subject}</p>
                           </td>
                           <td className="px-8 py-5">
                              <div className="flex items-center text-sm text-gray-500 space-x-3">
                                 <span className="flex items-center"><Download className="h-3 w-3 mr-1" /> {note.downloads}</span>
                                 <span className="flex items-center uppercase text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-black">{note.file_type.split('/').pop()}</span>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right space-x-4">
                              <button 
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-gray-300 hover:text-red-600 transition-colors"
                              >
                                 <Trash2 className="h-5 w-5" />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
