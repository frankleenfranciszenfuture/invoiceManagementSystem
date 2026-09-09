import api from "../api";

export const fetchCustomers = async (params) => {
  const response = await api.get("/customers", { params });
  return response.data.data; // unwrap axios .data, then envelope .data → { content, page, size, totalElements, totalPages, first, last }
};

export const createCustomer = async (data) => {
  const response = await api.post("/customers", data);
  return response.data.data; // unwrap to the actual customer object
};

export const fetchCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data.data;
};

export const updateCustomer = async (id, data) => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data.data;
};

export const updateCustomerAddress = async (customerId, billingAddress) => {
  const response = await api.put(
    `/customers/${customerId}/address`,
    billingAddress,
  );
  return response.data.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data; // delete responses may just be { success, message } — no nested data
};

// export const customerApi = {
//   fetchCustomers: (params) =>
//     api.get("/customers", { params }).then(extractData),

//   fetchCustomerById: (id) => api.get(`/customers/${id}`).then(extractData),

//   createCustomer: (data) => api.post("/customers", data).then(extractData),

//   updateCustomer: (id, data) =>
//     api.put(`/customers/${id}`, data).then(extractData),

//   deleteCustomer: (id) => api.delete(`/customers/${id}`).then(extractData),

//   restoreCustomer: (id) =>
//     api.patch(`/customers/${id}/restore`).then(extractData),

//   fetchCustomerDropdown: () => api.get("/customers/dropdown").then(extractData),

//   fetchCustomerCount: () => api.get("/customers/count").then(extractData),

//   fetchCustomerDashboard: () =>
//     api.get("/customers/dashboard").then(extractData),

//   checkCustomerEmail: (email) =>
//     api
//       .get("/customers/check-email", {
//         params: { email },
//       })
//       .then(extractData),
// };

// export const updateCustomerAddress = (customerId, billingAddress) =>
//   api.put(`/customers/${customerId}/address`, billingAddress).then(extractData);
