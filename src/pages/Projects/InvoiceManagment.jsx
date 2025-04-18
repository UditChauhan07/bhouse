import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaTrashAlt, FaEdit } from 'react-icons/fa';
import { MdSave } from 'react-icons/md';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Loader from '../../components/Loader';
import { url, url2 } from '../../lib/api';
import '../../styles/Projects/InvoiceManagement.css'; 

const InvoiceManagement = ({ projectId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showUpdateInvoiceModal, setShowUpdateInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    totalAmount: '',
    advancePaid: null,
    status: 'Pending',
    invoiceFile: null,
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [projectDetails, setProjectDetails] = useState({ totalValue: 0, advancePayment: 0 });


  // Fetch invoices for the project
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const projectRes = await axios.get(`${url}/projects/${projectId}`);
        setProjectDetails({
          totalValue: Number(projectRes.data.totalValue || 0),
          advancePayment: Number(projectRes.data.advancePayment || 0)
        });
  
        const response = await axios.get(`${url}/projects/${projectId}/invoice`);
        const invoicesData = Array.isArray(response.data) ? response.data : [response.data];
        setInvoices(invoicesData); 
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invoices or project:', err);
        setLoading(false);
      }
    };
  
    fetchInvoices();
  }, [projectId]);
  const getPaidAmount = () => {
    const paidFromInvoices = invoices.reduce((sum, invoice) => {
      if (invoice.status === 'Paid') {
        return sum + Number(invoice.totalAmount || 0);
      } else {
        return sum + Number(invoice.advancePaid || 0);
      }
    }, 0);
  
    return Number(projectDetails.advancePayment || 0) + paidFromInvoices;
  };
  
  const getBalance = () => {
    const invoiceTotal = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);
    const totalProjectCost = Math.max(Number(projectDetails.totalValue || 0), invoiceTotal);
    const paid = getPaidAmount();
    return totalProjectCost - paid;
  };
  

  // Open modal for adding a new invoice
  const handleAddInvoice = () => {
    setShowAddInvoiceModal(true);
    setInvoiceData({
      totalAmount: '',
      advancePaid: 0,
      status: 'Pending',
      invoiceFile: null,
    });
  };

  // Open modal for editing an invoice
  const handleOpenUpdateInvoiceModal = (invoice) => {
    setInvoiceData({
      totalAmount: invoice.totalAmount,
      advancePaid: invoice.advancePaid,
      status: invoice.status,
      invoiceFile: null,
    });
    setSelectedInvoice(invoice);
    setShowUpdateInvoiceModal(true);
  };

  // Handle input changes in the invoice modal
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle file change (for invoice file upload)
  const handleFileChange = (e) => {
    setInvoiceData((prevState) => ({
      ...prevState,
      invoiceFile: e.target.files[0],
    }));
  };

  // Save the new invoice
  const handleSaveNewInvoice = async () => {
    try {
      const projectLimit = projectDetails.totalValue - projectDetails.advancePayment;
      const currentInvoiceTotal = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);
      const newInvoiceAmount = Number(invoiceData.totalAmount || 0);
      const updatedTotal = currentInvoiceTotal + newInvoiceAmount;
  
      if (updatedTotal > projectLimit) {
        Swal.fire({
          icon: 'warning',
          title: 'Invoice limit exceeded!',
          text: 'Your invoice total value has exceeded the allowed limit. Please update the project value to proceed.'
        });
        return;
      }
  
      const formData = new FormData();
      formData.append('totalAmount', invoiceData.totalAmount);
      formData.append('advancePaid', invoiceData.advancePaid);
      formData.append('status', invoiceData.status);
      if (invoiceData.invoiceFile) {
        formData.append('invoice', invoiceData.invoiceFile);
      }
  
      const response = await axios.post(`${url}/projects/${projectId}/invoice`, formData);
      toast.success('Invoice added!');
      setInvoices((prevInvoices) => [...prevInvoices, response.data]);
      setShowAddInvoiceModal(false);
    } catch (err) {
      console.error('Error adding invoice:', err);
      toast.error('Error adding invoice.');
    }
  };
  

  // Save the updated invoice
  const handleSaveUpdatedInvoice = async () => {
    try {
      const formData = new FormData();
      formData.append('totalAmount', invoiceData.totalAmount);
      formData.append('advancePaid', invoiceData.advancePaid);
      formData.append('status', invoiceData.status);
      if (invoiceData.invoiceFile) {
        formData.append('invoice', invoiceData.invoiceFile);
      }

      const response = await axios.put(`${url}/projects/${projectId}/invoice/${selectedInvoice.id}`, formData);
      toast.success('Invoice updated!');
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) => (invoice.id === selectedInvoice.id ? response.data : invoice))
      ); // Update the existing invoice in the list
      setShowUpdateInvoiceModal(false); // Close the modal
    } catch (err) {
      console.error('Error updating invoice:', err);
      toast.error('Error updating invoice.');
    }
  };

  // Handle deleting an invoice
  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await axios.delete(`${url}/projects/${projectId}/invoice/${invoiceId}`);
      toast.success('Invoice deleted!');
      setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== invoiceId)); // Remove the invoice from the list
    } catch (err) {
      console.error('Error deleting invoice:', err);
      toast.error('Error deleting invoice.');
    }
  };

  // Open invoice file
  const handleOpenFile = (filePath) => {
    window.open(`${url2}/${filePath}`, '_blank');
  };

  if (loading) return <Loader />;

  return (
    <div className="invoice-management-container">
        <div className="project-finance-summary">
  <div className="summary-card">
    <div className="summary-item">
      <p className="label">Total Cost</p>
      <p className="value">${(projectDetails.totalValue || 0).toLocaleString()}</p>
    </div>
    <div className="summary-item">
      <p className="label">Paid Amount</p>
      <p className="value">${getPaidAmount().toLocaleString()}</p>
    </div>
    <div className="summary-item">
      <p className="label">{getBalance() >= 0 ? 'Balance Due' : 'Overpaid'}</p>
      <p className="value">${Math.abs(getBalance()).toLocaleString()}</p>
    </div>
  </div>
</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="ledbutton" onClick={handleAddInvoice}>
          + Add Invoice
        </button>
      </div>
    


      {invoices.length === 0 ? (
        <p>No invoices available.</p>
      ) : (
        <table className="invoice-management-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Total Amount</th>
              <th>Advance Paid</th>
              <th>Status</th>
              <th>Created At</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={invoice.id}>
                <td>{index + 1}</td>
                <td>{invoice.totalAmount}</td>
                <td>{invoice.advancePaid}</td>
                <td>{invoice.status}</td>
                <td>{new Date(invoice.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleOpenFile(invoice.invoiceFilePath)}>
                    {invoice.invoiceFilePath.split('/').pop()}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleOpenUpdateInvoiceModal(invoice)}>
                    <FaEdit />
                  </button>
                  <button
                    onClick={async () => {
                      const response = await fetch(`${url2}/${invoice.invoiceFilePath}`);
                      const blob = await response.blob();
                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = downloadUrl;
                      link.download = invoice.invoiceFilePath.split('/').pop();
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    }}
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Are you sure?',
                        text: 'Do you want to remove this invoice?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, remove it!',
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                          handleDeleteInvoice(invoice.id);
                        }
                      });
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Invoice</h3>

            <label>Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={invoiceData.totalAmount}
              onChange={handleInvoiceChange}
              maxLength={6}
              />

            <label>Status</label>
            <select
              name="status"
              value={invoiceData.status}
              onChange={handleInvoiceChange}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partly Paid">Partly Paid</option>
            </select>

            {invoiceData.status === 'Partly Paid' && (
              <div>
                <label>Paid Ammount</label>
                <input
                  type="number"
                  name="advancePaid"
                  value={invoiceData.advancePaid}
                  onChange={handleInvoiceChange}
                  maxLength={6}
                />
              </div>
            )}

            <label>Invoice File</label>
            <input type="file" onChange={handleFileChange} />
            <div className='invoice-btn'>

            <button onClick={handleSaveNewInvoice}>
              <MdSave />
              Save
            </button>

            <button onClick={() => setShowAddInvoiceModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Invoice Modal */}
      {showUpdateInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Invoice</h3>

            <label>Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={invoiceData.totalAmount}
              onChange={handleInvoiceChange}
              maxLength={6}
            />


            <label>Status</label>
            <select
              name="status"
              value={invoiceData.status}
              onChange={handleInvoiceChange}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partly Paid">Partly Paid</option>
            </select>

            {invoiceData.status === 'Partly Paid' && (
              <div>
                <label>Advance Payment</label>
                <input
                  type="number"
                  name="advancePaid"
                  value={invoiceData.advancePaid}
                  onChange={handleInvoiceChange}
                  maxLength={6}
                />
              </div>
            )}

            <label>Invoice File</label>
            <input type="file" onChange={handleFileChange} />
            <div className='invoice-btn'>
            <button onClick={handleSaveUpdatedInvoice}>
              <MdSave />
              Save
            </button>
            <button onClick={() => setShowUpdateInvoiceModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
