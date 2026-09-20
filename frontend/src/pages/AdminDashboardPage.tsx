import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, AlertTriangle, Plus, Search,
  Edit, Trash2, Upload, Image as ImageIcon, Check, X, ShieldAlert, DollarSign, TrendingUp, Sparkles, CheckCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AdminStats, Product, Category, Brand, Order, Coupon, User } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stock' | 'orders' | 'coupons' | 'customers'>('overview');
  
  // Dados do Dashboard
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');

  // Modal Novo / Editar Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Produto State
  const [prodForm, setProdForm] = useState({
    name: '',
    brand_id: 1,
    category_id: 1,
    gender: 'unissex',
    description: '',
    volume_ml: 100,
    concentration: 'Eau de Parfum',
    olfactory_family: 'Amadeirado Oriental',
    top_notes: '',
    heart_notes: '',
    base_notes: '',
    price: 1500.00,
    promotional_price: '',
    discount_percent: 0,
    stock: 10,
    sku: '',
    status: 'active',
    featured: false,
    release: true,
    bestseller: false
  });

  // State para Upload de Imagens do Computador
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      fetchAdminData();
    }
  }, [isAdmin, authLoading]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar Stats primeiro
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      // Buscar demais listas de forma independente
      const [prodRes, catRes, brandRes, ordRes, coupRes, custRes] = await Promise.allSettled([
        api.get('/admin/products'),
        api.get('/categories'),
        api.get('/brands'),
        api.get('/admin/orders'),
        api.get('/admin/coupons'),
        api.get('/admin/customers')
      ]);

      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data);
      if (brandRes.status === 'fulfilled') setBrands(brandRes.value.data);
      if (ordRes.status === 'fulfilled') setOrders(ordRes.value.data);
      if (coupRes.status === 'fulfilled') setCoupons(coupRes.value.data);
      if (custRes.status === 'fulfilled') setCustomers(custRes.value.data);

    } catch (err: any) {
      console.error("Erro ao carregar dados do admin:", err);
      
      if (!err.response) {
        setError("O servidor backend Python não está rodando na porta 8000. Por favor, dadas as instruções, dê dois cliques em 'iniciar_sistema.bat' ou execute 'python app/main.py' na pasta backend.");
      } else if (err.response.status === 401 || err.response.status === 403) {
        setError("Sua sessão expirou ou você não tem permissão de Administrador. Clique abaixo para entrar com a conta admin@aurumparfums.com.");
      } else {
        setError(err.response?.data?.detail || "Erro inesperado ao carregar métricas do servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler de Seleção de Arquivos do Computador (Janela do Windows)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);

      // Gerar URLs de pré-visualização instantânea no navegador
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemovePreview = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Abrir Modal de Produto
  const openProductModal = (prod: Product | null = null) => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (prod) {
      setEditingProduct(prod);
      setProdForm({
        name: prod.name,
        brand_id: prod.brand_id,
        category_id: prod.category_id,
        gender: prod.gender,
        description: prod.description,
        volume_ml: prod.volume_ml,
        concentration: prod.concentration,
        olfactory_family: prod.olfactory_family,
        top_notes: prod.top_notes || '',
        heart_notes: prod.heart_notes || '',
        base_notes: prod.base_notes || '',
        price: prod.price,
        promotional_price: prod.promotional_price ? String(prod.promotional_price) : '',
        discount_percent: prod.discount_percent,
        stock: prod.stock,
        sku: prod.sku,
        status: prod.status,
        featured: prod.featured,
        release: prod.release,
        bestseller: prod.bestseller
      });
    } else {
      setEditingProduct(null);
      setProdForm({
        name: '',
        brand_id: brands[0]?.id || 1,
        category_id: categories[0]?.id || 1,
        gender: 'unissex',
        description: '',
        volume_ml: 100,
        concentration: 'Eau de Parfum',
        olfactory_family: 'Amadeirado Oriental',
        top_notes: '',
        heart_notes: '',
 base_notes: '',
        price: 1500.00,
        promotional_price: '',
        discount_percent: 0,
        stock: 10,
        sku: `AUR-PROD-${Math.floor(100 + Math.random() * 900)}`,
        status: 'active',
        featured: false,
        release: true,
        bestseller: false
      });
    }
    setIsProductModalOpen(true);
  };

  // Salvar Produto (Criar ou Editar)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingImages(true);

      const parsedPrice = typeof prodForm.price === 'number' ? prodForm.price : parseFloat(String(prodForm.price)) || 0;
      const parsedPromo = prodForm.promotional_price !== '' && prodForm.promotional_price !== null 
        ? parseFloat(String(prodForm.promotional_price)) 
        : null;

      const payload = {
        name: prodForm.name.trim(),
        brand_id: Number(prodForm.brand_id),
        category_id: Number(prodForm.category_id),
        gender: prodForm.gender,
        description: prodForm.description.trim(),
        volume_ml: Number(prodForm.volume_ml) || 100,
        concentration: prodForm.concentration.trim() || 'Eau de Parfum',
        olfactory_family: prodForm.olfactory_family.trim() || 'Amadeirado Oriental',
        top_notes: prodForm.top_notes?.trim() || null,
        heart_notes: prodForm.heart_notes?.trim() || null,
        base_notes: prodForm.base_notes?.trim() || null,
        price: parsedPrice,
        promotional_price: parsedPromo,
        discount_percent: Number(prodForm.discount_percent) || 0,
        stock: Number(prodForm.stock) >= 0 ? Number(prodForm.stock) : 0,
        sku: prodForm.sku?.trim() || `AUR-${Date.now()}`,
        status: prodForm.status || 'active',
        featured: Boolean(prodForm.featured),
        release: Boolean(prodForm.release),
        bestseller: Boolean(prodForm.bestseller)
      };

      let prodId: number;
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        prodId = editingProduct.id;
      } else {
        const res = await api.post('/admin/products', payload);
        prodId = res.data.id;
      }

      // Fazer Upload das Imagens Selecionadas do Computador usando fetch nativo para gerar boundary multipart perfeito
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        const token = localStorage.getItem('aurum_token');
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const uploadUrl = `http://${host}:8000/api/admin/products/${prodId}/upload-images`;

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          const errJson = await uploadRes.json().catch(() => ({}));
          throw new Error(errJson.detail || "Erro ao realizar o upload das fotos.");
        }
      }

      await fetchAdminData();
      setIsProductModalOpen(false);
      alert("✨ Produto e foto(s) salvos com sucesso no catálogo!");
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      let errorMsg = "Erro ao salvar produto.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((d: any) => `${d.loc ? d.loc.join(' -> ') : ''}: ${d.msg}`).join('\n');
        } else {
          errorMsg = err.response.data.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      alert(`⚠️ Não foi possível salvar:\n\n${errorMsg}`);
    } finally {
      setUploadingImages(false);
    }
  };

  // Gerenciar Fotos Existentes (Tornar Principal e Excluir)
  const handleSetPrimaryImage = async (productId: number, imageId: number) => {
    try {
      const res = await api.put(`/admin/products/${productId}/set-primary-image/${imageId}`);
      setEditingProduct(res.data);
      await fetchAdminData();
    } catch (err) {
      alert("Erro ao definir foto como principal.");
    }
  };

  const handleDeleteImage = async (productId: number, imageId: number) => {
    if (window.confirm("Deseja excluir esta foto da galeria do perfume?")) {
      try {
        const res = await api.delete(`/admin/products/${productId}/images/${imageId}`);
        setEditingProduct(res.data);
        await fetchAdminData();
      } catch (err) {
        alert("Erro ao excluir foto.");
      }
    }
  };

  // Excluir Produto
  const handleDeleteProduct = async (prodId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este perfume permanentemente?")) {
      try {
        await api.delete(`/admin/products/${prodId}`);
        await fetchAdminData();
      } catch (err) {
        alert("Erro ao excluir produto.");
      }
    }
  };

  // Alterar Status do Pedido
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      await fetchAdminData();
    } catch (err) {
      alert("Erro ao atualizar status do pedido.");
    }
  };

  // Alterar Estoque Rápido
  const handleUpdateStock = async (prodId: number, newStock: number) => {
    try {
      await api.patch(`/admin/products/${prodId}/stock?stock=${newStock}`);
      await fetchAdminData();
    } catch (err) {
      alert("Erro ao atualizar estoque.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-aurum-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-aurum-gray">Carregando métricas e dados administrativos...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500 flex items-center justify-center mx-auto shadow-glass">
          <ShieldAlert className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">Não foi possível carregar o Painel</h2>
        <p className="text-xs text-aurum-gray leading-relaxed">
          {error || "É necessário estar autenticado com uma conta de Administrador para acessar as métricas."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/admin/login')}
            className="px-6 py-3 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider shadow-gold"
          >
            Fazer Login como Administrador
          </button>
          <button
            onClick={fetchAdminData}
            className="px-6 py-3 rounded-xl bg-aurum-surface border border-aurum-border text-slate-300 font-bold text-xs hover:border-aurum-gold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header do Painel Admin */}
      <div className="p-6 rounded-3xl bg-aurum-card border border-aurum-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-glass">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold bg-aurum-gold text-aurum-dark px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Painel de Gestão VIP
            </span>
            <span className="text-xs text-aurum-gray">• Aurum Parfums</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">Dashboard Administrativo</h1>
        </div>

        {/* Botão de Destaque + NOVO PRODUTO */}
        <button
          onClick={() => openProductModal(null)}
          className="px-6 py-3 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-gold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ NOVO PRODUTO</span>
        </button>
      </div>

      {/* Navegação das Abas do Admin */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-aurum-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'overview' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-surface text-slate-300 border border-aurum-border'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'products' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-surface text-slate-300 border border-aurum-border'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Produtos ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'stock' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-surface text-slate-300 border border-aurum-border'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Estoque ({stats.low_stock_products_count} alertas)</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'orders' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-surface text-slate-300 border border-aurum-border'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Pedidos ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'coupons' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-surface text-slate-300 border border-aurum-border'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Cupons</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'customers' ? 'bg-aurum-gold text-aurum-dark shadow-gold' : 'bg-aurum-surface text-slate-300 border border-aurum-border'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes</span>
        </button>
      </div>

      {/* ABA 1: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-aurum-card border border-aurum-gold/30 space-y-2">
              <div className="flex justify-between items-center text-aurum-gold">
                <span className="text-xs font-bold uppercase tracking-wider">Faturamento Total</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="font-serif text-2xl font-bold text-white">
                R$ {stats.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-2">
              <div className="flex justify-between items-center text-aurum-gold">
                <span className="text-xs font-bold uppercase tracking-wider">Total de Pedidos</span>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <p className="font-serif text-2xl font-bold text-white">{stats.total_orders}</p>
            </div>

            <div className="p-5 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-2">
              <div className="flex justify-between items-center text-aurum-gold">
                <span className="text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="font-serif text-2xl font-bold text-white">
                R$ {stats.average_order_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-2">
              <div className="flex justify-between items-center text-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider">Estoque Baixo</span>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="font-serif text-2xl font-bold text-white">{stats.low_stock_products_count} produtos</p>
            </div>
          </div>

          {/* Vendas Recentes */}
          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">Últimas Vendas da Loja</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-aurum-gold uppercase border-b border-aurum-border">
                  <tr>
                    <th className="py-2.5">Pedido</th>
                    <th className="py-2.5">Cliente</th>
                    <th className="py-2.5">Valor Total</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aurum-border/40 text-slate-300">
                  {stats.recent_sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-aurum-surface">
                      <td className="py-3 font-bold text-white">{sale.order_number}</td>
                      <td className="py-3">{sale.customer_name}</td>
                      <td className="py-3 font-bold text-aurum-gold">R$ {sale.total.toFixed(2)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-3 text-aurum-gray">{new Date(sale.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ABA 2: GERENCIAMENTO DE PRODUTOS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="font-serif text-xl font-bold text-white">Catálogo de Perfumes ({products.length})</h2>
            
            <button
              onClick={() => openProductModal(null)}
              className="px-6 py-2.5 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold"
            >
              <Plus className="w-4 h-4" />
              <span>+ NOVO PRODUTO</span>
            </button>
          </div>

          {/* Tabela de Produtos */}
          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-aurum-gold uppercase border-b border-aurum-border">
                <tr>
                  <th className="py-2.5">Foto</th>
                  <th className="py-2.5">Nome / SKU</th>
                  <th className="py-2.5">Marca / Categoria</th>
                  <th className="py-2.5">Preço</th>
                  <th className="py-2.5">Estoque</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurum-border/40 text-slate-300">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-aurum-surface">
                    <td className="py-3">
                      <img
                        src={prod.images[0]?.image_url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=100&q=80'}
                        alt={prod.name}
                        className="w-10 h-10 object-cover rounded-lg bg-[#050508]"
                      />
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-white">{prod.name}</p>
                      <p className="text-[10px] text-aurum-gray">{prod.sku}</p>
                    </td>
                    <td className="py-3">
                      <p>{prod.brand.name}</p>
                      <p className="text-[10px] text-aurum-gray">{prod.category.name}</p>
                    </td>
                    <td className="py-3 font-bold text-aurum-gold">
                      R$ {(prod.promotional_price || prod.price).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.stock <= 0 ? 'bg-rose-500/20 text-rose-400' : prod.stock <= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {prod.stock} un.
                      </span>
                    </td>
                    <td className="py-3 uppercase text-[10px] font-bold text-slate-300">{prod.status}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openProductModal(prod)}
                          className="p-1.5 rounded-lg bg-aurum-surface border border-aurum-border text-aurum-gold hover:border-aurum-gold"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 rounded-lg bg-aurum-surface border border-aurum-border text-rose-400 hover:border-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ABA 3: GERENCIAMENTO DE ESTOQUE */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-white">Controle Direto de Estoque</h2>

          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-aurum-gold uppercase border-b border-aurum-border">
                <tr>
                  <th className="py-2.5">Perfume</th>
                  <th className="py-2.5">SKU</th>
                  <th className="py-2.5">Estoque Atual</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Alteração Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurum-border/40 text-slate-300">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-aurum-surface">
                    <td className="py-3 font-bold text-white">{prod.name}</td>
                    <td className="py-3 text-aurum-gray">{prod.sku}</td>
                    <td className="py-3 font-bold text-aurum-gold">{prod.stock} unidades</td>
                    <td className="py-3">
                      {prod.stock <= 0 ? (
                        <span className="text-rose-400 font-bold uppercase">Esgotado</span>
                      ) : prod.stock <= 5 ? (
                        <span className="text-amber-400 font-bold uppercase">Estoque Baixo</span>
                      ) : (
                        <span className="text-emerald-400 font-bold uppercase">OK</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={prod.stock}
                          id={`stock_input_${prod.id}`}
                          className="w-20 bg-aurum-surface border border-aurum-border rounded-lg p-1 text-center text-xs text-white"
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById(`stock_input_${prod.id}`) as HTMLInputElement).value;
                            handleUpdateStock(prod.id, parseInt(val));
                          }}
                          className="px-3 py-1 rounded-lg bg-aurum-gold text-aurum-dark font-bold text-[10px]"
                        >
                          Salvar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: PEDIDOS DO PAINEL */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-white">Gerenciamento de Pedidos</h2>

          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-aurum-gold uppercase border-b border-aurum-border">
                <tr>
                  <th className="py-2.5">Nº Pedido</th>
                  <th className="py-2.5">Cliente</th>
                  <th className="py-2.5">Método Pagamento</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Alterar Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurum-border/40 text-slate-300">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-aurum-surface">
                    <td className="py-3 font-bold text-white">{ord.order_number}</td>
                    <td className="py-3">{ord.customer_name}</td>
                    <td className="py-3 uppercase text-aurum-gold font-bold">{ord.payment_method}</td>
                    <td className="py-3 font-bold text-white">R$ {ord.total.toFixed(2)}</td>
                    <td className="py-3">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-aurum-surface border border-aurum-border rounded-lg py-1 px-2 text-xs text-white"
                      >
                        <option value="received">Pedido Recebido</option>
                        <option value="paid">Pagamento Aprovado</option>
                        <option value="preparing">Em Preparação</option>
                        <option value="shipped">Enviado</option>
                        <option value="in_transit">Em Trânsito</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: CUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-white">Cupons Promocionais</h2>
          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-aurum-gold uppercase border-b border-aurum-border">
                <tr>
                  <th className="py-2.5">Código</th>
                  <th className="py-2.5">Tipo</th>
                  <th className="py-2.5">Valor Desconto</th>
                  <th className="py-2.5">Mínimo Compra</th>
                  <th className="py-2.5">Usos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurum-border/40 text-slate-300">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 font-bold text-aurum-gold">{c.code}</td>
                    <td className="py-3">{c.discount_type}</td>
                    <td className="py-3 font-bold text-white">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `R$ ${c.discount_value}`}
                    </td>
                    <td className="py-3">R$ {c.min_purchase.toFixed(2)}</td>
                    <td className="py-3">{c.times_used} / {c.usage_limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 6: CLIENTES */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-white">Clientes Cadastrados ({customers.length})</h2>
          <div className="p-6 rounded-2xl bg-aurum-card border border-aurum-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-aurum-gold uppercase border-b border-aurum-border">
                <tr>
                  <th className="py-2.5">Nome</th>
                  <th className="py-2.5">E-mail</th>
                  <th className="py-2.5">Telefone</th>
                  <th className="py-2.5">Pedidos</th>
                  <th className="py-2.5">Total Comprado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurum-border/40 text-slate-300">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 font-bold text-white">{c.name}</td>
                    <td className="py-3 text-aurum-gray">{c.email}</td>
                    <td className="py-3">{c.phone || 'N/I'}</td>
                    <td className="py-3 font-bold text-white">{c.orders_count}</td>
                    <td className="py-3 font-bold text-aurum-gold">R$ {c.total_spent.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CADASTRO / EDIÇÃO DE PRODUTO E UPLOAD DE FOTOS */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
          <div className="bg-[#0D0D14] border border-aurum-gold/40 rounded-3xl p-6 sm:p-8 max-w-3xl w-full text-slate-100 space-y-6 shadow-2xl my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-aurum-border">
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-aurum-gold" />
                <span>{editingProduct ? 'Editar Perfume' : 'Cadastrar Novo Perfume'}</span>
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-aurum-gray hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              {/* Seção 1: Dados Gerais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Nome do Perfume</label>
                  <input
                    type="text"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="Ex: Aurum Imperial Oud"
                    required
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">SKU</label>
                  <input
                    type="text"
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    required
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Marca / Maison</label>
                  <select
                    value={prodForm.brand_id}
                    onChange={(e) => setProdForm({ ...prodForm, brand_id: parseInt(e.target.value) })}
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Categoria</label>
                  <select
                    value={prodForm.category_id}
                    onChange={(e) => setProdForm({ ...prodForm, category_id: parseInt(e.target.value) })}
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Gênero</label>
                  <select
                    value={prodForm.gender}
                    onChange={(e) => setProdForm({ ...prodForm, gender: e.target.value })}
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  >
                    <option value="unissex">Unissex</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Concentração</label>
                  <input
                    type="text"
                    value={prodForm.concentration}
                    onChange={(e) => setProdForm({ ...prodForm, concentration: e.target.value })}
                    placeholder="Ex: Eau de Parfum, Extrait de Parfum"
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Preço Original (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: parseFloat(e.target.value) })}
                    required
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Preço Promocional (R$ - opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodForm.promotional_price}
                    onChange={(e) => setProdForm({ ...prodForm, promotional_price: e.target.value })}
                    placeholder="Ex: 1290.00"
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Estoque Inicial (unidades)</label>
                  <input
                    type="number"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: parseInt(e.target.value) })}
                    required
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Volume (ml)</label>
                  <input
                    type="number"
                    value={prodForm.volume_ml}
                    onChange={(e) => setProdForm({ ...prodForm, volume_ml: parseInt(e.target.value) })}
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Descrição e Pirâmide Olfativa */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Família Olfativa</label>
                  <input
                    type="text"
                    value={prodForm.olfactory_family}
                    onChange={(e) => setProdForm({ ...prodForm, olfactory_family: e.target.value })}
                    placeholder="Ex: Amadeirado Oriental, Cítrico Floral"
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-aurum-gray font-semibold mb-1">Descrição Comercial Detalhada</label>
                  <textarea
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    rows={3}
                    required
                    className="w-full bg-aurum-surface border border-aurum-border rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              {/* SEÇÃO CRÍTICA: UPLOAD DE FOTOS DIRETO DO COMPUTADOR WINDOWS */}
              <div className="p-5 rounded-2xl bg-aurum-surface border border-aurum-gold/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-aurum-gold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload de Fotos do Computador</span>
                  </span>
                  <span className="text-[10px] text-aurum-gray">Aceita JPG, PNG e WEBP</span>
                </div>

                {/* Botão Visível "+ ADICIONAR FOTOS" */}
                <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-aurum-gold/50 bg-aurum-card hover:bg-aurum-surface transition-all cursor-pointer text-center group">
                  <Upload className="w-8 h-8 text-aurum-gold group-hover:scale-110 transition-transform mb-2" />
                  <span className="font-serif font-bold text-white text-sm">
                    + ADICIONAR FOTOS DIRETO DO COMPUTADOR
                  </span>
                  <span className="text-[11px] text-aurum-gray mt-1">
                    Clique para navegar pelas pastas do Windows e selecionar imagens
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {/* Fotos Já Existentes do Produto (Modo Edição) */}
                {editingProduct && editingProduct.images.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-aurum-border/40">
                    <span className="text-xs font-semibold text-white block">Fotos Já Cadastradas no Perfume:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {editingProduct.images.map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-aurum-border bg-[#050508] group">
                          <img src={img.image_url} alt="Foto Existente" className="w-full h-full object-cover" />
                          
                          {img.is_primary ? (
                            <span className="absolute top-1 left-1 bg-aurum-gold text-aurum-dark font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow">
                              PRINCIPAL
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(editingProduct.id, img.id)}
                              className="absolute top-1 left-1 bg-aurum-surface/90 hover:bg-aurum-gold text-white hover:text-aurum-dark text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors"
                            >
                              Tornar Principal
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteImage(editingProduct.id, img.id)}
                            className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-600 text-white p-1 rounded-full text-[10px] transition-colors"
                            title="Excluir Foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Miniaturas Pré-Visualização das Novas Fotos Selecionadas */}
                {previewUrls.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-aurum-border/40">
                    <span className="text-xs font-semibold text-white block">Novas Fotos Selecionadas para Adicionar:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-aurum-gold group">
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePreview(index)}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-[10px]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação do Modal */}
              <div className="flex gap-4 pt-4 border-t border-aurum-border">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-1/2 py-3 rounded-xl bg-aurum-surface border border-aurum-border text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="w-1/2 py-3 rounded-xl bg-gold-gradient text-aurum-dark font-extrabold text-xs uppercase tracking-wider shadow-gold"
                >
                  {uploadingImages ? 'Processando e Salvando...' : 'Salvar e Publicar Perfume'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
