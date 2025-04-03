import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import stringSimilarity from "string-similarity";
import levenshtein from "fast-levenshtein";
import nspell from "nspell";
import { affContent, dicContent } from "../../assets/dictionary/medicinesDictionary";
import { API_URL } from "../../env";

let spell;

const PrescriptionScan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const processedImageUrl = state?.processedImageUrl;
  const ocrText = state?.ocrText;
  const originalImageUrl = state?.originalImageUrl;
  const customerId = state?.customerId;
  

  const [medicinesList, setMedicinesList] = useState([]);
  const [matchedMedicines, setMatchedMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasProcessed = useRef(false);

  const getThresholdByLength = (word) => {
    const length = word.length;
    if (length <= 5) return 0.75; 
    if (length <= 8) return 0.6;  
    return 0.55;                   
  };

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`${API_URL}medicine`);
        setMedicinesList(response.data);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();

    if (!spell && affContent && dicContent) {
      spell = nspell(affContent, dicContent);
      console.log("Dictionary successfully loaded");
    }
  }, []);

  useEffect(() => {
    if (hasProcessed.current) return; // Prevent rerun
    if (!ocrText || !spell || !dicContent || medicinesList.length === 0) return;

    setIsLoading(true);
    console.log('Original OCR Text:', ocrText);
    hasProcessed.current = true; 
    
    // Extract words, remove empty values, and filter out short words (noise)
    const ocrWords = ocrText
    .split(/\s+|\n+/)  // Split by spaces or new lines
    .map(word => word.toLowerCase().trim())  
    .filter(word => 
      word.length > 4 &&         
      /^[a-z]+$/i.test(word) &&  
      !/\d/.test(word)           
    );

    console.log("Filtered OCR Words:", ocrWords);

    if (ocrWords.length === 0) {
      console.warn('No valid words extracted from OCR text.');
      setIsLoading(false);
      return;
    }

    const dictionaryWords = dicContent
    .split(/\n+/)  // Split by new lines
    .flatMap(line => line.split(/\s+/))  // Further split each line into words
    .map(word => word.toLowerCase());  // Normalize case

    const correctOCRWords = (ocrWords, dictionaryWords) => {
      return ocrWords.map((word) => {
        let correctedWord = word.toLowerCase(); // Normalize case
        let threshold = getThresholdByLength(word);  // Get dynamic threshold

        if (!spell.correct(correctedWord)) {
            let bestMatch = dictionaryWords.reduce((best, dictWord) => {
                let similarity = getAdvancedSimilarity(correctedWord, dictWord);
                return similarity > best.similarity ? { name: dictWord, similarity } : best;
            }, { name: '', similarity: 0 });

            if (bestMatch.similarity >= threshold) {  // Use dynamic threshold
                console.log(`Checking correction for: ${word}`);
                console.log(`Best match found: ${bestMatch.name} (Similarity: ${bestMatch.similarity})`);
                correctedWord = bestMatch.name;
            }
        }
        return correctedWord;
      });
      
    };
    
    // Use this function in your OCR text processing
    const correctedWords = correctOCRWords(ocrWords, dictionaryWords);
    
    console.log('Corrected OCR Words:', correctedWords);

    // **Improved Matching Logic**
    const matched = medicinesList
    .map((medicine) => {
      const genericName = medicine.genericName.toLowerCase();
      const brandName = medicine.brandName.toLowerCase();
  
      let matchedFrom = null;
  
      const hasExactMatch = correctedWords.some(word => {
        if (genericName.split(/\W+/).includes(word)) {
          matchedFrom = "genericName";
          return true;
        }
        if (brandName.split(/\W+/).includes(word)) {
          matchedFrom = "brandName";
          return true;
        }
        return false;
      });
  
      if (hasExactMatch) {
        return { 
          genericName: medicine.genericName, 
          brandName: medicine.brandName,
          matchedFrom,
          score: 1.0
        };
      }
  
      const highestGenericScore = Math.max(...correctedWords.map(word => getAdvancedSimilarity(word, genericName)));
      const highestBrandScore = Math.max(...correctedWords.map(word => getAdvancedSimilarity(word, brandName)));
  
      const finalScore = Math.max(highestGenericScore, highestBrandScore); 
  
      if (finalScore >= 0.85) {
        matchedFrom = highestGenericScore > highestBrandScore ? "genericName" : "brandName";
        return { 
          genericName: medicine.genericName, 
          brandName: medicine.brandName,
          matchedFrom,
          score: finalScore
        };
      }
  
      return null;
    })
    .filter(m => m !== null)
    .sort((a, b) => b.score - a.score)
    .reduce((acc, curr) => {
      const key = `${curr.genericName.toLowerCase()}|${curr.brandName.toLowerCase()}`;
      if (!acc.has(key)) {
        acc.set(key, curr);
      }
      return acc;
    }, new Map());
  
  // ✅ Convert Map to Array
  const uniqueMatched = Array.from(matched.entries()).map(([_, value]) => value);
  console.log('Matched Medicines:', uniqueMatched);
  setMatchedMedicines(uniqueMatched);
  
  
  //setMatchedMedicines(uniqueMatched);  
  setIsLoading(false);  
    }, [ocrText, spell, medicinesList]);

  const getAdvancedSimilarity = (word1, word2) => {
    const lcsScore = getLCSSimilarity(word1, word2);
    const commonLetters = new Set([...word1].filter(char => word2.includes(char))).size / Math.max(word1.length, word2.length);
    const levenshteinScore = 1 - (levenshtein.get(word1, word2) / Math.max(word1.length, word2.length));
    const jaroWinklerScore = stringSimilarity.compareTwoStrings(word1, word2);
  
    return (lcsScore * 0.45) + (commonLetters * 0.25) + (levenshteinScore * 0.2) + (jaroWinklerScore * 0.1);
  };  

   // LCS-based similarity
   const getLCSSimilarity = (a, b) => {
    const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length] / Math.max(a.length, b.length);
  };


  const handleFindPharmacies = async () => {
    try {
      const response = await axios.get(`${API_URL}customers/customers/${customerId}`);
      const { consentGiven } = response.data;
  
      if (consentGiven) {
        await uploadPrescription();
      } else {
        console.warn("Customer has not given consent. Prescription will not be uploaded.");
      }
  
      // Extract detected generic names, brand names, and matchedFrom
      const detectedMedicines = new Map();
      matchedMedicines.forEach(m => {
        const key = `${m.genericName.toLowerCase()}|${m.brandName.toLowerCase()}`;
        detectedMedicines.set(key, {
          genericName: m.genericName,
          brandName: m.brandName,
          matchedFrom: m.matchedFrom, // Include matchedFrom
        });
      });
  
      const medicinesResponse = await axios.get(`${API_URL}medicine`);
      const allMedicines = medicinesResponse.data;
  
      const expandedMatchedMedicines = allMedicines.filter(medicine =>
        detectedMedicines.has(`${medicine.genericName.toLowerCase()}|${medicine.brandName.toLowerCase()}`)
      ).map(medicine => ({
        genericName: medicine.genericName,
        brandName: medicine.brandName,
        matchedFrom: detectedMedicines.get(`${medicine.genericName.toLowerCase()}|${medicine.brandName.toLowerCase()}`).matchedFrom
      }));
  
      console.log("Final Matched Medicines:", expandedMatchedMedicines);
  
      navigate(`/customer/prescription-results`, {
        state: {
          matchedMedicines: expandedMatchedMedicines
        }
      });
  
    } catch (error) {
      console.error("Error handling pharmacy search:", error);
      Alert.alert("Error", "Failed to fetch customer consent or find pharmacies. Please try again.");
    }
  };

  const uploadPrescription = async () => {
    if (!customerId) {
      console.error("Customer ID is missing.");
      Alert.alert("Error", "Customer ID is required to upload the prescription.");
      return;
    }
  
    try {
      const validMedicines = matchedMedicines
      .filter(m => m?.genericName)
      .map(m => ({
        genericName: m.genericName,
        brandName: m.brandName,
        matchedFrom: m.matchedFrom,
      }));
  
      const response = await axios.post(`${API_URL}customers/upload-prescription`, {
        customerId,
        originalImageUrl,
        processedImageUrl,
        ocrText,
        matchedMedicines: validMedicines, 
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      console.log("Prescription saved:", response.data);
    } catch (error) {
      console.error("Error uploading prescription:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 pt-6">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center md:items-start p-6 space-y-6 md:space-y-0 md:space-x-6">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          {processedImageUrl ? (
            <img src={processedImageUrl} alt="Prescription" className="w-full max-w-md border rounded-lg shadow-lg" />
          ) : (
            <p className="text-gray-600">No image to display</p>
          )}
        </div>

        {/* Right Side: Detected Medicines */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-2">Matched Medicines</h2>
          <div className="p-4 bg-white shadow-lg rounded-lg">
            {isLoading ? (
              <p className="text-blue-600">Loading...</p>
            ) : matchedMedicines.length > 0 ? (
              [...new Set(matchedMedicines.map((med) =>
                med.matchedFrom === "brandName" ? med.brandName : med.genericName
              ))].map((name, index) => (
                <p key={index} className="text-gray-800 font-medium">{name}</p>
              ))
            ) : (
              <p className="text-red-500">No detected medicines</p>
            )}
          </div>

          {/* Find Pharmacies Button */}
          {matchedMedicines.length > 0 && (
            <button
            onClick={handleFindPharmacies} 
              disabled={isLoading}
              className={`mt-4 w-full px-4 py-2 text-white font-semibold rounded-md ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Processing..." : "Find Pharmacies"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionScan;
