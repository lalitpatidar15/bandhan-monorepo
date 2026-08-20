'use client';

import { useDeleteContentModerationPostMutation, useGetContentModerationPostsQuery } from '@/lib/adminApi';

export default function ContentGovernance() {
  const { data: posts = [] } = useGetContentModerationPostsQuery();
  const [deletePost, { isLoading }] = useDeleteContentModerationPostMutation();

  const remove = async (id: string) => {
    try {
      await deletePost(id).unwrap();
    } catch (error) {
      console.error('Unable to remove content:', error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Content Governance</h1>
        <p className="admin-page-sub">Review and remove community/blog content that violates policies.</p>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">{post.authorName}</h2>
                <p className="text-xs text-gray-500">{post.authorEmail}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{post.content || 'No text content'}</p>
                {post.image ? <p className="mt-2 text-xs text-blue-700">Image attached</p> : null}
                {post.video ? <p className="mt-1 text-xs text-blue-700">Video attached</p> : null}
              </div>
              <button onClick={() => remove(post.id)} disabled={isLoading} className="admin-btn admin-btn-danger text-xs">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
