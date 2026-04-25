import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchApi } from '../lib/api';
import NoteCard from '../components/NoteCard';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [latestNotes, setLatestNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const latest = await fetchApi('/notes');
        setLatestNotes(latest.slice(0, 4));
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6"
            >
              Share Knowledge, <span className="text-indigo-600">Ace Together.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-500 mb-10 leading-relaxed"
            >
              The ultimate platform for students to upload, organize, and discover high-quality study notes from top courses.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="relative max-w-2xl mx-auto"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by course, subject or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/notes?query=${searchQuery}`)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
              <button 
                onClick={() => window.location.href = `/notes?query=${searchQuery}`}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
            </motion.div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-400">
            <span>Popular:</span>
            <Link to="/notes?subject=Physics" className="text-gray-600 hover:text-indigo-600">Physics</Link>
            <Link to="/notes?subject=CS" className="text-gray-600 hover:text-indigo-600">Computer Science</Link>
            <Link to="/notes?subject=Math" className="text-gray-600 hover:text-indigo-600">Mathematics</Link>
            <Link to="/notes?subject=Biology" className="text-gray-600 hover:text-indigo-600">Biology</Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left: Latest Notes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Latest Uploads</h2>
              <Link to="/notes" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                Browse All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : latestNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {latestNotes.map(note => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                 <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                 <p className="text-gray-500">No notes uploaded yet. Be the first!</p>
                 <Link to="/upload" className="mt-4 inline-block text-indigo-600 font-medium underline">Upload a note</Link>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-10">
            <section className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">Join as a Contributor</h3>
                  <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Share your study materials and help thousands of students worldwide. Built for students, by students.</p>
                  <Link to="/upload" className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm block text-center hover:bg-gray-100 transition-colors shadow-lg">
                    Start Uploading
                  </Link>
               </div>
               {/* Decorative Circles */}
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
               <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-indigo-700 rounded-full opacity-50 blur-2xl"></div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
