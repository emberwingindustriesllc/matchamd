import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Pin, 
  Trash2, 
  Star, 
  MessageSquare,
  Search,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminModeration() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  const { user } = useAuth();
  
  const { data: profiles } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const profile = profiles?.[0];

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['allPosts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('forum_posts').select('*').order('created_date', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['allComments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('comments').select('*').order('created_date', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const updatePostMutation = useMutation({
    /** @param {any} params */
    mutationFn: async (params) => {
      const { id, data } = params;
      const { error } = await supabase.from('forum_posts').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      toast.success('Post updated');
    }
  });

  const deletePostMutation = useMutation({
    /** @param {any} id */
    mutationFn: async (id) => {
      const { error } = await supabase.from('forum_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      toast.success('Post deleted');
    }
  });

  const deleteCommentMutation = useMutation({
    /** @param {any} id */
    mutationFn: async (id) => {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allComments'] });
      toast.success('Comment deleted');
    }
  });

  if (profile && profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This page is only accessible to administrators.
          </p>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComments = comments.filter(comment =>
    comment.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      <Header title="Admin Moderation" showBack />

      <main className="px-4 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Community Moderation
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage posts, comments, and community content
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search posts and comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="posts" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Posts ({filteredPosts.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({filteredComments.length})
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {postsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : filteredPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No posts found</p>
              </Card>
            ) : (
              filteredPosts.map(post => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {post.title}
                        </h3>
                        {post.is_pinned && (
                          <Badge className="bg-amber-100 text-amber-700">
                            <Pin className="w-3 h-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {post.is_featured && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>By {post.author_name}</span>
                        <span>•</span>
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.likes_count} likes</span>
                        <span>•</span>
                        <span>{post.comments_count} comments</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(createPageUrl(`PostDetail?id=${post.id}`))}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={post.is_pinned ? "default" : "outline"}
                        onClick={() => updatePostMutation.mutate({
                          id: post.id,
                          data: { is_pinned: !post.is_pinned }
                        })}
                      >
                        <Pin className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant={post.is_featured ? "default" : "outline"}
                        onClick={() => updatePostMutation.mutate({
                          id: post.id,
                          data: { is_featured: !post.is_featured }
                        })}
                      >
                        <Star className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Delete this post?')) {
                            deletePostMutation.mutate(post.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : filteredComments.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No comments found</p>
              </Card>
            ) : (
              filteredComments.map(comment => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {comment.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>By {comment.author_name}</span>
                        <span>•</span>
                        <span>{comment.likes_count} likes</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Delete this comment?')) {
                          deleteCommentMutation.mutate(comment.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}