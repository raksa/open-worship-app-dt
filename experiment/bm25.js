function computeBM25(documents, query, k1 = 1.5, b = 0.75) {
    const N = documents.length; // Total number of documents
    const avgDocLength =
        documents.reduce((sum, doc) => sum + doc.split(' ').length, 0) / N;

    const termFrequencies = documents.map((doc) => {
        const tf = {};
        doc.split(' ').forEach((word) => {
            tf[word] = (tf[word] || 0) + 1;
        });
        return tf;
    });

    const documentFrequencies = {};
    documents.forEach((doc) => {
        const uniqueWords = new Set(doc.split(' '));
        uniqueWords.forEach((word) => {
            documentFrequencies[word] = (documentFrequencies[word] || 0) + 1;
        });
    });

    const scores = documents.map((doc, index) => {
        const docLength = doc.split(' ').length;
        let score = 0;
        query.split(' ').forEach((term) => {
            if (term in termFrequencies[index]) {
                const df = documentFrequencies[term] || 0;
                const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
                const tf = termFrequencies[index][term];
                score +=
                    idf *
                    ((tf * (k1 + 1)) /
                        (tf + k1 * (1 - b + b * (docLength / avgDocLength))));
            }
        });
        return score;
    });

    return scores;
}

// Example usage
function testBM25(documents, query, shouldJoin = false) {
    const scores = computeBM25(documents, query);
    const mappedDocuments = documents
        .map((doc, index) => [doc, scores[index]])
        .sort((a, b) => b[1] - a[1]);
    if (shouldJoin) {
        query = query.split(' ').join('');
        mappedDocuments.forEach((item) => {
            item[0] = item[0].split(' ').join('');
        });
    }

    console.log('Query', `"${query}"`, 'BM25 Scores:', mappedDocuments);
}

const documents = [
    'the quick brown fox',
    'jumps over the lazy dog',
    'the quick brown dog',
    'quick',
    'brown',
    'browm',
    'quick brown',
];
const query = 'quick brown';
testBM25(documents, query);

const documents1 = [
    'ខ្ញុំ ស្រលាញ់ អ្នក',
    'តាម ដែល អ្នក បាន ស្គាល់',
    'មិន អាច ស្គាល់ បាន ទេ',
    'ស្រលា',
    'អ្នក',
    'ខ្ញុំ',
];
const query1 = 'ខ្ញុំ ស្រលាញ់';
testBM25(documents1, query1);

const documents2 = [
    'ស្រលាស់',
    'ស្រលាញ់',
    'ស្លាញ់',
    'លាញ់',
    'លាញ',
    'រលាញ់',
    'ក្រលាញ់',
    'ឆ្នាំង',
    'មិន',
];
const query2 = 'រលាញ';
testBM25(
    documents2.map((item) => item.split('').join(' ')),
    query2.split('').join(' '),
    true,
);
