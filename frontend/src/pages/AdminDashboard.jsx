import React, { useState, useEffect } from 'react';
import axios from 'axios'; // أو استخدم fetch

const AdminDashboard = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب البيانات من Django عند فتح الصفحة
useEffect(() => {
  const fetchSites = async () => {
    try {
      // نأخذ التوكن من الـ localStorage
      const token = localStorage.getItem('access_token'); 

      if (!token) {
        console.error("No token found, please login again.");
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/admin/sites/', {
        headers: { 
          // تأكد من المسافة بعد كلمة Bearer
          'Authorization': `Bearer ${token}` 
        }
      });
      
      setSites(response.data);
    } catch (error) {
      console.error("Error fetching sites:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  fetchSites();
}, []);

  // 2. دالة تغيير الحالة (Activate / Deactivate)
  const handleToggleStatus = async (siteId) => {
  try {
    // 1. جلب التوكن الصحيح (تأكد من الاسم access_token)
    const token = localStorage.getItem('access_token'); 

    if (!token) {
      alert("Session expired, please login again.");
      return;
    }

    // 2. إرسال الطلب مع الـ Headers الصحيحة
    const response = await axios.post(
      `http://127.0.0.1:8000/api/admin/sites/toggle/${siteId}/`, 
      {}, // البودي فارغ
      {
        headers: { 
          'Authorization': `Bearer ${token}` // تأكد من كلمة Bearer
        }
      }
    );
    
    // 3. تحديث الحالة في الواجهة فوراً
    if (response.data.status === 'success') {
      setSites(prev => prev.map(s => 
        s.id === siteId ? { ...s, is_active: response.data.is_active } : s
      ));
    }
  } catch (error) {
    console.error("Error update status:", error.response?.data || error.message);
    alert("Failed to update status: " + (error.response?.status === 401 ? "Unauthorized" : "Server Error"));
  }
};

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navbar و Header كما في صورك */}
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-slate-800">Admin <span className="text-indigo-600">Dashboard</span></h1>
           <span className="bg-white px-4 py-1 rounded-full shadow-sm border border-slate-200 text-sm">
             Total Sites: {sites.length}
           </span>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1e293b] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Site Name</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Created At</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400">No websites added yet</td></tr>
              ) : (
                sites.map(site => (
                  <tr key={site.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-700">{site.name}</td>
                    <td className="p-4 text-slate-500">@{site.user_username}</td>
                    <td className="p-4 text-slate-400 text-sm">{site.created_at}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${site.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {site.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(site.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${site.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                      >
                        {site.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;