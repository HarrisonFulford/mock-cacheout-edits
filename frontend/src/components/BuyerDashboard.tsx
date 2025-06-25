import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Play, Cpu, HardDrive, Upload, FileText, MessageSquare, Loader2, Download, Eye, Terminal } from "lucide-react";
import { fetchJobs, submitJob, fetchCredits, Job, JobSubmission, processNaturalLanguage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const BUYER_ID = "default-buyer";

const TerminalComponent = ({ jobs }: { jobs: Job[] }) => {
  const [visibleJobs, setVisibleJobs] = useState<string[]>([]);

  const toggleJobVisibility = (jobId: string) => {
    setVisibleJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'running': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/20 h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Distributed Computing Terminal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto font-mono text-sm text-gray-300 p-4 space-y-2">
        {jobs.map((job) => (
          <div key={job.job_id}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleJobVisibility(job.job_id)}>
              <div className="flex items-center gap-2">
                <span className={getStatusColor(job.status)}>{job.status.toUpperCase()}</span>
                <span>{job.title}</span>
                <span className="text-xs text-gray-500">{job.job_id}</span>
              </div>
              <button>{visibleJobs.includes(job.job_id) ? 'Hide' : 'Show'} Output</button>
            </div>
            {visibleJobs.includes(job.job_id) && (
              <pre className="text-xs bg-black/50 p-3 rounded mt-1 border border-gray-700 whitespace-pre-wrap">
                {job.result || "No output yet..."}
              </pre>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const BuyerDashboard = () => {
  const [jobName, setJobName] = useState("");
  const [jobType, setJobType] = useState("Custom");
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [scriptExplanation, setScriptExplanation] = useState("");
  const [showGeneratedScript, setShowGeneratedScript] = useState(true);
  const [command, setCommand] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [cpuCores, setCpuCores] = useState([4]);
  const [ram, setRam] = useState([8192]);
  const [priority, setPriority] = useState("medium");
  const [duration, setDuration] = useState("30");
  const [jobRunning, setJobRunning] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch credit balance
  const { data: fetchedCredits, refetch: refetchCredits } = useQuery({
    queryKey: ['credits', BUYER_ID],
    queryFn: () => fetchCredits(BUYER_ID),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (fetchedCredits) {
      setCredits(fetchedCredits);
    }
  }, [fetchedCredits]);

  // Fetch jobs with auto-refresh
  const { data: fetchedJobs, refetch: refetchJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Submit job mutation
  const submitJobMutation = useMutation({
    mutationFn: (jobData: JobSubmission) => submitJob(jobData, "default_insecure_token"),
    onSuccess: () => {
      toast({
        title: "Job submitted successfully!",
        description: "Your job has been added to the queue.",
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      refetchCredits();
      // Reset form
      setJobName("");
      setJobType("Custom");
      setCommand("");
      setNaturalLanguagePrompt("");
      setUploadedFile(null);
      setCpuCores([4]);
      setRam([8192]);
      setPriority("medium");
      setDuration("30");
      setGeneratedScript("");
      setScriptExplanation("");
      setShowGeneratedScript(true);
      setJobRunning(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit job",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle job type change
  const handleJobTypeChange = (newJobType: string) => {
    setJobType(newJobType);
    setCommand("");
    setNaturalLanguagePrompt("");
    setUploadedFile(null);
    setGeneratedScript("");
    setScriptExplanation("");
    setShowGeneratedScript(false);
    
    if (newJobType === "Natural Language") {
      setCpuCores([6]);
      setRam([16384]);
      setDuration("45");
    } else {
      setCpuCores([4]);
      setRam([8192]);
      setDuration("");
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCommand(content);
      };
      reader.readAsText(file);
    }
  };

  // Process natural language with Gemini API
  const handleNaturalLanguageProcess = async () => {
    if (!naturalLanguagePrompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a description of what you want to do.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingAI(true);
    try {
      const result = await processNaturalLanguage(naturalLanguagePrompt);
      
      setGeneratedScript(result.script);
      setScriptExplanation(result.explanation);
      setCpuCores([result.estimatedCores]);
      setRam([result.estimatedRam]);
      setDuration(result.estimatedDuration.toString());
      setCommand(result.script);
      setShowGeneratedScript(true);
      
      toast({
        title: "AI Processing Complete!",
        description: "Script generated and resource requirements estimated.",
      });
    } catch (error) {
      toast({
        title: "Failed to process natural language",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Handle Enter key in natural language textarea
  const handleNaturalLanguageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNaturalLanguageProcess();
    }
  };

  // Download generated script
  const downloadGeneratedScript = () => {
    if (!generatedScript) return;
    
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_script_${Date.now()}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script Downloaded",
      description: "Generated script has been saved to your computer.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getJobIcon = (type: string) => {
    switch (type) {
      case "Custom": return <FileText className="h-4 w-4" />;
      case "Natural Language": return <MessageSquare className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const handleSubmitJob = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    let finalCommand = command;
    let finalCpuCores = cpuCores[0];
    let finalRam = ram[0];
    let finalDuration = duration;

    if (!finalCommand.trim()) {
      toast({
        title: "Missing command",
        description: "Please enter a command to execute or upload a script.",
        variant: "destructive",
      });
      return;
    }

    const priorityMap: Record<string, number> = {
      "high": 1,
      "medium": 3,
      "low": 5
    };

    const jobData: JobSubmission = {
      title: jobName || "Unnamed Job",
      description: `Job type: ${jobType || "Unknown"}`,
      code: finalCommand,
      priority: priorityMap[priority] || 3,
      required_cores: finalCpuCores,
      required_ram_mb: finalRam,
      command: finalCommand,
      parameters: JSON.stringify({
        job_name: jobName,
        job_type: jobType,
        estimated_duration: finalDuration,
        natural_language_prompt: naturalLanguagePrompt || undefined
      }),
      buyer_id: BUYER_ID
    };

    submitJobMutation.mutate(jobData, {
      onSuccess: () => {
        setJobRunning(true);
        const jobCost = ((cpuCores[0] * 0.1) + (ram[0] / 1024 * 0.05) + 1.0);
        if (credits !== null) {
          setCredits(credits - jobCost);
        }
      }
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Buyer Dashboard</h1>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-gray-300 text-sm">Credits Remaining</p>
                <p className="text-2xl font-bold text-emerald-400">{credits?.toFixed(2) ?? '...'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Job Submission Panel */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="h-5 w-5" />
                {jobRunning ? "Running Mining Test" : "Submit New Job"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Job Name</label>
                <Input 
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder="Enter job name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Job Type</label>
                <Select value={jobType} onValueChange={handleJobTypeChange}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    <SelectItem value="Custom">Custom</SelectItem>
                    <SelectItem value="Natural Language">Natural Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Natural Language Input */}
              {jobType === "Natural Language" && (
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Describe what you want to do</label>
                  <Textarea 
                    value={naturalLanguagePrompt}
                    onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                    onKeyPress={handleNaturalLanguageKeyPress}
                    placeholder="Describe your task in natural language (e.g., 'Mine cryptocurrency using CPU for 30 minutes') and press Enter to process"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    rows={4}
                    disabled={isProcessingAI}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      Press Enter to process with AI
                    </p>
                    <Button
                      onClick={handleNaturalLanguageProcess}
                      disabled={isProcessingAI || !naturalLanguagePrompt.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Process with AI"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Generated Script Display */}
              {showGeneratedScript && generatedScript && (
                <Card className="bg-green-900/20 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-400 text-sm flex items-center justify-between">
                      <span>🤖 AI Generated Script</span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowGeneratedScript(!showGeneratedScript)}
                          size="sm"
                          variant="outline"
                          className="text-green-400 border-green-500/50 hover:bg-green-500/20"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {showGeneratedScript ? "Hide" : "Show"}
                        </Button>
                        <Button
                          onClick={downloadGeneratedScript}
                          size="sm"
                          variant="outline"
                          className="text-green-400 border-green-500/50 hover:bg-green-500/20"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {showGeneratedScript && (
                    <CardContent className="pt-0">
                      {scriptExplanation && (
                        <p className="text-green-300 text-xs mb-2">
                          {scriptExplanation}
                        </p>
                      )}
                      <pre className="text-green-400 text-xs bg-black/50 p-3 rounded border border-green-500/30 overflow-x-auto">
                        {generatedScript}
                      </pre>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Custom Script Upload */}
              {jobType === "Custom" && (
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Upload Script</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".sh,.py,.js,.txt"
                      className="hidden"
                      id="script-upload"
                    />
                    <label htmlFor="script-upload" className="cursor-pointer">
                      <span className="text-blue-400 hover:text-blue-300">Click to upload</span>
                      <span className="text-gray-400"> or drag and drop</span>
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports .sh, .py, .js, .txt files
                    </p>
                    {uploadedFile && (
                      <p className="text-sm text-green-400 mt-2">
                        ✓ {uploadedFile.name} uploaded
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  CPU Cores Required: {cpuCores[0]}
                  {jobType === "Natural Language" && " (AI estimated)"}
                </label>
                <Slider
                  value={cpuCores}
                  onValueChange={setCpuCores}
                  max={16}
                  min={jobType === "Natural Language" ? 6 : 1}
                  step={1}
                  className="w-full"
                  disabled={jobType === "Natural Language"}
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  RAM Required: {ram[0]} MB
                  {jobType === "Natural Language" && " (AI estimated)"}
                </label>
                <Slider
                  value={ram}
                  onValueChange={setRam}
                  max={32768}
                  min={jobType === "Natural Language" ? 16384 : 1024}
                  step={1024}
                  className="w-full"
                  disabled={jobType === "Natural Language"}
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Duration Estimate (minutes)
                  {jobType === "Natural Language" && " (AI estimated)"}
                </label>
                <Input 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Estimated duration"
                  type="number"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  disabled={jobType === "Natural Language"}
                />
              </div>

              {/* Job Cost Display */}
              <div className="text-sm text-gray-300 bg-blue-900/20 p-3 rounded border border-blue-500/30">
                <p className="font-semibold text-blue-400">Estimated Job Cost: ${((cpuCores[0] * 0.1) + (ram[0] / 1024 * 0.05) + 1.0).toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Base: $1.00 + ${(cpuCores[0] * 0.1).toFixed(2)} (cores) + ${(ram[0] / 1024 * 0.05).toFixed(2)} (RAM)
                </p>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={handleSubmitJob}
                disabled={submitJobMutation.isPending}
                type="button"
              >
                {submitJobMutation.isPending ? "Submitting..." : "Submit Job"}
              </Button>
            </CardContent>
          </Card>

          {/* Terminal Panel */}
          <TerminalComponent jobs={fetchedJobs || []} />
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
