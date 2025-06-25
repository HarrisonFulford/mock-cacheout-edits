const API_BASE = "http://localhost:8000/api/v1";

// Types matching the backend models
export interface WorkerInfo {
  worker_id: string;
  hostname: string;
  cpu_cores: number;
  ram_mb: number;
  status: 'idle' | 'busy' | 'offline';
  last_seen?: string;
}

export interface Job {
  job_id: string;
  title: string;
  description: string;
  code: string;
  priority: number;
  required_cores: number;
  required_ram_mb: number;
  command: string;
  parameters?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  assigned_worker?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  cost: number;
  result?: string;
  error_message?: string;
}

export interface JobSubmission {
  title: string;
  description: string;
  code: string;
  priority: number;
  required_cores: number;
  required_ram_mb: number;
  command: string;
  parameters?: string;
  buyer_id: string;
}

export interface JobStatusUpdate {
  job_id: string;
  worker_id: string;
  cpu_percent: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message?: string;
}

/**
 * Helper function to handle API responses with better error handling
 */
async function handleApiResponse<T>(response: Response, endpoint: string): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${endpoint}):`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`API Error (${endpoint}): ${response.status} ${response.statusText}`);
  }
  
  try {
    const data = await response.json();
    console.log(`API Success (${endpoint}):`, data);
    return data;
  } catch (error) {
    console.error(`JSON Parse Error (${endpoint}):`, error);
    throw new Error(`Failed to parse response from ${endpoint}`);
  }
}

/**
 * Fetch all registered workers
 */
export async function fetchWorkers(): Promise<WorkerInfo[]> {
  console.log('Fetching workers...');
  const response = await fetch(`${API_BASE}/workers`);
  return handleApiResponse<WorkerInfo[]>(response, 'GET /workers');
}

/**
 * Register a new worker
 */
export async function registerWorker(workerInfo: Omit<WorkerInfo, 'last_seen'>): Promise<string> {
  console.log('Registering worker:', workerInfo);
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workerInfo)
  });
  return handleApiResponse<string>(response, 'POST /register');
}

/**
 * Get next task for a worker
 */
export async function getTask(workerId: string): Promise<Job | null> {
  console.log('Getting task for worker:', workerId);
  const response = await fetch(`${API_BASE}/task?worker_id=${workerId}`);
  if (response.status === 404) {
    console.log('No task available for worker:', workerId);
    return null;
  }
  return handleApiResponse<Job>(response, 'GET /task');
}

/**
 * Unregister a worker
 */
export async function unregisterWorker(workerId: string): Promise<string> {
  console.log('Unregistering worker:', workerId);
  const response = await fetch(`${API_BASE}/unregister`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ worker_id: workerId }) // Send as JSON object
  });
  return handleApiResponse<string>(response, 'POST /unregister');
}

/**
 * Update job status
 */
export async function updateJobStatus(statusData: {
  job_id: string;
  status: 'completed' | 'failed';
  result?: string;
  error_message?: string;
}): Promise<{ status: string }> {
  console.log('Updating job status:', statusData);
  const response = await fetch(`${API_BASE}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(statusData)
  });
  return handleApiResponse<{ status: string }>(response, 'POST /status');
}

/**
 * Submit a new job (admin only)
 */
export async function submitJob(jobData: JobSubmission, adminToken: string): Promise<string> {
  console.log('Submitting job:', jobData);
  const response = await fetch(`${API_BASE}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken
    },
    body: JSON.stringify(jobData)
  });
  return handleApiResponse<string>(response, 'POST /submit');
}

/**
 * Fetch all jobs
 */
export async function fetchJobs(): Promise<Job[]> {
  console.log('Fetching jobs...');
  const response = await fetch(`${API_BASE}/jobs`);
  return handleApiResponse<Job[]>(response, 'GET /jobs');
}

/**
 * Fetch credit balance for a user
 */
export async function fetchCredits(userId: string): Promise<number> {
  console.log('Fetching credits for user:', userId);
  const response = await fetch(`${API_BASE}/credits/${userId}`);
  return handleApiResponse<number>(response, 'GET /credits');
}

/**
 * Process natural language prompt using Gemini API
 */
export async function processNaturalLanguage(prompt: string): Promise<{
  script: string;
  estimatedCores: number;
  estimatedRam: number;
  estimatedDuration: number;
  explanation: string;
}> {
  console.log('Processing natural language prompt:', prompt);
  const response = await fetch(`${API_BASE}/process-natural-language`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': 'default_insecure_token' // Fixed: using correct admin token
    },
    body: JSON.stringify({ text: prompt })
  });
  return handleApiResponse(response, 'POST /process-natural-language');
} 