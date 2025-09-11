const calculateStringMatch = (str1, str2) => {
    if (!str1 || !str2) return 0;
  
    // Tokenize strings into words and convert them to uppercase
    const tokenize = (str) => str.toUpperCase().split(' ').map(word => word.trim());
  
    const tokens1 = tokenize(str1);
    const tokens2 = tokenize(str2);
  
    // Function to calculate Levenshtein distance between two strings
    const levenshteinDistance = (a, b) => {
      const matrix = Array.from({ length: a.length + 1 }, () => []);
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,   // Deletion
            matrix[i][j - 1] + 1,   // Insertion
            matrix[i - 1][j - 1] + cost  // Substitution
          );
        }
      }
      return matrix[a.length][b.length];
    };
  
    // 1. Exact match count for the words
    let exactMatchCount = 0;
    tokens1.forEach(word1 => {
      if (tokens2.includes(word1)) {
        exactMatchCount++;
      }
    });
  
    // 2. Calculate the exact match percentage
    const totalTokens = Math.max(tokens1.length, tokens2.length);
    const exactMatchPercentage = (exactMatchCount / totalTokens) * 100;
  
    // 3. Levenshtein distance calculation for non-matching words
    let distanceSum = 0;
    let unmatchedCount = 0;
  
    // For each word in tokens1, compare it with the closest word in tokens2
    tokens1.forEach(word1 => {
      if (!tokens2.includes(word1)) {
        let minDistance = Infinity;
        tokens2.forEach(word2 => {
          const distance = levenshteinDistance(word1, word2);
          if (distance < minDistance) minDistance = distance;
        });
  
        distanceSum += minDistance;
        unmatchedCount++;
      }
    });
  
    // 4. Calculate Levenshtein similarity (based on unmatched words)
    const maxDistance = Math.max(tokens1.length, tokens2.length) * 5; // Arbitrary weight for distance
    const levenshteinSimilarity = 100 - (distanceSum / maxDistance) * 100;
  
    // 5. Combine both exact match and Levenshtein similarity scores
    const finalSimilarity = (exactMatchPercentage + levenshteinSimilarity) / 2;
  
    return Math.round(finalSimilarity);
  };
  
  
  

  module.exports = calculateStringMatch