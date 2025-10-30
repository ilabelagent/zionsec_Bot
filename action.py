from lightning_sdk import Machine, Studio, JobsPlugin

# Create the job object, include one of user or org
s = Studio("become-an-ai-powered-ai-influencer", "my-teamspace-name", user="my-username", org="my-org")
job = JobsPlugin(name="ai-influencer-job", description= "", studio=s)


# Run a job to post
job.run("python main.py", cloud_compute=Machine.A10G)