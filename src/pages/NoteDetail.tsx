import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Calendar, User, Book, FileText, Share2, ArrowLeft, Trash2, ShieldCheck, Info, BookOpen } from 'lucide-react';
import { fetchApi, downloadFile } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const NoteDetail: React.FC = () => {
  const { id } = useParams();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const data = await fetchApi(`/notes/${id}`);
        setNote(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setDownloading(true);
    try {
      await downloadFile(note.id, note.file_name);
      setNote({ ...note, downloads: note.downloads + 1 });
    } catch (err) {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete these notes?')) return;
    try {
      await fetchApi(`/notes/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  if (!note) return <div className="text-center py-20">Note not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to list
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-widest">{note.subject}</span>
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-full uppercase tracking-widest">{note.course}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 leading-tight">{note.title}</h1>
              
              <div className="flex flex-wrap gap-6 mb-10 pb-8 border-b border-gray-50">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Posted On</p>
                    <p className="font-bold text-gray-900">{new Date(note.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-indigo max-w-none">
                <h3 className="text-xl font-bold flex items-center mb-4">
                  <Info className="h-5 w-5 mr-2 text-indigo-600" />
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
                  {note.description || 'No description provided for these notes.'}
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                <button 
                   onClick={handleDownload}
                   disabled={downloading}
                   className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center disabled:opacity-50"
                >
                   {downloading ? 'Preparing...' : (
                     <>
                      <Download className="h-5 w-5 mr-2" />
                      Download .{(note.file_name || '').split('.').pop()?.toUpperCase()}
                     </>
                   )}
                </button>
                <button className="p-4 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
                   <Share2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {(user?.id === note.uploader_id || user?.role === 'admin') && (
              <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center text-red-600 font-bold">
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Administrative Controls
                </div>
                <button 
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                >
                   Delete Note
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-50 pb-3">Note Info</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500 text-sm flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Format
                      </span>
                      <span className="font-bold text-gray-900">.{note.file_name.split('.').pop()?.toUpperCase()}</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500 text-sm flex items-center">
                        <Book className="h-4 w-4 mr-2" />
                        Subject
                      </span>
                      <span className="font-bold text-gray-900">{note.subject}</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500 text-sm flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Downloads
                      </span>
                      <span className="font-bold text-indigo-600">{note.downloads}</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500 text-sm flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Size
                      </span>
                      <span className="font-bold text-gray-900">{(note.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                   </div>
                </div>
             </div>

             <div className="bg-indigo-900 rounded-3xl p-8 text-white text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-indigo-300" />
                <h3 className="text-xl font-bold mb-2">Secure Downloads</h3>
                <p className="text-indigo-200 text-sm mb-6">All uploaded files are scanned for safety before being published to the platform.</p>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Powered by NoteShare</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
