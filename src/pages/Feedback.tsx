import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Table } from '../components/ui/table';
import { useForm } from 'react-hook-form';

// Feedback type
type Feedback = {
  id: string;
  user_id?: string;
  username?: string;
  message: string;
  category?: string;
  status: string;
  submitted_at: string;
  modified_at: string;
};

const categories = ['suggestion', 'bug', 'comment'];
const statuses = ['posted', 'review', 'in_progress', 'closed'];

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<Feedback>();
  const { user } = useAuth();

  // Fetch feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      let query = '';
      if (filter.category) query += `category=${encodeURIComponent(filter.category)}&`;
      if (filter.status) query += `status=${encodeURIComponent(filter.status)}&`;
      query += `page=${page}`;
      
      try {
        const response = await apiRequest<{ data: Feedback[], total?: number, pages?: number }>({ 
          method: 'GET', 
          path: `feedback?${query}` 
        });
        
        // Handle both array response and object response with data property
        if (Array.isArray(response)) {
          setFeedbacks(response);
        } else {
          setFeedbacks(response.data || []);
          if (response.pages) setTotalPages(response.pages);
        }
      } catch (e) {
        setError('Failed to fetch feedbacks');
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [filter, page]);

  // Create or update feedback
  const onSubmit = async (data: Feedback) => {
    setLoading(true);
    setError(null);
    
    try {
      if (selectedId) {
        // Update feedback (PATCH) - can update both status and message
        await apiRequest({ 
          method: 'PATCH', 
          path: `feedback/${selectedId}`, 
          body: { 
            status: data.status,
            message: data.message,
            modified_at: new Date().toISOString()
          } 
        });
      } else {
        // Create new feedback (POST)
        await apiRequest({
          method: 'POST',
          path: 'feedback',
          body: {
            user_id: user?.user_id,
            username: user?.username,
            message: data.message,
            category: data.category,
            status: 'posted',
            submitted_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
          },
        });
      }
      setSelectedId(null);
      reset();
      // Refresh feedbacks
      setPage(1);
      setFilter({ ...filter });
    } catch (e) {
      setError(selectedId ? 'Failed to update feedback' : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  // Handle row click to populate form for editing status
  const handleRowClick = (fb: Feedback) => {
    // Only allow editing if current user is the owner of the feedback
    if (user?.user_id && fb.user_id && String(user.user_id) === String(fb.user_id)) {
      setSelectedId(fb.id);
      setValue('category', fb.category || '');
      setValue('status', fb.status || 'posted');
      setValue('message', fb.message || '');
    } else {
      setError('You can only edit your own feedback');
    }
  };

  // Delete feedback
  const handleDelete = async () => {
    if (!selectedId) return;
    
    // Find the selected feedback to check ownership
    const selectedFeedback = feedbacks.find(fb => fb.id === selectedId);
    if (!selectedFeedback || !user?.user_id || String(selectedFeedback.user_id) !== String(user.user_id)) {
      setError('You can only delete your own feedback');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest({ method: 'DELETE', path: `feedback/${selectedId}` });
      setSelectedId(null);
      reset();
      setPage(1);
      setFilter({ ...filter });
    } catch (e: any) {
      console.error('Delete error:', e);
      setError('Failed to delete feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Error display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
          <button 
            className="ml-2 font-bold" 
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Feedback Form */}
      <Card className="flex-1 max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {selectedId ? 'Edit Feedback' : 'Submit Feedback'}
          </h2>
          <Button 
            type="button" 
            variant="default" 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => { setSelectedId(null); reset(); }}
          >
            New Feedback
          </Button>
        </div>
        {/* Display logged-in username at the top, readonly */}
        {user?.username && (
          <div className="text-xs text-gray-400 mb-2">{user.username}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="category">Category</label>
            <select
              id="category"
              className="border rounded px-2 py-1 w-full"
              {...register('category', { required: true })}
              required
              disabled={!!selectedId} // Disable editing category on update
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="status">Status</label>
            <select
              id="status"
              className="border rounded px-2 py-1 w-full"
              {...register('status', { required: true })}
              required
              disabled={!selectedId} // Only editable when editing
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
            <Textarea id="message" {...register('message')} placeholder="Your feedback..." required rows={6} disabled={false} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Loading...' : (selectedId ? 'Update Feedback' : 'Submit Feedback')}
            </Button>
            {selectedId && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </Card>
      {/* Feedback Grid */}
      <Card className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Feedbacks</h2>
            <p className="text-xs text-gray-500 mt-1">
              Click on your own feedback (highlighted in blue) to edit or delete it
            </p>
          </div>
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1"
              value={filter.category}
              onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <th className="text-left">Date</th>
              <th className="text-left">Username</th>
              <th className="text-left">Message</th>
              <th className="text-left">Category</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
            ) : feedbacks.length === 0 ? (
              <tr><td colSpan={5} className="text-center">No feedback found.</td></tr>
            ) : feedbacks.map(fb => {
              const isOwner = user?.user_id && fb.user_id && String(user.user_id) === String(fb.user_id);
              return (
                <tr 
                  key={fb.id} 
                  className={`cursor-pointer hover:bg-gray-100 ${isOwner ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`} 
                  onClick={() => handleRowClick(fb)}
                  title={isOwner ? 'Click to edit (your feedback)' : 'View only (not your feedback)'}
                >
                  <td className="text-left">{new Date(fb.submitted_at).toLocaleDateString()}</td>
                  <td className="text-left">
                    {fb.username || 'Unknown'}
                    {isOwner && <span className="ml-1 text-xs text-blue-600">(You)</span>}
                  </td>
                  <td className="text-left">{fb.message.length > 15 ? fb.message.slice(0, 15) + '…' : fb.message}</td>
                  <td className="text-left">{fb.category ? fb.category.charAt(0).toUpperCase() + fb.category.slice(1) : ''}</td>
                  <td className="text-left">{fb.status ? fb.status.charAt(0).toUpperCase() + fb.status.slice(1).replace('_', ' ') : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {/* Pagination */}
        <div className="flex justify-end gap-2 mt-4">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <span>Page {page} of {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </Card>
    </div>
  );
};

export default FeedbackPage;
