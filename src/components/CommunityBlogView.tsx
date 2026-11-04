import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Share2, 
  Bookmark, 
  Tag 
} from 'lucide-react';
import { ActiveView } from '../types';

interface CommunityBlogViewProps {
  onNavigate: (view: ActiveView) => void;
}

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
  tags: string[];
}

export const CommunityBlogView: React.FC<CommunityBlogViewProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const posts: BlogPost[] = [
    {
      id: 'arabic-dialect-modeling',
      title: 'كيف نقوم بنمذجة اللهجات العربية في محركات الذكاء الاصطناعي الصوتي؟',
      summary: 'نظرة متعمقة على التحديات الصوتية والصرفية للهجات الخليجية والشامية والمصرية، وكيف تضمن معالجة التشكيل دقة مخارج الحروف.',
      category: 'تقنية وأبحاث',
      date: '5 سبتمبر 2026',
      readTime: '6 دقائق قراءة',
      author: 'م. أحمد التميمي - رئيس هندسة الصوت بـ Qeema',
      image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
      tags: ['اللهجات العربية', 'TTS', 'هندسة الصوت']
    },
    {
      id: 'human-ai-harmony',
      title: 'بين المعلق البشري ونموذج AI: كيف تصنع الشركات توازناً صوتياً ناجحاً؟',
      summary: 'دراسة حالة لشركات اتصالات ومصارف سعودية استخدمت النماذج الاصطناعية لخدمة العملاء مع الاحتفاظ بالمعلقين الأصليين للحملات الوطنية.',
      category: 'دراسات حالة',
      date: '28 أغسطس 2026',
      readTime: '8 دقائق قراءة',
      author: 'سارة القحطاني - مديرة شراكات الإنتاج',
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80',
      tags: ['B2B', 'استراتيجية العلامة', 'الإنتاج الصوتي']
    },
    {
      id: 'audio-quality-standards',
      title: 'معايير جودة الصوت 48kHz: الفارق بين التسجيل المنزلي وبث الاستوديو الاحترافي',
      summary: 'ما الذي يجعل جودة التسجيل مقبولة للبث التلفزيوني ونظم الرد الآلي المؤسسي؟ مراجعة شاملة لنسب الضوضاء ونطاق الترددات.',
      category: 'هندسة استوديو',
      date: '15 أغسطس 2026',
      readTime: '5 دقائق قراءة',
      author: 'كريم المنصوري - مهندس ماسترينغ استوديو',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      tags: ['جودة الصوت', '48kHz', 'المعايير القياسية']
    },
    {
      id: 'ethics-and-licensing',
      title: 'أخلاقيات الذكاء الاصطناعي الصوتي وحماية حقوق المعلقين في العالم العربي',
      summary: 'كيف تضمن منصة قيمة حماية حقوق المواهب الصوتية عبر التوأمة الرقمية الموثقة والعقود التجارية النظامية مع نسب أرباح عادلة.',
      category: 'أخلاقيات وقوانين',
      date: '2 أغسطس 2026',
      readTime: '7 دقائق قراءة',
      author: 'د. فيصل الشهري - المستشار القانوني وحماية الملكية الفكرية',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      tags: ['الملكية الفكرية', 'حقوق المعلقين', 'أخلاقيات AI']
    }
  ];

  const categories = [
    { key: 'all', label: 'كافة المقالات' },
    { key: 'تقنية وأبحاث', label: 'تقنية وأبحاث' },
    { key: 'دراسات حالة', label: 'دراسات حالة' },
    { key: 'هندسة استوديو', label: 'هندسة استوديو' },
    { key: 'أخلاقيات وقوانين', label: 'أخلاقيات وقوانين' }
  ];

  const filteredPosts = posts.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-brand/10 text-brand-text border border-brand/20">
              مجتمع قيمة • المدونة
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            مدونة الصوت والذكاء الاصطناعي العربي
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مقالات، دراسات حالة معمقة، وأحدث ابتكارات هندسة الصوت العربي ونماذج التعليق الصوتي.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="ابحث في المقالات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.key
                ? 'bg-brand-ink text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map(post => (
          <article
            key={post.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="h-52 overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-brand-text transition-colors">
                  {post.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {post.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-xs font-semibold text-slate-500">{post.author}</span>
              <button 
                onClick={() => alert(`قراءة المقال: ${post.title}`)}
                className="text-xs font-bold text-brand-text flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>قراءة المقال كاملاً</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
