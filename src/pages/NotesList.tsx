import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { fetchApi } from '../lib/api';
import NoteCard from '../components/NoteCard';
import { motion, AnimatePresence } from 'motion/react';

const NotesList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [course, setCourse] = useState(searchParams.get('course') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (subject) params.append('subject', subject);
      if (course) params.append('course', course);
      if (sort) params.append('sort', sort);

      const data = await fetchApi(`/notes?${params.toString()}`);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchParams]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (query) params.query = query;
    if (subject) params.subject = subject;
    if (course) params.course = course;
    if (sort) params.sort = sort;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 p-6 space-y-8 flex-shrink-0">
        <div className="flex items-center space-x-2 pb-4 border-b border-gray-50">
          <Filter className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        </div>

        <form onSubmit={handleFilterSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Keywords..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics, Law..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course ID</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. CS101"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
          >
            Apply Filters
          </button>
          
          {(query || subject || course || sort !== 'newest') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSubject('');
                setCourse('');
                setSort('newest');
                setSearchParams({});
              }}
              className="w-full text-gray-500 text-sm font-bold hover:text-gray-700"
            >
              Clear All
            </button>
          )}
        </form>
      </aside>

      {/* Results Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Showing results for</p>
            <h1 className="text-3xl font-bold text-gray-900">
              {subject || 'All Courses'} {query ? `• "${query}"` : ''}
            </h1>
          </div>
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
             <button className="p-2 bg-gray-50 rounded text-gray-700"><LayoutGrid size={18} /></button>
             <button className="p-2 text-gray-400 hover:text-gray-600"><List size={18} /></button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {notes.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <NoteCard note={note} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <BookOpen className="h-20 w-20 text-indigo-100 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500 max-w-sm mb-8">Try adjusting your filters or search query to find what you're looking for.</p>
            <button 
              onClick={() => setSearchParams({})}
              className="bg-indigo-50 text-indigo-700 px-8 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
            >
              Reset Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotesList;
