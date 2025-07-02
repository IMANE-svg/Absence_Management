import React, { useEffect, useState } from 'react';
import api from '../../axiosConfig';

const PendingEnseignant = () => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchPendingEnseignants();
  }, []);

  const fetchPendingEnseignants = async () => {
    try {
      const res = await api.get('pending-enseignants/');
      setPending(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement :", err.response?.data || err.message);
    }
  };

  const handleValidate = async (id) => {
    try {
      await api.post(`pending-enseignants/${id}/validate/`);
      fetchPendingEnseignants();
    } catch (err) {
      console.error("Erreur validation :", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`pending-enseignants/${id}/delete/`);
      fetchPendingEnseignants();
    } catch (err) {
      console.error("Erreur suppression :", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Enseignants en attente</h2>
      
      {pending.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-6 rounded shadow">
          Aucun enseignant en attente.
        </div>
      ) : (
        <div className="grid gap-4">
          {pending.map((ens) => (
            <div
              key={ens.id}
              className="bg-white shadow-md rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-100"
            >
              <div className="text-gray-700 space-y-1">
                <p><span className="font-semibold">Nom:</span> {ens.nom} {ens.prenom}</p>
                <p><span className="font-semibold">Email:</span> {ens.email}</p>
              </div>
              <div className="mt-4 md:mt-0 space-x-2">
                <button
                  onClick={() => handleValidate(ens.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleDelete(ens.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingEnseignant;
