import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, CheckCircle, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { fetchApi } from '../lib/api';

const Upload: React.FC = () => {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB limit');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('course', course);
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('file', file);

    try {
      await fetchApi('/notes/upload', {
        method: 'POST',
        body: formData,
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Successful!</h2>
          <p className="text-gray-500">Your notes are now available for the community. Redirecting you home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Upload New Notes</h1>
          <p className="text-gray-500 mt-2">Fill in the details below to share your knowledge.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center shadow-sm">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Note Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Intro to Quantum Mechanics"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name</label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. PHY101"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Organic Chemistry"
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Content & File</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Briefly describe what's platform in these notes..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">File (PDF, DOC, PPT)</label>
              {!file ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-indigo-400 transition-colors cursor-pointer relative group">
                  <div className="space-y-2 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx" />
                      </label>
                      <p className="pl-1 text-gray-500">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-400 tracking-tight">PDF, DOC, PPT up to 50MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-indigo-600 mr-3" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end pt-4">
             <button
               type="button"
               disabled={loading}
               onClick={() => navigate('/')}
               className="mr-4 px-8 py-4 text-gray-600 font-bold hover:text-gray-900 transition-colors disabled:opacity-50"
             >
               Cancel
             </button>
             <button
               type="submit"
               disabled={loading}
               className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center disabled:opacity-50"
             >
               {loading ? (
                 <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading...</>
               ) : (
                 'Publish Notes'
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
