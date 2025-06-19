import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { IoSearchOutline } from 'react-icons/io5';
import { API_URL } from '../../../env';
import PulseSpinner from '../../../assets/common/spinner';

const FilterMedicinesByCategoryPerPharmacy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [searchText, setSearchText] = useState(""); // Search state
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get('category');
  const pharmacyId = queryParams.get('pharmacyId');

  useEffect(() => {
    const fetchMedicinesByCategory = async () => {
      try {
        console.log('Fetching medicines for:', { category, pharmacyId });

        // Fetch pharmacy stock
        const response = await axios.get(`${API_URL}medicine/features/${pharmacyId}`);
        console.log('API Response:', response.data);

        // Filter medicines by category
        const filtered = response.data.filter(med =>
          med.medicine?.category?.some(cat => cat.name === category)
        );

        console.log('Filtered Medicines:', filtered);
        setMedicines(filtered);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicinesByCategory();
  }, [category, pharmacyId]);

  // Filter medicines based on search input
  const filteredMedicines = medicines.filter(item => {
    const medDetails = item.medicine || {};
    const brandName = medDetails.brandName?.toLowerCase() || "";
    const genericName = medDetails.genericName?.toLowerCase() || "";
    return brandName.includes(searchText.toLowerCase()) || genericName.includes(searchText.toLowerCase());
  });

  if (loading) {
    return <PulseSpinner />;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-gray-20 p-4">
        <h1 className="text-primary-default text-2xl ml-4">{category} Medicines</h1>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white p-4 mt-4 mx-4 rounded-lg border border-gray-300">
        <IoSearchOutline size={20} className="text-gray-500 mr-3" />
        <input
          type="text"
          className="w-full p-2 rounded-lg text-lg"
          placeholder="Search by brand or generic name"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyUp={e => setSearchText(e.target.value)}
        />
      </div>

      {/* Medicines List */}
      <div className="p-4">
        {filteredMedicines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.map((item, index) => {
              const medDetails = item.medicine || {};
              const categoryNames = medDetails.category ? medDetails.category.map(cat => cat.name).join(' / ') : 'No Category';
              const totalStock = item.expirationPerStock?.reduce((sum, stockItem) => sum + stockItem.stock, 0) || 0;

              return (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/customer/viewpharmacymedicine?id=${item._id}&pharmacyId=${pharmacyId}`)}
                >
                  <h2 className="font-semibold text-lg">{medDetails.brandName || 'Unknown'}</h2>
                  <p className="text-gray-700">Generic: {medDetails.genericName || 'Unknown'}</p>
                  <p className="text-gray-700">Dosage: {medDetails.dosageStrength || 'N/A'}</p>
                  <p className="text-gray-700">Form: {medDetails.dosageForm || 'N/A'}</p>
                  <p className="text-gray-700">Classification: {medDetails.classification || 'N/A'}</p>
                  <p className="text-gray-700">Category: {categoryNames}</p>
                  <p className="text-gray-700">Stock: {totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}</p>
                   {/* ✅ Price Display */}
                    <p className="text-gray-700">
                      Price: {item.price != null && item.price !== ''
                        ? `₱${parseFloat(item.price).toFixed(2)}`
                        : 'Price not indicated'}
                    </p>
                  <p className="text-sm text-red-600 mt-2">
                    (Last updated on {item.timeStamps ? new Date(item.timeStamps).toLocaleString() : 'No Date Available'})
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-xl">No medicines found.</p>
        )}
      </div>
    </div>
  );
};

export default FilterMedicinesByCategoryPerPharmacy;
