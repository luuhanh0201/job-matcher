type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: number;
};

async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch jobs');
  }

  return res.json();
}

export default async function Home() {
  const jobs = await getJobs();
console.log(process.env.NEXT_PUBLIC_API_URL);
  return (
    <main style={{ padding: '24px' }}>
      <h1>Job Matcher</h1>
      <p>Danh sách job từ NestJS API</p>

      <div style={{ marginTop: '24px' }}>
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <h2>{job.title}</h2>
            <p>Company: {job.company}</p>
            <p>Location: {job.location}</p>
            <p>Salary: ${job.salary}</p>
          </div>
        ))}
      </div>
    </main>
  );
}