"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import BarcodeSvg from "@/components/BarcodeSvg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  type Page,
  type Product,
  useEditorStore,
} from "@/lib/editorStore";
import { computeGrid, type LayoutSettings } from "@/lib/labelGrid";

type SearchResult = {
  id: number;
  name?: string;
  display_name?: string;
  barcode?: string;
  default_code?: string;
};

const PRESET_LAYOUTS: { id: string; labelKey: string; values: Partial<LayoutSettings> }[] = [
  {
    id: "a4-4x13",
    labelKey: "layoutPresetA4_4x13",
    values: {
      paperWidthCm: 21,
      paperHeightCm: 29.7,
      marginCm: 1,
      labelWidthCm: 3.8,
      labelHeightCm: 2.12,
      gapXCm: 0,
      gapYCm: 0,
      cellPaddingCm: 0.2,
      offsetXCm: 0,
      offsetYCm: 0,
    },
  },
  {
    id: "a4-3x8",
    labelKey: "layoutPresetA4_3x8",
    values: {
      paperWidthCm: 21,
      paperHeightCm: 29.7,
      marginCm: 1,
      labelWidthCm: 7,
      labelHeightCm: 3.5,
      gapXCm: 0,
      gapYCm: 0,
    },
  },
  {
    id: "a4-2x7",
    labelKey: "layoutPresetA4_2x7",
    values: {
      paperWidthCm: 21,
      paperHeightCm: 29.7,
      marginCm: 1,
      labelWidthCm: 9.9,
      labelHeightCm: 3.8,
      gapXCm: 0,
      gapYCm: 0,
    },
  },
];

const useDebouncedValue = (value: string, delayMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
};

export default function AppPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("App");
  
  useEffect(() => {
    console.log("🟣 AppPage - Locale changed to:", locale);
    console.log("  Translation test - 'undo':", t("undo"));
    console.log("  Translation test - 'redo':", t("redo"));
  }, [locale, t]);
  const layout = useEditorStore((state) => state.layout);
  const pages = useEditorStore((state) => state.pages);
  const pagesToRender = useEditorStore((state) => state.pagesToRender);
  const products = useEditorStore((state) => state.products);
  const selectedCellIds = useEditorStore((state) => state.selectedCellIds);
  const activeProductId = useEditorStore((state) => state.activeProductId);
  const lastSelectedCellId = useEditorStore((state) => state.lastSelectedCellId);
  const setLayout = useEditorStore((state) => state.setLayout);
  const setPagesToRender = useEditorStore((state) => state.setPagesToRender);
  const syncPages = useEditorStore((state) => state.syncPages);
  const addProduct = useEditorStore((state) => state.addProduct);
  const setActiveProductId = useEditorStore((state) => state.setActiveProductId);
  const setSelectedCellIds = useEditorStore((state) => state.setSelectedCellIds);
  const toggleCellSelection = useEditorStore((state) => state.toggleCellSelection);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const clearSelected = useEditorStore((state) => state.clearSelected);
  const clearAll = useEditorStore((state) => state.clearAll);
  const removeProduct = useEditorStore((state) => state.removeProduct);
  const assignToSelected = useEditorStore((state) => state.assignToSelected);
  const fillNextAvailable = useEditorStore((state) => state.fillNextAvailable);
  const fillNextAvailableCount = useEditorStore((state) => state.fillNextAvailableCount);
  const fillAllPages = useEditorStore((state) => state.fillAllPages);
  const clearCell = useEditorStore((state) => state.clearCell);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const [manualName, setManualName] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualSku, setManualSku] = useState("");
  const [manualError, setManualError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"odoo" | "manual">("manual");
  const [previewPage, setPreviewPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dragSelectState, setDragSelectState] = useState<{
    active: boolean;
    pageIndex: number;
    startIndex: number;
    shouldSelect: boolean;
  } | null>(null);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const grid = useMemo(() => computeGrid(layout), [layout]);
  const barcodeHeightPx = useMemo(
    () => (layout.barcodeHeightMm ?? 12) * 3.78,
    [layout.barcodeHeightMm],
  );
  const cellPaddingCm = layout.cellPaddingCm ?? 0;
  const offsetX = layout.offsetXCm ?? 0;
  const offsetY = layout.offsetYCm ?? 0;

  useEffect(() => {
    syncPages(grid.labelsPerPage, pagesToRender);
  }, [grid.labelsPerPage, pagesToRender, syncPages]);

  useEffect(() => {
    setPreviewPage((current) => Math.min(Math.max(1, current), pagesToRender));
  }, [pagesToRender]);

  useEffect(() => {
    if (selectedCellIds.length === 0) {
      setPopoverOpen(false);
    }
  }, [selectedCellIds.length]);

  useEffect(() => {
    const handleMouseUp = () => {
      setDragSelectState(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        const allIds = pages.flatMap((page) => page.cells.map((cell) => cell.id));
        setSelectedCellIds(allIds);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedCellIds.length > 0) {
          event.preventDefault();
          clearSelected();
        }
        return;
      }
      if (event.key === "Escape") {
        clearSelection();
        setDragSelectState(null);
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearSelection, clearSelected, pages, redo, selectedCellIds.length, setSelectedCellIds, undo]);

  const fetchProducts = async (query: string): Promise<SearchResult[]> => {
    const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? t("searchError"));
    }
    return response.json();
  };

  const {
    data: searchResults = [],
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => fetchProducts(debouncedSearch),
    enabled: debouncedSearch.length > 1,
    staleTime: 30_000,
  });

  const activeProduct = products.find((product) => product.id === activeProductId) ?? null;
  const previewPages = showAllPages
    ? pages
    : pages.filter((_, index) => index === Math.max(0, previewPage - 1));

  const addManualProduct = () => {
    setManualError("");
    if (!manualName.trim() || !manualBarcode.trim()) {
      setManualError(t("manualRequired"));
      return;
    }
    if (!/^[\x20-\x7E]+$/.test(manualBarcode.trim())) {
      setManualError(t("manualBarcodeAscii"));
      return;
    }
    const newProduct: Product = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      barcode: manualBarcode.trim(),
      sku: manualSku.trim() || undefined,
      source: "manual",
    };
    addProduct(newProduct);
    setManualName("");
    setManualBarcode("");
    setManualSku("");
  };

  const addOdooProduct = (result: SearchResult) => {
    const displayName = result.display_name ?? result.name ?? t("unnamedProduct");
    const newProduct: Product = {
      id: `odoo-${result.id}`,
      name: displayName,
      barcode: result.barcode ?? "",
      sku: result.default_code ?? undefined,
      source: "odoo",
    };
    addProduct(newProduct);
  };

  const getRangeCellIds = (pageIndex: number, startIndex: number, endIndex: number) => {
    const page = pages[pageIndex];
    if (!page) {
      return [];
    }
    const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
    return page.cells.slice(start, end + 1).map((cell) => cell.id);
  };

  const handleCellMouseDown = (
    event: React.MouseEvent,
    pageIndex: number,
    cellIndex: number,
    cellId: string,
  ) => {
    event.stopPropagation();
    // No hacer nada si es clic derecho
    if (event.button === 2) {
      return;
    }
    if (event.shiftKey && lastSelectedCellId) {
      const page = pages[pageIndex];
      if (!page) {
        toggleCellSelection(cellId);
        return;
      }
      const fromIndex = page.cells.findIndex((cell) => cell.id === lastSelectedCellId);
      if (fromIndex === -1) {
        toggleCellSelection(cellId);
        return;
      }
      const range = getRangeCellIds(pageIndex, fromIndex, cellIndex);
      toggleCellSelection(cellId, range);
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      toggleCellSelection(cellId);
      return;
    }

    const isInitiallySelected = selectedCellIds.includes(cellId);
    if (isInitiallySelected) {
      setSelectedCellIds(selectedCellIds.filter((id) => id !== cellId));
    } else {
      toggleCellSelection(cellId, [cellId]);
    }
    setDragSelectState({ 
      active: true, 
      pageIndex, 
      startIndex: cellIndex,
      shouldSelect: !isInitiallySelected,
    });
  };

  const handleCellMouseEnter = (pageIndex: number, cellIndex: number, cellId: string) => {
    if (!dragSelectState?.active || dragSelectState.pageIndex !== pageIndex) {
      return;
    }
    const range = getRangeCellIds(pageIndex, dragSelectState.startIndex, cellIndex);
    if (dragSelectState.shouldSelect) {
      const newSelected = Array.from(new Set([...selectedCellIds, ...range]));
      setSelectedCellIds(newSelected);
    } else {
      const newSelected = selectedCellIds.filter((id) => !range.includes(id));
      setSelectedCellIds(newSelected);
    }
  };

  const handleModeChange = async (value: string) => {
    if (value === "odoo") {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) {
        router.push(`/${locale}/login`);
        return;
      }
      const payload = (await response.json()) as { authenticated?: boolean };
      if (!payload.authenticated) {
        router.push(`/${locale}/login`);
        return;
      }
    }
    setMode(value as "odoo" | "manual");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="no-print border-b border-slate-200 bg-white px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {t("brand")}
            </p>
            <span className="text-xs text-slate-400">/</span>
            <h1 className="text-sm font-semibold text-slate-900">{t("editorTitle")}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  {t("controls")}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{t("controls")}</DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="max-h-[70vh] px-4 pb-6">
                  <div className="space-y-6">
                    <SidebarContent
                      mode={mode}
                      onModeChange={handleModeChange}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      isFetching={isFetching}
                      isError={isError}
                      error={error}
                      searchResults={searchResults}
                      addOdooProduct={addOdooProduct}
                      manualName={manualName}
                      manualBarcode={manualBarcode}
                      manualSku={manualSku}
                      manualError={manualError}
                      setManualName={setManualName}
                      setManualBarcode={setManualBarcode}
                      setManualSku={setManualSku}
                      addManualProduct={addManualProduct}
                      products={products}
                      activeProductId={activeProductId}
                      setActiveProductId={setActiveProductId}
                      fillNextAvailable={fillNextAvailable}
                      fillNextAvailableCount={fillNextAvailableCount}
                      fillAllPages={fillAllPages}
                      removeProduct={removeProduct}
                      selectedCellIds={selectedCellIds}
                      popoverOpen={popoverOpen}
                      setPopoverOpen={setPopoverOpen}
                      assignToSelected={assignToSelected}
                    />
                    <div className="border-t border-slate-200 pt-4">
                      <LayoutPanel
                        layout={layout}
                        setLayout={setLayout}
                        pagesToRender={pagesToRender}
                        setPagesToRender={setPagesToRender}
                      />
                    </div>
                    <DrawerClose asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        {t("close")}
                      </Button>
                    </DrawerClose>
                  </div>
                </ScrollArea>
              </DrawerContent>
            </Drawer>
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={undo}>
              {t("undo")}
            </Button>
            <Button variant="ghost" size="sm" onClick={redo}>
              {t("redo")}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              {t("clearAll")}
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              {t("print")}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex w-full max-w-none flex-col items-stretch gap-0 px-0 py-0 lg:flex-row">
        <aside className="no-print order-1 hidden w-full lg:block lg:w-96 lg:shrink-0">
          <div className="flex h-full min-h-[calc(100vh-56px)] flex-col space-y-6 border-r border-slate-200 bg-white px-6 py-4">
            <SidebarContent
              mode={mode}
              onModeChange={handleModeChange}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFetching={isFetching}
              isError={isError}
              error={error}
              searchResults={searchResults}
              addOdooProduct={addOdooProduct}
              manualName={manualName}
              manualBarcode={manualBarcode}
              manualSku={manualSku}
              manualError={manualError}
              setManualName={setManualName}
              setManualBarcode={setManualBarcode}
              setManualSku={setManualSku}
              addManualProduct={addManualProduct}
              products={products}
              activeProductId={activeProductId}
              setActiveProductId={setActiveProductId}
              fillNextAvailable={fillNextAvailable}
              fillNextAvailableCount={fillNextAvailableCount}
              fillAllPages={fillAllPages}
              removeProduct={removeProduct}
              selectedCellIds={selectedCellIds}
              popoverOpen={popoverOpen}
              setPopoverOpen={setPopoverOpen}
              assignToSelected={assignToSelected}
            />
          </div>
        </aside>
        <section className="no-print order-2 flex-1 space-y-4 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                {t("preview")}
              </h2>
              <p className="text-xs text-slate-500">
                {t("gridSummary", {
                  columns: grid.columns,
                  rows: grid.rows,
                  labels: grid.labelsPerPage,
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>
                {t("layoutSummary", {
                  width: layout.paperWidthCm,
                  height: layout.paperHeightCm,
                })}
              </span>
              <div className="flex items-center gap-2">
                <span>{t("showAllPages")}</span>
                <Switch checked={showAllPages} onCheckedChange={setShowAllPages} />
              </div>
              {!showAllPages ? (
                <div className="min-w-[140px]">
                  <Select
                    value={String(previewPage)}
                    onValueChange={(value) => setPreviewPage(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("page")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: pagesToRender }).map((_, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          {t("page")} {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{t("hintClick")}</span>
            <Kbd>Shift</Kbd>
            <span>{t("hintRange")}</span>
            <Kbd>Ctrl</Kbd>
            <span>{t("hintToggle")}</span>
            <Kbd>Esc</Kbd>
            <span>{t("hintClear")}</span>
          </div>
          <div className="space-y-6">
            {previewPages.map((page) => {
              const pageIndex = Math.max(0, pages.findIndex((item) => item.id === page.id));
              return (
              <div key={page.id} className="overflow-auto rounded-2xl border border-slate-200 bg-white p-6">
                <div
                  className="relative mx-auto bg-white"
                  style={{
                    width: `${layout.paperWidthCm}cm`,
                    height: `${layout.paperHeightCm}cm`,
                    padding: `${layout.marginCm}cm`,
                  }}
                >
                  <div
                    className="grid select-none"
                    onMouseDown={(event) => {
                      // No limpiar selección con clic derecho
                      if (event.button === 2) {
                        return;
                      }
                      if (event.target === event.currentTarget) {
                        clearSelection();
                      }
                    }}
                    style={{
                      columnGap: `${layout.gapXCm ?? 0}cm`,
                      rowGap: `${layout.gapYCm ?? 0}cm`,
                      gridTemplateColumns: `repeat(${grid.columns}, ${layout.labelWidthCm}cm)`,
                      gridAutoRows: `${layout.labelHeightCm}cm`,
                      transform: `translate(${offsetX}cm, ${offsetY}cm)`,
                    }}
                  >
                    {page.cells.map((cell, cellIndex) => {
                      const product = products.find((item) => item.id === cell.productId) ?? null;
                      const isSelected = selectedCellIds.includes(cell.id);
                      return (
                        <LabelCell
                          key={cell.id}
                          cellId={cell.id}
                          product={product}
                          isSelected={isSelected}
                          activeProductId={activeProductId}
                          selectedCount={selectedCellIds.length}
                          onMouseDown={(event) =>
                            handleCellMouseDown(event, pageIndex, cellIndex, cell.id)
                          }
                          onMouseEnter={() => handleCellMouseEnter(pageIndex, cellIndex, cell.id)}
                          onClear={() => clearCell(cell.id)}
                          onClearSelected={() => clearSelected()}
                          onAssignSelected={() =>
                            activeProductId && assignToSelected(activeProductId)
                          }
                          onDuplicate={() =>
                            product?.id ? fillNextAvailable(product.id) : undefined
                          }
                          barcodeHeightPx={barcodeHeightPx}
                          fontSizePt={layout.fontSizePt ?? 7}
                          paddingCm={cellPaddingCm}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </section>
        <aside className="no-print order-3 hidden w-full lg:block lg:w-80 lg:shrink-0">
          <div className="flex h-full min-h-[calc(100vh-56px)] flex-col space-y-6 border-l border-slate-200 bg-white px-6 py-4">
            <LayoutPanel
              layout={layout}
              setLayout={setLayout}
              pagesToRender={pagesToRender}
              setPagesToRender={setPagesToRender}
            />
          </div>
        </aside>
      </main>
      <PrintArea
        layout={layout}
        grid={grid}
        pages={pages}
        products={products}
        barcodeHeightPx={barcodeHeightPx}
        paddingCm={cellPaddingCm}
      />
      <div className="no-print mx-auto max-w-[1600px] px-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span>{t("selectedLabels")}</span>
            <Badge variant="secondary">{selectedCellIds.length}</Badge>
            <span>{t("activeProduct")}</span>
            <span className="font-semibold text-slate-800">
              {activeProduct ? activeProduct.name : t("none")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span>{t("shortcutsTitle")}</span>
            <Kbd>Shift</Kbd>
            <span>{t("shortcutRange")}</span>
            <Kbd>Ctrl</Kbd>
            <span>{t("shortcutToggle")}</span>
            <Kbd>Esc</Kbd>
            <span>{t("shortcutClear")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  active,
  onSelect,
  onFillNext,
  onFillMany,
  onFillAll,
  onRemove,
}: {
  product: Product;
  active: boolean;
  onSelect: () => void;
  onFillNext: () => void;
  onFillMany: (count: number) => void;
  onFillAll: () => void;
  onRemove: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const t = useTranslations("App");

  return (
    <div
      className={`relative rounded-lg border px-3 py-2 text-xs select-none ${
        active ? "border-slate-400 bg-slate-50" : "border-slate-200"
      }`}
      onClick={onSelect}
      onKeyDown={(event) => event.key === "Enter" && onSelect()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 text-slate-400 hover:text-rose-600"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <p className="font-semibold text-slate-800">{product.name}</p>
      <p className="text-slate-500 text-[10px]">
        {t("barcodeLabel")} {product.barcode || t("notAvailable")}
      </p>
      <div className="mt-2 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7"
            onClick={(event) => {
              event.stopPropagation();
              onFillNext();
            }}
          >
            {t("fillNext")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7"
            onClick={(event) => {
              event.stopPropagation();
              onFillAll();
            }}
          >
            {t("fillAllPages")}
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            className="h-7 w-14 text-[10px]"
            type="number"
            min={1}
            value={quantity}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setQuantity(Number(event.target.value) || 1)}
          />
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7"
            onClick={(event) => {
              event.stopPropagation();
              const safeQty = Number.isFinite(quantity) ? Math.max(1, quantity) : 1;
              onFillMany(safeQty);
            }}
          >
            {t("fillCount", { count: quantity })}
          </Button>
        </div>
      </div>
    </div>
  );
}

type SidebarContentProps = {
  mode: "odoo" | "manual";
  onModeChange: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  searchResults: SearchResult[];
  addOdooProduct: (result: SearchResult) => void;
  manualName: string;
  manualBarcode: string;
  manualSku: string;
  manualError: string;
  setManualName: (value: string) => void;
  setManualBarcode: (value: string) => void;
  setManualSku: (value: string) => void;
  addManualProduct: () => void;
  products: Product[];
  activeProductId: string | null;
  setActiveProductId: (value: string | null) => void;
  fillNextAvailable: (productId: string) => void;
  fillNextAvailableCount: (productId: string, count: number) => void;
  fillAllPages: (productId: string) => void;
  removeProduct: (productId: string) => void;
  selectedCellIds: string[];
  popoverOpen: boolean;
  setPopoverOpen: (value: boolean) => void;
  assignToSelected: (productId: string) => void;
};

function SidebarContent({
  mode,
  onModeChange,
  searchQuery,
  setSearchQuery,
  isFetching,
  isError,
  error,
  searchResults,
  addOdooProduct,
  manualName,
  manualBarcode,
  manualSku,
  manualError,
  setManualName,
  setManualBarcode,
  setManualSku,
  addManualProduct,
  products,
  activeProductId,
  setActiveProductId,
  fillNextAvailable,
  fillNextAvailableCount,
  fillAllPages,
  removeProduct,
  selectedCellIds,
  popoverOpen,
  setPopoverOpen,
  assignToSelected,
}: SidebarContentProps) {
  const t = useTranslations("App");

  return (
    <>
      <Tabs value={mode} onValueChange={onModeChange}>
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("mode")}
          </h2>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="odoo">{t("modeOdoo")}</TabsTrigger>
            <TabsTrigger value="manual">{t("modeManual")}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="odoo" className="mt-4 space-y-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("searchTitle")}
            </div>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("results")} <Badge variant="secondary">{searchResults.length}</Badge>
              </span>
              {isFetching ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  {t("searching")}
                </span>
              ) : null}
            </div>
            <ScrollArea className="h-56 rounded-md border">
              <div className="space-y-2 p-2">
                {searchQuery.trim().length <= 1 ? (
                  <p className="text-xs text-muted-foreground">{t("searchHintMinChars")}</p>
                ) : isError ? (
                  <p className="text-xs text-destructive">
                    {(error as Error)?.message ?? t("searchError")}
                  </p>
                ) : searchResults.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("searchEmpty")}</p>
                ) : (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-2 hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-xs font-semibold">
                          {result.display_name ?? result.name ?? t("unnamedProduct")}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {result.barcode || t("noBarcode")}
                        </p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => addOdooProduct(result)}>
                        {t("addProduct")}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value="manual" className="mt-4 space-y-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("manualTitle")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("manualHelp")}
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="manual-name">{t("manualName")}</Label>
              <Input
                id="manual-name"
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
                placeholder={t("manualNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-barcode">{t("manualBarcode")}</Label>
              <Input
                id="manual-barcode"
                value={manualBarcode}
                onChange={(event) => setManualBarcode(event.target.value)}
                placeholder={t("manualBarcodePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-sku">{t("manualSkuOptional")}</Label>
              <Input
                id="manual-sku"
                value={manualSku}
                onChange={(event) => setManualSku(event.target.value)}
                placeholder={t("manualSkuPlaceholder")}
              />
            </div>
            <Button onClick={addManualProduct}>{t("addManual")}</Button>
            {manualError ? <p className="text-xs text-destructive">{manualError}</p> : null}
          </div>
        </TabsContent>
      </Tabs>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {t("products")}
        </h3>
        <div className="space-y-2">
          {products.length === 0 ? (
            <p className="text-xs text-slate-500">{t("productsEmpty")}</p>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                active={product.id === activeProductId}
                onSelect={() => setActiveProductId(product.id)}
                onFillNext={() => fillNextAvailable(product.id)}
                onFillMany={(count) => fillNextAvailableCount(product.id, count)}
                onFillAll={() => fillAllPages(product.id)}
                onRemove={() => removeProduct(product.id)}
              />
            ))
          )}
        </div>
      </div>
      {selectedCellIds.length > 0 && products.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {t("assignToSelected")}
            </h3>
            <Badge variant="secondary">{selectedCellIds.length}</Badge>
          </div>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm" className="w-full">
                {t("assignSelectProduct")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {t("assignToCount", { count: selectedCellIds.length })}
                </p>
                <ScrollArea className="h-48">
                  <div className="space-y-1">
                    {products.map((product) => (
                      <Button
                        key={product.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 px-2 hover:bg-slate-100"
                        onClick={() => {
                          assignToSelected(product.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <div className="flex flex-col items-start w-full">
                          <span className="text-xs font-semibold text-slate-800 truncate w-full">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {product.barcode || t("noBarcode")}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ) : null}
    </>
  );
}

type LayoutPanelProps = {
  layout: LayoutSettings;
  setLayout: (layout: LayoutSettings) => void;
  pagesToRender: number;
  setPagesToRender: (count: number) => void;
};

function LayoutPanel({ layout, setLayout, pagesToRender, setPagesToRender }: LayoutPanelProps) {
  const t = useTranslations("App");

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {t("layoutTitle")}
      </h3>
      <div className="space-y-2 text-xs">
        <Label>{t("layoutPresets")}</Label>
        <Select
          onValueChange={(value) => {
            const preset = PRESET_LAYOUTS.find((item) => item.id === value);
            if (preset) {
              setLayout({ ...layout, ...preset.values });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("layoutPresetPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {PRESET_LAYOUTS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {t(preset.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-2">
          <Label htmlFor="paper-width">{t("layoutPaperWidth")}</Label>
          <Input
            id="paper-width"
            className="h-8"
            type="number"
            step="0.1"
            value={layout.paperWidthCm}
            onChange={(event) => setLayout({ ...layout, paperWidthCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paper-height">{t("layoutPaperHeight")}</Label>
          <Input
            id="paper-height"
            className="h-8"
            type="number"
            step="0.1"
            value={layout.paperHeightCm}
            onChange={(event) => setLayout({ ...layout, paperHeightCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="margin">{t("layoutMargin")}</Label>
          <Input
            id="margin"
            className="h-8"
            type="number"
            step="0.1"
            value={layout.marginCm}
            onChange={(event) => setLayout({ ...layout, marginCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="label-width">{t("layoutLabelWidth")}</Label>
          <Input
            id="label-width"
            className="h-8"
            type="number"
            step="0.1"
            value={layout.labelWidthCm}
            onChange={(event) => setLayout({ ...layout, labelWidthCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="label-height">{t("layoutLabelHeight")}</Label>
          <Input
            id="label-height"
            className="h-8"
            type="number"
            step="0.1"
            value={layout.labelHeightCm}
            onChange={(event) => setLayout({ ...layout, labelHeightCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gap-x">{t("layoutGapX")}</Label>
          <Input
            id="gap-x"
            className="h-8"
            type="number"
            step="0.1"
            value={layout.gapXCm ?? 0}
            onChange={(event) => setLayout({ ...layout, gapXCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gap-y">{t("layoutGapY")}</Label>
          <Input
            id="gap-y"
            className="h-8"
            type="number"
            step="0.1"
            value={layout.gapYCm ?? 0}
            onChange={(event) => setLayout({ ...layout, gapYCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode-height">{t("layoutBarcodeHeight")}</Label>
          <Input
            id="barcode-height"
            className="h-8"
            type="number"
            step="1"
            value={layout.barcodeHeightMm ?? 12}
            onChange={(event) =>
              setLayout({ ...layout, barcodeHeightMm: Number(event.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="font-size">{t("layoutFontSize")}</Label>
          <Input
            id="font-size"
            className="h-8"
            type="number"
            step="0.5"
            value={layout.fontSizePt ?? 7}
            onChange={(event) => setLayout({ ...layout, fontSizePt: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cell-padding">{t("layoutPadding")}</Label>
          <Input
            id="cell-padding"
            className="h-8"
            type="number"
            step="0.05"
            value={layout.cellPaddingCm ?? 0}
            onChange={(event) =>
              setLayout({ ...layout, cellPaddingCm: Number(event.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offset-x">{t("layoutOffsetX")}</Label>
          <Input
            id="offset-x"
            className="h-8"
            type="number"
            step="0.05"
            value={layout.offsetXCm ?? 0}
            onChange={(event) => setLayout({ ...layout, offsetXCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offset-y">{t("layoutOffsetY")}</Label>
          <Input
            id="offset-y"
            className="h-8"
            type="number"
            step="0.05"
            value={layout.offsetYCm ?? 0}
            onChange={(event) => setLayout({ ...layout, offsetYCm: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pages">{t("pagesToRender")}</Label>
          <Input
            id="pages"
            className="h-8"
            type="number"
            min={1}
            value={pagesToRender}
            onChange={(event) => setPagesToRender(Number(event.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

function LabelCell({
  cellId,
  product,
  isSelected,
  activeProductId,
  selectedCount,
  onMouseDown,
  onMouseEnter,
  onClear,
  onClearSelected,
  onAssignSelected,
  onDuplicate,
  barcodeHeightPx,
  fontSizePt,
  paddingCm,
}: {
  cellId: string;
  product: Product | null;
  isSelected: boolean;
  activeProductId: string | null;
  selectedCount: number;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onClear: () => void;
  onClearSelected: () => void;
  onAssignSelected: () => void;
  onDuplicate: () => void;
  barcodeHeightPx: number;
  fontSizePt: number;
  paddingCm: number;
}) {
  const t = useTranslations("App");

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
      className={`group flex h-full flex-col items-center justify-center rounded-sm border p-1 text-center select-none ${
        isSelected ? "border-slate-500 bg-slate-50" : "border-slate-200"
      }`}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          style={{ padding: `${paddingCm}cm`, boxSizing: "border-box" }}
        >
          {product ? (
            <div
              className="flex w-full flex-col items-center"
            >
              <BarcodeSvg value={product.barcode} height={barcodeHeightPx} />
              <p
                className="mt-1 w-full truncate text-slate-700"
                style={{ fontSize: `${fontSizePt}pt` }}
              >
                {product.name}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 hidden h-auto px-2 py-0 text-[9px] text-slate-400 group-hover:inline"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  onClear();
                }}
              >
                {t("clear")}
              </Button>
            </div>
          ) : (
            <span className="text-[9px] text-slate-300">{t("emptyCell")}</span>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onClear}>{t("clearCell")}</ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate} disabled={!product}>
          {t("duplicateNextEmpty")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onClearSelected} disabled={selectedCount === 0}>
          {t("clearSelection")}
        </ContextMenuItem>
        <ContextMenuItem onClick={onAssignSelected} disabled={!activeProductId || selectedCount === 0}>
          {t("fillSelectionWithActive")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function PrintArea({
  layout,
  grid,
  pages,
  products,
  barcodeHeightPx,
  paddingCm,
}: {
  layout: LayoutSettings;
  grid: ReturnType<typeof computeGrid>;
  pages: Page[];
  products: Product[];
  barcodeHeightPx: number;
  paddingCm: number;
}) {
  return (
    <div className="print-only">
      {pages.map((page) => (
        <div
          key={page.id}
          className="print-page"
          style={{
            width: `${layout.paperWidthCm}cm`,
            height: `${layout.paperHeightCm}cm`,
            padding: `${layout.marginCm}cm`,
            boxSizing: "border-box",
          }}
        >
          <div
            className="grid"
            style={{
              columnGap: `${layout.gapXCm ?? 0}cm`,
              rowGap: `${layout.gapYCm ?? 0}cm`,
              gridTemplateColumns: `repeat(${grid.columns}, ${layout.labelWidthCm}cm)`,
              gridAutoRows: `${layout.labelHeightCm}cm`,
              transform: `translate(${layout.offsetXCm ?? 0}cm, ${layout.offsetYCm ?? 0}cm)`,
            }}
          >
            {page.cells.map((cell) => {
              const product = products.find((item) => item.id === cell.productId) ?? null;
              return (
                <div
                  key={cell.id}
                  className="flex h-full flex-col items-center justify-center text-center"
                  style={{ padding: `${paddingCm}cm`, boxSizing: "border-box" }}
                >
                  {product ? (
                    <>
                      <BarcodeSvg value={product.barcode} height={barcodeHeightPx} />
                      <p
                        className="mt-1 w-full truncate text-slate-700"
                        style={{ fontSize: `${layout.fontSizePt ?? 7}pt` }}
                      >
                        {product.name}
                      </p>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
