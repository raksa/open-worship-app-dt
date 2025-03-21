use std::collections::{HashMap, HashSet};
use std::f64::consts::LN_2;

fn compute_bm25(
    documents: &Vec<String>,
    query: &str,
    k1: f64,
    b: f64,
) -> Vec<f64> {
    let n = documents.len(); // Total number of documents
    let avg_doc_length: f64 =
        documents.iter().map(|doc| doc.split_whitespace().count()).sum::<usize>() as f64 / n as f64;

    let term_frequencies: Vec<HashMap<String, usize>> = documents.iter().map(|doc| {
        let mut tf = HashMap::new();
        for word in doc.split_whitespace() {
            *tf.entry(word.to_string()).or_insert(0) += 1;
        }
        tf
    }).collect();

    let mut document_frequencies = HashMap::new();
    for doc in documents.iter() {
        let unique_words: HashSet<_> = doc.split_whitespace().collect();
        for word in unique_words {
            *document_frequencies.entry(word.to_string()).or_insert(0) += 1;
        }
    }

    documents.iter().enumerate().map(|(index, doc)| {
        let doc_length = doc.split_whitespace().count();
        query.split_whitespace().fold(0.0, |mut score, term| {
            if let Some(&tf) = term_frequencies[index].get(term) {
                let df = *document_frequencies.get(term).unwrap_or(&0);
                let idf = ((n as f64 - df as f64 + 0.5) / (df as f64 + 0.5)).ln() + LN_2; // Adjusted IDF
                score += idf * ((tf as f64 * (k1 + 1.0)) /
                    (tf as f64 + k1 * (1.0 - b + b * (doc_length as f64 / avg_doc_length))));
            }
            score
        })
    }).collect()
}

fn main() {
    let documents = vec![
        "the quick brown fox".to_string(),
        "jumps over the lazy dog".to_string(),
        "the quick brown dog".to_string(),
        "quick".to_string(),
        "brown".to_string(),
        "browm".to_string(),
        "quick brown".to_string(),
    ];
    let query = "quick brown";
    let scores = compute_bm25(&documents, query, 1.5, 0.75);

    let mut mapped_documents: Vec<_> = documents.iter()
        .zip(scores.iter())
        .map(|(doc, &score)| (doc.clone(), score))
        .collect();

    mapped_documents.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());

    println!("Query \"{}\" BM25 Scores: {:?}", query, mapped_documents);
}
