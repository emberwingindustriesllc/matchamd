import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import ErrorState from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  Award, 
  TrendingUp,
  Clock,
  Pin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  { id: 'all', label: 'All Posts' },
  { id: 'usmle_prep', label: 'USMLE Prep' },
  { id: 'visa_questions', label: 'Visa Q&A' },
  { id: 'eras_tips', label: 'ERAS Tips' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'match', label: 'Match' },
  { id: 'success_stories', label: 'Success Stories' },
  { id: 'general', label: 'General' }
];

const categoryColors = {
  usmle_prep: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  visa_questions: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  eras_tips: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  interviews: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  match: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  success_stories: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  fellowship: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  med_school: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
};

export default function Community() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id
  });

  const { data: posts = [], isLoading, error: postsError, refetch } = useQuery({
    queryKey: ['posts', activeCategory, sortBy],
    queryFn: async () => {
      const filter = activeCategory !== 'all' ? { category: activeCategory } : {};
      return base44.entities.ForumPost.filter(filter, sortBy === 'recent' ? '-created_date' : '-likes_count');
    },
    retry: 2,
    staleTime: 2 * 60 * 1000
  });

  const profile = profiles?.[0];

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      return base44.entities.ForumPost.create({
        ...postData,
        author_id: user.id,
        author_name: profile?.display_name || user?.full_name,
        author_avatar: profile?.avatar_url,
        is_mentor: profile?.mentor_verified || false,
        likes_count: 0,
        liked_by: [],
        comments_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsCreateOpen(false);
      setNewPost({ title: '', content: '', category: 'general' });
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async (post) => {
      const isLiked = post.liked_by?.includes(user.id);
      const newLikedBy = isLiked 
        ? post.liked_by.filter(id => id !== user.id)
        : [...(post.liked_by || []), user.id];
      
      return base44.entities.ForumPost.update(post.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="Community" />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={sortBy} onValueChange={setSortBy}>
            <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl">
              <TabsTrigger value="recent" className="rounded-lg gap-1">
                <Clock className="w-4 h-4" /> Recent
              </TabsTrigger>
              <TabsTrigger value="popular" className="rounded-lg gap-1">
                <TrendingUp className="w-4 h-4" /> Popular
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" /> Post
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="rounded-xl"
                />
                <Select 
                  value={newPost.category} 
                  onValueChange={(v) => setNewPost({ ...newPost, category: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Share your question, tip, or experience..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[150px] rounded-xl"
                />
                <Button 
                  onClick={() => createPostMutation.mutate(newPost)}
                  disabled={!newPost.title || !newPost.content}
                  className="w-full rounded-xl"
                >
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error State */}
        {postsError && (
          <ErrorState 
            title="Unable to Load Posts"
            message="We couldn't load community posts. Please try again."
            onRetry={refetch}
          />
        )}

        {/* Posts List */}
        {!postsError && (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author_avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      {post.author_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800 dark:text-white truncate">
                        {post.author_name}
                      </span>
                      {post.is_mentor && (
                        <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      {post.is_pinned && (
                        <Pin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className={categoryColors[post.category] || categoryColors.general}>
                    {categories.find(c => c.id === post.category)?.label || post.category}
                  </Badge>
                </div>

                {/* Content */}
                <button
                  onClick={() => navigate(createPageUrl(`PostDetail?id=${post.id}`))}
                  className="text-left w-full"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                    {post.content}
                  </p>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => likePostMutation.mutate(post)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      post.liked_by?.includes(user?.id)
                        ? 'text-rose-500'
                        : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.liked_by?.includes(user?.id) ? 'fill-current' : ''}`} />
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <button
                    onClick={() => navigate(createPageUrl(`PostDetail?id=${post.id}`))}
                    className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments_count || 0}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">No posts yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">Be the first to start a discussion!</p>
              <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl">
                Create Post
              </Button>
            </div>
          )}
        </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}