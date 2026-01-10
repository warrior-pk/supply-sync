import { mapMessage } from "@/constants/message-mapper";
import apiService from "./api.service";
import { ORDER_ACTIONS_ENDPOINT } from "@/constants/api-endpoints";
import { getCurrentUTC } from "@/lib/date-time";

const orderActionService = {
  /**
   * Get all order actions
   * @returns {Promise<{success: boolean, data: orderAction[], message: string}>}
   */
  getAll: async () => {
    const response = await apiService.sendRequest(ORDER_ACTIONS_ENDPOINT.GET);
    console.log("Order Action Service Get All Response:", response);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: mapMessage("FETCH_SUCCESS"),
      };
    }

    return {
      success: false,
      data: null,
      message: mapMessage("SERVER_ERROR"),
    };
  },

  /**
   * Get order action by ID
   * @param {string} id
   * @returns {Promise<{success: boolean, data: orderAction, message: string}>}
   */
  getById: async (id) => {
    const response = await apiService.sendRequest(ORDER_ACTIONS_ENDPOINT.GET_BY_ID(id));
    console.log("Order Action Service Get By ID Response:", response);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: mapMessage("FETCH_SUCCESS"),
      };
    }

    return {
      success: false,
      data: null,
      message: mapMessage("SERVER_ERROR"),
    };
  },

  /**
   * Get order actions by purchase order ID
   * @param {string} purchaseOrderId
   * @returns {Promise<{success: boolean, data: orderAction[], message: string}>}
   */
  getByPurchaseOrderId: async (purchaseOrderId) => {
    const response = await apiService.sendRequest(ORDER_ACTIONS_ENDPOINT.GET_BY_PURCHASE_ORDER_ID(purchaseOrderId));
    console.log("Order Action Service Get By Purchase Order ID Response:", response);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: mapMessage("FETCH_SUCCESS"),
      };
    }

    return {
      success: false,
      data: null,
      message: mapMessage("SERVER_ERROR"),
    };
  },

  /**
   * Get order actions by vendor ID (for vendor dashboard)
   * @param {string} vendorId
   * @returns {Promise<{success: boolean, data: orderAction[], message: string}>}
   */
  getByVendorId: async (vendorId) => {
    const response = await apiService.sendRequest(ORDER_ACTIONS_ENDPOINT.GET_BY_VENDOR_ID(vendorId));
    console.log("Order Action Service Get By Vendor ID Response:", response);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: mapMessage("FETCH_SUCCESS"),
      };
    }

    return {
      success: false,
      data: null,
      message: mapMessage("SERVER_ERROR"),
    };
  },

  /**
   * Get pending order actions (for vendor to approve/reject)
   * @returns {Promise<{success: boolean, data: orderAction[], message: string}>}
   */
  getPending: async () => {
    const response = await apiService.sendRequest(ORDER_ACTIONS_ENDPOINT.GET_PENDING);
    console.log("Order Action Service Get Pending Response:", response);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: mapMessage("FETCH_SUCCESS"),
      };
    }

    return {
      success: false,
      data: null,
      message: mapMessage("SERVER_ERROR"),
    };
  },

  /**
   * Create order action request
   * @param {object} data - Order action data
   * @param {string} data.purchaseOrderId - Purchase order ID
   * @param {string} data.vendorId - Vendor ID (for filtering)
   * @param {string} data.actionType - UPDATE, CANCEL, or RETURN
   * @param {string} data.message - Reason/message for the action
   * @returns {Promise<{success: boolean, data: orderAction, message: string}>}
   */
  create: async (data) => {
    const payload = {
      ...data,
      status: "PENDING",
      createdAt: getCurrentUTC(),
      resolvedAt: null,
      resolvedBy: null,
      vendorResponse: null,
    };

    const response = await apiService.sendRequest(ORDER_ACTIONS_ENDPOINT.CREATE, "POST", payload);
    console.log("Order Action Service Create Response:", response);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: mapMessage("CREATE_SUCCESS"),
      };
    }

    return {
      success: false,
      data: null,
      message: mapMessage("SERVER_ERROR"),
    };
  },

  /**
   * Update order action (for vendor to approve/reject)
   * @param {string} id
   * @param {object} data
   * @param {string} data.status - APPROVED or REJECTED
   * @param {string} data.vendorResponse - Vendor's response message
   * @returns {Promise<{success: boolean, data: orderAction, message: string}>}
   */
  update: async (id, data) => {
    const payload = {
      ...data,
      resolvedAt: getCurrentUTC(),
    };

    const response = await apiService.sendRequest(ORDER_ACTIONS_ENDPOINT.UPDATE(id), "PATCH", payload);
    console.log("Order Action Service Update Response:", response);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: mapMessage("UPDATE_SUCCESS"),
      };
    }

    return {
      success: false,
      data: null,
      message: mapMessage("SERVER_ERROR"),
    };
  },

  /**
   * Delete order action
   * @param {string} id
   * @returns {Promise<{success: boolean, message: string}>}
   */
  delete: async (id) => {
    const response = await apiService.sendRequest(ORDER_ACTIONS_ENDPOINT.DELETE(id), "DELETE");
    console.log("Order Action Service Delete Response:", response);

    if (response.success) {
      return {
        success: true,
        message: mapMessage("DELETE_SUCCESS"),
      };
    }

    return {
      success: false,
      message: mapMessage("SERVER_ERROR"),
    };
  },
};

export default orderActionService;
