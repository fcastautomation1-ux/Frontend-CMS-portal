"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  ChevronRight,
  ArrowLeft,
  FolderPlus,
  Upload,
  Download,
  Share2,
  Grid3X3,
  List,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/ui/search-bar";
import { toast } from "@/components/ui/toast";
import { cn, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store";

interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
  mimeType: string;
  size: number | null;
  modifiedDate: string;
  url: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes("folder")) return <FolderOpen className="h-5 w-5 text-amber-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (mimeType.includes("document") || mimeType.includes("word")) return <FileText className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes("image")) return <FileImage className="h-5 w-5 text-purple-500" />;
  return <File className="h-5 w-5 text-gray-400" />;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DrivePage() {
  const _user = useAppStore((s) => s.user);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([{ id: "root", name: "My Drive" }]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]?.id || "root";

  // Note: Drive operations will go through API routes that use Google Drive API
  // For now, showing the UI structure with placeholder data loading from Supabase
  useEffect(() => {
    setLoading(true);
    // In production, this calls /api/drive?folderId=xxx
    // For demo, showing empty state
    setTimeout(() => {
      setItems([]);
      setLoading(false);
    }, 500);
  }, [currentFolderId]);

  const navigateToFolder = (folderId: string, folderName: string) => {
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const goBack = () => {
    if (breadcrumbs.length > 1) setBreadcrumbs(breadcrumbs.slice(0, -1));
  };

  const filteredItems = items.filter(
    (item) => !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  const folders = filteredItems.filter((i) => i.type === "folder");
  const files = filteredItems.filter((i) => i.type === "file");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Drive Manager</h1>
          <p className="text-sm text-gray-500">Browse and manage Google Drive files</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(true)}>
            <FolderPlus className="h-4 w-4" /> New Folder
          </Button>
          <Button size="sm">
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <Card className="px-4 py-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {breadcrumbs.length > 1 && (
            <button onClick={goBack} className="mr-2 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.id} className="flex items-center">
              {i > 0 && <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />}
              <button
                onClick={() => navigateToBreadcrumb(i)}
                className={cn(
                  "rounded px-2 py-1 text-sm transition-colors",
                  i === breadcrumbs.length - 1
                    ? "font-semibold text-primary-500"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                )}
              >
                {i === 0 ? <Home className="inline h-4 w-4" /> : crumb.name}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search files and folders..." className="flex-1 max-w-md" />
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setViewMode("list")}
            className={cn("p-2 rounded-l-lg", viewMode === "list" ? "bg-primary-100 text-primary-500 dark:bg-primary-900" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-2 rounded-r-lg", viewMode === "grid" ? "bg-primary-100 text-primary-500 dark:bg-primary-900" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* File List */}
      {loading ? (
        <Card className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[...folders, ...files].map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer p-4 transition-shadow hover:shadow-elevation-2"
              onClick={() => item.type === "folder" ? navigateToFolder(item.id, item.name) : window.open(item.url, "_blank")}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center">
                  {getFileIcon(item.mimeType)}
                </div>
                <p className="w-full truncate text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-500">{item.type === "file" ? formatSize(item.size) : ""}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Modified</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...folders, ...files].map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={() => item.type === "folder" ? navigateToFolder(item.id, item.name) : undefined}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(item.mimeType)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 capitalize">{item.type}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{formatSize(item.size)}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{formatDate(item.modifiedDate)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.type === "file" && (
                          <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); window.open(item.url, "_blank"); }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <FolderOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                      <p className="mt-3 text-sm text-gray-500">
                        {search ? "No files match your search" : "This folder is empty"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Connect your Google Drive API to browse files
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Folder Modal */}
      <Modal open={createFolderOpen} onClose={() => setCreateFolderOpen(false)} title="Create New Folder" size="sm">
        <Input
          label="Folder Name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Enter folder name"
          autoFocus
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
          <Button onClick={() => { toast("info", "Google Drive API integration required"); setCreateFolderOpen(false); }}>
            <FolderPlus className="h-4 w-4" /> Create
          </Button>
        </div>
      </Modal>
    </div>
  );
}
