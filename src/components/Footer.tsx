import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
             <Link to="/" className="flex items-center space-x-2 mb-6">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-black tracking-tight">NoteShare</span>
             </Link>
             <p className="text-gray-500 text-sm leading-relaxed mb-6">
               NoteShare is the word's leading community for sharing study materials. Helping students learn better and faster through collaboration.
             </p>

          </div>

          <div>
             <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Platform</h4>
             <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link to="/notes" className="hover:text-indigo-600 transition-colors">Courses</Link></li>
                <li><Link to="/upload" className="hover:text-indigo-600 transition-colors">Upload Notes</Link></li>
                <li><Link to="/notes?sort=popular" className="hover:text-indigo-600 transition-colors">Popular Material</Link></li>
                <li><Link to="/notes?subject=CS" className="hover:text-indigo-600 transition-colors">Computer Science</Link></li>
             </ul>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
