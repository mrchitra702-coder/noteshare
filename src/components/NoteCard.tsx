import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Calendar, User, Book } from 'lucide-react';
import { motion } from 'motion/react';

interface NoteCardProps {
  note: {
    id: number;
    title: string;
    course: string;
    subject: string;
    uploader_name: string;
    created_at: string;
    downloads: number;
    file_type: string;
  };
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const date = new Date(note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md uppercase tracking-wider">
            {note.subject}
          </span>
          <span className="text-gray-400 text-xs flex items-center">
            <Download className="h-3 w-3 mr-1" />
            {note.downloads}
          </span>
        </div>
        <Link to={`/notes/${note.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 hover:text-indigo-600 transition-colors">
            {note.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-4 flex items-center">
          <Book className="h-3 w-3 mr-1" />
          {note.course}
        </p>

        <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-2" />
            <span>{date}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link
            to={`/notes/${note.id}`}
            className="flex items-center justify-center space-x-1 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Link>
          <Link
            to={`/notes/${note.id}`}
            className="flex items-center justify-center space-x-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
