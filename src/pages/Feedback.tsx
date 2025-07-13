import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
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
const statuses = ['Posted', 'Review', 'In Progress', 'Closed'];

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, getValues } = useForm<Feedback>();
  const { user } = useAuth();

  // Fetch feedbacks (replace with real API call)
  // Fetch feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      let query = '';
      if (filter.category) query += `category=${encodeURIComponent(filter.category)}&`;
      if (filter.status) query += `status=${encodeURIComponent(filter.status)}&`;
      query += `page=${page}`;
      try {
        const data = await apiRequest<Feedback[]>({ method: 'GET', path: `feedback?${query}` });
        setFeedbacks(data);
        // TODO: setTotalPages from API if available
        setTotalPages(1);
      } catch (e) {
        setFeedbacks([]);
      }
    };
    fetchFeedbacks();
  }, [filter, page]);

  // Create or update feedback
  const onSubmit = async (data: Feedback) => {
    try {
      if (selectedId) {
        // Update status only (PATCH)
        await apiRequest({ method: 'PATCH', path: `feedback/${selectedId}`, body: { status: data.status } });
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
            status: 'Posted',
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
      // Handle error
    }
  };

  // Handle row click to populate form for editing status
  const handleRowClick = (fb: Feedback) => {
    setSelectedId(fb.id);
    setValue('category', fb.category || '');
    setValue('status', fb.status || 'Posted');
    setValue('message', fb.message || '');
  };

  // Delete feedback
  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await apiRequest({ method: 'DELETE', path: `feedback/${selectedId}` });
      setSelectedId(null);
      reset();
      setPage(1);
      setFilter({ ...filter });
    } catch (e) {
      // Handle error
    }
  };

  return (
    <div className="flex gap-6">
      {/* Feedback Form */}
      <Card className="flex-1 max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Submit Feedback</h2>
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
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
            <Textarea id="message" {...register('message')} placeholder="Your feedback..." required rows={6} disabled={!!selectedId} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{selectedId ? 'Update Status' : 'Submit'}</Button>
            {selectedId && <Button type="button" variant="destructive" onClick={handleDelete}>Delete</Button>}
            {selectedId && <Button type="button" variant="outline" onClick={() => { setSelectedId(null); reset(); }}>Cancel</Button>}
          </div>
        </form>
      </Card>
      {/* Feedback Grid */}
      <Card className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Feedbacks</h2>
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1"
              value={filter.category}
              onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Message</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr><td colSpan={4} className="text-center">No feedback found.</td></tr>
            ) : feedbacks.map(fb => (
              <tr key={fb.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleRowClick(fb)}>
                <td>{new Date(fb.submitted_at).toLocaleDateString()}</td>
                <td>{fb.message.length > 15 ? fb.message.slice(0, 15) + '…' : fb.message}</td>
                <td>{fb.category}</td>
                <td>{fb.status}</td>
              </tr>
            ))}
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
