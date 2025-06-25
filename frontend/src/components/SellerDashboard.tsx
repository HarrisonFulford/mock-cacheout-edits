import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Cpu, HardDrive, Zap, Clock, DollarSign, Monitor, Pickaxe, Terminal, RefreshCw, X } from "lucide-react";
import { fetchWorkers, registerWorker, unregisterWorker, getTask, updateJobStatus, fetchJobs, fetchCredits, WorkerInfo, Job } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const SellerDashboard = () => {
  const [workerId] = useState("worker-node-001"); // In a real app, this should be unique per device/user
  const [isRegistered, setIsRegistered] = useState(() => {
    // Check localStorage on initial load
    return localStorage.getItem(`worker-registered-${workerId}`) === 'true';
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [showUnregisterConfirm, setShowUnregisterConfirm] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>({
    job_id: "mining-test-001",
    title: "mining test",
    description: "Bitcoin mining operation",
    code: "xmrig --config=config.json",
    required_cores: 6,
    required_ram_mb: 8192,
    priority: 1,
    command: "xmrig --config=config.json --threads=6",
    parameters: {},
    status: "running",
    assigned_worker: "worker-node-001",
    created_at: new Date(Date.now() - 36000).toISOString(), // 36 seconds ago
    started_at: new Date(Date.now() - 36000).toISOString(), // Started 36 seconds ago
    cost: 0.0
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Hardcoded credits
  const [credits, setCredits] = useState(106.05);

  // Function to generate random load between 80-98
  const generateRandomLoad = async () => {
    // Add a small delay to make the refresh feel more realistic
    await new Promise(resolve => setTimeout(resolve, 800));
    const newLoad = Math.floor(Math.random() * (98 - 80 + 1)) + 80;
    setCurrentLoad(newLoad);
  };

  // Mock task history - will be updated when unregistering
  const [mockTaskHistory, setMockTaskHistory] = useState([
    {
      job_id: "ml-training-001",
      title: "Neural Network Training",
      description: "Deep learning model training on ImageNet dataset",
      status: "completed",
      started_at: new Date(Date.now() - 1352000).toISOString(), // 22 minutes 32 seconds ago
      completed_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      cost: 3.45
    }
  ]);

  // Fetch credit balance
  const { data: creditsData, refetch: refetchCredits } = useQuery({
    queryKey: ['credits', workerId],
    queryFn: () => fetchCredits(workerId),
    enabled: isRegistered, // Only fetch credits if worker is registered
  });

  // Effect to update localStorage when registration status changes
  useEffect(() => {
    localStorage.setItem(`worker-registered-${workerId}`, String(isRegistered));
  }, [isRegistered, workerId]);

  // Device info (in a real app, this would come from system detection)
  const deviceInfo = {
    hostname: "worker-node-001",
    cpuCores: 10,
    ram: 16384,
    currentLoad: 87
  };

  // State for variable current load
  const [currentLoad, setCurrentLoad] = useState(87);

  // Register worker mutation
  const registerWorkerMutation = useMutation({
    mutationFn: () => registerWorker({
      worker_id: workerId,
      hostname: deviceInfo.hostname,
      cpu_cores: deviceInfo.cpuCores,
      ram_mb: deviceInfo.ram,
      status: isAvailable ? 'idle' : 'offline'
    }),
    onSuccess: () => {
      setIsRegistered(true);
      toast({
        title: "Worker registered successfully!",
        description: "Your device is now available for jobs.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to register worker",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Unregister worker mutation
  const unregisterWorkerMutation = useMutation({
    mutationFn: () => unregisterWorker(workerId),
    onSuccess: () => {
      setIsRegistered(false);
      setShowUnregisterConfirm(false);
      
      // Deduct 2.4 credits
      setCredits(prev => prev - 2.4);
      
      // Add the current mining task to history with incomplete status
      if (currentJob) {
        const now = new Date();
        const taskStartTime = new Date(currentJob.started_at);
        const runtimeMs = now.getTime() - taskStartTime.getTime();
        const runtimeMinutes = Math.floor(runtimeMs / 60000);
        const runtimeSeconds = Math.floor((runtimeMs % 60000) / 1000);
        
        const incompleteTask = {
          job_id: currentJob.job_id,
          title: currentJob.title,
          description: currentJob.description,
          status: "incomplete",
          started_at: currentJob.started_at,
          completed_at: now.toISOString(),
          cost: 0.00,
          runtime: `${runtimeMinutes}m ${runtimeSeconds}s`
        };
        
        setMockTaskHistory(prev => [incompleteTask, ...prev]);
        setCurrentJob(null);
      }
      
      toast({
        title: "Worker unregistered successfully!",
        description: "Your device is no longer available for jobs.",
      });
    },
    onError: (error) => {
      // Show success message even on error for demo purposes
      setIsRegistered(false);
      setShowUnregisterConfirm(false);
      
      // Deduct 2.4 credits
      setCredits(prev => prev - 2.4);
      
      // Add the current mining task to history with incomplete status
      if (currentJob) {
        const now = new Date();
        const taskStartTime = new Date(currentJob.started_at);
        const runtimeMs = now.getTime() - taskStartTime.getTime();
        const runtimeMinutes = Math.floor(runtimeMs / 60000);
        const runtimeSeconds = Math.floor((runtimeMs % 60000) / 1000);
        
        const incompleteTask = {
          job_id: currentJob.job_id,
          title: currentJob.title,
          description: currentJob.description,
          status: "incomplete",
          started_at: currentJob.started_at,
          completed_at: now.toISOString(),
          cost: 0.00,
          runtime: `${runtimeMinutes}m ${runtimeSeconds}s`
        };
        
        setMockTaskHistory(prev => [incompleteTask, ...prev]);
        setCurrentJob(null);
      }
      
      toast({
        title: "Worker unregistered successfully!",
        description: "Your device is no longer available for jobs.",
      });
    },
  });

  // Fetch current task for this worker
  const { data: currentTask, refetch: refetchTask } = useQuery({
    queryKey: ['currentTask', workerId],
    queryFn: () => getTask(workerId),
    enabled: isRegistered,
    refetchInterval: 3000, // Check for new tasks every 3 seconds
  });

  // Fetch all jobs to show history
  const { data: allJobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Update job status mutation
  const updateStatusMutation = useMutation({
    mutationFn: updateJobStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      refetchTask();
      // If job was completed, refetch credits for the seller
      if (variables.status === 'completed') {
        refetchCredits();
      }
    },
  });

  // Handle availability toggle
  const handleAvailabilityToggle = (available: boolean) => {
    setIsAvailable(available);
    if (isRegistered) {
      // Re-register with new status
      registerWorkerMutation.mutate();
    }
  };

  // Handle task updates
  useEffect(() => {
    if (currentTask && currentTask !== currentJob) {
      setCurrentJob(currentTask);
      // Note: We don't update status to running here as the API only accepts 'completed' or 'failed'
    }
  }, [currentTask, currentJob]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  // Filter jobs for this worker
  const workerJobs = allJobs.filter(job => job.assigned_worker === workerId);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-cyan-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-gray-300 text-sm">Total Credits Earned</p>
                <p className="text-2xl font-bold text-emerald-400">{credits.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Device Summary */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Device Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-300 text-sm">Hostname</p>
                <p className="text-white font-semibold">{deviceInfo.hostname}</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-300 text-sm flex items-center gap-1">
                    <Cpu className="h-4 w-4" />
                    CPU Cores
                  </p>
                  <p className="text-white font-semibold">{deviceInfo.cpuCores}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm flex items-center gap-1">
                    <HardDrive className="h-4 w-4" />
                    RAM
                  </p>
                  <p className="text-white font-semibold">{deviceInfo.ram / 1024} GB</p>
                </div>
              </div>

              <div>
                <p className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  Allocated Power
                </p>
                <Progress value={65} className="h-2" />
                <p className="text-white text-sm mt-1">65%</p>
              </div>

              <div>
                <p className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  Current Load
                  <Button 
                    onClick={generateRandomLoad}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </p>
                <Progress value={currentLoad} className="h-2" />
                <p className="text-white text-sm mt-1">{currentLoad}%</p>
              </div>

              <div className={`flex items-center justify-between pt-4 border-t border-white/20 ${!isRegistered ? 'cursor-not-allowed' : ''}`}>
                <div>
                  <p className="text-gray-300 text-sm">Available to Accept Jobs</p>
                  <p className="text-white font-semibold">{isAvailable ? "ON" : "OFF"}</p>
                </div>
                <Switch 
                  checked={isAvailable} 
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={!isRegistered}
                  className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              {!isRegistered ? (
                <Button 
                  onClick={() => registerWorkerMutation.mutate()}
                  disabled={registerWorkerMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                >
                  {registerWorkerMutation.isPending ? "Registering..." : "Register Worker"}
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowUnregisterConfirm(true)}
                  disabled={unregisterWorkerMutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  {unregisterWorkerMutation.isPending ? "Unregistering..." : "Unregister Worker"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Current Job */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Current Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentJob ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-300 text-sm">Job ID</p>
                      <p className="text-white font-semibold">{currentJob.job_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Status</p>
                      <Badge className={`${getStatusColor(currentJob.status)} text-white`}>
                        {currentJob.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Runtime
                      </p>
                      <p className="text-white font-semibold">
                        {currentJob.started_at ? formatDuration(currentJob.started_at) : "Starting..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm flex items-center gap-1">
                        <Cpu className="h-4 w-4" />
                        Required Cores
                      </p>
                      <p className="text-white font-semibold">{currentJob.required_cores}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 text-sm mb-2">Most Recent Command</p>
                    <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-green-400 border border-white/10">
                      <Terminal className="h-4 w-4 inline mr-2" />
                      {currentJob.command}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No active job</p>
                  <p className="text-gray-500 text-sm">Waiting for work assignment...</p>
                  <Button 
                    onClick={() => refetchTask()}
                    variant="outline"
                    className="mt-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check for Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task History */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Task History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-gray-300">Job ID</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Duration</TableHead>
                  <TableHead className="text-gray-300">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTaskHistory.map((job) => (
                  <TableRow key={job.job_id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white">{job.job_id}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(job.status)} text-white`}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">
                      {job.started_at ? formatDuration(job.started_at, job.completed_at) : "-"}
                    </TableCell>
                    <TableCell className="text-white flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      {job.cost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Unregister Confirmation Dialog */}
      {showUnregisterConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowUnregisterConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-white text-lg font-semibold mb-4">Confirm Unregister</h3>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to unregister this worker? If you are running a task, you may be charged for the amount your current task has rewarded you.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowUnregisterConfirm(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
              >
                No
              </Button>
              <Button
                onClick={() => unregisterWorkerMutation.mutate()}
                disabled={unregisterWorkerMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                {unregisterWorkerMutation.isPending ? "Unregistering..." : "Yes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;