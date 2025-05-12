import { Customer, Transaction } from './types';

interface TransactionModalProps {
  customer: Customer;
  transactions: Transaction[];
  onClose: () => void;
}

export default function TransactionModal({
  customer,
  transactions,
  onClose,
}: TransactionModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        <h3 className="font-bold text-lg mb-4">
          Transactions for {customer.nama}
        </h3>

        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No transactions found for this customer.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Car</th>
                  <th>Payment Method</th>
                  <th>Total Amount</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.tanggal_jual)}</td>
                    <td>
                      {transaction.mobil.merk} {transaction.mobil.tipe}{' '}
                      {transaction.mobil.model}
                      {transaction.mobil.series && ` ${transaction.mobil.series}`}
                    </td>
                    <td>{transaction.metode_pembayaran}</td>
                    <td>{formatCurrency(transaction.total_harga)}</td>
                    <td>
                      <div className="collapse collapse-arrow bg-base-200">
                        <input type="checkbox" />
                        <div className="collapse-title text-sm font-medium">
                          View Details
                        </div>
                        <div className="collapse-content">
                          <div className="space-y-2">
                            <p>
                              <span className="font-semibold">Buyer:</span>{' '}
                              {transaction.nama_pembeli}
                            </p>
                            <p>
                              <span className="font-semibold">Address:</span>{' '}
                              {transaction.alamat_pembeli}
                            </p>
                            <p>
                              <span className="font-semibold">Phone:</span>{' '}
                              {transaction.nomor_hp_pembeli}
                            </p>
                            {transaction.metode_pembayaran === 'Kredit' && (
                              <>
                                <p>
                                  <span className="font-semibold">
                                    Leasing:
                                  </span>{' '}
                                  {transaction.nama_leasing}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Down Payment:
                                  </span>{' '}
                                  {formatCurrency(transaction.uang_muka || 0)}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Credit Amount:
                                  </span>{' '}
                                  {formatCurrency(transaction.harga_kredit || 0)}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Leasing Amount:
                                  </span>{' '}
                                  {formatCurrency(
                                    transaction.dana_dari_leasing || 0
                                  )}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 