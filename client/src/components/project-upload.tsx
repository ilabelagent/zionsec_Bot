import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  File,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Download,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ProjectUpload {
  id: string;
  projectName: string;
  description: string | null;
  ipfsHash: string;
  ipfsUrl: string;
  pinataUrl: string | null;
  fileSize: number;
  pinned: boolean;
  pinnedAt: Date | null;
  expiresAt: Date | null;
  publishStatus: "draft" | "published" | "archived" | "unpublished";
  publishedAt: Date | null;
  provider: string;
  views: number;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProjectUploadComponent() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Fetch user's project uploads
  const { data: projects = [], refetch } = useQuery<ProjectUpload[]>({
    queryKey: ["project-uploads"],
    queryFn: async () => {
      return apiRequest("/api/projects", "GET") as Promise<ProjectUpload[]>;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("/api/projects/upload", "POST", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }) as Promise<any>;
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Project "${data.upload.projectName}" uploaded to IPFS with guaranteed 2+ year storage`,
      });
      setSelectedFile(null);
      setProjectName("");
      setDescription("");
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload project to IPFS",
        variant: "destructive",
      });
    },
  });

  // Update publish status mutation
  const updatePublishStatusMutation = useMutation({
    mutationFn: async ({
      id,
      publishStatus,
    }: {
      id: string;
      publishStatus: string;
    }) => {
      return apiRequest(`/api/projects/${id}/publish`, "PATCH", {
        publishStatus,
      }) as Promise<any>;
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Project status updated successfully",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update project status",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, unpinFromIPFS }: { id: string; unpinFromIPFS: boolean }) => {
      return apiRequest(
        `/api/projects/${id}?unpinFromIPFS=${unpinFromIPFS}`,
        "DELETE"
      ) as Promise<any>;
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Project deleted successfully",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !projectName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a file and project name",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("projectName", projectName);
    formData.append("description", description);

    uploadMutation.mutate(formData);
  };

  const handlePublishStatusChange = (id: string, publishStatus: string) => {
    updatePublishStatusMutation.mutate({ id, publishStatus });
  };

  const handleDelete = (id: string, unpinFromIPFS: boolean = false) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project?" +
          (unpinFromIPFS ? " This will also unpin the file from IPFS." : "")
      )
    ) {
      deleteMutation.mutate({ id, unpinFromIPFS });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-500",
      published: "bg-green-500",
      archived: "bg-orange-500",
      unpublished: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Project to IPFS</CardTitle>
          <CardDescription>
            Upload your mastered projects with guaranteed 2+ year storage via Pinata or web3.storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-[#FFD700] bg-[#FFD700]/10"
                : "border-muted-foreground/25 hover:border-[#FFD700]/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <File className="mx-auto h-12 w-12 text-[#FFD700]" />
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your file here, or click to browse
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Select File
                </Button>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              className="w-full bg-[#FFD700] text-black hover:bg-[#FFA500]"
              onClick={handleUpload}
              disabled={!selectedFile || !projectName.trim() || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading to IPFS...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload to IPFS
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Uploaded Projects</CardTitle>
          <CardDescription>
            Manage your IPFS uploads with guaranteed 2+ year storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <File className="mx-auto h-12 w-12 mb-2" />
                <p>No projects uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{project.projectName}</h3>
                          <Badge className={getStatusBadge(project.publishStatus)}>
                            {project.publishStatus}
                          </Badge>
                          {project.pinned && (
                            <Badge variant="outline" className="text-green-500">
                              Pinned
                            </Badge>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {project.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <File className="h-3 w-3" />
                            {formatFileSize(project.fileSize)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {project.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Uploaded {formatDate(project.createdAt)}
                          </span>
                          {project.expiresAt && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <Clock className="h-3 w-3" />
                              Expires {formatDate(project.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Select
                        value={project.publishStatus}
                        onValueChange={(value) =>
                          handlePublishStatusChange(project.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                          <SelectItem value="unpublished">Unpublished</SelectItem>
                        </SelectContent>
                      </Select>

                      {project.pinataUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.pinataUrl!, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Pinata
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`https://ipfs.io/ipfs/${project.ipfsHash}`, "_blank")
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on IPFS
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(project.id, project.pinned)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>

                    <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
                      IPFS Hash: {project.ipfsHash}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
