"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Music,
  Sparkles,
  Edit3,
  Trash2,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
  Tag,
  Drum,
  AlertTriangle,
  AlignLeft,
  AlignCenter,
  Filter,
  Loader2,
} from "lucide-react";
import { CATEGORIES, CategoryInfo } from "@/lib/categories";
import type { Ponto } from "@/lib/db";

export default function HomePage() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileCategoriesModal, setShowMobileCategoriesModal] = useState(false);

  // Expanded Reader Modal (when clicking a lyric)
  const [expandedPonto, setExpandedPonto] = useState<Ponto | null>(null);
  const [readerFontSize, setReaderFontSize] = useState<number>(22); // px
  const [readerCentered, setReaderCentered] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Create / Edit Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPonto, setEditingPonto] = useState<Ponto | null>(null);
  const [formNomePonto, setFormNomePonto] = useState("");
  const [formNomeGuia, setFormNomeGuia] = useState("");
  const [formCategoria, setFormCategoria] = useState(CATEGORIES[0].name);
  const [formTipoToque, setFormTipoToque] = useState("");
  const [formLetra, setFormLetra] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deletingPonto, setDeletingPonto] = useState<Ponto | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchPontos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/pontos", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar pontos");
      }
      setPontos(data.pontos || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro de conexão com o banco de dados";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPontos();
  }, [fetchPontos]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (expandedPonto || isFormOpen || deletingPonto || showMobileCategoriesModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expandedPonto, isFormOpen, deletingPonto, showMobileCategoriesModal]);

  // Filtered list of pontos for fast client-side search & category switching
  const filteredPontos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pontos.filter((p) => {
      const matchesCategory =
        selectedCategory === "Todos" || p.categoria === selectedCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      return (
        p.nome_ponto.toLowerCase().includes(q) ||
        p.nome_guia_orixa.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.letra.toLowerCase().includes(q) ||
        (p.tipo_toque && p.tipo_toque.toLowerCase().includes(q))
      );
    });
  }, [pontos, selectedCategory, searchQuery]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: pontos.length };
    for (const c of CATEGORIES) {
      counts[c.name] = 0;
    }
    for (const p of pontos) {
      counts[p.categoria] = (counts[p.categoria] || 0) + 1;
    }
    return counts;
  }, [pontos]);

  const currentCategoryInfo: CategoryInfo | undefined = useMemo(
    () => CATEGORIES.find((c) => c.name === selectedCategory),
    [selectedCategory]
  );

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPonto(null);
    setFormNomePonto("");
    setFormNomeGuia("");
    setFormCategoria(
      selectedCategory !== "Todos" ? selectedCategory : CATEGORIES[0].name
    );
    setFormTipoToque("");
    setFormLetra("");
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ponto: Ponto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPonto(ponto);
    setFormNomePonto(ponto.nome_ponto);
    setFormNomeGuia(ponto.nome_guia_orixa);
    setFormCategoria(ponto.categoria);
    setFormTipoToque(ponto.tipo_toque || "");
    setFormLetra(ponto.letra);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Submit Create or Update
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomePonto.trim() || !formNomeGuia.trim() || !formCategoria || !formLetra.trim()) {
      setFormError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const url = editingPonto ? `/api/pontos/${editingPonto.id}` : "/api/pontos";
      const method = editingPonto ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_ponto: formNomePonto,
          nome_guia_orixa: formNomeGuia,
          categoria: formCategoria,
          tipo_toque: formTipoToque,
          letra: formLetra,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar o ponto");
      }

      const savedPonto: Ponto = data.ponto;

      if (editingPonto) {
        setPontos((prev) =>
          prev.map((item) => (item.id === savedPonto.id ? savedPonto : item))
        );
        if (expandedPonto?.id === savedPonto.id) {
          setExpandedPonto(savedPonto);
        }
      } else {
        setPontos((prev) => [savedPonto, ...prev]);
      }

      setIsFormOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingPonto) return;
    try {
      setDeletingLoading(true);
      const res = await fetch(`/api/pontos/${deletingPonto.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir ponto");
      }

      setPontos((prev) => prev.filter((p) => p.id !== deletingPonto.id));
      if (expandedPonto?.id === deletingPonto.id) {
        setExpandedPonto(null);
      }
      setDeletingPonto(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir ponto");
    } finally {
      setDeletingLoading(false);
    }
  };

  // Copy lyrics helper
  const handleCopyLyrics = async (ponto: Ponto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const textToCopy = `${ponto.nome_ponto}\n(${ponto.nome_guia_orixa} - ${ponto.categoria})\n\n${ponto.letra}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(ponto.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  // Navigate inside expanded reader
  const currentExpandedIndex = useMemo(() => {
    if (!expandedPonto) return -1;
    return filteredPontos.findIndex((p) => p.id === expandedPonto.id);
  }, [expandedPonto, filteredPontos]);

  const handlePrevPonto = () => {
    if (currentExpandedIndex > 0) {
      setExpandedPonto(filteredPontos[currentExpandedIndex - 1]);
    }
  };

  const handleNextPonto = () => {
    if (
      currentExpandedIndex >= 0 &&
      currentExpandedIndex < filteredPontos.length - 1
    ) {
      setExpandedPonto(filteredPontos[currentExpandedIndex + 1]);
    }
  };

  const orixasList = useMemo(
    () => CATEGORIES.filter((c) => c.group === "Orixás"),
    []
  );
  const guiasList = useMemo(
    () => CATEGORIES.filter((c) => c.group === "Guias e Entidades"),
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-red-950/60 bg-[#09090b]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Brand Title + Action on Mobile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-950/50 border border-red-500/30">
                <Drum className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Pontos de Umbanda
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-950/80 text-red-400 border border-red-800/50">
                    {pontos.length} {pontos.length === 1 ? "ponto" : "pontos"}
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Acervo de Pontos Cantados • Orixás e Guias
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenCreate}
              className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-950/60 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar</span>
            </button>
          </div>

          {/* Search Input & Desktop CTA */}
          <div className="flex items-center gap-2.5 flex-1 max-w-2xl md:justify-end">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome do ponto, guia, orixá ou trecho da letra..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#131318] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white rounded-lg"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowMobileCategoriesModal(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#131318] border border-zinc-800 hover:border-red-700 text-zinc-200 text-sm font-medium transition shrink-0"
              title="Filtrar por Categoria"
            >
              <Filter className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Categorias</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-950/60 transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Ponto</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Category Pills */}
        <div className="lg:hidden border-t border-zinc-900 bg-[#0d0d11] px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory("Todos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              selectedCategory === "Todos"
                ? "bg-red-600 text-white shadow-sm shadow-red-950"
                : "bg-[#16161d] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
            }`}
          >
            <span>Todos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategory === "Todos"
                  ? "bg-red-800 text-white"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {categoryCounts["Todos"] || 0}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.name;
            const count = categoryCounts[cat.name] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                  active
                    ? "bg-red-600 text-white shadow-sm shadow-red-950"
                    : "bg-[#16161d] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active
                        ? "bg-red-800 text-white"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl w-full mx-auto flex-1 flex gap-6 px-4 sm:px-6 py-6">
        {/* Desktop Sidebar Categories */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-[#111116] border border-zinc-800/90 rounded-2xl p-3.5 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div>
              <button
                onClick={() => setSelectedCategory("Todos")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  selectedCategory === "Todos"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/60"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Todas as Categorias
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === "Todos"
                      ? "bg-red-800 text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {categoryCounts["Todos"] || 0}
                </span>
              </button>
            </div>

            {/* Orixás Group */}
            <div>
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-red-500">
                Orixás
              </div>
              <div className="space-y-1">
                {orixasList.map((cat) => {
                  const active = selectedCategory === cat.name;
                  const count = categoryCounts[cat.name] || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                        active
                          ? "bg-red-600/90 text-white font-semibold shadow-sm"
                          : "text-zinc-400 hover:bg-zinc-900/90 hover:text-zinc-100"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          active
                            ? "bg-red-800 text-white"
                            : count > 0
                            ? "bg-red-950/70 text-red-400 border border-red-900/40"
                            : "bg-zinc-900 text-zinc-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guias e Entidades Group */}
            <div>
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-red-500">
                Guias e Linhas
              </div>
              <div className="space-y-1">
                {guiasList.map((cat) => {
                  const active = selectedCategory === cat.name;
                  const count = categoryCounts[cat.name] || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                        active
                          ? "bg-red-600/90 text-white font-semibold shadow-sm"
                          : "text-zinc-400 hover:bg-zinc-900/90 hover:text-zinc-100"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          active
                            ? "bg-red-800 text-white"
                            : count > 0
                            ? "bg-red-950/70 text-red-400 border border-red-900/40"
                            : "bg-zinc-900 text-zinc-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Active Category Banner */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#14141b] via-[#181115] to-[#14141b] border border-red-950/60 rounded-2xl p-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {selectedCategory === "Todos"
                    ? "Todos os Pontos Cadastrados"
                    : selectedCategory}
                </h2>
                {currentCategoryInfo && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/50">
                    {currentCategoryInfo.saudacao}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Clique sobre a letra de qualquer ponto para expandir em tela cheia.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
                {filteredPontos.length}{" "}
                {filteredPontos.length === 1 ? "resultado" : "resultados"}
              </span>
              {(selectedCategory !== "Todos" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory("Todos");
                    setSearchQuery("");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition cursor-pointer"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <p className="text-sm">Carregando pontos de Umbanda...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/60 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-red-200 font-medium">{error}</p>
              <button
                onClick={fetchPontos}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPontos.length === 0 && (
            <div className="py-16 px-4 rounded-2xl bg-[#111116] border border-zinc-800/80 text-center max-w-lg mx-auto my-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/40 flex items-center justify-center mx-auto mb-3">
                <Music className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-white">
                Nenhum ponto encontrado
              </h3>
              <p className="text-sm text-zinc-400 mt-1 mb-5">
                {searchQuery
                  ? `Não encontramos pontos para "${searchQuery}" nesta categoria.`
                  : selectedCategory !== "Todos"
                  ? `Ainda não há pontos cadastrados na categoria ${selectedCategory}.`
                  : "Comece cadastrando seu primeiro ponto cantado de Umbanda."}
              </p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-950/50 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Ponto</span>
              </button>
            </div>
          )}

          {/* Grid of Pontos */}
          {!loading && !error && filteredPontos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPontos.map((ponto) => (
                <article
                  key={ponto.id}
                  onClick={() => setExpandedPonto(ponto)}
                  className="group relative bg-[#121217] hover:bg-[#16161d] border border-zinc-800/90 hover:border-red-600/70 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-lg hover:shadow-red-950/30 cursor-pointer"
                >
                  <div>
                    {/* Top Meta Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600/15 text-red-400 border border-red-500/30">
                        <Tag className="w-3 h-3" />
                        {ponto.categoria}
                      </span>

                      {ponto.tipo_toque && (
                        <span className="text-[11px] font-medium text-zinc-400 bg-zinc-900 px-2.5 py-0.5 rounded-md border border-zinc-800">
                          Toque: {ponto.tipo_toque}
                        </span>
                      )}
                    </div>

                    {/* Ponto Title & Guia/Orixá Name */}
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                      {ponto.nome_ponto}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mt-1 mb-3.5">
                      <User className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{ponto.nome_guia_orixa}</span>
                    </div>

                    {/* Lyric Preview Box (Clicking expands) */}
                    <div className="relative rounded-xl bg-[#0b0b0e] border border-zinc-800/80 group-hover:border-red-900/60 p-3.5 mb-4 overflow-hidden">
                      <p className="text-sm text-zinc-300 whitespace-pre-line line-clamp-4 leading-relaxed font-normal">
                        {ponto.letra}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-red-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Toque para expandir a letra
                        </span>
                        <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPonto(ponto);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-red-400 transition cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Modo Leitura</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLyrics(ponto, e)}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition cursor-pointer"
                        title="Copiar letra"
                      >
                        {copiedId === ponto.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(ponto, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition cursor-pointer"
                        title="Alterar ponto"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-red-400" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPonto(ponto);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 text-xs font-medium transition cursor-pointer"
                        title="Excluir ponto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          EXPANDED FULLSCREEN LYRICS READER MODAL
          ("Quando eu clicar em uma letra de um ponto, essa deve se expandir na tela, facilitando a leitura")
         ===================================================================== */}
      {expandedPonto && (
        <div
          className="fixed inset-0 z-50 bg-[#070709]/98 backdrop-blur-lg flex flex-col animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          {/* Reader Top Bar */}
          <div className="border-b border-red-950/70 bg-[#0d0d12] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white shrink-0">
                {expandedPonto.categoria}
              </span>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-white truncate">
                  {expandedPonto.nome_ponto}
                </h2>
                <p className="text-xs sm:text-sm text-red-400 font-medium truncate">
                  Guia / Orixá: {expandedPonto.nome_guia_orixa}
                  {expandedPonto.tipo_toque ? ` • Toque: ${expandedPonto.tipo_toque}` : ""}
                </p>
              </div>
            </div>

            {/* Reader Controls (Font Size, Alignment, Edit, Close) */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center bg-[#16161f] border border-zinc-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setReaderFontSize((s) => Math.max(16, s - 2))}
                  className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                  title="Diminuir fonte"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-bold text-zinc-300 select-none">
                  {readerFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setReaderFontSize((s) => Math.min(42, s + 2))}
                  className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                  title="Aumentar fonte"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setReaderCentered((c) => !c)}
                className="p-2.5 rounded-xl bg-[#16161f] border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                title={
                  readerCentered ? "Alinhar à esquerda" : "Centralizar letra"
                }
              >
                {readerCentered ? (
                  <AlignCenter className="w-4 h-4 text-red-500" />
                ) : (
                  <AlignLeft className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => handleCopyLyrics(expandedPonto, e)}
                className="p-2.5 rounded-xl bg-[#16161f] border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                title="Copiar letra"
              >
                {copiedId === expandedPonto.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(expandedPonto)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16161f] hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-red-500" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => setExpandedPonto(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-950/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Fechar</span>
              </button>
            </div>
          </div>

          {/* Expanded Lyrics Scrollable Body */}
          <div
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12"
            onClick={(e) => {
              if (e.target === e.currentTarget) setExpandedPonto(null);
            }}
          >
            <div
              className={`max-w-3xl mx-auto bg-[#101015] border border-red-950/60 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl ${
                readerCentered ? "text-center" : "text-left"
              }`}
            >
              <div className="mb-6 pb-6 border-b border-zinc-800/80">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/50 text-red-300 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>{expandedPonto.categoria}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {expandedPonto.nome_ponto}
                </h1>
                <p className="text-base sm:text-lg text-red-400 font-semibold mt-1.5">
                  {expandedPonto.nome_guia_orixa}
                </p>
              </div>

              <div
                style={{ fontSize: `${readerFontSize}px` }}
                className="text-zinc-100 whitespace-pre-line leading-relaxed font-medium tracking-wide select-text"
              >
                {expandedPonto.letra}
              </div>
            </div>
          </div>

          {/* Reader Bottom Bar (Navigation between Pontos + Mobile Edit/Delete) */}
          <div className="border-t border-zinc-900 bg-[#0d0d12] px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevPonto}
              disabled={currentExpandedIndex <= 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16161f] hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none border border-zinc-800 text-xs sm:text-sm font-medium text-zinc-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-red-500" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(expandedPonto)}
                className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200"
              >
                <Edit3 className="w-3.5 h-3.5 text-red-500" />
                <span>Editar</span>
              </button>
              <span className="text-xs text-zinc-500 hidden sm:inline">
                Ponto {currentExpandedIndex + 1} de {filteredPontos.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextPonto}
              disabled={
                currentExpandedIndex < 0 ||
                currentExpandedIndex >= filteredPontos.length - 1
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16161f] hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none border border-zinc-800 text-xs sm:text-sm font-medium text-zinc-200 transition cursor-pointer"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          CREATE / EDIT PONTO MODAL
         ===================================================================== */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#121217] border border-red-900/60 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 to-[#121217] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  {editingPonto ? (
                    <Edit3 className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">
                  {editingPonto ? "Alterar Ponto de Umbanda" : "Cadastrar Novo Ponto"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-700 text-red-200 text-xs sm:text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Nome do Ponto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNomePonto}
                    onChange={(e) => setFormNomePonto(e.target.value)}
                    placeholder="Ex: Cavaleiro na Porta"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090c] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm text-white placeholder-zinc-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Nome do Guia ou Orixá *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNomeGuia}
                    onChange={(e) => setFormNomeGuia(e.target.value)}
                    placeholder="Ex: Ogum Beira-Mar / Seu Tranca Ruas"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090c] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm text-white placeholder-zinc-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Categoria (Orixá / Linha) *
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090c] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm text-white outline-none"
                  >
                    <optgroup label="Orixás">
                      {orixasList.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Guias e Entidades">
                      {guiasList.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Toque / Ritmo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formTipoToque}
                    onChange={(e) => setFormTipoToque(e.target.value)}
                    placeholder="Ex: Ijexá, Congo, Barra Vento..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090c] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm text-white placeholder-zinc-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Letra do Ponto *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formLetra}
                  onChange={(e) => setFormLetra(e.target.value)}
                  placeholder="Digite ou cole aqui a letra completa do ponto..."
                  className="w-full px-3.5 py-3 rounded-xl bg-[#09090c] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm text-white placeholder-zinc-500 outline-none leading-relaxed resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-red-950/60 transition cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {editingPonto ? "Salvar Alterações" : "Cadastrar Ponto"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MOBILE ALL CATEGORIES DRAWER MODAL
         ===================================================================== */}
      {showMobileCategoriesModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#121217] border-t sm:border border-red-900/50 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-500" />
                Selecionar Categoria
              </h3>
              <button
                onClick={() => setShowMobileCategoriesModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-5">
              <button
                onClick={() => {
                  setSelectedCategory("Todos");
                  setShowMobileCategoriesModal(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${
                  selectedCategory === "Todos"
                    ? "bg-red-600 text-white"
                    : "bg-zinc-900 text-zinc-200 border border-zinc-800"
                }`}
              >
                <span>Todas as Categorias</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/30">
                  {categoryCounts["Todos"] || 0}
                </span>
              </button>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2 px-1">
                  Orixás
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {orixasList.map((cat) => {
                    const active = selectedCategory === cat.name;
                    const count = categoryCounts[cat.name] || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setShowMobileCategoriesModal(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          active
                            ? "bg-red-600 text-white"
                            : "bg-[#181820] text-zinc-300 border border-zinc-800/80"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[11px] opacity-80">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2 px-1">
                  Guias e Entidades
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {guiasList.map((cat) => {
                    const active = selectedCategory === cat.name;
                    const count = categoryCounts[cat.name] || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setShowMobileCategoriesModal(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          active
                            ? "bg-red-600 text-white"
                            : "bg-[#181820] text-zinc-300 border border-zinc-800/80"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[11px] opacity-80">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION MODAL
         ===================================================================== */}
      {deletingPonto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#121217] border border-red-900/70 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Excluir Ponto Cantado?
                </h3>
                <p className="text-xs text-zinc-400">
                  Esta ação removerá o ponto permanentemente.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09090c] border border-zinc-800">
              <p className="text-sm font-bold text-white">
                {deletingPonto.nome_ponto}
              </p>
              <p className="text-xs text-red-400 mt-0.5">
                {deletingPonto.nome_guia_orixa} • {deletingPonto.categoria}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPonto(null)}
                disabled={deletingLoading}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-950/60 transition cursor-pointer"
              >
                {deletingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
