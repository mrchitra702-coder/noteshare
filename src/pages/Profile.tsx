import React, { useState, useEffect } from 'react';
import { User, FileText, Download, Trash2, Mail, Calendar, ExternalLink, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  useEffect(() => {
    const fetchUserNotes = async () => {
      try {
        const allNotes = await fetchApi('/notes');
        const filtered = allNotes.filter((n: any) => n.uploader_id === user?.id);
        setUserNotes(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUserNotes();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete these notes?')) return;
    try {
      await fetchApi(`/notes/${id}`, { method: 'DELETE' });
      setUserNotes(userNotes.filter(n => n.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* User Sidebar */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-24 h-24 bg-indigo-50 border-4 border-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-md shadow-indigo-50">
                   <User className="h-10 w-10 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-gray-400 text-sm font-medium mb-8">{user?.email}</p>
                
                <div className="space-y-4 pt-8 border-t border-gray-50 text-left">
                   <div className="flex items-center text-gray-500 text-sm">
                      <Mail className="h-4 w-4 mr-3" />
                      <span>{user?.email}</span>
                   </div>
                   <div className="flex items-center text-gray-500 text-sm">
                      <Settings className="h-4 w-4 mr-3" />
                      <span className="capitalize">{user?.role} Account</span>
                   </div>
                </div>

                <div className="mt-10">
                   <button className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                      Edit Profile
                   </button>
                </div>
             </div>
          </div>

          {/* User Notes Content */}
          <div className="lg:col-span-3 space-y-8">
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h3 className="text-2xl font-black text-gray-900">Your Shared Notes</h3>
                      <p className="text-gray-500 font-medium">Manage and monitor your contributions to the community.</p>
                   </div>
                   <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                     {userNotes.length} Notes Shared
                   </span>
                </div>

                {userNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userNotes.map(note => (
                      <div key={note.id} className="group bg-gray-50 rounded-2xl p-6 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white px-2 py-1 rounded shadow-sm">
                             {note.subject}
                           </span>
                           <div className="flex space-x-2">
                             <button 
                               onClick={() => handleDelete(note.id)}
                               className="p-2 text-gray-300 hover:text-red-500 transition-colors bg-white rounded-lg opacity-0 group-hover:opacity-100 shadow-sm"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                             <Link 
                               to={`/notes/${note.id}`}
                               className="p-2 text-gray-300 hover:text-indigo-600 transition-colors bg-white rounded-lg opacity-0 group-hover:opacity-100 shadow-sm"
                             >
                               <ExternalLink className="h-4 w-4" />
                             </Link>
                           </div>
                        </div>
                        <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">{note.title}</h4>
                        <div className="flex items-center justify-between mt-auto pt-4">
                           <span className="text-xs text-gray-400 font-bold">{note.course}</span>
                           <span className="flex items-center text-xs font-black text-gray-900">
                             <Download className="h-3 w-3 mr-1" />
                             {note.downloads}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                     <FileText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                     <h4 className="text-lg font-bold text-gray-500 mb-2">No notes shared yet</h4>
                     <p className="text-gray-400 mb-8 max-w-xs mx-auto">Become a contributor and help fellow students achieve their academic goals.</p>
                     <Link to="/upload" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                        Upload Your First Note
                     </Link>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 relative overflow-hidden group">
                   <h4 className="text-xl font-black text-indigo-900 mb-2">Academic Impact</h4>
                   <p className="text-indigo-600 text-sm font-medium mb-6 relative z-10">Your notes have been downloaded over {userNotes.reduce((acc, n) => acc + n.downloads, 0)} times by other students.</p>
                   <div className="flex items-baseline space-x-1 relative z-10">
                      <span className="text-4xl font-black text-indigo-600">Top 5%</span>
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">In your college</span>
                   </div>
                   <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                </div>

                <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
                   <h4 className="text-xl font-black text-green-900 mb-2">Verified Contributor</h4>
                   <p className="text-green-600 text-sm font-medium mb-6">Complete 5 uploads to earn your "Expert" badge and get featured on the home page.</p>
                   <div className="w-full bg-green-200 h-3 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${Math.min((userNotes.length / 5) * 100, 100)}%` }}></div>
                   </div>
                   <div className="flex justify-between mt-2 font-bold text-[10px] text-green-700 uppercase tracking-widest">
                      <span>{userNotes.length} Uploads</span>
                      <span>5 Goal</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
