# -*- coding: utf-8 -*-
"""
KMP Complete Demo Seeder
Run: python seed_demo.py
Creates rich sample data to showcase ALL portal features in a demo video.
"""
import os, sys, shutil, random
from datetime import datetime, timedelta

# Fix Windows encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ".")

from app import models, crud, auth
from app.database import engine, SessionLocal
from app.services import ai

print("=" * 60)
print("   EduMind - Complete Demo Data Seeder")
print("=" * 60)

# ── Reset DB ─────────────────────────────────────────────────
print("\n[1/9] Resetting database...")
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clean FAISS index
if os.path.exists("faiss_db"):
    try:
        shutil.rmtree("faiss_db")
    except Exception:
        pass  # ignore if folder cannot be removed

    os.makedirs("faiss_db", exist_ok=True)
    print("  Cleared FAISS index")

# ── Categories ───────────────────────────────────────────────
print("\n[2/9] Creating categories...")
cats_data = [
    ("Academic Resources", "Lecture notes, syllabus, question papers, and study guides"),
    ("Research & Publications", "Research papers, theses, datasets, and conference publications"),
    ("Administrative Resources", "Rules, policies, guidelines, circulars, and notices"),
    ("Student Services", "Scholarships, internships, career guidance, and counseling"),
    ("Events & Announcements", "Workshops, seminars, and campus events"),
    ("Technical Documentation", "Software guides, system docs, and lab manuals"),
    ("Knowledge Articles / FAQs", "General knowledge base, procedures, and FAQs"),
    ("Multimedia Learning", "Video tutorials, recorded sessions, and podcasts"),
    ("Institutional Reports", "Annual reports, accreditation data, and performance stats"),
    ("External Resources", "MOOCs, external links, and global guidelines"),
]
categories = {}
for name, desc in cats_data:
    cat = models.Category(name=name, description=desc)
    db.add(cat); db.flush()
    categories[name] = cat
db.commit()
print(f"  Created {len(categories)} categories")

# ── Users ────────────────────────────────────────────────────
print("\n[3/9] Creating users...")
users_data = [
    ("admin@kmp.edu",    "admin123",   models.UserRole.ADMIN,   "Dr. Priya Kapoor",   "Administration",    "University administrator overseeing the Knowledge Management Portal."),
    ("faculty@kmp.edu",  "faculty123", models.UserRole.FACULTY, "Prof. Arjun Sharma", "Computer Science",  "Expert in Data Structures, Algorithms, and System Design."),
    ("faculty2@kmp.edu", "faculty123", models.UserRole.FACULTY, "Prof. Neha Gupta",   "Mathematics",       "Specializes in Discrete Mathematics and Linear Algebra."),
    ("student@kmp.edu",  "student123", models.UserRole.STUDENT, "Ananya Verma",       "Computer Science",  "3rd year B.Tech student, passionate about AI and Web Dev."),
    ("student2@kmp.edu", "student123", models.UserRole.STUDENT, "Rahul Tiwari",       "Computer Science",  "2nd year student interested in Full-Stack Development."),
    ("student3@kmp.edu", "student123", models.UserRole.STUDENT, "Meera Patel",        "Data Science",      "Final year student working on ML research projects."),
]
users = {}
for email, password, role, name, dept, bio in users_data:
    user = models.User(
        email=email, hashed_password=auth.get_password_hash(password),
        role=role, full_name=name, department=dept, bio=bio, is_active=1
    )
    db.add(user); db.flush()
    users[email] = user
db.commit()
print(f"  Created {len(users)} users")

# ── Sample Documents ─────────────────────────────────────────
print("\n[4/9] Creating sample documents with real content...")
os.makedirs("uploads", exist_ok=True)

sample_docs = [
    {
        "title": "Data Structures and Algorithms - Complete Guide",
        "filename": "dsa_guide.txt",
        "category": "Academic Resources",
        "tags": "algorithms, data-structures, trees, graphs, sorting",
        "owner": "faculty@kmp.edu",
        "views": 142,
        "upvotes": 28,
        "content": """Data Structures and Algorithms - Complete Study Guide

Chapter 1: Introduction to Data Structures

A data structure is a way of organizing and storing data so that it can be accessed and modified efficiently. Data structures are fundamental to computer science and form the backbone of efficient software development.

Arrays are the simplest data structures. An array is a collection of elements stored in contiguous memory locations. Arrays provide O(1) access time for element retrieval by index, making them extremely efficient for random access patterns.

A Linked List is a linear data structure where elements are stored in nodes. Each node contains data and a reference to the next node. Unlike arrays, linked lists allow efficient insertion and deletion at any position in O(1) time, but accessing an element requires O(n) traversal.

Chapter 2: Trees and Graphs

A Binary Search Tree is a hierarchical data structure where each node has at most two children. The left child contains values less than the parent, and the right child contains values greater than the parent. BSTs support search, insert, and delete operations in O(log n) average time.

AVL Trees are self-balancing binary search trees where the height difference between left and right subtrees is at most 1. This guarantees O(log n) time complexity for all operations, preventing worst-case O(n) degradation.

A Graph is a non-linear data structure consisting of vertices and edges. Graphs can represent networks, social connections, maps, and many real-world relationships. Graph traversal algorithms include Breadth-First Search (BFS) and Depth-First Search (DFS).

BFS explores all neighbors at the present depth before moving to vertices at the next depth level. It uses a queue data structure and is optimal for finding shortest paths in unweighted graphs.

DFS explores as far as possible along each branch before backtracking. It uses a stack (or recursion) and is useful for detecting cycles, topological sorting, and finding connected components.

Chapter 3: Sorting Algorithms

Quick Sort is a divide-and-conquer algorithm that selects a pivot element and partitions the array around it. It has an average time complexity of O(n log n) but O(n^2) in the worst case.

Merge Sort is another divide-and-conquer algorithm that divides the array into two halves, recursively sorts them, and merges the results. It guarantees O(n log n) performance in all cases but requires O(n) additional space.

Heap Sort uses a binary heap data structure to sort elements. It has O(n log n) time complexity and sorts in-place with O(1) extra space.

Chapter 4: Dynamic Programming

Dynamic Programming is a technique for solving complex problems by breaking them into overlapping subproblems. It stores solutions to subproblems to avoid redundant computation, achieving significant performance improvements.

The Fibonacci sequence can be computed in O(n) time using dynamic programming instead of O(2^n) with naive recursion. Memoization stores previously computed values in a table for quick lookup.

Common DP problems include the Knapsack Problem, Longest Common Subsequence, Matrix Chain Multiplication, and Edit Distance."""
    },
    {
        "title": "Machine Learning Fundamentals",
        "filename": "ml_fundamentals.txt",
        "category": "Academic Resources",
        "tags": "machine-learning, AI, neural-networks, deep-learning, classification",
        "owner": "faculty@kmp.edu",
        "views": 198,
        "upvotes": 45,
        "content": """Machine Learning Fundamentals - Comprehensive Notes

Section 1: Introduction to Machine Learning

Machine Learning is a subset of Artificial Intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.

Supervised Learning is a type of machine learning where the model is trained on labeled data. The algorithm learns a mapping function from input features to output labels. Common supervised learning tasks include classification and regression.

Unsupervised Learning works with unlabeled data. The algorithm tries to discover hidden patterns and structures in the data. Clustering and dimensionality reduction are primary unsupervised learning techniques.

Reinforcement Learning is a paradigm where an agent learns to make decisions by interacting with an environment. The agent receives rewards or penalties based on its actions and learns an optimal policy to maximize cumulative reward.

Section 2: Classification Algorithms

Logistic Regression is a statistical model used for binary classification. Despite its name, it uses the sigmoid function to model the probability of a binary outcome. It is simple, interpretable, and effective for linearly separable data.

Decision Trees are non-parametric models that split data based on feature values to make predictions. They are easy to interpret and visualize but can overfit if not pruned properly.

Random Forest is an ensemble method that combines multiple decision trees trained on random subsets of data and features. It reduces overfitting and generally provides better accuracy than individual decision trees.

Support Vector Machines find the optimal hyperplane that maximizes the margin between different classes. They are effective in high-dimensional spaces and work well with kernel functions for non-linear classification.

Section 3: Neural Networks

A Neural Network is composed of layers of interconnected neurons. Each connection has a weight, and each neuron applies an activation function to compute its output. Deep neural networks have multiple hidden layers.

Convolutional Neural Networks are specifically designed for processing structured grid data like images. They use convolutional layers to automatically extract spatial features, followed by pooling layers for dimensionality reduction.

Recurrent Neural Networks are designed for sequential data. They maintain a hidden state that captures information from previous time steps, making them suitable for natural language processing and time series analysis.

Section 4: Model Evaluation

Accuracy measures the proportion of correct predictions. While useful, it can be misleading for imbalanced datasets.

Precision measures the proportion of positive predictions that are actually correct. High precision means few false positives.

Recall measures the proportion of actual positives that are correctly identified. High recall means few false negatives.

The F1 Score is the harmonic mean of precision and recall, providing a balanced measure when both false positives and false negatives are important."""
    },
    {
        "title": "Cloud Computing and DevOps Handbook",
        "filename": "cloud_devops.txt",
        "category": "Technical Documentation",
        "tags": "cloud, devops, docker, kubernetes, CI/CD",
        "owner": "faculty@kmp.edu",
        "views": 87,
        "upvotes": 15,
        "content": """Cloud Computing and DevOps - Practical Handbook

Chapter 1: Cloud Computing Fundamentals

Cloud Computing is the delivery of computing services over the internet, including servers, storage, databases, networking, software, and analytics. It offers faster innovation, flexible resources, and economies of scale.

Infrastructure as a Service provides virtualized computing resources over the internet. IaaS gives users control over operating systems, storage, and deployed applications. Examples include AWS EC2 and Azure Virtual Machines.

Platform as a Service provides a platform for developing, running, and managing applications without dealing with infrastructure complexity. PaaS offerings include Google App Engine and Heroku.

Software as a Service delivers software applications over the internet on a subscription basis. SaaS eliminates the need for installation and maintenance. Examples include Google Workspace and Salesforce.

Chapter 2: Docker and Containerization

Docker is a platform for developing, shipping, and running applications in containers. A container is a lightweight, standalone executable package that includes everything needed to run a piece of software.

A Dockerfile is a text document containing instructions for building a Docker image. It specifies the base image, application code, dependencies, and runtime configuration.

Docker Compose is a tool for defining and running multi-container Docker applications. It uses a YAML file to configure application services, networks, and volumes.

Chapter 3: Kubernetes Orchestration

Kubernetes is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. It groups containers into logical units called Pods.

A Pod is the smallest deployable unit in Kubernetes, consisting of one or more containers that share storage and network resources. Pods are ephemeral by nature.

A Deployment manages the desired state for Pods and ReplicaSets. It enables declarative updates, rolling updates, and rollbacks for applications running in the cluster.

Services in Kubernetes provide a stable network endpoint for accessing a set of Pods. They enable load balancing and service discovery across the cluster.

Chapter 4: CI/CD Pipelines

Continuous Integration is the practice of frequently merging code changes into a shared repository. Automated builds and tests verify each integration, enabling early detection of errors.

Continuous Deployment extends CI by automatically deploying every change that passes the automated tests to production. It requires robust testing and monitoring infrastructure.

Jenkins is an open-source automation server widely used for building CI/CD pipelines. It supports hundreds of plugins for integration with various development tools."""
    },
    {
        "title": "Web Development with React and Node.js",
        "filename": "web_dev_react.txt",
        "category": "Technical Documentation",
        "tags": "react, nodejs, javascript, web-development, frontend",
        "owner": "faculty2@kmp.edu",
        "views": 165,
        "upvotes": 32,
        "content": """Web Development with React and Node.js

Part 1: React Fundamentals

React is a JavaScript library for building user interfaces. It uses a component-based architecture where UIs are built from small, reusable pieces called components. React was developed by Facebook and is maintained by Meta.

JSX is a syntax extension for JavaScript that allows writing HTML-like code in JavaScript files. JSX makes it easier to visualize the structure of the UI and is compiled to regular JavaScript function calls.

State Management in React allows components to manage and respond to changing data. The useState hook provides a way to add state to functional components. When state changes, React re-renders the component efficiently.

Props are read-only inputs passed from parent to child components. They enable data flow through the component hierarchy, following a unidirectional data flow pattern.

The useEffect hook handles side effects in functional components, such as data fetching, subscriptions, and DOM manipulation. It runs after every render by default but can be optimized with dependency arrays.

Part 2: Node.js Backend

Node.js is a JavaScript runtime built on Chrome's V8 engine. It enables server-side JavaScript execution and is particularly well-suited for building scalable network applications.

Express.js is a minimal and flexible Node.js web application framework. It provides robust features for building web and mobile applications, including routing, middleware support, and template engines.

RESTful APIs follow the Representational State Transfer architectural style. They use standard HTTP methods like GET, POST, PUT, and DELETE to perform CRUD operations on resources.

Middleware functions in Express have access to the request object, response object, and the next function in the application request-response cycle. They can execute code, modify requests and responses, and end the cycle.

Part 3: Database Integration

MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents. It is widely used with Node.js applications due to its JavaScript-friendly data format.

SQL databases like PostgreSQL and MySQL store data in structured tables with predefined schemas. They are ideal for applications requiring complex queries, transactions, and data integrity."""
    },
    {
        "title": "Discrete Mathematics for Computer Science",
        "filename": "discrete_math.txt",
        "category": "Academic Resources",
        "tags": "mathematics, discrete-math, logic, combinatorics, graph-theory",
        "owner": "faculty2@kmp.edu",
        "views": 95,
        "upvotes": 18,
        "content": """Discrete Mathematics for Computer Science

Chapter 1: Mathematical Logic

Propositional Logic deals with propositions that are either true or false. The fundamental connectives include AND (conjunction), OR (disjunction), NOT (negation), and IMPLIES (conditional).

A tautology is a proposition that is always true regardless of the truth values of its components. For example, P OR NOT P is always true.

Predicate Logic extends propositional logic by introducing variables, quantifiers, and predicates. The universal quantifier states that a predicate is true for all values, while the existential quantifier states it is true for at least one value.

Chapter 2: Set Theory

A Set is a well-defined collection of distinct objects. Set operations include union, intersection, difference, and complement. The power set of a set S is the set of all subsets of S.

Relations and Functions are fundamental concepts in discrete mathematics. A relation R on a set A is a subset of the Cartesian product A x A. A function is a special relation where each input maps to exactly one output.

Equivalence Relations are reflexive, symmetric, and transitive. They partition a set into disjoint equivalence classes, which is important in modular arithmetic and abstract algebra.

Chapter 3: Combinatorics

The Counting Principle states that if one event can occur in m ways and another in n ways, they can occur together in m times n ways. This is the foundation for permutation and combination calculations.

Permutations are arrangements of objects where order matters. The number of permutations of n objects taken r at a time is n factorial divided by (n-r) factorial.

Combinations are selections where order does not matter. The binomial coefficient C(n,r) gives the number of ways to choose r items from n items.

The Pigeonhole Principle states that if n items are placed into m containers with n greater than m, then at least one container must hold more than one item. Despite its simplicity, it has powerful applications in proofs.

Chapter 4: Graph Theory

A graph G consists of a set of vertices V and a set of edges E. Graphs can be directed or undirected, weighted or unweighted. They model relationships and connections in computer networks, social networks, and transportation systems.

Euler's theorem states that a connected graph has an Eulerian circuit if and only if every vertex has even degree. This elegant result has applications in circuit design and route planning."""
    },
    {
        "title": "Operating Systems - Process Management",
        "filename": "os_processes.txt",
        "category": "Academic Resources",
        "tags": "operating-systems, processes, threads, scheduling, memory",
        "owner": "faculty@kmp.edu",
        "views": 112,
        "upvotes": 22,
        "content": """Operating Systems - Process Management

Chapter 1: Process Concepts

A Process is an instance of a program in execution. It contains the program code, current activity represented by the program counter, process stack, data section, and heap memory.

Process States include New, Ready, Running, Waiting, and Terminated. The operating system manages transitions between these states using scheduling algorithms and interrupt handling.

A Process Control Block stores all the information needed to track a process, including process state, program counter, CPU registers, memory management information, and I/O status.

Chapter 2: CPU Scheduling

First Come First Served is the simplest scheduling algorithm. Processes are executed in the order they arrive in the ready queue. It is non-preemptive but can suffer from the convoy effect.

Round Robin scheduling assigns a fixed time quantum to each process. When the time quantum expires, the process is moved to the back of the ready queue. It provides fair CPU allocation and is widely used in time-sharing systems.

Shortest Job First selects the process with the smallest execution time. It minimizes average waiting time but requires knowledge of future CPU burst lengths, which is often estimated.

Priority Scheduling assigns a priority to each process. The CPU is allocated to the process with the highest priority. Aging is used to prevent starvation of low-priority processes.

Chapter 3: Threads and Concurrency

A Thread is the smallest unit of CPU utilization. It comprises a thread ID, program counter, register set, and stack. Threads within the same process share code, data, and system resources.

Multithreading allows a process to have multiple threads executing concurrently. This improves responsiveness, enables resource sharing, and takes advantage of multiprocessor architectures.

Race Conditions occur when multiple threads access shared data concurrently and the outcome depends on the order of execution. Synchronization mechanisms like mutexes and semaphores prevent race conditions.

Deadlock is a situation where two or more processes are unable to proceed because each is waiting for the other to release a resource. The four necessary conditions for deadlock are mutual exclusion, hold and wait, no preemption, and circular wait."""
    },
    {
        "title": "Database Management Systems - SQL Mastery",
        "filename": "dbms_sql.txt",
        "category": "Academic Resources",
        "tags": "database, SQL, normalization, transactions, indexing",
        "owner": "faculty2@kmp.edu",
        "views": 134,
        "upvotes": 25,
        "content": """Database Management Systems - SQL Mastery Guide

Chapter 1: Relational Database Concepts

A Relational Database organizes data into tables (relations) consisting of rows (tuples) and columns (attributes). Each table represents an entity, and relationships between entities are maintained through foreign keys.

A Primary Key is a column or set of columns that uniquely identifies each row in a table. It must contain unique values and cannot be NULL. Primary keys ensure entity integrity.

A Foreign Key is a column that creates a link between two tables. It references the primary key of another table, establishing referential integrity and enabling joins.

Normalization is the process of organizing data to minimize redundancy and dependency. The main normal forms are First Normal Form, Second Normal Form, Third Normal Form, and Boyce-Codd Normal Form.

Chapter 2: SQL Queries

SELECT is the most commonly used SQL statement for retrieving data from a database. It can include WHERE clauses for filtering, ORDER BY for sorting, and GROUP BY for aggregation.

JOIN operations combine rows from two or more tables based on related columns. INNER JOIN returns matching rows, LEFT JOIN returns all rows from the left table, and RIGHT JOIN returns all rows from the right table.

Aggregate Functions include COUNT, SUM, AVG, MIN, and MAX. They perform calculations on a set of values and return a single result. The HAVING clause filters groups created by GROUP BY.

Subqueries are queries nested inside another query. They can be used in WHERE, FROM, and SELECT clauses. Correlated subqueries reference columns from the outer query and execute once for each row.

Chapter 3: Transactions

A Transaction is a logical unit of work that contains one or more SQL statements. It must satisfy the ACID properties: Atomicity, Consistency, Isolation, and Durability.

Atomicity ensures that either all operations in a transaction are completed or none of them are applied. This is the "all-or-nothing" property.

Isolation ensures that concurrent transactions do not interfere with each other. Different isolation levels include Read Uncommitted, Read Committed, Repeatable Read, and Serializable.

Chapter 4: Indexing

An Index is a data structure that improves the speed of data retrieval operations. B-Tree indexes are the most common type, providing efficient lookups, range queries, and sorted access.

A Clustered Index determines the physical order of data in a table. Each table can have only one clustered index. A non-clustered index contains pointers to the data rows and does not affect physical ordering."""
    },
    {
        "title": "Cybersecurity Fundamentals and Best Practices",
        "filename": "cybersecurity.txt",
        "category": "Technical Documentation",
        "tags": "security, encryption, authentication, vulnerabilities, networking",
        "owner": "faculty@kmp.edu",
        "views": 76,
        "upvotes": 14,
        "content": """Cybersecurity Fundamentals and Best Practices

Chapter 1: Security Fundamentals

Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These attacks are usually aimed at accessing, changing, or destroying sensitive information.

The CIA Triad represents the three core principles of information security: Confidentiality ensures data is accessible only to authorized users, Integrity ensures data accuracy and completeness, and Availability ensures data and systems are accessible when needed.

Authentication is the process of verifying the identity of a user or system. Common methods include passwords, biometrics, and multi-factor authentication. Strong authentication prevents unauthorized access.

Authorization determines what actions an authenticated user is permitted to perform. Role-based access control assigns permissions based on user roles, following the principle of least privilege.

Chapter 2: Common Threats

SQL Injection is a code injection technique that exploits vulnerabilities in database queries. Attackers insert malicious SQL code through user inputs to manipulate or extract data from the database.

Cross-Site Scripting allows attackers to inject malicious scripts into web pages viewed by other users. It can steal session cookies, redirect users, or deface websites.

Phishing is a social engineering attack where attackers send fraudulent communications that appear to come from a reputable source. The goal is to steal sensitive data like login credentials or credit card numbers.

Ransomware is a type of malware that encrypts victim files and demands payment for the decryption key. It can spread through email attachments, infected software, and vulnerable network services.

Chapter 3: Encryption

Symmetric Encryption uses the same key for both encryption and decryption. AES (Advanced Encryption Standard) is the most widely used symmetric encryption algorithm. It is fast and suitable for encrypting large amounts of data.

Asymmetric Encryption uses a pair of keys: a public key for encryption and a private key for decryption. RSA is a widely used asymmetric algorithm. It enables secure key exchange and digital signatures.

Hashing is a one-way function that converts data into a fixed-size string. SHA-256 is commonly used for password storage and data integrity verification. Hash functions are irreversible by design."""
    },
]

documents = {}
for doc_data in sample_docs:
    filepath = f"uploads/{doc_data['filename']}"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(doc_data["content"])
    
    cat = categories.get(doc_data["category"], categories["Academic Resources"])
    
    text = doc_data["content"]
    summary = ai.summarize_text(text) if text else doc_data["title"]
    
    doc = models.Document(
        title=doc_data["title"],
        description=summary[:250] + "..." if summary and len(summary) > 250 else summary,
        file_path=filepath, file_type="txt",
        tags=doc_data["tags"],
        status=models.DocStatus.APPROVED,
        view_count=doc_data["views"],
        upvote_count=doc_data["upvotes"],
        summary=summary,
        owner_id=users[doc_data["owner"]].id,
        category_id=cat.id,
    )
    db.add(doc); db.flush()
    documents[doc_data["title"]] = doc
    
    # Index in FAISS
    try:
        ai.process_and_index_document(doc.id, doc.title, filepath, doc_data["category"])
        print(f"  [OK] {doc_data['title']}")
    except Exception as e:
        print(f"  [WARN] {doc_data['title']} - indexing: {e}")

# Add one PENDING document for admin moderation demo
pending_filepath = "uploads/pending_blockchain.txt"
with open(pending_filepath, "w", encoding="utf-8") as f:
    f.write("""Blockchain Technology Overview
    
Blockchain is a distributed ledger technology that records transactions across multiple computers. It ensures transparency, immutability, and security without requiring a central authority.

A block contains a list of transactions, a timestamp, and a cryptographic hash of the previous block. This chain of blocks creates a tamper-evident record of all transactions.

Smart Contracts are self-executing contracts with the terms directly written in code. They run on blockchain platforms like Ethereum and automatically enforce agreements when conditions are met.

Consensus Mechanisms like Proof of Work and Proof of Stake enable distributed networks to agree on the state of the blockchain. They prevent double-spending and ensure network integrity.""")

pending_doc = models.Document(
    title="Blockchain Technology - Student Submission",
    description="A student's overview of blockchain technology, smart contracts, and consensus mechanisms.",
    file_path=pending_filepath, file_type="txt",
    tags="blockchain, distributed-ledger, smart-contracts",
    status=models.DocStatus.PENDING,
    view_count=0, upvote_count=0,
    summary="Overview of blockchain technology including distributed ledgers, smart contracts, and consensus mechanisms.",
    owner_id=users["student@kmp.edu"].id,
    category_id=categories["Technical Documentation"].id,
)
db.add(pending_doc); db.flush()
print(f"  [PENDING] Blockchain Technology - Student Submission")

db.commit()
print(f"  Total: {len(documents)} approved + 1 pending")

# ── Upvotes (actual records) ─────────────────────────────────
print("\n[5/9] Creating upvotes, bookmarks, and interactions...")
doc_list = list(documents.values())
student_users = [users["student@kmp.edu"], users["student2@kmp.edu"], users["student3@kmp.edu"]]

for doc in doc_list:
    # Random students upvote each document
    upvoting_students = random.sample(student_users, random.randint(1, 3))
    for stu in upvoting_students:
        db.add(models.Upvote(user_id=stu.id, document_id=doc.id))
    
    # View interactions
    for stu in student_users:
        if random.random() > 0.3:
            db.add(models.UserInteraction(
                user_id=stu.id, document_id=doc.id, interaction_type="view"
            ))

# Bookmarks - students bookmark their favorite docs
bookmark_docs = random.sample(doc_list, min(5, len(doc_list)))
for doc in bookmark_docs:
    db.add(models.Bookmark(user_id=users["student@kmp.edu"].id, document_id=doc.id))

bookmark_docs2 = random.sample(doc_list, min(3, len(doc_list)))
for doc in bookmark_docs2:
    db.add(models.Bookmark(user_id=users["student2@kmp.edu"].id, document_id=doc.id))

db.commit()
print("  Created upvotes, bookmarks, and view interactions")

# ── Comments / Discussion ────────────────────────────────────
print("\n[6/9] Creating comments and discussions...")
comments_data = [
    (doc_list[0].id, users["student@kmp.edu"].id,  "Great explanation of BST operations! The time complexity breakdown was very helpful."),
    (doc_list[0].id, users["student2@kmp.edu"].id,  "Can you add more examples on AVL tree rotations?"),
    (doc_list[0].id, users["faculty@kmp.edu"].id,   "Good question Rahul! I'll add a section on AVL rotations in the next revision."),
    (doc_list[1].id, users["student3@kmp.edu"].id,  "The neural network section is exactly what I needed for my ML project. Thanks Prof!"),
    (doc_list[1].id, users["student@kmp.edu"].id,   "How do CNNs differ from RNNs in terms of input data? This cleared it up."),
    (doc_list[2].id, users["student2@kmp.edu"].id,  "Docker vs Kubernetes was confusing until I read this. The examples make it clear."),
    (doc_list[3].id, users["student@kmp.edu"].id,   "React hooks explanation is on point. The useEffect dependency array part was really useful."),
    (doc_list[5].id, users["student3@kmp.edu"].id,  "Process scheduling algorithms - finally I understand Round Robin vs SJF!"),
]
for doc_id, user_id, content in comments_data:
    db.add(models.DocumentComment(document_id=doc_id, user_id=user_id, content=content))
db.commit()
print(f"  Created {len(comments_data)} comments")

# ── Quiz Results (for Leaderboard) ────────────────────────────
print("\n[7/9] Creating quiz results for leaderboard...")
quiz_data = [
    # (user_email, doc_index, score, total)
    ("student@kmp.edu",  0, 7, 8),   # DSA quiz
    ("student@kmp.edu",  1, 6, 8),   # ML quiz
    ("student@kmp.edu",  3, 8, 8),   # Web Dev quiz
    ("student@kmp.edu",  5, 5, 8),   # OS quiz
    ("student2@kmp.edu", 0, 5, 8),   # DSA quiz
    ("student2@kmp.edu", 1, 7, 8),   # ML quiz
    ("student2@kmp.edu", 6, 6, 8),   # DBMS quiz
    ("student3@kmp.edu", 1, 8, 8),   # ML quiz - top scorer
    ("student3@kmp.edu", 0, 6, 8),   # DSA quiz
    ("student3@kmp.edu", 2, 7, 8),   # Cloud quiz
    ("student3@kmp.edu", 4, 7, 8),   # Math quiz
    ("student3@kmp.edu", 5, 6, 8),   # OS quiz
]
for email, doc_idx, score, total in quiz_data:
    if doc_idx < len(doc_list):
        db.add(models.QuizResult(
            user_id=users[email].id,
            document_id=doc_list[doc_idx].id,
            score=score,
            total_questions=total,
            completed_at=datetime.utcnow() - timedelta(days=random.randint(0, 14))
        ))
db.commit()
print(f"  Created {len(quiz_data)} quiz results")

# ── Search Logs ───────────────────────────────────────────────
print("\n[8/9] Creating search logs...")
search_logs = [
    ("machine learning algorithms",       3, "student@kmp.edu"),
    ("binary search tree operations",      3, "student@kmp.edu"),
    ("docker vs kubernetes",               2, "student2@kmp.edu"),
    ("react hooks useEffect",              3, "student@kmp.edu"),
    ("SQL join operations",                2, "student3@kmp.edu"),
    ("process scheduling round robin",     2, "student2@kmp.edu"),
    ("neural networks deep learning",      3, "student3@kmp.edu"),
    ("sorting algorithms comparison",      2, "student@kmp.edu"),
    ("dynamic programming problems",       2, "student2@kmp.edu"),
    ("cybersecurity encryption",           2, "student3@kmp.edu"),
    ("graph traversal BFS DFS",            3, "student@kmp.edu"),
    ("normalization in databases",         2, "student2@kmp.edu"),
    ("CGPA calculation formula",           0, "student2@kmp.edu"),   # knowledge gap
    ("hostel fee waiver rules",            0, "student@kmp.edu"),    # knowledge gap
    ("internship policy 2025",             0, "student3@kmp.edu"),   # knowledge gap
    ("exam revaluation process",           0, "student@kmp.edu"),    # knowledge gap
]
for query, count, email in search_logs:
    db.add(models.SearchLog(query=query, results_count=count, user_id=users[email].id))
db.commit()
print(f"  Created {len(search_logs)} search logs (4 knowledge gaps)")

# ── Notifications & Announcements ─────────────────────────────
print("\n[9/9] Creating notifications and announcements...")
notifs = [
    (users["student@kmp.edu"].id,  "Your document 'Blockchain Technology' is pending review.", "/library"),
    (users["student@kmp.edu"].id,  "Prof. Arjun Sharma replied to your comment on 'DSA Guide'.", f"/document/{doc_list[0].id}"),
    (users["student2@kmp.edu"].id, "New document available: 'Cybersecurity Fundamentals'", "/library"),
    (users["student3@kmp.edu"].id, "Someone upvoted your bookmark!", "/bookmarks"),
    (users["admin@kmp.edu"].id,    "New document pending approval: 'Blockchain Technology'", "/admin"),
    (users["faculty@kmp.edu"].id,  "Ananya Verma commented on 'Data Structures and Algorithms'.", f"/document/{doc_list[0].id}"),
]
for uid, msg, link in notifs:
    db.add(models.Notification(user_id=uid, message=msg, link=link))

announcements = [
    ("Mid-Semester Exam Schedule Released", "The mid-semester examination schedule for all departments has been published. Please check the Academic Resources section for your timetable.", users["admin@kmp.edu"].id),
    ("New AI/ML Course Materials Available", "Prof. Arjun Sharma has uploaded comprehensive Machine Learning study materials including neural networks and classification algorithms.", users["faculty@kmp.edu"].id),
    ("Hackathon 2025 Registration Open", "Register for the annual inter-college hackathon! Teams of 3-4 members. Prizes worth Rs. 50,000. Deadline: July 30th.", users["admin@kmp.edu"].id),
]
for title, content, author_id in announcements:
    db.add(models.Announcement(title=title, content=content, author_id=author_id))

db.commit()
db.close()
print(f"  Created {len(notifs)} notifications and {len(announcements)} announcements")

print("\n" + "=" * 60)
print("   SEEDING COMPLETE!")
print("=" * 60)
print()
print("   LOGIN CREDENTIALS")
print("   " + "-" * 40)
print("   Admin    : admin@kmp.edu    / admin123")
print("   Faculty  : faculty@kmp.edu  / faculty123")
print("   Faculty 2: faculty2@kmp.edu / faculty123")
print("   Student  : student@kmp.edu  / student123")
print("   Student 2: student2@kmp.edu / student123")
print("   Student 3: student3@kmp.edu / student123")
print()
print("   DEMO FEATURES TO SHOWCASE")
print("   " + "-" * 40)
print("   1. Login as student  -> Dashboard, Library, Search")
print("   2. Open a document   -> View, Upvote, Bookmark, Comment")
print("   3. Take a Quiz       -> AI-generated MCQs")
print("   4. View Flashcards   -> Study key concepts")
print("   5. Check Leaderboard -> Rankings by quiz scores")
print("   6. Check Bookmarks   -> Saved documents")
print("   7. Notification bell -> Click to navigate")
print("   8. Login as admin    -> Approve pending doc, manage users")
print("   9. Post Announcement -> Visible to all users")
print("  10. Upload a document -> AI auto-categorize & summarize")
print()
print("   Start: python -m uvicorn app.main:app --port 8000")
print("   Open : http://localhost:5173")
print("=" * 60)
