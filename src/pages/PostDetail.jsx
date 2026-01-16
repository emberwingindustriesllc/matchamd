import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Award, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const categoryColors = {
  usmle_prep: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  visa_questions: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  eras_tips: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  interviews: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  match: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  success_stories: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
};

export default function PostDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const [newComment, setNewComment] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => base44.entities.ForumPost.filter({ id: postId }),
    enabled: !!postId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => base44.entities.Comment.filter({ post_id: postId }, 'created_date'),
    enabled: !!postId
  });

  const post = posts[0];
  const profile = profiles?.[0];

  const likePostMutation = useMutation({
    mutationFn: async () => {
      const isLiked = post.liked_by?.includes(user.id);
      const newLikedBy = isLiked 
        ? post.liked_by.filter(id => id !== user.id)
        : [...(post.liked_by || []), user.id];
      
      return base44.entities.ForumPost.update(post.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['post', postId] })
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.Comment.create({
        post_id: postId,
        author_id: user.id,
        author_name: profile?.display_name || user?.full_name,
        author_avatar: profile?.avatar_url,
        is_mentor: profile?.mentor_verified || false,
        content,
        likes_count: 0,
        liked_by: []
      });
      
      // Update comment count on post
      await base44.entities.ForumPost.update(post.id, {
        comments_count: (post.comments_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      setNewComment('');
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (comment) => {
      const isLiked = comment.liked_by?.includes(user.id);
      const newLikedBy = isLiked 
        ? comment.liked_by.filter(id => id !== user.id)
        : [...(comment.liked_by || []), user.id];
      
      return base44.entities.Comment.update(comment.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] })
  });

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-32">
      <Header title="Discussion" showBack />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm mb-6"
        >
          {/* Author */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.author_avatar} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                {post.author_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-white">
                  {post.author_name}
                </span>
                {post.is_mentor && (
                  <Award className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
              </p>
            </div>
            <Badge className={categoryColors[post.category] || categoryColors.general}>
              {post.category?.replace('_', ' ')}
            </Badge>
          </div>

          {/* Content */}
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
            {post.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => likePostMutation.mutate()}
              className={`flex items-center gap-2 transition-colors ${
                post.liked_by?.includes(user?.id)
                  ? 'text-rose-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${post.liked_by?.includes(user?.id) ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes_count || 0}</span>
            </button>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">{comments.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">
            Comments ({comments.length})
          </h2>

          <div className="space-y-4">
            <AnimatePresence>
              {comments.map((comment, idx) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author_avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                        {comment.author_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-800 dark:text-white">
                          {comment.author_name}
                        </span>
                        {comment.is_mentor && (
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{comment.content}</p>
                      <button
                        onClick={() => likeCommentMutation.mutate(comment)}
                        className={`flex items-center gap-1.5 mt-2 text-xs transition-colors ${
                          comment.liked_by?.includes(user?.id)
                            ? 'text-rose-500'
                            : 'text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${comment.liked_by?.includes(user?.id) ? 'fill-current' : ''}`} />
                        <span>{comment.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Comment Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 min-h-[44px] max-h-[120px] rounded-xl resize-none"
            rows={1}
          />
          <Button
            onClick={() => addCommentMutation.mutate(newComment)}
            disabled={!newComment.trim()}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}