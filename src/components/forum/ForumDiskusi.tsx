import React, { useState } from 'react';
import { ForumPost, ForumReply, Role, Student, Materi, CategoryType } from '../../types';
import { MessageSquare, Pin, ThumbsUp, CheckCircle, Shield, GraduationCap, Plus, Search, Filter, Trash2, Send, Tag, BookOpen, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { storageService } from '../../services/storage';

interface ForumDiskusiProps {
  currentRole: Role;
  currentStudent: Student;
  materiList: Materi[];
  forumPosts: ForumPost[];
}

export const ForumDiskusi: React.FC<ForumDiskusiProps> = ({
  currentRole,
  currentStudent,
  materiList,
  forumPosts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedMateriId, setSelectedMateriId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // New Post Form State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<CategoryType | 'umum'>('qowaid');
  const [newPostMateriId, setNewPostMateriId] = useState<string>('');

  // Reply Form State
  const [replyContent, setReplyContent] = useState('');

  // Filter posts
  const filteredPosts = forumPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesMateri = selectedMateriId === 'all' || post.materiId === selectedMateriId;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesMateri && matchesSearch;
  });

  // Sort pinned posts first, then newest
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const selectedPost = forumPosts.find(p => p.id === selectedPostId);

  // Handle Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const linkedMateri = materiList.find(m => m.id === newPostMateriId);

    const guruProf = storageService.getGuruProfile();
    const authorName = currentRole === 'guru' ? (guruProf?.name || 'Ahmad Yusron') : currentStudent.name;
    const authorAvatar = currentRole === 'guru' 
      ? (guruProf?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80')
      : currentStudent.avatar;

    const newPost = storageService.addForumPost({
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      category: newPostCategory,
      materiId: newPostMateriId || undefined,
      materiTitle: linkedMateri?.title || undefined,
      authorId: currentRole === 'guru' ? 'guru-1' : currentStudent.id,
      authorName,
      authorRole: currentRole,
      authorAvatar,
    });

    setNewPostTitle('');
    setNewPostContent('');
    setIsCreatingPost(false);
    setSelectedPostId(newPost.id);
  };

  // Handle Add Reply
  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId || !replyContent.trim()) return;

    const guruProf = storageService.getGuruProfile();
    const authorName = currentRole === 'guru' ? (guruProf?.name || 'Ahmad Yusron') : currentStudent.name;
    const authorAvatar = currentRole === 'guru' 
      ? (guruProf?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80')
      : currentStudent.avatar;

    storageService.addForumReply(selectedPostId, {
      authorId: currentRole === 'guru' ? 'guru-1' : currentStudent.id,
      authorName,
      authorRole: currentRole,
      authorAvatar,
      content: replyContent.trim(),
    });

    setReplyContent('');
  };

  // Current user ID for likes
  const currentUserId = currentRole === 'guru' ? 'guru-1' : currentStudent.id;

  return (
    <div className="space-y-6">
      
      {/* Forum Header & Action Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 rounded-2xl p-6 text-white shadow-md border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Interaktif & Real-time
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Clock size={12} /> Sync Seluruh Perangkat
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="text-emerald-400" size={26} />
              Forum Diskusi & Tanya Jawab
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Wadah interaksi tanya jawab antara siswa dan guru mengenai materi pembelajaran Bahasa Arab.
            </p>
          </div>

          <button
            onClick={() => {
              setIsCreatingPost(true);
              setSelectedPostId(null);
            }}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>Buat Pertanyaan / Diskusi Baru</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Post List vs Create Post vs Post Detail */}
      {isCreatingPost ? (
        /* Create New Post Form */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreatingPost(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Buat Topik Diskusi Baru</h3>
                <p className="text-xs text-slate-500">Ajukan pertanyaan atau ajak berdiskusi seputar materi Bahasa Arab</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Pertanyaan / Topik <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bagaimana cara membedakan Isim dan Fi'il pada kalimat gundul?"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori Diskusi
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as CategoryType | 'umum')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm font-medium bg-white"
                >
                  <option value="qowaid">Qowaid (Tata Bahasa)</option>
                  <option value="hiwar">Hiwar (Percakapan)</option>
                  <option value="kosakata">Kosakata (Mufradat)</option>
                  <option value="mahfudzot">Mahfudzot (Kata Mutiara)</option>
                  <option value="umum">Diskusi Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tautan Materi Spesifik (Opsional)
                </label>
                <select
                  value={newPostMateriId}
                  onChange={(e) => setNewPostMateriId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm font-medium bg-white"
                >
                  <option value="">-- Tanpa Tautan Materi --</option>
                  {materiList.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.category.toUpperCase()}] {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Isi Pertanyaan / Penjelasan Lengkap <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Tuliskan secara jelas bagian mana dari materi yang membuat Anda bingung atau ingin ditanyakan..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsCreatingPost(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Send size={16} /> Terbitkan Pertanyaan
              </button>
            </div>
          </form>
        </div>
      ) : selectedPost ? (
        /* Selected Post Detail & Thread Replies View */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedPostId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft size={16} /> Kembali ke Daftar Forum
          </button>

          {/* Main Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedPost.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                      <Pin size={10} /> Disematkan Guru
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    {selectedPost.category || 'umum'}
                  </span>
                  {selectedPost.status === 'terjawab' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                      <CheckCircle size={10} /> Terjawab
                    </span>
                  )}
                  {selectedPost.materiTitle && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <BookOpen size={10} /> {selectedPost.materiTitle}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {selectedPost.title}
                </h1>
              </div>

              {/* Action Buttons for Guru or Author */}
              <div className="flex items-center gap-1 shrink-0">
                {currentRole === 'guru' && (
                  <button
                    onClick={() => storageService.togglePinPost(selectedPost.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      selectedPost.isPinned
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={selectedPost.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                  >
                    <Pin size={18} />
                  </button>
                )}

                {(currentRole === 'guru' || selectedPost.authorId === currentUserId) && (
                  <button
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin menghapus postingan diskusi ini?')) {
                        storageService.deleteForumPost(selectedPost.id);
                        setSelectedPostId(null);
                      }
                    }}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                    title="Hapus Diskusi"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Author Info & Content */}
            <div className="flex items-center gap-3">
              <img
                src={selectedPost.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={selectedPost.authorName}
                className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{selectedPost.authorName}</span>
                  {selectedPost.authorRole === 'guru' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                      <Shield size={10} /> Pengajar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      <GraduationCap size={10} /> Siswa
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(selectedPost.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm whitespace-pre-line leading-relaxed font-sans">
              {selectedPost.content}
            </div>

            {/* Like Button */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => storageService.toggleLikePost(selectedPost.id, currentUserId)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  (selectedPost.likedBy || []).includes(currentUserId)
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ThumbsUp size={14} />
                <span>Suka ({selectedPost.likes || 0})</span>
              </button>
            </div>
          </div>

          {/* Discussion Replies List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare size={20} className="text-emerald-600" />
              Tanggapan ({selectedPost.replies.length})
            </h3>

            {selectedPost.replies.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada jawaban. Jadilah yang pertama memberikan tanggapan!</p>
            ) : (
              <div className="space-y-4">
                {selectedPost.replies.map((reply) => {
                  const isVerified = reply.isVerifiedAnswer;

                  return (
                    <div
                      key={reply.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        isVerified
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={reply.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={reply.authorName}
                            className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">{reply.authorName}</span>
                              {reply.authorRole === 'guru' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                                  <Shield size={10} /> Guru / Pengajar
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                  <GraduationCap size={10} /> Siswa
                                </span>
                              )}
                              {isVerified && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-600 text-white shadow-xs">
                                  <CheckCircle size={10} /> Jawaban Terverifikasi Guru
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(reply.createdAt).toLocaleString('id-ID', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        </div>

                        {currentRole === 'guru' && (
                          <button
                            onClick={() => storageService.toggleVerifiedReply(selectedPost.id, reply.id)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isVerified
                                ? 'bg-teal-200 text-teal-900'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Tandai sebagai jawaban terverifikasi"
                          >
                            <CheckCircle size={14} />
                            <span className="hidden sm:inline">{isVerified ? 'Terverifikasi' : 'Verifikasi'}</span>
                          </button>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans pl-11">
                        {reply.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reply Input Form */}
            <form onSubmit={handleAddReply} className="pt-4 border-t space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Berikan Tanggapan / Jawaban Anda ({currentRole === 'guru' ? 'Sebagai Guru' : `Sebagai ${currentStudent.name}`})
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tuliskan tanggapan, bantuan, atau jawaban..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs sm:text-sm leading-relaxed"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Send size={14} /> Kirim Tanggapan
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Forum Thread List View with Category Filters */
        <div className="space-y-6">
          
          {/* Filters & Search Row */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Topik
                </button>
                <button
                  onClick={() => setSelectedCategory('qowaid')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'qowaid'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Qowaid
                </button>
                <button
                  onClick={() => setSelectedCategory('hiwar')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'hiwar'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Hiwar
                </button>
                <button
                  onClick={() => setSelectedCategory('kosakata')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'kosakata'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Kosakata
                </button>
                <button
                  onClick={() => setSelectedCategory('mahfudzot')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'mahfudzot'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Mahfudzot
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px] sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari topik diskusi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs font-medium"
                />
              </div>

            </div>

            {/* Filter by Specific Materi */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <Filter size={14} className="text-slate-400" />
              <span className="text-slate-500 font-bold shrink-0">Filter Tautan Modul:</span>
              <select
                value={selectedMateriId}
                onChange={(e) => setSelectedMateriId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-slate-700 font-medium focus:outline-hidden text-xs max-w-full truncate"
              >
                <option value="all">Semua Modul Materi</option>
                {materiList.map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.category.toUpperCase()}] {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {sortedPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <MessageSquare size={36} className="mx-auto text-slate-300" />
                <p className="text-slate-600 font-bold text-sm">Belum ada diskusi yang cocok dengan filter.</p>
                <button
                  onClick={() => setIsCreatingPost(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Buat Diskusi Baru
                </button>
              </div>
            ) : (
              sortedPosts.map((post) => {
                const hasTeacherReply = post.replies.some(r => r.authorRole === 'guru' || r.isVerifiedAnswer);

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all cursor-pointer hover:border-emerald-500 hover:shadow-md space-y-3 ${
                      post.isPinned
                        ? 'border-amber-300 bg-amber-50/30'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {post.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              <Pin size={10} /> Disematkan
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                            {post.category || 'umum'}
                          </span>
                          {hasTeacherReply && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                              <CheckCircle size={10} /> Dijawab Guru
                            </span>
                          )}
                          {post.materiTitle && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              <BookOpen size={10} /> {post.materiTitle}
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug hover:text-emerald-700 transition-colors">
                          {post.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-slate-400 text-xs font-semibold">
                        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <MessageSquare size={14} className="text-emerald-600" />
                          <span>{post.replies.length}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <ThumbsUp size={14} className="text-amber-500" />
                          <span>{post.likes || 0}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={post.authorName}
                          className="w-5 h-5 rounded-full border border-slate-300 object-cover"
                        />
                        <span className="font-bold text-slate-700">{post.authorName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 uppercase font-bold">
                          {post.authorRole}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
