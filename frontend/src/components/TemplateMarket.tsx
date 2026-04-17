import { useState, useEffect } from 'react';
import { LayoutGrid, Star, Users, Plus, Check, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  popular: boolean;
  usage_count: number;
}

export function TemplateMarket() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'all' 
        ? 'http://localhost:8000/api/v1/templates/'
        : `http://localhost:8000/api/v1/templates/?category=${selectedCategory}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setCreating(templateId);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/templates/${templateId}/use`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setCreated(templateId);
        setTimeout(() => setCreated(null), 2000);
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setCreating(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      productivity: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      notification: 'bg-red-500/20 text-red-400 border-red-500/30',
      automation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      crm: 'bg-green-500/20 text-green-400 border-green-500/30',
      finance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Templates</h2>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name.toLowerCase())}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
              selectedCategory === cat.name.toLowerCase()
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            {cat.name}
            <span className="ml-1.5 text-xs text-slate-500">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{template.icon}</span>
                {template.popular && (
                  <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                    <Star className="w-3 h-3" />
                    Popular
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-white mb-1">{template.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{template.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3 h-3" />
                  {template.usage_count.toLocaleString()}
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
              </div>

              <button
                onClick={() => handleUseTemplate(template.id)}
                disabled={creating === template.id || created === template.id}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
              >
                {creating === template.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                ) : created === template.id ? (
                  <><Check className="w-4 h-4" /> Created!</>
                ) : (
                  <><Plus className="w-4 h-4" /> Use Template</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
