import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Search,
  Plus,
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  BookMarked
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_BOOKS = [
  {
    id: 'bk-fa-step1-2026',
    sku: 'BK-FA-ST1',
    title: 'First Aid for the USMLE Step 1',
    author: 'Tao Le, Vikas Bhushan',
    category: 'Step 1',
    description: 'The unrivaled high-yield review for USMLE Step 1. Updated annually with high-yield facts, mnemonics, and full-color diagrams.',
    status: 'completed',
    rating: 5,
    resourceLink: 'https://www.amazon.com/dp/1266077366',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'bk-pathoma-pathology',
    sku: 'BK-PATH-01',
    title: 'Pathoma: Fundamentals of Pathology',
    author: 'Husain A. Sattar, MD',
    category: 'Step 1',
    description: 'Essential high-yield pathology text for USMLE Step 1 integration, featuring clear clinical correlations and disease mechanisms.',
    status: 'completed',
    rating: 5,
    resourceLink: 'https://www.pathoma.com',
    createdAt: '2026-01-12T00:00:00.000Z'
  },
  {
    id: 'bk-fa-step2ck',
    sku: 'BK-FA-ST2',
    title: 'First Aid for the USMLE Step 2 CK',
    author: 'Tao Le, Vikas Bhushan',
    category: 'Step 2 CK',
    description: 'High-yield guide for clinical knowledge prep, focusing on diagnosis, workup, and management steps across internal medicine, surgery, pediatrics, and OB/GYN.',
    status: 'reading',
    rating: 5,
    resourceLink: 'https://www.amazon.com',
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'bk-mtb-step2ck',
    sku: 'BK-MTB-ST2',
    title: 'Master the Boards USMLE Step 2 CK',
    author: 'Conrad Fischer, MD',
    category: 'Step 2 CK',
    description: 'Targeted algorithm-focused board preparation book detailing next best step in management for clinical shelf exams and Step 2 CK.',
    status: 'reading',
    rating: 4,
    resourceLink: 'https://www.kaptest.com',
    createdAt: '2026-02-05T00:00:00.000Z'
  },
  {
    id: 'bk-crush-step3',
    sku: 'BK-CRSH-ST3',
    title: 'Crush Step 3: The Ultimate USMLE Step 3 Review',
    author: 'Adam Brochert, MD',
    category: 'Step 3',
    description: 'Comprehensive review for USMLE Step 3 and CCS case management, focusing on outpatient vs inpatient management.',
    status: 'wishlist',
    rating: 4,
    resourceLink: 'https://www.elsevier.com',
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'bk-fa-match',
    sku: 'BK-FA-MATCH',
    title: 'First Aid for the Match & ERAS Guide',
    author: 'Tao Le, Chirag Amin',
    category: 'Residency Prep',
    description: 'Complete guide for international and US medical graduates navigating ERAS application, residency interviews, and post-interview rank lists.',
    status: 'completed',
    rating: 5,
    resourceLink: 'https://www.matchamd.com',
    createdAt: '2026-03-10T00:00:00.000Z'
  },
  {
    id: 'bk-pocket-med',
    sku: 'BK-PKT-MED',
    title: 'Pocket Medicine: Mass General Hospital Handbook',
    author: 'Marc S. Sabatine, MD',
    category: 'Clinical Rotations',
    description: 'The indispensible loose-leaf clinical reference for inpatient internal medicine wards and ICU management.',
    status: 'reading',
    rating: 5,
    resourceLink: 'https://www.lww.com',
    createdAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'bk-surg-recall',
    sku: 'BK-SRG-RCL',
    title: 'Surgical Recall (8th Edition)',
    author: 'Lorne H. Blackbourne, MD',
    category: 'Clinical Rotations',
    description: 'Rapid-fire Q&A formatted handbook designed for surgical shelf exams and operating room pimping questions.',
    status: 'completed',
    rating: 4,
    resourceLink: 'https://www.lww.com',
    createdAt: '2026-04-15T00:00:00.000Z'
  }
];

const CATEGORIES = [
  'All',
  'Step 1',
  'Step 2 CK',
  'Step 3',
  'Clinical Rotations',
  'Residency Prep'
];

const STORAGE_KEY = 'matchamd_book_catalog_list_v1';

export default function BookCatalog() {
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return DEFAULT_BOOKS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Step 2 CK');
  const [newDescription, setNewDescription] = useState('');
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.warn('Failed to save book catalog', e);
    }
  }, [books]);

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) {
      toast.error('Please enter title and author');
      return;
    }
    const newBook = {
      id: `bk-custom-${Date.now()}`,
      sku: `BK-CST-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle.trim(),
      author: newAuthor.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Custom medical reference resource.',
      status: 'wishlist',
      rating: 5,
      resourceLink: newLink.trim() || '',
      createdAt: new Date().toISOString()
    };

    setBooks([newBook, ...books]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewAuthor('');
    setNewDescription('');
    setNewLink('');
    toast.success(`Added "${newBook.title}" to catalog`);
  };

  const handleUpdateStatus = (bookId, status) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status } : b));
    toast.success('Status updated');
  };

  const handleDeleteBook = (bookId, title) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setSelectedBook(null);
    toast.info(`Removed "${title}" from catalog`);
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Mastered</Badge>;
      case 'reading':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Studying</Badge>;
      case 'wishlist':
      default:
        return <Badge variant="outline" className="text-slate-500 dark:text-slate-400"><Bookmark className="w-3 h-3 mr-1" /> Planned</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      <Header title="Study & Resource Catalog" />

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-6 mb-6 shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2 font-medium text-sm">
              <BookMarked className="w-4 h-4" />
              <span>USMLE & Medical Board Resources</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              MatchaMD Medical Book Catalog
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mb-4">
              Curate, track, and master your essential medical board review books, shelf exam guides, and residency preparation materials.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Book / Guide
              </Button>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10 text-white pointer-events-none">
            <BookOpen className="w-64 h-64" />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books, authors, or topics..."
                className="pl-9 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px] rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="completed">Mastered</SelectItem>
                  <SelectItem value="reading">Studying</SelectItem>
                  <SelectItem value="wishlist">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pt-2 border-t border-slate-100 dark:border-slate-700/50">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white dark:bg-slate-800 flex flex-col">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {book.category}
                    </Badge>
                    {getStatusBadge(book.status)}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-1 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    By {book.author}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-1">
                    {book.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between mt-auto">
                    <span className="text-[11px] font-mono text-slate-400">
                      {book.sku}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setSelectedBook(book)}
                        className="h-8 px-2 text-xs rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        Details
                      </Button>
                      <Select
                        value={book.status}
                        onValueChange={(val) => handleUpdateStatus(book.id, val)}
                      >
                        <SelectTrigger className="h-8 text-[11px] w-[100px] rounded-lg bg-slate-50 dark:bg-slate-900/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wishlist">Planned</SelectItem>
                          <SelectItem value="reading">Studying</SelectItem>
                          <SelectItem value="completed">Mastered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">No books found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Try adjusting your search query or filters.
            </p>
            <Button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatus('All'); }}
              variant="outline"
              className="rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      {/* Add Custom Book Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-slate-900 dark:text-white">
              <Plus className="w-5 h-5 mr-2 text-emerald-500" />
              Add Medical Book or Resource
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddBook} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Book / Guide Title *
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Master the Boards Step 3"
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Author(s) / Publisher *
              </label>
              <Input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="e.g. Dr. Conrad Fischer"
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Category
              </label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Key Notes / Description
              </label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="High yield points, clinical algorithms, shelf topics..."
                className="rounded-xl text-xs"
                rows={3}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Resource Link (Optional)
              </label>
              <Input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                Save Book
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Book Detail Modal */}
      <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
        {selectedBook && (
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {selectedBook.category}
                </Badge>
                {getStatusBadge(selectedBook.status)}
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white pt-2">
                {selectedBook.title}
              </DialogTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Author: {selectedBook.author} | SKU: <span className="font-mono">{selectedBook.sku}</span>
              </p>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description & Overview
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedBook.description}
                </p>
              </div>

              {selectedBook.resourceLink && (
                <div>
                  <a
                    href={selectedBook.resourceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Open External Publisher / Store Link
                  </a>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteBook(selectedBook.id, selectedBook.title)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>

              <Button
                onClick={() => setSelectedBook(null)}
                className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 rounded-xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <BottomNav />
    </div>
  );
}
