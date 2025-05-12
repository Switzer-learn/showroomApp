"use client";

import { useState, useEffect } from 'react';
import { createClient } from "../../utils/supabase/client"
import TransactionModal from './TransactionModal';
import { Customer, Transaction } from './types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      console.log(data);
      console.log(error);
      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransactions = async (customer: Customer) => {
    try {
      const { data, error } = await supabase
        .from('penjualan')
        .select(`
          *,
          mobil: mobil_id (
            merk,
            tipe,
            model,
            series
          )
        `)
        .eq('customer_id', customer.id)
        .order('tanggal_jual', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
      setSelectedCustomer(customer);
      setShowModal(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
      
      <div className="overflow-x-auto text-white rounded-lg shadow">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.nama}</td>
                <td>{customer.no_hp}</td>
                <td>{customer.alamat || '-'}</td>
                <td>{customer.jenis_kelamin || '-'}</td>
                <td>
                  <button
                    onClick={() => handleViewTransactions(customer)}
                    className="btn btn-primary btn-sm"
                  >
                    View Transactions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedCustomer && (
        <TransactionModal
          customer={selectedCustomer}
          transactions={transactions}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
} 