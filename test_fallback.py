"""Test the fallback quiz + flashcard generation (no API needed)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

# Force fallback by setting llm_model to None
import app.services.ai as ai
ai.llm_model = None

sample_text = """
Data structures are fundamental components of computer science.
Arrays store elements in contiguous memory locations, allowing O(1) random access.
Linked lists provide dynamic memory allocation where each node contains data and a pointer to the next node.
Binary trees organize data hierarchically with each node having at most two children.
Hash tables use hash functions to map keys to array indices, providing O(1) average case lookup time.
Stacks follow Last-In-First-Out ordering while queues follow First-In-First-Out.
Graphs represent relationships between objects using vertices and edges.
Balanced BSTs like AVL trees maintain O(log n) height through rotations.
A priority queue is an abstract data type that supports efficient retrieval of the minimum or maximum element.
Trie structures are used for efficient retrieval of keys in a large dataset of strings.
"""

print("=" * 60)
print("TESTING FALLBACK QUESTION GENERATION")
print("=" * 60)
qs = ai.generate_questions(sample_text, 5)
print(f"\nGenerated {len(qs)} questions:\n")
for i, q in enumerate(qs):
    print(f"  Q{i+1}: {q['question'][:90]}")
    print(f"       Options: {q['options']}")
    print(f"       Answer:  {q['answer']}")
    print()

print("=" * 60)
print("TESTING FALLBACK FLASHCARD GENERATION")
print("=" * 60)
fcs = ai.generate_flashcards(sample_text)
print(f"\nGenerated {len(fcs)} flashcards:\n")
for fc in fcs:
    print(f"  Term: {fc['term']}")
    print(f"  Def:  {fc['definition'][:100]}")
    print()

print("ALL TESTS PASSED" if qs and fcs else "TESTS FAILED")
