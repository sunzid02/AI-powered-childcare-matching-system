# 🚀 AI-powered Childcare Matching System

A simple demo project that shows how AI can help parents find the right childminder easily.

---

## 👶 What is this project?

Imagine:

👨‍👩‍👧 A parent needs childcare  
🤖 The system finds the best 3 childminders  
👩 Parent chooses one  
🏢 Admin checks and approves  

That’s exactly what this project does!

---

## 🧠 Core Idea (Very Simple)

We are solving this problem:

👉 “How can parents find the best childminder quickly?”

### Our solution:

1. Parent submits a request  
2. System finds top 3 matches  
3. Parent selects one  
4. Admin approves  

---

## 🏗️ Project Structure

```
AI-powered-childcare-matching-system/
│
├── backend/        # FastAPI backend (logic + database)
├── frontend/       # React frontend (UI)
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Tech Used

- 🐍 Python (FastAPI)
- ⚛️ React (Frontend)
- 🐘 PostgreSQL + pgvector (Database)
- 🐳 Docker (Run everything easily)

---

## 🤖 How AI is used
## 🧮 Matching Logic (How scoring works)

We calculate a **final score** for each childminder.

### Simple formula:

Final Score =  
(0.35 × Location Score) +  
(0.30 × Time Score) +  
(0.20 × Cluster Score) +  
(0.15 × Vector Score)

---

### 📍 1. Location Score
- If childminder is in same zone → high score
- If far → lower score

---

### ⏰ 2. Time Score
- If availability matches parent's requested time → high score
- Partial match → medium
- No match → low

---

### 👨‍👩‍👧 3. Cluster Score
We group parents into types:
- Working parents
- Part-time
- Special needs

If childminder fits that group → higher score

---

### 🧠 4. Vector Score (AI-like part)
We convert features into vectors (numbers)

Then:
👉 Calculate similarity between parent and childminder

More similar → higher score

---

### 🏆 Final Step
We:
- Sort by final score
- Return **Top 3 childminders**


---

## 🔄 Workflow

1. Parent creates request  
2. System shows top 3 childminders  
3. Parent selects one  
4. Admin approves or rejects  

---

## 🐳 How to Run

### 🌱 Database Seeding

When you run Docker, the database structure is created automatically.

However, to insert demo data (parents, childminders, requests), you need to run the seed script.

---

### Step 1: Start containers

```bash
docker compose up --build
```

### Step 2: Run seed script

Open another terminal:

```bash
docker exec -it childcare-backend bash
```

then run
```bash
python -m app.scripts.seed
```

### ⚠️ Important

- If data already exists, seeding may create duplicates.

#### To reset the database completely:

```bash
docker compose down -v
docker compose up --build
```


## Finally open your browser and paste these links
Frontend: http://localhost:5173  
Backend: http://localhost:8000/docs  


## 🚀 Improvements & Future Work

### 🧩 Current Approach: Rule-based Clustering

In this project, we use a **simple rule-based segmentation** instead of a machine learning clustering model.

Parents are grouped into categories like:

- Working parents  
- Part-time parents  
- Special needs families  

### How it works:

We assign a cluster based on parent data:

- If parent has full-time work schedule → **Working parent**
- If part-time schedule → **Part-time**
- If special support is required → **Special needs**

This cluster is then used in the matching process:

👉 If a childminder fits the same cluster → higher score  
👉 Otherwise → lower score  

---

### 👍 Why we used rule-based clustering

- Simple and fast to implement  
- Fully explainable (no black-box logic)  
- Easy to control and debug  
- Suitable for demo and public-sector use cases  

---

### 🤖 Future Improvement: Real Clustering (Machine Learning)

In future, this system can be upgraded using real clustering algorithms like:

#### 🔹 K-Means Clustering

We can group parents automatically based on features like:

- Working hours  
- Number of children  
- Special needs  
- Time preferences  
